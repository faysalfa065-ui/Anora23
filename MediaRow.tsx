import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  ImageQuality,
  MediaItem,
  UserRatingEntry,
  WatchlistEntry,
} from '../types/tmdb';
import { MediaCard } from './MediaCard';

interface MediaRowProps {
  title: string;
  subtitle?: string;
  items: MediaItem[];
  variant?: 'standard' | 'top10' | 'tall';
  imageQuality?: ImageQuality;
  watchlist?: WatchlistEntry[];
  ratings?: Record<string, UserRatingEntry>;
  aiScores?: Record<string, number>;
  onSelect: (item: MediaItem) => void;
  onToggleWatchlist: (item: MediaItem, e: React.MouseEvent) => void;
  onQuickRate?: (item: MediaItem, e: React.MouseEvent) => void;
  onSeeAll?: () => void;
}

export const MediaRow: React.FC<MediaRowProps> = ({
  title,
  subtitle,
  items,
  variant = 'standard',
  imageQuality = 'w500',
  watchlist = [],
  ratings = {},
  aiScores = {},
  onSelect,
  onToggleWatchlist,
  onQuickRate,
  onSeeAll,
}) => {
  const rowRef = useRef<HTMLDivElement>(null);

  if (!items || items.length === 0) return null;

  const scroll = (dir: 'left' | 'right') => {
    if (!rowRef.current) return;
    const amount = dir === 'left' ? -460 : 460;
    rowRef.current.scrollBy({ left: amount, behavior: 'smooth' });
  };

  return (
    <section className="py-3 relative group/row">
      <div className="flex items-end justify-between px-4 sm:px-6 mb-2.5">
        <div>
          <h3 className="text-base sm:text-lg font-extrabold text-white tracking-tight flex items-center gap-2">
            <span>{title}</span>
          </h3>
          {subtitle && <p className="text-xs text-zinc-400 mt-0.5">{subtitle}</p>}
        </div>

        <div className="flex items-center gap-2">
          {onSeeAll && (
            <button
              type="button"
              onClick={onSeeAll}
              className="flex items-center gap-0.5 text-xs font-bold text-zinc-300 hover:text-[#F5C518] transition-colors"
            >
              <span>See all</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
          <div className="hidden sm:flex items-center gap-1">
            <button
              type="button"
              onClick={() => scroll('left')}
              aria-label={`Scroll ${title} left`}
              className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 flex items-center justify-center text-zinc-300 hover:text-white transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => scroll('right')}
              aria-label={`Scroll ${title} right`}
              className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 flex items-center justify-center text-zinc-300 hover:text-white transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div
        ref={rowRef}
        className="flex items-stretch gap-3 sm:gap-4 overflow-x-auto px-4 sm:px-6 pb-2 no-scrollbar scroll-smooth"
      >
        {items.map((item, idx) => {
          const key = `${item.media_type}-${item.id}`;
          const inWatchlist = watchlist.some(
            (w) => w.mediaId === item.id && w.mediaType === item.media_type
          );
          const ratingObj = ratings[key];
          return (
            <MediaCard
              key={key}
              item={item}
              rank={variant === 'top10' ? item.top10_rank || idx + 1 : undefined}
              variant={variant}
              imageQuality={imageQuality}
              inWatchlist={inWatchlist}
              userRating={ratingObj?.rating}
              userThumb={ratingObj?.thumb}
              aiMatchScore={aiScores[key]}
              onSelect={onSelect}
              onToggleWatchlist={onToggleWatchlist}
              onQuickRate={onQuickRate}
            />
          );
        })}
      </div>
    </section>
  );
};
