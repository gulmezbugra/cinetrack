import { prisma } from '../../prisma/client';

const contentCardSelect = {
  content_id: true, title: true, contentType: true, releaseYear: true,
  poster_url: true, imdb_id: true,
  genres: { include: { genre: { select: { genre_id: true, genre_name: true } } } },
  _count: { select: { reviews: true } },
};

export async function listContent(params: {
  type?: string; genreId?: number; search?: string; page?: number; limit?: number;
}) {
  const { type, genreId, search, page = 1, limit = 20 } = params;
  const skip = (page - 1) * limit;
  const where = {
    ...(type && { contentType: type }),
    ...(genreId && { genres: { some: { genreId } } }),
    ...(search && { title: { contains: search, mode: 'insensitive' as const } }),
  };
  const [items, total] = await Promise.all([
    prisma.content.findMany({ where, select: contentCardSelect, skip, take: limit, orderBy: { content_id: 'desc' } }),
    prisma.content.count({ where }),
  ]);
  return { items, total, page, pages: Math.ceil(total / limit) };
}

export async function getContentById(id: number) {
  const content = await prisma.content.findUniqueOrThrow({
    where: { content_id: id },
    include: {
      genres: { include: { genre: true } },
      persons: { include: { person: true } },
      seasons: { orderBy: { seasonNumber: 'asc' } },
      content_award: { include: { award: true } },
      reviews: {
        take: 5,
        orderBy: { review_date: 'desc' },
        include: { user: { select: { user_id: true, username: true } } },
      },
      _count: { select: { reviews: true } },
    },
  });
  const avg = await prisma.review.aggregate({
    where: { contentId: id },
    _avg: { rating: true },
  });
  return { ...content, averageRating: avg._avg.rating ? Number(avg._avg.rating) : null };
}

export async function listGenres() {
  return prisma.genre.findMany({ orderBy: { genre_name: 'asc' } });
}

export async function searchContent(query: string) {
  return prisma.content.findMany({
    where: { title: { contains: query, mode: 'insensitive' } },
    select: contentCardSelect,
    take: 10,
  });
}