import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Theme = 'dark' | 'light';
const ThemeContext = createContext<{ theme: Theme; toggle: () => void }>({ theme: 'dark', toggle: () => {} });

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() =>
    (localStorage.getItem('ct_theme') as Theme) || 'dark'
  );

  useEffect(() => {
    localStorage.setItem('ct_theme', theme);
    document.body.style.background = theme === 'dark' ? '#0d1117' : '#f8fafc';
    document.body.style.color = theme === 'dark' ? '#f1f5f9' : '#0f172a';
  }, [theme]);

  const toggle = () => setTheme(t => t === 'dark' ? 'light' : 'dark');
  return <ThemeContext.Provider value={{ theme, toggle }}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => useContext(ThemeContext);