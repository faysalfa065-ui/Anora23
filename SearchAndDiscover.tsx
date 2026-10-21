import React, { useState } from 'react';
import {
  Search,
  X,
  Clock,
  TrendingUp,
  SlidersHorizontal,
  Bookmark,
  Trash2,
  User,
} from 'lucide-react';
import {
  FilterPreset,
  ImageQuality,
  MediaItem,
  PersonDetail,
  UserRatingEntry,
  WatchlistEntry,
} from '../types/tmdb';
import { GENRES, SEED_PEOPLE, STREAMING_PROVIDERS } from '../lib/seedData';
import { getTmdbImageUrl, tmdbRequest, normalizeTmdbItem } from '../lib/tmdb';
import { useDebounce } from '../hooks/useDebounce';
import { MediaCard } from '../components/MediaCard';

// 1. Instant Debounced Search Screen (Movies / TV / People + Filters + Recent Searches)
interface SearchPageProps {
  catalog: MediaItem[];
  apiKey: string;
  imageQuality: ImageQuality;
  recentSearches: string[];
  watchlist: WatchlistEntry[];
  ratings: Record<string, UserRatingEntry>;
  onAddRecentSearch: (q: string) => void;
  onClearRecentSearches: () => void;
  onSelectMedia: (item: MediaItem) => void;
  onSelectPerson: (personId: number) => void;
  onToggleWatchlist: (item: MediaItem, e: React.MouseEvent) => void;
  onQuickRate: (item: MediaItem, e: React.MouseEvent) => void;
}

export const SearchPage: React.FC<SearchPageProps> = ({
  catalog,
  apiKey,
  imageQuality,
  recentSearches,
  watchlist,
  ratings,
  onAddRecentSearch,
  onClearRecentSearches,
  onSelectMedia,
  onSelectPerson,
  onToggleWatchlist,
  onQuickRate,
}) => {
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'movie' | 'tv' | 'person'>('all');
  const [minRating, setMinRating] = useState<number>(0);
  const [selectedGenre, setSelectedGenre] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<'popularity' | 'rating' | 'year'>('popularity');
  const [liveResults, setLiveResults] = useState<MediaItem[] | null>(null);
  const [visibleCount, setVisibleCount] = useState(12);

  const debouncedQuery = useDebounce(query, 280);

  React.useEffect(() => {
    let cancelled = false;
    async function runLiveSearch() {
      if (!debouncedQuery.trim()) {
        setLiveResults(null);
        return;
      }
      onAddRecentSearch(debouncedQuery.trim());
      if (apiKey.trim()) {
        const res = await tmdbRequest<{ results: Record<string, any>[] }>(
          '/search/multi',
          apiKey,
          { query: debouncedQuery.trim() }
        );
        if (!cancelled && res?.results) {
          const mapped = res.results
            .filter((r) => r.media_type === 'movie' || r.media_type === 'tv')
            .map((r) => normalizeTmdbItem(r));
          if (mapped.length > 0) {
            setLiveResults(mapped);
            return;
          }
        }
      }
      setLiveResults(null);
    }
    runLiveSearch();
    return () => {
      cancelled = true;
    };
  }, [debouncedQuery, apiKey]);

  const basePool = liveResults || catalog;
  const matchedMedia = basePool
    .filter((item) => {
      if (activeTab === 'movie' && item.media_type !== 'movie') return false;
      if (activeTab === 'tv' && item.media_type !== 'tv') return false;
      if (minRating > 0 && item.vote_average < minRating) return false;
      if (selectedGenre && !item.genre_ids.includes(selectedGenre)) return false;
      if (!debouncedQuery.trim()) return true;
      const q = debouncedQuery.toLowerCase();
      return (
        item.title.toLowerCase().includes(q) ||
        item.overview.toLowerCase().includes(q) ||
        (item.keywords || []).some((k) => k.toLowerCase().includes(q))
      );
    })
    .sort((a, b) => {
      if (sortBy === 'rating') return b.vote_average - a.vote_average;
      if (sortBy === 'year') return b.year - a.year;
      return b.popularity - a.popularity;
    });

  const matchedPeople: PersonDetail[] = SEED_PEOPLE.filter((p) => {
    if (!debouncedQuery.trim()) return true;
    return p.name.toLowerCase().includes(debouncedQuery.toLowerCase());
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 pb-24 space-y-5">
      {/* Search Input Bar */}
      <div className="relative">
        <Search className="w-5 h-5 text-zinc-400 absolute left-4 top-1/2 -translate-y-1/2" />
        <input
          id="anora-search-input"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search movies, series, actors, directors, or IMAX keywords..."
          className="w-full pl-12 pr-10 py-3.5 rounded-2xl bg-[#141416] border border-white/15 text-sm sm:text-base text-white focus:border-[#F5C518] focus:outline-none shadow-lg"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery('')}
            aria-label="Clear search query"
            className="absolute right-3.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-zinc-300"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Recent & Trending Searches */}
      {!query.trim() && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-[#141416] border border-white/10 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase text-zinc-400 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#F5C518]" /> Recent Searches
              </span>
              {recentSearches.length > 0 && (
                <button
                  type="button"
                  onClick={onClearRecentSearches}
                  className="text-[11px] font-bold text-zinc-400 hover:text-red-400"
                >
                  Clear
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {recentSearches.map((term) => (
                <button
                  key={term}
                  type="button"
                  onClick={() => setQuery(term)}
                  className="px-3 py-1 rounded-full bg-black/50 hover:bg-white/10 border border-white/10 text-xs text-zinc-200"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#141416] border border-white/10 space-y-2.5">
            <span className="text-xs font-extrabold uppercase text-zinc-400 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-[#E50914]" /> Trending Searches Today
            </span>
            <div className="flex flex-wrap gap-1.5">
              {[
                'Solaris Monolith',
                'Grand Budapest Syndicate',
                'Stranger Things',
                'Dune Messiah',
                'Severance',
                'Elena Vance',
              ].map((term) => (
                <button
                  key={term}
                  type="button"
                  onClick={() => setQuery(term)}
                  className="px-3 py-1 rounded-full bg-[#F5C518]/10 hover:bg-[#F5C518]/20 border border-[#F5C518]/30 text-xs font-semibold text-[#F5C518]"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tabs & Filter Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
        <div className="flex items-center gap-1.5">
          {(
            [
              { id: 'all', label: `All (${matchedMedia.length + matchedPeople.length})` },
              { id: 'movie', label: 'Movies' },
              { id: 'tv', label: 'TV Series' },
              { id: 'person', label: `People (${matchedPeople.length})` },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTab(t.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all ${
                activeTab === t.id
                  ? 'bg-[#F5C518] text-black'
                  : 'bg-[#141416] text-zinc-300 hover:text-white'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedGenre || ''}
            onChange={(e) =>
              setSelectedGenre(e.target.value ? Number(e.target.value) : null)
            }
            aria-label="Filter by Genre"
            className="px-3 py-1.5 rounded-xl bg-[#141416] border border-white/15 text-xs font-bold text-white"
          >
            <option value="">All Genres</option>
            {GENRES.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>

          <select
            value={minRating}
            onChange={(e) => setMinRating(Number(e.target.value))}
            aria-label="Minimum Rating"
            className="px-3 py-1.5 rounded-xl bg-[#141416] border border-white/15 text-xs font-bold text-white"
          >
            <option value={0}>Any Rating</option>
            <option value={8}>★ 8.0+</option>
            <option value={8.5}>★ 8.5+</option>
            <option value={9}>★ 9.0+</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'popularity' | 'rating' | 'year')}
            aria-label="Sort results"
            className="px-3 py-1.5 rounded-xl bg-[#141416] border border-white/15 text-xs font-bold text-white"
          >
            <option value="popularity">Sort: Popularity</option>
            <option value="rating">Sort: IMDb Rating</option>
            <option value="year">Sort: Release Year</option>
          </select>
        </div>
      </div>

      {/* People Results */}
      {(activeTab === 'all' || activeTab === 'person') && matchedPeople.length > 0 && (
        <div className="space-y-2.5">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-zinc-400">
            Cast & Filmmakers
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {matchedPeople.map((person) => (
              <button
                key={person.id}
                type="button"
                onClick={() => onSelectPerson(person.id)}
                className="flex items-center gap-3 p-3 rounded-2xl bg-[#141416] border border-white/10 hover:border-[#F5C518] text-left"
              >
                <img
                  src={getTmdbImageUrl(person.profile_path, 'w500', person.name)}
                  alt={person.name}
                  className="w-12 h-12 rounded-xl object-cover shrink-0"
                />
                <div className="min-w-0">
                  <div className="text-xs font-black text-white truncate">{person.name}</div>
                  <div className="text-[11px] text-[#F5C518]">{person.known_for_department}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Media Grid Results */}
      {activeTab !== 'person' && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-3.5 justify-center sm:justify-start">
            {matchedMedia.slice(0, visibleCount).map((item) => {
              const key = `${item.media_type}-${item.id}`;
              const inList = watchlist.some(
                (w) => w.mediaId === item.id && w.mediaType === item.media_type
              );
              return (
                <MediaCard
                  key={key}
                  item={item}
                  imageQuality={imageQuality}
                  inWatchlist={inList}
                  userRating={ratings[key]?.rating}
                  userThumb={ratings[key]?.thumb}
                  onSelect={onSelectMedia}
                  onToggleWatchlist={onToggleWatchlist}
                  onQuickRate={onQuickRate}
                />
              );
            })}
          </div>

          {matchedMedia.length > visibleCount && (
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setVisibleCount((c) => c + 12)}
                className="px-6 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-black text-white"
              >
                Load More Results
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// 2. Full TMDB Discover & Filter Presets Screen
interface DiscoverPageProps {
  catalog: MediaItem[];
  region: string;
  imageQuality: ImageQuality;
  watchlist: WatchlistEntry[];
  ratings: Record<string, UserRatingEntry>;
  savedPresets: FilterPreset[];
  onSavePreset: (preset: Omit<FilterPreset, 'id'>) => void;
  onDeletePreset: (id: string) => void;
  onSelectMedia: (item: MediaItem) => void;
  onToggleWatchlist: (item: MediaItem, e: React.MouseEvent) => void;
  onQuickRate: (item: MediaItem, e: React.MouseEvent) => void;
}

export const DiscoverPage: React.FC<DiscoverPageProps> = ({
  catalog,
  region,
  imageQuality,
  watchlist,
  ratings,
  savedPresets,
  onSavePreset,
  onDeletePreset,
  onSelectMedia,
  onToggleWatchlist,
  onQuickRate,
}) => {
  const [mediaType, setMediaType] = useState<'all' | 'movie' | 'tv'>('all');
  const [genreId, setGenreId] = useState<number | null>(null);
  const [providerId, setProviderId] = useState<number | null>(null);
  const [minRating, setMinRating] = useState<number>(7.5);
  const [yearFrom, setYearFrom] = useState<number>(2020);
  const [yearTo, setYearTo] = useState<number>(2026);
  const [maxRuntime, setMaxRuntime] = useState<number>(200);
  const [language, setLanguage] = useState<string>('all');
  const [sortBy, setSortBy] = useState<
    'popularity.desc' | 'vote_average.desc' | 'release_date.desc'
  >('popularity.desc');
  const [presetName, setPresetName] = useState('');

  const applyPreset = (p: FilterPreset) => {
    setMediaType(p.mediaType);
    setGenreId(p.genreId);
    setProviderId(p.providerId);
    setMinRating(p.minRating);
    setYearFrom(p.yearFrom);
    setYearTo(p.yearTo);
    setMaxRuntime(p.maxRuntime);
    setLanguage(p.language);
    setSortBy(p.sortBy);
  };

  const handleCreatePreset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!presetName.trim()) return;
    onSavePreset({
      name: presetName.trim(),
      mediaType,
      genreId,
      providerId,
      minRating,
      yearFrom,
      yearTo,
      maxRuntime,
      language,
      sortBy,
    });
    setPresetName('');
  };

  const filtered = catalog
    .filter((item) => {
      if (mediaType !== 'all' && item.media_type !== mediaType) return false;
      if (genreId && !item.genre_ids.includes(genreId)) return false;
      if (item.vote_average < minRating) return false;
      if (item.year < yearFrom || item.year > yearTo) return false;
      if (item.runtime && item.runtime > maxRuntime) return false;
      if (language !== 'all' && item.original_language !== language) return false;
      if (providerId) {
        const flatrate = item.watch_providers?.[region]?.flatrate || [];
        if (flatrate.length > 0 && !flatrate.some((p) => p.provider_id === providerId)) {
          return false;
        }
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'vote_average.desc') return b.vote_average - a.vote_average;
      if (sortBy === 'release_date.desc') return b.year - a.year;
      return b.popularity - a.popularity;
    });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 pb-24 space-y-6">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar Filters */}
        <aside className="w-full md:w-72 shrink-0 p-4 rounded-2xl bg-[#141416] border border-white/10 space-y-4 h-fit">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black uppercase tracking-wider text-[#F5C518] flex items-center gap-1.5">
              <SlidersHorizontal className="w-4 h-4" />
              <span>Discover Filters</span>
            </h2>
            <button
              type="button"
              onClick={() => {
                setMediaType('all');
                setGenreId(null);
                setProviderId(null);
                setMinRating(0);
                setYearFrom(2000);
                setYearTo(2026);
                setMaxRuntime(240);
                setLanguage('all');
              }}
              className="text-[11px] font-bold text-zinc-400 hover:text-white"
            >
              Reset
            </button>
          </div>

          {/* Media Type */}
          <div>
            <label className="block text-[11px] font-bold text-zinc-400 mb-1.5">Format</label>
            <div className="grid grid-cols-3 gap-1.5">
              {(['all', 'movie', 'tv'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setMediaType(t)}
                  className={`py-1.5 rounded-lg text-xs font-bold uppercase ${
                    mediaType === t ? 'bg-[#F5C518] text-black' : 'bg-black/50 text-zinc-300'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Streaming Provider Logos */}
          <div>
            <label className="block text-[11px] font-bold text-zinc-400 mb-1.5">
              Streaming Service ({region})
            </label>
            <div className="flex flex-wrap gap-1.5">
              {STREAMING_PROVIDERS.map((p) => (
                <button
                  key={p.provider_id}
                  type="button"
                  onClick={() =>
                    setProviderId((prev) => (prev === p.provider_id ? null : p.provider_id))
                  }
                  style={{
                    backgroundColor: providerId === p.provider_id ? p.color : '#0A0A0B',
                    color: '#FFF',
                  }}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-black border ${
                    providerId === p.provider_id
                      ? 'border-[#F5C518] scale-105'
                      : 'border-white/15 opacity-75 hover:opacity-100'
                  }`}
                >
                  {p.provider_name}
                </button>
              ))}
            </div>
          </div>

          {/* Genre Select */}
          <div>
            <label className="block text-[11px] font-bold text-zinc-400 mb-1">Genre</label>
            <select
              value={genreId || ''}
              onChange={(e) => setGenreId(e.target.value ? Number(e.target.value) : null)}
              aria-label="Discover Genre"
              className="w-full px-3 py-2 rounded-xl bg-black border border-white/15 text-xs font-bold text-white"
            >
              <option value="">All Genres</option>
              {GENRES.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
          </div>

          {/* Rating Slider */}
          <div>
            <div className="flex justify-between text-[11px] font-bold text-zinc-300 mb-1">
              <span>Minimum IMDb / TMDB Score</span>
              <span className="text-[#F5C518]">★ {minRating.toFixed(1)}+</span>
            </div>
            <input
              type="range"
              min={0}
              max={9.5}
              step={0.5}
              value={minRating}
              onChange={(e) => setMinRating(Number(e.target.value))}
              className="w-full accent-[#F5C518]"
            />
          </div>

          {/* Runtime Slider */}
          <div>
            <div className="flex justify-between text-[11px] font-bold text-zinc-300 mb-1">
              <span>Max Runtime</span>
              <span className="text-[#F5C518]">≤ {maxRuntime} min</span>
            </div>
            <input
              type="range"
              min={30}
              max={240}
              step={10}
              value={maxRuntime}
              onChange={(e) => setMaxRuntime(Number(e.target.value))}
              className="w-full accent-[#F5C518]"
            />
          </div>

          {/* Language & Sort */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] font-bold text-zinc-400 mb-1">Language</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                aria-label="Filter Language"
                className="w-full px-2.5 py-1.5 rounded-lg bg-black border border-white/15 text-xs text-white"
              >
                <option value="all">All</option>
                <option value="en">English</option>
                <option value="hi">Hindi</option>
                <option value="ko">Korean</option>
                <option value="ja">Japanese</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-zinc-400 mb-1">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                aria-label="Sort Discover"
                className="w-full px-2.5 py-1.5 rounded-lg bg-black border border-white/15 text-xs text-white"
              >
                <option value="popularity.desc">Popularity</option>
                <option value="vote_average.desc">Top Rated</option>
                <option value="release_date.desc">Newest</option>
              </select>
            </div>
          </div>

          {/* Save Filter Preset */}
          <form onSubmit={handleCreatePreset} className="pt-3 border-t border-white/10 space-y-2">
            <label className="block text-[11px] font-bold text-zinc-300">
              Save Current Filter Preset
            </label>
            <div className="flex gap-1.5">
              <input
                type="text"
                value={presetName}
                onChange={(e) => setPresetName(e.target.value)}
                placeholder="Preset name..."
                className="flex-1 px-2.5 py-1.5 rounded-lg bg-black border border-white/15 text-xs text-white"
              />
              <button
                type="submit"
                className="px-3 py-1.5 rounded-lg bg-[#F5C518] text-black text-xs font-black"
              >
                Save
              </button>
            </div>
          </form>

          {savedPresets.length > 0 && (
            <div className="space-y-1.5">
              <div className="text-[10px] font-bold uppercase text-zinc-400">Saved Presets</div>
              {savedPresets.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-black/60 border border-white/10 text-xs"
                >
                  <button
                    type="button"
                    onClick={() => applyPreset(p)}
                    className="font-bold text-[#F5C518] hover:underline truncate flex items-center gap-1"
                  >
                    <Bookmark className="w-3 h-3" /> {p.name}
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeletePreset(p.id)}
                    aria-label={`Delete preset ${p.name}`}
                    className="text-zinc-500 hover:text-red-400"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </aside>

        {/* Discover Grid */}
        <div className="flex-1 space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-lg sm:text-xl font-black text-white">
              Discover Catalog ({filtered.length} Titles)
            </h1>
          </div>

          <div className="flex flex-wrap gap-3.5 justify-center sm:justify-start">
            {filtered.map((item) => {
              const key = `${item.media_type}-${item.id}`;
              const inList = watchlist.some(
                (w) => w.mediaId === item.id && w.mediaType === item.media_type
              );
              return (
                <MediaCard
                  key={key}
                  item={item}
                  imageQuality={imageQuality}
                  inWatchlist={inList}
                  userRating={ratings[key]?.rating}
                  userThumb={ratings[key]?.thumb}
                  onSelect={onSelectMedia}
                  onToggleWatchlist={onToggleWatchlist}
                  onQuickRate={onQuickRate}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
