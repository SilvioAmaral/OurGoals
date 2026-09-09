import { Router, Request, Response } from 'express';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { Couple } from '../models/Couple';
import { User } from '../models/User';
import { env } from '../config/env';
import { signToken } from '../services/tokenService';

const router = Router();

// SMTP isn't configured yet — mock the invite email and auto-provision the
// partner's account with this password so the invite/accept flow can be
// exercised end to end without real email delivery.
const MOCK_PARTNER_PASSWORD = '123pipoca';

// POST /partner/invite  — send partner invite by email
router.post('/invite', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  const { contact, partnerName } = req.body;
  if (!contact) {
    res.status(400).json({ message: 'contact (email or phone) is required' });
    return;
  }
  if (req.user!.coupleId) {
    res.status(409).json({ message: 'You already have a partner connection' });
    return;
  }

  const expiry = new Date(Date.now() + env.inviteExpiryHours * 3600 * 1000);
  const couple = await Couple.create({
    initiatorId: req.user!._id,
    inviteContact: contact,
    inviteTokenExpiry: expiry,
  });

  await User.findByIdAndUpdate(req.user!._id, { coupleId: couple._id });
  req.user!.coupleId = couple._id as any;

  // Only "send" if contact looks like an email
  if (contact.includes('@')) {
    const email = contact.toLowerCase().trim();
    const originalToken = couple.inviteToken;
    let partner = await User.findOne({ email });
    const isSelf = !!partner && (partner._id as any).equals(req.user!._id as any);
    if (!partner) {
      partner = await User.create({ name: partnerName || email, email, password: MOCK_PARTNER_PASSWORD });
    }
    // Auto-link whenever this account (new or pre-existing) isn't already
    // paired with someone — there's no real person to click an accept link in
    // this mock flow, so wire the couple connection immediately instead.
    if (!isSelf && !partner.coupleId) {
      couple.partnerId = partner._id as any;
      couple.status = 'accepted';
      couple.inviteToken = '';
      await couple.save();
      await User.findByIdAndUpdate(partner._id, { coupleId: couple._id });
    }
    console.log(`[MOCK EMAIL] Invite for ${email} — token=${originalToken} coupleId=${couple._id}`);
  }

  res.status(201).json({
    message: `Invite sent to ${contact}`,
    status: couple.status,
    inviteToken: couple.inviteToken,
  });
});

// GET /partner/accept/:token  — called when partner clicks the link; returns a deep-link token
// In a real app this redirects to the mobile app via a universal link / custom scheme
router.get('/accept/:token', async (req: Request, res: Response): Promise<void> => {
  const couple = await Couple.findOne({ inviteToken: req.params.token });
  if (!couple || couple.status === 'accepted') {
    res.status(404).json({ message: 'Invite not found or already used' });
    return;
  }
  if (couple.inviteTokenExpiry < new Date()) {
    res.status(410).json({ message: 'Invite has expired' });
    return;
  }
  // Return the token so the mobile app can redirect to register/login and then call POST /partner/accept
  res.json({ inviteToken: req.params.token, inviteContact: couple.inviteContact });
});

// POST /partner/accept/:token  — authenticated partner accepts the invite
router.post('/accept/:token', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  const couple = await Couple.findOne({ inviteToken: req.params.token });
  if (!couple || couple.status === 'accepted') {
    res.status(404).json({ message: 'Invite not found or already used' });
    return;
  }
  if (couple.inviteTokenExpiry < new Date()) {
    res.status(410).json({ message: 'Invite has expired' });
    return;
  }
  if (couple.initiatorId.equals(req.user!._id as any)) {
    res.status(400).json({ message: 'You cannot accept your own invite' });
    return;
  }
  if (req.user!.coupleId) {
    res.status(409).json({ message: 'You already have a partner connection' });
    return;
  }

  couple.partnerId = req.user!._id as any;
  couple.status = 'accepted';
  couple.inviteToken = '';
  await couple.save();

  await User.findByIdAndUpdate(req.user!._id, { coupleId: couple._id });
  const initiator = await User.findById(couple.initiatorId);

  res.json({
    message: 'Partner connection established',
    partner: { name: initiator?.name, email: initiator?.email },
  });
});

// GET /partner  — get current partner info
router.get('/', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.user!.coupleId) {
    res.json({ partner: null, status: 'none' });
    return;
  }
  const couple = await Couple.findById(req.user!.coupleId);
  if (!couple) {
    res.json({ partner: null, status: 'none' });
    return;
  }
  const partnerId = couple.initiatorId.equals(req.user!._id as any) ? couple.partnerId : couple.initiatorId;
  const partner = partnerId ? await User.findById(partnerId).select('name email') : null;

  res.json({
    status: couple.status,
    inviteContact: couple.status === 'pending' ? couple.inviteContact : undefined,
    partner: partner ? { name: partner.name, email: partner.email } : null,
  });
});

export default router;
