import React, { useState } from 'react';
import { useContent, useGenres } from '../../hooks/useApi';
import { ContentCard, Spinner } from '../../components/ui';
import clsx from 'clsx';

export default function Discover() {
  const [search, setSearch] = useState('');
  const [type, setType] = useState<'film' | 'series' | undefined>(undefined);
  const [genreId, setGenreId] = useState<number | undefined>(undefined);
  const [page, setPage] = useState(1);
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const { data: genres } = useGenres();
  const { data, isLoading } = useContent({ type, genreId, search: debouncedSearch, page });

  // Simple debounce
  const handleSearch = (val: string) => {
    setSearch(val);
    clearTimeout((window as any)._st);
    (window as any)._st = setTimeout(() => { setDebouncedSearch(val); setPage(1); }, 400);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Keşfet</h1>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="Film veya dizi ara..."
          value={search}
          onChange={e => handleSearch(e.target.value)}
          className="flex-1 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
        <div className="flex gap-2">
          {[undefined, 'film', 'series'].map(t => (
            <button
              key={String(t)}
              onClick={() => { setType(t as any); setPage(1); }}
              className={clsx(
                'px-4 py-2 rounded-xl text-sm font-medium transition-colors',
                type === t
                  ? 'bg-brand-600 text-white'
                  : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'
              )}
            >
              {t === undefined ? 'Tümü' : t === 'film' ? 'Film' : 'Dizi'}
            </button>
          ))}
        </div>
      </div>

      {/* Genre pills */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => { setGenreId(undefined); setPage(1); }}
          className={clsx('px-3 py-1 rounded-full text-xs font-medium transition-colors',
            !genreId ? 'bg-brand-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200')}
        >
          Tüm Türler
        </button>
        {genres?.map(g => (
          <button
            key={g.genre_id}
            onClick={() => { setGenreId(g.genre_id); setPage(1); }}
            className={clsx('px-3 py-1 rounded-full text-xs font-medium transition-colors',
              genreId === g.genre_id ? 'bg-brand-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200')}
          >
            {g.genre_name}
          </button>
        ))}
      </div>

      {/* Grid */}
      {isLoading ? (
        <Spinner className="h-64" />
      ) : (
        <>
          <p className="text-sm text-gray-500">{data?.total ?? 0} sonuç</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {data?.items.map(c => <ContentCard key={c.id} content={c} />)}
          </div>

          {/* Pagination */}
          {data && data.pages > 1 && (
            <div className="flex justify-center gap-2 pt-4">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 disabled:opacity-40"
              >
                ← Önceki
              </button>
              <span className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">
                {page} / {data.pages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(data.pages, p + 1))}
                disabled={page === data.pages}
                className="px-4 py-2 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 disabled:opacity-40"
              >
                Sonraki →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
