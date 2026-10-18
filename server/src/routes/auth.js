import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import User from '../models/User.js';
import { auth, signToken } from '../middleware/auth.js';

const google = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const router = Router();

const publicUser = (u) => ({
  id: u._id, name: u.name, email: u.email, role: u.role,
  phone: u.phone, shopName: u.shopName, stall: u.stall, address: u.address,
});

router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password, role, phone, shopName, stall, address } = req.body;
    if (!name || !email || !password || !role) return res.status(400).json({ message: 'Name, email, password and role are required' });
    if (!['vendor', 'customer'].includes(role)) return res.status(400).json({ message: 'Invalid role' });
    if (password.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters' });
    if (role === 'vendor' && !shopName) return res.status(400).json({ message: 'Shop name is required for vendors' });
    if (await User.findOne({ email: email.toLowerCase() })) return res.status(409).json({ message: 'This email is already registered' });

    const user = await User.create({
      name, email, role, phone,
      password: await bcrypt.hash(password, 10),
      ...(role === 'vendor' ? { shopName, stall } : { address }),
    });
    res.status(201).json({ token: signToken(user), user: publicUser(user) });
  } catch (e) { next(e); }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: (email || '').toLowerCase() });
    if (!user || !(await bcrypt.compare(password || '', user.password)))
      return res.status(401).json({ message: 'Wrong email or password' });
    res.json({ token: signToken(user), user: publicUser(user) });
  } catch (e) { next(e); }
});

router.post('/google', async (req, res) => {
  try {
    const ticket = await google.verifyIdToken({ idToken: req.body.credential, audience: process.env.GOOGLE_CLIENT_ID });
    const p = ticket.getPayload();
    if (!p.email_verified) return res.status(400).json({ message: 'Your Google email is not verified' });

    let user = await User.findOne({ $or: [{ googleId: p.sub }, { email: p.email.toLowerCase() }] });
    if (user) {
      if (!user.googleId) { user.googleId = p.sub; await user.save(); }
      return res.json({ token: signToken(user), user: publicUser(user) });
    }
    const signupToken = jwt.sign(
      { purpose: 'google-signup', googleId: p.sub, email: p.email, name: p.name },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );
    res.json({ needsRole: true, signupToken, profile: { name: p.name, email: p.email } });
  } catch {
    res.status(401).json({ message: 'Google sign-in failed. Please try again.' });
  }
});

router.post('/google/complete', async (req, res, next) => {
  try {
    const g = jwt.verify(req.body.signupToken, process.env.JWT_SECRET);
    if (g.purpose !== 'google-signup') return res.status(401).json({ message: 'Invalid signup link' });
    const { role, shopName, stall, address, phone } = req.body;
    if (!['vendor', 'customer'].includes(role)) return res.status(400).json({ message: 'Choose vendor or customer' });
    if (role === 'vendor' && !shopName) return res.status(400).json({ message: 'Shop name is required for vendors' });
    if (await User.findOne({ email: g.email.toLowerCase() })) return res.status(409).json({ message: 'Account already exists' });

    const user = await User.create({
      name: g.name, email: g.email, googleId: g.googleId, role, phone,
      ...(role === 'vendor' ? { shopName, stall } : { address }),
    });
    res.status(201).json({ token: signToken(user), user: publicUser(user) });
  } catch (e) { next(e); }
});

router.get('/me', auth(), (req, res) => res.json({ user: publicUser(req.user) }));

export default router;
