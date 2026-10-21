import React from 'react';
import { ExternalLink, Check } from 'lucide-react';
import { WatchProviderItem } from '../types/tmdb';

interface ProviderBadgeProps {
  provider: WatchProviderItem;
  isSubscribed?: boolean;
  compact?: boolean;
  onClick?: () => void;
}

export const ProviderBadge: React.FC<ProviderBadgeProps> = ({
  provider,
  isSubscribed = false,
  compact = false,
  onClick,
}) => {
  if (compact) {
    return (
      <span
        onClick={onClick}
        style={{ backgroundColor: provider.color, color: provider.textColor || '#FFF' }}
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold tracking-tight shadow-sm ${
          isSubscribed ? 'ring-1 ring-[#F5C518]' : ''
        } ${onClick ? 'cursor-pointer hover:opacity-90' : ''}`}
        title={`${provider.provider_name}${isSubscribed ? ' (Your Service)' : ''}`}
      >
        <span>{provider.short_name}</span>
        {provider.quality && <span className="opacity-80 text-[9px]">{provider.quality}</span>}
      </span>
    );
  }

  return (
    <a
      href={provider.link || 'https://www.themoviedb.org/watch'}
      target="_blank"
      rel="noopener noreferrer"
      className={`group flex items-center justify-between gap-3 p-2.5 rounded-xl border transition-all ${
        isSubscribed
          ? 'bg-[#1A1A20] border-[#F5C518]/50 hover:border-[#F5C518]'
          : 'bg-[#141416] border-white/10 hover:border-white/25'
      }`}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div
          style={{ backgroundColor: provider.color, color: provider.textColor || '#FFF' }}
          className="w-10 h-10 rounded-lg flex items-center justify-center font-black text-xs shrink-0 shadow-md"
        >
          {provider.short_name}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-semibold text-white truncate">
              {provider.provider_name}
            </span>
            {isSubscribed && (
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-[#F5C518]/20 text-[#F5C518] text-[10px] font-bold">
                <Check className="w-2.5 h-2.5" /> Subscribed
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-zinc-400 mt-0.5">
            <span className="uppercase text-[10px] font-bold text-zinc-300 bg-white/10 px-1.5 py-0.2 rounded">
              {provider.monetization_type === 'flatrate' ? 'Stream' : provider.monetization_type}
            </span>
            {provider.quality && (
              <span className="text-[#F5C518] font-semibold text-[11px]">{provider.quality}</span>
            )}
            {provider.price && <span>{provider.price}</span>}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-1 text-xs font-semibold text-[#F5C518] group-hover:translate-x-0.5 transition-transform shrink-0">
        <span>Watch</span>
        <ExternalLink className="w-3.5 h-3.5" />
      </div>
    </a>
  );
};
