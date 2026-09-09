import { Router, Response } from 'express';
import { requireAuth, requireCouple, AuthRequest } from '../middleware/auth';
import { Couple } from '../models/Couple';
import { computeMatch } from '../services/matchService';

const router = Router();

// GET /match
router.get('/', requireAuth, requireCouple, async (req: AuthRequest, res: Response): Promise<void> => {
  const coupleId = req.user!.coupleId!;
  const couple = await Couple.findById(coupleId);
  if (!couple || couple.status !== 'accepted') {
    res.status(403).json({ message: 'Partner has not accepted the invite yet' });
    return;
  }
  const partnerId = couple.initiatorId.equals(req.user!._id as any) ? couple.partnerId : couple.initiatorId;
  if (!partnerId) {
    res.status(403).json({ message: 'Partner not found' });
    return;
  }
  const result = await computeMatch(coupleId, req.user!._id as any, partnerId as any);
  res.json(result);
});

export default router;
