import { Router, Response } from 'express';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { User } from '../models/User';
import { Couple } from '../models/Couple';
import { Category } from '../models/Category';
import { Item } from '../models/Item';
import { Rating } from '../models/Rating';

const router = Router();

// GET /users/me
router.get('/me', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  res.json({ user: req.user });
});

// PUT /users/me
router.put('/me', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  const { name, theme, sexualityEnabled, partnerNickname } = req.body;
  const update: Record<string, unknown> = {};
  if (name !== undefined) update.name = name;
  if (theme !== undefined) update.theme = theme;
  if (sexualityEnabled !== undefined) update.sexualityEnabled = sexualityEnabled;
  if (partnerNickname !== undefined) update.partnerNickname = partnerNickname;

  const user = await User.findByIdAndUpdate(req.user!._id, update, { new: true, runValidators: true });
  res.json({ user });
});

// DELETE /users/me  — deletes the account and all associated data
router.delete('/me', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user!._id;
  const coupleId = req.user!.coupleId;

  if (coupleId) {
    // Remove partner's coupleId reference
    const couple = await Couple.findById(coupleId);
    if (couple) {
      const partnerId = couple.initiatorId.equals(userId as any) ? couple.partnerId : couple.initiatorId;
      if (partnerId) await User.findByIdAndUpdate(partnerId, { $unset: { coupleId: 1 } });
    }
    await Promise.all([
      Rating.deleteMany({ coupleId }),
      Item.deleteMany({ coupleId }),
      Category.deleteMany({ coupleId }),
      Couple.findByIdAndDelete(coupleId),
    ]);
  }

  await User.findByIdAndDelete(userId);
  res.status(204).send();
});

export default router;
