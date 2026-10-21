import React, { useState, useEffect, useCallback } from 'react';
import {
  Home,
  Search,
  Compass,
  Bookmark,
  User,
  Settings as SettingsIcon,
  Sparkles,
  Smartphone,
  Monitor,
  Users,
  Key,
  Film,
  Tv,
} from 'lucide-react';
import {
  AccountUser,
  AppSettings,
  FilterPreset,
  MediaItem,
  PersonDetail,
  ProfileData,
  ThumbReaction,
} from './types/tmdb';
import {
  AVATAR_OPTIONS,
  GENRES,
  SEED_MEDIA,
  SEED_PEOPLE,
  STREAMING_PROVIDERS,
} from './lib/seedData';
import {
  fetchCatalogMedia,
  fetchMediaDetail,
  fetchPersonDetail,
} from './lib/tmdb';
import {
  DEFAULT_SETTINGS,
  INITIAL_PROFILES,
  loadPersistedState,
  savePersistedState,
} from './lib/store';
import {
  AiConciergeModal,
  CategoriesDrawerModal,
  ListPickerModal,
  RatingReviewModal,
  TrailerModal,
} from './components/Modals';
import {
  AuthScreen,
  OnboardingWizard,
  ProfileGate,
} from './pages/AuthAndOnboarding';
import { HomePage } from './pages/Home';
import { DiscoverPage, SearchPage } from './pages/SearchAndDiscover';
import { TitleDetail } from './pages/TitleDetail';
import { PersonDetailPage } from './pages/PersonDetail';
import { MyAnoraPage } from './pages/MyAnora';
import { SettingsPage } from './pages/Settings';

export type NavRoute =
  | 'home'
  | 'search'
  | 'discover'
  | 'watchlist'
  | 'my-anora'
  | 'settings'
  | 'detail'
  | 'person'
  | 'profiles'
  | 'auth'
  | 'onboarding';

export default function App() {
  const initial = loadPersistedState();
  const [account, setAccount] = useState<AccountUser | null>(initial.account);
  const [profiles, setProfiles] = useState<ProfileData[]>(initial.profiles);
  const [activeProfileId, setActiveProfileId] = useState<string | null>(
    initial.activeProfileId
  );
  const [settings, setSettings] = useState<AppSettings>(initial.settings);

  const [route, setRoute] = useState<NavRoute>('home');
  const [catalog, setCatalog] = useState<MediaItem[]>(SEED_MEDIA);
  const [selectedMedia, setSelectedMedia] = useState<MediaItem>(SEED_MEDIA[0]);
  const [selectedPerson, setSelectedPerson] = useState<PersonDetail>(SEED_PEOPLE[0]);
  const [myAnoraSection, setMyAnoraSection] = useState<
    'hub' | 'watchlist' | 'ratings' | 'lists' | 'history'
  >('hub');

  // Home category filters
  const [categoryTab, setCategoryTab] = useState<'all' | 'tv' | 'movie' | 'new'>('all');
  const [selectedGenreId, setSelectedGenreId] = useState<number | null>(null);
  const [selectedProviderId, setSelectedProviderId] = useState<number | null>(null);

  // Modals
  const [trailerMedia, setTrailerMedia] = useState<MediaItem | null>(null);
  const [ratingModalMedia, setRatingModalMedia] = useState<MediaItem | null>(null);
  const [listModalMedia, setListModalMedia] = useState<MediaItem | null>(null);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [aiConciergeOpen, setAiConciergeOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const activeProfile =
    profiles.find((p) => p.id === activeProfileId) || profiles[0];

  const notify = useCallback((msg: string) => {
    setToastMessage(msg);
  }, []);

  useEffect(() => {
    if (!toastMessage) return;
    const t = setTimeout(() => setToastMessage(null), 3200);
    return () => clearTimeout(t);
  }, [toastMessage]);

  // Persist state on change
  useEffect(() => {
    savePersistedState({
      account,
      activeProfileId,
      profiles,
      settings,
    });
  }, [account, activeProfileId, profiles, settings]);

  // Fetch live TMDB catalog when API key changes
  useEffect(() => {
    let cancelled = false;
    fetchCatalogMedia(settings.tmdbApiKey).then((items) => {
      if (!cancelled && items.length > 0) {
        setCatalog(items);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [settings.tmdbApiKey]);

  // Global Keyboard Shortcuts: '/' to focus search, 'Escape' to close modals
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      const isInput = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';
      if (e.key === '/' && !isInput) {
        e.preventDefault();
        setRoute('search');
        setTimeout(() => {
          const el = document.getElementById('anora-search-input');
          if (el) el.focus();
        }, 60);
      } else if (e.key === 'Escape') {
        setTrailerMedia(null);
        setRatingModalMedia(null);
        setListModalMedia(null);
        setCategoriesOpen(false);
        setAiConciergeOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const mutateActiveProfile = (updater: (prof: ProfileData) => ProfileData) => {
    setProfiles((prev) =>
      prev.map((p) => (p.id === activeProfile.id ? updater(p) : p))
    );
  };

  // Select a movie or TV series → auto-log to Watch History & fetch full details
  const handleSelectMedia = async (item: MediaItem) => {
    setSelectedMedia(item);
    setRoute('detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });

    mutateActiveProfile((prof) => {
      const filtered = prof.watchHistory.filter(
        (h) => !(h.mediaId === item.id && h.mediaType === item.media_type)
      );
      return {
        ...prof,
        watchHistory: [
          {
            mediaId: item.id,
            mediaType: item.media_type,
            title: item.title,
            poster_path: item.poster_path,
            backdrop_path: item.backdrop_path,
            year: item.year,
            progressPercent: 35,
            lastEpisode: item.media_type === 'tv' ? 'S1:E1' : 'Feature Film',
            timestampLabel: item.media_type === 'tv' ? '34m left' : '1h 18m left',
            viewedAt: new Date().toISOString(),
            genre_ids: item.genre_ids,
          },
          ...filtered,
        ].slice(0, 20),
      };
    });

    if (settings.tmdbApiKey.trim()) {
      const full = await fetchMediaDetail(
        item.id,
        item.media_type,
        settings.tmdbApiKey,
        settings.region
      );
      setSelectedMedia(full);
    }
  };

  const handleSelectPerson = async (personId: number) => {
    const p = await fetchPersonDetail(personId, settings.tmdbApiKey);
    setSelectedPerson(p);
    setRoute('person');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleToggleWatchlist = (item: MediaItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const exists = activeProfile.watchlist.some(
      (w) => w.mediaId === item.id && w.mediaType === item.media_type
    );
    mutateActiveProfile((prof) => ({
      ...prof,
      watchlist: exists
        ? prof.watchlist.filter(
            (w) => !(w.mediaId === item.id && w.mediaType === item.media_type)
          )
        : [
            {
              mediaId: item.id,
              mediaType: item.media_type,
              title: item.title,
              poster_path: item.poster_path,
              backdrop_path: item.backdrop_path,
              year: item.year,
              vote_average: item.vote_average,
              runtime: item.runtime,
              genre_ids: item.genre_ids,
              addedAt: new Date().toISOString(),
              watched: false,
            },
            ...prof.watchlist,
          ],
    }));
    notify(
      exists
        ? `Removed "${item.title}" from My List`
        : `Added "${item.title}" to My List`
    );
  };

  const handleToggleWatched = (mediaId: number, mediaType: 'movie' | 'tv') => {
    mutateActiveProfile((prof) => {
      const inList = prof.watchlist.some(
        (w) => w.mediaId === mediaId && w.mediaType === mediaType
      );
      if (inList) {
        return {
          ...prof,
          watchlist: prof.watchlist.map((w) =>
            w.mediaId === mediaId && w.mediaType === mediaType
              ? { ...w, watched: !w.watched }
              : w
          ),
        };
      }
      const item =
        catalog.find((m) => m.id === mediaId && m.media_type === mediaType) ||
        selectedMedia;
      return {
        ...prof,
        watchlist: [
          {
            mediaId: item.id,
            mediaType: item.media_type,
            title: item.title,
            poster_path: item.poster_path,
            backdrop_path: item.backdrop_path,
            year: item.year,
            vote_average: item.vote_average,
            genre_ids: item.genre_ids,
            addedAt: new Date().toISOString(),
            watched: true,
          },
          ...prof.watchlist,
        ],
      };
    });
    notify('Updated watched status!');
  };

  const handleSaveRating = (
    item: MediaItem,
    rating: number,
    thumb: ThumbReaction
  ) => {
    const key = `${item.media_type}-${item.id}`;
    mutateActiveProfile((prof) => ({
      ...prof,
      ratings: {
        ...prof.ratings,
        [key]: {
          mediaId: item.id,
          mediaType: item.media_type,
          title: item.title,
          poster_path: item.poster_path,
          year: item.year,
          genre_ids: item.genre_ids,
          rating,
          thumb,
          ratedAt: new Date().toISOString(),
        },
      },
    }));
    notify(`Rated "${item.title}" ★ ${rating}/10`);
  };

  const handleSaveReview = (
    item: MediaItem,
    rating: number,
    thumb: ThumbReaction,
    headline: string,
    content: string,
    containsSpoilers: boolean,
    episodeTag?: string
  ) => {
    handleSaveRating(item, rating, thumb);
    mutateActiveProfile((prof) => ({
      ...prof,
      reviews: [
        {
          id: `rev_${Date.now()}`,
          mediaId: item.id,
          mediaType: item.media_type,
          mediaTitle: item.title,
          mediaPoster: item.poster_path,
          mediaYear: item.year,
          rating,
          thumb,
          headline,
          content,
          containsSpoilers,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          episodeTag,
        },
        ...prof.reviews,
      ],
    }));
    notify(`Saved review for "${item.title}" to My Anora!`);
  };

  const handleShare = async (item: MediaItem) => {
    const shareText = `Watch "${item.title}" (${item.year}) on Anora — IMDb ★ ${item.vote_average.toFixed(1)}`;
    const shareUrl = `https://www.themoviedb.org/${item.media_type}/${item.id}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: item.title, text: shareText, url: shareUrl });
        notify(`Shared "${item.title}"!`);
        return;
      }
    } catch {
      // Fallback
    }
    try {
      const temp = document.createElement('textarea');
      temp.value = `${shareText} ${shareUrl}`;
      document.body.appendChild(temp);
      temp.select();
      document.execCommand('copy');
      document.body.removeChild(temp);
    } catch {
      // Ignore
    }
    notify(`Copied share link for "${item.title}" to clipboard!`);
  };

  const handleExportAllJson = () => {
    const payload = JSON.stringify(
      { account, profiles, settings, exportedAt: new Date().toISOString() },
      null,
      2
    );
    const blob = new Blob([payload], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `anora-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    notify('Exported full Anora JSON backup!');
  };

  // Fullscreen Auth / Profile / Onboarding routes
  if (route === 'auth') {
    return (
      <AuthScreen
        onSuccess={(user, isNew, avatarId) => {
          setAccount(user);
          if (isNew) {
            const av =
              AVATAR_OPTIONS.find((a) => a.id === avatarId) || AVATAR_OPTIONS[0];
            const newProf: ProfileData = {
              ...INITIAL_PROFILES[0],
              id: `prof_${Date.now()}`,
              name: user.name.split(' ')[0] || 'User',
              avatarId: av.id,
              avatarColor: av.color,
              avatarEmoji: av.emoji,
              onboardingCompleted: false,
            };
            setProfiles((prev) => [newProf, ...prev]);
            setActiveProfileId(newProf.id);
            setRoute('onboarding');
          } else {
            setRoute('profiles');
          }
          notify(`Welcome to Anora, ${user.name}!`);
        }}
        onGuestMode={() => {
          setAccount({
            id: 'usr_guest',
            name: 'Guest Viewer',
            email: 'guest@anora.cinema',
            passwordHash: '',
            createdAt: new Date().toISOString(),
            isGuest: true,
          });
          setRoute('home');
          notify('Browsing in Guest Mode');
        }}
      />
    );
  }

  if (route === 'profiles') {
    return (
      <ProfileGate
        profiles={profiles}
        onSelectProfile={(id) => {
          setActiveProfileId(id);
          const chosen = profiles.find((p) => p.id === id);
          if (chosen && !chosen.onboardingCompleted) {
            setRoute('onboarding');
          } else {
            setRoute('home');
          }
          notify(`Switched profile to ${chosen?.name || 'User'}`);
        }}
        onAddProfile={(name, avatarId, isKids) => {
          const av =
            AVATAR_OPTIONS.find((a) => a.id === avatarId) || AVATAR_OPTIONS[0];
          const created: ProfileData = {
            id: `prof_${Date.now()}`,
            name,
            avatarId: av.id,
            avatarColor: av.color,
            avatarEmoji: av.emoji,
            isKids,
            onboardingCompleted: false,
            favoriteTitleIds: [1001, 1002],
            preferredProviders: [8, 119],
            watchlist: [],
            ratings: {},
            reviews: [],
            customLists: [],
            watchHistory: [],
            recentSearches: [],
            savedFilterPresets: [],
          };
          setProfiles((prev) => [...prev, created]);
          setActiveProfileId(created.id);
          setRoute('onboarding');
        }}
        onGuestMode={() => {
          setRoute('home');
          notify('Continuing as Guest Viewer');
        }}
      />
    );
  }

  if (route === 'onboarding') {
    return (
      <OnboardingWizard
        catalog={catalog}
        initialFavorites={activeProfile.favoriteTitleIds}
        initialProviders={activeProfile.preferredProviders}
        initialRegion={settings.region}
        onComplete={(favs, provs, reg) => {
          mutateActiveProfile((p) => ({
            ...p,
            onboardingCompleted: true,
            favoriteTitleIds: favs,
            preferredProviders: provs,
          }));
          setSettings((s) => ({ ...s, region: reg }));
          setRoute('home');
          notify('Taste Graph calibrated! Welcome to Anora.');
        }}
      />
    );
  }

  const isMobileFrame = settings.layoutPreview === 'mobile';
  const bgClass = settings.theme === 'amoled' ? 'bg-black' : 'bg-[#0A0A0B]';

  return (
    <div
      className={`min-h-screen ${bgClass} text-white font-sans selection:bg-[#F5C518] selection:text-black`}
    >
      {/* Optional Phone Frame Wrapper when user toggles Mobile App Frame Preview */}
      <div
        className={
          isMobileFrame
            ? 'max-w-[430px] mx-auto min-h-screen border-x border-white/15 shadow-[0_0_90px_rgba(245,197,24,0.12)] relative bg-[#0A0A0B]'
            : 'w-full min-h-screen relative'
        }
      >
        {/* Top Cinematic Header Bar (Matches Netflix Mobile Header + Desktop Top Nav) */}
        <header className="sticky top-0 z-40 bg-[#0A0A0B]/90 backdrop-blur-xl border-b border-white/10 px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
          {/* Left: Brand Emblem */}
          <div className="flex items-center gap-5">
            <button
              type="button"
              onClick={() => {
                setCategoryTab('all');
                setSelectedGenreId(null);
                setSelectedProviderId(null);
                setRoute('home');
              }}
              className="flex items-center gap-2.5 group focus:outline-none"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#E50914] via-[#E50914] to-[#F5C518] flex items-center justify-center text-white font-black text-lg shadow-md group-hover:scale-105 transition-transform">
                A
              </div>
              <div className="text-left">
                <span className="text-lg font-black tracking-tight text-white block leading-none">
                  ANORA
                </span>
                <span className="text-[9px] font-extrabold uppercase tracking-widest text-[#F5C518] block">
                  {settings.region} • {settings.tmdbKeyStatus === 'valid' ? 'TMDB LIVE' : 'DEMO 4K'}
                </span>
              </div>
            </button>

            {/* Desktop Top Navigation Links */}
            {!isMobileFrame && (
              <nav className="hidden md:flex items-center gap-1">
                {(
                  [
                    { id: 'home', label: 'Home' },
                    { id: 'discover', label: 'Discover' },
                    { id: 'search', label: 'Search' },
                    { id: 'watchlist', label: 'Watchlist' },
                    { id: 'my-anora', label: 'My Anora' },
                    { id: 'settings', label: 'Settings & API' },
                  ] as const
                ).map((item) => {
                  const active =
                    route === item.id ||
                    (item.id === 'watchlist' &&
                      route === 'my-anora' &&
                      myAnoraSection === 'watchlist');
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        if (item.id === 'watchlist') {
                          setMyAnoraSection('watchlist');
                          setRoute('my-anora');
                        } else if (item.id === 'my-anora') {
                          setMyAnoraSection('hub');
                          setRoute('my-anora');
                        } else {
                          setRoute(item.id);
                        }
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                        active
                          ? 'bg-white/10 text-[#F5C518]'
                          : 'text-zinc-300 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </nav>
            )}
          </div>

          {/* Right Header Controls: Mobile/Desktop Frame Toggle, Search, API Key, Profile */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() =>
                setSettings((s) => ({
                  ...s,
                  layoutPreview: s.layoutPreview === 'mobile' ? 'auto' : 'mobile',
                }))
              }
              title="Toggle Mobile App Frame vs Full Widescreen"
              className={`px-2.5 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-colors ${
                isMobileFrame
                  ? 'bg-[#F5C518] text-black border-[#F5C518]'
                  : 'bg-[#141416] text-zinc-300 border-white/15 hover:text-white'
              }`}
            >
              {isMobileFrame ? (
                <>
                  <Monitor className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Widescreen</span>
                </>
              ) : (
                <>
                  <Smartphone className="w-3.5 h-3.5 text-[#F5C518]" />
                  <span className="hidden sm:inline">Mobile UI</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => setRoute('search')}
              aria-label="Open Search"
              className="w-9 h-9 rounded-xl bg-[#141416] hover:bg-white/10 border border-white/15 flex items-center justify-center text-white"
            >
              <Search className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => setRoute('settings')}
              aria-label="Open Settings & TMDB API Key"
              className="w-9 h-9 rounded-xl bg-[#141416] hover:bg-white/10 border border-white/15 flex items-center justify-center text-[#F5C518]"
            >
              <SettingsIcon className="w-4 h-4" />
            </button>

            {/* Netflix Square Smiley Avatar Profile Switcher Button (Matches Screenshot 1) */}
            <button
              type="button"
              onClick={() => setRoute('profiles')}
              title={`Active Profile: ${activeProfile.name} (Click to switch)`}
              className={`h-9 px-2.5 rounded-xl bg-gradient-to-br ${activeProfile.avatarColor} flex items-center gap-1.5 text-xs font-black text-white shadow border border-white/25`}
            >
              <span>{activeProfile.avatarEmoji}</span>
              <span className="hidden sm:inline">{activeProfile.name}</span>
            </button>
          </div>
        </header>

        {/* Main Screen Router */}
        <main>
          {route === 'home' && (
            <HomePage
              catalog={catalog}
              profile={activeProfile}
              region={settings.region}
              imageQuality={settings.imageQuality}
              reduceMotion={settings.reduceMotion}
              isMobileLayout={isMobileFrame}
              hasApiKey={Boolean(settings.tmdbApiKey.trim())}
              enableAi={settings.enableAiRecommendations}
              categoryTab={categoryTab}
              selectedGenreId={selectedGenreId}
              selectedProviderId={selectedProviderId}
              onChangeCategoryTab={setCategoryTab}
              onOpenCategoriesDrawer={() => setCategoriesOpen(true)}
              onOpenAiConcierge={() => setAiConciergeOpen(true)}
              onSelectMedia={handleSelectMedia}
              onPlayTrailer={(item) => setTrailerMedia(item)}
              onToggleWatchlist={handleToggleWatchlist}
              onQuickRate={(item, e) => {
                e.stopPropagation();
                setRatingModalMedia(item);
              }}
              onRemoveHistory={(mediaId, mediaType) => {
                mutateActiveProfile((p) => ({
                  ...p,
                  watchHistory: p.watchHistory.filter(
                    (h) => !(h.mediaId === mediaId && h.mediaType === mediaType)
                  ),
                }));
                notify('Removed from Continue Watching');
              }}
              onNavigateSettingsApi={() => setRoute('settings')}
              onNavigateWatchlist={() => {
                setMyAnoraSection('watchlist');
                setRoute('my-anora');
              }}
            />
          )}

          {route === 'search' && (
            <SearchPage
              catalog={catalog}
              apiKey={settings.tmdbApiKey}
              imageQuality={settings.imageQuality}
              recentSearches={activeProfile.recentSearches}
              watchlist={activeProfile.watchlist}
              ratings={activeProfile.ratings}
              onAddRecentSearch={(q) => {
                mutateActiveProfile((p) => ({
                  ...p,
                  recentSearches: [
                    q,
                    ...p.recentSearches.filter((x) => x.toLowerCase() !== q.toLowerCase()),
                  ].slice(0, 8),
                }));
              }}
              onClearRecentSearches={() =>
                mutateActiveProfile((p) => ({ ...p, recentSearches: [] }))
              }
              onSelectMedia={handleSelectMedia}
              onSelectPerson={handleSelectPerson}
              onToggleWatchlist={handleToggleWatchlist}
              onQuickRate={(item, e) => {
                e.stopPropagation();
                setRatingModalMedia(item);
              }}
            />
          )}

          {route === 'discover' && (
            <DiscoverPage
              catalog={catalog}
              region={settings.region}
              imageQuality={settings.imageQuality}
              watchlist={activeProfile.watchlist}
              ratings={activeProfile.ratings}
              savedPresets={activeProfile.savedFilterPresets}
              onSavePreset={(preset) => {
                mutateActiveProfile((p) => ({
                  ...p,
                  savedFilterPresets: [
                    { ...preset, id: `preset_${Date.now()}` },
                    ...p.savedFilterPresets,
                  ],
                }));
                notify(`Saved filter preset "${preset.name}"!`);
              }}
              onDeletePreset={(id) => {
                mutateActiveProfile((p) => ({
                  ...p,
                  savedFilterPresets: p.savedFilterPresets.filter((x) => x.id !== id),
                }));
              }}
              onSelectMedia={handleSelectMedia}
              onToggleWatchlist={handleToggleWatchlist}
              onQuickRate={(item, e) => {
                e.stopPropagation();
                setRatingModalMedia(item);
              }}
            />
          )}

          {route === 'detail' && (
            <TitleDetail
              item={selectedMedia}
              catalog={catalog}
              region={settings.region}
              preferredProviders={activeProfile.preferredProviders}
              imageQuality={settings.imageQuality}
              inWatchlist={activeProfile.watchlist.some(
                (w) =>
                  w.mediaId === selectedMedia.id &&
                  w.mediaType === selectedMedia.media_type
              )}
              isWatched={activeProfile.watchlist.some(
                (w) =>
                  w.mediaId === selectedMedia.id &&
                  w.mediaType === selectedMedia.media_type &&
                  w.watched
              )}
              userRating={
                activeProfile.ratings[
                  `${selectedMedia.media_type}-${selectedMedia.id}`
                ]
              }
              reviews={activeProfile.reviews}
              onBack={() => setRoute('home')}
              onChangeRegion={(reg) => setSettings((s) => ({ ...s, region: reg }))}
              onPlayTrailer={(item) => setTrailerMedia(item)}
              onToggleWatchlist={handleToggleWatchlist}
              onToggleWatched={(item) => handleToggleWatched(item.id, item.media_type)}
              onOpenRatingModal={(item) => setRatingModalMedia(item)}
              onDirectRate={(item, rating, thumb) =>
                handleSaveRating(item, rating, thumb)
              }
              onOpenListModal={(item) => setListModalMedia(item)}
              onSelectPerson={handleSelectPerson}
              onSelectMedia={handleSelectMedia}
              onShare={handleShare}
            />
          )}

          {route === 'person' && (
            <PersonDetailPage
              person={selectedPerson}
              catalog={catalog}
              imageQuality={settings.imageQuality}
              onBack={() => setRoute('detail')}
              onSelectMedia={handleSelectMedia}
            />
          )}

          {(route === 'my-anora' || route === 'watchlist') && (
            <MyAnoraPage
              profile={activeProfile}
              allProfiles={profiles}
              catalog={catalog}
              imageQuality={settings.imageQuality}
              initialSection={route === 'watchlist' ? 'watchlist' : myAnoraSection}
              onSwitchProfile={(id) => {
                setActiveProfileId(id);
                notify('Switched active profile');
              }}
              onSelectMedia={handleSelectMedia}
              onToggleWatched={handleToggleWatched}
              onRemoveWatchlist={(mediaId, mediaType) => {
                mutateActiveProfile((p) => ({
                  ...p,
                  watchlist: p.watchlist.filter(
                    (w) => !(w.mediaId === mediaId && w.mediaType === mediaType)
                  ),
                }));
                notify('Removed from Watchlist');
              }}
              onDeleteReview={(revId) => {
                mutateActiveProfile((p) => ({
                  ...p,
                  reviews: p.reviews.filter((r) => r.id !== revId),
                }));
                notify('Deleted review');
              }}
              onCreateList={(name, description) => {
                mutateActiveProfile((p) => ({
                  ...p,
                  customLists: [
                    {
                      id: `list_${Date.now()}`,
                      name,
                      description,
                      isPublic: true,
                      createdAt: new Date().toISOString(),
                      items: [],
                    },
                    ...p.customLists,
                  ],
                }));
                notify(`Created custom list "${name}"`);
              }}
              onDeleteList={(listId) => {
                mutateActiveProfile((p) => ({
                  ...p,
                  customLists: p.customLists.filter((l) => l.id !== listId),
                }));
                notify('Deleted custom list');
              }}
              onClearHistory={() => {
                mutateActiveProfile((p) => ({ ...p, watchHistory: [] }));
                notify('Cleared watch history');
              }}
              onShare={handleShare}
            />
          )}

          {route === 'settings' && (
            <SettingsPage
              account={account}
              profile={activeProfile}
              settings={settings}
              onUpdateSettings={(partial) =>
                setSettings((prev) => ({ ...prev, ...partial }))
              }
              onUpdateAccount={(name, email) =>
                setAccount((prev) =>
                  prev ? { ...prev, name, email } : null
                )
              }
              onUpdateProfile={(name, avatarId, isKids) => {
                const av =
                  AVATAR_OPTIONS.find((a) => a.id === avatarId) || AVATAR_OPTIONS[0];
                mutateActiveProfile((p) => ({
                  ...p,
                  name,
                  avatarId: av.id,
                  avatarColor: av.color,
                  avatarEmoji: av.emoji,
                  isKids,
                }));
              }}
              onTogglePreferredProvider={(provId) => {
                mutateActiveProfile((p) => ({
                  ...p,
                  preferredProviders: p.preferredProviders.includes(provId)
                    ? p.preferredProviders.filter((x) => x !== provId)
                    : [...p.preferredProviders, provId],
                }));
              }}
              onExportAllJson={handleExportAllJson}
              onClearWatchHistory={() =>
                mutateActiveProfile((p) => ({ ...p, watchHistory: [] }))
              }
              onClearRatings={() =>
                mutateActiveProfile((p) => ({ ...p, ratings: {}, reviews: [] }))
              }
              onResetAllData={() => {
                try {
                  localStorage.clear();
                } catch {
                  // Ignore
                }
                setProfiles(INITIAL_PROFILES);
                setActiveProfileId(INITIAL_PROFILES[0].id);
                setSettings(DEFAULT_SETTINGS);
                notify('All local data reset to factory defaults.');
              }}
              onSignOut={() => {
                setRoute('auth');
                notify('Signed out of session.');
              }}
              onRerunOnboarding={() => setRoute('onboarding')}
              onNotify={notify}
            />
          )}
        </main>

        {/* Netflix Mobile Bottom Navigation Bar with Center Ribbon Emblem (Matches Screenshots 1, 2, 3, 4) */}
        <nav
          aria-label="Mobile Bottom Navigation"
          className="fixed bottom-3 inset-x-0 z-40 px-4 flex justify-center pointer-events-none"
        >
          <div className="pointer-events-auto w-full max-w-md rounded-2xl bg-[#121216]/95 backdrop-blur-2xl border border-white/15 px-3 py-2 shadow-[0_12px_40px_rgba(0,0,0,0.9)] flex items-center justify-around">
            <button
              type="button"
              onClick={() => {
                setCategoryTab('all');
                setRoute('home');
              }}
              className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl text-[10px] font-bold transition-colors ${
                route === 'home' && categoryTab === 'all'
                  ? 'text-white'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Home className="w-4 h-4" />
              <span>Home</span>
            </button>

            <button
              type="button"
              onClick={() => setRoute('discover')}
              className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl text-[10px] font-bold transition-colors ${
                route === 'discover' ? 'text-[#F5C518]' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Compass className="w-4 h-4" />
              <span>Discover</span>
            </button>

            {/* Center Netflix-style Ribbon Emblem (Triggers AI Concierge or Home Top 10) */}
            <button
              type="button"
              onClick={() => setAiConciergeOpen(true)}
              aria-label="Open Anora AI Concierge"
              className="w-11 h-11 -mt-4 rounded-2xl bg-gradient-to-br from-[#E50914] via-[#E50914] to-[#F5C518] flex items-center justify-center text-white font-black text-xl shadow-[0_6px_20px_rgba(229,9,20,0.6)] border-2 border-[#0A0A0B] hover:scale-105 transition-transform"
            >
              A
            </button>

            <button
              type="button"
              onClick={() => setRoute('search')}
              className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl text-[10px] font-bold transition-colors ${
                route === 'search' ? 'text-[#F5C518]' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Search className="w-4 h-4" />
              <span>Search</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setMyAnoraSection('hub');
                setRoute('my-anora');
              }}
              className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl text-[10px] font-bold transition-colors ${
                route === 'my-anora' || route === 'watchlist'
                  ? 'text-[#F5C518]'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <span className="text-sm leading-none">{activeProfile.avatarEmoji}</span>
              <span>My Anora</span>
            </button>
          </div>
        </nav>

        {/* Global Modals */}
        <TrailerModal media={trailerMedia} onClose={() => setTrailerMedia(null)} />

        <RatingReviewModal
          media={ratingModalMedia}
          initialRating={
            ratingModalMedia
              ? activeProfile.ratings[
                  `${ratingModalMedia.media_type}-${ratingModalMedia.id}`
                ]?.rating || 9
              : 9
          }
          initialThumb={
            ratingModalMedia
              ? activeProfile.ratings[
                  `${ratingModalMedia.media_type}-${ratingModalMedia.id}`
                ]?.thumb || 'love'
              : 'love'
          }
          onSaveRating={(r, th) => {
            if (ratingModalMedia) handleSaveRating(ratingModalMedia, r, th);
          }}
          onSaveReview={(r, th, head, body, spoiler, epTag) => {
            if (ratingModalMedia) {
              handleSaveReview(ratingModalMedia, r, th, head, body, spoiler, epTag);
            }
          }}
          onClose={() => setRatingModalMedia(null)}
        />

        <ListPickerModal
          media={listModalMedia}
          lists={activeProfile.customLists}
          onToggleMediaInList={(listId, media) => {
            mutateActiveProfile((p) => ({
              ...p,
              customLists: p.customLists.map((l) => {
                if (l.id !== listId) return l;
                const exists = l.items.some(
                  (i) => i.mediaId === media.id && i.mediaType === media.media_type
                );
                return {
                  ...l,
                  items: exists
                    ? l.items.filter(
                        (i) =>
                          !(i.mediaId === media.id && i.mediaType === media.media_type)
                      )
                    : [
                        ...l.items,
                        {
                          mediaId: media.id,
                          mediaType: media.media_type,
                          title: media.title,
                          poster_path: media.poster_path,
                          year: media.year,
                          vote_average: media.vote_average,
                        },
                      ],
                };
              }),
            }));
            notify(`Updated custom list for "${media.title}"`);
          }}
          onCreateList={(name, description) => {
            mutateActiveProfile((p) => ({
              ...p,
              customLists: [
                {
                  id: `list_${Date.now()}`,
                  name,
                  description,
                  isPublic: true,
                  createdAt: new Date().toISOString(),
                  items: listModalMedia
                    ? [
                        {
                          mediaId: listModalMedia.id,
                          mediaType: listModalMedia.media_type,
                          title: listModalMedia.title,
                          poster_path: listModalMedia.poster_path,
                          year: listModalMedia.year,
                          vote_average: listModalMedia.vote_average,
                        },
                      ]
                    : [],
                },
                ...p.customLists,
              ],
            }));
            notify(`Created list "${name}"`);
          }}
          onClose={() => setListModalMedia(null)}
        />

        <CategoriesDrawerModal
          open={categoriesOpen}
          genres={GENRES}
          providers={STREAMING_PROVIDERS}
          selectedGenreId={selectedGenreId}
          selectedProviderId={selectedProviderId}
          onSelectGenre={(id) => {
            setSelectedGenreId(id);
            setRoute('home');
          }}
          onSelectProvider={(id) => {
            setSelectedProviderId(id);
            setRoute('home');
          }}
          onClose={() => setCategoriesOpen(false)}
        />

        <AiConciergeModal
          open={aiConciergeOpen}
          catalog={catalog}
          favoriteGenres={['Sci-Fi', 'Crime & Espionage', 'Prestige Drama']}
          hasLlmKey={Boolean(settings.llmApiKey.trim())}
          llmProvider={settings.llmProvider}
          onSelectMedia={handleSelectMedia}
          onClose={() => setAiConciergeOpen(false)}
        />

        {/* Toast Notification Banner */}
        {toastMessage && (
          <div
            role="status"
            className="fixed top-16 right-4 z-50 px-4 py-2.5 rounded-xl bg-[#141416] border border-[#F5C518] text-xs font-bold text-white shadow-2xl flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-[#F5C518]" />
            <span>{toastMessage}</span>
          </div>
        )}
      </div>
    </div>
  );
}
