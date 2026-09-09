import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { IUser } from '../models/User';

export function signToken(user: IUser): string {
  return jwt.sign({ userId: user._id }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
  } as jwt.SignOptions);
}
