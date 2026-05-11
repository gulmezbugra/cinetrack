import { prisma } from '../../prisma/client';

export async function getUserWatchlist(userId: number, status?: string) {
  return prisma.watchlistEntry.findMany({
    where: { userId, ...(status && { status }) },
    include: {
      content: {
        select: {
          content_id: true, title: true, contentType: true,
          poster_url: true, releaseYear: true,
          genres: { include: { genre: true } },
        },
      },
    },
    orderBy: { added_date: 'desc' },
  });
}

export async function upsertWatchlistEntry(userId: number, contentId: number, status: string, episodeProgress?: number) {
  const content = await prisma.content.findUniqueOrThrow({
    where: { content_id: contentId }, select: { contentType: true },
  });
  if (episodeProgress !== undefined && content.contentType === 'film') {
    throw new Error('episode_progress is not valid for films');
  }
  return prisma.watchlistEntry.upsert({
    where: { userId_contentId: { userId, contentId } },
    create: { userId, contentId, status, episodeProgress },
    update: { status, episodeProgress },
  });
}

export async function removeFromWatchlist(userId: number, contentId: number) {
  return prisma.watchlistEntry.delete({
    where: { userId_contentId: { userId, contentId } },
  });
}

export async function getWatchlistEntry(userId: number, contentId: number) {
  return prisma.watchlistEntry.findUnique({
    where: { userId_contentId: { userId, contentId } },
  });
}