import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './hooks/useAuth';
import { ThemeProvider } from './hooks/useTheme';
import { Layout } from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Discover from './pages/Discover';
import TitleDetail from './pages/TitleDetail';
import Analytics from './pages/Analytics';
import Rated from './pages/Rated';
import Social from './pages/Social';
import UserProfile from './pages/UserProfile';
import Login from './pages/Login';
import AdminPanel from './pages/Admin';

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 1000 * 60 * 5, retry: 1 } },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
	      <Route path="/admin/*" element={<AdminPanel />} />
              <Route path="/login" element={<Login />} />
              <Route element={<Layout />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/discover" element={<Discover />} />
                <Route path="/title/:id" element={<TitleDetail />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/rated" element={<Rated />} />
                <Route path="/social" element={<Social />} />
                <Route path="/user/:userId" element={<UserProfile />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}