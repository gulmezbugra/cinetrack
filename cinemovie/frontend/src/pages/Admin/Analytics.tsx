import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid, PieChart, Pie, Cell } from 'recharts';

const adminApi = async (path: string) => {
  const token = localStorage.getItem('admin_token');
  const res = await fetch(`http://localhost:3001/api/admin${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
};

const COLORS = ['#7c3aed', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

export default function AdminAnalytics() {
  const [data, setData] = useState<any>(null);

  useEffect(() => { adminApi('/analytics').then(setData); }, []);

  if (!data) return <div style={{ padding: 32, color: '#6b7280' }}>Yükleniyor...</div>;

  const conversion = data.conversionRate;
  const pieData = conversion ? [
    { name: 'İzlendi', value: Number(conversion.converted) },
    { name: 'İzleniyor', value: Number(conversion.watching) },
    { name: 'Bırakıldı', value: Number(conversion.dropped) },
    { name: 'Bekliyor', value: Number(conversion.pending) },
  ] : [];

  return (
    <div style={{ padding: 32 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: 'white', margin: '0 0 4px' }}>Platform Analitiği</h1>
        <p style={{ margin: 0, fontSize: 13, color: '#6b7280' }}>Detaylı içerik ve kullanıcı istatistikleri</p>
      </div>

      {/* Conversion Rate */}
      {conversion && (
        <div style={{ background: '#111118', border: '1px solid #1e1e2e', borderRadius: 12, padding: 24, marginBottom: 24 }}>
          <h2 style={{ color: 'white', fontSize: 15, fontWeight: 700, margin: '0 0 16px' }}>
            Watchlist → İzlendi Dönüşüm Oranı
          </h2>
          <div style={{ display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 200 }}>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value">
                    {pieData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                  </Pie>
                  <Tooltip formatter={(v: any) => v.toLocaleString()} contentStyle={{ background: '#111118', border: '1px solid #1e1e2e', borderRadius: 8 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {pieData.map((d, i) => (
                <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: COLORS[i] }} />
                  <span style={{ fontSize: 13, color: '#94a3b8', width: 80 }}>{d.name}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'white' }}>{d.value.toLocaleString()}</span>
                </div>
              ))}
              <div style={{ marginTop: 8, padding: '10px 16px', background: '#1e1b4b', borderRadius: 8 }}>
                <p style={{ margin: 0, fontSize: 11, color: '#a78bfa' }}>Dönüşüm Oranı</p>
                <p style={{ margin: 0, fontSize: 24, fontWeight: 800, color: '#7c3aed' }}>
                  %{conversion.conversion_rate}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
        {/* Drop Oranı */}
        <div style={{ background: '#111118', border: '1px solid #1e1e2e', borderRadius: 12, padding: 24 }}>
          <h2 style={{ color: 'white', fontSize: 15, fontWeight: 700, margin: '0 0 16px' }}>İçerik Bırakma Oranı (%)</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data.dropRates?.slice(0, 8).map((d: any) => ({
              name: d.title.length > 15 ? d.title.slice(0, 15) + '...' : d.title,
              oran: Number(d.drop_rate),
            }))} layout="vertical">
              <XAxis type="number" tick={{ fontSize: 10, fill: '#6b7280' }} unit="%" />
              <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 10, fill: '#6b7280' }} />
              <Tooltip formatter={(v: any) => `%${v}`} contentStyle={{ background: '#111118', border: '1px solid #1e1e2e', borderRadius: 8 }} />
              <Bar dataKey="oran" fill="#ef4444" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Tamamlanma Oranı */}
        <div style={{ background: '#111118', border: '1px solid #1e1e2e', borderRadius: 12, padding: 24 }}>
          <h2 style={{ color: 'white', fontSize: 15, fontWeight: 700, margin: '0 0 16px' }}>Tamamlanma Oranı (%)</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data.dropRates?.slice(0, 8).map((d: any) => ({
              name: d.title.length > 15 ? d.title.slice(0, 15) + '...' : d.title,
              oran: Number(d.completion_rate),
            }))} layout="vertical">
              <XAxis type="number" tick={{ fontSize: 10, fill: '#6b7280' }} unit="%" />
              <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 10, fill: '#6b7280' }} />
              <Tooltip formatter={(v: any) => `%${v}`} contentStyle={{ background: '#111118', border: '1px solid #1e1e2e', borderRadius: 8 }} />
              <Bar dataKey="oran" fill="#10b981" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Tür İstatistikleri */}
        <div style={{ background: '#111118', border: '1px solid #1e1e2e', borderRadius: 12, padding: 24 }}>
          <h2 style={{ color: 'white', fontSize: 15, fontWeight: 700, margin: '0 0 16px' }}>Türe Göre Ortalama Puan</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data.genreStats?.filter((g: any) => Number(g.avg_rating) > 0).map((g: any) => ({
              name: g.genre_name, puan: Number(g.avg_rating)
            }))}>
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#6b7280' }} />
              <YAxis domain={[0, 10]} tick={{ fontSize: 10, fill: '#6b7280' }} />
              <Tooltip contentStyle={{ background: '#111118', border: '1px solid #1e1e2e', borderRadius: 8 }} />
              <Bar dataKey="puan" fill="#7c3aed" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Aylık Büyüme */}
        <div style={{ background: '#111118', border: '1px solid #1e1e2e', borderRadius: 12, padding: 24 }}>
          <h2 style={{ color: 'white', fontSize: 15, fontWeight: 700, margin: '0 0 16px' }}>Aylık Yeni Kullanıcı</h2>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={data.monthlyGrowth?.map((m: any) => ({ ay: m.month, kullanıcı: Number(m.new_users) }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2e" />
              <XAxis dataKey="ay" tick={{ fontSize: 10, fill: '#6b7280' }} />
              <YAxis tick={{ fontSize: 10, fill: '#6b7280' }} />
              <Tooltip contentStyle={{ background: '#111118', border: '1px solid #1e1e2e', borderRadius: 8 }} />
              <Line type="monotone" dataKey="kullanıcı" stroke="#7c3aed" strokeWidth={2} dot={{ fill: '#7c3aed' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* En Çok Watchlist'e Alınanlar */}
      <div style={{ background: '#111118', border: '1px solid #1e1e2e', borderRadius: 12, padding: 24 }}>
        <h2 style={{ color: 'white', fontSize: 15, fontWeight: 700, margin: '0 0 16px' }}>En Çok Watchlist'e Alınan İçerikler</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
          {data.mostWatchlisted?.map((c: any, i: number) => (
            <div key={c.content_id} style={{ display: 'flex', gap: 12, padding: 12,
              background: '#0d0d15', borderRadius: 10, border: '1px solid #1e1e2e', alignItems: 'center' }}>
              <span style={{ fontSize: 16, fontWeight: 800, color: '#6b7280', width: 24 }}>{i + 1}</span>
              {c.poster_url ? (
                <img src={c.poster_url} alt={c.title} style={{ width: 36, height: 54, objectFit: 'cover', borderRadius: 4, flexShrink: 0 }} />
              ) : (
                <div style={{ width: 36, height: 54, background: '#1e1e2e', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>🎬</div>
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: '0 0 4px', fontSize: 13, fontWeight: 600, color: 'white',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.title}</p>
                <div style={{ display: 'flex', gap: 8, fontSize: 11, color: '#6b7280' }}>
                  <span>📋 {c.total}</span>
                  <span>✓ {c.watched}</span>
                  <span>✕ {c.dropped}</span>
                  {c.avg_rating && <span style={{ color: '#f59e0b' }}>★ {Number(c.avg_rating).toFixed(1)}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}