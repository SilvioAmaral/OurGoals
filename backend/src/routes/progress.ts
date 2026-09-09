import { Router, Response } from 'express';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { Category } from '../models/Category';
import { Item } from '../models/Item';
import { Rating } from '../models/Rating';

const router = Router();

// GET /progress  — overall + per-category progress for the current user
router.get('/', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  const coupleId = req.user!.coupleId;
  if (!coupleId) {
    res.json({ overall: { rated: 0, total: 0, percent: 0 }, categories: [] });
    return;
  }
  const categories = await Category.find({ coupleId }).sort('order');
  const items = await Item.find({ coupleId });
  const myRatings = await Rating.find({ coupleId, userId: req.user!._id });

  const ratedSet = new Set(myRatings.map(r => r.itemId.toString()));

  let totalRated = 0;
  const catProgress = categories.map(cat => {
    const catItems = items.filter(i => i.categoryId.toString() === cat._id.toString());
    const rated = catItems.filter(i => ratedSet.has(i._id.toString())).length;
    totalRated += rated;
    return {
      categoryId: cat._id,
      name: cat.name,
      colorHue: cat.colorHue,
      rated,
      total: catItems.length,
      percent: catItems.length > 0 ? Math.round((rated / catItems.length) * 100) : 0,
    };
  });

  res.json({
    overall: {
      rated: totalRated,
      total: items.length,
      percent: items.length > 0 ? Math.round((totalRated / items.length) * 100) : 0,
    },
    categories: catProgress,
  });
});

export default router;
