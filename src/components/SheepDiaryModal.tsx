import React from 'react';
import { X, Heart, Sparkles, Clock, Calendar, ShieldCheck, Activity } from 'lucide-react';
import { SheepCreature } from '../types/sheep';
import { soundEngine } from '../audio/synth';

interface SheepDiaryModalProps {
  sheep: SheepCreature | null;
  onClose: () => void;
  onPet: (s: SheepCreature) => void;
}

export const SheepDiaryModal: React.FC<SheepDiaryModalProps> = ({
  sheep,
  onClose,
  onPet,
}) => {
  if (!sheep) return null;

  const handlePet = () => {
    soundEngine.playBleat(sheep.quality === 'Poor' ? 1.2 : sheep.quality === 'Great' ? 0.95 : 1.05);
    soundEngine.playPetSound();
    onPet(sheep);
  };

  const dreamLabel =
    sheep.dreamType === 'good'
      ? 'Lucid / Good Dream (Pastel Aura)'
      : sheep.dreamType === 'bad'
      ? 'Nightmare (Storm Charcoal)'
      : 'Calm / Neutral (Sage Twilight)';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden text-slate-100">
        
        {/* Banner with creature aesthetic hue */}
        <div
          className="h-24 w-full relative flex items-center justify-between px-6 overflow-hidden"
          style={{
            background:
              sheep.dreamType === 'good'
                ? 'linear-gradient(135deg, #f472b6 0%, #c084fc 50%, #38bdf8 100%)'
                : sheep.dreamType === 'bad'
                ? 'linear-gradient(135deg, #1e293b 0%, #334155 50%, #475569 100%)'
                : 'linear-gradient(135deg, #059669 0%, #0d9488 50%, #0284c7 100%)',
          }}
        >
          <div className="z-10">
            <span className="text-xs uppercase tracking-wider font-mono px-2 py-0.5 rounded bg-black/40 text-white backdrop-blur-sm">
              Creature #{sheep.id}
            </span>
            <h2 className="text-2xl font-bold text-white drop-shadow-md font-display mt-0.5">
              {sheep.name}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="z-10 p-1.5 rounded-full bg-black/30 hover:bg-black/50 text-white backdrop-blur-sm transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-4">
          
          {/* Metadata Row */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
              <div className="flex items-center gap-1.5 text-slate-400">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>Sleep Recorded</span>
              </div>
              <div className="text-sm font-semibold font-mono text-white tabular-nums">
                {sheep.hours} hours
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
              <div className="flex items-center gap-1.5 text-slate-400">
                <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                <span>Logged Date</span>
              </div>
              <div className="text-sm font-semibold font-mono text-white tabular-nums">
                {sheep.date}
              </div>
            </div>
          </div>

          {/* Morphological Analysis */}
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2 text-xs">
            <div className="flex items-center justify-between text-slate-400 pb-1 border-b border-slate-800/60">
              <span className="flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-cyan-400" />
                <span>Phenotype Mapping</span>
              </span>
              <span className="font-mono text-slate-300">Bio-Parametric</span>
            </div>

            <div className="grid grid-cols-2 gap-y-2 text-slate-300">
              <div>
                <span className="text-slate-500">Quality State: </span>
                <span className="font-medium text-white">{sheep.quality}</span>
              </div>
              <div>
                <span className="text-slate-500">Body Scale: </span>
                <span className="font-mono text-white">{Math.round(sheep.size)} px</span>
              </div>
              <div>
                <span className="text-slate-500">Dream State: </span>
                <span className="font-medium text-white">{sheep.dreamType}</span>
              </div>
              <div>
                <span className="text-slate-500">Wool Puff Count: </span>
                <span className="font-mono text-white">{sheep.puffCount} clusters</span>
              </div>
            </div>

            <div className="pt-1 text-[11px] text-slate-400">
              <span>Mood classification: </span>
              <span className="text-slate-200">{dreamLabel}</span>
            </div>
          </div>

          {/* Dream Diary Excerpt */}
          <div className="space-y-1.5">
            <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Dream Journal Excerpt:</span>
            </span>
            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-sm text-slate-200 italic leading-relaxed">
              "{sheep.diary}"
            </div>
          </div>

          {/* Action Row */}
          <div className="pt-2 flex items-center gap-3">
            <button
              onClick={handlePet}
              className="flex-1 py-2.5 px-4 rounded-xl bg-pink-500/15 hover:bg-pink-500/25 border border-pink-500/30 text-pink-300 text-xs font-semibold flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <Heart className="w-4 h-4 text-pink-400 fill-pink-400/30" />
              <span>Pet {sheep.name} (Bleat Baaa~)</span>
            </button>
            <button
              onClick={onClose}
              className="py-2.5 px-5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
