import { Router } from 'express';
import { authenticate, AuthRequest } from '../../middleware/authenticate';
import * as SocialService from './social.service';

export const socialRouter = Router();

// Feed
socialRouter.get('/feed', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const page = Number(req.query.page || 1);
    res.json(await SocialService.getFeed(req.userId!, page));
  } catch (err) { next(err); }
});

// Beğen / beğeniyi kaldır
socialRouter.post('/like/:reviewId', authenticate, async (req: AuthRequest, res, next) => {
  try {
    res.json(await SocialService.toggleLike(req.userId!, Number(req.params.reviewId)));
  } catch (err) { next(err); }
});

// Yorum ekle
socialRouter.post('/comment/:reviewId', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { body } = req.body;
    if (!body?.trim()) return res.status(400).json({ error: 'Comment cannot be empty' });
    res.json(await SocialService.addComment(req.userId!, Number(req.params.reviewId), body));
  } catch (err) { next(err); }
});

// Yorum sil
socialRouter.delete('/comment/:commentId', authenticate, async (req: AuthRequest, res, next) => {
  try {
    await SocialService.deleteComment(req.userId!, Number(req.params.commentId));
    res.json({ success: true });
  } catch (err) { next(err); }
});

// Kullanıcı arama
socialRouter.get('/search', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const q = (req.query.q as string) || '';
    res.json(await SocialService.searchUsers(q, req.userId!));
  } catch (err) { next(err); }
});

// Kullanıcı profili
socialRouter.get('/profile/:userId', authenticate, async (req: AuthRequest, res, next) => {
  try {
    res.json(await SocialService.getUserProfile(Number(req.params.userId), req.userId!));
  } catch (err) { next(err); }
});

// Takip et / takibi bırak
socialRouter.post('/follow/:userId', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const followeeId = Number(req.params.userId);
    if (followeeId === req.userId) return res.status(400).json({ error: 'Cannot follow yourself' });
    const existing = await (await import('../../prisma/client')).prisma.follow.findUnique({
      where: { followerId_followeeId: { followerId: req.userId!, followeeId } },
    });
    const { prisma } = await import('../../prisma/client');
    if (existing) {
      await prisma.follow.delete({ where: { followerId_followeeId: { followerId: req.userId!, followeeId } } });
      res.json({ following: false });
    } else {
      await prisma.follow.create({ data: { followerId: req.userId!, followeeId } });
      res.json({ following: true });
    }
  } catch (err) { next(err); }
});