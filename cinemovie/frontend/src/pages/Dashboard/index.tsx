import React, { useState } from 'react';
import { useWatchlist } from '../../hooks/useApi';
import { useAuth } from '../../hooks/useAuth';
import { Link } from 'react-router-dom';
import clsx from 'clsx';

const TABS = [
  { label: 'Tümü', value: undefined },
  { label: '▶ İzliyorum', value: 'watching' },
  { label: '✓ İzledim', value: 'watched' },
  { label: '+ İzleyeceğim', value: 'plan_to_watch' },
  { label: '✕ Bıraktım', value: 'dropped' },
];

export default function Dashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<string | undefined>(undefined);
  const { data: watchlist, isLoading, error } = useWatchlist(activeTab as any);

  if (!user) {
    return (
      <div style={{textAlign:'center', padding:80}}>
        <h2 style={{fontSize:24, fontWeight:700, marginBottom:12}}>CineTrack'e Hoş Geldin 🎬</h2>
        <p style={{color:'#6b7280', marginBottom:24}}>İzleme listeni yönetmek için giriş yap.</p>
        <Link to="/login" style={{background:'#7c3aed', color:'white', padding:'10px 24px', borderRadius:8, textDecoration:'none', fontWeight:600}}>
          Giriş Yap
        </Link>
      </div>
    );
  }

  return (
    <div style={{maxWidth:1200, margin:'0 auto', padding:24}}>
      <h1 style={{fontSize:24, fontWeight:700, marginBottom:4}}>Merhaba, {user.username} 👋</h1>
      <p style={{color:'#6b7280', fontSize:14, marginBottom:24}}>İzleme listenizi yönetin</p>

      {/* Tabs */}
      <div style={{display:'flex', gap:8, overflowX:'auto', paddingBottom:8, marginBottom:16}}>
        {TABS.map(tab => (
          <button key={String(tab.value)} onClick={() => setActiveTab(tab.value)}
            style={{padding:'6px 16px', borderRadius:20, fontSize:13, cursor:'pointer', whiteSpace:'nowrap',
              background: activeTab === tab.value ? '#7c3aed' : '#1f2937',
              color: activeTab === tab.value ? 'white' : '#9ca3af',
              border: 'none', fontWeight: activeTab === tab.value ? 600 : 400}}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {isLoading && <p style={{color:'#6b7280'}}>Yükleniyor...</p>}
      {error && <p style={{color:'#ef4444'}}>Watchlist yüklenemedi.</p>}
      {!isLoading && !error && watchlist?.length === 0 && (
        <div style={{textAlign:'center', padding:60, color:'#6b7280'}}>
          <p style={{fontSize:48, marginBottom:12}}>🎬</p>
          <p>Henüz içerik yok.</p>
          <Link to="/discover" style={{color:'#7c3aed', textDecoration:'none', fontWeight:600}}>Keşfet →</Link>
        </div>
      )}

      <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(150px, 1fr))', gap:16}}>
        {watchlist?.map((entry: any) => (
          <Link key={entry.entry_id} to={`/title/${entry.content?.content_id}`}
            style={{textDecoration:'none', color:'inherit'}}>
            <div style={{background:'#111827', borderRadius:10, overflow:'hidden', border:'1px solid #1f2937',
              transition:'transform 0.2s', cursor:'pointer'}}>
              {entry.content?.poster_url ? (
                <img src={entry.content.poster_url} alt={entry.content.title}
                  style={{width:'100%', aspectRatio:'2/3', objectFit:'cover'}} loading="lazy" />
              ) : (
                <div style={{width:'100%', aspectRatio:'2/3', background:'#1f2937',
                  display:'flex', alignItems:'center', justifyContent:'center', fontSize:36}}>🎬</div>
              )}
              <div style={{padding:8}}>
                <p style={{fontSize:12, fontWeight:600, color:'white', margin:'0 0 4px',
                  overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>
                  {entry.content?.title}
                </p>
                <span style={{fontSize:10, padding:'2px 6px', borderRadius:10,
                  background: entry.status === 'watched' ? '#065f46' :
                               entry.status === 'watching' ? '#1e3a5f' :
                               entry.status === 'dropped' ? '#7f1d1d' : '#374151',
                  color: 'white'}}>
                  {entry.status === 'watched' ? '✓ İzledim' :
                   entry.status === 'watching' ? '▶ İzliyorum' :
                   entry.status === 'dropped' ? '✕ Bıraktım' : '+ İzleyeceğim'}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}