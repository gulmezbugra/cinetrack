import { Router } from 'express';
import { authenticate, AuthRequest } from '../../middleware/authenticate';
import * as AnalyticsService from './analytics.service';

export const analyticsRouter = Router();

analyticsRouter.get('/top-genres', async (_req, res, next) => {
  try { res.json(await AnalyticsService.topGenres()); } catch (err) { next(err); }
});

analyticsRouter.get('/top-directors', async (_req, res, next) => {
  try { res.json(await AnalyticsService.topDirectors()); } catch (err) { next(err); }
});

analyticsRouter.get('/dropped-rate', async (_req, res, next) => {
  try { res.json(await AnalyticsService.droppedRateByGenre()); } catch (err) { next(err); }
});

analyticsRouter.get('/pending', authenticate, async (req: AuthRequest, res, next) => {
  try { res.json(await AnalyticsService.pendingContent(req.userId!)); } catch (err) { next(err); }
});

analyticsRouter.get('/recommendations', authenticate, async (req: AuthRequest, res, next) => {
  try { res.json(await AnalyticsService.recommendations(req.userId!)); } catch (err) { next(err); }
});

analyticsRouter.get('/monthly-trend', async (_req, res, next) => {
  try { res.json(await AnalyticsService.monthlyReviewTrend()); } catch (err) { next(err); }
});

analyticsRouter.get('/completion-rates', async (_req, res, next) => {
  try { res.json(await AnalyticsService.completionRates()); } catch (err) { next(err); }
});
