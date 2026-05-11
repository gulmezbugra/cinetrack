import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { ContentCard, ContentDetail, WatchlistEntry, WatchStatus, PaginatedResponse, TopGenre, TopDirector, DroppedRate, MonthlyTrend, Recommendation } from '../types';

// ─── Content ───────────────────────────────────────────────
export function useContent(params: { type?: string; genreId?: number; search?: string; page?: number }) {
  return useQuery<PaginatedResponse<ContentCard>>({
    queryKey: ['content', params],
    queryFn: () => api.get('/content', { params }).then(r => r.data),
  });
}

export function useContentDetail(id: number) {
  return useQuery<ContentDetail>({
    queryKey: ['content', id],
    queryFn: () => api.get(`/content/${id}`).then(r => r.data),
    enabled: id > 0,
  });
}

export function useGenres() {
  return useQuery<{ id: number; name: string }[]>({
    queryKey: ['genres'],
    queryFn: () => api.get('/content/genres').then(r => r.data),
    staleTime: Infinity,
  });
}

// ─── Watchlist ──────────────────────────────────────────────
export function useWatchlist(status?: WatchStatus) {
  return useQuery<WatchlistEntry[]>({
    queryKey: ['watchlist', status],
    queryFn: () => api.get('/watchlist', { params: status ? { status } : {} }).then(r => r.data),
  });
}

export function useWatchlistStatus(contentId: number) {
  return useQuery<WatchlistEntry | null>({
    queryKey: ['watchlist-status', contentId],
    queryFn: () => api.get(`/watchlist/${contentId}/status`).then(r => r.data),
    enabled: contentId > 0,
  });
}

export function useUpsertWatchlist() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { contentId: number; status: WatchStatus; episodeProgress?: number }) =>
      api.put('/watchlist', data).then(r => r.data),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['watchlist'] });
      qc.invalidateQueries({ queryKey: ['watchlist-status', vars.contentId] });
    },
  });
}

export function useRemoveFromWatchlist() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (contentId: number) => api.delete(`/watchlist/${contentId}`).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['watchlist'] }),
  });
}

// ─── Reviews ───────────────────────────────────────────────
export function useReviews(contentId: number, page = 1) {
  return useQuery({
    queryKey: ['reviews', contentId, page],
    queryFn: () => api.get(`/reviews/content/${contentId}`, { params: { page } }).then(r => r.data),
    enabled: contentId > 0,
  });
}

export function useUpsertReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { contentId: number; rating: number; body?: string }) =>
      api.put('/reviews', data).then(r => r.data),
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ['reviews', vars.contentId] });
      qc.invalidateQueries({ queryKey: ['content', vars.contentId] });
    },
  });
}

// ─── Analytics ─────────────────────────────────────────────
export function useTopGenres() {
  return useQuery<TopGenre[]>({ queryKey: ['analytics', 'top-genres'], queryFn: () => api.get('/analytics/top-genres').then(r => r.data) });
}

export function useTopDirectors() {
  return useQuery<TopDirector[]>({ queryKey: ['analytics', 'top-directors'], queryFn: () => api.get('/analytics/top-directors').then(r => r.data) });
}

export function useDroppedRate() {
  return useQuery<DroppedRate[]>({ queryKey: ['analytics', 'dropped-rate'], queryFn: () => api.get('/analytics/dropped-rate').then(r => r.data) });
}

export function useMonthlyTrend() {
  return useQuery<MonthlyTrend[]>({ queryKey: ['analytics', 'monthly-trend'], queryFn: () => api.get('/analytics/monthly-trend').then(r => r.data) });
}

export function useRecommendations() {
  return useQuery<Recommendation[]>({ queryKey: ['analytics', 'recommendations'], queryFn: () => api.get('/analytics/recommendations').then(r => r.data) });
}

export function usePendingContent() {
  return useQuery({ queryKey: ['analytics', 'pending'], queryFn: () => api.get('/analytics/pending').then(r => r.data) });
}

export function useTrailer(contentId: number) {
  return useQuery<{ trailerKey: string | null }>({
    queryKey: ['trailer', contentId],
    queryFn: () => api.get(`/content/${contentId}/trailer`).then(r => r.data),
    enabled: contentId > 0,
  });
}

export function useSimilar(contentId: number) {
  return useQuery<any[]>({
    queryKey: ['similar', contentId],
    queryFn: () => api.get(`/content/${contentId}/similar`).then(r => r.data),
    enabled: contentId > 0,
  });
}

export function useTmdbDetails(contentId: number) {
  return useQuery<any>({
    queryKey: ['tmdb-details', contentId],
    queryFn: () => api.get(`/content/${contentId}/details`).then(r => r.data),
    enabled: contentId > 0,
  });
}

export function useMyReviews() {
  return useQuery<any[]>({
    queryKey: ['my-reviews'],
    queryFn: () => api.get('/reviews/my').then(r => r.data),
  });
}

export function useFeed(page = 1) {
  return useQuery<any>({
    queryKey: ['feed', page],
    queryFn: () => api.get('/social/feed', { params: { page } }).then(r => r.data),
  });
}

export function useSearchUsers(query: string) {
  return useQuery<any[]>({
    queryKey: ['search-users', query],
    queryFn: () => api.get('/social/search', { params: { q: query } }).then(r => r.data),
    enabled: query.length > 1,
  });
}

export function useUserProfile(userId: number) {
  return useQuery<any>({
    queryKey: ['user-profile', userId],
    queryFn: () => api.get(`/social/profile/${userId}`).then(r => r.data),
    enabled: userId > 0,
  });
}

export function useToggleLike() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (reviewId: number) => api.post(`/social/like/${reviewId}`).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['feed'] }),
  });
}

export function useAddComment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ reviewId, body }: { reviewId: number; body: string }) =>
      api.post(`/social/comment/${reviewId}`, { body }).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['feed'] }),
  });
}

export function useToggleFollow() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: number) => api.post(`/social/follow/${userId}`).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['feed'] });
      qc.invalidateQueries({ queryKey: ['search-users'] });
      qc.invalidateQueries({ queryKey: ['user-profile'] });
    },
  });
}