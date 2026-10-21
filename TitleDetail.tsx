import React, { useState } from 'react';
import {
  ChevronLeft,
  Play,
  Plus,
  Check,
  Star,
  Share2,
  FolderPlus,
  MessageSquare,
  Tv,
  Film,
  Eye,
  AlertTriangle,
  ExternalLink,
  Sparkles,
  ThumbsDown,
  ThumbsUp,
  Heart,
  X,
} from 'lucide-react';
import {
  ImageQuality,
  MediaItem,
  ThumbReaction,
  UserRatingEntry,
  UserReview,
  WatchProviderItem,
} from '../types/tmdb';
import { GENRES, REGIONS, STREAMING_PROVIDERS } from '../lib/seedData';
import { getTmdbImageUrl } from '../lib/tmdb';
import { ProviderBadge } from '../components/ProviderBadge';

interface TitleDetailProps {
  item: MediaItem;
  catalog: MediaItem[];
  region: string;
  preferredProviders: number[];
  imageQuality: ImageQuality;
  inWatchlist: boolean;
  isWatched: boolean;
  userRating?: UserRatingEntry;
  reviews: UserReview[];
  onBack: () => void;
  onChangeRegion: (reg: string) => void;
  onPlayTrailer: (item: MediaItem) => void;
  onToggleWatchlist: (item: MediaItem, e: React.MouseEvent) => void;
  onToggleWatched: (item: MediaItem) => void;
  onOpenRatingModal: (item: MediaItem) => void;
  onDirectRate: (item: MediaItem, rating: number, thumb: ThumbReaction) => void;
  onOpenListModal: (item: MediaItem) => void;
  onSelectPerson: (personId: number) => void;
  onSelectMedia: (item: MediaItem) => void;
  onShare: (item: MediaItem) => void;
}

export const TitleDetail: React.FC<TitleDetailProps> = ({
  item,
  catalog,
  region,
  preferredProviders,
  imageQuality,
  inWatchlist,
  isWatched,
  userRating,
  reviews,
  onBack,
  onChangeRegion,
  onPlayTrailer,
  onToggleWatchlist,
  onToggleWatched,
  onOpenRatingModal,
  onDirectRate,
  onOpenListModal,
  onSelectPerson,
  onSelectMedia,
  onShare,
}) => {
  const [activeTab, setActiveTab] = useState<
    'watch' | 'episodes' | 'cast' | 'reviews' | 'gallery'
  >(item.media_type === 'tv' ? 'episodes' : 'watch');
  const [providerFilter, setProviderFilter] = useState<'all' | 'flatrate' | 'rent' | 'buy' | 'free'>('all');
  const [selectedSeasonNum, setSelectedSeasonNum] = useState<number>(1);
  const [revealedSpoilers, setRevealedSpoilers] = useState<Record<string, boolean>>({});
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [showReactionPopover, setShowReactionPopover] = useState(false);

  const backdropUrl = getTmdbImageUrl(
    item.backdrop_path || item.poster_path,
    imageQuality === 'w500' ? 'w780' : 'original',
    item.title
  );
  const posterUrl = getTmdbImageUrl(item.poster_path, imageQuality, item.title);

  const genreList = item.genre_ids
    .map((id) => GENRES.find((g) => g.id === id)?.name)
    .filter(Boolean);

  // JustWatch regional providers
  const regData = item.watch_providers?.[region] || item.watch_providers?.IN;
  const allProviders: WatchProviderItem[] = [
    ...(regData?.flatrate || STREAMING_PROVIDERS.slice(0, 3)),
    ...(regData?.rent || []),
    ...(regData?.buy || []),
    ...(regData?.free || []),
  ];
  const filteredProviders =
    providerFilter === 'all'
      ? allProviders
      : allProviders.filter((p) => p.monetization_type === providerFilter);

  const seasons = item.seasons || [];
  const currentSeason =
    seasons.find((s) => s.season_number === selectedSeasonNum) || seasons[0];

  const titleReviews = reviews.filter(
    (r) => r.mediaId === item.id && r.mediaType === item.media_type
  );

  const similarItems = catalog
    .filter(
      (m) =>
        m.id !== item.id &&
        m.genre_ids.some((g) => item.genre_ids.includes(g))
    )
    .slice(0, 6);

  return (
    <div className="pb-24">
      {/* Backdrop Hero Header */}
      <div className="relative min-h-[360px] sm:min-h-[440px] w-full overflow-hidden bg-[#141416] border-b border-white/10">
        <img
          src={backdropUrl}
          alt={item.title}
          className="absolute inset-0 w-full h-full object-cover opacity-55"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0B] via-[#0A0A0B]/70 to-black/30" />

        {/* Top Back Button */}
        <div className="relative z-10 px-4 sm:px-6 pt-4 flex items-center justify-between">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-black/70 hover:bg-black text-white text-xs font-bold border border-white/15 backdrop-blur-md"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full bg-[#E50914] text-white text-[10px] font-black uppercase tracking-wider">
              {item.media_type === 'tv' ? 'Anora Series' : 'Anora Feature'}
            </span>
            {item.certification && (
              <span className="px-2 py-0.5 rounded bg-black/70 border border-white/25 text-[11px] font-bold text-zinc-200">
                {item.certification}
              </span>
            )}
          </div>
        </div>

        {/* Hero Main Details */}
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 pt-6 pb-8 flex flex-col sm:flex-row items-start sm:items-end gap-6">
          <img
            src={posterUrl}
            alt={item.title}
            className="w-28 sm:w-44 aspect-[2/3] rounded-2xl object-cover border border-white/20 shadow-2xl shrink-0 hidden sm:block"
          />

          <div className="flex-1 space-y-3">
            <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-zinc-300">
              <span className="text-emerald-400 font-extrabold">98% Taste Match</span>
              <span>•</span>
              <span>{item.year}</span>
              {item.runtime && (
                <>
                  <span>•</span>
                  <span>
                    {item.media_type === 'tv'
                      ? `${item.number_of_seasons || 2} Seasons (${item.runtime}m/ep)`
                      : `${Math.floor(item.runtime / 60)}h ${item.runtime % 60}m`}
                  </span>
                </>
              )}
              <span className="px-1.5 py-0.2 rounded bg-white/15 text-white text-[10px] font-black">
                4K HDR
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">
              {item.title}
            </h1>

            {item.tagline && (
              <p className="text-xs sm:text-sm italic text-[#F5C518] font-medium">
                “{item.tagline}”
              </p>
            )}

            {/* IMDb + TMDB + Personal Rating Badges */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F5C518] text-black font-black text-xs shadow">
                <Star className="w-4 h-4 fill-black" />
                <span>IMDb {(item.imdb_rating || item.vote_average).toFixed(1)}</span>
                <span className="text-[10px] font-bold opacity-80">
                  ({(item.vote_count / 1000).toFixed(1)}K)
                </span>
              </div>

              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#141416] border border-white/15 text-white font-bold text-xs">
                <span className="text-cyan-400 font-black">TMDB</span>
                <span>{Math.round(item.vote_average * 10)}%</span>
              </div>

              {userRating && (
                <button
                  type="button"
                  onClick={() => onOpenRatingModal(item)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#E50914]/20 border border-[#E50914] text-white font-bold text-xs"
                >
                  <Star className="w-3.5 h-3.5 fill-[#F5C518] text-[#F5C518]" />
                  <span>Your Rating: {userRating.rating}/10</span>
                </button>
              )}
            </div>

            <p className="text-xs sm:text-sm text-zinc-200 max-w-3xl leading-relaxed">
              {item.overview}
            </p>

            {/* Primary CTA Buttons + Netflix Mobile Floating Thumbs Pill (Screenshot 5) */}
            <div className="pt-2 flex flex-wrap items-center gap-2.5 relative">
              <button
                type="button"
                onClick={() => onPlayTrailer(item)}
                className="px-5 py-2.5 rounded-xl bg-white hover:bg-zinc-200 text-black font-black text-xs sm:text-sm flex items-center gap-2 shadow-lg"
              >
                <Play className="w-4 h-4 fill-black" />
                <span>Play Trailer</span>
              </button>

              <button
                type="button"
                onClick={(e) => onToggleWatchlist(item, e)}
                className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-1.5 border ${
                  inWatchlist
                    ? 'bg-[#F5C518] text-black border-[#F5C518]'
                    : 'bg-zinc-900/90 text-white border-white/20 hover:border-white'
                }`}
              >
                {inWatchlist ? <Check className="w-4 h-4 stroke-[3]" /> : <Plus className="w-4 h-4" />}
                <span>{inWatchlist ? 'In Watchlist' : '+ My List'}</span>
              </button>

              <button
                type="button"
                onClick={() => setShowReactionPopover((p) => !p)}
                className="px-4 py-2.5 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 text-white border border-[#F5C518]/50 font-bold text-xs sm:text-sm flex items-center gap-1.5"
              >
                <ThumbsUp className="w-4 h-4 text-[#F5C518]" />
                <span>Rate</span>
              </button>

              <button
                type="button"
                onClick={() => onToggleWatched(item)}
                className={`px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border ${
                  isWatched
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                    : 'bg-zinc-900/90 text-zinc-300 border-white/15 hover:text-white'
                }`}
              >
                <Eye className="w-4 h-4" />
                <span>{isWatched ? 'Watched ✓' : 'Mark Watched'}</span>
              </button>

              <button
                type="button"
                onClick={() => onOpenListModal(item)}
                className="px-3.5 py-2.5 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 text-zinc-200 border border-white/15 text-xs font-bold flex items-center gap-1.5"
              >
                <FolderPlus className="w-4 h-4 text-[#F5C518]" />
                <span>Add to List</span>
              </button>

              <button
                type="button"
                onClick={() => onOpenRatingModal(item)}
                className="px-3.5 py-2.5 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 text-zinc-200 border border-white/15 text-xs font-bold flex items-center gap-1.5"
              >
                <MessageSquare className="w-4 h-4 text-[#F5C518]" />
                <span>Write Review</span>
              </button>

              <button
                type="button"
                onClick={() => onShare(item)}
                className="px-3.5 py-2.5 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 text-zinc-200 border border-white/15 text-xs font-bold flex items-center gap-1.5"
              >
                <Share2 className="w-4 h-4" />
                <span>Share</span>
              </button>

              {/* Netflix Floating Pill Reaction Bar (Matches Screenshot 5: 1000096781.jpg) */}
              {showReactionPopover && (
                <div className="w-full sm:w-auto mt-2 flex items-center gap-3 bg-[#1C1C22] border border-white/20 rounded-full px-5 py-2.5 shadow-2xl">
                  <button
                    type="button"
                    onClick={() => {
                      onDirectRate(item, 4, 'dislike');
                      setShowReactionPopover(false);
                    }}
                    className={`flex flex-col items-center gap-1 px-3 py-1 rounded-full ${
                      userRating?.thumb === 'dislike' ? 'text-red-400 bg-red-500/15' : 'text-zinc-200 hover:text-white'
                    }`}
                  >
                    <ThumbsDown className="w-5 h-5" />
                    <span className="text-[10px] font-bold">Not for me</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onDirectRate(item, 8, 'like');
                      setShowReactionPopover(false);
                    }}
                    className={`flex flex-col items-center gap-1 px-3 py-1 rounded-full ${
                      userRating?.thumb === 'like' ? 'text-[#F5C518] bg-[#F5C518]/15' : 'text-zinc-200 hover:text-white'
                    }`}
                  >
                    <ThumbsUp className="w-5 h-5" />
                    <span className="text-[10px] font-bold">I like this</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onDirectRate(item, 10, 'love');
                      setShowReactionPopover(false);
                    }}
                    className={`flex flex-col items-center gap-1 px-3 py-1 rounded-full ${
                      userRating?.thumb === 'love' ? 'text-[#E50914] bg-[#E50914]/15' : 'text-zinc-200 hover:text-white'
                    }`}
                  >
                    <Heart className="w-5 h-5 fill-current" />
                    <span className="text-[10px] font-bold">Love this!</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowReactionPopover(false);
                      onOpenRatingModal(item);
                    }}
                    className="px-3 py-1.5 rounded-full bg-[#F5C518] text-black text-[10px] font-black"
                  >
                    1–10 ★
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Container */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 space-y-8">
        {/* JustWatch "Where to Watch" Always-Visible Card + Section Tabs */}
        <div className="rounded-2xl bg-[#141416] border border-white/10 p-4 sm:p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="px-2.5 py-1 rounded-lg bg-[#F5C518] text-black font-black text-xs uppercase tracking-wider">
                JustWatch
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-black text-white">
                  Where to Watch {item.title}
                </h2>
                <p className="text-xs text-zinc-400">
                  Live regional streaming, rent, and purchase links powered by TMDB /watch/providers
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-xs text-zinc-400 font-semibold">Region:</label>
              <select
                value={region}
                onChange={(e) => onChangeRegion(e.target.value)}
                aria-label="Select streaming region"
                className="px-3 py-1.5 rounded-xl bg-black border border-white/15 text-xs font-bold text-white focus:border-[#F5C518] focus:outline-none"
              >
                {REGIONS.map((r) => (
                  <option key={r.code} value={r.code}>
                    {r.flag} {r.name} ({r.code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Filter Pills: All / Stream / Rent / Buy / Free */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            {(
              [
                { id: 'all', label: 'All Options' },
                { id: 'flatrate', label: 'Stream (Subscription)' },
                { id: 'rent', label: 'Rent' },
                { id: 'buy', label: 'Buy' },
                { id: 'free', label: 'Free' },
              ] as const
            ).map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setProviderFilter(t.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 transition-colors ${
                  providerFilter === t.id
                    ? 'bg-[#F5C518] text-black'
                    : 'bg-white/5 text-zinc-300 hover:bg-white/10'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {filteredProviders.map((prov, idx) => (
              <ProviderBadge
                key={`${prov.provider_id}-${prov.monetization_type}-${idx}`}
                provider={prov}
                isSubscribed={preferredProviders.includes(prov.provider_id)}
              />
            ))}
          </div>
        </div>

        {/* Navigation Tabs (Episodes / Cast & Crew / Reviews / Gallery & Specs) */}
        <div className="flex items-center gap-2 border-b border-white/10 pb-3 overflow-x-auto no-scrollbar">
          {item.media_type === 'tv' && (
            <button
              type="button"
              onClick={() => setActiveTab('episodes')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-black shrink-0 ${
                activeTab === 'episodes'
                  ? 'bg-[#E50914] text-white'
                  : 'bg-[#141416] text-zinc-300 hover:text-white'
              }`}
            >
              Episodes ({seasons.length || 1} Seasons)
            </button>
          )}
          <button
            type="button"
            onClick={() => setActiveTab('cast')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-black shrink-0 ${
              activeTab === 'cast'
                ? 'bg-[#F5C518] text-black'
                : 'bg-[#141416] text-zinc-300 hover:text-white'
            }`}
          >
            Cast & Full Crew
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('reviews')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-black shrink-0 ${
              activeTab === 'reviews'
                ? 'bg-[#F5C518] text-black'
                : 'bg-[#141416] text-zinc-300 hover:text-white'
            }`}
          >
            Reviews ({titleReviews.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('gallery')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-black shrink-0 ${
              activeTab === 'gallery'
                ? 'bg-[#F5C518] text-black'
                : 'bg-[#141416] text-zinc-300 hover:text-white'
            }`}
          >
            Gallery & IMDb Specs
          </button>
        </div>

        {/* TAB: TV Seasons & Episodes */}
        {activeTab === 'episodes' && item.media_type === 'tv' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-white">Episode Guide</h3>
              {seasons.length > 0 && (
                <select
                  value={selectedSeasonNum}
                  onChange={(e) => setSelectedSeasonNum(Number(e.target.value))}
                  aria-label="Select Season"
                  className="px-3.5 py-2 rounded-xl bg-[#141416] border border-white/15 text-xs font-bold text-white"
                >
                  {seasons.map((s) => (
                    <option key={s.id} value={s.season_number}>
                      {s.name} ({s.episodes.length} Episodes)
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="space-y-3">
              {(currentSeason?.episodes || []).map((ep) => (
                <div
                  key={ep.id}
                  className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-3.5 rounded-2xl bg-[#141416] border border-white/10 hover:border-white/25 transition-all"
                >
                  <div className="relative w-full sm:w-48 aspect-video rounded-xl overflow-hidden bg-black shrink-0">
                    <img
                      src={getTmdbImageUrl(ep.still_path || item.backdrop_path, 'w500', ep.name)}
                      alt={ep.name}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => onPlayTrailer(item)}
                      aria-label={`Play ${ep.name}`}
                      className="absolute inset-0 flex items-center justify-center bg-black/40 hover:bg-black/20"
                    >
                      <div className="w-10 h-10 rounded-full bg-white/90 text-black flex items-center justify-center shadow">
                        <Play className="w-4 h-4 fill-black ml-0.5" />
                      </div>
                    </button>
                  </div>

                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-sm font-extrabold text-white">{ep.name}</h4>
                      <span className="text-xs font-bold text-[#F5C518]">★ {ep.vote_average.toFixed(1)}</span>
                    </div>
                    <div className="text-[11px] text-zinc-400">
                      Aired {ep.air_date} • {ep.runtime}m
                    </div>
                    <p className="text-xs text-zinc-300 leading-relaxed">{ep.overview}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB: Cast & Full Crew Table */}
        {(activeTab === 'cast' || (activeTab === 'watch' && item.media_type === 'movie')) && (
          <div className="space-y-6">
            <div>
              <h3 className="text-base font-black text-white mb-3">
                Top Cast (Click to open Person Filmography)
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {(item.credits?.cast || []).map((actor) => (
                  <button
                    key={`${actor.id}-${actor.character}`}
                    type="button"
                    onClick={() => onSelectPerson(actor.id)}
                    className="flex items-center gap-3 p-3 rounded-2xl bg-[#141416] border border-white/10 hover:border-[#F5C518] text-left transition-all"
                  >
                    <img
                      src={getTmdbImageUrl(actor.profile_path, 'w500', actor.name)}
                      alt={actor.name}
                      className="w-12 h-12 rounded-xl object-cover shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="text-xs font-extrabold text-white truncate">{actor.name}</div>
                      <div className="text-[11px] text-[#F5C518] truncate">{actor.character}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {item.credits?.crew && item.credits.crew.length > 0 && (
              <div className="rounded-2xl bg-[#141416] border border-white/10 overflow-hidden">
                <div className="px-4 py-3 border-b border-white/10 text-xs font-black uppercase tracking-wider text-[#F5C518]">
                  Full Production Crew Table (IMDb Credits)
                </div>
                <div className="divide-y divide-white/5">
                  {item.credits.crew.map((c, idx) => (
                    <div
                      key={`${c.id}-${c.job}-${idx}`}
                      onClick={() => onSelectPerson(c.id)}
                      className="px-4 py-2.5 flex items-center justify-between text-xs hover:bg-white/5 cursor-pointer"
                    >
                      <span className="font-bold text-white">{c.name}</span>
                      <span className="text-zinc-400">
                        {c.job} ({c.department})
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB: User Reviews */}
        {activeTab === 'reviews' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-white">
                Community & Personal Reviews ({titleReviews.length})
              </h3>
              <button
                type="button"
                onClick={() => onOpenRatingModal(item)}
                className="px-4 py-2 rounded-xl bg-[#F5C518] text-black text-xs font-black"
              >
                + Write Review
              </button>
            </div>

            {titleReviews.length === 0 ? (
              <div className="p-8 rounded-2xl bg-[#141416] border border-white/10 text-center space-y-2">
                <p className="text-sm font-bold text-white">No reviews written yet for {item.title}</p>
                <p className="text-xs text-zinc-400">
                  Be the first to rate and share your review with spoiler protection.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {titleReviews.map((rev) => {
                  const blurred = rev.containsSpoilers && !revealedSpoilers[rev.id];
                  return (
                    <div
                      key={rev.id}
                      className="p-4 rounded-2xl bg-[#141416] border border-white/10 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-black text-white">{rev.headline}</span>
                        <span className="px-2.5 py-0.5 rounded-lg bg-[#F5C518]/20 text-[#F5C518] text-xs font-black">
                          ★ {rev.rating}/10
                        </span>
                      </div>
                      {rev.episodeTag && (
                        <div className="text-[11px] font-bold text-zinc-400">{rev.episodeTag}</div>
                      )}
                      {blurred ? (
                        <button
                          type="button"
                          onClick={() =>
                            setRevealedSpoilers((p) => ({ ...p, [rev.id]: true }))
                          }
                          className="w-full p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold flex items-center justify-center gap-2"
                        >
                          <AlertTriangle className="w-4 h-4" />
                          <span>Spoiler Alert — Click to reveal review text</span>
                        </button>
                      ) : (
                        <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                          {rev.content}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB: Image Gallery & IMDb Box Office / Technical Metadata */}
        {activeTab === 'gallery' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-2xl bg-[#141416] border border-white/10">
                <div className="text-[10px] font-bold uppercase text-zinc-400">Status</div>
                <div className="text-sm font-black text-white mt-0.5">{item.status || 'Released'}</div>
              </div>
              <div className="p-3.5 rounded-2xl bg-[#141416] border border-white/10">
                <div className="text-[10px] font-bold uppercase text-zinc-400">Original Language</div>
                <div className="text-sm font-black text-white mt-0.5 uppercase">
                  {item.original_language}
                </div>
              </div>
              <div className="p-3.5 rounded-2xl bg-[#141416] border border-white/10">
                <div className="text-[10px] font-bold uppercase text-zinc-400">Budget</div>
                <div className="text-sm font-black text-white mt-0.5">
                  {item.budget ? `$${(item.budget / 1000000).toFixed(0)}M` : 'N/A'}
                </div>
              </div>
              <div className="p-3.5 rounded-2xl bg-[#141416] border border-white/10">
                <div className="text-[10px] font-bold uppercase text-zinc-400">Box Office Revenue</div>
                <div className="text-sm font-black text-emerald-400 mt-0.5">
                  {item.revenue ? `$${(item.revenue / 1000000).toFixed(0)}M` : 'Streaming Exclusive'}
                </div>
              </div>
            </div>

            {item.keywords && item.keywords.length > 0 && (
              <div>
                <h4 className="text-xs font-extrabold uppercase text-zinc-400 mb-2">
                  TMDB Keywords & Themes
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {item.keywords.map((kw) => (
                    <span
                      key={kw}
                      className="px-2.5 py-1 rounded-full bg-[#141416] border border-white/10 text-xs text-zinc-300"
                    >
                      #{kw}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h4 className="text-xs font-extrabold uppercase text-zinc-400 mb-2">
                Stills & Poster Lightbox (Click to Enlarge)
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[backdropUrl, posterUrl, ...(item.images?.backdrops || [])]
                  .slice(0, 3)
                  .map((img, i) => {
                    const resolved = getTmdbImageUrl(img, 'w780', item.title);
                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setLightboxImage(resolved)}
                        className="aspect-video rounded-xl overflow-hidden border border-white/10 hover:border-[#F5C518]"
                      >
                        <img src={resolved} alt={item.title} className="w-full h-full object-cover" />
                      </button>
                    );
                  })}
              </div>
            </div>
          </div>
        )}

        {/* AI "More Like This" & Recommendations Strip */}
        <div className="pt-4 border-t border-white/10 space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#F5C518]" />
            <h3 className="text-base font-black text-white">
              More Like This (AI Taste Graph Recommendations)
            </h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {similarItems.map((sim) => (
              <button
                key={`${sim.media_type}-${sim.id}`}
                type="button"
                onClick={() => onSelectMedia(sim)}
                className="group text-left rounded-xl overflow-hidden bg-[#141416] border border-white/10 hover:border-[#F5C518] transition-all"
              >
                <div className="aspect-[2/3] overflow-hidden">
                  <img
                    src={getTmdbImageUrl(sim.poster_path, imageQuality, sim.title)}
                    alt={sim.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                </div>
                <div className="p-2">
                  <div className="text-[10px] font-extrabold text-emerald-400">96% Match</div>
                  <div className="text-xs font-bold text-white truncate">{sim.title}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Lightbox Overlay */}
      {lightboxImage && (
        <div
          onClick={() => setLightboxImage(null)}
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
        >
          <img
            src={lightboxImage}
            alt="Full resolution still"
            className="max-w-4xl max-h-[85vh] rounded-2xl border border-white/20 shadow-2xl"
          />
        </div>
      )}
    </div>
  );
};
