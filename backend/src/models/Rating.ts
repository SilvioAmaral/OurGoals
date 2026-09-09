import mongoose, { Document, Schema } from 'mongoose';

export interface IRating extends Document {
  userId: mongoose.Types.ObjectId;
  itemId: mongoose.Types.ObjectId;
  coupleId: mongoose.Types.ObjectId;
  value: 1 | 2 | 3 | 4 | 5;
}

const RatingSchema = new Schema<IRating>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    itemId: { type: Schema.Types.ObjectId, ref: 'Item', required: true },
    coupleId: { type: Schema.Types.ObjectId, ref: 'Couple', required: true },
    value: { type: Number, enum: [1, 2, 3, 4, 5], required: true },
  },
  { timestamps: true }
);

RatingSchema.index({ userId: 1, itemId: 1 }, { unique: true });
RatingSchema.index({ coupleId: 1, itemId: 1 });

export const Rating = mongoose.model<IRating>('Rating', RatingSchema);
