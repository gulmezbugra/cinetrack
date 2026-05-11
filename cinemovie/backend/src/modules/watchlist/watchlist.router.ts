import { Router } from 'express';
import { AuthRequest } from '../../middleware/authenticate';
import * as WatchlistService from './watchlist.service';

export const watchlistRouter = Router();

watchlistRouter.get('/', async (req: AuthRequest, res, next) => {
  try {
    const status = req.query.status as string | undefined;
    res.json(await WatchlistService.getUserWatchlist(req.userId!, status));
  } catch (err) { next(err); }
});

watchlistRouter.put('/', async (req: AuthRequest, res, next) => {
  try {
    const { contentId, status, episodeProgress } = req.body;
    if (!contentId || !status) {
      return res.status(400).json({ error: 'contentId and status required' });
    }
    const entry = await WatchlistService.upsertWatchlistEntry(
      req.userId!, Number(contentId), status, episodeProgress
    );
    res.json(entry);
  } catch (err) { next(err); }
});

watchlistRouter.delete('/:contentId', async (req: AuthRequest, res, next) => {
  try {
    await WatchlistService.removeFromWatchlist(req.userId!, Number(req.params.contentId));
    res.json({ success: true });
  } catch (err) { next(err); }
});

watchlistRouter.get('/:contentId/status', async (req: AuthRequest, res, next) => {
  try {
    const entry = await WatchlistService.getWatchlistEntry(req.userId!, Number(req.params.contentId));
    res.json(entry ?? null);
  } catch (err) { next(err); }
});