import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useContentDetail, useWatchlistStatus, useUpsertWatchlist, useUpsertReview, useReviews, useTrailer, useSimilar, useTmdbDetails } from '../../hooks/useApi';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';

const STATUS_LABELS: Record<string, string> = {
  plan_to_watch: '+ İzleyeceğim',
  watching: '▶ İzliyorum',
  watched: '✓ İzledim',
  dropped: '✕ Bıraktım',
};

export default function TitleDetail() {
  const { id } = useParams<{ id: string }>();
  const contentId = Number(id);
  const { user } = useAuth();
  const { theme } = useTheme();
  const dark = theme === 'dark';

  const { data: content, isLoading, refetch } = useContentDetail(contentId);
  const { data: watchlistEntry, refetch: refetchWatchlist } = useWatchlistStatus(contentId);
  const { data: reviewsData, refetch: refetchReviews } = useReviews(contentId);
  const { data: trailerData } = useTrailer(contentId);
  const { data: similar } = useSimilar(contentId);
  const { data: tmdbDetails } = useTmdbDetails(contentId);
  const upsertWatchlist = useUpsertWatchlist();
  const upsertReview = useUpsertReview();
  const [reviewText, setReviewText] = useState('');
  const [rating, setRating] = useState<number | null>(null);
  const [showTrailer, setShowTrailer] = useState(false);

  const card = dark ? '#161b22' : '#ffffff';
  const cardBorder = dark ? '#30363d' : '#e2e8f0';
  const subtext = dark ? '#8b949e' : '#64748b';
  const text = dark ? '#f1f5f9' : '#0f172a';
  const inputBg = dark ? '#0d1117' : '#f8fafc';

  if (isLoading) return <div style={{padding:40, color:text}}>Yükleniyor...</div>;
  if (!content) return <div style={{padding:40, color:text}}>İçerik bulunamadı.</div>;

  const directors = content.persons?.filter((p: any) => p.role === 'director') ?? [];
  const actors = content.persons?.filter((p: any) => p.role === 'actor') ?? [];
  const reviews = reviewsData?.reviews ?? content.reviews ?? [];

  const handleWatchlistClick = (status: string) => {
    upsertWatchlist.mutate({ contentId, status: status as any }, { onSuccess: () => refetchWatchlist() });
  };

  const handleReviewSubmit = () => {
    if (!rating) return;
    upsertReview.mutate({ contentId, rating, body: reviewText }, {
      onSuccess: () => { setReviewText(''); setRating(null); refetch(); refetchReviews(); }
    });
  };

  return (
    <div style={{position:'relative'}}>

      {/* Backdrop */}
      {tmdbDetails?.backdrop_url && (
        <div style={{
          position:'fixed', top:0, left:0, right:0, bottom:0, zIndex:0,
          backgroundImage:`url(${tmdbDetails.backdrop_url})`,
          backgroundSize:'cover', backgroundPosition:'center',
          opacity: dark ? 0.07 : 0.04,
          pointerEvents:'none',
        }} />
      )}

      <div style={{position:'relative', zIndex:1, maxWidth:900, margin:'0 auto'}}>

        {/* Hero */}
        <div style={{display:'flex', gap:24, marginBottom:32, flexWrap:'wrap'}}>
          <div style={{flexShrink:0}}>
            {content.poster_url ? (
              <img src={content.poster_url} alt={content.title}
                style={{width:180, borderRadius:12, boxShadow:'0 8px 32px rgba(0,0,0,0.4)', display:'block'}} />
            ) : (
              <div style={{width:180, height:270, background:card, borderRadius:12,
                display:'flex', alignItems:'center', justifyContent:'center', fontSize:48}}>🎬</div>
            )}
          </div>

          <div style={{flex:1, minWidth:240}}>
            <div style={{display:'flex', gap:6, flexWrap:'wrap', marginBottom:8}}>
              <span style={{background:'#7c3aed', color:'white', padding:'2px 10px', borderRadius:20, fontSize:12, fontWeight:600}}>
                {content.contentType === 'film' ? 'Film' : 'Dizi'}
              </span>
              {content.releaseYear && (
                <span style={{background: dark ? '#21262d' : '#f1f5f9', color:subtext,
                  padding:'2px 10px', borderRadius:20, fontSize:12}}>
                  {content.releaseYear}
                </span>
              )}
            </div>

            <h1 style={{fontSize:32, fontWeight:700, margin:'0 0 8px', color:text}}>{content.title}</h1>

            {tmdbDetails?.tagline && (
              <p style={{fontSize:14, fontStyle:'italic', color:subtext, margin:'0 0 8px'}}>
                "{tmdbDetails.tagline}"
              </p>
            )}

            {content.averageRating && (
              <p style={{color:'#f59e0b', fontSize:16, margin:'0 0 8px', fontWeight:600}}>
                ★ {Number(content.averageRating).toFixed(1)} / 10
                <span style={{color:subtext, fontSize:13, fontWeight:400, marginLeft:8}}>
                  ({content._count?.reviews} yorum)
                </span>
              </p>
            )}

            <div style={{display:'flex', flexWrap:'wrap', gap:6, margin:'8px 0'}}>
              {content.genres?.map((g: any) => (
                <span key={g.genre?.genre_id}
                  style={{background: dark ? '#21262d' : '#f1f5f9', color:subtext,
                    padding:'4px 12px', borderRadius:20, fontSize:12, border:`1px solid ${cardBorder}`}}>
                  {g.genre?.genre_name}
                </span>
              ))}
            </div>

            {(tmdbDetails?.overview || content.synopsis) && (
              <p style={{color:subtext, lineHeight:1.7, fontSize:14, margin:'12px 0'}}>
                {tmdbDetails?.overview || content.synopsis}
              </p>
            )}

            {directors.length > 0 && (
              <p style={{fontSize:14, margin:'8px 0', color:text}}>
                <span style={{color:subtext}}>Yönetmen: </span>
                <strong>{directors.map((d: any) => d.person?.full_name).join(', ')}</strong>
              </p>
            )}

            {/* Fragman */}
            {trailerData?.trailerKey && (
              <button onClick={() => setShowTrailer(!showTrailer)}
                style={{display:'flex', alignItems:'center', gap:8, padding:'8px 20px',
                  background:'#dc2626', color:'white', border:'none', borderRadius:8,
                  cursor:'pointer', fontSize:14, fontWeight:600, marginTop:12}}>
                {showTrailer ? '✕ Kapat' : '▶ Fragmanı İzle'}
              </button>
            )}

            {/* Watchlist */}
            {user && (
              <div style={{marginTop:16}}>
                <p style={{fontSize:13, color:subtext, marginBottom:6}}>Listeye ekle:</p>
                <div style={{display:'flex', gap:8, flexWrap:'wrap'}}>
                  {Object.entries(STATUS_LABELS).map(([s, label]) => (
                    <button key={s} onClick={() => handleWatchlistClick(s)}
                      style={{padding:'6px 14px', borderRadius:20, fontSize:12, cursor:'pointer',
                        background: watchlistEntry?.status === s ? '#7c3aed' : (dark ? '#21262d' : '#f1f5f9'),
                        color: watchlistEntry?.status === s ? 'white' : text,
                        border:`1px solid ${watchlistEntry?.status === s ? '#7c3aed' : cardBorder}`,
                        fontWeight: watchlistEntry?.status === s ? 700 : 400}}>
                      {label}
                    </button>
                  ))}
                </div>
                {watchlistEntry && (
                  <p style={{fontSize:12, color:subtext, marginTop:6}}>
                    Durum: <strong style={{color:'#a78bfa'}}>{STATUS_LABELS[watchlistEntry.status]}</strong>
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Fragman player */}
        {showTrailer && trailerData?.trailerKey && (
          <div style={{marginBottom:32, borderRadius:12, overflow:'hidden', boxShadow:'0 8px 32px rgba(0,0,0,0.4)'}}>
            <iframe width="100%" height="420"
              src={`https://www.youtube.com/embed/${trailerData.trailerKey}?autoplay=1`}
              title="Fragman" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen style={{border:'none', display:'block'}} />
          </div>
        )}

        {/* TMDB Detaylar */}
        {tmdbDetails && (tmdbDetails.budget > 0 || tmdbDetails.production_companies?.length > 0) && (
          <div style={{background:card, borderRadius:12, padding:20, marginBottom:24, border:`1px solid ${cardBorder}`}}>
            <h2 style={{fontSize:16, fontWeight:600, marginBottom:16, color:text}}>Detaylar</h2>
            <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(180px, 1fr))', gap:16}}>
              {tmdbDetails.budget > 0 && (
                <div>
                  <p style={{fontSize:12, color:subtext, margin:'0 0 4px'}}>Bütçe</p>
                  <p style={{fontSize:14, fontWeight:600, margin:0, color:text}}>${tmdbDetails.budget.toLocaleString()}</p>
                </div>
              )}
              {tmdbDetails.revenue > 0 && (
                <div>
                  <p style={{fontSize:12, color:subtext, margin:'0 0 4px'}}>Hasılat</p>
                  <p style={{fontSize:14, fontWeight:600, margin:0, color:'#10b981'}}>${tmdbDetails.revenue.toLocaleString()}</p>
                </div>
              )}
              {tmdbDetails.budget > 0 && tmdbDetails.revenue > 0 && (
                <div>
                  <p style={{fontSize:12, color:subtext, margin:'0 0 4px'}}>Kâr</p>
                  <p style={{fontSize:14, fontWeight:600, margin:0,
                    color: tmdbDetails.revenue > tmdbDetails.budget ? '#10b981' : '#ef4444'}}>
                    ${(tmdbDetails.revenue - tmdbDetails.budget).toLocaleString()}
                  </p>
                </div>
              )}
              {tmdbDetails.production_companies?.length > 0 && (
                <div>
                  <p style={{fontSize:12, color:subtext, margin:'0 0 4px'}}>Yapımcı</p>
                  <p style={{fontSize:14, margin:0, color:text}}>{tmdbDetails.production_companies.join(', ')}</p>
                </div>
              )}
              {tmdbDetails.production_countries?.length > 0 && (
                <div>
                  <p style={{fontSize:12, color:subtext, margin:'0 0 4px'}}>Ülke</p>
                  <p style={{fontSize:14, margin:0, color:text}}>{tmdbDetails.production_countries.join(', ')}</p>
                </div>
              )}
              {tmdbDetails.networks?.length > 0 && (
                <div>
                  <p style={{fontSize:12, color:subtext, margin:'0 0 4px'}}>Platform</p>
                  <p style={{fontSize:14, margin:0, color:text}}>{tmdbDetails.networks.join(', ')}</p>
                </div>
              )}
              {tmdbDetails.spoken_languages?.length > 0 && (
                <div>
                  <p style={{fontSize:12, color:subtext, margin:'0 0 4px'}}>Dil</p>
                  <p style={{fontSize:14, margin:0, color:text}}>{tmdbDetails.spoken_languages.join(', ')}</p>
                </div>
              )}
              {tmdbDetails.status && (
                <div>
                  <p style={{fontSize:12, color:subtext, margin:'0 0 4px'}}>Durum</p>
                  <p style={{fontSize:14, margin:0, color:text}}>{tmdbDetails.status}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Oyuncular */}
        {actors.length > 0 && (
          <div style={{marginBottom:24}}>
            <h2 style={{fontSize:16, fontWeight:600, marginBottom:12, color:text}}>Oyuncular</h2>
            <div style={{display:'flex', flexWrap:'grid', gap:8}}>
              {actors.slice(0,8).map((a: any) => (
  <div key={a.person?.person_id}
    style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:6,
      width:90, cursor:'default' }}>
    {a.person?.photo_url ? (
      <img src={a.person.photo_url} alt={a.person.full_name}
        style={{ width:72, height:72, borderRadius:'50%', objectFit:'cover',
          border:`2px solid ${cardBorder}` }} loading="lazy" />
    ) : (
      <div style={{ width:72, height:72, borderRadius:'50%', background:'#7c3aed',
        display:'flex', alignItems:'center', justifyContent:'center',
        fontSize:24, fontWeight:700, color:'white', border:`2px solid ${cardBorder}` }}>
        {a.person?.full_name?.[0]?.toUpperCase()}
      </div>
    )}
    <p style={{ fontSize:11, color:text, margin:0, textAlign:'center',
      overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', width:'100%' }}>
      {a.person?.full_name}
    </p>
    <p style={{ fontSize:10, color:subtext, margin:0 }}>
      {a.role === 'actor' ? 'Oyuncu' : a.role === 'director' ? 'Yönetmen' : a.role}
    </p>
  </div>
))}
            </div>
          </div>
        )}

        {/* Sezonlar */}
        {content.seasons?.length > 0 && (
          <div style={{marginBottom:24}}>
            <h2 style={{fontSize:16, fontWeight:600, marginBottom:12, color:text}}>Sezonlar</h2>
            <div style={{display:'flex', flexWrap:'wrap', gap:8}}>
              {content.seasons.map((s: any) => (
                <div key={s.season_id}
                  style={{background:card, padding:'10px 16px', borderRadius:8,
                    border:`1px solid ${cardBorder}`}}>
                  <p style={{fontSize:13, fontWeight:600, margin:'0 0 2px', color:text}}>Sezon {s.seasonNumber}</p>
                  <p style={{fontSize:12, margin:0, color:subtext}}>{s.episodeCount} bölüm · {s.releaseYear}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Ödüller */}
        {content.content_award?.length > 0 && (
          <div style={{marginBottom:24}}>
            <h2 style={{fontSize:16, fontWeight:600, marginBottom:12, color:text}}>Ödüller</h2>
            {content.content_award.map((ca: any) => (
              <div key={ca.award?.award_id}
                style={{display:'flex', alignItems:'center', gap:10, padding:'8px 0',
                  borderBottom:`1px solid ${cardBorder}`}}>
                <span style={{fontSize:18}}>🏆</span>
                <div>
                  <p style={{fontSize:14, fontWeight:600, margin:0, color:text}}>{ca.award?.award_name}</p>
                  <p style={{fontSize:12, margin:0, color:subtext}}>{ca.award?.organization} · {ca.award?.year}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Yorum formu */}
        {user && (
          <div style={{background:card, padding:20, borderRadius:12, marginBottom:24, border:`1px solid ${cardBorder}`}}>
            <h2 style={{fontSize:16, fontWeight:600, marginBottom:12, color:text}}>Yorum Yaz</h2>
            <p style={{fontSize:13, color:subtext, marginBottom:6}}>Puanın:</p>
            <div style={{display:'flex', gap:6, flexWrap:'wrap', marginBottom:12}}>
              {[1,2,3,4,5,6,7,8,9,10].map(r => (
                <button key={r} onClick={() => setRating(r)}
                  style={{width:36, height:36, borderRadius:8,
                    border: rating === r ? '2px solid #f59e0b' : `1px solid ${cardBorder}`,
                    cursor:'pointer', fontSize:13, fontWeight:600,
                    background: rating === r ? '#f59e0b' : inputBg,
                    color: rating === r ? '#000' : text}}>
                  {r}
                </button>
              ))}
            </div>
            <textarea value={reviewText} onChange={e => setReviewText(e.target.value)}
              placeholder="Bu içerik hakkında ne düşünüyorsunuz?"
              rows={3} style={{width:'100%', padding:12, borderRadius:8, background:inputBg,
                color:text, border:`1px solid ${cardBorder}`, resize:'none', fontSize:14,
                boxSizing:'border-box', outline:'none'}} />
            <button onClick={handleReviewSubmit} disabled={!rating || upsertReview.isPending}
              style={{marginTop:8, padding:'8px 20px',
                background: rating ? '#7c3aed' : (dark ? '#21262d' : '#e2e8f0'),
                color: rating ? 'white' : subtext,
                border:'none', borderRadius:8, cursor: rating ? 'pointer' : 'not-allowed', fontSize:14, fontWeight:600}}>
              {upsertReview.isPending ? 'Kaydediliyor...' : 'Yorumu Kaydet'}
            </button>
          </div>
        )}

        {/* Yorumlar */}
        <div style={{marginBottom:32}}>
          <h2 style={{fontSize:16, fontWeight:600, marginBottom:12, color:text}}>
            Yorumlar ({content._count?.reviews ?? 0})
          </h2>
          {reviews.length === 0 && <p style={{color:subtext}}>Henüz yorum yok. İlk yorumu sen yaz!</p>}
          {reviews.map((r: any) => (
            <div key={r.review_id}
              style={{background:card, padding:16, borderRadius:10, marginBottom:10, border:`1px solid ${cardBorder}`}}>
              <div style={{display:'flex', alignItems:'center', gap:10, marginBottom:6}}>
                <div style={{width:32, height:32, borderRadius:'50%', background:'#7c3aed',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  fontSize:13, fontWeight:700, color:'white', flexShrink:0}}>
                  {r.user?.username?.[0]?.toUpperCase()}
                </div>
                <strong style={{fontSize:14, color:text}}>{r.user?.username}</strong>
                <span style={{color:'#f59e0b', fontSize:13}}>★ {r.rating}/10</span>
              </div>
              {r.comment && <p style={{color:subtext, fontSize:14, margin:0, paddingLeft:42}}>{r.comment}</p>}
            </div>
          ))}
        </div>

        {/* Benzer İçerikler */}
        {similar && similar.length > 0 && (
          <div style={{marginBottom:32}}>
            <h2 style={{fontSize:16, fontWeight:600, marginBottom:16, color:text}}>Bunları da Beğenebilirsin</h2>
            <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(130px, 1fr))', gap:12}}>
              {similar.map((item: any) => (
                <a key={item.tmdb_id}
                  href={`https://www.imdb.com/find?q=${encodeURIComponent(item.title)}`}
                  target="_blank" rel="noreferrer" style={{textDecoration:'none', color:'inherit'}}>
                  <div style={{background:card, borderRadius:10, overflow:'hidden',
                    border:`1px solid ${cardBorder}`, cursor:'pointer',
                    transition:'transform 0.2s'}}>
                    {item.poster_url ? (
                      <img src={item.poster_url} alt={item.title}
                        style={{width:'100%', aspectRatio:'2/3', objectFit:'cover', display:'block'}} loading="lazy" />
                    ) : (
                      <div style={{width:'100%', aspectRatio:'2/3', background:inputBg,
                        display:'flex', alignItems:'center', justifyContent:'center', fontSize:32}}>🎬</div>
                    )}
                    <div style={{padding:8}}>
                      <p style={{fontSize:12, fontWeight:600, color:text, margin:'0 0 2px',
                        overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>
                        {item.title}
                      </p>
                      <div style={{display:'flex', justifyContent:'space-between'}}>
                        <span style={{fontSize:10, color:subtext}}>{item.release_year}</span>
                        {item.rating && <span style={{fontSize:10, color:'#f59e0b'}}>★ {item.rating}</span>}
                      </div>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}