import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useFeed, useSearchUsers, useToggleLike, useAddComment, useToggleFollow } from '../../hooks/useApi';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';

function StarDisplay({ rating }: { rating: number }) {
  const filled = Math.round((rating / 10) * 5);
  return (
    <span style={{ color: '#f59e0b', fontSize: 13 }}>
      {'★'.repeat(filled)}{'☆'.repeat(5 - filled)}
      <span style={{ color: '#6b7280', fontSize: 11, marginLeft: 4 }}>{rating}/10</span>
    </span>
  );
}

function FeedCard({ item, dark, card, cardBorder, subtext, text }: any) {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const toggleLike = useToggleLike();
  const addComment = useAddComment();
  const inputBg = dark ? '#0d1117' : '#f8fafc';

  const handleComment = () => {
    if (!commentText.trim()) return;
    addComment.mutate({ reviewId: item.review_id, body: commentText });
    setCommentText('');
  };

  return (
    <div style={{ background: card, borderRadius: 14, border: `1px solid ${cardBorder}`, marginBottom: 16, overflow: 'hidden' }}>

      {/* Header — kullanıcı adına tıklanabilir */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px 10px' }}>
        <Link to={`/user/${item.user?.user_id}`} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
          <div style={{ width: 38, height: 38, borderRadius: '50%', background: '#7c3aed',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 15, fontWeight: 700, color: 'white', flexShrink: 0 }}>
            {item.user?.username?.[0]?.toUpperCase()}
          </div>
          <div>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: text }}>{item.user?.username}</p>
            <p style={{ margin: 0, fontSize: 12, color: subtext }}>
              {new Date(item.review_date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
        </Link>
        <StarDisplay rating={item.rating} />
      </div>

      {/* İçerik */}
      <Link to={`/title/${item.content?.content_id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
        <div style={{ display: 'flex', gap: 12, padding: '0 16px 12px', alignItems: 'flex-start' }}>
          {item.content?.poster_url ? (
            <img src={item.content.poster_url} alt={item.content.title}
              style={{ width: 56, height: 84, objectFit: 'cover', borderRadius: 8, flexShrink: 0 }} loading="lazy" />
          ) : (
            <div style={{ width: 56, height: 84, background: inputBg, borderRadius: 8,
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>🎬</div>
          )}
          <div style={{ flex: 1 }}>
            <p style={{ margin: '0 0 4px', fontSize: 15, fontWeight: 700, color: text }}>{item.content?.title}</p>
            <span style={{ fontSize: 11, background: dark ? '#21262d' : '#f1f5f9',
              color: subtext, padding: '2px 8px', borderRadius: 10 }}>
              {item.content?.contentType === 'film' ? 'Film' : 'Dizi'}
            </span>
            {item.comment && (
              <p style={{ margin: '8px 0 0', fontSize: 13, color: subtext, lineHeight: 1.5 }}>
                "{item.comment}"
              </p>
            )}
          </div>
        </div>
      </Link>

      {/* Aksiyon butonları */}
      <div style={{ display: 'flex', gap: 16, padding: '10px 16px', borderTop: `1px solid ${cardBorder}` }}>
        <button onClick={() => toggleLike.mutate(item.review_id)}
          style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'none',
            border: 'none', cursor: 'pointer', padding: 0, fontSize: 13,
            color: item.likedByMe ? '#ef4444' : subtext, fontWeight: item.likedByMe ? 600 : 400 }}>
          {item.likedByMe ? '❤️' : '🤍'} {item.likeCount}
        </button>
        <button onClick={() => setShowComments(s => !s)}
          style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'none',
            border: 'none', cursor: 'pointer', padding: 0, fontSize: 13, color: subtext }}>
          💬 {item.commentCount} yorum
        </button>
      </div>

      {/* Yorumlar */}
      {showComments && (
        <div style={{ padding: '0 16px 14px', borderTop: `1px solid ${cardBorder}` }}>
          {item.comments?.map((c: any) => (
            <div key={c.comment_id} style={{ display: 'flex', gap: 8, marginTop: 10, alignItems: 'flex-start' }}>
              <Link to={`/user/${c.user?.user_id}`} style={{ textDecoration: 'none' }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#374151',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 700, color: 'white', flexShrink: 0 }}>
                  {c.user?.username?.[0]?.toUpperCase()}
                </div>
              </Link>
              <div style={{ flex: 1, background: dark ? '#0d1117' : '#f8fafc', borderRadius: 8, padding: '6px 10px' }}>
                <p style={{ margin: '0 0 2px', fontSize: 12, fontWeight: 600, color: text }}>{c.user?.username}</p>
                <p style={{ margin: 0, fontSize: 13, color: subtext }}>{c.body}</p>
              </div>
            </div>
          ))}

          <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
            <input value={commentText} onChange={e => setCommentText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleComment()}
              placeholder="Yorum yaz..." maxLength={300}
              style={{ flex: 1, padding: '7px 12px', borderRadius: 8, border: `1px solid ${cardBorder}`,
                background: dark ? '#0d1117' : '#f8fafc', color: text, fontSize: 13, outline: 'none' }} />
            <button onClick={handleComment} disabled={!commentText.trim()}
              style={{ padding: '7px 14px', borderRadius: 8, background: '#7c3aed',
                color: 'white', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
              Gönder
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Social() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const dark = theme === 'dark';
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'feed' | 'discover'>('feed');

  const { data: feed, isLoading: feedLoading } = useFeed(page);
  const { data: searchResults } = useSearchUsers(searchQuery);
  const toggleFollow = useToggleFollow();

  const card = dark ? '#161b22' : '#ffffff';
  const cardBorder = dark ? '#30363d' : '#e2e8f0';
  const subtext = dark ? '#8b949e' : '#64748b';
  const text = dark ? '#f1f5f9' : '#0f172a';
  const inputBg = dark ? '#0d1117' : '#f8fafc';

  if (!user) {
    return (
      <div style={{ textAlign: 'center', padding: 80 }}>
        <p style={{ fontSize: 48, marginBottom: 16 }}>👥</p>
        <h2 style={{ color: text, marginBottom: 8 }}>Sosyal akışı görmek için giriş yap</h2>
        <Link to="/login" style={{ color: '#7c3aed', fontWeight: 600 }}>Giriş Yap →</Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 680, margin: '0 auto' }}>

      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: text, margin: '0 0 4px' }}>👥 Sosyal</h1>
        <p style={{ color: subtext, fontSize: 14, margin: 0 }}>
          Takip ettiklerinin aktiviteleri ve yeni kullanıcılar keşfet
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, background: inputBg, padding: 4,
        borderRadius: 12, border: `1px solid ${cardBorder}`, marginBottom: 20 }}>
        {[['feed', '📰 Akış'], ['discover', '🔍 Kullanıcı Keşfet']].map(([val, label]) => (
          <button key={val} onClick={() => setActiveTab(val as any)}
            style={{ flex: 1, padding: '8px 0', borderRadius: 9, border: 'none', cursor: 'pointer',
              fontSize: 14, fontWeight: activeTab === val ? 600 : 400,
              background: activeTab === val ? '#7c3aed' : 'transparent',
              color: activeTab === val ? 'white' : subtext }}>
            {label}
          </button>
        ))}
      </div>

      {/* Feed */}
      {activeTab === 'feed' && (
        <div>
          {feedLoading && <p style={{ color: subtext, textAlign: 'center', padding: 40 }}>Yükleniyor...</p>}

          {!feedLoading && (!feed?.items || feed.items.length === 0) && (
            <div style={{ textAlign: 'center', padding: 60, background: card,
              borderRadius: 14, border: `1px solid ${cardBorder}` }}>
              <p style={{ fontSize: 48, marginBottom: 12 }}>👥</p>
              <p style={{ color: text, fontWeight: 600, marginBottom: 8 }}>Akışın boş</p>
              <p style={{ color: subtext, fontSize: 14, marginBottom: 16 }}>
                Kullanıcıları takip et, aktivitelerini buradan gör
              </p>
              <button onClick={() => setActiveTab('discover')}
                style={{ background: '#7c3aed', color: 'white', border: 'none',
                  borderRadius: 8, padding: '8px 20px', cursor: 'pointer', fontWeight: 600 }}>
                Kullanıcı Keşfet →
              </button>
            </div>
          )}

          {feed?.items?.map((item: any) => (
            <FeedCard key={item.review_id} item={item} dark={dark}
              card={card} cardBorder={cardBorder} subtext={subtext} text={text} />
          ))}

          {feed && feed.pages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 16 }}>
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                style={{ padding: '8px 16px', borderRadius: 8, border: `1px solid ${cardBorder}`,
                  background: card, color: text, cursor: 'pointer', opacity: page === 1 ? 0.4 : 1 }}>
                ← Önceki
              </button>
              <span style={{ padding: '8px 16px', color: subtext }}>{page} / {feed.pages}</span>
              <button onClick={() => setPage(p => Math.min(feed.pages, p + 1))} disabled={page === feed.pages}
                style={{ padding: '8px 16px', borderRadius: 8, border: `1px solid ${cardBorder}`,
                  background: card, color: text, cursor: 'pointer', opacity: page === feed.pages ? 0.4 : 1 }}>
                Sonraki →
              </button>
            </div>
          )}
        </div>
      )}

      {/* Discover */}
      {activeTab === 'discover' && (
        <div>
          <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            placeholder="Kullanıcı adı ara..."
            style={{ width: '100%', padding: '12px 16px', borderRadius: 12, fontSize: 14,
              border: `1px solid ${cardBorder}`, background: inputBg, color: text,
              outline: 'none', boxSizing: 'border-box' as const, marginBottom: 16 }} />

          {searchQuery.length > 1 && searchResults && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {searchResults.length === 0 && (
                <p style={{ color: subtext, textAlign: 'center', padding: 20 }}>Kullanıcı bulunamadı.</p>
              )}
              {searchResults.map((u: any) => (
                <div key={u.user_id}
                  style={{ display: 'flex', alignItems: 'center', gap: 12, background: card,
                    borderRadius: 12, border: `1px solid ${cardBorder}`, padding: '12px 16px' }}>

                  {/* Tıklanabilir profil linki */}
                  <Link to={`/user/${u.user_id}`}
                    style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
                    <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#7c3aed',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 18, fontWeight: 700, color: 'white', flexShrink: 0 }}>
                      {u.username[0].toUpperCase()}
                    </div>
                    <div>
                      <p style={{ margin: '0 0 2px', fontSize: 15, fontWeight: 600, color: text }}>
                        {u.username}
                      </p>
                      <p style={{ margin: 0, fontSize: 12, color: subtext }}>
                        {u._count?.followers} takipçi · {u._count?.reviews} inceleme
                      </p>
                    </div>
                  </Link>

                  <button onClick={() => toggleFollow.mutate(u.user_id)}
                    style={{ padding: '7px 16px', borderRadius: 20, border: 'none', cursor: 'pointer',
                      fontSize: 13, fontWeight: 600, flexShrink: 0,
                      background: u.isFollowing ? (dark ? '#21262d' : '#f1f5f9') : '#7c3aed',
                      color: u.isFollowing ? text : 'white' }}>
                    {u.isFollowing ? '✓ Takip Ediliyor' : '+ Takip Et'}
                  </button>
                </div>
              ))}
            </div>
          )}

          {searchQuery.length <= 1 && (
            <div style={{ textAlign: 'center', padding: 40, color: subtext }}>
              <p style={{ fontSize: 32, marginBottom: 12 }}>🔍</p>
              <p>Kullanıcı aramak için en az 2 karakter gir</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}