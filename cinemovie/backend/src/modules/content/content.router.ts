import { Router } from 'express';
import { prisma } from '../../prisma/client';
import * as ContentService from './content.service';

export const contentRouter = Router();

contentRouter.get('/genres', async (_req, res, next) => {
  try {
    res.json(await ContentService.listGenres());
  } catch (err) { next(err); }
});

contentRouter.get('/search', async (req, res, next) => {
  try {
    const q = (req.query.q as string) || '';
    res.json(await ContentService.searchContent(q));
  } catch (err) { next(err); }
});

contentRouter.get('/', async (req, res, next) => {
  try {
    const result = await ContentService.listContent({
      type: req.query.type as string | undefined,
      genreId: req.query.genreId ? Number(req.query.genreId) : undefined,
      search: req.query.search as string | undefined,
      page: req.query.page ? Number(req.query.page) : 1,
      limit: req.query.limit ? Number(req.query.limit) : 20,
    });
    res.json(result);
  } catch (err) { next(err); }
});

contentRouter.get('/:id/trailer', async (req, res, next) => {
  try {
    const content = await prisma.content.findUnique({
      where: { content_id: Number(req.params.id) },
      select: { imdb_id: true, title: true },
    });
    if (!content?.imdb_id) return res.json({ trailerKey: null });

    const findRes = await fetch(
      `https://api.themoviedb.org/3/find/${content.imdb_id}?api_key=${process.env.TMDB_API_KEY}&external_source=imdb_id`
    );
    const findData = await findRes.json() as any;
    const isMovie = findData.movie_results?.length > 0;
    const tmdbItem = isMovie ? findData.movie_results[0] : findData.tv_results?.[0];
    if (!tmdbItem) return res.json({ trailerKey: null });

    const type = isMovie ? 'movie' : 'tv';
    const videoRes = await fetch(
      `https://api.themoviedb.org/3/${type}/${tmdbItem.id}/videos?api_key=${process.env.TMDB_API_KEY}`
    );
    const videoData = await videoRes.json() as any;
    const trailer = videoData.results?.find((v: any) => v.type === 'Trailer' && v.site === 'YouTube')
      || videoData.results?.[0];

    res.json({ trailerKey: trailer?.key || null });
  } catch (err) { next(err); }
});

contentRouter.get('/:id/similar', async (req, res, next) => {
  try {
    const content = await prisma.content.findUnique({
      where: { content_id: Number(req.params.id) },
      select: { imdb_id: true, contentType: true },
    });
    if (!content?.imdb_id) return res.json([]);

    const findRes = await fetch(
      `https://api.themoviedb.org/3/find/${content.imdb_id}?api_key=${process.env.TMDB_API_KEY}&external_source=imdb_id`
    );
    const findData = await findRes.json() as any;
    const isMovie = findData.movie_results?.length > 0;
    const tmdbItem = isMovie ? findData.movie_results[0] : findData.tv_results?.[0];
    if (!tmdbItem) return res.json([]);

    const type = isMovie ? 'movie' : 'tv';
    const similarRes = await fetch(
      `https://api.themoviedb.org/3/${type}/${tmdbItem.id}/recommendations?api_key=${process.env.TMDB_API_KEY}&language=tr-TR`
    );
    const similarData = await similarRes.json() as any;

    const results = (similarData.results || []).slice(0, 10).map((item: any) => ({
      tmdb_id: item.id,
      title: item.title || item.name,
      poster_url: item.poster_path ? `https://image.tmdb.org/t/p/w300${item.poster_path}` : null,
      release_year: item.release_date?.slice(0,4) || item.first_air_date?.slice(0,4),
      rating: item.vote_average?.toFixed(1),
      type: isMovie ? 'film' : 'series',
    }));

    res.json(results);
  } catch (err) { next(err); }
});

contentRouter.get('/:id/details', async (req, res, next) => {
  try {
    const content = await prisma.content.findUnique({
      where: { content_id: Number(req.params.id) },
      select: { imdb_id: true, contentType: true },
    });
    if (!content?.imdb_id) return res.json(null);

    const findRes = await fetch(
      `https://api.themoviedb.org/3/find/${content.imdb_id}?api_key=${process.env.TMDB_API_KEY}&external_source=imdb_id`
    );
    const findData = await findRes.json() as any;
    const isMovie = findData.movie_results?.length > 0;
    const tmdbItem = isMovie ? findData.movie_results[0] : findData.tv_results?.[0];
    if (!tmdbItem) return res.json(null);

    const type = isMovie ? 'movie' : 'tv';
    const detailRes = await fetch(
      `https://api.themoviedb.org/3/${type}/${tmdbItem.id}?api_key=${process.env.TMDB_API_KEY}&language=tr-TR`
    );
    const detail = await detailRes.json() as any;

    res.json({
      budget: detail.budget || null,
      revenue: detail.revenue || null,
      production_companies: detail.production_companies?.slice(0,3).map((c: any) => c.name) || [],
      production_countries: detail.production_countries?.map((c: any) => c.name) || [],
      spoken_languages: detail.spoken_languages?.map((l: any) => l.name) || [],
      overview: detail.overview || null,
      backdrop_url: detail.backdrop_path ? `https://image.tmdb.org/t/p/w1280${detail.backdrop_path}` : null,
      tagline: detail.tagline || null,
      status: detail.status || null,
      episode_count: detail.number_of_episodes || null,
      season_count: detail.number_of_seasons || null,
      networks: detail.networks?.slice(0,2).map((n: any) => n.name) || [],
    });
  } catch (err) { next(err); }
});

contentRouter.get('/:id', async (req, res, next) => {
  try {
    res.json(await ContentService.getContentById(Number(req.params.id)));
  } catch (err) { next(err); }
});