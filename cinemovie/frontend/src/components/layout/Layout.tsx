import React from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';

// SVG İkonlar
const Icons = {
  Dashboard: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
      <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
    </svg>
  ),
  Social: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  Discover: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/>
      <line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  ),
  Rated: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  ),
  Analytics: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10"/>
      <line x1="12" y1="20" x2="12" y2="4"/>
      <line x1="6" y1="20" x2="6" y2="14"/>
    </svg>
  ),
  Sun: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5"/>
      <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
      <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
    </svg>
  ),
  Moon: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>
  ),
  Logout: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
      <polyline points="16 17 21 12 16 7"/>
      <line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  ),
  FilmReel: () => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <circle cx="12" cy="12" r="3"/>
      <line x1="12" y1="2" x2="12" y2="9"/>
      <line x1="12" y1="15" x2="12" y2="22"/>
      <line x1="2" y1="12" x2="9" y2="12"/>
      <line x1="15" y1="12" x2="22" y2="12"/>
      <line x1="4.93" y1="4.93" x2="9.17" y2="9.17"/>
      <line x1="14.83" y1="14.83" x2="19.07" y2="19.07"/>
      <line x1="19.07" y1="4.93" x2="14.83" y2="9.17"/>
      <line x1="9.17" y1="14.83" x2="4.93" y2="19.07"/>
    </svg>
  ),
};

const navItems = [
  { to: '/', label: 'İzleme Listesi', Icon: Icons.Dashboard, end: true },
  { to: '/social', label: 'Sosyal', Icon: Icons.Social },
  { to: '/discover', label: 'Keşfet', Icon: Icons.Discover },
  { to: '/rated', label: 'Değerlendirmeler', Icon: Icons.Rated },
  { to: '/analytics', label: 'Analiz', Icon: Icons.Analytics },
];

export function Layout() {
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const dark = theme === 'dark';

  const bg = dark ? '#161b22' : '#ffffff';
  const border = dark ? '#30363d' : '#e2e8f0';
  const subtext = dark ? '#8b949e' : '#64748b';
  const text = dark ? '#f1f5f9' : '#0f172a';

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Navbar */}
      <header style={{ background: bg, borderBottom: `1px solid ${border}`, position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 56 }}>

          {/* Logo */}
          <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Icons.FilmReel />
            <span style={{ fontWeight: 800, fontSize: 17, color: '#7c3aed', letterSpacing: '-0.3px' }}>
              CineTrack
            </span>
          </Link>

          {/* Nav */}
          <nav style={{ display: 'flex', gap: 2 }}>
            {navItems.map(({ to, label, Icon, end }) => (
              <NavLink key={to} to={to} end={end}
                style={({ isActive }) => ({
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '6px 12px', borderRadius: 8, fontSize: 13, fontWeight: 500,
                  textDecoration: 'none', transition: 'all 0.15s',
                  background: isActive ? (dark ? '#21262d' : '#f1f5f9') : 'transparent',
                  color: isActive ? '#7c3aed' : subtext,
                })}>
                <Icon />
                <span>{label}</span>
              </NavLink>
            ))}
          </nav>

          {/* Sağ taraf */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {/* Tema */}
            <button onClick={toggle}
              style={{ width: 34, height: 34, borderRadius: 8, border: `1px solid ${border}`,
                background: 'transparent', cursor: 'pointer', color: subtext,
                display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {dark ? <Icons.Sun /> : <Icons.Moon />}
            </button>

            {user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 30, height: 30, borderRadius: '50%', background: '#7c3aed',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 700, color: 'white' }}>
                  {user.username[0].toUpperCase()}
                </div>
                <span style={{ fontSize: 13, color: subtext, fontWeight: 500 }}>{user.username}</span>
                <button onClick={logout}
                  style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13,
                    color: '#ef4444', background: 'transparent', border: 'none',
                    cursor: 'pointer', padding: '4px 8px', borderRadius: 6 }}>
                  <Icons.Logout />
                  Çıkış
                </button>
              </div>
            ) : (
              <Link to="/login"
                style={{ fontSize: 13, background: '#7c3aed', color: 'white',
                  padding: '6px 16px', borderRadius: 8, textDecoration: 'none', fontWeight: 600 }}>
                Giriş Yap
              </Link>
            )}
          </div>
        </div>
      </header>

      <main style={{ flex: 1, maxWidth: 1200, margin: '0 auto', width: '100%', padding: '24px 24px 80px' }}>
        <Outlet />
      </main>

      
    </div>
  );
}