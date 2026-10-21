import React from 'react';

export const SkeletonRow: React.FC<{ title?: string; count?: number }> = ({
  title = 'Loading Row...',
  count = 6,
}) => {
  return (
    <div className="py-4 space-y-3">
      <div className="h-5 w-48 bg-white/10 rounded animate-pulse" aria-label={title} />
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="aspect-[2/3] rounded-xl bg-[#141416] border border-white/5 overflow-hidden relative"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-white/5 to-transparent animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
};
