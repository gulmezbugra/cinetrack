import { prisma } from '../../prisma/client';

export async function getFeed(userId: number, page = 1, limit = 20) {
  const skip = (page - 1) * limit;

  const following = await prisma.follow.findMany({
    where: { followerId: userId },
    select: { followeeId: true },
  });
  const followingIds = following.map(f => f.followeeId);

  if (followingIds.length === 0) return { items: [], total: 0, page, pages: 0 };

  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where: { userId: { in: followingIds } },
      include: {
        user: { select: { user_id: true, username: true } },
        content: { select: { content_id: true, title: true, poster_url: true, contentType: true } },
      },
      orderBy: { review_date: 'desc' },
      skip, take: limit,
    }),
    prisma.review.count({ where: { userId: { in: followingIds } } }),
  ]);

  // Like ve comment sayılarını ayrı sorgularla çek
  const reviewIds = reviews.map(r => r.review_id);

  let likeCounts: Record<number, number> = {};
  let commentData: Record<number, any[]> = {};

  try {
    const likes = await prisma.$queryRawUnsafe<{ review_id: number; count: string }[]>(`
      SELECT review_id, COUNT(*)::text as count 
      FROM review_like 
      WHERE review_id = ANY(ARRAY[${reviewIds.join(',')}])
      GROUP BY review_id
    `);
    likes.forEach(l => { likeCounts[Number(l.review_id)] = Number(l.count); });

    const comments = await prisma.$queryRawUnsafe<any[]>(`
      SELECT rc.*, u.username 
      FROM review_comment rc
      JOIN users u ON rc.user_id = u.user_id
      WHERE rc.review_id = ANY(ARRAY[${reviewIds.join(',')}])
      ORDER BY rc.created_at ASC
    `);
    comments.forEach(c => {
      if (!commentData[c.review_id]) commentData[c.review_id] = [];
      commentData[c.review_id].push(c);
    });
  } catch (e) {
    // Tablolar henüz yoksa boş devam et
    console.log('Like/comment tables not ready yet');
  }

  // Kullanıcının beğenilerini kontrol et
  let myLikes: Set<number> = new Set();
  try {
    const myLikeData = await prisma.$queryRawUnsafe<{ review_id: number }[]>(`
      SELECT review_id FROM review_like WHERE user_id = ${userId}
      AND review_id = ANY(ARRAY[${reviewIds.length > 0 ? reviewIds.join(',') : '0'}])
    `);
    myLikes = new Set(myLikeData.map(l => Number(l.review_id)));
  } catch (e) {}

  return {
    items: reviews.map(r => ({
      ...r,
      likeCount: likeCounts[r.review_id] ?? 0,
      likedByMe: myLikes.has(r.review_id),
      commentCount: commentData[r.review_id]?.length ?? 0,
      comments: commentData[r.review_id] ?? [],
    })),
    total, page, pages: Math.ceil(total / limit),
  };
}

export async function toggleLike(userId: number, reviewId: number) {
  try {
    const existing = await prisma.$queryRawUnsafe<any[]>(`
      SELECT 1 FROM review_like WHERE user_id = ${userId} AND review_id = ${reviewId}
    `);
    if (existing.length > 0) {
      await prisma.$queryRawUnsafe(`DELETE FROM review_like WHERE user_id = ${userId} AND review_id = ${reviewId}`);
      return { liked: false };
    } else {
      await prisma.$queryRawUnsafe(`INSERT INTO review_like (user_id, review_id) VALUES (${userId}, ${reviewId})`);
      return { liked: true };
    }
  } catch (e) {
    throw new Error('Like table not found. Run the SQL migration first.');
  }
}

export async function addComment(userId: number, reviewId: number, body: string) {
  try {
    const result = await prisma.$queryRawUnsafe<any[]>(`
      INSERT INTO review_comment (user_id, review_id, body)
      VALUES (${userId}, ${reviewId}, $1)
      RETURNING *
    `, body);
    return result[0];
  } catch (e) {
    throw new Error('Comment table not found. Run the SQL migration first.');
  }
}

export async function deleteComment(userId: number, commentId: number) {
  const result = await prisma.$queryRawUnsafe<any[]>(`
    SELECT user_id FROM review_comment WHERE comment_id = ${commentId}
  `);
  if (!result[0] || result[0].user_id !== userId) throw new Error('Unauthorized');
  await prisma.$queryRawUnsafe(`DELETE FROM review_comment WHERE comment_id = ${commentId}`);
  return { success: true };
}

export async function searchUsers(query: string, currentUserId: number) {
  const users = await prisma.user.findMany({
    where: {
      username: { contains: query, mode: 'insensitive' },
      user_id: { not: currentUserId },
    },
    select: {
      user_id: true, username: true, profile_picture: true,
      _count: { select: { followers: true, reviews: true } },
    },
    take: 10,
  });

  const following = await prisma.follow.findMany({
    where: { followerId: currentUserId, followeeId: { in: users.map(u => u.user_id) } },
    select: { followeeId: true },
  });
  const followingSet = new Set(following.map(f => f.followeeId));

  return users.map(u => ({ ...u, isFollowing: followingSet.has(u.user_id) }));
}

export async function getUserProfile(targetId: number, currentUserId: number) {
  const user = await prisma.user.findUniqueOrThrow({
    where: { user_id: targetId },
    select: {
      user_id: true, username: true, profile_picture: true, country: true, join_date: true,
      _count: { select: { followers: true, following: true, reviews: true, watchlistItems: true } },
    },
  });

  const isFollowing = await prisma.follow.findUnique({
    where: { followerId_followeeId: { followerId: currentUserId, followeeId: targetId } },
  });

  const recentReviews = await prisma.review.findMany({
    where: { userId: targetId },
    include: { content: { select: { content_id: true, title: true, poster_url: true, contentType: true } } },
    orderBy: { review_date: 'desc' },
    take: 12,
  });

  return { ...user, isFollowing: !!isFollowing, recentReviews };
}