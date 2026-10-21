import React, { useState } from 'react';
import {
  Plus,
  Check,
  Shield,
  Sparkles,
  LogIn,
  UserPlus,
  Users,
  Globe,
  Tv,
  Film,
} from 'lucide-react';
import {
  AccountUser,
  MediaItem,
  ProfileData,
} from '../types/tmdb';
import {
  AVATAR_OPTIONS,
  REGIONS,
  STREAMING_PROVIDERS,
} from '../lib/seedData';
import { getTmdbImageUrl } from '../lib/tmdb';
import { hashPasswordClientSide } from '../lib/store';

// 1. Sign In / Sign Up Screen
interface AuthScreenProps {
  onSuccess: (user: AccountUser, isNewSignup: boolean, chosenAvatarId: string) => void;
  onGuestMode: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onSuccess, onGuestMode }) => {
  const [mode, setMode] = useState<'signin' | 'signup'>('signup');
  const [name, setName] = useState('Arin Vance');
  const [email, setEmail] = useState('arin@anora.cinema');
  const [password, setPassword] = useState('anora2025');
  const [selectedAvatar, setSelectedAvatar] = useState(AVATAR_OPTIONS[0].id);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Please enter your email and password.');
      return;
    }
    if (mode === 'signup' && !name.trim()) {
      setError('Please enter your display name.');
      return;
    }
    const user: AccountUser = {
      id: `usr_${Date.now()}`,
      name: mode === 'signup' ? name.trim() : email.split('@')[0] || 'Cinema Fan',
      email: email.trim(),
      passwordHash: hashPasswordClientSide(password),
      createdAt: new Date().toISOString(),
    };
    onSuccess(user, mode === 'signup', selectedAvatar);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white flex flex-col justify-center items-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(245,197,24,0.14),transparent_50%),radial-gradient(circle_at_bottom_left,rgba(229,9,20,0.14),transparent_50%)] pointer-events-none" />

      <div className="w-full max-w-md rounded-2xl bg-[#141416]/95 border border-white/15 p-6 sm:p-8 shadow-2xl relative z-10 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#F5C518] to-amber-600 flex items-center justify-center text-black font-black text-xl shadow">
              A
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-white">ANORA</span>
              <span className="block text-[10px] text-[#F5C518] font-bold uppercase tracking-widest">
                Netflix × JustWatch × IMDb
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onGuestMode}
            className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-xs font-bold text-zinc-200 border border-white/10"
          >
            Guest Mode →
          </button>
        </div>

        <div className="flex rounded-xl bg-black/60 p-1 border border-white/10">
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setError('');
            }}
            className={`flex-1 py-2 rounded-lg text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all ${
              mode === 'signup' ? 'bg-[#F5C518] text-black shadow' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Sign Up</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signin');
              setError('');
            }}
            className={`flex-1 py-2 rounded-lg text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all ${
              mode === 'signin' ? 'bg-[#F5C518] text-black shadow' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/40 text-xs text-red-300 font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-bold text-zinc-300 mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your Name"
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/15 text-sm text-white focus:border-[#F5C518] focus:outline-none"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-zinc-300 mb-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/15 text-sm text-white focus:border-[#F5C518] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-300 mb-1">
              Password (Hashed Client-Side)
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/15 text-sm text-white focus:border-[#F5C518] focus:outline-none"
            />
          </div>

          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-bold text-zinc-300 mb-2">Choose Your Avatar</label>
              <div className="grid grid-cols-6 gap-2">
                {AVATAR_OPTIONS.map((av) => (
                  <button
                    key={av.id}
                    type="button"
                    onClick={() => setSelectedAvatar(av.id)}
                    className={`aspect-square rounded-xl bg-gradient-to-br ${av.color} flex items-center justify-center text-lg border-2 transition-transform ${
                      selectedAvatar === av.id
                        ? 'border-[#F5C518] scale-110 shadow-lg'
                        : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    {av.emoji}
                  </button>
                ))}
              </div>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-[#E50914] hover:bg-red-700 text-white font-black text-sm shadow-lg transition-transform active:scale-98"
          >
            {mode === 'signup' ? 'Create Account & Start Onboarding' : 'Sign In to Anora'}
          </button>
        </form>
      </div>
    </div>
  );
};

// 2. "Who's Watching?" Netflix Profile Gate
interface ProfileGateProps {
  profiles: ProfileData[];
  onSelectProfile: (profileId: string) => void;
  onAddProfile: (name: string, avatarId: string, isKids: boolean) => void;
  onGuestMode: () => void;
}

export const ProfileGate: React.FC<ProfileGateProps> = ({
  profiles,
  onSelectProfile,
  onAddProfile,
  onGuestMode,
}) => {
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newAvatarId, setNewAvatarId] = useState(AVATAR_OPTIONS[1].id);
  const [newKids, setNewKids] = useState(false);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    onAddProfile(newName.trim(), newAvatarId, newKids);
    setNewName('');
    setAdding(false);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white flex flex-col items-center justify-center p-6">
      <div className="max-w-2xl w-full text-center space-y-8">
        <div>
          <span className="px-3 py-1 rounded-full bg-[#F5C518]/15 text-[#F5C518] text-xs font-extrabold uppercase tracking-widest">
            Anora Cinema Profiles
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-white mt-3 tracking-tight">
            Who’s watching?
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Each profile maintains its own Watchlist, IMDb Star Ratings, Reviews, and AI Taste Graph.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8">
          {profiles.map((prof) => (
            <button
              key={prof.id}
              type="button"
              onClick={() => onSelectProfile(prof.id)}
              className="group flex flex-col items-center gap-2.5 focus:outline-none"
            >
              <div
                className={`relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-br ${prof.avatarColor} flex items-center justify-center text-4xl sm:text-5xl shadow-xl border-2 border-transparent group-hover:border-[#F5C518] group-hover:scale-105 transition-all`}
              >
                <span>{prof.avatarEmoji}</span>
                {prof.isKids && (
                  <span className="absolute -bottom-2 px-2 py-0.5 rounded-full bg-emerald-500 text-black text-[10px] font-black uppercase shadow">
                    KIDS
                  </span>
                )}
              </div>
              <span className="text-sm sm:text-base font-bold text-zinc-300 group-hover:text-white">
                {prof.name}
              </span>
            </button>
          ))}

          {profiles.length < 5 && (
            <button
              type="button"
              onClick={() => setAdding(true)}
              className="group flex flex-col items-center gap-2.5"
            >
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-[#141416] border-2 border-dashed border-white/20 group-hover:border-[#F5C518] flex items-center justify-center text-zinc-400 group-hover:text-[#F5C518] transition-all">
                <Plus className="w-10 h-10" />
              </div>
              <span className="text-sm sm:text-base font-bold text-zinc-400 group-hover:text-white">
                Add Profile
              </span>
            </button>
          )}
        </div>

        <div className="pt-4">
          <button
            type="button"
            onClick={onGuestMode}
            className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-xs font-bold text-zinc-300"
          >
            Continue as Guest Viewer
          </button>
        </div>

        {adding && (
          <form
            onSubmit={handleCreate}
            className="max-w-md mx-auto p-5 rounded-2xl bg-[#141416] border border-white/15 text-left space-y-4 shadow-2xl"
          >
            <h3 className="text-base font-black text-white">Create New Profile</h3>
            <div>
              <label className="block text-xs font-bold text-zinc-300 mb-1">Profile Name</label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. Riya, Family, Late Night"
                className="w-full px-3.5 py-2 rounded-xl bg-black/60 border border-white/15 text-sm text-white focus:border-[#F5C518] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-300 mb-1.5">Choose Avatar</label>
              <div className="grid grid-cols-6 gap-2">
                {AVATAR_OPTIONS.map((av) => (
                  <button
                    key={av.id}
                    type="button"
                    onClick={() => setNewAvatarId(av.id)}
                    className={`aspect-square rounded-xl bg-gradient-to-br ${av.color} flex items-center justify-center text-lg border-2 ${
                      newAvatarId === av.id ? 'border-[#F5C518] scale-105' : 'border-transparent opacity-60'
                    }`}
                  >
                    {av.emoji}
                  </button>
                ))}
              </div>
            </div>

            <label className="flex items-center gap-2 text-xs font-semibold text-zinc-300 cursor-pointer">
              <input
                type="checkbox"
                checked={newKids}
                onChange={(e) => setNewKids(e.target.checked)}
                className="rounded border-white/20 bg-black text-[#F5C518]"
              />
              <Shield className="w-4 h-4 text-emerald-400" />
              <span>Kids Mode (Only family-safe U / UA 7+ titles)</span>
            </label>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setAdding(false)}
                className="px-4 py-2 rounded-xl bg-white/10 text-xs font-bold text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-[#F5C518] text-black font-black text-xs"
              >
                Save Profile
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

// 3. 3-Step Onboarding Wizard (5+ Favorites, Streaming Services, Region)
interface OnboardingWizardProps {
  catalog: MediaItem[];
  initialFavorites: number[];
  initialProviders: number[];
  initialRegion: string;
  onComplete: (favorites: number[], providers: number[], region: string) => void;
}

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({
  catalog,
  initialFavorites,
  initialProviders,
  initialRegion,
  onComplete,
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [favorites, setFavorites] = useState<number[]>(initialFavorites);
  const [providers, setProviders] = useState<number[]>(
    initialProviders.length > 0 ? initialProviders : [8, 119, 337]
  );
  const [region, setRegion] = useState<string>(initialRegion || 'IN');

  const toggleFav = (id: number) => {
    setFavorites((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const toggleProvider = (id: number) => {
    setProviders((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white flex flex-col items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-4xl rounded-2xl bg-[#141416] border border-white/15 p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-wider text-[#F5C518]">
              Step {step} of 3 • Personalize Anora
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white mt-0.5">
              {step === 1 && 'Pick 5+ Favorite Movies & Series to Seed Your AI Taste Graph'}
              {step === 2 && 'Select Your Preferred Streaming Services (JustWatch Filter)'}
              {step === 3 && 'Choose Your Streaming Availability Region'}
            </h2>
          </div>
          <span className="px-3 py-1 rounded-full bg-white/10 text-xs font-bold text-zinc-200">
            {step === 1 ? `${favorites.length}/5 selected` : step === 2 ? `${providers.length} services` : region}
          </span>
        </div>

        {step === 1 && (
          <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-7 gap-3 max-h-[52vh] overflow-y-auto pr-1">
            {catalog.map((item) => {
              const selected = favorites.includes(item.id);
              return (
                <button
                  key={`${item.media_type}-${item.id}`}
                  type="button"
                  onClick={() => toggleFav(item.id)}
                  className={`relative aspect-[2/3] rounded-xl overflow-hidden border-2 text-left transition-all ${
                    selected ? 'border-[#F5C518] scale-[1.03]' : 'border-white/10 opacity-75 hover:opacity-100'
                  }`}
                >
                  <img
                    src={getTmdbImageUrl(item.poster_path, 'w500', item.title)}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />
                  {selected && (
                    <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-[#F5C518] text-black flex items-center justify-center shadow">
                      <Check className="w-4 h-4 stroke-[3]" />
                    </div>
                  )}
                  <div className="absolute bottom-2 inset-x-2 text-[11px] font-bold text-white line-clamp-2">
                    {item.title}
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {step === 2 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {STREAMING_PROVIDERS.map((p) => {
              const active = providers.includes(p.provider_id);
              return (
                <button
                  key={p.provider_id}
                  type="button"
                  onClick={() => toggleProvider(p.provider_id)}
                  className={`p-4 rounded-2xl border flex flex-col items-center gap-2.5 transition-all ${
                    active
                      ? 'bg-[#F5C518]/15 border-[#F5C518] text-white'
                      : 'bg-black/40 border-white/10 text-zinc-400 hover:border-white/30'
                  }`}
                >
                  <div
                    style={{ backgroundColor: p.color, color: p.textColor || '#FFF' }}
                    className="w-12 h-12 rounded-xl flex items-center justify-center font-black text-sm shadow-lg"
                  >
                    {p.short_name}
                  </div>
                  <span className="text-xs font-bold text-center">{p.provider_name}</span>
                  {active && <span className="text-[10px] font-extrabold text-[#F5C518]">✓ Selected</span>}
                </button>
              );
            })}
          </div>
        )}

        {step === 3 && (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {REGIONS.map((r) => (
              <button
                key={r.code}
                type="button"
                onClick={() => setRegion(r.code)}
                className={`p-4 rounded-2xl border flex items-center gap-3 transition-all ${
                  region === r.code
                    ? 'bg-[#F5C518] text-black border-[#F5C518] font-black'
                    : 'bg-black/40 text-zinc-200 border-white/10 hover:border-white/30 font-semibold'
                }`}
              >
                <span className="text-2xl">{r.flag}</span>
                <div className="text-left">
                  <div className="text-xs">{r.name}</div>
                  <div className="text-[10px] opacity-75">{r.code}</div>
                </div>
              </button>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t border-white/10">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep((s) => (s === 3 ? 2 : 1))}
              className="px-4 py-2.5 rounded-xl bg-white/10 text-xs font-bold text-white"
            >
              ← Back
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onComplete([1001, 1002, 1004, 1005, 1013], providers, region)}
              className="text-xs text-zinc-400 hover:text-white underline"
            >
              Skip with recommended defaults
            </button>
          )}

          {step < 3 ? (
            <button
              type="button"
              onClick={() => setStep((s) => (s === 1 ? 2 : 3))}
              className="px-6 py-2.5 rounded-xl bg-[#F5C518] hover:bg-amber-400 text-black font-black text-xs"
            >
              Continue ({step === 1 && favorites.length < 5 ? `${favorites.length}/5 picked` : 'Next'}) →
            </button>
          ) : (
            <button
              type="button"
              onClick={() =>
                onComplete(
                  favorites.length >= 1 ? favorites : [1001, 1002, 1004, 1005, 1013],
                  providers,
                  region
                )
              }
              className="px-6 py-2.5 rounded-xl bg-[#E50914] hover:bg-red-700 text-white font-black text-xs shadow-lg"
            >
              Launch Anora Experience →
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
