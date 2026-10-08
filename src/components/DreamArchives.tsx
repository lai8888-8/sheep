import React, { useState } from 'react';
import { BookOpen, Search, Heart, Sparkles, Filter, RotateCcw, Clock, Calendar } from 'lucide-react';
import { DreamType, SheepCreature, SleepQuality } from '../types/sheep';

interface DreamArchivesProps {
  sheep: SheepCreature[];
  onSelectSheep: (s: SheepCreature) => void;
  onResetDemo: () => void;
}

export const DreamArchives: React.FC<DreamArchivesProps> = ({
  sheep,
  onSelectSheep,
  onResetDemo,
}) => {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'all' | DreamType>('all');
  const [filterQuality, setFilterQuality] = useState<'all' | SleepQuality>('all');

  // Computed statistics
  const totalCount = sheep.length;
  const avgHours = totalCount > 0 ? (sheep.reduce((acc, s) => acc + s.hours, 0) / totalCount).toFixed(1) : '0';
  const goodDreams = sheep.filter((s) => s.dreamType === 'good').length;
  const badDreams = sheep.filter((s) => s.dreamType === 'bad').length;
  const neutralDreams = sheep.filter((s) => s.dreamType === 'neutral').length;

  const filteredSheep = sheep.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.diary.toLowerCase().includes(search.toLowerCase()) ||
      s.date.includes(search);
    const matchesType = filterType === 'all' || s.dreamType === filterType;
    const matchesQuality = filterQuality === 'all' || s.quality === filterQuality;
    return matchesSearch && matchesType && matchesQuality;
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
        <div>
          <h2 className="text-xl font-bold text-white font-display flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-purple-400" />
            <span>Dream Ledger & Sanctuary Flock Archives</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            The chronological chronicle of all virtual creatures raised through your nocturnal sleep recordings.
          </p>
        </div>

        <button
          onClick={onResetDemo}
          className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white text-xs font-medium flex items-center gap-1.5 transition-colors self-start sm:self-auto"
          title="Reset pasture to demo initial sheep"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Sample Flock</span>
        </button>
      </div>

      {/* Aggregate Biometric Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400 block">Flock Population</span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-white tabular-nums">{totalCount}</span>
            <span className="text-xs text-emerald-400 font-mono">creatures</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400 block">Average Sleep</span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-amber-300 tabular-nums">{avgHours}</span>
            <span className="text-xs text-slate-400 font-mono">hrs / night</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400 block">Dream Sentiment</span>
          <div className="mt-1 flex items-center gap-3 text-xs font-mono">
            <span className="text-pink-400">🌈 {goodDreams}</span>
            <span className="text-slate-400">🌑 {badDreams}</span>
            <span className="text-emerald-400">🌿 {neutralDreams}</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400 block">Circadian Ecology</span>
          <div className="mt-1 text-xs text-slate-300">
            <span className="text-emerald-400 font-semibold">Active Sanctuary</span>
            <span className="text-slate-500 block text-[11px]">Max 2 entries/day</span>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
        
        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search creature or dream keywords..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-purple-500"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Dream filter */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setFilterType('all')}
              className={`px-2.5 py-1 rounded-lg transition-colors ${
                filterType === 'all' ? 'bg-purple-950 text-purple-300 font-medium' : 'text-slate-400 hover:text-white'
              }`}
            >
              All Dreams
            </button>
            <button
              onClick={() => setFilterType('good')}
              className={`px-2.5 py-1 rounded-lg transition-colors ${
                filterType === 'good' ? 'bg-pink-950 text-pink-300 font-medium' : 'text-slate-400 hover:text-white'
              }`}
            >
              Lucid
            </button>
            <button
              onClick={() => setFilterType('bad')}
              className={`px-2.5 py-1 rounded-lg transition-colors ${
                filterType === 'bad' ? 'bg-slate-800 text-slate-200 font-medium' : 'text-slate-400 hover:text-white'
              }`}
            >
              Nightmare
            </button>
            <button
              onClick={() => setFilterType('neutral')}
              className={`px-2.5 py-1 rounded-lg transition-colors ${
                filterType === 'neutral' ? 'bg-emerald-950 text-emerald-300 font-medium' : 'text-slate-400 hover:text-white'
              }`}
            >
              Peaceful
            </button>
          </div>

          {/* Quality filter */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setFilterQuality('all')}
              className={`px-2.5 py-1 rounded-lg transition-colors ${
                filterQuality === 'all' ? 'bg-slate-800 text-white font-medium' : 'text-slate-400 hover:text-white'
              }`}
            >
              All Quality
            </button>
            <button
              onClick={() => setFilterQuality('Great')}
              className={`px-2.5 py-1 rounded-lg transition-colors ${
                filterQuality === 'Great' ? 'bg-emerald-950 text-emerald-300 font-medium' : 'text-slate-400 hover:text-white'
              }`}
            >
              Great
            </button>
            <button
              onClick={() => setFilterQuality('Poor')}
              className={`px-2.5 py-1 rounded-lg transition-colors ${
                filterQuality === 'Poor' ? 'bg-rose-950 text-rose-300 font-medium' : 'text-slate-400 hover:text-white'
              }`}
            >
              Poor
            </button>
          </div>
        </div>
      </div>

      {/* Creature Cards Grid */}
      {filteredSheep.length === 0 ? (
        <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-2xl text-slate-500 space-y-2">
          <BookOpen className="w-8 h-8 mx-auto text-slate-600" />
          <p className="text-sm">No creature records match your query.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSheep.map((s) => (
            <div
              key={s.id}
              onClick={() => onSelectSheep(s)}
              className="group p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all hover:shadow-xl cursor-pointer flex flex-col justify-between space-y-4"
            >
              {/* Card Top */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {/* Wool Swatch Avatar */}
                  <div
                    className="w-10 h-10 rounded-xl border border-white/20 shadow-sm flex items-center justify-center font-bold text-slate-900 text-xs"
                    style={{ backgroundColor: s.woolColor }}
                  >
                    🐑
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white font-display group-hover:text-emerald-300 transition-colors">
                      {s.name}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
                      <span>#{s.id}</span>
                      <span>·</span>
                      <span>{s.date}</span>
                    </div>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider font-mono ${
                    s.dreamType === 'good'
                      ? 'bg-pink-950/80 text-pink-300 border border-pink-500/30'
                      : s.dreamType === 'bad'
                      ? 'bg-slate-800 text-slate-300 border border-slate-700'
                      : 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/30'
                  }`}
                >
                  {s.dreamType}
                </span>
              </div>

              {/* Card Sleep Stats */}
              <div className="grid grid-cols-2 gap-2 text-xs py-2 border-y border-slate-800/80">
                <div>
                  <span className="text-slate-500 text-[11px] block">Duration</span>
                  <span className="font-mono font-semibold text-white">{s.hours} hrs</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[11px] block">Sleep Quality</span>
                  <span className="font-medium text-emerald-400">{s.quality}</span>
                </div>
              </div>

              {/* Card Dream Quote */}
              <p className="text-xs text-slate-300 italic line-clamp-2 leading-relaxed">
                "{s.diary}"
              </p>

              {/* Card Footer */}
              <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                <span className="text-[11px]">Click to inspect phenotype & diary</span>
                <Heart className="w-3.5 h-3.5 text-pink-400/60 group-hover:text-pink-400 transition-colors" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
