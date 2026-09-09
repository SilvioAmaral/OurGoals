import { Router, Request, Response } from 'express';
import { OAuth2Client } from 'google-auth-library';
import { User } from '../models/User';
import { signToken } from '../services/tokenService';
import { env } from '../config/env';

const router = Router();
const googleClient = new OAuth2Client(env.googleClientId);

// POST /auth/register
router.post('/register', async (req: Request, res: Response): Promise<void> => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    res.status(400).json({ message: 'name, email and password are required' });
    return;
  }
  const exists = await User.findOne({ email });
  if (exists) {
    res.status(409).json({ message: 'Email already in use' });
    return;
  }
  const user = await User.create({ name, email, password });
  res.status(201).json({ token: signToken(user), user: sanitize(user) });
});

// POST /auth/login
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ message: 'email and password are required' });
    return;
  }
  const user = await User.findOne({ email }).select('+password');
  if (!user || !user.password || !(await user.comparePassword(password))) {
    res.status(401).json({ message: 'Invalid credentials' });
    return;
  }
  res.json({ token: signToken(user), user: sanitize(user) });
});

// POST /auth/google  — client sends the ID token from Google Sign-In
router.post('/google', async (req: Request, res: Response): Promise<void> => {
  const { idToken } = req.body;
  if (!idToken) {
    res.status(400).json({ message: 'idToken required' });
    return;
  }
  const ticket = await googleClient.verifyIdToken({
    idToken,
    audience: env.googleClientId,
  });
  const payload = ticket.getPayload();
  if (!payload?.email) {
    res.status(401).json({ message: 'Invalid Google token' });
    return;
  }
  let user = await User.findOne({ $or: [{ googleId: payload.sub }, { email: payload.email }] });
  if (user) {
    if (!user.googleId) { user.googleId = payload.sub; await user.save(); }
  } else {
    user = await User.create({ name: payload.name || payload.email, email: payload.email, googleId: payload.sub });
  }
  res.json({ token: signToken(user), user: sanitize(user) });
});

// POST /auth/apple  — client sends the identity token from Sign in with Apple
router.post('/apple', async (req: Request, res: Response): Promise<void> => {
  const { identityToken, fullName, email } = req.body;
  if (!identityToken) {
    res.status(400).json({ message: 'identityToken required' });
    return;
  }
  // apple-signin-auth verifies the JWT against Apple's public keys
  const appleSignin = await import('apple-signin-auth');
  const decoded = await appleSignin.default.verifyIdToken(identityToken, {
    audience: process.env.APPLE_BUNDLE_ID,
    ignoreExpiration: false,
  });
  const appleId = decoded.sub;
  const appleEmail = decoded.email || email;
  let user = await User.findOne({ $or: [{ appleId }, { email: appleEmail }] });
  if (user) {
    if (!user.appleId) { user.appleId = appleId; await user.save(); }
  } else {
    if (!appleEmail) { res.status(400).json({ message: 'Email required on first Apple sign-in' }); return; }
    const name = fullName ? `${fullName.givenName || ''} ${fullName.familyName || ''}`.trim() : appleEmail;
    user = await User.create({ name, email: appleEmail, appleId });
  }
  res.json({ token: signToken(user), user: sanitize(user) });
});

function sanitize(user: InstanceType<typeof User>) {
  const { password: _, ...safe } = (user as any).toObject();
  return safe;
}

export default router;
