import mongoose, { Document, Schema } from 'mongoose';
import crypto from 'crypto';

export type InviteStatus = 'pending' | 'accepted';

export interface ICouple extends Document {
  initiatorId: mongoose.Types.ObjectId;
  partnerId?: mongoose.Types.ObjectId;
  inviteContact: string;
  inviteToken: string;
  inviteTokenExpiry: Date;
  status: InviteStatus;
}

const CoupleSchema = new Schema<ICouple>(
  {
    initiatorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    partnerId: { type: Schema.Types.ObjectId, ref: 'User' },
    inviteContact: { type: String, required: true },
    inviteToken: { type: String, default: () => crypto.randomBytes(32).toString('hex') },
    inviteTokenExpiry: { type: Date, required: true },
    status: { type: String, enum: ['pending', 'accepted'], default: 'pending' },
  },
  { timestamps: true }
);

export const Couple = mongoose.model<ICouple>('Couple', CoupleSchema);
