import mongoose, { Document, Schema } from 'mongoose';

export interface ICategory extends Document {
  coupleId: mongoose.Types.ObjectId;
  parentId?: mongoose.Types.ObjectId;
  name: string;
  colorHue: number;
  order: number;
  isSystem: boolean;
}

const CategorySchema = new Schema<ICategory>(
  {
    coupleId: { type: Schema.Types.ObjectId, ref: 'Couple', required: true, index: true },
    parentId: { type: Schema.Types.ObjectId, ref: 'Category', index: true },
    name: { type: String, required: true, trim: true },
    colorHue: { type: Number, required: true },
    order: { type: Number, default: 0 },
    isSystem: { type: Boolean, default: false },
  },
  { timestamps: true }
);

CategorySchema.index({ coupleId: 1, name: 1 }, { unique: true });

export const Category = mongoose.model<ICategory>('Category', CategorySchema);
