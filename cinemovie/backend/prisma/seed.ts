import { PrismaClient, ContentType, ContentStatus, PersonRole, WatchStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Users
  const hash = await bcrypt.hash('password123', 10);
  const alice = await prisma.user.upsert({
    where: { email: 'alice@example.com' },
    update: {},
    create: { username: 'alice', email: 'alice@example.com', passwordHash: hash, bio: 'Film lover' },
  });
  const bob = await prisma.user.upsert({
    where: { email: 'bob@example.com' },
    update: {},
    create: { username: 'bob', email: 'bob@example.com', passwordHash: hash },
  });

  // Follow
  await prisma.follow.upsert({
    where: { followerId_followeeId: { followerId: alice.id, followeeId: bob.id } },
    update: {},
    create: { followerId: alice.id, followeeId: bob.id },
  });

  // Genres
  const drama = await prisma.genre.upsert({ where: { name: 'Drama' }, update: {}, create: { name: 'Drama' } });
  const thriller = await prisma.genre.upsert({ where: { name: 'Thriller' }, update: {}, create: { name: 'Thriller' } });
  const scifi = await prisma.genre.upsert({ where: { name: 'Sci-Fi' }, update: {}, create: { name: 'Sci-Fi' } });
  const crime = await prisma.genre.upsert({ where: { name: 'Crime' }, update: {}, create: { name: 'Crime' } });

  // Persons
  const vince = await prisma.person.create({ data: { name: 'Vince Gilligan', birthDate: new Date('1967-02-10') } });
  const bryan = await prisma.person.create({ data: { name: 'Bryan Cranston', birthDate: new Date('1956-03-07') } });
  const nolan = await prisma.person.create({ data: { name: 'Christopher Nolan', birthDate: new Date('1970-07-30') } });
  const matthew = await prisma.person.create({ data: { name: 'Matthew McConaughey', birthDate: new Date('1969-11-04') } });

  // Content: Breaking Bad
  const bb = await prisma.content.create({
    data: {
      title: 'Breaking Bad',
      contentType: ContentType.series,
      synopsis: 'A chemistry teacher turned drug lord.',
      releaseYear: 2008,
      totalSeasons: 5,
      status: ContentStatus.ENDED,
      coverUrl: 'https://m.media-amazon.com/images/M/MV5BMjhiMzgxZTctNDc1Ni00OTIxLTlhMTYtZTA3ZWFkODRkNmE2XkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_.jpg',
      genres: { create: [{ genreId: drama.id }, { genreId: crime.id }] },
      persons: { create: [{ personId: vince.id, role: PersonRole.director }, { personId: bryan.id, role: PersonRole.actor }] },
      seasons: { create: [{ seasonNumber: 1, episodeCount: 7, releaseYear: 2008 }, { seasonNumber: 2, episodeCount: 13, releaseYear: 2009 }, { seasonNumber: 5, episodeCount: 16, releaseYear: 2012 }] },
      awards: { create: [{ name: 'Emmy Award', category: 'Outstanding Drama Series', year: 2013, won: true }] },
    },
  });

  // Content: Interstellar
  const interstellar = await prisma.content.create({
    data: {
      title: 'Interstellar',
      contentType: ContentType.film,
      synopsis: 'A team of explorers travel through a wormhole in space.',
      releaseYear: 2014,
      status: ContentStatus.ENDED,
      coverUrl: 'https://m.media-amazon.com/images/M/MV5BZjdkOTU3MDktN2IxOS00OGEyLWFmMjktY2FiMmZkNWIyODZiXkEyXkFqcGdeQXVyMTMxODk2OTU@._V1_.jpg',
      genres: { create: [{ genreId: scifi.id }, { genreId: drama.id }] },
      persons: { create: [{ personId: nolan.id, role: PersonRole.director }, { personId: matthew.id, role: PersonRole.actor }] },
      awards: { create: [{ name: 'Academy Award', category: 'Best Visual Effects', year: 2015, won: true }] },
    },
  });

  // Watchlist entries
  await prisma.watchlistEntry.create({ data: { userId: alice.id, contentId: bb.id, status: WatchStatus.watching, episodeProgress: 23 } });
  await prisma.watchlistEntry.create({ data: { userId: alice.id, contentId: interstellar.id, status: WatchStatus.watched } });
  await prisma.watchlistEntry.create({ data: { userId: bob.id, contentId: bb.id, status: WatchStatus.watched } });

  // Reviews
  await prisma.review.create({ data: { userId: alice.id, contentId: interstellar.id, rating: 9.5, body: 'Mind-bending masterpiece.' } });
  await prisma.review.create({ data: { userId: bob.id, contentId: bb.id, rating: 10.0, body: 'Best TV show ever made.' } });

  // List
  const list = await prisma.list.create({ data: { userId: alice.id, title: 'Must Watch 2024', isPublic: true } });
  await prisma.listItem.create({ data: { listId: list.id, contentId: bb.id, position: 1 } });
  await prisma.listItem.create({ data: { listId: list.id, contentId: interstellar.id, position: 2 } });

  console.log('✅ Seed complete!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
