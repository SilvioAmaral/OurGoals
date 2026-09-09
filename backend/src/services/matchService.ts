import mongoose from 'mongoose';
import { Category } from '../models/Category';
import { Item } from '../models/Item';
import { Rating } from '../models/Rating';

interface CategoryMatch {
  categoryId: string;
  name: string;
  colorHue: number;
  matchPercent: number;
  ratedByBoth: number;
  totalItems: number;
}

interface SharedItem {
  itemId: string;
  name: string;
  categoryId: string;
  categoryName: string;
  myRating: number;
  partnerRating: number;
}

export interface MatchResult {
  overallMatchPercent: number;
  sharedHighItems: SharedItem[];
  byCategory: CategoryMatch[];
  totalRatedByBoth: number;
}

export async function computeMatch(coupleId: mongoose.Types.ObjectId, userId: mongoose.Types.ObjectId, partnerId: mongoose.Types.ObjectId): Promise<MatchResult> {
  const categories = await Category.find({ coupleId });
  const items = await Item.find({ coupleId });
  const myRatings = await Rating.find({ coupleId, userId });
  const partnerRatings = await Rating.find({ coupleId, userId: partnerId });

  const myMap = new Map(myRatings.map(r => [r.itemId.toString(), r.value]));
  const partnerMap = new Map(partnerRatings.map(r => [r.itemId.toString(), r.value]));

  const categoryMap = new Map(categories.map(c => [c._id.toString(), c]));

  let totalMatchScore = 0;
  let totalRatedByBoth = 0;
  const sharedHighItems: SharedItem[] = [];
  const byCategory: CategoryMatch[] = [];

  for (const category of categories) {
    const catItems = items.filter(i => i.categoryId.toString() === category._id.toString());
    let catMatchScore = 0;
    let catRatedByBoth = 0;

    for (const item of catItems) {
      const itemId = item._id.toString();
      const myVal = myMap.get(itemId);
      const partnerVal = partnerMap.get(itemId);
      if (myVal !== undefined && partnerVal !== undefined) {
        catRatedByBoth++;
        totalRatedByBoth++;
        // Match score: 100% when equal, decreases by 25% per point of difference
        const diff = Math.abs(myVal - partnerVal);
        const score = Math.max(0, 1 - diff * 0.25);
        catMatchScore += score;
        totalMatchScore += score;

        if (myVal >= 4 && partnerVal >= 4) {
          sharedHighItems.push({
            itemId,
            name: item.name,
            categoryId: category._id.toString(),
            categoryName: category.name,
            myRating: myVal,
            partnerRating: partnerVal,
          });
        }
      }
    }

    byCategory.push({
      categoryId: category._id.toString(),
      name: category.name,
      colorHue: category.colorHue,
      matchPercent: catRatedByBoth > 0 ? Math.round((catMatchScore / catRatedByBoth) * 100) : 0,
      ratedByBoth: catRatedByBoth,
      totalItems: catItems.length,
    });
  }

  const overallMatchPercent = totalRatedByBoth > 0
    ? Math.round((totalMatchScore / totalRatedByBoth) * 100)
    : 0;

  return { overallMatchPercent, sharedHighItems, byCategory, totalRatedByBoth };
}
