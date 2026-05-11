import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useUserProfile, useToggleFollow } from '../../hooks/useApi';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';

export default function UserProfile() {
  const { userId } = useParams<{ userId: string }>();
  const { user } = useAuth();
  const { theme } = useTheme();
  const dark = theme === 'dark';
  const { data: profile, isLoading, refetch } = useUserProfile(Number(userId));
  const toggleFollow = useToggleFollow();
  const [activeTab, setActiveTab] = useState<'films' | 'reviews'>('films');

  const card = dark ? '#161b22' : '#ffffff';
  const cardBorder = dark ? '#30363d' : '#e2e8f0';
  const subtext = dark ? '#8b949e' : '#64748b';
  const text = dark ? '#f1f5f9' : '#0f172a';
  const inputBg = dark ? '#0d1117' : '#f8fafc';
  const pageBg = dark ? '#0d1117' : '#f8fafc';

  if (isLoading) return <div style={{ padding: 40, color: text }}>Yükleniyor...</div>;
  if (!profile) return <div style={{ padding: 40, color: text }}>Kullanıcı bulunamadı.</div>;

  const isOwnProfile = user?.id === profile.user_id;

  const handleFollow = () => {
    toggleFollow.mutate(profile.user_id, { onSuccess: () => refetch() });
  };

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>

      {/* Profile Header */}
      <div style={{ background: card, borderRadius: 16, border: `1px solid ${cardBorder}`,
        padding: '28px 32px', marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start', flexWrap: 'wrap' }}>

          {/* Avatar */}
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#7c3aed',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 32, fontWeight: 700, color: 'white', flexShrink: 0 }}>
            {profile.username[0].toUpperCase()}
          </div>

          {/* Info */}
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 6 }}>
              <h1 style={{ fontSize: 24, fontWeight: 700, color: text, margin: 0 }}>
                {profile.username}
              </h1>
              {profile.country && (
                <span style={{ fontSize: 13, color: subtext }}>📍 {profile.country}</span>
              )}
            </div>
            <p style={{ fontSize: 13, color: subtext, margin: '0 0 16px' }}>
              Üyelik: {new Date(profile.join_date).toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' })}
            </p>

            {/* Stats */}
            <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
              {[
                { label: 'Film', value: profile._count?.watchlistItems ?? 0 },
                { label: 'İnceleme', value: profile._count?.reviews ?? 0 },
                { label: 'Takipçi', value: profile._count?.followers ?? 0 },
                { label: 'Takip', value: profile._count?.following ?? 0 },
              ].map(stat => (
                <div key={stat.label} style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: 22, fontWeight: 700, color: text, margin: '0 0 2px' }}>
                    {stat.value}
                  </p>
                  <p style={{ fontSize: 12, color: subtext, margin: 0 }}>{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Follow button */}
          {!isOwnProfile && user && (
            <button onClick={handleFollow}
              style={{ padding: '9px 22px', borderRadius: 20, border: 'none', cursor: 'pointer',
                fontSize: 14, fontWeight: 600, flexShrink: 0,
                background: profile.isFollowing ? (dark ? '#21262d' : '#f1f5f9') : '#7c3aed',
                color: profile.isFollowing ? text : 'white',
                border: `1px solid ${profile.isFollowing ? cardBorder : '#7c3aed'}` as any }}>
              {profile.isFollowing ? '✓ Takip Ediliyor' : '+ Takip Et'}
            </button>
          )}
          {isOwnProfile && (
            <span style={{ fontSize: 13, color: subtext, padding: '9px 0' }}>Senin profilin</span>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, background: card, padding: 4,
        borderRadius: 12, border: `1px solid ${cardBorder}`, marginBottom: 20 }}>
        {[['films', '🎬 Son İzledikleri'], ['reviews', '⭐ İncelemeleri']].map(([val, label]) => (
          <button key={val} onClick={() => setActiveTab(val as any)}
            style={{ flex: 1, padding: '8px 0', borderRadius: 9, border: 'none', cursor: 'pointer',
              fontSize: 14, fontWeight: activeTab === val ? 600 : 400,
              background: activeTab === val ? '#7c3aed' : 'transparent',
              color: activeTab === val ? 'white' : subtext }}>
            {label}
          </button>
        ))}
      </div>

      {/* Films Grid */}
      {activeTab === 'films' && (
        <div>
          {profile.recentReviews?.length === 0 && (
            <p style={{ color: subtext, textAlign: 'center', padding: 40 }}>
              Henüz hiç içerik puanlanmamış.
            </p>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 12 }}>
            {profile.recentReviews?.map((rev: any) => (
              <Link key={rev.review_id} to={`/title/${rev.content?.content_id}`}
                style={{ textDecoration: 'none', color: 'inherit' }}>
                <div style={{ background: card, borderRadius: 10, overflow: 'hidden',
                  border: `1px solid ${cardBorder}` }}>
                  {rev.content?.poster_url ? (
                    <img src={rev.content.poster_url} alt={rev.content.title}
                      style={{ width: '100%', aspectRatio: '2/3', objectFit: 'cover', display: 'block' }}
                      loading="lazy" />
                  ) : (
                    <div style={{ width: '100%', aspectRatio: '2/3', background: inputBg,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>🎬</div>
                  )}
                  <div style={{ padding: '6px 8px' }}>
                    <p style={{ fontSize: 11, fontWeight: 600, color: text, margin: '0 0 2px',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {rev.content?.title}
                    </p>
                    <span style={{ color: '#f59e0b', fontSize: 12 }}>★ {rev.rating}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Reviews List */}
      {activeTab === 'reviews' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {profile.recentReviews?.length === 0 && (
            <p style={{ color: subtext, textAlign: 'center', padding: 40 }}>Henüz inceleme yok.</p>
          )}
          {profile.recentReviews?.map((rev: any) => (
            <Link key={rev.review_id} to={`/title/${rev.content?.content_id}`}
              style={{ textDecoration: 'none', color: 'inherit' }}>
              <div style={{ background: card, borderRadius: 12, border: `1px solid ${cardBorder}`,
                padding: 14, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                {rev.content?.poster_url ? (
                  <img src={rev.content.poster_url} alt={rev.content.title}
                    style={{ width: 48, height: 72, objectFit: 'cover', borderRadius: 6, flexShrink: 0 }} />
                ) : (
                  <div style={{ width: 48, height: 72, background: inputBg, borderRadius: 6,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>🎬</div>
                )}
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <p style={{ fontSize: 15, fontWeight: 700, color: text, margin: '0 0 4px' }}>
                      {rev.content?.title}
                    </p>
                    <span style={{ color: '#f59e0b', fontSize: 14, fontWeight: 600 }}>★ {rev.rating}/10</span>
                  </div>
                  <p style={{ fontSize: 12, color: subtext, margin: '0 0 6px' }}>
                    {new Date(rev.review_date).toLocaleDateString('tr-TR')}
                  </p>
                  {rev.comment && (
                    <p style={{ fontSize: 13, color: subtext, margin: 0, lineHeight: 1.5 }}>
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