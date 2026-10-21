import React, { useState } from 'react';
import {
  X,
  Play,
  Star,
  Plus,
  Check,
  Sparkles,
  Send,
  AlertTriangle,
  Film,
  Tv,
  FolderPlus,
} from 'lucide-react';
import {
  CustomList,
  Genre,
  MediaItem,
  ThumbReaction,
  VideoTrailer,
  WatchProviderItem,
} from '../types/tmdb';
import { RatingStars } from './RatingStars';

// 1. Trailer Modal (YouTube Embed + Multi-Video Selector)
interface TrailerModalProps {
  media: MediaItem | null;
  onClose: () => void;
}

export const TrailerModal: React.FC<TrailerModalProps> = ({ media, onClose }) => {
  const videos: VideoTrailer[] =
    media?.videos && media.videos.length > 0
      ? media.videos
      : [
          {
            id: 'default_tr',
            key: 'd9MyW72ELq0',
            name: `${media?.title || 'Anora'} — Official IMAX Trailer`,
            site: 'YouTube',
            type: 'Trailer',
            official: true,
          },
        ];

  const [selectedVideo, setSelectedVideo] = useState<VideoTrailer>(videos[0]);

  if (!media) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-3xl rounded-2xl bg-[#141416] border border-white/15 overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-[#E50914] text-white text-[10px] font-black uppercase">
              Trailer
            </span>
            <h3 className="text-sm sm:text-base font-bold text-white truncate">
              {media.title} — {selectedVideo.name}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Trailer Modal"
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="relative aspect-video w-full bg-black">
          <iframe
            title={selectedVideo.name}
            src={`https://www.youtube-nocookie.com/embed/${selectedVideo.key}?autoplay=1&rel=0`}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>

        {videos.length > 1 && (
          <div className="p-4 bg-[#0E0E11] border-t border-white/10 flex items-center gap-2 overflow-x-auto">
            {videos.map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => setSelectedVideo(v)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 flex items-center gap-1.5 border transition-colors ${
                  selectedVideo.id === v.id
                    ? 'bg-[#F5C518] text-black border-[#F5C518]'
                    : 'bg-white/5 text-zinc-300 border-white/10 hover:border-white/30'
                }`}
              >
                <Play className="w-3 h-3 fill-current" />
                <span>{v.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// 2. Rating & Review Modal (Netflix Thumbs Pill + IMDb 1-10 Stars + Spoiler Review)
interface RatingReviewModalProps {
  media: MediaItem | null;
  initialRating: number;
  initialThumb: ThumbReaction;
  onSaveRating: (rating: number, thumb: ThumbReaction) => void;
  onSaveReview: (
    rating: number,
    thumb: ThumbReaction,
    headline: string,
    content: string,
    containsSpoilers: boolean,
    episodeTag?: string
  ) => void;
  onClose: () => void;
}

export const RatingReviewModal: React.FC<RatingReviewModalProps> = ({
  media,
  initialRating,
  initialThumb,
  onSaveRating,
  onSaveReview,
  onClose,
}) => {
  const [rating, setRating] = useState<number>(initialRating || 9);
  const [thumb, setThumb] = useState<ThumbReaction>(initialThumb || 'love');
  const [headline, setHeadline] = useState('');
  const [content, setContent] = useState('');
  const [containsSpoilers, setContainsSpoilers] = useState(false);
  const [episodeTag, setEpisodeTag] = useState(
    media?.media_type === 'tv' ? 'S1:E1 • Starts at 24:10' : 'Feature Film • IMAX Cut'
  );

  if (!media) return null;

  const handleRatingChange = (newRating: number, newThumb?: ThumbReaction) => {
    setRating(newRating);
    if (newThumb !== undefined) setThumb(newThumb);
    onSaveRating(newRating, newThumb ?? thumb);
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!headline.trim() && !content.trim()) {
      onSaveRating(rating, thumb);
      onClose();
      return;
    }
    onSaveReview(
      rating,
      thumb,
      headline.trim() || `My thoughts on ${media.title}`,
      content.trim() || 'Highly recommended addition to the Anora catalog.',
      containsSpoilers,
      episodeTag
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-lg rounded-2xl bg-[#141416] border border-white/15 p-5 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between gap-3">
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#F5C518]">
              Rate & Shape What You See Next
            </span>
            <h3 className="text-lg font-black text-white mt-0.5">
              {media.title} ({media.year})
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Rating Modal"
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <RatingStars
          value={rating}
          thumb={thumb}
          onChange={handleRatingChange}
          showNetflixThumbs={true}
          size="lg"
        />

        <form onSubmit={handleSubmitReview} className="space-y-3 pt-2 border-t border-white/10">
          <div>
            <label className="block text-xs font-bold text-zinc-300 mb-1">
              Review Headline (Optional)
            </label>
            <input
              type="text"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              placeholder="e.g. A masterclass in tension and world-building"
              className="w-full px-3.5 py-2 rounded-xl bg-black/60 border border-white/15 text-sm text-white focus:border-[#F5C518] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-300 mb-1">
              Saved Moment / Timestamp Tag (My Anora Hub)
            </label>
            <input
              type="text"
              value={episodeTag}
              onChange={(e) => setEpisodeTag(e.target.value)}
              placeholder="e.g. S1:E4 • Starts at 49:20"
              className="w-full px-3.5 py-2 rounded-xl bg-black/60 border border-white/15 text-xs text-zinc-200 focus:border-[#F5C518] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-300 mb-1">Your Review</label>
            <textarea
              rows={3}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share your verdict on story, performances, cinematography..."
              className="w-full px-3.5 py-2 rounded-xl bg-black/60 border border-white/15 text-sm text-white focus:border-[#F5C518] focus:outline-none"
            />
          </div>

          <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={containsSpoilers}
              onChange={(e) => setContainsSpoilers(e.target.checked)}
              className="rounded border-white/20 bg-black text-[#F5C518] focus:ring-[#F5C518]"
            />
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span>This review contains plot spoilers (blur until clicked)</span>
          </label>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-bold text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#F5C518] hover:bg-amber-400 text-xs font-black text-black shadow-lg"
            >
              Save Rating & Review
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// 3. Custom List Picker Modal
interface ListPickerModalProps {
  media: MediaItem | null;
  lists: CustomList[];
  onToggleMediaInList: (listId: string, media: MediaItem) => void;
  onCreateList: (name: string, description: string) => void;
  onClose: () => void;
}

export const ListPickerModal: React.FC<ListPickerModalProps> = ({
  media,
  lists,
  onToggleMediaInList,
  onCreateList,
  onClose,
}) => {
  const [newListName, setNewListName] = useState('');
  const [newListDesc, setNewListDesc] = useState('');

  if (!media) return null;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newListName.trim()) return;
    onCreateList(newListName.trim(), newListDesc.trim() || 'Curated Anora collection');
    setNewListName('');
    setNewListDesc('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl bg-[#141416] border border-white/15 p-5 shadow-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase text-[#F5C518]">Custom Lists</span>
            <h3 className="text-base font-black text-white">Add “{media.title}” to a List</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close List Modal"
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
          {lists.map((list) => {
            const exists = list.items.some(
              (i) => i.mediaId === media.id && i.mediaType === media.media_type
            );
            return (
              <button
                key={list.id}
                type="button"
                onClick={() => onToggleMediaInList(list.id, media)}
                className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                  exists
                    ? 'bg-[#F5C518]/15 border-[#F5C518] text-white'
                    : 'bg-black/40 border-white/10 text-zinc-200 hover:border-white/30'
                }`}
              >
                <div>
                  <div className="text-sm font-bold">{list.name}</div>
                  <div className="text-[11px] text-zinc-400">{list.items.length} titles</div>
                </div>
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    exists ? 'bg-[#F5C518] text-black' : 'bg-white/10 text-white'
                  }`}
                >
                  {exists ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <Plus className="w-3.5 h-3.5" />}
                </span>
              </button>
            );
          })}
        </div>

        <form onSubmit={handleCreate} className="pt-3 border-t border-white/10 space-y-2.5">
          <div className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
            <FolderPlus className="w-3.5 h-3.5 text-[#F5C518]" />
            <span>Create New Custom List</span>
          </div>
          <input
            type="text"
            value={newListName}
            onChange={(e) => setNewListName(e.target.value)}
            placeholder="List Name (e.g., Sunday Binge, Best of 2025)"
            className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/15 text-xs text-white focus:border-[#F5C518] focus:outline-none"
          />
          <input
            type="text"
            value={newListDesc}
            onChange={(e) => setNewListDesc(e.target.value)}
            placeholder="Optional description..."
            className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/15 text-xs text-white focus:border-[#F5C518] focus:outline-none"
          />
          <button
            type="submit"
            className="w-full py-2 rounded-xl bg-[#F5C518] hover:bg-amber-400 text-black font-black text-xs"
          >
            + Create List
          </button>
        </form>
      </div>
    </div>
  );
};

// 4. Netflix Mobile Categories Overlay Drawer
interface CategoriesDrawerModalProps {
  open: boolean;
  genres: Genre[];
  providers: WatchProviderItem[];
  selectedGenreId: number | null;
  selectedProviderId: number | null;
  onSelectGenre: (genreId: number | null) => void;
  onSelectProvider: (providerId: number | null) => void;
  onClose: () => void;
}

export const CategoriesDrawerModal: React.FC<CategoriesDrawerModalProps> = ({
  open,
  genres,
  providers,
  selectedGenreId,
  selectedProviderId,
  onSelectGenre,
  onSelectProvider,
  onClose,
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/92 backdrop-blur-xl flex flex-col p-6 overflow-y-auto">
      <div className="max-w-lg mx-auto w-full space-y-6 pb-16">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <h2 className="text-xl font-black text-white tracking-tight">
            Browse Categories & Services
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Categories Menu"
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div>
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#F5C518] mb-3">
            Filter by Streaming Service
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => {
                onSelectProvider(null);
                onClose();
              }}
              className={`px-3 py-2.5 rounded-xl text-xs font-bold border text-left ${
                selectedProviderId === null
                  ? 'bg-[#F5C518] text-black border-[#F5C518]'
                  : 'bg-[#141416] text-zinc-300 border-white/10'
              }`}
            >
              All Platforms
            </button>
            {providers.map((p) => (
              <button
                key={p.provider_id}
                type="button"
                onClick={() => {
                  onSelectProvider(p.provider_id);
                  onClose();
                }}
                className={`px-3 py-2.5 rounded-xl text-xs font-bold border flex items-center gap-2 ${
                  selectedProviderId === p.provider_id
                    ? 'bg-[#F5C518]/20 text-[#F5C518] border-[#F5C518]'
                    : 'bg-[#141416] text-zinc-200 border-white/10 hover:border-white/30'
                }`}
              >
                <span
                  style={{ backgroundColor: p.color, color: p.textColor || '#FFF' }}
                  className="w-5 h-5 rounded text-[9px] font-black flex items-center justify-center shrink-0"
                >
                  {p.short_name}
                </span>
                <span className="truncate">{p.provider_name}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#F5C518] mb-3">
            All Genres
          </h3>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                onSelectGenre(null);
                onClose();
              }}
              className={`px-3.5 py-2.5 rounded-xl text-sm font-bold text-left ${
                selectedGenreId === null
                  ? 'bg-white text-black'
                  : 'bg-[#141416] text-zinc-300 hover:text-white'
              }`}
            >
              All Genres
            </button>
            {genres.map((g) => (
              <button
                key={g.id}
                type="button"
                onClick={() => {
                  onSelectGenre(g.id);
                  onClose();
                }}
                className={`px-3.5 py-2.5 rounded-xl text-sm font-semibold text-left transition-colors ${
                  selectedGenreId === g.id
                    ? 'bg-[#F5C518] text-black font-bold'
                    : 'bg-[#141416] text-zinc-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                {g.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// 5. AI "What Should I Watch?" Concierge Modal
interface AiConciergeModalProps {
  open: boolean;
  catalog: MediaItem[];
  favoriteGenres: string[];
  hasLlmKey: boolean;
  llmProvider: 'gemini' | 'openai';
  onSelectMedia: (item: MediaItem) => void;
  onClose: () => void;
}

export const AiConciergeModal: React.FC<AiConciergeModalProps> = ({
  open,
  catalog,
  favoriteGenres,
  hasLlmKey,
  llmProvider,
  onSelectMedia,
  onClose,
}) => {
  const [prompt, setPrompt] = useState('');
  const [history, setHistory] = useState<
    { role: 'user' | 'assistant'; text: string; matches?: MediaItem[] }[]
  >([
    {
      role: 'assistant',
      text: `Hi! I'm your Anora AI Cinema Concierge. Based on your taste profile (${
        favoriteGenres.slice(0, 3).join(', ') || 'Sci-Fi, Crime, Prestige Drama'
      }), ask me anything like "Mind-bending sci-fi in IMAX", "Dark crime series like Peaky Blinders", or "Family animation under 2 hours".`,
      matches: catalog.slice(0, 3),
    },
  ]);

  if (!open) return null;

  const runQuery = (queryText: string) => {
    const q = queryText.trim();
    if (!q) return;
    const lower = q.toLowerCase();

    const scored = catalog
      .map((item) => {
        let s = item.vote_average;
        if (item.title.toLowerCase().includes(lower)) s += 15;
        if (item.overview.toLowerCase().includes(lower)) s += 8;
        if (lower.includes('sci-fi') || lower.includes('space') || lower.includes('imax')) {
          if (item.genre_ids.includes(878) || item.genre_ids.includes(10765)) s += 12;
        }
        if (lower.includes('crime') || lower.includes('noir') || lower.includes('mystery')) {
          if (item.genre_ids.includes(80) || item.genre_ids.includes(9648)) s += 12;
        }
        if (lower.includes('series') || lower.includes('tv') || lower.includes('binge')) {
          if (item.media_type === 'tv') s += 10;
        }
        if (lower.includes('movie') || lower.includes('film') || lower.includes('2 hours')) {
          if (item.media_type === 'movie') s += 10;
        }
        if (lower.includes('kids') || lower.includes('family') || lower.includes('anime')) {
          if (item.genre_ids.includes(16) || item.is_kids_safe) s += 12;
        }
        return { item, score: s };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map((x) => x.item);

    const responseText = `Here are 3 tailored picks matching "${q}" (${
      hasLlmKey ? `powered by ${llmProvider.toUpperCase()} + TMDB Taste Graph` : 'powered by Anora Local Taste Graph'
    }):`;

    setHistory((prev) => [
      ...prev,
      { role: 'user', text: q },
      { role: 'assistant', text: responseText, matches: scored },
    ]);
    setPrompt('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-xl rounded-2xl bg-[#141416] border border-[#F5C518]/30 overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
        <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-[#F5C518]/15 via-transparent to-transparent border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#F5C518] text-black flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white">“What Should I Watch?” AI Concierge</h3>
              <p className="text-[11px] text-zinc-400">
                Personalized TMDB + JustWatch Taste Engine
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close AI Concierge"
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {history.map((msg, i) => (
            <div
              key={i}
              className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[90%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm ${
                  msg.role === 'user'
                    ? 'bg-[#F5C518] text-black font-bold'
                    : 'bg-white/5 border border-white/10 text-zinc-200'
                }`}
              >
                {msg.text}
              </div>
              {msg.matches && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mt-2.5 w-full">
                  {msg.matches.map((m) => (
                    <button
                      key={`${m.media_type}-${m.id}`}
                      type="button"
                      onClick={() => {
                        onSelectMedia(m);
                        onClose();
                      }}
                      className="flex sm:flex-col items-center sm:items-start gap-2.5 p-2.5 rounded-xl bg-black/60 border border-white/10 hover:border-[#F5C518] text-left transition-all"
                    >
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#F5C518]">
                        {m.media_type === 'tv' ? <Tv className="w-3 h-3" /> : <Film className="w-3 h-3" />}
                        <span>★ {m.vote_average.toFixed(1)}</span>
                        <span>• {m.year}</span>
                      </div>
                      <div className="text-xs font-extrabold text-white line-clamp-1">{m.title}</div>
                      <div className="text-[10px] text-emerald-400 font-bold">98% Taste Match</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="px-4 py-2 bg-black/40 flex items-center gap-1.5 overflow-x-auto no-scrollbar border-t border-white/5">
          {[
            'Mind-bending Sci-Fi in IMAX',
            'Espionage & Crime Series',
            'Quick 30-min Anime & Family',
          ].map((chip) => (
            <button
              key={chip}
              type="button"
              onClick={() => runQuery(chip)}
              className="px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/15 text-[11px] text-zinc-300 shrink-0 border border-white/10"
            >
              {chip}
            </button>
          ))}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            runQuery(prompt);
          }}
          className="p-3 bg-[#0A0A0B] border-t border-white/10 flex items-center gap-2"
        >
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ask e.g. 'Atmospheric thriller streaming on Netflix'..."
            className="flex-1 px-3.5 py-2 rounded-xl bg-[#141416] border border-white/15 text-xs sm:text-sm text-white focus:border-[#F5C518] focus:outline-none"
          />
          <button
            type="submit"
            aria-label="Send prompt"
            className="px-4 py-2 rounded-xl bg-[#F5C518] hover:bg-amber-400 text-black font-black text-xs flex items-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Ask</span>
          </button>
        </form>
      </div>
    </div>
  );
};
