import React, { useState, useEffect } from 'react';
import {
  Play,
  Plus,
  Check,
  Info,
  Star,
  Sparkles,
  Tv,
} from 'lucide-react';
import { ImageQuality, MediaItem } from '../types/tmdb';
import { GENRES, STREAMING_PROVIDERS } from '../lib/seedData';
import { getTmdbImageUrl } from '../lib/tmdb';

interface HeroBannerProps {
  items: MediaItem[];
  region: string;
  imageQuality: ImageQuality;
  reduceMotion: boolean;
  isMobileLayout: boolean;
  watchlistIds: Set<string>;
  onSelectTitle: (item: MediaItem) => void;
  onPlayTrailer: (item: MediaItem) => void;
  onToggleWatchlist: (item: MediaItem, e: React.MouseEvent) => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  items,
  region,
  imageQuality,
  reduceMotion,
  isMobileLayout,
  watchlistIds,
  onSelectTitle,
  onPlayTrailer,
  onToggleWatchlist,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const heroItems = items.slice(0, 5);

  useEffect(() => {
    if (reduceMotion || heroItems.length <= 1) return;
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % heroItems.length);
    }, 6500);
    return () => clearInterval(timer);
  }, [heroItems.length, reduceMotion]);

  if (heroItems.length === 0) return null;
  const active = heroItems[activeIndex % heroItems.length];
  const inWatchlist = watchlistIds.has(`${active.media_type}-${active.id}`);

  const genreNames = active.genre_ids
    .map((id) => GENRES.find((g) => g.id === id)?.name)
    .filter(Boolean)
    .slice(0, 3);

  const regionalProviders =
    active.watch_providers?.[region]?.flatrate ||
    STREAMING_PROVIDERS.slice(0, 2);

  const posterUrl = getTmdbImageUrl(active.poster_path, imageQuality, active.title);
  const backdropUrl = getTmdbImageUrl(
    active.backdrop_path || active.poster_path,
    imageQuality === 'w500' ? 'w780' : 'original',
    active.title
  );

  // Netflix Mobile Framed Vertical Hero Card (Matches Screenshot 3: 1000096784.jpg)
  return (
    <div className="px-4 sm:px-6 pt-2 pb-4">
      <div
        className={`relative mx-auto overflow-hidden rounded-2xl border border-white/15 shadow-[0_20px_50px_rgba(0,0,0,0.85)] bg-[#141416] ${
          isMobileLayout ? 'max-w-md aspect-[4/5]' : 'w-full min-h-[360px] sm:min-h-[430px]'
        }`}
      >
        {/* Background Image */}
        <img
          src={isMobileLayout ? posterUrl : backdropUrl}
          alt={active.title}
          className="absolute inset-0 w-full h-full object-cover transition-all duration-700"
        />

        {/* Cinematic Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0B] via-[#0A0A0B]/45 to-black/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0A0A0B]/90 via-[#0A0A0B]/40 to-transparent" />

        {/* Top Left Brand Badge */}
        <div className="absolute top-3.5 left-4 flex items-center gap-2 z-10">
          <span className="px-2 py-0.5 rounded bg-[#E50914] text-white text-[10px] font-black tracking-widest uppercase shadow">
            ANORA {active.media_type === 'tv' ? 'SERIES' : 'FILM'}
          </span>
          {active.top10_rank && (
            <span className="px-2 py-0.5 rounded bg-[#F5C518] text-black text-[10px] font-black tracking-wider uppercase shadow">
              #{active.top10_rank} in {region} Today
            </span>
          )}
        </div>

        {/* Content Overlay */}
        <div
          className={`relative z-10 h-full flex flex-col justify-end p-5 sm:p-8 ${
            isMobileLayout ? 'items-center text-center pt-36' : 'max-w-2xl items-start text-left pt-28'
          }`}
        >
          {/* Title */}
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-none drop-shadow-md">
            {active.title}
          </h1>

          {/* Dot-separated Genre & Meta Tags (Exact Netflix Mobile Style) */}
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-2.5 text-xs font-semibold text-zinc-200">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#F5C518] text-black font-black text-[11px]">
              <Star className="w-3 h-3 fill-black" /> IMDb {active.imdb_rating || active.vote_average.toFixed(1)}
            </span>
            <span>•</span>
            <span>{active.year}</span>
            {active.certification && (
              <>
                <span>•</span>
                <span className="px-1.5 py-0.2 border border-white/30 rounded text-[10px]">
                  {active.certification}
                </span>
              </>
            )}
            {genreNames.map((g) => (
              <React.Fragment key={g}>
                <span className="text-[#F5C518]">•</span>
                <span>{g}</span>
              </React.Fragment>
            ))}
          </div>

          {/* Synopsis (Desktop & Tablet) */}
          {!isMobileLayout && (
            <p className="mt-3 text-xs sm:text-sm text-zinc-300 line-clamp-2 max-w-xl leading-relaxed">
              {active.overview}
            </p>
          )}

          {/* JustWatch Where to Stream Pill */}
          <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/65 border border-white/15 backdrop-blur-md text-xs text-zinc-200">
            <Tv className="w-3.5 h-3.5 text-[#F5C518]" />
            <span>Streaming in {region}:</span>
            <div className="flex items-center gap-1">
              {regionalProviders.slice(0, 3).map((p) => (
                <span
                  key={p.provider_id}
                  style={{ backgroundColor: p.color, color: p.textColor || '#FFF' }}
                  className="px-1.5 py-0.5 rounded text-[10px] font-black"
                >
                  {p.provider_name}
                </span>
              ))}
            </div>
          </div>

          {/* Netflix Dual Action Buttons */}
          <div
            className={`mt-4 flex items-center gap-3 ${
              isMobileLayout ? 'w-full justify-center' : 'w-auto'
            }`}
          >
            <button
              type="button"
              onClick={() => onPlayTrailer(active)}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-white hover:bg-zinc-200 text-black font-extrabold text-sm shadow-lg transition-transform active:scale-95"
            >
              <Play className="w-4 h-4 fill-black" />
              <span>Play Trailer</span>
            </button>

            <button
              type="button"
              onClick={(e) => onToggleWatchlist(active, e)}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-zinc-800/90 hover:bg-zinc-700 text-white border border-white/20 font-bold text-sm backdrop-blur-md transition-transform active:scale-95"
            >
              {inWatchlist ? (
                <>
                  <Check className="w-4 h-4 text-[#F5C518]" />
                  <span>In My List</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>My List</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => onSelectTitle(active)}
              aria-label="Where to Watch & Full Details"
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg bg-[#F5C518]/15 hover:bg-[#F5C518]/25 text-[#F5C518] border border-[#F5C518]/40 font-bold text-sm transition-colors"
            >
              <Info className="w-4 h-4" />
              <span className="hidden sm:inline">Where to Watch</span>
            </button>
          </div>

          {/* Carousel Indicators */}
          <div className="mt-4 flex items-center gap-1.5">
            {heroItems.map((item, idx) => (
              <button
                key={`${item.media_type}-${item.id}`}
                type="button"
                onClick={() => setActiveIndex(idx)}
                aria-label={`Show hero slide ${idx + 1}: ${item.title}`}
                className={`h-1.5 rounded-full transition-all ${
                  idx === activeIndex % heroItems.length
                    ? 'w-7 bg-[#F5C518]'
                    : 'w-2 bg-white/30 hover:bg-white/60'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
