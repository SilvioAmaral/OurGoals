import { Router, Response } from 'express';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { Category } from '../models/Category';
import { Item } from '../models/Item';
import { User } from '../models/User';
import { Couple } from '../models/Couple';
import { BLUEPRINT } from '../data/blueprint';
import { env } from '../config/env';
import mongoose from 'mongoose';

const router = Router();

// POST /setup/seed
// Called once after the user completes the Setup screen.
// Creates the couple record (self-coupled, no partner yet) if missing,
// then seeds the blueprint categories + items.
router.post('/seed', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  const user = req.user!;

  // Idempotent: if couple already has categories, skip
  let coupleId = user.coupleId as mongoose.Types.ObjectId | undefined;

  if (!coupleId) {
    // Create a solo couple record so the user can use the app before a partner joins
    const expiry = new Date(Date.now() + env.inviteExpiryHours * 3600 * 1000);
    const couple = await Couple.create({
      initiatorId: user._id,
      inviteContact: user.email,
      inviteTokenExpiry: expiry,
    });
    coupleId = couple._id as mongoose.Types.ObjectId;
    await User.findByIdAndUpdate(user._id, { coupleId });
  }

  const existing = await Category.countDocuments({ coupleId });
  if (existing > 0) {
    res.json({ message: 'Already seeded', coupleId });
    return;
  }

  for (let i = 0; i < BLUEPRINT.length; i++) {
    const bp = BLUEPRINT[i];
    const category = await Category.create({
      coupleId,
      name: bp.name,
      colorHue: bp.colorHue,
      order: i,
    });
    for (let j = 0; j < bp.items.length; j++) {
      await Item.create({
        coupleId,
        categoryId: category._id,
        name: bp.items[j],
        order: j,
      });
    }
  }

  res.status(201).json({ message: 'Seeded', coupleId, categories: BLUEPRINT.length });
});

export default router;
