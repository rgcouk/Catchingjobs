import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { authenticate, AuthRequest } from '../middleware/auth.ts';
import { PrismaClient } from '../../src/generated/prisma/client.ts';

export default function createAuthRouter(prisma: PrismaClient) {
  const router = express.Router();
  const SECRET = process.env.JWT_SECRET || 'secret';

  router.post('/register', async (req, res) => {
    try {
      const { email, password, role } = req.body;
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) {
        return res.status(400).json({ error: 'Email already in use' });
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const user = await prisma.user.create({
        data: {
          email,
          passwordHash,
          role: role || 'WORKER'
        }
      });

      const token = jwt.sign({ id: user.id, role: user.role }, SECRET, { expiresIn: '1d' });
      res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict' });
      res.status(201).json({ user: { id: user.id, email: user.email, role: user.role } });
    } catch (_error) {
      res.status(500).json({ error: 'Registration failed' });
    }
  });

  router.post('/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const valid = await bcrypt.compare(password, user.passwordHash);
      if (!valid) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const token = jwt.sign({ id: user.id, role: user.role }, SECRET, { expiresIn: '1d' });
      res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict' });
      res.json({ user: { id: user.id, email: user.email, role: user.role } });
    } catch (_error) {
      res.status(500).json({ error: 'Login failed' });
    }
  });

  router.post('/logout', (req, res) => {
    res.clearCookie('token');
    res.json({ success: true });
  });

  router.get('/me', authenticate, async (req: AuthRequest, res) => {
    try {
      const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
      if (!user) return res.status(404).json({ error: 'User not found' });
      res.json({ user: { id: user.id, email: user.email, role: user.role } });
    } catch (_error) {
      res.status(500).json({ error: 'Failed to fetch user' });
    }
  });

  return router;
}
