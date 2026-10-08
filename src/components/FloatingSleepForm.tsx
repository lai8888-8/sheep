import React, { useState } from 'react';
import { Sparkles, Moon, ChevronDown, ChevronUp, AlertCircle, Plus } from 'lucide-react';
import { DreamType, SleepQuality } from '../types/sheep';

interface FloatingSleepFormProps {
  onSubmit: (data: {
    name: string;
    date: string;
    hours: number;
    quality: SleepQuality;
    dreamType: DreamType;
    diary: string;
  }) => void;
  todayCount: number;
}

export const FloatingSleepForm: React.FC<FloatingSleepFormProps> = ({
  onSubmit,
  todayCount,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [name, setName] = useState('');
  const [hours, setHours] = useState('7.5');
  const [quality, setQuality] = useState<SleepQuality>('Great');
  const [dreamType, setDreamType] = useState<DreamType>('good');
  const [diary, setDiary] = useState('');
  const [bypassLimit, setBypassLimit] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const todayStr = new Date().toISOString().slice(0, 10);
  const isLimitReached = todayCount >= 2 && !bypassLimit;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (isLimitReached) {
      setErrorMessage('Daily limit reached (2/2 sheep). Enable demo bypass below to continue testing.');
      return;
    }

    const parsedHours = parseFloat(hours);
    if (isNaN(parsedHours) || parsedHours <= 0) {
      setErrorMessage('Please enter a valid sleep duration in hours.');
      return;
    }

    const finalName = name.trim() || 'Unnamed';
    const finalDiary = diary.trim() || '(No diary entry)';

    onSubmit({
      name: finalName,
      date: todayStr,
      hours: parsedHours,
      quality,
      dreamType,
      diary: finalDiary,
    });

    // Reset fields
    setName('');
    setHours('7.5');
    setDiary('');
  };

  const handleQuickPreset = (preset: 'good' | 'nightmare' | 'nap') => {
    if (preset === 'good') {
      setName('Cloudy');
      setHours('8.0');
      setQuality('Great');
      setDreamType('good');
      setDiary('Flew on a soft cloud above a starlit lake.');
    } else if (preset === 'nightmare') {
      setName('Ash');
      setHours('4.5');
      setQuality('Poor');
      setDreamType('bad');
      setDiary('Got chased in a dark labyrinth storm.');
    } else {
      setName('Dew');
      setHours('2.0');
      setQuality('Okay');
      setDreamType('neutral');
      setDiary('Quiet afternoon siesta in the garden.');
    }
  };

  return (
    <div className="absolute top-4 left-4 z-20 w-80 max-w-[calc(100vw-32px)] bg-slate-900/90 backdrop-blur-md border border-slate-800/90 rounded-2xl shadow-2xl overflow-hidden transition-all text-slate-200">
      
      {/* Header with collapse button */}
      <div
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="px-4 py-3 flex items-center justify-between cursor-pointer border-b border-slate-800/80 hover:bg-slate-800/40 select-none transition-colors"
      >
        <div className="flex items-center gap-2">
          <Moon className="w-4 h-4 text-emerald-400" />
          <h2 className="text-xs font-bold text-white tracking-wide uppercase font-mono">
            Log your sleep tonight 🌙
          </h2>
        </div>
        <button className="text-slate-400 hover:text-white">
          {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
        </button>
      </div>

      {/* Collapsible Form Body */}
      {!isCollapsed && (
        <form onSubmit={handleSubmit} className="p-4 space-y-3 text-xs">
          {errorMessage && (
            <div className="p-2.5 rounded-lg bg-rose-950/60 border border-rose-500/30 text-rose-300 text-[11px] flex items-start gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Quick Presets */}
          <div>
            <span className="text-[11px] text-slate-400 block mb-1">Quick Presets:</span>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => handleQuickPreset('good')}
                className="py-1 px-1.5 rounded-lg bg-pink-950/40 hover:bg-pink-900/50 border border-pink-500/30 text-pink-300 text-[11px] transition-colors"
              >
                🌈 Good
              </button>
              <button
                type="button"
                onClick={() => handleQuickPreset('nightmare')}
                className="py-1 px-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-750 border border-slate-700 text-slate-300 text-[11px] transition-colors"
              >
                🌑 Nightmare
              </button>
              <button
                type="button"
                onClick={() => handleQuickPreset('nap')}
                className="py-1 px-1.5 rounded-lg bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-500/30 text-emerald-300 text-[11px] transition-colors"
              >
                🌿 Nap
              </button>
            </div>
          </div>

          {/* Sheep Name */}
          <div>
            <label className="text-[11px] text-slate-400 block mb-1">Sheep name:</label>
            <input
              type="text"
              placeholder="e.g. Cloudy"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-950/90 border border-slate-800 rounded-lg text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Sleep Hours */}
          <div>
            <label className="text-[11px] text-slate-400 block mb-1">Sleep hours:</label>
            <input
              type="number"
              step="0.5"
              placeholder="e.g. 7.5"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-950/90 border border-slate-800 rounded-lg text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 font-mono"
            />
          </div>

          {/* Quality & Dream Type in 2 cols */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Sleep quality:</label>
              <select
                value={quality}
                onChange={(e) => setQuality(e.target.value as SleepQuality)}
                className="w-full px-2 py-1.5 bg-slate-950/90 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-emerald-500 text-xs"
              >
                <option value="Great">Great</option>
                <option value="Okay">Okay</option>
                <option value="Poor">Poor</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Dream type:</label>
              <select
                value={dreamType}
                onChange={(e) => setDreamType(e.target.value as DreamType)}
                className="w-full px-2 py-1.5 bg-slate-950/90 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-emerald-500 text-xs"
              >
                <option value="good">Good dream</option>
                <option value="bad">Nightmare</option>
                <option value="neutral">Neutral</option>
              </select>
            </div>
          </div>

          {/* Dream Diary */}
          <div>
            <label className="text-[11px] text-slate-400 block mb-1">What did you dream?</label>
            <textarea
              rows={2}
              placeholder="Write your dream, or 'no dream'..."
              value={diary}
              onChange={(e) => setDiary(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-950/90 border border-slate-800 rounded-lg text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 text-xs resize-none"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-2 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-bold transition-all shadow-md shadow-emerald-950/50 flex items-center justify-center gap-1.5"
          >
            <span>Raise a sheep 🐑</span>
          </button>

          {/* Nursery Daily Limit footer */}
          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <span className="font-mono">
              Today: <strong className="text-amber-300">{todayCount}/2</strong> sheep
            </span>
            <label className="flex items-center gap-1 cursor-pointer select-none text-[10px] text-slate-400 hover:text-slate-300">
              <input
                type="checkbox"
                checked={bypassLimit}
                onChange={(e) => setBypassLimit(e.target.checked)}
                className="rounded border-slate-700 text-emerald-500 focus:ring-0 w-3 h-3"
              />
              <span>Demo Bypass</span>
            </label>
          </div>
        </form>
      )}
    </div>
  );
};
