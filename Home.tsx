import React, { useState } from 'react';
import {
  ChevronDown,
  Sparkles,
  Key,
  Play,
  Info,
  Trash2,
  Check,
  Tv,
  SlidersHorizontal,
} from 'lucide-react';
import {
  ImageQuality,
  MediaItem,
  ProfileData,
  WatchHistoryEntry,
} from '../types/tmdb';
import { GENRES, STREAMING_PROVIDERS } from '../lib/seedData';
import { getTmdbImageUrl } from '../lib/tmdb';
import { HeroBanner } from '../components/HeroBanner';
import { MediaRow } from '../components/MediaRow';

interface HomePageProps {
  catalog: MediaItem[];
  profile: ProfileData;
  region: string;
  imageQuality: ImageQuality;
  reduceMotion: boolean;
  isMobileLayout: boolean;
  hasApiKey: boolean;
  enableAi: boolean;
  categoryTab: 'all' | 'tv' | 'movie' | 'new';
  selectedGenreId: number | null;
  selectedProviderId: number | null;
  onChangeCategoryTab: (tab: 'all' | 'tv' | 'movie' | 'new') => void;
  onOpenCategoriesDrawer: () => void;
  onOpenAiConcierge: () => void;
  onSelectMedia: (item: MediaItem) => void;
  onPlayTrailer: (item: MediaItem) => void;
  onToggleWatchlist: (item: MediaItem, e: React.MouseEvent) => void;
  onQuickRate: (item: MediaItem, e: React.MouseEvent) => void;
  onRemoveHistory: (mediaId: number, mediaType: 'movie' | 'tv') => void;
  onNavigateSettingsApi: () => void;
  onNavigateWatchlist: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  catalog,
  profile,
  region,
  imageQuality,
  reduceMotion,
  isMobileLayout,
  hasApiKey,
  enableAi,
  categoryTab,
  selectedGenreId,
  selectedProviderId,
  onChangeCategoryTab,
  onOpenCategoriesDrawer,
  onOpenAiConcierge,
  onSelectMedia,
  onPlayTrailer,
  onToggleWatchlist,
  onQuickRate,
  onRemoveHistory,
  onNavigateSettingsApi,
  onNavigateWatchlist,
}) => {
  const [onlyMyServices, setOnlyMyServices] = useState(false);
  const [showBlockedPreview, setShowBlockedPreview] = useState(false);

  const watchlistIds = new Set(
    profile.watchlist.map((w) => `${w.mediaType}-${w.mediaId}`)
  );

  // Filter catalog by Kids Mode, Category Pill, Genre, Provider, and "Available on Your Services"
  const filteredCatalog = catalog.filter((item) => {
    if (profile.isKids && !item.is_kids_safe) return false;
    if (categoryTab === 'tv' && item.media_type !== 'tv') return false;
    if (categoryTab === 'movie' && item.media_type !== 'movie') return false;
    if (categoryTab === 'new' && item.year < 2025) return false;
    if (selectedGenreId && !item.genre_ids.includes(selectedGenreId)) return false;
    if (selectedProviderId) {
      const regProv = item.watch_providers?.[region]?.flatrate || [];
      const matchesProv = regProv.some((p) => p.provider_id === selectedProviderId);
      if (!matchesProv && regProv.length > 0) return false;
    }
    if (onlyMyServices && profile.preferredProviders.length > 0) {
      const regProv = item.watch_providers?.[region]?.flatrate || [];
      if (
        regProv.length > 0 &&
        !regProv.some((p) => profile.preferredProviders.includes(p.provider_id))
      ) {
        return false;
      }
    }
    return true;
  });

  const displayItems = filteredCatalog.length > 0 ? filteredCatalog : catalog;

  // Compute local AI Match Scores based on favorites, watchlist, and ratings
  const favGenres = new Set<number>();
  profile.watchlist.forEach((w) => w.genre_ids.forEach((g) => favGenres.add(g)));
  Object.values(profile.ratings).forEach((r) => {
    if (r.rating >= 7 || r.thumb === 'love' || r.thumb === 'like') {
      r.genre_ids.forEach((g) => favGenres.add(g));
    }
  });

  const aiScores: Record<string, number> = {};
  displayItems.forEach((item) => {
    const key = `${item.media_type}-${item.id}`;
    const overlap = item.genre_ids.filter((g) => favGenres.has(g)).length;
    aiScores[key] = Math.min(99, Math.round(item.vote_average * 10 + overlap * 3));
  });

  const top10Items = [...displayItems]
    .sort((a, b) => (a.top10_rank || 99) - (b.top10_rank || 99))
    .slice(0, 10);

  const pickedForYou = [...displayItems].sort(
    (a, b) =>
      (aiScores[`${b.media_type}-${b.id}`] || 90) -
      (aiScores[`${a.media_type}-${a.id}`] || 90)
  );

  const onlyOnAnora = displayItems.filter(
    (i) => i.badge?.includes('Anora') || i.vote_average >= 8.7
  );

  const newReleases = displayItems.filter((i) => i.year >= 2025);
  const topRated = [...displayItems].sort((a, b) => b.vote_average - a.vote_average);
  const quickWatches = displayItems.filter(
    (i) => (i.runtime && i.runtime <= 60) || i.media_type === 'tv'
  );

  const watchlistMediaItems = profile.watchlist
    .map(
      (w) =>
        catalog.find((m) => m.id === w.mediaId && m.media_type === w.mediaType) || null
    )
    .filter(Boolean) as MediaItem[];

  const activeGenreName = selectedGenreId
    ? GENRES.find((g) => g.id === selectedGenreId)?.name
    : null;
  const activeProviderName = selectedProviderId
    ? STREAMING_PROVIDERS.find((p) => p.provider_id === selectedProviderId)?.provider_name
    : null;

  return (
    <div className="pb-24 space-y-2">
      {/* Seed Demo Mode / API Key Status Banner */}
      {!hasApiKey && (
        <div className="mx-4 sm:mx-6 mt-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-[#F5C518]/15 via-[#141416] to-[#E50914]/15 border border-[#F5C518]/30 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs text-zinc-200">
            <Key className="w-4 h-4 text-[#F5C518] shrink-0" />
            <span>
              <strong className="text-[#F5C518]">Seed Demo Mode Active:</strong> Exploring Anora’s built-in 4K catalog. Paste your TMDB API key in Settings for live 1M+ titles.
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowBlockedPreview((p) => !p)}
              className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/15 text-[11px] font-bold text-zinc-200"
            >
              {showBlockedPreview ? 'Resume Demo Catalog' : 'Preview No-Key Gate'}
            </button>
            <button
              type="button"
              onClick={onNavigateSettingsApi}
              className="px-3 py-1 rounded-lg bg-[#F5C518] hover:bg-amber-400 text-black text-[11px] font-black"
            >
              + Add TMDB Key
            </button>
          </div>
        </div>
      )}

      {/* Friendly Blocked State when user toggles "Preview No-Key Gate" */}
      {showBlockedPreview && !hasApiKey ? (
        <div className="max-w-lg mx-auto my-12 p-8 rounded-2xl bg-[#141416] border border-[#F5C518]/40 text-center space-y-4 shadow-2xl">
          <div className="w-14 h-14 rounded-2xl bg-[#F5C518]/15 text-[#F5C518] flex items-center justify-center mx-auto">
            <Key className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-black text-white">Connect Your TMDB API Key</h2>
          <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
            Anora is a 100% client-side streaming guide. Paste your free TMDB v3 API Key or v4 Read Access Token in Settings to fetch real-time movies, TV shows, and JustWatch availability.
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={onNavigateSettingsApi}
              className="px-5 py-2.5 rounded-xl bg-[#F5C518] text-black font-black text-xs"
            >
              Add Your API Key in Settings →
            </button>
            <button
              type="button"
              onClick={() => setShowBlockedPreview(false)}
              className="px-4 py-2.5 rounded-xl bg-white/10 text-white font-bold text-xs"
            >
              Use Seeded Demo Mode
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Netflix Mobile Rounded Category Pills Bar (Matches Screenshot 3: 1000096784.jpg) */}
          <div className="px-4 sm:px-6 pt-2 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
              {(
                [
                  { id: 'all', label: 'All' },
                  { id: 'tv', label: 'Series' },
                  { id: 'movie', label: 'Films' },
                  { id: 'new', label: 'New & Hot' },
                ] as const
              ).map((pill) => (
                <button
                  key={pill.id}
                  type="button"
                  onClick={() => onChangeCategoryTab(pill.id)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold border transition-all shrink-0 ${
                    categoryTab === pill.id
                      ? 'bg-white text-black border-white shadow'
                      : 'bg-[#141416]/90 text-zinc-200 border-white/20 hover:border-white/40'
                  }`}
                >
                  {pill.label}
                </button>
              ))}

              <button
                type="button"
                onClick={onOpenCategoriesDrawer}
                className={`px-4 py-1.5 rounded-full text-xs font-bold border flex items-center gap-1 shrink-0 ${
                  activeGenreName || activeProviderName
                    ? 'bg-[#F5C518]/20 text-[#F5C518] border-[#F5C518]'
                    : 'bg-[#141416]/90 text-zinc-200 border-white/20 hover:border-white/40'
                }`}
              >
                <span>
                  {activeGenreName || activeProviderName || 'Categories'}
                </span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Right Quick Toggles: Available on My Services & AI Concierge */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setOnlyMyServices((v) => !v)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold border flex items-center gap-1.5 transition-all ${
                  onlyMyServices
                    ? 'bg-[#F5C518] text-black border-[#F5C518]'
                    : 'bg-[#141416] text-zinc-300 border-white/15 hover:border-white/30'
                }`}
              >
                <Tv className="w-3.5 h-3.5" />
                <span>On My Services ({region})</span>
                {onlyMyServices && <Check className="w-3.5 h-3.5 stroke-[3]" />}
              </button>

              {enableAi && (
                <button
                  type="button"
                  onClick={onOpenAiConcierge}
                  className="px-3 py-1.5 rounded-full bg-gradient-to-r from-[#F5C518] to-amber-500 text-black text-xs font-black flex items-center gap-1.5 shadow"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Ask AI</span>
                </button>
              )}
            </div>
          </div>

          {/* Hero Banner (Supports Netflix Mobile Framed Vertical Card & Desktop Widescreen) */}
          <HeroBanner
            items={displayItems}
            region={region}
            imageQuality={imageQuality}
            reduceMotion={reduceMotion}
            isMobileLayout={isMobileLayout}
            watchlistIds={watchlistIds}
            onSelectTitle={onSelectMedia}
            onPlayTrailer={onPlayTrailer}
            onToggleWatchlist={onToggleWatchlist}
          />

          {/* Row 1: Top 10 Series & Films in Anora Today (Giant Outlined Numbers like Screenshot 1) */}
          <MediaRow
            title={`Top 10 in Anora Today (${region})`}
            subtitle="Ranked by daily streaming velocity across Netflix, Prime Video, Max & JioCinema"
            items={top10Items}
            variant="top10"
            imageQuality={imageQuality}
            watchlist={profile.watchlist}
            ratings={profile.ratings}
            aiScores={aiScores}
            onSelect={onSelectMedia}
            onToggleWatchlist={onToggleWatchlist}
            onQuickRate={onQuickRate}
          />

          {/* Row 2: Continue Watching (From Local Watch History, like Screenshot 1 & 4) */}
          {profile.watchHistory.length > 0 && (
            <section className="py-3 px-4 sm:px-6">
              <div className="flex items-center justify-between mb-2.5">
                <h3 className="text-base sm:text-lg font-extrabold text-white">
                  Continue Watching for {profile.name}
                </h3>
              </div>
              <div className="flex items-stretch gap-3.5 overflow-x-auto pb-2 no-scrollbar">
                {profile.watchHistory.map((h: WatchHistoryEntry) => {
                  const matched =
                    catalog.find(
                      (m) => m.id === h.mediaId && m.media_type === h.mediaType
                    ) || catalog[0];
                  return (
                    <div
                      key={`${h.mediaType}-${h.mediaId}`}
                      className="w-56 sm:w-64 shrink-0 rounded-xl bg-[#141416] border border-white/10 overflow-hidden shadow-lg group"
                    >
                      <div
                        onClick={() => onSelectMedia(matched)}
                        className="relative aspect-video cursor-pointer overflow-hidden bg-black"
                      >
                        <img
                          src={getTmdbImageUrl(
                            h.backdrop_path || h.poster_path || matched.backdrop_path,
                            'w500',
                            h.title
                          )}
                          alt={h.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute inset-0 bg-black/35 flex items-center justify-center">
                          <div className="w-10 h-10 rounded-full bg-white/90 text-black flex items-center justify-center shadow-lg">
                            <Play className="w-4 h-4 fill-black ml-0.5" />
                          </div>
                        </div>
                        <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/80 text-[10px] font-bold text-white">
                          {h.lastEpisode || 'Resume'} • {h.timestampLabel || '20m left'}
                        </span>
                        <div className="absolute inset-x-0 bottom-0 h-1 bg-white/20">
                          <div
                            style={{ width: `${h.progressPercent}%` }}
                            className="h-full bg-[#E50914]"
                          />
                        </div>
                      </div>
                      <div className="p-2.5 flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() => onSelectMedia(matched)}
                          className="text-xs font-extrabold text-white truncate hover:text-[#F5C518]"
                        >
                          {h.title}
                        </button>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => onSelectMedia(matched)}
                            aria-label={`Info for ${h.title}`}
                            className="p-1 text-zinc-400 hover:text-white"
                          >
                            <Info className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onRemoveHistory(h.mediaId, h.mediaType)}
                            aria-label={`Remove ${h.title} from Continue Watching`}
                            className="p-1 text-zinc-400 hover:text-red-400"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Row 3: Only on Anora / Tall Prestige Cards (Matches Screenshot 1 "Only on Netflix") */}
          <MediaRow
            title="Only on Anora • Prestige Showcase"
            subtitle="Critics’ Choice & IMAX 70mm Exclusives"
            items={onlyOnAnora}
            variant="tall"
            imageQuality={imageQuality}
            watchlist={profile.watchlist}
            ratings={profile.ratings}
            aiScores={aiScores}
            onSelect={onSelectMedia}
            onToggleWatchlist={onToggleWatchlist}
            onQuickRate={onQuickRate}
          />

          {/* Row 4: AI Picked For You */}
          {enableAi && (
            <MediaRow
              title={`Picked for ${profile.name} • AI Taste Graph`}
              subtitle="Scored against your favorite genres, ratings, and watch history"
              items={pickedForYou}
              imageQuality={imageQuality}
              watchlist={profile.watchlist}
              ratings={profile.ratings}
              aiScores={aiScores}
              onSelect={onSelectMedia}
              onToggleWatchlist={onToggleWatchlist}
              onQuickRate={onQuickRate}
            />
          )}

          {/* Row 5: New Releases */}
          <MediaRow
            title="New Releases & Trending Now"
            items={newReleases}
            imageQuality={imageQuality}
            watchlist={profile.watchlist}
            ratings={profile.ratings}
            aiScores={aiScores}
            onSelect={onSelectMedia}
            onToggleWatchlist={onToggleWatchlist}
            onQuickRate={onQuickRate}
          />

          {/* Row 6: In a Bit of a Hurry? Try These Episodic & Short Picks (Matches Screenshot 1) */}
          <MediaRow
            title="In a Bit of a Hurry? Try These Episodic Picks"
            items={quickWatches}
            imageQuality={imageQuality}
            watchlist={profile.watchlist}
            ratings={profile.ratings}
            aiScores={aiScores}
            onSelect={onSelectMedia}
            onToggleWatchlist={onToggleWatchlist}
            onQuickRate={onQuickRate}
          />

          {/* Row 7: Top Rated IMDb Gold */}
          <MediaRow
            title="IMDb Top Rated All-Time"
            items={topRated}
            imageQuality={imageQuality}
            watchlist={profile.watchlist}
            ratings={profile.ratings}
            aiScores={aiScores}
            onSelect={onSelectMedia}
            onToggleWatchlist={onToggleWatchlist}
            onQuickRate={onQuickRate}
          />

          {/* Row 8: Because You Liked Solaris Monolith */}
          <MediaRow
            title="Because You Watched Solaris Monolith: Horizon"
            items={displayItems.filter((i) => i.id !== 1001)}
            imageQuality={imageQuality}
            watchlist={profile.watchlist}
            ratings={profile.ratings}
            aiScores={aiScores}
            onSelect={onSelectMedia}
            onToggleWatchlist={onToggleWatchlist}
            onQuickRate={onQuickRate}
          />

          {/* Row 9: My Watchlist */}
          {watchlistMediaItems.length > 0 && (
            <MediaRow
              title="My List"
              items={watchlistMediaItems}
              imageQuality={imageQuality}
              watchlist={profile.watchlist}
              ratings={profile.ratings}
              aiScores={aiScores}
              onSelect={onSelectMedia}
              onToggleWatchlist={onToggleWatchlist}
              onQuickRate={onQuickRate}
              onSeeAll={onNavigateWatchlist}
            />
          )}
        </>
      )}
    </div>
  );
};
