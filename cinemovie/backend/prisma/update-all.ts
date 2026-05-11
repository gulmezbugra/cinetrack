import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const TMDB_KEY = 'ac359e6f868c492ae00a28ec28f8761a';
const IMG = 'https://image.tmdb.org/t/p/w500';

async function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)); }
async function fetchTmdb(url: string) { const r = await fetch(url); return r.json() as Promise<any>; }

async function main() {
  const contents = await prisma.content.findMany({
    where: { imdb_id: { not: null } },
    select: { content_id: true, title: true, imdb_id: true, contentType: true },
  });
  console.log(`\n🎬 ${contents.length} içerik bulundu.\n`);

  for (const c of contents) {
    console.log(`\n→ ${c.title}`);
    try {
      // 1. TMDB ID bul
      const findData = await fetchTmdb(`https://api.themoviedb.org/3/find/${c.imdb_id}?api_key=${TMDB_KEY}&external_source=imdb_id`);
      const isMovie = findData.movie_results?.length > 0;
      const tmdbItem = isMovie ? findData.movie_results[0] : findData.tv_results?.[0];
      if (!tmdbItem) { console.log('  ✗ Bulunamadı'); continue; }

      const type = isMovie ? 'movie' : 'tv';
      const detail = await fetchTmdb(`https://api.themoviedb.org/3/${type}/${tmdbItem.id}?api_key=${TMDB_KEY}&language=tr-TR`);
      const credits = await fetchTmdb(`https://api.themoviedb.org/3/${type}/${tmdbItem.id}/credits?api_key=${TMDB_KEY}`);

      // 2. Content güncelle
      await prisma.$queryRawUnsafe(`
        UPDATE content SET
          poster_url = ${detail.poster_path ? `'${IMG}${detail.poster_path}'` : 'poster_url'},
          synopsis = ${detail.overview ? `'${detail.overview.replace(/'/g, "''")}'` : 'synopsis'},
          duration_min = ${isMovie && detail.runtime ? detail.runtime : 'duration_min'}
        WHERE content_id = ${c.content_id}
      `);
      console.log('  ✓ Temel bilgiler');

      // 3. Yönetmenler
      const directors = isMovie
        ? (credits.crew || []).filter((p: any) => p.job === 'Director').slice(0, 2)
        : (credits.crew || []).filter((p: any) => p.department === 'Directing').slice(0, 1);

      for (const dir of directors) {
        if (!dir.name) continue;
        const name = dir.name.replace(/'/g, "''");
        const photoUrl = dir.profile_path ? `'${IMG}${dir.profile_path}'` : 'NULL';
	await prisma.$queryRawUnsafe(`
  		INSERT INTO person (full_name, photo_url) VALUES ('${name}', ${photoUrl})
 	 	ON CONFLICT DO NOTHING
	`);
	await prisma.$queryRawUnsafe(`
  		UPDATE person SET photo_url = ${photoUrl} WHERE full_name = '${name}' AND photo_url IS NULL
	`);
        const personRow = await prisma.$queryRawUnsafe<any[]>(`SELECT person_id FROM person WHERE full_name = '${name}' LIMIT 1`);
        if (personRow[0]) {
          await prisma.$queryRawUnsafe(`
            INSERT INTO content_person (content_id, person_id, role)
            VALUES (${c.content_id}, ${personRow[0].person_id}, 'director')
            ON CONFLICT DO NOTHING
          `);
        }
      }
      console.log(`  ✓ ${directors.length} yönetmen`);

      // 4. Oyuncular (ilk 6)
      const actors = (credits.cast || []).slice(0, 6);
      for (const actor of actors) {
        if (!actor.name) continue;
        const name = actor.name.replace(/'/g, "''");
        const photoUrl = actor.profile_path ? `'${IMG}${actor.profile_path}'` : 'NULL';
		await prisma.$queryRawUnsafe(`
  		INSERT INTO person (full_name, photo_url) VALUES ('${name}', ${photoUrl})
  		ON CONFLICT DO NOTHING
		`);
		await prisma.$queryRawUnsafe(`
  		UPDATE person SET photo_url = ${photoUrl} WHERE full_name = '${name}' AND photo_url IS NULL
	`);
        const personRow = await prisma.$queryRawUnsafe<any[]>(`SELECT person_id FROM person WHERE full_name = '${name}' LIMIT 1`);
        if (personRow[0]) {
          await prisma.$queryRawUnsafe(`
            INSERT INTO content_person (content_id, person_id, role)
            VALUES (${c.content_id}, ${personRow[0].person_id}, 'actor')
            ON CONFLICT DO NOTHING
          `);
        }
      }
      console.log(`  ✓ ${actors.length} oyuncu`);

      // 5. Sezonlar
      if (!isMovie && detail.seasons) {
        for (const s of detail.seasons) {
          if (s.season_number === 0) continue;
          const year = s.air_date ? parseInt(s.air_date.slice(0, 4)) : 'NULL';
          await prisma.$queryRawUnsafe(`
            INSERT INTO season (content_id, season_number, episode_count, release_year)
            VALUES (${c.content_id}, ${s.season_number}, ${s.episode_count || 0}, ${year})
            ON CONFLICT (content_id, season_number)
            DO UPDATE SET episode_count = ${s.episode_count || 0}
          `);
        }
        console.log(`  ✓ ${detail.seasons.filter((s: any) => s.season_number > 0).length} sezon`);
      }

      // 6. Türler
      if (detail.genres?.length > 0) {
        for (const g of detail.genres) {
          const gname = g.name.replace(/'/g, "''");
          await prisma.$queryRawUnsafe(`INSERT INTO genre (genre_name) VALUES ('${gname}') ON CONFLICT (genre_name) DO NOTHING`);
          const genreRow = await prisma.$queryRawUnsafe<any[]>(`SELECT genre_id FROM genre WHERE genre_name = '${gname}' LIMIT 1`);
          if (genreRow[0]) {
            await prisma.$queryRawUnsafe(`
              INSERT INTO content_genre (content_id, genre_id)
              VALUES (${c.content_id}, ${genreRow[0].genre_id})
              ON CONFLICT DO NOTHING
            `);
          }
        }
        console.log(`  ✓ ${detail.genres.length} tür`);
      }

    } catch (err: any) {
      console.log(`  ✗ Hata: ${err.message}`);
    }
    await sleep(500);
  }
  console.log('\n✅ Tamamlandı!\n');
}

main().catch(console.error).finally(() => prisma.$disconnect());