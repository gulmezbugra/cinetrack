import { prisma } from '../../prisma/client';

// ── Platform genel istatistikleri ─────────────────────────
export async function getPlatformStats() {
  const [totalUsers, totalReviews, totalWatchlist, totalContent] = await Promise.all([
    prisma.user.count(),
    prisma.review.count(),
    prisma.watchlistEntry.count(),
    prisma.content.count(),
  ]);

  const activeUsers = await prisma.$queryRawUnsafe<{ count: string }[]>(`
    SELECT COUNT(DISTINCT user_id)::text as count FROM review
    WHERE review_date > NOW() - INTERVAL '30 days'
  `);

  const newUsersThisWeek = await prisma.$queryRawUnsafe<{ count: string }[]>(`
    SELECT COUNT(*)::text as count FROM users
    WHERE join_date > NOW() - INTERVAL '7 days'
  `);

  return {
    totalUsers,
    totalReviews,
    totalWatchlist,
    totalContent,
    activeUsers: Number(activeUsers[0]?.count ?? 0),
    newUsersThisWeek: Number(newUsersThisWeek[0]?.count ?? 0),
  };
}

// ── Tüm kullanıcılar ──────────────────────────────────────
export async function getAllUsers(page = 1, limit = 20, search = '') {
  const skip = (page - 1) * limit;
  const where = search ? { username: { contains: search, mode: 'insensitive' as const } } : {};

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        user_id: true, username: true, email: true, role: true,
        join_date: true, country: true,
        is_banned: true, is_restricted: true, ban_reason: true,
        _count: { select: { reviews: true, watchlistItems: true, followers: true } },
      },
      orderBy: { join_date: 'desc' },
      skip, take: limit,
    }),
    prisma.user.count({ where }),
  ]);

  return { users, total, page, pages: Math.ceil(total / limit) };
}

// ── Kullanıcı detayı ──────────────────────────────────────
export async function getUserDetail(userId: number) {
  const user = await prisma.user.findUniqueOrThrow({
    where: { user_id: userId },
    select: {
      user_id: true, username: true, email: true, role: true,
      join_date: true, country: true,
      is_banned: true, is_restricted: true, ban_reason: true,
      _count: { select: { reviews: true, watchlistItems: true, followers: true, following: true } },
    },
  });

  const recentReviews = await prisma.review.findMany({
    where: { userId },
    include: { content: { select: { title: true, content_id: true } } },
    orderBy: { review_date: 'desc' },
    take: 10,
  });

  const watchlistStats = await prisma.$queryRawUnsafe<any[]>(`
    SELECT status, COUNT(*)::text as count
    FROM watchlist_entry WHERE user_id = ${userId}
    GROUP BY status
  `);

  const avgRating = await prisma.review.aggregate({
    where: { userId },
    _avg: { rating: true },
  });

  return { ...user, recentReviews, watchlistStats, avgRating: avgRating._avg.rating };
}

// ── Kullanıcı banla / ban kaldır ─────────────────────────
export async function banUser(userId: number, reason: string) {
  return prisma.$queryRawUnsafe(`
    UPDATE users SET is_banned = TRUE, ban_reason = '${reason.replace(/'/g, "''")}' 
    WHERE user_id = ${userId}
  `);
}

export async function unbanUser(userId: number) {
  return prisma.$queryRawUnsafe(`
    UPDATE users SET is_banned = FALSE, ban_reason = NULL 
    WHERE user_id = ${userId}
  `);
}

export async function restrictUser(userId: number) {
  return prisma.$queryRawUnsafe(`
    UPDATE users SET is_restricted = TRUE WHERE user_id = ${userId}
  `);
}

export async function unrestrictUser(userId: number) {
  return prisma.$queryRawUnsafe(`
    UPDATE users SET is_restricted = FALSE WHERE user_id = ${userId}
  `);
}

// ── İçerik analitiği ─────────────────────────────────────
export async function getContentAnalytics() {
  // Drop oranı (içerik bazlı)
  const dropRates = await prisma.$queryRawUnsafe<any[]>(`
    SELECT c.title, c.content_id,
           COUNT(we.entry_id)::text as total,
           COUNT(we.entry_id) FILTER (WHERE we.status = 'dropped')::text as dropped,
           COUNT(we.entry_id) FILTER (WHERE we.status = 'watched')::text as watched,
           ROUND(
             COUNT(we.entry_id) FILTER (WHERE we.status = 'dropped')::numeric /
             NULLIF(COUNT(we.entry_id), 0) * 100, 1
           )::text as drop_rate,
           ROUND(
             COUNT(we.entry_id) FILTER (WHERE we.status = 'watched')::numeric /
             NULLIF(COUNT(we.entry_id), 0) * 100, 1
           )::text as completion_rate
    FROM content c
    JOIN watchlist_entry we ON c.content_id = we.content_id
    GROUP BY c.content_id, c.title
    HAVING COUNT(we.entry_id) >= 2
    ORDER BY drop_rate DESC
    LIMIT 15
  `);

  // Türe göre ortalama puan ve izlenme
  const genreStats = await prisma.$queryRawUnsafe<any[]>(`
    SELECT g.genre_name,
           COUNT(DISTINCT we.entry_id)::text as watchlist_count,
           COUNT(DISTINCT r.review_id)::text as review_count,
           ROUND(AVG(r.rating)::numeric, 2)::text as avg_rating,
           COUNT(we.entry_id) FILTER (WHERE we.status = 'dropped')::text as dropped,
           ROUND(
             COUNT(we.entry_id) FILTER (WHERE we.status = 'dropped')::numeric /
             NULLIF(COUNT(we.entry_id), 0) * 100, 1
           )::text as drop_rate
    FROM genre g
    JOIN content_genre cg ON g.genre_id = cg.genre_id
    LEFT JOIN watchlist_entry we ON cg.content_id = we.content_id
    LEFT JOIN review r ON cg.content_id = r.content_id
    GROUP BY g.genre_name
    ORDER BY watchlist_count DESC
  `);

  // En çok watchlist'e alınanlar
  const mostWatchlisted = await prisma.$queryRawUnsafe<any[]>(`
    SELECT c.title, c.poster_url, c.content_id, c.content_type,
           COUNT(we.entry_id)::text as total,
           COUNT(we.entry_id) FILTER (WHERE we.status = 'watched')::text as watched,
           COUNT(we.entry_id) FILTER (WHERE we.status = 'plan_to_watch')::text as plan_to_watch,
           COUNT(we.entry_id) FILTER (WHERE we.status = 'dropped')::text as dropped,
           ROUND(AVG(r.rating)::numeric, 2)::text as avg_rating
    FROM content c
    JOIN watchlist_entry we ON c.content_id = we.content_id
    LEFT JOIN review r ON c.content_id = r.content_id
    GROUP BY c.content_id, c.title, c.poster_url, c.content_type
    ORDER BY total DESC
    LIMIT 10
  `);

  // Watchlist → İzlendi dönüşüm oranı
  const conversionRate = await prisma.$queryRawUnsafe<any[]>(`
    SELECT 
      COUNT(*)::text as total_watchlisted,
      COUNT(*) FILTER (WHERE status = 'watched')::text as converted,
      COUNT(*) FILTER (WHERE status = 'dropped')::text as dropped,
      COUNT(*) FILTER (WHERE status = 'watching')::text as watching,
      COUNT(*) FILTER (WHERE status = 'plan_to_watch')::text as pending,
      ROUND(
        COUNT(*) FILTER (WHERE status = 'watched')::numeric / 
        NULLIF(COUNT(*), 0) * 100, 1
      )::text as conversion_rate
    FROM watchlist_entry
  `);

  // Aylık büyüme
  const monthlyGrowth = await prisma.$queryRawUnsafe<any[]>(`
    SELECT 
      TO_CHAR(DATE_TRUNC('month', join_date), 'YYYY-MM') as month,
      COUNT(*)::text as new_users
    FROM users
    WHERE join_date >= NOW() - INTERVAL '12 months'
    GROUP BY DATE_TRUNC('month', join_date)
    ORDER BY month ASC
  `);

  // En aktif kullanıcılar
  const topUsers = await prisma.$queryRawUnsafe<any[]>(`
    SELECT u.username, u.user_id,
           COUNT(DISTINCT r.review_id)::text as review_count,
           COUNT(DISTINCT we.entry_id)::text as watchlist_count,
           ROUND(AVG(r.rating)::numeric, 2)::text as avg_rating
    FROM users u
    LEFT JOIN review r ON u.user_id = r.user_id
    LEFT JOIN watchlist_entry we ON u.user_id = we.user_id
    GROUP BY u.user_id, u.username
    ORDER BY review_count DESC
    LIMIT 10
  `);

  return { dropRates, genreStats, mostWatchlisted, conversionRate: conversionRate[0], monthlyGrowth, topUsers };
}