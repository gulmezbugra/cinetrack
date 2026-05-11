import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const TMDB_KEY = 'ac359e6f868c492ae00a28ec28f8761a';
const TMDB_IMG = 'https://image.tmdb.org/t/p/w500';

async function fetchPoster(imdbId: string): Promise<string | null> {
  try {
    const res = await fetch(`https://api.themoviedb.org/3/find/${imdbId}?api_key=${TMDB_KEY}&external_source=imdb_id`);
    const data = await res.json() as any;
    const result = data.movie_results?.[0] || data.tv_results?.[0];
    if (result?.poster_path) return TMDB_IMG + result.poster_path;
    return null;
  } catch { return null; }
}

async function main() {
  const contents = await prisma.content.findMany({
    where: { imdb_id: { not: null } },
    select: { content_id: true, title: true, imdb_id: true },
  });

  console.log(`${contents.length} içerik bulundu, posterler güncelleniyor...`);

  for (const c of contents) {
    const url = await fetchPoster(c.imdb_id!);
    if (url) {
      await prisma.content.update({
        where: { content_id: c.content_id },
        data: { poster_url: url },
      });
      console.log(`✅ ${c.title} → ${url}`);
    } else {
      console.log(`❌ ${c.title} → poster bulunamadı`);
    }
    await new Promise(r => setTimeout(r, 300));
  }

  console.log('🎬 Tamamlandı!');
}

main().catch(console.error).finally(() => prisma.$disconnect());