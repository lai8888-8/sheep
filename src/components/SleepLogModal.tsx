import React, { useState } from 'react';
import { X, Sparkles, Moon, AlertCircle, HelpCircle } from 'lucide-react';
import { DreamType, SleepQuality } from '../types/sheep';

interface SleepLogModalProps {
  isOpen: boolean;
  onClose: () => void;
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

export const SleepLogModal: React.FC<SleepLogModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  todayCount,
}) => {
  const todayStr = new Date().toISOString().slice(0, 10);

  const [name, setName] = useState('');
  const [date, setDate] = useState(todayStr);
  const [hours, setHours] = useState('7.5');
  const [quality, setQuality] = useState<SleepQuality>('Great');
  const [dreamType, setDreamType] = useState<DreamType>('good');
  const [diary, setDiary] = useState('');
  const [bypassLimit, setBypassLimit] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const isDailyLimitReached = todayCount >= 2 && !bypassLimit && date === todayStr;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (isDailyLimitReached) {
      setErrorMsg('Daily creature limit reached (2/2 for today). Enable demo bypass below to continue testing.');
      return;
    }

    const parsedHours = parseFloat(hours);
    if (isNaN(parsedHours) || parsedHours < 0.5 || parsedHours > 16) {
      setErrorMsg('Please specify a realistic sleep duration between 0.5 and 16 hours.');
      return;
    }

    const finalName = name.trim() || `Sleeper #${Math.floor(100 + Math.random() * 900)}`;
    const finalDiary = diary.trim() || 'No dream recorded. A quiet, restful slumber.';

    onSubmit({
      name: finalName,
      date,
      hours: parsedHours,
      quality,
      dreamType,
      diary: finalDiary,
    });

    // Reset form
    setName('');
    setHours('7.5');
    setDiary('');
    onClose();
  };

  const handleApplyPreset = (preset: 'good' | 'nightmare' | 'nap') => {
    if (preset === 'good') {
      setName('Celeste');
      setHours('8.5');
      setQuality('Great');
      setDreamType('good');
      setDiary('Drifted through pastel aurora clouds over an endless glassy ocean. Felt weightless and calm.');
    } else if (preset === 'nightmare') {
      setName('Shadow Ash');
      setHours('4.5');
      setQuality('Poor');
      setDreamType('bad');
      setDiary('Trapped in an infinite twisting stone labyrinth while dark fog rolled across the ground.');
    } else {
      setName('Breeze');
      setHours('2.0');
      setQuality('Okay');
      setDreamType('neutral');
      setDiary('Short afternoon nap on the sofa. Woke up to the sound of gentle rainfall.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-7 text-slate-100 overflow-hidden">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-950/80 border border-emerald-500/30 text-emerald-400">
              <Moon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold tracking-tight text-white font-display">
                Log Sleep & Raise Sheep
              </h2>
              <p className="text-xs text-slate-400">
                Your circadian metrics synthesize the creature's morphology and gait.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Daily limit badge */}
        <div className="mt-4 flex items-center justify-between px-3.5 py-2 rounded-lg bg-slate-950/70 border border-slate-800/80 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Today's Nursery:</span>
            <span className="font-mono font-medium text-amber-300">
              {todayCount}/2 sheep raised today
            </span>
          </div>
          <label className="flex items-center gap-1.5 text-slate-400 hover:text-slate-300 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={bypassLimit}
              onChange={(e) => setBypassLimit(e.target.checked)}
              className="rounded border-slate-700 text-emerald-500 focus:ring-0"
            />
            <span>Demo Mode (Bypass 2-limit)</span>
          </label>
        </div>

        {/* Quick Presets */}
        <div className="mt-3">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
            <span>Quick Test Presets:</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleApplyPreset('good')}
              className="px-2.5 py-1.5 text-xs text-pink-300 bg-pink-950/30 hover:bg-pink-900/40 border border-pink-500/30 rounded-lg text-left transition-colors"
            >
              🌈 Lucid Dream
            </button>
            <button
              type="button"
              onClick={() => handleApplyPreset('nightmare')}
              className="px-2.5 py-1.5 text-xs text-slate-300 bg-slate-800/60 hover:bg-slate-800 border border-slate-700 rounded-lg text-left transition-colors"
            >
              🌑 Nightmare
            </button>
            <button
              type="button"
              onClick={() => handleApplyPreset('nap')}
              className="px-2.5 py-1.5 text-xs text-emerald-300 bg-emerald-950/30 hover:bg-emerald-900/40 border border-emerald-500/30 rounded-lg text-left transition-colors"
            >
              🌿 Gentle Nap
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
          {errorMsg && (
            <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Sheep Name
              </label>
              <input
                type="text"
                placeholder="e.g. Nimbus, Sol, Velvet"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-950/80 border border-slate-800 rounded-lg focus:outline-none focus:border-emerald-500 text-white placeholder-slate-600"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Sleep Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-950/80 border border-slate-800 rounded-lg focus:outline-none focus:border-emerald-500 text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Sleep Duration (hrs)
              </label>
              <input
                type="number"
                step="0.5"
                min="0.5"
                max="16"
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-950/80 border border-slate-800 rounded-lg focus:outline-none focus:border-emerald-500 text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Sleep Quality
              </label>
              <select
                value={quality}
                onChange={(e) => setQuality(e.target.value as SleepQuality)}
                className="w-full px-3 py-2 text-sm bg-slate-950/80 border border-slate-800 rounded-lg focus:outline-none focus:border-emerald-500 text-white"
              >
                <option value="Great">Great (Plump & Swift)</option>
                <option value="Okay">Okay (Balanced)</option>
                <option value="Poor">Poor (Slender & Weary)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Dream Mood
              </label>
              <select
                value={dreamType}
                onChange={(e) => setDreamType(e.target.value as DreamType)}
                className="w-full px-3 py-2 text-sm bg-slate-950/80 border border-slate-800 rounded-lg focus:outline-none focus:border-emerald-500 text-white"
              >
                <option value="good">Good Dream (Pastel Aura)</option>
                <option value="bad">Nightmare (Dark Ash)</option>
                <option value="neutral">Neutral (Sage & Mist)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Dream Diary / Sleep Journal Notes
            </label>
            <textarea
              rows={2}
              placeholder="What did your subconscious weave tonight? (or leave empty for deep dreamless slumber)"
              value={diary}
              onChange={(e) => setDiary(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-950/80 border border-slate-800 rounded-lg focus:outline-none focus:border-emerald-500 text-white placeholder-slate-600 resize-none"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-emerald-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-all shadow-md shadow-emerald-950/40 active:scale-95 flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Synthesize Creature</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
