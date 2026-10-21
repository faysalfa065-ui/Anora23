import { IMG_HERO_NOIR, IMG_POSTER_MONOLITH, IMG_POSTER_GRANDHOTEL } from './seedData';
import {
  AccountUser,
  AppSettings,
  ProfileData,
} from '../types/tmdb';

const STORAGE_KEY = 'anora_app_state_v1';

export function hashPasswordClientSide(rawPassword: string): string {
  let hash = 5381;
  const salted = `anora_salt_2025::${rawPassword}`;
  for (let i = 0; i < salted.length; i++) {
    hash = (hash * 33) ^ salted.charCodeAt(i);
  }
  return `h_${(hash >>> 0).toString(16).padStart(8, '0')}`;
}

export const DEFAULT_SETTINGS: AppSettings = {
  tmdbApiKey: '',
  tmdbKeyStatus: 'untested',
  region: 'IN',
  language: 'en-US',
  includeAdult: false,
  autoplayTrailers: false,
  imageQuality: 'w780',
  reduceMotion: false,
  theme: 'dark',
  layoutPreview: 'auto',
  enableAiRecommendations: true,
  llmProvider: 'gemini',
  llmApiKey: '',
};

export const INITIAL_PROFILES: ProfileData[] = [
  {
    id: 'prof_arin',
    name: 'Arin',
    avatarId: 'gold-crown',
    avatarColor: 'from-amber-500 to-yellow-700',
    avatarEmoji: '👑',
    isKids: false,
    onboardingCompleted: true,
    favoriteTitleIds: [1001, 1002, 1004, 1005, 1013],
    preferredProviders: [8, 119, 337, 220, 350],
    watchlist: [
      {
        mediaId: 1001,
        mediaType: 'movie',
        title: 'Solaris Monolith: Horizon',
        poster_path: IMG_POSTER_MONOLITH,
        backdrop_path: IMG_HERO_NOIR,
        year: 2025,
        vote_average: 8.9,
        runtime: 158,
        genre_ids: [878, 12, 18],
        addedAt: '2025-10-14T18:30:00Z',
        watched: false,
      },
      {
        mediaId: 1002,
        mediaType: 'tv',
        title: 'The Grand Budapest Syndicate',
        poster_path: IMG_POSTER_GRANDHOTEL,
        backdrop_path: null,
        year: 2025,
        vote_average: 8.8,
        runtime: 56,
        genre_ids: [80, 18, 9648],
        addedAt: '2025-10-15T20:00:00Z',
        watched: false,
      },
      {
        mediaId: 1006,
        mediaType: 'tv',
        title: 'Stranger Things: The Final Crawl',
        poster_path: null,
        backdrop_path: null,
        year: 2025,
        vote_average: 8.8,
        runtime: 72,
        genre_ids: [10765, 9648, 18],
        addedAt: '2025-10-18T11:20:00Z',
        watched: true,
      },
    ],
    ratings: {
      'movie-1001': {
        mediaId: 1001,
        mediaType: 'movie',
        title: 'Solaris Monolith: Horizon',
        poster_path: IMG_POSTER_MONOLITH,
        year: 2025,
        genre_ids: [878, 12, 18],
        rating: 10,
        thumb: 'love',
        ratedAt: '2025-10-16T21:00:00Z',
      },
      'tv-1002': {
        mediaId: 1002,
        mediaType: 'tv',
        title: 'The Grand Budapest Syndicate',
        poster_path: IMG_POSTER_GRANDHOTEL,
        year: 2025,
        genre_ids: [80, 18, 9648],
        rating: 9,
        thumb: 'love',
        ratedAt: '2025-10-17T19:00:00Z',
      },
      'tv-1005': {
        mediaId: 1005,
        mediaType: 'tv',
        title: 'Peaky Blinders: The Immortal Man',
        poster_path: null,
        year: 2025,
        genre_ids: [80, 18, 36],
        rating: 9,
        thumb: 'like',
        ratedAt: '2025-10-18T09:15:00Z',
      },
    },
    reviews: [
      {
        id: 'rev_1',
        mediaId: 1001,
        mediaType: 'movie',
        mediaTitle: 'Solaris Monolith: Horizon',
        mediaPoster: IMG_POSTER_MONOLITH,
        mediaYear: 2025,
        rating: 10,
        thumb: 'love',
        headline: 'A transcendent 70mm sci-fi landmark',
        content:
          'From the first harmonic pulse on the desert exoplanet to the final temporal inversion, Denis Laurent crafts an unforgettable theatre experience.',
        containsSpoilers: false,
        createdAt: '2025-10-16T21:05:00Z',
        updatedAt: '2025-10-16T21:05:00Z',
        episodeTag: 'Starts at 49:20 • IMAX Sequence',
      },
      {
        id: 'rev_2',
        mediaId: 1002,
        mediaType: 'tv',
        mediaTitle: 'The Grand Budapest Syndicate',
        mediaPoster: IMG_POSTER_GRANDHOTEL,
        mediaYear: 2025,
        rating: 9,
        thumb: 'love',
        headline: 'The chandelier cipher twist in S1:E4 is pure genius',
        content:
          'When Contessa Sofia reveals the true owner of Suite 404 on the Zurich express, every clue from Episode 1 clicks into place.',
        containsSpoilers: true,
        createdAt: '2025-10-17T19:20:00Z',
        updatedAt: '2025-10-17T19:20:00Z',
        episodeTag: 'S1:E4 • Starts at 38:12',
      },
    ],
    customLists: [
      {
        id: 'list_sunday_binge',
        name: 'Sunday Binge & Neo-Noir',
        description: 'Atmospheric thrillers, espionage sagas, and mind-bending sci-fi for late-night viewing.',
        isPublic: true,
        createdAt: '2025-10-12T12:00:00Z',
        items: [
          {
            mediaId: 1001,
            mediaType: 'movie',
            title: 'Solaris Monolith: Horizon',
            poster_path: IMG_POSTER_MONOLITH,
            year: 2025,
            vote_average: 8.9,
          },
          {
            mediaId: 1002,
            mediaType: 'tv',
            title: 'The Grand Budapest Syndicate',
            poster_path: IMG_POSTER_GRANDHOTEL,
            year: 2025,
            vote_average: 8.8,
          },
          {
            mediaId: 1003,
            mediaType: 'tv',
            title: 'Neon Rain: Cyber Protocol',
            poster_path: null,
            year: 2025,
            vote_average: 8.7,
          },
        ],
      },
      {
        id: 'list_best_2025',
        name: 'Best of 2025 IMAX & Prestige',
        description: 'Top-rated theatrical releases and prestige series of the year.',
        isPublic: true,
        createdAt: '2025-10-14T15:00:00Z',
        items: [
          {
            mediaId: 1004,
            mediaType: 'movie',
            title: 'Dune: Messiah of Arrakis',
            poster_path: null,
            year: 2025,
            vote_average: 9.1,
          },
          {
            mediaId: 1013,
            mediaType: 'tv',
            title: 'Severance: Cold Harbor',
            poster_path: null,
            year: 2025,
            vote_average: 9.1,
          },
        ],
      },
    ],
    watchHistory: [
      {
        mediaId: 1002,
        mediaType: 'tv',
        title: 'The Grand Budapest Syndicate',
        poster_path: IMG_POSTER_GRANDHOTEL,
        backdrop_path: null,
        year: 2025,
        progressPercent: 74,
        lastEpisode: 'S2:E2 • Monsoon in Mumbai',
        timestampLabel: '14m left',
        viewedAt: '2025-10-20T22:15:00Z',
        genre_ids: [80, 18, 9648],
      },
      {
        mediaId: 1001,
        mediaType: 'movie',
        title: 'Solaris Monolith: Horizon',
        poster_path: IMG_POSTER_MONOLITH,
        backdrop_path: IMG_HERO_NOIR,
        year: 2025,
        progressPercent: 62,
        lastEpisode: 'Feature Film',
        timestampLabel: '58m left',
        viewedAt: '2025-10-19T23:00:00Z',
        genre_ids: [878, 12, 18],
      },
      {
        mediaId: 1003,
        mediaType: 'tv',
        title: 'Neon Rain: Cyber Protocol',
        poster_path: null,
        backdrop_path: IMG_HERO_NOIR,
        year: 2025,
        progressPercent: 40,
        lastEpisode: 'S1:E2 • Chrome & Amber',
        timestampLabel: '29m left',
        viewedAt: '2025-10-18T21:40:00Z',
        genre_ids: [10765, 80, 10759],
      },
    ],
    recentSearches: ['Solaris Monolith', 'Peaky Blinders', 'Elena Vance', 'Sci-Fi 4K'],
    savedFilterPresets: [
      {
        id: 'preset_scifi_india',
        name: 'Sci-Fi 8.5+ on My Services',
        mediaType: 'all',
        genreId: 878,
        providerId: 8,
        minRating: 8.5,
        yearFrom: 2020,
        yearTo: 2026,
        maxRuntime: 240,
        language: 'all',
        sortBy: 'vote_average.desc',
      },
    ],
  },
  {
    id: 'prof_maya',
    name: 'Maya',
    avatarId: 'crimson-smile',
    avatarColor: 'from-red-600 to-rose-800',
    avatarEmoji: '😎',
    isKids: false,
    onboardingCompleted: true,
    favoriteTitleIds: [1002, 1008, 1011, 1013, 1014],
    preferredProviders: [8, 350, 11],
    watchlist: [],
    ratings: {},
    reviews: [],
    customLists: [],
    watchHistory: [],
    recentSearches: ['Anora', 'Bridgerton', 'Severance'],
    savedFilterPresets: [],
  },
  {
    id: 'prof_kids',
    name: 'Kids',
    avatarId: 'kids-panda',
    avatarColor: 'from-pink-500 to-orange-500',
    avatarEmoji: '🐼',
    isKids: true,
    onboardingCompleted: true,
    favoriteTitleIds: [1010, 1012, 1014],
    preferredProviders: [8, 337],
    watchlist: [],
    ratings: {},
    reviews: [],
    customLists: [],
    watchHistory: [],
    recentSearches: ['Astrobots', 'One Piece', 'Spider-Verse'],
    savedFilterPresets: [],
  },
];

export interface PersistedAppState {
  account: AccountUser | null;
  activeProfileId: string | null;
  profiles: ProfileData[];
  settings: AppSettings;
}

export function loadPersistedState(): PersistedAppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        account: parsed.account ?? {
          id: 'usr_demo',
          name: 'Arin Vance',
          email: 'arin@anora.cinema',
          passwordHash: hashPasswordClientSide('anora2025'),
          createdAt: '2025-10-01T10:00:00Z',
        },
        activeProfileId: parsed.activeProfileId ?? 'prof_arin',
        profiles: Array.isArray(parsed.profiles) && parsed.profiles.length > 0 ? parsed.profiles : INITIAL_PROFILES,
        settings: { ...DEFAULT_SETTINGS, ...(parsed.settings || {}) },
      };
    }
  } catch {
    // Fallback
  }
  return {
    account: {
      id: 'usr_demo',
      name: 'Arin Vance',
      email: 'arin@anora.cinema',
      passwordHash: hashPasswordClientSide('anora2025'),
      createdAt: '2025-10-01T10:00:00Z',
    },
    activeProfileId: 'prof_arin',
    profiles: INITIAL_PROFILES,
    settings: DEFAULT_SETTINGS,
  };
}

export function savePersistedState(state: PersistedAppState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore storage quota exceptions in sandboxed iframe
  }
}
