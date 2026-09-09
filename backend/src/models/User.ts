import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export type Theme = 'purple' | 'rose' | 'teal' | 'sunset';

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  googleId?: string;
  appleId?: string;
  theme: Theme;
  sexualityEnabled: boolean;
  partnerNickname?: string;
  coupleId?: mongoose.Types.ObjectId;
  comparePassword(candidate: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, select: false },
    googleId: { type: String, sparse: true },
    appleId: { type: String, sparse: true },
    theme: { type: String, enum: ['purple', 'rose', 'teal', 'sunset'], default: 'purple' },
    sexualityEnabled: { type: Boolean, default: false },
    partnerNickname: { type: String, trim: true },
    coupleId: { type: Schema.Types.ObjectId, ref: 'Couple' },
  },
  { timestamps: true }
);

UserSchema.pre('save', async function () {
  if (!this.isModified('password') || !this.password) return;
  this.password = await bcrypt.hash(this.password, 12);
});

UserSchema.methods.comparePassword = function (candidate: string): Promise<boolean> {
  return bcrypt.compare(candidate, this.password!);
};

export const User = mongoose.model<IUser>('User', UserSchema);
