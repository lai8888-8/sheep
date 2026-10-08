import React from 'react';
import { Volume2, VolumeX, Moon, BookOpen, Bell, RotateCcw } from 'lucide-react';

interface NavigationProps {
  isAudioMuted: boolean;
  onToggleAudio: () => void;
  onOpenCompendium: () => void;
  onRingBell: () => void;
  onResetDemo: () => void;
  timeOfDay: 'night' | 'twilight' | 'dawn';
  onChangeTimeOfDay: (tod: 'night' | 'twilight' | 'dawn') => void;
  flockCount: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  isAudioMuted,
  onToggleAudio,
  onOpenCompendium,
  onRingBell,
  onResetDemo,
  timeOfDay,
  onChangeTimeOfDay,
  flockCount,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-950/80 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Moon className="w-4 h-4" />
          </div>
          <div>
            <span className="text-lg font-semibold tracking-tight text-white font-display">
              Sleep Farm
            </span>
            <span className="hidden sm:inline-block ml-2 text-xs text-slate-500 font-mono">
              Virtual Creature
            </span>
          </div>
        </div>

        {/* Zone 2: Navigation controls & Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Time of Day Cycle selector */}
          <div className="flex items-center bg-slate-900/80 p-0.5 rounded-xl border border-slate-800 text-xs text-slate-300">
            <button
              onClick={() => onChangeTimeOfDay('night')}
              className={`px-2.5 py-1 rounded-lg transition-colors ${
                timeOfDay === 'night' ? 'bg-slate-800 text-white font-medium shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Night Sky"
            >
              🌙 Night
            </button>
            <button
              onClick={() => onChangeTimeOfDay('twilight')}
              className={`px-2.5 py-1 rounded-lg transition-colors ${
                timeOfDay === 'twilight' ? 'bg-slate-800 text-white font-medium shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Twilight Sky"
            >
              🌆 Twilight
            </button>
            <button
              onClick={() => onChangeTimeOfDay('dawn')}
              className={`px-2.5 py-1 rounded-lg transition-colors ${
                timeOfDay === 'dawn' ? 'bg-slate-800 text-white font-medium shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Dawn Sky"
            >
              🌅 Dawn
            </button>
          </div>

          {/* Ring Bell to summon flock */}
          <button
            onClick={onRingBell}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-850 text-xs font-medium transition-colors"
            title="Ring pasture bell to gather sheep"
          >
            <Bell className="w-3.5 h-3.5 text-amber-400" />
            <span>Summon Bell</span>
          </button>

          {/* Sheep Compendium & Genetics Lab Button */}
          <button
            onClick={onOpenCompendium}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-950/70 border border-amber-500/40 text-amber-300 hover:bg-amber-900/60 text-xs font-semibold transition-all shadow-sm active:scale-95 whitespace-nowrap"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Sheep Compendium & Lab (图鉴)</span>
          </button>

          {/* Reset Demo button */}
          <button
            onClick={onResetDemo}
            className="p-2 rounded-xl bg-slate-900 text-slate-400 border border-slate-800 hover:text-white hover:bg-slate-800 transition-colors"
            title="Reset default demo sheep"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Procedural Audio Ambience Toggle */}
          <button
            onClick={onToggleAudio}
            className={`p-2 rounded-xl border transition-colors ${
              !isAudioMuted
                ? 'bg-emerald-950/80 text-emerald-400 border-emerald-500/40 hover:bg-emerald-900/60'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200 hover:bg-slate-800'
            }`}
            title={isAudioMuted ? 'Unmute procedural soundscape' : 'Mute soundscape'}
            aria-label="Toggle Sound"
          >
            {isAudioMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </header>
  );
};
