import React, { useState } from 'react';
import { Star, ThumbsDown, ThumbsUp, Heart } from 'lucide-react';
import { ThumbReaction } from '../types/tmdb';

interface RatingStarsProps {
  value: number;
  thumb?: ThumbReaction;
  onChange: (rating: number, thumb?: ThumbReaction) => void;
  showNetflixThumbs?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const RatingStars: React.FC<RatingStarsProps> = ({
  value,
  thumb = null,
  onChange,
  showNetflixThumbs = true,
  size = 'md',
}) => {
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const displayRating = hoverRating ?? value;

  const starSize = size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-6 h-6' : 'w-5 h-5';

  return (
    <div className="flex flex-col gap-3">
      {showNetflixThumbs && (
        <div className="inline-flex items-center gap-2 bg-[#1A1A1E] border border-white/15 rounded-full px-3.5 py-2 shadow-xl w-fit">
          <button
            type="button"
            onClick={() => onChange(value || 4, thumb === 'dislike' ? null : 'dislike')}
            className={`flex flex-col items-center gap-1 px-3 py-1 rounded-full transition-all ${
              thumb === 'dislike'
                ? 'bg-red-500/20 text-red-400 scale-105 ring-1 ring-red-500/40'
                : 'text-zinc-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <ThumbsDown className="w-5 h-5" />
            <span className="text-[10px] font-semibold">Not for me</span>
          </button>

          <button
            type="button"
            onClick={() => onChange(value || 8, thumb === 'like' ? null : 'like')}
            className={`flex flex-col items-center gap-1 px-3 py-1 rounded-full transition-all ${
              thumb === 'like'
                ? 'bg-[#F5C518]/20 text-[#F5C518] scale-105 ring-1 ring-[#F5C518]/40'
                : 'text-zinc-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <ThumbsUp className="w-5 h-5" />
            <span className="text-[10px] font-semibold">I like this</span>
          </button>

          <button
            type="button"
            onClick={() => onChange(10, thumb === 'love' ? null : 'love')}
            className={`flex flex-col items-center gap-1 px-3 py-1 rounded-full transition-all ${
              thumb === 'love'
                ? 'bg-[#E50914]/25 text-[#E50914] scale-105 ring-1 ring-[#E50914]/50'
                : 'text-zinc-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Heart className="w-5 h-5 fill-current" />
            <span className="text-[10px] font-semibold">Love this!</span>
          </button>
        </div>
      )}

      <div className="flex items-center gap-1.5 flex-wrap">
        <div className="flex items-center gap-1" onMouseLeave={() => setHoverRating(null)}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => {
            const active = star <= displayRating;
            return (
              <button
                key={star}
                type="button"
                onMouseEnter={() => setHoverRating(star)}
                onClick={() =>
                  onChange(
                    star,
                    star >= 9 ? 'love' : star >= 7 ? 'like' : star <= 4 ? 'dislike' : thumb
                  )
                }
                aria-label={`Rate ${star} out of 10`}
                className="p-0.5 transition-transform hover:scale-125 focus:outline-none"
              >
                <Star
                  className={`${starSize} transition-colors ${
                    active ? 'text-[#F5C518] fill-[#F5C518]' : 'text-zinc-600'
                  }`}
                />
              </button>
            );
          })}
        </div>
        <span className="ml-2 text-sm font-bold text-[#F5C518]">
          {displayRating > 0 ? `${displayRating}/10` : 'Unrated'}
        </span>
      </div>
    </div>
  );
};
