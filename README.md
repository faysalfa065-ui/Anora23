# Anora — Netflix × JustWatch × IMDb Streaming Super-App

Anora is a full-featured, client-side web and mobile application combining:
- **Netflix Mobile & Widescreen UI**: Top 10 numbered rows with giant outlined SVG digits (`1`–`10`), category filter pills (`Series`, `Films`, `New & Hot`, `Categories ▾`), framed vertical mobile hero card + widescreen desktop hero carousel, multi-profile `"Who's watching?"` switcher with Kids Mode, floating 3-reaction thumbs bar (`Not for me` / `I like this` / `Love this!`), and the **My Anora** hub with saved moments and lists.
- **JustWatch Regional Availability**: Region-aware (`/watch/providers`) streaming, rent, buy, and free options across India (`IN`), United States (`US`), United Kingdom (`GB`), Bangladesh (`BD`), Canada (`CA`), Australia (`AU`), Germany (`DE`), Japan (`JP`), South Korea (`KR`), and France (`FR`) with direct links and `"Available on My Services"` filtering.
- **IMDb Depth**: 1–10 personal star ratings, spoiler-tagged user reviews, full TV season & episode guides with stills and air dates, clickable cast & crew filmographies split by Acting / Directing / Writing, box office metadata, and CSV/JSON data export.

## Folder Structure

```text
anora/
├── src/
│   ├── types/
│   │   └── tmdb.ts               # Typed TMDB, JustWatch, Profile & Settings interfaces
│   ├── lib/
│   │   ├── seedData.ts           # Built-in 4K seed catalog for instant Demo Mode
│   │   ├── tmdb.ts               # Central TMDB v3/v4 API client, 6h cache & 429 retry
│   │   └── store.ts              # Client-side password hash & localStorage persistence
│   ├── hooks/
│   │   └── useDebounce.ts        # Debounced search hook
│   ├── components/
│   │   ├── HeroBanner.tsx        # Netflix Mobile framed vertical & widescreen hero
│   │   ├── MediaCard.tsx         # Poster card with Top 10 giant SVG numbers & badges
│   │   ├── MediaRow.tsx          # Horizontal peek-scroll carousel row
│   │   ├── ProviderBadge.tsx     # JustWatch streaming service badge & deep link
│   │   ├── RatingStars.tsx       # Netflix 3-thumb pill + IMDb 1-10 star rating
│   │   ├── SkeletonRow.tsx       # Shimmer skeleton row
│   │   └── Modals.tsx            # Trailer, Rating/Review, Custom Lists, Categories & AI
│   ├── pages/
│   │   ├── AuthAndOnboarding.tsx # Sign Up/In, "Who's Watching?", 3-step Onboarding
│   │   ├── Home.tsx              # Home feed, Top 10, Continue Watching, AI rows
│   │   ├── SearchAndDiscover.tsx # Instant /search/multi + full /discover with presets
│   │   ├── TitleDetail.tsx       # Movie/TV detail, Where to Watch, Episodes, Cast/Crew
│   │   ├── PersonDetail.tsx      # Actor/Director bio & department-split filmography
│   │   ├── MyAnora.tsx           # My Netflix-style hub, Watchlist CSV export, Lists
│   │   └── Settings.tsx          # 7-section Settings & live TMDB API key validator
│   └── App.tsx                   # Root navigation, keyboard shortcuts, and layout shell
├── package.json
└── README.md
```

## How to Get & Connect a Free TMDB API Key

1. Sign up or log in at [themoviedb.org](https://www.themoviedb.org/).
2. Visit [themoviedb.org/settings/api](https://www.themoviedb.org/settings/api) and copy either your **v3 API Key** (32-character hex string) or your **v4 Read Access Bearer Token** (`eyJ...`).
3. Inside Anora, open **Settings & API** (gear icon in the top header) and paste your key into **TMDB API Key**, then click **Validate & Save**.
4. Anora automatically detects v3 vs. v4 tokens, runs a live test request against `https://api.themoviedb.org/3/configuration`, displays `✅ Connected`, and caches responses for 6 hours in `localStorage`.

## Running Locally

```bash
npm install
npm run dev
```
