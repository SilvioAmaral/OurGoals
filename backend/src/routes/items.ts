import { Router, Response } from 'express';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { Category } from '../models/Category';
import { Item } from '../models/Item';
import { Rating } from '../models/Rating';
import { Couple } from '../models/Couple';
import { User } from '../models/User';

const router = Router({ mergeParams: true });

function getPartnerId(couple: InstanceType<typeof Couple>, userId: string) {
  return couple.initiatorId.toString() === userId
    ? couple.partnerId
    : couple.initiatorId;
}

// GET /categories/:categoryId/items
router.get('/', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  const coupleId = req.user!.coupleId;
  const category = await Category.findOne({ _id: req.params.categoryId, coupleId });
  if (!category) { res.status(404).json({ message: 'Category not found' }); return; }

  const items = await Item.find({ categoryId: category._id }).sort('order');
  const myRatings = await Rating.find({ coupleId, userId: req.user!._id, itemId: { $in: items.map(i => i._id) } });

  let partnerRatings: InstanceType<typeof Rating>[] = [];
  if (coupleId) {
    const couple = await Couple.findById(coupleId);
    const partnerId = couple ? getPartnerId(couple, req.user!._id.toString()) : null;
    if (partnerId) {
      partnerRatings = await Rating.find({ coupleId, userId: partnerId, itemId: { $in: items.map(i => i._id) } });
    }
  }

  const myMap = new Map(myRatings.map(r => [r.itemId.toString(), r.value]));
  const partnerMap = new Map(partnerRatings.map(r => [r.itemId.toString(), r.value]));

  const result = items.map(item => ({
    _id: item._id,
    name: item.name,
    order: item.order,
    myRating: myMap.get(item._id.toString()) ?? null,
    partnerRating: partnerMap.get(item._id.toString()) ?? null,
  }));

  res.json({ items: result, category: { _id: category._id, name: category.name, colorHue: category.colorHue } });
});

// POST /categories/:categoryId/items
router.post('/', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  const coupleId = req.user!.coupleId;
  const category = await Category.findOne({ _id: req.params.categoryId, coupleId });
  if (!category) { res.status(404).json({ message: 'Category not found' }); return; }

  const { name } = req.body;
  if (!name) { res.status(400).json({ message: 'name is required' }); return; }

  const count = await Item.countDocuments({ categoryId: category._id });
  const item = await Item.create({ coupleId, categoryId: category._id, name, order: count });
  res.status(201).json({ item });
});

// DELETE /categories/:categoryId/items/:itemId
router.delete('/:itemId', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  const coupleId = req.user!.coupleId;
  const item = await Item.findOne({ _id: req.params.itemId, categoryId: req.params.categoryId, coupleId });
  if (!item) { res.status(404).json({ message: 'Item not found' }); return; }

  await Promise.all([
    item.deleteOne(),
    Rating.deleteMany({ itemId: item._id }),
  ]);
  res.status(204).send();
});

// GET /categories/:categoryId/items/:itemId  — item detail with both ratings
router.get('/:itemId', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  const coupleId = req.user!.coupleId;
  const item = await Item.findOne({ _id: req.params.itemId, categoryId: req.params.categoryId, coupleId });
  if (!item) { res.status(404).json({ message: 'Item not found' }); return; }

  const myRating = await Rating.findOne({ userId: req.user!._id, itemId: item._id });

  let partnerRating: number | null = null;
  if (coupleId) {
    const couple = await Couple.findById(coupleId);
    const partnerId = couple ? getPartnerId(couple, req.user!._id.toString()) : null;
    if (partnerId) {
      const pr = await Rating.findOne({ userId: partnerId, itemId: item._id });
      partnerRating = pr?.value ?? null;
    }
  }

  res.json({ item: { _id: item._id, name: item.name }, myRating: myRating?.value ?? null, partnerRating });
});

// PUT /categories/:categoryId/items/:itemId/rating  — set my rating
router.put('/:itemId/rating', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  const coupleId = req.user!.coupleId;
  const { value } = req.body;
  if (![1, 2, 3, 4, 5].includes(value)) {
    res.status(400).json({ message: 'value must be 1–5' });
    return;
  }
  const item = await Item.findOne({ _id: req.params.itemId, categoryId: req.params.categoryId, coupleId });
  if (!item) { res.status(404).json({ message: 'Item not found' }); return; }

  const rating = await Rating.findOneAndUpdate(
    { userId: req.user!._id, itemId: item._id },
    { value, coupleId },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  res.json({ rating });
});

export default router;
