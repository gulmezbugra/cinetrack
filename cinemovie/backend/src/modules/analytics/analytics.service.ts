import { prisma } from '../../prisma/client';

export async function topGenres(limit = 10) {
  return prisma.$queryRawUnsafe<{ genre: string; count: string }[]>(`
    SELECT g.genre_name AS genre, COUNT(we.entry_id)::text AS count
    FROM genre g
    JOIN content_genre cg ON g.genre_id = cg.genre_id
    JOIN watchlist_entry we ON cg.content_id = we.content_id
    WHERE we.status IN ('watched', 'watching')
    GROUP BY g.genre_name
    ORDER BY count DESC
    LIMIT ${limit}
  `);
}

export async function topDirectors(limit = 10) {
  return prisma.$queryRawUnsafe<{ director: string; avg_rating: string; works: string }[]>(`
    SELECT p.full_name AS director,
           ROUND(AVG(r.rating)::numeric, 2)::text AS avg_rating,
           COUNT(DISTINCT cp.content_id)::text AS works
    FROM person p
    JOIN content_person cp ON p.person_id = cp.person_id AND cp.role = 'director'
    JOIN review r ON cp.content_id = r.content_id
    GROUP BY p.person_id, p.full_name
    HAVING COUNT(DISTINCT cp.content_id) >= 1
    ORDER BY avg_rating DESC
    LIMIT ${limit}
  `);
}

export async function droppedRateByGenre() {
  return prisma.$queryRawUnsafe<{ genre: string; total: string; dropped: string; drop_rate: string }[]>(`
    SELECT g.genre_name AS genre,
           COUNT(we.entry_id)::text AS total,
           COUNT(we.entry_id) FILTER (WHERE we.status = 'dropped')::text AS dropped,
           ROUND(
             COUNT(we.entry_id) FILTER (WHERE we.status = 'dropped')::numeric /
             NULLIF(COUNT(we.entry_id), 0) * 100, 1
           )::text AS drop_rate
    FROM genre g
    JOIN content_genre cg ON g.genre_id = cg.genre_id
    JOIN watchlist_entry we ON cg.content_id = we.content_id
    GROUP BY g.genre_name
    HAVING COUNT(we.entry_id) >= 1
    ORDER BY drop_rate DESC
  `);
}

export async function pendingContent(userId: number) {
  return prisma.$queryRawUnsafe<{ id: number; title: string; days_pending: number; poster_url: string | null }[]>(`
    SELECT c.content_id AS id, c.title, c.poster_url,
           EXTRACT(DAY FROM NOW() - we.added_date)::int AS days_pending
    FROM watchlist_entry we
    JOIN content c ON we.content_id = c.content_id
    WHERE we.user_id = ${userId}
      AND we.status = 'plan_to_watch'
      AND we.added_date < NOW() - INTERVAL '30 days'
    ORDER BY days_pending DESC
  `);
}

export async function recommendations(userId: number, limit = 10) {
  return prisma.$queryRawUnsafe<{ id: number; title: string; poster_url: string | null; score: string }[]>(`
    WITH similar_users AS (
      SELECT r2.user_id, COUNT(*) AS common_likes
      FROM review r1
      JOIN review r2 ON r1.content_id = r2.content_id
        AND r1.user_id != r2.user_id
        AND r1.rating >= 7 AND r2.rating >= 7
      WHERE r1.user_id = ${userId}
      GROUP BY r2.user_id
      ORDER BY common_likes DESC
      LIMIT 20
    )
    SELECT c.content_id AS id, c.title, c.poster_url,
           ROUND(AVG(r.rating)::numeric, 2)::text AS score
    FROM similar_users su
    JOIN review r ON r.user_id = su.user_id AND r.rating >= 7
    JOIN content c ON c.content_id = r.content_id
    WHERE c.content_id NOT IN (
      SELECT content_id FROM watchlist_entry WHERE user_id = ${userId}
    )
    GROUP BY c.content_id, c.title, c.poster_url
    ORDER BY score DESC
    LIMIT ${limit}
  `);
}

export async function monthlyReviewTrend(months = 12) {
  return prisma.$queryRawUnsafe<{ month: string; count: string; avg_rating: string }[]>(`
    SELECT TO_CHAR(DATE_TRUNC('month', review_date), 'YYYY-MM') AS month,
           COUNT(*)::text AS count,
           ROUND(AVG(rating)::numeric, 2)::text AS avg_rating
    FROM review
    WHERE review_date >= NOW() - INTERVAL '${months} months'
    GROUP BY DATE_TRUNC('month', review_date)
    ORDER BY month ASC
  `);
}

export async function completionRates() {
  return prisma.$queryRawUnsafe<{ title: string; total: string; watched: string; completion_rate: string }[]>(`
    SELECT c.title,
           COUNT(we.entry_id)::text AS total,
           COUNT(we.entry_id) FILTER (WHERE we.status = 'watched')::text AS watched,
           ROUND(
             COUNT(we.entry_id) FILTER (WHERE we.status = 'watched')::numeric /
             NULLIF(COUNT(we.entry_id), 0) * 100, 1
           )::text AS completion_rate
    FROM content c
    JOIN watchlist_entry we ON c.content_id = we.content_id
    GROUP BY c.content_id, c.title
    HAVING COUNT(we.entry_id) >= 1
    ORDER BY completion_rate DESC
    LIMIT 20
  `);
}