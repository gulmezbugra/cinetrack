import { Router } from 'express';
import { z } from 'zod';
import { authenticate, AuthRequest } from '../../middleware/authenticate';
import * as ReviewService from './review.service';

export const reviewRouter = Router();

reviewRouter.get('/content/:contentId', async (req, res, next) => {
  try {
    res.json(await ReviewService.getReviewsForContent(Number(req.params.contentId)));
  } catch (err) { next(err); }
});

const ReviewSchema = z.object({
  contentId: z.number().int().positive(),
  rating: z.number().min(1).max(10),
  body: z.string().max(2000).optional(),
});

reviewRouter.put('/', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { contentId, rating, body } = ReviewSchema.parse(req.body);
    res.json(await ReviewService.upsertReview(req.userId!, contentId, rating, body));
  } catch (err) { next(err); }
});

reviewRouter.delete('/:contentId', authenticate, async (req: AuthRequest, res, next) => {
  try {
    await ReviewService.deleteReview(req.userId!, Number(req.params.contentId));
    res.json({ success: true });
  } catch (err) { next(err); }
});

reviewRouter.get('/my', authenticate, async (req: AuthRequest, res, next) => {
  try {
    res.json(await ReviewService.getUserReviews(req.userId!));
  } catch (err) { next(err); }
});