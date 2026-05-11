import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../lib/api';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const { data } = await api.post('/admin/login', { email, password });
      localStorage.setItem('admin_token', data.token);
      navigate('/admin');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Giriş başarısız');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ width: 380, background: '#111118', border: '1px solid #1e1e2e', borderRadius: 16, padding: 36 }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ width: 48, height: 48, background: '#7c3aed', borderRadius: 12, margin: '0 auto 12px',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 800, color: 'white' }}>C</div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: 'white', margin: '0 0 4px' }}>Admin Paneli</h1>
          <p style={{ fontSize: 13, color: '#6b7280', margin: 0 }}>CineTrack yönetim arayüzü</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontSize: 12, color: '#94a3b8', display: 'block', marginBottom: 6 }}>E-posta</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
              style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #1e1e2e',
                background: '#0a0a0f', color: 'white', fontSize: 14, outline: 'none', boxSizing: 'border-box' as const }} />
          </div>
          <div>
            <label style={{ fontSize: 12, color: '#94a3b8', display: 'block', marginBottom: 6 }}>Şifre</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
              style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #1e1e2e',
                background: '#0a0a0f', color: 'white', fontSize: 14, outline: 'none', boxSizing: 'border-box' as const }} />
          </div>

          {error && <p style={{ color: '#ef4444', fontSize: 13, margin: 0, background: '#1f0a0a', padding: '8px 12px', borderRadius: 6 }}>{error}</p>}

          <button type="submit" disabled={loading}
            style={{ padding: '11px', background: '#7c3aed', color: 'white', border: 'none',
              borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer', marginTop: 4 }}>
            {loading ? 'Giriş yapılıyor...' : 'Admin Girişi'}
          </button>
        </form>
      </div>
    </div>
  );
}