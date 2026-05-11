import React, { useEffect, useState } from 'react';

const adminApi = async (path: string, method = 'GET', body?: any) => {
  const token = localStorage.getItem('admin_token');
  const res = await fetch(`http://localhost:3001/api/admin${path}`, {
    method, headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  return res.json();
};

export default function AdminUsers() {
  const [data, setData] = useState<any>(null);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<any>(null);
  const [banReason, setBanReason] = useState('');
  const [showBanModal, setShowBanModal] = useState(false);

  const load = (s = search, p = 1) => adminApi(`/users?search=${s}&page=${p}`).then(setData);

  useEffect(() => { load(); }, []);

  const handleSearch = (v: string) => { setSearch(v); setTimeout(() => load(v), 400); };

  const handleBan = async () => {
    await adminApi(`/users/${selected.user_id}/ban`, 'POST', { reason: banReason });
    setShowBanModal(false); setBanReason(''); load();
  };

  const handleUnban = async (userId: number) => {
    await adminApi(`/users/${userId}/unban`, 'POST');
    load();
  };

  const handleRestrict = async (userId: number, isRestricted: boolean) => {
    await adminApi(`/users/${userId}/${isRestricted ? 'unrestrict' : 'restrict'}`, 'POST');
    load();
  };

  const statusBadge = (user: any) => {
    if (user.is_banned) return { label: 'Banlı', color: '#ef4444', bg: '#1f0a0a' };
    if (user.is_restricted) return { label: 'Kısıtlı', color: '#f59e0b', bg: '#1a1200' };
    if (user.role === 'admin') return { label: 'Admin', color: '#a78bfa', bg: '#1a0f2e' };
    return { label: 'Aktif', color: '#34d399', bg: '#0a1f14' };
  };

  return (
    <div style={{ padding: 32 }}>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: 'white', margin: '0 0 4px' }}>Kullanıcılar</h1>
          <p style={{ margin: 0, fontSize: 13, color: '#6b7280' }}>{data?.total ?? 0} kullanıcı</p>
        </div>
        <input value={search} onChange={e => handleSearch(e.target.value)}
          placeholder="Kullanıcı ara..."
          style={{ padding: '9px 14px', borderRadius: 8, border: '1px solid #1e1e2e',
            background: '#0a0a0f', color: 'white', fontSize: 13, outline: 'none', width: 220 }} />
      </div>

      <div style={{ background: '#111118', border: '1px solid #1e1e2e', borderRadius: 12, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' as const }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #1e1e2e', background: '#0d0d15' }}>
              {['Kullanıcı', 'E-posta', 'Yorum', 'Watchlist', 'Durum', 'İşlemler'].map(h => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left' as const,
                  fontSize: 11, color: '#6b7280', fontWeight: 600, textTransform: 'uppercase' as const }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data?.users?.map((user: any) => {
              const badge = statusBadge(user);
              return (
                <tr key={user.user_id} style={{ borderBottom: '1px solid #0d0d15',
                  opacity: user.is_banned ? 0.6 : 1 }}>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#7c3aed',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 13, fontWeight: 700, color: 'white', flexShrink: 0 }}>
                        {user.username[0].toUpperCase()}
                      </div>
                      <div>
                        <p style={{ margin: '0 0 1px', fontSize: 13, fontWeight: 600, color: 'white' }}>{user.username}</p>
                        <p style={{ margin: 0, fontSize: 11, color: '#6b7280' }}>
                          {new Date(user.join_date).toLocaleDateString('tr-TR')}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: 12, color: '#6b7280' }}>{user.email}</td>
                  <td style={{ padding: '12px 16px', fontSize: 13, color: '#94a3b8' }}>{user._count?.reviews}</td>
                  <td style={{ padding: '12px 16px', fontSize: 13, color: '#94a3b8' }}>{user._count?.watchlistItems}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 6,
                      color: badge.color, background: badge.bg }}>{badge.label}</span>
                    {user.is_banned && user.ban_reason && (
                      <p style={{ margin: '2px 0 0', fontSize: 10, color: '#6b7280' }}>{user.ban_reason}</p>
                    )}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {!user.is_banned ? (
                        <button onClick={() => { setSelected(user); setShowBanModal(true); }}
                          style={{ padding: '4px 10px', borderRadius: 6, border: '1px solid #7f1d1d',
                            background: 'transparent', color: '#ef4444', fontSize: 11, cursor: 'pointer', fontWeight: 600 }}>
                          Banla
                        </button>
                      ) : (
                        <button onClick={() => handleUnban(user.user_id)}
                          style={{ padding: '4px 10px', borderRadius: 6, border: '1px solid #14532d',
                            background: 'transparent', color: '#34d399', fontSize: 11, cursor: 'pointer', fontWeight: 600 }}>
                          Ban Kaldır
                        </button>
                      )}
                      <button onClick={() => handleRestrict(user.user_id, user.is_restricted)}
                        style={{ padding: '4px 10px', borderRadius: 6, border: '1px solid #1e1e2e',
                          background: 'transparent', color: user.is_restricted ? '#f59e0b' : '#6b7280',
                          fontSize: 11, cursor: 'pointer', fontWeight: 600 }}>
                        {user.is_restricted ? 'Kısıtı Kaldır' : 'Kısıtla'}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Pagination */}
        {data?.pages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, padding: 16, borderTop: '1px solid #1e1e2e' }}>
            {Array.from({ length: data.pages }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => load(search, p)}
                style={{ width: 32, height: 32, borderRadius: 6, border: '1px solid #1e1e2e',
                  background: data.page === p ? '#7c3aed' : 'transparent',
                  color: data.page === p ? 'white' : '#6b7280', cursor: 'pointer', fontSize: 13 }}>
                {p}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Ban Modal */}
      {showBanModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: '#111118', border: '1px solid #1e1e2e', borderRadius: 16, padding: 28, width: 380 }}>
            <h3 style={{ color: 'white', margin: '0 0 6px', fontSize: 16 }}>
              {selected?.username} kullanıcısını banla
            </h3>
            <p style={{ color: '#6b7280', fontSize: 13, margin: '0 0 16px' }}>Ban nedeni gir:</p>
            <input value={banReason} onChange={e => setBanReason(e.target.value)}
              placeholder="Kural ihlali, spam vb."
              style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #1e1e2e',
                background: '#0a0a0f', color: 'white', fontSize: 13, outline: 'none',
                boxSizing: 'border-box' as const, marginBottom: 16 }} />
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={handleBan}
                style={{ flex: 1, padding: '10px', background: '#ef4444', color: 'white',
                  border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
                Banla
              </button>
              <button onClick={() => { setShowBanModal(false); setBanReason(''); }}
                style={{ flex: 1, padding: '10px', background: 'transparent', color: '#6b7280',
                  border: '1px solid #1e1e2e', borderRadius: 8, cursor: 'pointer', fontSize: 13 }}>
                İptal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}