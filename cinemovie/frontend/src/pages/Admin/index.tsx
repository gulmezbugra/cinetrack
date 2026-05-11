import React, { useState } from 'react';
import { Routes, Route, Link, NavLink, useNavigate } from 'react-router-dom';
import AdminLogin from './Login';
import AdminDashboard from './Dashboard';
import AdminUsers from './Users';
import AdminAnalytics from './Analytics';

export default function AdminPanel() {
  return (
    <Routes>
      <Route path="login" element={<AdminLogin />} />
      <Route path="/*" element={<AdminLayout />} />
    </Routes>
  );
}

function AdminLayout() {
  const navigate = useNavigate();
  const token = localStorage.getItem('admin_token');
  if (!token) { navigate('/admin/login'); return null; }

  const logout = () => { localStorage.removeItem('admin_token'); navigate('/admin/login'); };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0a0a0f', color: '#e2e8f0', fontFamily: 'Inter, sans-serif' }}>
      {/* Sidebar */}
      <aside style={{ width: 220, background: '#111118', borderRight: '1px solid #1e1e2e', padding: '0', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid #1e1e2e' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 32, height: 32, background: '#7c3aed', borderRadius: 8,
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800, color: 'white' }}>C</div>
            <div>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: 'white' }}>CineTrack</p>
              <p style={{ margin: 0, fontSize: 10, color: '#6b7280' }}>Admin Panel</p>
            </div>
          </div>
        </div>

        <nav style={{ padding: '12px 10px', flex: 1 }}>
          {[
            { to: '/admin', label: 'Dashboard', icon: '▦', end: true },
            { to: '/admin/users', label: 'Kullanıcılar', icon: '◉' },
            { to: '/admin/analytics', label: 'Analitik', icon: '▲' },
          ].map(item => (
            <NavLink key={item.to} to={item.to} end={item.end}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px',
                borderRadius: 8, marginBottom: 2, textDecoration: 'none', fontSize: 13, fontWeight: 500,
                background: isActive ? '#1e1b4b' : 'transparent',
                color: isActive ? '#a78bfa' : '#94a3b8',
                transition: 'all 0.15s',
              })}>
              <span style={{ fontSize: 12 }}>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div style={{ padding: '12px 10px', borderTop: '1px solid #1e1e2e' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px',
            borderRadius: 8, textDecoration: 'none', fontSize: 12, color: '#6b7280', marginBottom: 4 }}>
            ← Siteye Dön
          </Link>
          <button onClick={logout} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8,
            padding: '8px 12px', borderRadius: 8, background: 'none', border: 'none',
            fontSize: 12, color: '#ef4444', cursor: 'pointer', textAlign: 'left' as const }}>
            ⎋ Çıkış Yap
          </button>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, overflow: 'auto' }}>
        <Routes>
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="analytics" element={<AdminAnalytics />} />
        </Routes>
      </main>
    </div>
  );
}