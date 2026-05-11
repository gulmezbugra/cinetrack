export type ContentType = 'film' | 'series';
export type ContentStatus = 'ongoing' | 'ended' | 'upcoming';
export type WatchStatus = 'watching' | 'watched' | 'dropped' | 'plan_to_watch';
export type PersonRole = 'director' | 'actor' | 'writer';

export interface Genre {
  id: number;
  name: string;
}

export interface Person {
  id: number;
  name: string;
  photoUrl?: string | null;
}

export interface ContentCard {
  id: number;
  title: string;
  contentType: ContentType;
  releaseYear?: number | null;
  coverUrl?: string | null;
  status: ContentStatus;
  genres: { genre: Genre }[];
  _count: { reviews: number };
}

export interface ContentDetail extends ContentCard {
  synopsis?: string | null;
  totalSeasons?: number | null;
  averageRating: number | null;
  persons: { person: Person; role: PersonRole }[];
  seasons: Season[];
  awards: Award[];
  reviews: ReviewWithUser[];
}

export interface Season {
  id: number;
  seasonNumber: number;
  episodeCount: number;
  releaseYear?: number | null;
}

export interface Award {
  id: number;
  name: string;
  category: string;
  year: number;
  won: boolean;
}

export interface User {
  id: number;
  username: string;
  email: string;
  bio?: string | null;
  avatarUrl?: string | null;
  createdAt: string;
  _count?: { followers: number; following: number; watchlistItems: number; reviews: number };
}

export interface ReviewWithUser {
  id: number;
  rating: number;
  body?: string | null;
  createdAt: string;
  user: { id: number; username: string; avatarUrl?: string | null };
}

export interface WatchlistEntry {
  id: number;
  status: WatchStatus;
  episodeProgress?: number | null;
  addedAt: string;
  updatedAt: string;
  content: ContentCard;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pages: number;
}

// Analytics types
export interface TopGenre { genre: string; count: string }
export interface TopDirector { director: string; avg_rating: string; works: string }
export interface DroppedRate { genre: string; total: string; dropped: string; drop_rate: string }
export interface MonthlyTrend { month: string; count: string; avg_rating: string }
export interface Recommendation { id: number; title: string; cover_url: string | null; score: string }
