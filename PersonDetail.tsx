import React, { useState } from 'react';
import { ChevronLeft, Star, Calendar, MapPin, Award } from 'lucide-react';
import { ImageQuality, MediaItem, PersonDetail } from '../types/tmdb';
import { getTmdbImageUrl } from '../lib/tmdb';

interface PersonDetailPageProps {
  person: PersonDetail;
  catalog: MediaItem[];
  imageQuality: ImageQuality;
  onBack: () => void;
  onSelectMedia: (item: MediaItem) => void;
}

export const PersonDetailPage: React.FC<PersonDetailPageProps> = ({
  person,
  catalog,
  imageQuality,
  onBack,
  onSelectMedia,
}) => {
  const [deptFilter, setDeptFilter] = useState<'All' | 'Acting' | 'Directing' | 'Writing'>('All');

  const filteredCredits = person.credits
    .filter((c) => deptFilter === 'All' || c.department === deptFilter)
    .sort((a, b) => b.year - a.year);

  const handleOpenCredit = (creditId: number, title: string) => {
    const found =
      catalog.find((m) => m.id === creditId) ||
      catalog.find((m) => m.title.toLowerCase() === title.toLowerCase()) ||
      catalog[0];
    if (found) onSelectMedia(found);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 pb-24 space-y-6">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#141416] hover:bg-white/10 text-white text-xs font-bold border border-white/15"
      >
        <ChevronLeft className="w-4 h-4" />
        <span>Back</span>
      </button>

      <div className="flex flex-col sm:flex-row gap-6 p-5 sm:p-6 rounded-2xl bg-[#141416] border border-white/10">
        <img
          src={getTmdbImageUrl(person.profile_path, imageQuality, person.name)}
          alt={person.name}
          className="w-32 h-40 sm:w-44 sm:h-56 rounded-2xl object-cover border border-white/15 shrink-0"
        />
        <div className="space-y-3">
          <span className="px-2.5 py-0.5 rounded bg-[#F5C518] text-black text-[10px] font-black uppercase">
            Known For • {person.known_for_department}
          </span>
          <h1 className="text-2xl sm:text-4xl font-black text-white">{person.name}</h1>
          <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-400">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-[#F5C518]" /> Born {person.birthday}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-[#F5C518]" /> {person.place_of_birth}
            </span>
            <span className="flex items-center gap-1">
              <Award className="w-3.5 h-3.5 text-[#F5C518]" /> {person.credits.length} Credits
            </span>
          </div>
          <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">{person.biography}</p>
        </div>
      </div>

      {/* Filmography Split by Department */}
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h2 className="text-lg font-black text-white">Complete Filmography</h2>
          <div className="flex items-center gap-1.5">
            {(['All', 'Acting', 'Directing', 'Writing'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setDeptFilter(tab)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold ${
                  deptFilter === tab
                    ? 'bg-[#F5C518] text-black'
                    : 'bg-[#141416] text-zinc-300 hover:text-white border border-white/10'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
          {filteredCredits.map((cred, idx) => (
            <button
              key={`${cred.id}-${cred.department}-${idx}`}
              type="button"
              onClick={() => handleOpenCredit(cred.id, cred.title)}
              className="group rounded-2xl overflow-hidden bg-[#141416] border border-white/10 hover:border-[#F5C518] text-left transition-all"
            >
              <div className="aspect-[2/3] relative overflow-hidden">
                <img
                  src={getTmdbImageUrl(cred.poster_path, imageQuality, cred.title)}
                  alt={cred.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
                <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-black/80 text-[#F5C518] text-[10px] font-bold flex items-center gap-0.5">
                  <Star className="w-2.5 h-2.5 fill-[#F5C518]" /> {cred.vote_average.toFixed(1)}
                </div>
              </div>
              <div className="p-3">
                <div className="text-[10px] font-bold text-[#F5C518] uppercase">
                  {cred.year} • {cred.department}
                </div>
                <div className="text-xs font-extrabold text-white truncate mt-0.5">{cred.title}</div>
                <div className="text-[11px] text-zinc-400 truncate">as {cred.role}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
