import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const adminApi = async (path: string) => {
  const token = localStorage.getItem('admin_token');
  const res = await fetch(`http://localhost:3001/api/admin${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
};

function StatCard({ label, value, sub, color }: any) {
  return (
    <div style={{ background: '#111118', border: '1px solid #1e1e2e', borderRadius: 12, padding: '20px 24px' }}>
      <p style={{ margin: '0 0 8px', fontSize: 12, color: '#6b7280', fontWeight: 500, textTransform: 'uppercase' as const, letterSpacing: '0.05em' }}>{label}</p>
      <p style={{ margin: '0 0 4px', fontSize: 28, fontWeight: 800, color: color || 'white' }}>{value?.toLocaleString()}</p>
      {sub && <p style={{ margin: 0, fontSize: 12, color: '#6b7280' }}>{sub}</p>}
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [topUsers, setTopUsers] = useState<any[]>([]);

  useEffect(() => {
    adminApi('/stats').then(setStats);
    adminApi('/analytics').then(d => setTopUsers(d.topUsers || []));
  }, []);

  return (
    <div style={{ padding: 32 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: 'white', margin: '0 0 4px' }}>Dashboard</h1>
        <p style={{ margin: 0, fontSize: 13, color: '#6b7280' }}>Platform genel bakış</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16, marginBottom: 32 }}>
        <StatCard label="Toplam Kullanıcı" value={stats?.totalUsers} sub={`+${stats?.newUsersThisWeek} bu hafta`} color="#a78bfa" />
        <StatCard label="Toplam İçerik" value={stats?.totalContent} color="#60a5fa" />
        <StatCard label="Toplam Yorum" value={stats?.totalReviews} color="#34d399" />
        <StatCard label="Toplam Watchlist" value={stats?.totalWatchlist} color="#f59e0b" />
        <StatCard label="Aktif Kullanıcı" value={stats?.activeUsers} sub="Son 30 gün" color="#f472b6" />
      </div>

      {/* En Aktif Kullanıcılar */}
      <div style={{ background: '#111118', border: '1px solid #1e1e2e', borderRadius: 12, padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: 'white' }}>En Aktif Kullanıcılar</h2>
          <Link to="/admin/users" style={{ fontSize: 12, color: '#7c3aed', textDecoration: 'none' }}>Tümünü gör →</Link>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' as const }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #1e1e2e' }}>
              {['Kullanıcı', 'Yorum', 'Watchlist', 'Ort. Puan'].map(h => (
                <th key={h} style={{ padding: '8px 12px', textAlign: 'left' as const, fontSize: 11,
                  color: '#6b7280', fontWeight: 600, textTransform: 'uppercase' as const }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {topUsers.map((u: any, i: number) => (
              <tr key={u.user_id} style={{ borderBottom: '1px solid #0d0d15' }}>
                <td style={{ padding: '10px 12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 11, color: '#6b7280', width: 20 }}>{i + 1}</span>
                    <Link to={`/admin/users`} style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0', textDecoration: 'none' }}>
                      {u.username}
                    </Link>
                  </div>
                </td>
                <td style={{ padding: '10px 12px', fontSize: 13, color: '#94a3b8' }}>{u.review_count}</td>
                <td style={{ padding: '10px 12px', fontSize: 13, color: '#94a3b8' }}>{u.watchlist_count}</td>
                <td style={{ padding: '10px 12px', fontSize: 13, color: '#f59e0b' }}>
                  {u.avg_rating ? `★ ${Number(u.avg_rating).toFixed(1)}` : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}