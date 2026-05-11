import { prisma } from '../../prisma/client';

export async function getReviewsForContent(contentId: number, page = 1, limit = 10) {
  const skip = (page - 1) * limit;
  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where: { contentId },
      include: { user: { select: { user_id: true, username: true } } },
      orderBy: { review_date: 'desc' },
      skip, take: limit,
    }),
    prisma.review.count({ where: { contentId } }),
  ]);
  return { reviews, total, page, pages: Math.ceil(total / limit) };
}

export async function upsertReview(userId: number, contentId: number, rating: number, body?: string) {
  if (rating < 1 || rating > 10) throw new Error('Rating must be between 1 and 10');
  return prisma.review.upsert({
    where: { userId_contentId: { userId, contentId } },
    create: { userId, contentId, rating, comment: body },
    update: { rating, comment: body },
    include: { user: { select: { user_id: true, username: true } } },
  });
}

export async function deleteReview(userId: number, contentId: number) {
  return prisma.review.delete({ where: { userId_contentId: { userId, contentId } } });
}

export async function getUserReviews(userId: number) {
  return prisma.review.findMany({
    where: { userId },
    include: { content: { select: { content_id: true, title: true, poster_url: true, contentType: true } } },
    orderBy: { review_date: 'desc' },
  });
}