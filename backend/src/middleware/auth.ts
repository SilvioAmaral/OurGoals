import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { User, IUser } from '../models/User';

export interface AuthRequest extends Request {
  user?: IUser;
}

export async function requireAuth(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ message: 'No token provided' });
    return;
  }

  try {
    const token = header.slice(7);
    const decoded = jwt.verify(token, env.jwtSecret) as { userId: string };
    const user = await User.findById(decoded.userId);
    if (!user) {
      res.status(401).json({ message: 'User not found' });
      return;
    }
    req.user = user;
    next();
  } catch {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
}

export function requireCouple(req: AuthRequest, res: Response, next: NextFunction): void {
  if (!req.user?.coupleId) {
    res.status(403).json({ message: 'Partner connection required' });
    return;
  }
  next();
}
