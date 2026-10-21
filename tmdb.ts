export type MediaType = 'movie' | 'tv';
export type ThumbReaction = 'dislike' | 'like' | 'love' | null;
export type ImageQuality = 'w500' | 'w780' | 'original';
export type ThemeMode = 'dark' | 'amoled' | 'system';
export type LayoutPreviewMode = 'auto' | 'mobile' | 'desktop';

export interface Genre {
  id: number;
  name: string;
}

export interface WatchProviderItem {
  provider_id: number;
  provider_name: string;
  logo_path?: string;
  short_name: string;
  color: string;
  textColor?: string;
  monetization_type: 'flatrate' | 'rent' | 'buy' | 'free';
  quality?: '4K' | 'HD' | 'SD';
  price?: string;
  link?: string;
}

export interface RegionalWatchProviders {
  link: string;
  flatrate?: WatchProviderItem[];
  rent?: WatchProviderItem[];
  buy?: WatchProviderItem[];
  free?: WatchProviderItem[];
}

export interface CastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
  order: number;
  known_for_department?: string;
}

export interface CrewMember {
  id: number;
  name: string;
  job: string;
  department: string;
  profile_path: string | null;
}

export interface VideoTrailer {
  id: string;
  key: string;
  name: string;
  site: 'YouTube' | string;
  type: 'Trailer' | 'Teaser' | 'Featurette' | 'Clip';
  official: boolean;
}

export interface EpisodeItem {
  id: number;
  episode_number: number;
  season_number: number;
  name: string;
  overview: string;
  air_date: string;
  runtime: number;
  vote_average: number;
  still_path: string | null;
}

export interface SeasonItem {
  id: number;
  season_number: number;
  name: string;
  overview: string;
  episode_count: number;
  air_date: string;
  poster_path: string | null;
  episodes: EpisodeItem[];
}

export interface MediaItem {
  id: number;
  media_type: MediaType;
  title: string;
  original_title?: string;
  tagline?: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  year: number;
  vote_average: number;
  vote_count: number;
  imdb_rating?: number;
  popularity: number;
  genre_ids: number[];
  genres?: Genre[];
  runtime?: number; // minutes (or episode runtime for TV)
  certification?: string;
  status?: string;
  original_language: string;
  budget?: number;
  revenue?: number;
  production_companies?: string[];
  keywords?: string[];
  number_of_seasons?: number;
  number_of_episodes?: number;
  top10_rank?: number;
  badge?: string; // e.g. 'New Season', 'New Episode', 'IMAX', 'Only on Anora'
  is_kids_safe?: boolean;
  credits?: {
    cast: CastMember[];
    crew: CrewMember[];
  };
  videos?: VideoTrailer[];
  images?: {
    backdrops: string[];
    posters: string[];
  };
  seasons?: SeasonItem[];
  watch_providers?: Record<string, RegionalWatchProviders>;
  similar_ids?: number[];
  recommendation_ids?: number[];
}

export interface PersonCreditItem {
  id: number;
  media_type: MediaType;
  title: string;
  year: number;
  role: string;
  department: 'Acting' | 'Directing' | 'Writing';
  vote_average: number;
  poster_path: string | null;
}

export interface PersonDetail {
  id: number;
  name: string;
  biography: string;
  birthday: string;
  place_of_birth: string;
  known_for_department: string;
  profile_path: string | null;
  also_known_as?: string[];
  credits: PersonCreditItem[];
}

export interface UserReview {
  id: string;
  mediaId: number;
  mediaType: MediaType;
  mediaTitle: string;
  mediaPoster: string | null;
  mediaYear: number;
  rating: number; // 1-10
  thumb: ThumbReaction;
  headline: string;
  content: string;
  containsSpoilers: boolean;
  createdAt: string;
  updatedAt: string;
  episodeTag?: string; // e.g. 'S1:E4 • Starts at 42:10'
}

export interface UserRatingEntry {
  mediaId: number;
  mediaType: MediaType;
  title: string;
  poster_path: string | null;
  year: number;
  genre_ids: number[];
  rating: number; // 1-10
  thumb: ThumbReaction;
  ratedAt: string;
}

export interface WatchlistEntry {
  mediaId: number;
  mediaType: MediaType;
  title: string;
  poster_path: string | null;
  backdrop_path: string | null;
  year: number;
  vote_average: number;
  runtime?: number;
  genre_ids: number[];
  addedAt: string;
  watched: boolean;
}

export interface WatchHistoryEntry {
  mediaId: number;
  mediaType: MediaType;
  title: string;
  poster_path: string | null;
  backdrop_path: string | null;
  year: number;
  progressPercent: number; // 10 - 100
  lastEpisode?: string; // e.g. 'S2:E5'
  timestampLabel?: string; // e.g. '24m left'
  viewedAt: string;
  genre_ids: number[];
}

export interface CustomList {
  id: string;
  name: string;
  description: string;
  isPublic: boolean;
  createdAt: string;
  items: {
    mediaId: number;
    mediaType: MediaType;
    title: string;
    poster_path: string | null;
    year: number;
    vote_average: number;
  }[];
}

export interface FilterPreset {
  id: string;
  name: string;
  mediaType: 'all' | MediaType;
  genreId: number | null;
  providerId: number | null;
  minRating: number;
  yearFrom: number;
  yearTo: number;
  maxRuntime: number;
  language: string;
  sortBy: 'popularity.desc' | 'vote_average.desc' | 'release_date.desc';
}

export interface ProfileData {
  id: string;
  name: string;
  avatarId: string;
  avatarColor: string;
  avatarEmoji: string;
  isKids: boolean;
  onboardingCompleted: boolean;
  favoriteTitleIds: number[];
  preferredProviders: number[]; // provider_ids
  watchlist: WatchlistEntry[];
  ratings: Record<string, UserRatingEntry>; // key: `${mediaType}-${mediaId}`
  reviews: UserReview[];
  customLists: CustomList[];
  watchHistory: WatchHistoryEntry[];
  recentSearches: string[];
  savedFilterPresets: FilterPreset[];
}

export interface AccountUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: string;
  isGuest?: boolean;
}

export interface AppSettings {
  tmdbApiKey: string;
  tmdbKeyStatus: 'untested' | 'valid' | 'invalid';
  tmdbKeyLastChecked?: string;
  region: string; // Default 'IN'
  language: string; // Default 'en-US'
  includeAdult: boolean;
  autoplayTrailers: boolean;
  imageQuality: ImageQuality;
  reduceMotion: boolean;
  theme: ThemeMode;
  layoutPreview: LayoutPreviewMode;
  enableAiRecommendations: boolean;
  llmProvider: 'gemini' | 'openai';
  llmApiKey: string;
}
