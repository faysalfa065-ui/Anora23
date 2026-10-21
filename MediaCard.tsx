import React from 'react';
import {
  Star,
  Plus,
  Check,
  Play,
  ThumbsUp,
  Heart,
  ThumbsDown,
} from 'lucide-react';
import { ImageQuality, MediaItem, ThumbReaction } from '../types/tmdb';
import { getTmdbImageUrl } from '../lib/tmdb';

interface MediaCardProps {
  item: MediaItem;
  rank?: number;
  variant?: 'standard' | 'top10' | 'tall';
  imageQuality?: ImageQuality;
  inWatchlist?: boolean;
  userRating?: number;
  userThumb?: ThumbReaction;
  aiMatchScore?: number;
  onSelect: (item: MediaItem) => void;
  onToggleWatchlist: (item: MediaItem, e: React.MouseEvent) => void;
  onQuickRate?: (item: MediaItem, e: React.MouseEvent) => void;
}

export const MediaCard: React.FC<MediaCardProps> = ({
  item,
  rank,
  variant = 'standard',
  imageQuality = 'w500',
  inWatchlist = false,
  userRating,
  userThumb,
  aiMatchScore,
  onSelect,
  onToggleWatchlist,
  onQuickRate,
}) => {
  const posterUrl = getTmdbImageUrl(item.poster_path, imageQuality, item.title);
  const isTop10 = variant === 'top10' && typeof rank === 'number';
  const isTall = variant === 'tall';

  return (
    <div
      onClick={() => onSelect(item)}
      className={`group relative cursor-pointer select-none transition-transform duration-300 hover:scale-[1.04] hover:z-20 shrink-0 ${
        isTop10
          ? 'w-44 sm:w-52 pl-10 sm:pl-12'
          : isTall
          ? 'w-44 sm:w-56'
          : 'w-36 sm:w-44'
      }`}
    >
      {/* Netflix Mobile Style Giant Outlined Rank Number */}
      {isTop10 && rank && (
        <div
          aria-hidden="true"
          className="absolute left-0 bottom-2 z-0 pointer-events-none select-none flex items-end"
        >
          <svg
            viewBox="0 0 110 150"
            className="w-20 h-32 sm:w-24 sm:h-36 overflow-visible drop-shadow-[0_6px_16px_rgba(0,0,0,0.95)]"
          >
            <text
              x="5"
              y="135"
              fontFamily="Inter, Impact, system-ui, sans-serif"
              fontSize="142"
              fontWeight="900"
              fill="#0A0A0B"
              stroke="#B4B4BE"
              strokeWidth="4.5"
              letterSpacing="-8"
            >
              {rank}
            </text>
          </svg>
        </div>
      )}

      {/* Card Poster Container */}
      <div
        className={`relative z-10 overflow-hidden rounded-xl bg-[#141416] border border-white/10 shadow-lg group-hover:border-[#F5C518]/60 transition-colors ${
          isTall ? 'aspect-[9/15]' : 'aspect-[2/3]'
        }`}
      >
        <img
          src={posterUrl}
          alt={item.title}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Subtle Dark Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/30" />

        {/* Top Left: Anora 'A' Emblem & Media Type Chip */}
        <div className="absolute top-2 left-2 flex items-center gap-1.5">
          <span className="w-5 h-5 rounded bg-black/80 border border-[#F5C518]/50 flex items-center justify-center text-[10px] font-black text-[#F5C518] shadow">
            A
          </span>
          <span className="px-1.5 py-0.5 rounded bg-black/75 backdrop-blur-md text-[9px] font-bold uppercase tracking-wider text-zinc-200 border border-white/10">
            {item.media_type === 'tv' ? 'Series' : 'Movie'}
          </span>
        </div>

        {/* Top Right: Rating Badge */}
        <div className="absolute top-2 right-2 flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-black/80 backdrop-blur-md border border-[#F5C518]/30 text-[11px] font-bold text-[#F5C518]">
          <Star className="w-3 h-3 fill-[#F5C518] text-[#F5C518]" />
          <span>{item.vote_average.toFixed(1)}</span>
        </div>

        {/* Hover / Tap Quick Actions */}
        <div className="absolute right-2 bottom-12 flex flex-col gap-1.5 opacity-95 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
          <button
            type="button"
            onClick={(e) => onToggleWatchlist(item, e)}
            title={inWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
            aria-label={inWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
            className={`w-7 h-7 rounded-full flex items-center justify-center border shadow-md transition-transform hover:scale-110 ${
              inWatchlist
                ? 'bg-[#F5C518] text-black border-[#F5C518]'
                : 'bg-black/80 text-white border-white/25 hover:border-white'
            }`}
          >
            {inWatchlist ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <Plus className="w-3.5 h-3.5" />}
          </button>

          {onQuickRate && (
            <button
              type="button"
              onClick={(e) => onQuickRate(item, e)}
              title="Rate Title"
              aria-label="Rate Title"
              className={`w-7 h-7 rounded-full flex items-center justify-center border shadow-md transition-transform hover:scale-110 ${
                userThumb || userRating
                  ? 'bg-[#E50914] text-white border-[#E50914]'
                  : 'bg-black/80 text-white border-white/25 hover:border-[#F5C518]'
              }`}
            >
              {userThumb === 'love' ? (
                <Heart className="w-3.5 h-3.5 fill-current" />
              ) : userThumb === 'dislike' ? (
                <ThumbsDown className="w-3.5 h-3.5" />
              ) : (
                <ThumbsUp className="w-3.5 h-3.5" />
              )}
            </button>
          )}
        </div>

        {/* Bottom Info & Netflix Mobile Ribbon Badge */}
        <div className="absolute inset-x-0 bottom-0 p-2.5 flex flex-col justify-end">
          {aiMatchScore && (
            <span className="text-[10px] font-extrabold text-emerald-400 tracking-tight mb-0.5">
              {aiMatchScore}% Match
            </span>
          )}
          <h4
            className={`font-extrabold text-white leading-tight line-clamp-1 ${
              isTall ? 'text-sm sm:text-base tracking-wide uppercase' : 'text-xs sm:text-sm'
            }`}
          >
            {item.title}
          </h4>
          <div className="flex items-center justify-between text-[10px] text-zinc-300 mt-0.5">
            <span>{item.year}</span>
            {userRating ? (
              <span className="text-[#F5C518] font-bold">You: ★{userRating}</span>
            ) : (
              <span className="flex items-center gap-0.5 text-zinc-300">
                <Play className="w-2.5 h-2.5 fill-current text-[#F5C518]" /> Details
              </span>
            )}
          </div>

          {item.badge && (
            <div className="mt-1.5 flex justify-center">
              <span
                className={`w-full text-center py-0.5 px-1.5 rounded text-[9px] font-extrabold uppercase tracking-wider shadow ${
                  item.badge.includes('New') || item.badge.includes('Live')
                    ? 'bg-[#E50914] text-white'
                    : 'bg-[#F5C518] text-black'
                }`}
              >
                {item.badge}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
