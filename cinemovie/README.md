#  CineTrack

A full-stack film and TV series tracking platform built with Node.js, React, and PostgreSQL. Track what you watch, discover new content, write reviews, and explore analytics — all in one place.

![CineTrack](https://img.shields.io/badge/version-1.0.0-7c3aed) ![License](https://img.shields.io/badge/license-MIT-10b981) ![Node](https://img.shields.io/badge/node-22.x-339933) ![React](https://img.shields.io/badge/react-18-61dafb)

---

##  Features

###  Content
- Browse films and TV series with poster images fetched from TMDB
- Filter by genre, content type (film/series), and search by title
- Detailed pages with synopsis, cast, seasons, awards, budget, revenue, and production info — all powered by TMDB API
- Watch trailers inline via YouTube embed
- "You Might Also Like" section using TMDB's recommendation engine

###  Watchlist
- Add content to your watchlist with four status options: **Plan to Watch**, **Watching**, **Watched**, **Dropped**
- Track episode progress for series
- Business rule: episode progress is blocked for films

###  Reviews
- Rate content from 1 to 10
- Write text reviews
- See all community reviews on each title's detail page

###  Analytics Dashboard
- Most watched genres (bar chart)
- Top rated directors (bar chart)
- Drop rate analysis by genre (bar chart)
- Monthly review trend with average ratings (line chart)
- Content completion rate ranking

###  User System
- Register and login with JWT authentication
- Follow / unfollow other users
- Personal dashboard with watchlist overview

###  UI/UX
- Dark / Light mode toggle (persisted across sessions)
- Cinematic backdrop images on detail pages (from TMDB)
- Responsive design — works on mobile and desktop

---

##  Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Vite + React 18 + TypeScript |
| State Management | TanStack Query (React Query v5) |
| Styling | Tailwind CSS |
| Backend | Node.js + Express + TypeScript |
| ORM | Prisma |
| Database | PostgreSQL |
| Auth | JWT + Bcrypt |
| Charts | Recharts |
| External API | TMDB (The Movie Database) |

---

##  Project Structure

```
cinetrack/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma          # Database models (14 tables)
│   │   ├── seed.ts                # Sample data
│   │   └── update-posters.ts      # TMDB poster sync script
│   └── src/
│       ├── index.ts               # Express app entry point
│       ├── middleware/
│       │   ├── authenticate.ts    # JWT guard
│       │   └── errorHandler.ts    # Global error handler
│       ├── prisma/client.ts       # Singleton Prisma client
│       └── modules/
│           ├── auth/              # Register, login, follow system
│           ├── content/           # Films & series + TMDB integration
│           ├── watchlist/         # Watchlist management
│           ├── review/            # Ratings & reviews
│           └── analytics/         # 7 complex SQL queries
└── frontend/
    └── src/
        ├── App.tsx                # Router + Provider setup
        ├── types/                 # Shared TypeScript types
        ├── lib/api.ts             # Axios client with JWT injection
        ├── hooks/
        │   ├── useAuth.tsx        # Auth context
        │   ├── useTheme.tsx       # Dark/light mode context
        │   └── useApi.ts          # TanStack Query hooks
        ├── components/
        │   ├── ui/                # ContentCard, RatingStars, WatchStatusButton
        │   └── layout/            # Navbar + Layout wrapper
        └── pages/
            ├── Dashboard/         # Watchlist overview
            ├── Discover/          # Search, filter, browse
            ├── TitleDetail/       # Full detail page with TMDB data
            ├── Analytics/         # Recharts visualizations
            └── Login/             # Login / Register
```

---

## 🗄 Database Schema

The PostgreSQL database consists of 14 tables:

| Table | Description |
|-------|-------------|
| `users` | User accounts with roles |
| `content` | Films and TV series |
| `genre` | Genre definitions |
| `content_genre` | M:N content ↔ genre |
| `person` | Directors, actors, writers |
| `content_person` | M:N content ↔ person with role |
| `season` | Season and episode data for series |
| `review` | User ratings and comments |
| `watchlist_entry` | User watchlist with status tracking |
| `list` | Custom user-curated lists |
| `list_content` | M:N list ↔ content |
| `follow` | Asymmetric user follow relationships |
| `award` | Award definitions |
| `content_award` | M:N content ↔ award |

---

##  Getting Started

### Prerequisites

- Node.js v18+
- PostgreSQL 15+
- TMDB API key (free at [themoviedb.org](https://www.themoviedb.org/settings/api))

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/cinetrack.git
cd cinetrack
```

### 2. Set up the database

```sql
-- In psql or pgAdmin
CREATE DATABASE cinetrack;
```

Then import the schema:

```bash
psql -U postgres -d cinetrack -f cinetrack_clean.sql
```

Or use pgAdmin's Query Tool to run `cinetrack_clean.sql`.

### 3. Configure the backend

```bash
cd backend
cp .env.example .env
```

Edit `.env`:

```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/cinetrack"
JWT_SECRET="your-secret-key-here"
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
TMDB_API_KEY=your_tmdb_api_key
```

### 4. Install and run the backend

```bash
npm install
npx prisma db pull       # Sync Prisma schema with existing DB
npx prisma generate      # Generate TypeScript types
npm run dev              # Starts on http://localhost:3001
```

### 5. Sync poster images from TMDB (recommended)

```bash
npx ts-node prisma/update-posters.ts
```

### 6. Install and run the frontend

```bash
cd ../frontend
npm install
npm run dev              # Starts on http://localhost:5173
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

##  API Reference

### Authentication
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | — | Create account |
| POST | `/api/auth/login` | — | Login, returns JWT |
| GET | `/api/auth/me` | ✓ | Get current user profile |
| POST | `/api/auth/follow/:userId` | ✓ | Follow a user |
| DELETE | `/api/auth/follow/:userId` | ✓ | Unfollow a user |

### Content
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/content` | — | List content (type, genreId, search, page) |
| GET | `/api/content/:id` | — | Full detail with genres, cast, awards, reviews |
| GET | `/api/content/:id/trailer` | — | YouTube trailer key via TMDB |
| GET | `/api/content/:id/details` | — | Budget, revenue, companies via TMDB |
| GET | `/api/content/:id/similar` | — | Recommendations via TMDB |
| GET | `/api/content/genres` | — | All genres |

### Watchlist
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/watchlist` | ✓ | Get user's watchlist |
| PUT | `/api/watchlist` | ✓ | Add or update entry |
| DELETE | `/api/watchlist/:contentId` | ✓ | Remove from watchlist |
| GET | `/api/watchlist/:contentId/status` | ✓ | Check status for a title |

### Reviews
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/reviews/content/:contentId` | — | Reviews for a title |
| PUT | `/api/reviews` | ✓ | Create or update review |
| DELETE | `/api/reviews/:contentId` | ✓ | Delete review |

### Analytics
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/analytics/top-genres` | — | Most watched genres |
| GET | `/api/analytics/top-directors` | — | Highest rated directors |
| GET | `/api/analytics/dropped-rate` | — | Drop rate by genre |
| GET | `/api/analytics/pending` | ✓ | Content pending 30+ days |
| GET | `/api/analytics/recommendations` | ✓ | Collaborative filtering |
| GET | `/api/analytics/monthly-trend` | — | Monthly review trend |
| GET | `/api/analytics/completion-rates` | — | Completion rate per title |

---

##  Business Rules

- `episode_progress` is only valid for series — backend returns 400 for films
- Users cannot follow themselves
- One review per user per title (upsert behavior)
- Ratings must be between 1 and 10

---

##  Analytics Highlights

All analytics are powered by raw PostgreSQL via `prisma.$queryRawUnsafe`:

- **Collaborative Filtering** — finds users with similar taste via a CTE and surfaces content they enjoyed that you haven't seen
- **Drop Rate Analysis** — uses `COUNT FILTER` to calculate abandonment percentage by genre
- **User Segmentation** — classifies users as Casual / Regular / Power User by total watch time

For production, consider materialized views for heavy queries:

```sql
CREATE MATERIALIZED VIEW mv_top_genres AS
  SELECT g.genre_name, COUNT(we.entry_id) AS watch_count
  FROM genre g
  JOIN content_genre cg ON g.genre_id = cg.genre_id
  JOIN watchlist_entry we ON cg.content_id = we.content_id
  WHERE we.status IN ('watched', 'watching')
  GROUP BY g.genre_name
  ORDER BY watch_count DESC;

REFRESH MATERIALIZED VIEW mv_top_genres;
```

---

##  Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Secret key for JWT signing |
| `PORT` | Backend server port (default: 3001) |
| `NODE_ENV` | Environment (`development` / `production`) |
| `FRONTEND_URL` | Allowed CORS origin |
| `TMDB_API_KEY` | TMDB API v3 key |

---

##  License

This project is licensed under the MIT License.

---

##  Acknowledgements

- [TMDB](https://www.themoviedb.org/) for the film and series data API
- [Prisma](https://www.prisma.io/) for the TypeScript ORM
- [TanStack Query](https://tanstack.com/query) for server state management
- [Recharts](https://recharts.org/) for the analytics charts
