import React, { useState } from 'react';
import {
  Key,
  User,
  Globe,
  Monitor,
  Sparkles,
  Database,
  Info,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Download,
  Trash2,
  RefreshCw,
  LogOut,
  Smartphone,
} from 'lucide-react';
import {
  AccountUser,
  AppSettings,
  ProfileData,
} from '../types/tmdb';
import {
  AVATAR_OPTIONS,
  REGIONS,
  STREAMING_PROVIDERS,
} from '../lib/seedData';
import {
  clearTmdbCache,
  getTmdbCacheStats,
  validateTmdbApiKey,
} from '../lib/tmdb';

interface SettingsPageProps {
  account: AccountUser | null;
  profile: ProfileData;
  settings: AppSettings;
  onUpdateSettings: (partial: Partial<AppSettings>) => void;
  onUpdateAccount: (name: string, email: string) => void;
  onUpdateProfile: (name: string, avatarId: string, isKids: boolean) => void;
  onTogglePreferredProvider: (providerId: number) => void;
  onExportAllJson: () => void;
  onClearWatchHistory: () => void;
  onClearRatings: () => void;
  onResetAllData: () => void;
  onSignOut: () => void;
  onRerunOnboarding: () => void;
  onNotify: (msg: string) => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  account,
  profile,
  settings,
  onUpdateSettings,
  onUpdateAccount,
  onUpdateProfile,
  onTogglePreferredProvider,
  onExportAllJson,
  onClearWatchHistory,
  onClearRatings,
  onResetAllData,
  onSignOut,
  onRerunOnboarding,
  onNotify,
}) => {
  const [apiKeyInput, setApiKeyInput] = useState(settings.tmdbApiKey);
  const [testingKey, setTestingKey] = useState(false);
  const [validationMsg, setValidationMsg] = useState<string>(
    settings.tmdbKeyStatus === 'valid'
      ? '✅ Connected to TMDB API (/configuration verified)'
      : settings.tmdbKeyStatus === 'invalid'
      ? '❌ Invalid TMDB API key — using Seed Demo Catalog'
      : 'No key configured — Seed Demo Mode active'
  );

  const [accName, setAccName] = useState(account?.name || profile.name);
  const [accEmail, setAccEmail] = useState(account?.email || 'arin@anora.cinema');
  const [profName, setProfName] = useState(profile.name);
  const [profAvatar, setProfAvatar] = useState(profile.avatarId);
  const [profKids, setProfKids] = useState(profile.isKids);
  const [confirmResetModal, setConfirmResetModal] = useState(false);

  const cacheStats = getTmdbCacheStats();

  const handleValidateAndSaveKey = async () => {
    setTestingKey(true);
    const result = await validateTmdbApiKey(apiKeyInput);
    setTestingKey(false);
    if (result.valid) {
      onUpdateSettings({
        tmdbApiKey: apiKeyInput.trim(),
        tmdbKeyStatus: 'valid',
        tmdbKeyLastChecked: new Date().toISOString(),
      });
      setValidationMsg(`✅ Connected (${result.message})`);
      onNotify('TMDB API Key validated and saved!');
    } else {
      onUpdateSettings({
        tmdbApiKey: apiKeyInput.trim(),
        tmdbKeyStatus: apiKeyInput.trim() ? 'invalid' : 'untested',
      });
      setValidationMsg(`❌ ${result.message}`);
      onNotify(result.message);
    }
  };

  const handleClearKey = () => {
    setApiKeyInput('');
    onUpdateSettings({ tmdbApiKey: '', tmdbKeyStatus: 'untested' });
    setValidationMsg('API key cleared — running in Seed Demo Mode.');
    onNotify('Cleared TMDB API key.');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 pb-28 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <span className="text-xs font-extrabold uppercase tracking-wider text-[#F5C518]">
            Control Center
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            Settings & TMDB Configuration
          </h1>
        </div>
        <button
          type="button"
          onClick={onSignOut}
          className="px-4 py-2 rounded-xl bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-xs font-bold text-red-300 flex items-center gap-1.5"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>

      {/* SECTION 2 (Highlighted First for Immediate Access): TMDB API Key Integration */}
      <section className="p-5 sm:p-6 rounded-2xl bg-[#141416] border-2 border-[#F5C518]/50 shadow-xl space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#F5C518] text-black flex items-center justify-center font-black">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white">
                TMDB API Key (v3 Key or v4 Bearer Token)
              </h2>
              <p className="text-xs text-zinc-400">
                Auto-detects 32-char v3 API keys and v4 JWT Read Access Tokens. Stored strictly in your browser’s localStorage.
              </p>
            </div>
          </div>

          <a
            href="https://www.themoviedb.org/settings/api"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-bold text-[#F5C518] flex items-center gap-1 shrink-0"
          >
            <span>Get TMDB Key</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        <div className="flex flex-col sm:flex-row gap-2.5">
          <input
            type="password"
            value={apiKeyInput}
            onChange={(e) => setApiKeyInput(e.target.value)}
            placeholder="Paste your TMDB v3 API Key or v4 Read Access Bearer Token..."
            className="flex-1 px-4 py-2.5 rounded-xl bg-black border border-white/20 text-xs sm:text-sm text-white focus:border-[#F5C518] focus:outline-none font-mono"
          />
          <button
            type="button"
            disabled={testingKey}
            onClick={handleValidateAndSaveKey}
            className="px-5 py-2.5 rounded-xl bg-[#F5C518] hover:bg-amber-400 text-black font-black text-xs flex items-center justify-center gap-1.5 shrink-0"
          >
            {testingKey ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
            <span>Validate & Save</span>
          </button>
          <button
            type="button"
            onClick={handleClearKey}
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-bold text-zinc-200 shrink-0"
          >
            Clear Key
          </button>
        </div>

        <div
          className={`p-3 rounded-xl border text-xs font-bold flex items-center gap-2 ${
            settings.tmdbKeyStatus === 'valid'
              ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
              : settings.tmdbKeyStatus === 'invalid'
              ? 'bg-red-500/15 border-red-500/40 text-red-300'
              : 'bg-white/5 border-white/10 text-zinc-300'
          }`}
        >
          <span>{validationMsg}</span>
        </div>
      </section>

      {/* SECTION 1: Account & Active Profile */}
      <section className="p-5 sm:p-6 rounded-2xl bg-[#141416] border border-white/10 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-black text-white flex items-center gap-2">
            <User className="w-4 h-4 text-[#F5C518]" />
            <span>1. Account & Profile Settings</span>
          </h2>
          <button
            type="button"
            onClick={onRerunOnboarding}
            className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-bold text-[#F5C518]"
          >
            Re-run Taste Onboarding
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-zinc-400 mb-1">Account Holder Name</label>
            <input
              type="text"
              value={accName}
              onChange={(e) => setAccName(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-black border border-white/15 text-xs text-white"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-zinc-400 mb-1">Account Email</label>
            <input
              type="email"
              value={accEmail}
              onChange={(e) => setAccEmail(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-black border border-white/15 text-xs text-white"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-white/10">
          <div>
            <label className="block text-xs font-bold text-zinc-400 mb-1">Active Profile Name</label>
            <input
              type="text"
              value={profName}
              onChange={(e) => setProfName(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-black border border-white/15 text-xs text-white"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-zinc-400 mb-1">Profile Avatar</label>
            <div className="flex gap-2">
              {AVATAR_OPTIONS.map((av) => (
                <button
                  key={av.id}
                  type="button"
                  onClick={() => setProfAvatar(av.id)}
                  className={`w-9 h-9 rounded-xl bg-gradient-to-br ${av.color} flex items-center justify-center border-2 ${
                    profAvatar === av.id ? 'border-[#F5C518]' : 'border-transparent opacity-60'
                  }`}
                >
                  {av.emoji}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <label className="flex items-center gap-2 text-xs font-bold text-zinc-300 cursor-pointer">
            <input
              type="checkbox"
              checked={profKids}
              onChange={(e) => setProfKids(e.target.checked)}
              className="rounded border-white/20 bg-black text-[#F5C518]"
            />
            <span>Kids Mode Profile (Filters out 18+ titles)</span>
          </label>
          <button
            type="button"
            onClick={() => {
              onUpdateAccount(accName, accEmail);
              onUpdateProfile(profName, profAvatar, profKids);
              onNotify('Account & Profile changes saved!');
            }}
            className="px-4 py-2 rounded-xl bg-[#F5C518] text-black text-xs font-black"
          >
            Save Account & Profile
          </button>
        </div>
      </section>

      {/* SECTION 3: Preferences (Region, Language, Streaming Services) */}
      <section className="p-5 sm:p-6 rounded-2xl bg-[#141416] border border-white/10 space-y-4">
        <h2 className="text-base font-black text-white flex items-center gap-2">
          <Globe className="w-4 h-4 text-[#F5C518]" />
          <span>3. Regional Availability & Streaming Services (JustWatch)</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-bold text-zinc-400 mb-1">
              Watch Region (/watch/providers)
            </label>
            <select
              value={settings.region}
              onChange={(e) => onUpdateSettings({ region: e.target.value })}
              aria-label="Preferred Region"
              className="w-full px-3 py-2 rounded-xl bg-black border border-white/15 text-xs font-bold text-white"
            >
              {REGIONS.map((r) => (
                <option key={r.code} value={r.code}>
                  {r.flag} {r.name} ({r.code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-400 mb-1">Metadata Language</label>
            <select
              value={settings.language}
              onChange={(e) => onUpdateSettings({ language: e.target.value })}
              aria-label="Metadata Language"
              className="w-full px-3 py-2 rounded-xl bg-black border border-white/15 text-xs font-bold text-white"
            >
              <option value="en-US">English (en-US)</option>
              <option value="hi-IN">Hindi (hi-IN)</option>
              <option value="bn-BD">Bengali (bn-BD)</option>
              <option value="ja-JP">Japanese (ja-JP)</option>
              <option value="ko-KR">Korean (ko-KR)</option>
            </select>
          </div>

          <div className="flex items-end">
            <label className="flex items-center gap-2 text-xs font-bold text-zinc-300 cursor-pointer pb-2">
              <input
                type="checkbox"
                checked={settings.includeAdult}
                onChange={(e) => onUpdateSettings({ includeAdult: e.target.checked })}
                className="rounded border-white/20 bg-black text-[#F5C518]"
              />
              <span>Include 18+ Mature Content</span>
            </label>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-zinc-400 mb-2">
            Your Subscribed Streaming Services
          </label>
          <div className="flex flex-wrap gap-2">
            {STREAMING_PROVIDERS.map((p) => {
              const active = profile.preferredProviders.includes(p.provider_id);
              return (
                <button
                  key={p.provider_id}
                  type="button"
                  onClick={() => onTogglePreferredProvider(p.provider_id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1.5 ${
                    active
                      ? 'bg-[#F5C518]/20 text-[#F5C518] border-[#F5C518]'
                      : 'bg-black/50 text-zinc-400 border-white/10'
                  }`}
                >
                  <span>{p.provider_name}</span>
                  {active && <span>✓</span>}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* SECTION 4: Playback, Display & Mobile UI Frame Preview */}
      <section className="p-5 sm:p-6 rounded-2xl bg-[#141416] border border-white/10 space-y-4">
        <h2 className="text-base font-black text-white flex items-center gap-2">
          <Monitor className="w-4 h-4 text-[#F5C518]" />
          <span>4. Playback, Display & Theme</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-bold text-zinc-400 mb-1">TMDB Image Quality</label>
            <select
              value={settings.imageQuality}
              onChange={(e) => onUpdateSettings({ imageQuality: e.target.value as any })}
              aria-label="Image Quality"
              className="w-full px-3 py-2 rounded-xl bg-black border border-white/15 text-xs font-bold text-white"
            >
              <option value="w500">Data Saver (w500)</option>
              <option value="w780">HD Balanced (w780)</option>
              <option value="original">4K Ultra HD (original)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-400 mb-1">Cinema Theme</label>
            <select
              value={settings.theme}
              onChange={(e) => onUpdateSettings({ theme: e.target.value as any })}
              aria-label="Theme Mode"
              className="w-full px-3 py-2 rounded-xl bg-black border border-white/15 text-xs font-bold text-white"
            >
              <option value="dark">Cinematic Dark (#0A0A0B)</option>
              <option value="amoled">AMOLED Pitch Black (#000000)</option>
              <option value="system">System Default</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-400 mb-1">Viewport Layout Mode</label>
            <select
              value={settings.layoutPreview}
              onChange={(e) => onUpdateSettings({ layoutPreview: e.target.value as any })}
              aria-label="Viewport Layout Mode"
              className="w-full px-3 py-2 rounded-xl bg-black border border-white/15 text-xs font-bold text-white"
            >
              <option value="auto">Auto Responsive</option>
              <option value="mobile">Netflix Mobile App Frame</option>
              <option value="desktop">Desktop Widescreen</option>
            </select>
          </div>
        </div>

        <div className="flex flex-wrap gap-6 pt-1">
          <label className="flex items-center gap-2 text-xs font-bold text-zinc-300 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.autoplayTrailers}
              onChange={(e) => onUpdateSettings({ autoplayTrailers: e.target.checked })}
              className="rounded border-white/20 bg-black text-[#F5C518]"
            />
            <span>Autoplay Hero Previews</span>
          </label>
          <label className="flex items-center gap-2 text-xs font-bold text-zinc-300 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.reduceMotion}
              onChange={(e) => onUpdateSettings({ reduceMotion: e.target.checked })}
              className="rounded border-white/20 bg-black text-[#F5C518]"
            />
            <span>Reduce Motion (Disable auto-carousel rotation)</span>
          </label>
        </div>
      </section>

      {/* SECTION 5: AI Recommendations & Optional LLM Key */}
      <section className="p-5 sm:p-6 rounded-2xl bg-[#141416] border border-white/10 space-y-4">
        <h2 className="text-base font-black text-white flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#F5C518]" />
          <span>5. AI Taste Engine & Natural-Language Concierge</span>
        </h2>

        <label className="flex items-center gap-2 text-xs font-bold text-zinc-300 cursor-pointer">
          <input
            type="checkbox"
            checked={settings.enableAiRecommendations}
            onChange={(e) =>
              onUpdateSettings({ enableAiRecommendations: e.target.checked })
            }
            className="rounded border-white/20 bg-black text-[#F5C518]"
          />
          <span>Enable Personalized AI Match % & “Picked for You” Row</span>
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-bold text-zinc-400 mb-1">Optional LLM Provider</label>
            <select
              value={settings.llmProvider}
              onChange={(e) => onUpdateSettings({ llmProvider: e.target.value as any })}
              aria-label="LLM Provider"
              className="w-full px-3 py-2 rounded-xl bg-black border border-white/15 text-xs font-bold text-white"
            >
              <option value="gemini">Google Gemini API</option>
              <option value="openai">OpenAI API</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-zinc-400 mb-1">
              Optional LLM API Key (For “What Should I Watch?” Concierge)
            </label>
            <input
              type="password"
              value={settings.llmApiKey}
              onChange={(e) => onUpdateSettings({ llmApiKey: e.target.value })}
              placeholder="Optional: Paste Gemini or OpenAI key (local fallback works without key)"
              className="w-full px-3.5 py-2 rounded-xl bg-black border border-white/15 text-xs text-white"
            />
          </div>
        </div>
      </section>

      {/* SECTION 6: Data & Privacy */}
      <section className="p-5 sm:p-6 rounded-2xl bg-[#141416] border border-white/10 space-y-4">
        <h2 className="text-base font-black text-white flex items-center gap-2">
          <Database className="w-4 h-4 text-[#F5C518]" />
          <span>6. Data, Cache & Privacy</span>
        </h2>

        <div className="flex flex-wrap gap-2.5">
          <button
            type="button"
            onClick={onExportAllJson}
            className="px-4 py-2 rounded-xl bg-[#F5C518] text-black text-xs font-black flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export All Data (JSON)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              clearTmdbCache();
              onNotify('Cleared TMDB response cache.');
            }}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-bold text-white"
          >
            Clear TMDB Cache ({cacheStats.count} entries • {cacheStats.approxKb} KB)
          </button>

          <button
            type="button"
            onClick={() => {
              onClearWatchHistory();
              onNotify('Watch history cleared.');
            }}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-bold text-white"
          >
            Clear Watch History
          </button>

          <button
            type="button"
            onClick={() => {
              onClearRatings();
              onNotify('All ratings and reviews cleared.');
            }}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-bold text-white"
          >
            Clear Ratings & Reviews
          </button>

          <button
            type="button"
            onClick={() => setConfirmResetModal(true)}
            className="px-4 py-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-xs font-bold text-red-300 flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete All Local Data</span>
          </button>
        </div>

        {confirmResetModal && (
          <div className="p-4 rounded-xl bg-red-950/50 border border-red-500/40 flex items-center justify-between gap-4">
            <span className="text-xs font-bold text-red-200">
              Are you sure? This resets all profiles, lists, ratings, and keys back to factory defaults.
            </span>
            <div className="flex gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setConfirmResetModal(false)}
                className="px-3 py-1.5 rounded-lg bg-white/10 text-xs font-bold text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setConfirmResetModal(false);
                  onResetAllData();
                }}
                className="px-3 py-1.5 rounded-lg bg-[#E50914] text-xs font-black text-white"
              >
                Confirm Reset
              </button>
            </div>
          </div>
        )}
      </section>

      {/* SECTION 7: About & Official TMDB Attribution */}
      <section className="p-5 sm:p-6 rounded-2xl bg-[#141416] border border-white/10 space-y-3">
        <h2 className="text-base font-black text-white flex items-center gap-2">
          <Info className="w-4 h-4 text-[#F5C518]" />
          <span>7. About Anora v2.5.0 & Attribution</span>
        </h2>
        <p className="text-xs text-zinc-300 leading-relaxed">
          Anora unifies the mobile-first discovery UI of Netflix, the regional streaming availability guide of JustWatch, and the deep cast, crew, and rating encyclopedia of IMDb in a zero-backend local web application.
        </p>
        <div className="p-3.5 rounded-xl bg-black/60 border border-cyan-500/30 flex items-center gap-3">
          <span className="px-2.5 py-1 rounded bg-cyan-500 text-black font-black text-xs shrink-0">
            TMDB
          </span>
          <p className="text-xs text-zinc-300 font-semibold">
            This product uses the TMDB API but is not endorsed or certified by TMDB. Streaming availability data powered by JustWatch via TMDB.
          </p>
        </div>
        <div className="text-[11px] text-zinc-400">
          Keyboard Shortcuts: Press <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white">/</kbd> to focus Search, <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white">Esc</kbd> to close modals.
        </div>
      </section>
    </div>
  );
};
