import { Router, Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../../prisma/client';
import * as AdminService from './admin.service';

export const adminRouter = Router();

// Admin JWT middleware
async function adminAuth(req: any, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'secret') as any;
    const user = await prisma.user.findUnique({ where: { user_id: payload.userId } });
    if (!user || user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
    req.userId = payload.userId;
    next();
  } catch { return res.status(401).json({ error: 'Invalid token' }); }
}

// Admin login (ayrı endpoint)
adminRouter.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const bcrypt = await import('bcryptjs');
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
    const valid = await bcrypt.default.compare(password, user.passwordHash);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ userId: user.user_id }, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' });
    res.json({ token, user: { user_id: user.user_id, username: user.username, role: user.role } });
  } catch (err) { next(err); }
});

// Platform istatistikleri
adminRouter.get('/stats', adminAuth, async (_req, res, next) => {
  try { res.json(await AdminService.getPlatformStats()); } catch (err) { next(err); }
});

// Tüm kullanıcılar
adminRouter.get('/users', adminAuth, async (req, res, next) => {
  try {
    res.json(await AdminService.getAllUsers(
      Number(req.query.page || 1),
      Number(req.query.limit || 20),
      (req.query.search as string) || ''
    ));
  } catch (err) { next(err); }
});

// Kullanıcı detayı
adminRouter.get('/users/:userId', adminAuth, async (req, res, next) => {
  try { res.json(await AdminService.getUserDetail(Number(req.params.userId))); } catch (err) { next(err); }
});

// Banla
adminRouter.post('/users/:userId/ban', adminAuth, async (req, res, next) => {
  try {
    const { reason } = req.body;
    await AdminService.banUser(Number(req.params.userId), reason || 'Kural ihlali');
    res.json({ success: true });
  } catch (err) { next(err); }
});

// Ban kaldır
adminRouter.post('/users/:userId/unban', adminAuth, async (req, res, next) => {
  try { await AdminService.unbanUser(Number(req.params.userId)); res.json({ success: true }); }
  catch (err) { next(err); }
});

// Kısıtla
adminRouter.post('/users/:userId/restrict', adminAuth, async (req, res, next) => {
  try { await AdminService.restrictUser(Number(req.params.userId)); res.json({ success: true }); }
  catch (err) { next(err); }
});

// Kısıtlama kaldır
adminRouter.post('/users/:userId/unrestrict', adminAuth, async (req, res, next) => {
  try { await AdminService.unrestrictUser(Number(req.params.userId)); res.json({ success: true }); }
  catch (err) { next(err); }
});

// İçerik analitiği
adminRouter.get('/analytics', adminAuth, async (_req, res, next) => {
  try { res.json(await AdminService.getContentAnalytics()); } catch (err) { next(err); }
});