import { Router, Response } from 'express';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { Category } from '../models/Category';
import { Item } from '../models/Item';
import { Rating } from '../models/Rating';
import { SEXUALITY_BLUEPRINT } from '../data/blueprint';

const router = Router();

const DEFAULT_HUES = [25, 210, 150, 300, 70];
const SEXUALITY_HUE = 330;

// GET /categories  — root categories only, with sub-counts and aggregated progress
router.get('/', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.user!.coupleId) {
    res.json({ categories: [] });
    return;
  }
  const coupleId = req.user!.coupleId;

  const rootCats = await Category.find({ coupleId, parentId: { $exists: false } }).sort('order');
  const subCats = await Category.find({ coupleId, parentId: { $exists: true } });
  const allItems = await Item.find({ coupleId });
  const myRatings = await Rating.find({ coupleId, userId: req.user!._id });

  const subCatsByParent = new Map<string, string[]>();
  for (const sc of subCats) {
    const pId = sc.parentId!.toString();
    if (!subCatsByParent.has(pId)) subCatsByParent.set(pId, []);
    subCatsByParent.get(pId)!.push(sc._id.toString());
  }

  const ratedSet = new Set(myRatings.map(r => r.itemId.toString()));

  const result = rootCats.map(cat => {
    const catId = cat._id.toString();
    const childIds = subCatsByParent.get(catId) ?? [];
    const subCount = childIds.length;

    const catItems = subCount > 0
      ? allItems.filter(i => childIds.includes(i.categoryId.toString()))
      : allItems.filter(i => i.categoryId.toString() === catId);

    const rated = catItems.filter(i => ratedSet.has(i._id.toString())).length;

    return {
      _id: cat._id,
      name: cat.name,
      colorHue: cat.colorHue,
      order: cat.order,
      isSystem: cat.isSystem,
      totalItems: catItems.length,
      ratedByMe: rated,
      subCount,
    };
  });

  res.json({ categories: result });
});

// GET /categories/:id/subcategories
router.get('/:id/subcategories', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  const coupleId = req.user!.coupleId;
  if (!coupleId) { res.status(403).json({ message: 'Couple required' }); return; }

  const parent = await Category.findOne({ _id: req.params.id, coupleId });
  if (!parent) { res.status(404).json({ message: 'Category not found' }); return; }

  const subs = await Category.find({ coupleId, parentId: parent._id }).sort('order');
  const allItems = await Item.find({ coupleId, categoryId: { $in: subs.map(s => s._id) } });
  const myRatings = await Rating.find({ coupleId, userId: req.user!._id });
  const ratedSet = new Set(myRatings.map(r => r.itemId.toString()));

  const result = subs.map(cat => {
    const catItems = allItems.filter(i => i.categoryId.toString() === cat._id.toString());
    const rated = catItems.filter(i => ratedSet.has(i._id.toString())).length;
    return {
      _id: cat._id,
      name: cat.name,
      colorHue: cat.colorHue,
      order: cat.order,
      isSystem: cat.isSystem,
      totalItems: catItems.length,
      ratedByMe: rated,
      subCount: 0,
    };
  });

  res.json({ categories: result });
});

// POST /categories
router.post('/', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.user!.coupleId) {
    res.status(403).json({ message: 'Partner connection required to create categories' });
    return;
  }
  const { name, colorHue } = req.body;
  if (!name) { res.status(400).json({ message: 'name is required' }); return; }
  const coupleId = req.user!.coupleId;
  const count = await Category.countDocuments({ coupleId, parentId: { $exists: false } });
  const hue = colorHue ?? DEFAULT_HUES[count % DEFAULT_HUES.length];
  const category = await Category.create({ coupleId, name, colorHue: hue, order: count });
  res.status(201).json({ category });
});

// DELETE /categories/:id
router.delete('/:id', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  const coupleId = req.user!.coupleId;
  const category = await Category.findOne({ _id: req.params.id, coupleId });
  if (!category) { res.status(404).json({ message: 'Category not found' }); return; }
  if (category.isSystem) { res.status(403).json({ message: 'System categories cannot be deleted' }); return; }
  const itemCount = await Item.countDocuments({ categoryId: category._id });
  if (itemCount > 0) {
    res.status(409).json({ message: 'Remove all items before deleting the category' });
    return;
  }
  await category.deleteOne();
  res.status(204).send();
});

// POST /categories/sexuality  — toggle system sexuality category tree
router.post('/sexuality', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  const { enabled } = req.body;
  if (typeof enabled !== 'boolean') {
    res.status(400).json({ message: 'enabled (boolean) is required' });
    return;
  }
  const coupleId = req.user!.coupleId;
  if (!coupleId) { res.status(403).json({ message: 'Partner connection required' }); return; }

  if (enabled) {
    const existing = await Category.findOne({ coupleId, isSystem: true, name: 'Sexuality', parentId: { $exists: false } });
    if (!existing) {
      const baseCount = await Category.countDocuments({ coupleId, parentId: { $exists: false } });
      const parent = await Category.create({
        coupleId, name: 'Sexuality', colorHue: SEXUALITY_HUE, order: baseCount, isSystem: true,
      });
      for (let si = 0; si < SEXUALITY_BLUEPRINT.length; si++) {
        const sub = SEXUALITY_BLUEPRINT[si];
        const subCat = await Category.create({
          coupleId, name: sub.name, colorHue: SEXUALITY_HUE, order: si,
          isSystem: true, parentId: parent._id,
        });
        for (let ii = 0; ii < sub.items.length; ii++) {
          await Item.create({ coupleId, categoryId: subCat._id, name: sub.items[ii], order: ii });
        }
      }
    }
    res.status(201).json({ message: 'ok' });
  } else {
    const parent = await Category.findOne({ coupleId, isSystem: true, name: 'Sexuality', parentId: { $exists: false } });
    if (parent) {
      const subCats = await Category.find({ coupleId, parentId: parent._id });
      for (const sc of subCats) {
        const itemIds = await Item.find({ categoryId: sc._id }).distinct('_id');
        await Rating.deleteMany({ itemId: { $in: itemIds } });
        await Item.deleteMany({ categoryId: sc._id });
        await sc.deleteOne();
      }
      await parent.deleteOne();
    }
    res.status(204).send();
  }
});

export default router;
