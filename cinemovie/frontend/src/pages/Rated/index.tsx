import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMyReviews } from '../../hooks/useApi';
import { useTheme } from '../../hooks/useTheme';
import { useAuth } from '../../hooks/useAuth';

const RATINGS = [10, 9, 8, 7, 6, 5, 4, 3, 2, 1];

function StarDisplay({ rating }: { rating: number }) {
  const filled = Math.round((rating / 10) * 5);
  return (
    <span style={{ color: '#f59e0b', fontSize: 14, letterSpacing: 1 }}>
      {'★'.repeat(filled)}{'☆'.repeat(5 - filled)}
      <span style={{ color: '#6b7280', fontSize: 12, marginLeft: 6 }}>{rating}/10</span>
    </span>
  );
}

export default function Rated() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const dark = theme === 'dark';
  const { data: reviews, isLoading } = useMyReviews();
  const [filter, setFilter] = useState<'all' | 'film' | 'series'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'rating'>('date');
  const [groupByRating, setGroupByRating] = useState(false);

  const card = dark ? '#161b22' : '#ffffff';
  const cardBorder = dark ? '#30363d' : '#e2e8f0';
  const subtext = dark ? '#8b949e' : '#64748b';
  const text = dark ? '#f1f5f9' : '#0f172a';
  const inputBg = dark ? '#0d1117' : '#f8fafc';

  if (!user) {
    return (
      <div style={{ textAlign: 'center', padding: 80 }}>
        <p style={{ fontSize: 48, marginBottom: 16 }}>⭐</p>
        <h2 style={{ color: text, marginBottom: 8 }}>Puanladıklarını görmek için giriş yap</h2>
        <Link to="/login" style={{ color: '#7c3aed', fontWeight: 600 }}>Giriş Yap →</Link>
      </div>
    );
  }

  const filtered = (reviews ?? []).filter((r: any) =>
    filter === 'all' ? true : r.content?.contentType === filter
  );

  const sorted = [...filtered].sort((a: any, b: any) =>
    sortBy === 'rating' ? b.rating - a.rating : new Date(b.review_date).getTime() - new Date(a.review_date).getTime()
  );

  // Group by rating (10, 9, 8...)
  const grouped = RATINGS.reduce((acc, r) => {
    const items = sorted.filter((rev: any) => rev.rating === r);
    if (items.length > 0) acc[r] = items;
    return acc;
  }, {} as Record<number, any[]>);

  const avgRating = filtered.length > 0
    ? (filtered.reduce((s: number, r: any) => s + r.rating, 0) / filtered.length).toFixed(1)
    : null;

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto' }}>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: text, margin: '0 0 4px' }}>
          ⭐ Puanladıklarım
        </h1>
        <p style={{ color: subtext, fontSize: 14, margin: 0 }}>
          {filtered.length} içerik puanlandı
          {avgRating && <span style={{ marginLeft: 12, color: '#f59e0b', fontWeight: 600 }}>Ortalama: ★ {avgRating}</span>}
        </p>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 24, alignItems: 'center' }}>
        {/* Tür filtresi */}
        <div style={{ display: 'flex', gap: 4, background: inputBg, padding: 4, borderRadius: 10, border: `1px solid ${cardBorder}` }}>
          {[['all', 'Tümü'], ['film', '🎬 Film'], ['series', '📺 Dizi']].map(([val, label]) => (
            <button key={val} onClick={() => setFilter(val as any)}
              style={{ padding: '5px 14px', borderRadius: 7, border: 'none', cursor: 'pointer', fontSize: 13,
                background: filter === val ? '#7c3aed' : 'transparent',
                color: filter === val ? 'white' : subtext, fontWeight: filter === val ? 600 : 400 }}>
              {label}
            </button>
          ))}
        </div>

        {/* Sıralama */}
        <div style={{ display: 'flex', gap: 4, background: inputBg, padding: 4, borderRadius: 10, border: `1px solid ${cardBorder}` }}>
          {[['date', '🕐 Tarihe göre'], ['rating', '⭐ Puana göre']].map(([val, label]) => (
            <button key={val} onClick={() => setSortBy(val as any)}
              style={{ padding: '5px 14px', borderRadius: 7, border: 'none', cursor: 'pointer', fontSize: 13,
                background: sortBy === val ? '#7c3aed' : 'transparent',
                color: sortBy === val ? 'white' : subtext, fontWeight: sortBy === val ? 600 : 400 }}>
              {label}
            </button>
          ))}
        </div>

        {/* Gruplama */}
        <button onClick={() => setGroupByRating(g => !g)}
          style={{ padding: '6px 14px', borderRadius: 10, border: `1px solid ${cardBorder}`,
            background: groupByRating ? '#7c3aed' : inputBg, color: groupByRating ? 'white' : subtext,
            cursor: 'pointer', fontSize: 13, fontWeight: groupByRating ? 600 : 400 }}>
          {groupByRating ? '✓ Gruplama açık' : 'Puana göre grupla'}
        </button>
      </div>

      {isLoading && <p style={{ color: subtext }}>Yükleniyor...</p>}

      {!isLoading && filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: 60 }}>
          <p style={{ fontSize: 48, marginBottom: 12 }}>⭐</p>
          <p style={{ color: subtext }}>Henüz hiç içerik puanlamadın.</p>
          <Link to="/discover" style={{ color: '#7c3aed', fontWeight: 600 }}>Keşfet →</Link>
        </div>
      )}

      {/* Gruplu görünüm */}
      {groupByRating && !isLoading && (
        <div>
          {RATINGS.map(r => grouped[r] ? (
            <div key={r} style={{ marginBottom: 32 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <span style={{ fontSize: 20, color: '#f59e0b', fontWeight: 700 }}>★ {r}</span>
                <span style={{ color: subtext, fontSize: 13 }}>{grouped[r].length} içerik</span>
                <div style={{ flex: 1, height: 1, background: cardBorder }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: 10 }}>
                {grouped[r].map((rev: any) => (
                  <Link key={rev.review_id} to={`/title/${rev.content?.content_id}`}
                    style={{ textDecoration: 'none', color: 'inherit' }}>
                    <div style={{ borderRadius: 8, overflow: 'hidden', border: `1px solid ${cardBorder}`,
                      background: card, transition: 'transform 0.15s' }}>
                      {rev.content?.poster_url ? (
                        <img src={rev.content.poster_url} alt={rev.content.title}
                          style={{ width: '100%', aspectRatio: '2/3', objectFit: 'cover', display: 'block' }} loading="lazy" />
                      ) : (
                        <div style={{ width: '100%', aspectRatio: '2/3', background: inputBg,
                          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>🎬</div>
                      )}
                      <div style={{ padding: '6px 8px' }}>
                        <p style={{ fontSize: 11, fontWeight: 600, color: text, margin: 0,
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {rev.content?.title}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ) : null)}
        </div>
      )}

      {/* Liste görünümü */}
      {!groupByRating && !isLoading && sorted.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {sorted.map((rev: any, i: number) => (
            <Link key={rev.review_id} to={`/title/${rev.content?.content_id}`}
              style={{ textDecoration: 'none', color: 'inherit' }}>
              <div style={{ display: 'flex', gap: 14, background: card, borderRadius: 12,
                border: `1px solid ${cardBorder}`, padding: 12, alignItems: 'flex-start',
                transition: 'border-color 0.2s' }}>

                {/* Sıra numarası */}
                <span style={{ fontSize: 13, color: subtext, width: 24, textAlign: 'right',
                  flexShrink: 0, paddingTop: 2 }}>
                  {i + 1}
                </span>

                {/* Poster */}
                <div style={{ flexShrink: 0 }}>
                  {rev.content?.poster_url ? (
                    <img src={rev.content.poster_url} alt={rev.content.title}
                      style={{ width: 52, height: 78, objectFit: 'cover', borderRadius: 6, display: 'block' }} loading="lazy" />
                  ) : (
                    <div style={{ width: 52, height: 78, background: inputBg, borderRadius: 6,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🎬</div>
                  )}
                </div>

                {/* Bilgi */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                    <div>
                      <h3 style={{ fontSize: 15, fontWeight: 700, color: text, margin: '0 0 3px',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {rev.content?.title}
                      </h3>
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                        <span style={{ fontSize: 11, background: dark ? '#21262d' : '#f1f5f9',
                          color: subtext, padding: '1px 8px', borderRadius: 10 }}>
                          {rev.content?.contentType === 'film' ? 'Film' : 'Dizi'}
                        </span>
                        <span style={{ fontSize: 11, color: subtext }}>
                          {new Date(rev.review_date).toLocaleDateString('tr-TR')}
                        </span>
                      </div>
                    </div>
                    <StarDisplay rating={rev.rating} />
                  </div>

                  {rev.comment && (
                    <p style={{ fontSize: 13, color: subtext, margin: '8px 0 0',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      "{rev.comment}"
                    </p>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}