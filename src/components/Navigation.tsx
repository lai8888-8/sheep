import React from 'react';
import { Volume2, VolumeX, Moon, Sun, BookOpen, Bell, RotateCcw, Globe } from 'lucide-react';
import { TimeOfDay } from '../types/sheep';
import { Language, translations } from '../i18n/translations';

interface NavigationProps {
  isAudioMuted: boolean;
  onToggleAudio: () => void;
  onOpenCompendium: () => void;
  onRingBell: () => void;
  onResetDemo: () => void;
  timeOfDay: TimeOfDay;
  onChangeTimeOfDay: (tod: TimeOfDay) => void;
  flockCount: number;
  currentLang: Language;
  onToggleLang: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  isAudioMuted,
  onToggleAudio,
  onOpenCompendium,
  onRingBell,
  onResetDemo,
  timeOfDay,
  onChangeTimeOfDay,
  currentLang,
  onToggleLang,
}) => {
  const t = translations[currentLang].nav;

  const getSoundLabel = () => {
    if (isAudioMuted) return t.soundMuted;
    if (timeOfDay === 'day') return t.soundDay;
    if (timeOfDay === 'night') return t.soundNight;
    if (timeOfDay === 'twilight') return t.soundTwilight;
    return t.soundDawn;
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Zone 1: Wordmark */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-950/80 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            {timeOfDay === 'day' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </div>
          <div>
            <span className="text-lg font-semibold tracking-tight text-white font-display">
              {t.brand}
            </span>
            <span className="hidden sm:inline-block ml-2 text-xs text-slate-500 font-mono">
              {t.tagline}
            </span>
          </div>
        </div>

        {/* Zone 2: Navigation controls & Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Time of Day Cycle selector */}
          <div className="flex items-center bg-slate-900/80 p-0.5 rounded-xl border border-slate-800 text-xs text-slate-300">
            <button
              onClick={() => onChangeTimeOfDay('day')}
              className={`px-2.5 py-1 rounded-lg transition-colors ${
                timeOfDay === 'day'
                  ? 'bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title={t.dayTitle}
            >
              {t.day}
            </button>
            <button
              onClick={() => onChangeTimeOfDay('dawn')}
              className={`px-2.5 py-1 rounded-lg transition-colors ${
                timeOfDay === 'dawn'
                  ? 'bg-slate-800 text-white font-medium shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title={t.dawnTitle}
            >
              {t.dawn}
            </button>
            <button
              onClick={() => onChangeTimeOfDay('twilight')}
              className={`px-2.5 py-1 rounded-lg transition-colors ${
                timeOfDay === 'twilight'
                  ? 'bg-slate-800 text-white font-medium shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title={t.twilightTitle}
            >
              {t.twilight}
            </button>
            <button
              onClick={() => onChangeTimeOfDay('night')}
              className={`px-2.5 py-1 rounded-lg transition-colors ${
                timeOfDay === 'night'
                  ? 'bg-slate-800 text-white font-medium shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title={t.nightTitle}
            >
              {t.night}
            </button>
          </div>

          {/* Ring Bell to summon flock */}
          <button
            onClick={onRingBell}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-850 text-xs font-medium transition-colors"
            title={t.summonBellTitle}
          >
            <Bell className="w-3.5 h-3.5 text-amber-400" />
            <span>{t.summonBell}</span>
          </button>

          {/* Sheep Compendium & Genetics Lab Button */}
          <button
            onClick={onOpenCompendium}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-950/70 border border-amber-500/40 text-amber-300 hover:bg-amber-900/60 text-xs font-semibold transition-all shadow-sm active:scale-95 whitespace-nowrap"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>{t.compendium}</span>
          </button>

          {/* Language Toggle Button: EN / 中 */}
          <button
            onClick={onToggleLang}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900 border border-cyan-500/40 hover:border-cyan-400 text-cyan-300 hover:text-white text-xs font-semibold transition-all shadow-sm active:scale-95 select-none"
            title={currentLang === 'en' ? '切换为中文 (Switch to Chinese)' : 'Switch to English (切换为英文)'}
          >
            <Globe className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-mono">{currentLang === 'en' ? 'EN' : '中文'}</span>
          </button>

          {/* Reset Demo button */}
          <button
            onClick={onResetDemo}
            className="p-2 rounded-xl bg-slate-900 text-slate-400 border border-slate-800 hover:text-white hover:bg-slate-800 transition-colors"
            title={t.resetDemoTitle}
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Procedural Audio Ambience Toggle */}
          <button
            onClick={onToggleAudio}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border transition-colors ${
              !isAudioMuted
                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40 hover:bg-emerald-900/60 shadow-sm'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200 hover:bg-slate-800'
            }`}
            title={isAudioMuted ? 'Unmute procedural soundscape' : `Playing ${getSoundLabel()}`}
            aria-label="Toggle Sound"
          >
            {isAudioMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            <span className="hidden lg:inline text-[11px] font-medium font-mono">
              {getSoundLabel()}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
