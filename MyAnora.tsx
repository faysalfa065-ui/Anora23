import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronRight,
  Play,
  Share2,
  Star,
  Download,
  Trash2,
  Eye,
  Grid,
  List as ListIcon,
  Plus,
  Heart,
  ThumbsUp,
  FolderPlus,
} from 'lucide-react';
import {
  ImageQuality,
  MediaItem,
  ProfileData,
} from '../types/tmdb';
import { GENRES } from '../lib/seedData';
import { getTmdbImageUrl } from '../lib/tmdb';

interface MyAnoraPageProps {
  profile: ProfileData;
  allProfiles: ProfileData[];
  catalog: MediaItem[];
  imageQuality: ImageQuality;
  initialSection?: 'hub' | 'watchlist' | 'ratings' | 'lists' | 'history';
  onSwitchProfile: (profileId: string) => void;
  onSelectMedia: (item: MediaItem) => void;
  onToggleWatched: (mediaId: number, mediaType: 'movie' | 'tv') => void;
  onRemoveWatchlist: (mediaId: number, mediaType: 'movie' | 'tv') => void;
  onDeleteReview: (reviewId: string) => void;
  onCreateList: (name: string, description: string) => void;
  onDeleteList: (listId: string) => void;
  onClearHistory: () => void;
  onShare: (item: MediaItem) => void;
}

export const MyAnoraPage: React.FC<MyAnoraPageProps> = ({
  profile,
  allProfiles,
  catalog,
  imageQuality,
  initialSection = 'hub',
  onSwitchProfile,
  onSelectMedia,
  onToggleWatched,
  onRemoveWatchlist,
  onDeleteReview,
  onCreateList,
  onDeleteList,
  onClearHistory,
  onShare,
}) => {
  const [section, setSection] = useState<'hub' | 'watchlist' | 'ratings' | 'lists' | 'history'>(
    initialSection
  );
  const [watchlistView, setWatchlistView] = useState<'grid' | 'list'>('grid');
  const [watchlistFilter, setWatchlistFilter] = useState<'all' | 'unwatched' | 'watched'>('all');
  const [newListName, setNewListName] = useState('');
  const [newListDesc, setNewListDesc] = useState('');
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const ratingEntries = Object.values(profile.ratings);
  const likedEntries = ratingEntries.filter(
    (r) => r.rating >= 8 || r.thumb === 'love' || r.thumb === 'like'
  );

  // Derive top favorite genres
  const genreCounts: Record<number, number> = {};
  profile.watchlist.forEach((w) =>
    w.genre_ids.forEach((g) => {
      genreCounts[g] = (genreCounts[g] || 0) + 1;
    })
  );
  ratingEntries.forEach((r) =>
    r.genre_ids.forEach((g) => {
      genreCounts[g] = (genreCounts[g] || 0) + 2;
    })
  );
  const topGenreNames = Object.entries(genreCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([id]) => GENRES.find((g) => g.id === Number(id))?.name)
    .filter(Boolean);

  // CSV Export for Watchlist
  const handleExportWatchlistCsv = () => {
    const headers = ['Title,Type,Year,Rating,Watched,AddedAt'];
    const rows = profile.watchlist.map(
      (w) =>
        `"${w.title.replace(/"/g, '""')}",${w.mediaType},${w.year},${w.vote_average},${w.watched},${w.addedAt}`
    );
    const csv = [...headers, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `anora-watchlist-${profile.name.toLowerCase()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const resolveMedia = (mediaId: number, mediaType: 'movie' | 'tv'): MediaItem => {
    return (
      catalog.find((m) => m.id === mediaId && m.media_type === mediaType) ||
      catalog[0]
    );
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 pb-24 space-y-6">
      {/* Netflix Mobile "My Netflix / My Anora" Profile Header (Matches Screenshot 4: 1000096782.jpg) */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl bg-[#141416] border border-white/10">
        <div className="relative flex items-center gap-3.5">
          <div
            className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${profile.avatarColor} flex items-center justify-center text-2xl shadow-lg`}
          >
            {profile.avatarEmoji}
          </div>
          <div>
            <button
              type="button"
              onClick={() => setShowProfileMenu((v) => !v)}
              className="flex items-center gap-1.5 text-xl sm:text-2xl font-black text-white"
            >
              <span>{profile.name}</span>
              <ChevronDown className="w-5 h-5 text-[#F5C518]" />
            </button>
            <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-400 mt-0.5">
              <span>Taste DNA:</span>
              <span className="text-[#F5C518] font-bold">
                {topGenreNames.length > 0 ? topGenreNames.join(' • ') : 'Sci-Fi • Neo-Noir • Drama'}
              </span>
            </div>
          </div>

          {showProfileMenu && (
            <div className="absolute left-0 top-16 z-30 w-56 rounded-2xl bg-[#1C1C22] border border-white/20 p-2 shadow-2xl space-y-1">
              {allProfiles.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    onSwitchProfile(p.id);
                    setShowProfileMenu(false);
                  }}
                  className={`w-full flex items-center gap-2.5 p-2 rounded-xl text-left text-xs font-bold ${
                    p.id === profile.id ? 'bg-[#F5C518] text-black' : 'text-white hover:bg-white/10'
                  }`}
                >
                  <span>{p.avatarEmoji}</span>
                  <span>{p.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Profile Stats */}
        <div className="grid grid-cols-4 gap-2 sm:gap-4 text-center">
          <div className="px-3 py-2 rounded-xl bg-black/50 border border-white/10">
            <div className="text-base font-black text-[#F5C518]">{profile.watchlist.length}</div>
            <div className="text-[10px] text-zinc-400 font-bold">My List</div>
          </div>
          <div className="px-3 py-2 rounded-xl bg-black/50 border border-white/10">
            <div className="text-base font-black text-white">{ratingEntries.length}</div>
            <div className="text-[10px] text-zinc-400 font-bold">Rated</div>
          </div>
          <div className="px-3 py-2 rounded-xl bg-black/50 border border-white/10">
            <div className="text-base font-black text-white">{profile.customLists.length}</div>
            <div className="text-[10px] text-zinc-400 font-bold">Lists</div>
          </div>
          <div className="px-3 py-2 rounded-xl bg-black/50 border border-white/10">
            <div className="text-base font-black text-emerald-400">{profile.watchHistory.length}</div>
            <div className="text-[10px] text-zinc-400 font-bold">Watched</div>
          </div>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar border-b border-white/10 pb-3">
        {(
          [
            { id: 'hub', label: 'My Anora Hub' },
            { id: 'watchlist', label: `Watchlist (${profile.watchlist.length})` },
            { id: 'ratings', label: `Ratings & Reviews (${ratingEntries.length})` },
            { id: 'lists', label: `Custom Lists (${profile.customLists.length})` },
            { id: 'history', label: `History (${profile.watchHistory.length})` },
          ] as const
        ).map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setSection(t.id)}
            className={`px-4 py-2 rounded-xl text-xs font-black shrink-0 transition-all ${
              section === t.id
                ? 'bg-[#F5C518] text-black'
                : 'bg-[#141416] text-zinc-300 hover:text-white'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* SECTION 1: Netflix Mobile "My Anora Hub" (Matches Screenshot 4: 1000096782.jpg) */}
      {section === 'hub' && (
        <div className="space-y-6">
          {/* Moments & Reviews You've Saved */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-white">Moments & Reviews You’ve Saved</h3>
              <button
                type="button"
                onClick={() => setSection('ratings')}
                className="text-xs font-bold text-zinc-300 hover:text-[#F5C518] flex items-center gap-0.5"
              >
                <span>See all</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {profile.reviews.map((rev) => {
                const media = resolveMedia(rev.mediaId, rev.mediaType);
                return (
                  <div
                    key={rev.id}
                    className="rounded-2xl bg-[#141416] border border-white/10 overflow-hidden shadow-lg"
                  >
                    <div
                      onClick={() => onSelectMedia(media)}
                      className="relative aspect-video bg-black cursor-pointer group"
                    >
                      <img
                        src={getTmdbImageUrl(
                          media.backdrop_path || rev.mediaPoster,
                          imageQuality,
                          rev.mediaTitle
                        )}
                        alt={rev.mediaTitle}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                      <div className="absolute bottom-3 left-3 flex items-center gap-2">
                        <span className="w-8 h-8 rounded-full bg-black/80 border border-white/30 flex items-center justify-center text-white">
                          <Play className="w-3.5 h-3.5 fill-white ml-0.5" />
                        </span>
                        <span className="text-xs font-bold text-white">
                          {rev.episodeTag || 'Saved Moment'}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onShare(media);
                        }}
                        aria-label={`Share ${rev.mediaTitle}`}
                        className="absolute bottom-3 right-3 w-8 h-8 rounded-full bg-black/70 hover:bg-black flex items-center justify-center text-white"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="p-3.5">
                      <div className="flex items-center justify-between text-xs font-bold text-[#F5C518]">
                        <span>{rev.mediaTitle}</span>
                        <span>★ {rev.rating}/10</span>
                      </div>
                      <p className="text-xs text-zinc-300 mt-1 line-clamp-2">{rev.headline}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* My List Row */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-white">My List</h3>
              <button
                type="button"
                onClick={() => setSection('watchlist')}
                className="text-xs font-bold text-zinc-300 hover:text-[#F5C518] flex items-center gap-0.5"
              >
                <span>See all</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
              {profile.watchlist.map((w) => {
                const media = resolveMedia(w.mediaId, w.mediaType);
                return (
                  <button
                    key={`${w.mediaType}-${w.mediaId}`}
                    type="button"
                    onClick={() => onSelectMedia(media)}
                    className="w-36 shrink-0 rounded-xl overflow-hidden bg-[#141416] border border-white/10 text-left"
                  >
                    <div className="aspect-[2/3]">
                      <img
                        src={getTmdbImageUrl(w.poster_path || media.poster_path, imageQuality, w.title)}
                        alt={w.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-2 text-xs font-bold text-white truncate">{w.title}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Series & Films You Liked */}
          <div className="space-y-3">
            <h3 className="text-base font-black text-white">Series & Films You Liked</h3>
            <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
              {likedEntries.map((r) => {
                const media = resolveMedia(r.mediaId, r.mediaType);
                return (
                  <button
                    key={`${r.mediaType}-${r.mediaId}`}
                    type="button"
                    onClick={() => onSelectMedia(media)}
                    className="w-36 shrink-0 rounded-xl overflow-hidden bg-[#141416] border border-white/10 text-left"
                  >
                    <div className="aspect-[2/3] relative">
                      <img
                        src={getTmdbImageUrl(r.poster_path || media.poster_path, imageQuality, r.title)}
                        alt={r.title}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-[#E50914] text-white text-[10px] font-black">
                        ★ {r.rating}
                      </span>
                    </div>
                    <div className="p-2 text-xs font-bold text-white truncate">{r.title}</div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: Watchlist Manager (Grid/List Toggle, Filter, Mark Watched, CSV Export) */}
      {section === 'watchlist' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              {(['all', 'unwatched', 'watched'] as const).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setWatchlistFilter(f)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize ${
                    watchlistFilter === f ? 'bg-white text-black' : 'bg-[#141416] text-zinc-300'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleExportWatchlistCsv}
                className="px-3.5 py-1.5 rounded-xl bg-[#F5C518] text-black text-xs font-black flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>
              <button
                type="button"
                onClick={() => setWatchlistView((v) => (v === 'grid' ? 'list' : 'grid'))}
                className="p-2 rounded-xl bg-[#141416] border border-white/10 text-white"
                aria-label="Toggle Grid or List view"
              >
                {watchlistView === 'grid' ? <ListIcon className="w-4 h-4" /> : <Grid className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div
            className={
              watchlistView === 'grid'
                ? 'grid grid-cols-2 sm:grid-cols-4 gap-4'
                : 'space-y-2.5'
            }
          >
            {profile.watchlist
              .filter((w) => {
                if (watchlistFilter === 'watched') return w.watched;
                if (watchlistFilter === 'unwatched') return !w.watched;
                return true;
              })
              .map((w) => {
                const media = resolveMedia(w.mediaId, w.mediaType);
                return (
                  <div
                    key={`${w.mediaType}-${w.mediaId}`}
                    className="p-3 rounded-2xl bg-[#141416] border border-white/10 flex flex-col justify-between gap-3"
                  >
                    <div
                      onClick={() => onSelectMedia(media)}
                      className="flex items-center gap-3 cursor-pointer"
                    >
                      <img
                        src={getTmdbImageUrl(w.poster_path || media.poster_path, 'w500', w.title)}
                        alt={w.title}
                        className="w-14 h-20 rounded-xl object-cover shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="text-xs font-black text-white truncate">{w.title}</div>
                        <div className="text-[11px] text-zinc-400">
                          {w.year} • ★ {w.vote_average.toFixed(1)}
                        </div>
                        <span
                          className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                            w.watched
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : 'bg-amber-500/20 text-amber-300'
                          }`}
                        >
                          {w.watched ? 'Watched' : 'Unwatched'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/5">
                      <button
                        type="button"
                        onClick={() => onToggleWatched(w.mediaId, w.mediaType)}
                        className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/15 text-[11px] font-bold text-white flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3" />
                        <span>{w.watched ? 'Mark Unwatched' : 'Mark Watched'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => onRemoveWatchlist(w.mediaId, w.mediaType)}
                        aria-label={`Remove ${w.title}`}
                        className="p-1.5 rounded-lg bg-red-500/15 text-red-400 hover:bg-red-500/25"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* SECTION 3: Ratings & Reviews */}
      {section === 'ratings' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {ratingEntries.map((r) => {
              const media = resolveMedia(r.mediaId, r.mediaType);
              return (
                <div
                  key={`${r.mediaType}-${r.mediaId}`}
                  onClick={() => onSelectMedia(media)}
                  className="p-4 rounded-2xl bg-[#141416] border border-white/10 hover:border-[#F5C518] flex items-center justify-between cursor-pointer"
                >
                  <div>
                    <div className="text-sm font-black text-white">{r.title}</div>
                    <div className="text-xs text-zinc-400">{r.year}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    {r.thumb === 'love' && <Heart className="w-4 h-4 text-[#E50914] fill-current" />}
                    {r.thumb === 'like' && <ThumbsUp className="w-4 h-4 text-[#F5C518]" />}
                    <span className="px-3 py-1 rounded-xl bg-[#F5C518] text-black font-black text-xs">
                      ★ {r.rating}/10
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <h3 className="text-sm font-black uppercase text-zinc-400 pt-2">Your Written Reviews</h3>
          <div className="space-y-3">
            {profile.reviews.map((rev) => (
              <div
                key={rev.id}
                className="p-4 rounded-2xl bg-[#141416] border border-white/10 flex items-start justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="text-xs font-bold text-[#F5C518]">
                    {rev.mediaTitle} ({rev.mediaYear}) • ★ {rev.rating}/10
                  </div>
                  <div className="text-sm font-black text-white">{rev.headline}</div>
                  <p className="text-xs text-zinc-300">{rev.content}</p>
                </div>
                <button
                  type="button"
                  onClick={() => onDeleteReview(rev.id)}
                  aria-label={`Delete review for ${rev.mediaTitle}`}
                  className="p-2 rounded-xl bg-red-500/15 text-red-400 hover:bg-red-500/25 shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 4: Custom Named Lists */}
      {section === 'lists' && (
        <div className="space-y-5">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!newListName.trim()) return;
              onCreateList(newListName.trim(), newListDesc.trim() || 'Curated collection');
              setNewListName('');
              setNewListDesc('');
            }}
            className="p-4 rounded-2xl bg-[#141416] border border-white/10 flex flex-col sm:flex-row gap-2.5"
          >
            <input
              type="text"
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              placeholder="New Custom List Name (e.g., Sci-Fi Masterpieces)"
              className="flex-1 px-3.5 py-2 rounded-xl bg-black border border-white/15 text-xs text-white"
            />
            <input
              type="text"
              value={newListDesc}
              onChange={(e) => setNewListDesc(e.target.value)}
              placeholder="Description..."
              className="flex-1 px-3.5 py-2 rounded-xl bg-black border border-white/15 text-xs text-white"
            />
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#F5C518] text-black text-xs font-black flex items-center justify-center gap-1.5"
            >
              <FolderPlus className="w-4 h-4" />
              <span>Create List</span>
            </button>
          </form>

          <div className="space-y-4">
            {profile.customLists.map((list) => (
              <div
                key={list.id}
                className="p-5 rounded-2xl bg-[#141416] border border-white/10 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-base font-black text-white">{list.name}</h4>
                    <p className="text-xs text-zinc-400">{list.description}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onDeleteList(list.id)}
                    aria-label={`Delete list ${list.name}`}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-red-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex gap-3 overflow-x-auto pb-1 no-scrollbar">
                  {list.items.map((item) => {
                    const media = resolveMedia(item.mediaId, item.mediaType);
                    return (
                      <button
                        key={`${item.mediaType}-${item.mediaId}`}
                        type="button"
                        onClick={() => onSelectMedia(media)}
                        className="w-32 shrink-0 rounded-xl overflow-hidden bg-black/50 border border-white/10 text-left"
                      >
                        <div className="aspect-[2/3]">
                          <img
                            src={getTmdbImageUrl(item.poster_path || media.poster_path, 'w500', item.title)}
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="p-2 text-[11px] font-bold text-white truncate">
                          {item.title}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 5: Watch History */}
      {section === 'history' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-black text-white">Recently Viewed & Played</h3>
            {profile.watchHistory.length > 0 && (
              <button
                type="button"
                onClick={onClearHistory}
                className="px-3.5 py-1.5 rounded-xl bg-red-500/15 text-red-300 text-xs font-bold"
              >
                Clear Watch History
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {profile.watchHistory.map((h) => {
              const media = resolveMedia(h.mediaId, h.mediaType);
              return (
                <div
                  key={`${h.mediaType}-${h.mediaId}`}
                  onClick={() => onSelectMedia(media)}
                  className="p-3.5 rounded-2xl bg-[#141416] border border-white/10 flex items-center justify-between cursor-pointer hover:border-[#F5C518]"
                >
                  <div>
                    <div className="text-sm font-black text-white">{h.title}</div>
                    <div className="text-xs text-zinc-400">
                      {h.lastEpisode} • {h.progressPercent}% complete
                    </div>
                  </div>
                  <span className="text-xs font-bold text-[#F5C518]">Resume →</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
