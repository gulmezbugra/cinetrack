import React from 'react';
import { WatchStatus, ContentCard as ContentCardType } from '../../types';
import { useUpsertWatchlist } from '../../hooks/useApi';
import { Link } from 'react-router-dom';
import clsx from 'clsx';

// ─── Spinner ────────────────────────────────────────────────
export function Spinner({ className }: { className?: string }) {
  return (
    <div className={clsx('flex items-center justify-center', className)}>
      <div className="w-8 h-8 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
    </div>
  );
}

// ─── Rating Stars ───────────────────────────────────────────
export function RatingStars({
  rating,
  max = 10,
  onChange,
}: {
  rating: number | null;
  max?: number;
  onChange?: (r: number) => void;
}) {
  const stars = 5;
  const filled = rating ? Math.round((rating / max) * stars) : 0;

  return (
    <div className="flex gap-0.5" title={rating ? `${rating}/10` : 'Not rated'}>
      {Array.from({ length: stars }).map((_, i) => (
        <button
          key={i}
          type="button"
          onClick={() => onChange?.(Math.round(((i + 1) / stars) * max))}
          className={clsx(
            'text-xl transition-colors',
            i < filled ? 'text-amber-400' : 'text-gray-300 dark:text-gray-600',
            onChange && 'cursor-pointer hover:text-amber-300'
          )}
        >
          ★
        </button>
      ))}
      {rating && <span className="text-sm text-gray-500 ml-1 self-center">{rating}/10</span>}
    </div>
  );
}

// ─── Watch Status Button ─────────────────────────────────────
const STATUS_LABELS: Record<WatchStatus, string> = {
  watching: ' İzliyorum',
  watched: '✓ İzledim',
  dropped: '✕ Bıraktım',
  plan_to_watch: '+ İzleyeceğim',
};

const STATUS_COLORS: Record<WatchStatus, string> = {
  watching: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  watched: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  dropped: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  plan_to_watch: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
};

export function WatchStatusButton({
  contentId,
  currentStatus,
}: {
  contentId: number;
  currentStatus?: WatchStatus | null;
}) {
  const upsert = useUpsertWatchlist();
  const statuses: WatchStatus[] = ['plan_to_watch', 'watching', 'watched', 'dropped'];

  return (
    <div className="flex flex-wrap gap-1">
      {statuses.map((s) => (
        <button
          key={s}
          onClick={() => upsert.mutate({ contentId, status: s })}
          className={clsx(
            'px-3 py-1 rounded-full text-xs font-medium transition-all',
            currentStatus === s
              ? STATUS_COLORS[s]
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400'
          )}
        >
          {STATUS_LABELS[s]}
        </button>
      ))}
    </div>
  );
}

// ─── Content Card ───────────────────────────────────────────
export function ContentCard({ content }: { content: ContentCardType }) {
  return (
    <Link
      to={`/title/${content.content_id}`}
      className="group block bg-white dark:bg-gray-900 rounded-xl overflow-hidden border border-gray-100 dark:border-gray-800 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
    >
      <div className="aspect-[2/3] overflow-hidden bg-gray-100 dark:bg-gray-800">
        {(content.poster_url || content.coverUrl) ? (
  	    <img src={content.poster_url || content.coverUrl}
            alt={content.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl text-gray-300">🎬</div>
        )}
      </div>
      <div className="p-3">
        <p className="text-xs text-brand-600 font-medium uppercase tracking-wide mb-0.5">
          {content.contentType === 'film' ? 'Film' : 'Dizi'} · {content.releaseYear}
        </p>
        <h3 className="font-semibold text-sm text-gray-900 dark:text-white line-clamp-2 leading-tight">
          {content.title}
        </h3>
        <div className="flex flex-wrap gap-1 mt-2">
          {content.genres.slice(0, 2).map(({ genre }) => (
            <span key={genre.id} className="text-xs px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded">
              {genre.name}
            </span>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-1">{content._count.reviews} yorum</p>
      </div>
    </Link>
  );
}

// ─── Badge ──────────────────────────────────────────────────
export function Badge({ children, color = 'gray' }: { children: React.ReactNode; color?: 'gray' | 'green' | 'amber' | 'red' | 'blue' }) {
  const colors = {
    gray: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
    green: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    amber: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
    red: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    blue: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  };
  return <span className={clsx('px-2 py-0.5 rounded text-xs font-medium', colors[color])}>{children}</span>;
}
