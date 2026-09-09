import mongoose, { Document, Schema } from 'mongoose';

export interface IItem extends Document {
  coupleId: mongoose.Types.ObjectId;
  categoryId: mongoose.Types.ObjectId;
  name: string;
  order: number;
}

const ItemSchema = new Schema<IItem>(
  {
    coupleId: { type: Schema.Types.ObjectId, ref: 'Couple', required: true, index: true },
    categoryId: { type: Schema.Types.ObjectId, ref: 'Category', required: true, index: true },
    name: { type: String, required: true, trim: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

ItemSchema.index({ categoryId: 1, name: 1 }, { unique: true });

export const Item = mongoose.model<IItem>('Item', ItemSchema);
