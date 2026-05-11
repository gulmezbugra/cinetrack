import express from 'express';
import cors from 'cors';
import { authRouter } from './modules/auth/auth.router';
import { contentRouter } from './modules/content/content.router';
import { watchlistRouter } from './modules/watchlist/watchlist.router';
import { reviewRouter } from './modules/review/review.router';
import { analyticsRouter } from './modules/analytics/analytics.router';
import { socialRouter } from './modules/social/social.router';
import { adminRouter } from './modules/admin/admin.router';
import { errorHandler } from './middleware/errorHandler';
import { authenticate } from './middleware/authenticate';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json());

// Public routes
app.use('/api/auth', authRouter);
app.use('/api/content', contentRouter);

// Protected routes
app.use('/api/watchlist', authenticate, watchlistRouter);
app.use('/api/reviews', authenticate, reviewRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/social', authenticate, socialRouter)
app.use('/api/admin', adminRouter);;

// Global error handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🎬 CineTrack API running on http://localhost:${PORT}`);
});

export default app;
