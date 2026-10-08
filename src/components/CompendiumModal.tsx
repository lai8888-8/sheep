import React, { useState } from 'react';
import { X, Sparkles, BookOpen, Sliders, Volume2, Heart, Award, CheckCircle2, Lock } from 'lucide-react';
import { SheepCreature, SleepQuality, DreamType } from '../types/sheep';
import { soundEngine } from '../audio/synth';

interface CompendiumModalProps {
  isOpen: boolean;
  onClose: () => void;
  sheepList: SheepCreature[];
  onSelectSheep: (s: SheepCreature) => void;
}

interface BreedArchetype {
  id: string;
  name: string;
  subtitle: string;
  tagline: string;
  condition: string;
  description: string;
  colorSwatch: string;
  hornType: 'none' | 'small' | 'spiral';
  aura: boolean;
  checkUnlocked: (sheep: SheepCreature[]) => boolean;
  getMatchingCount: (sheep: SheepCreature[]) => number;
  samplePreset: {
    hours: number;
    quality: SleepQuality;
    dreamType: DreamType;
  };
}

export const CompendiumModal: React.FC<CompendiumModalProps> = ({
  isOpen,
  onClose,
  sheepList,
  onSelectSheep,
}) => {
  const [activeTab, setActiveTab] = useState<'compendium' | 'lab' | 'roster'>('compendium');

  // Lab testing state
  const [labHours, setLabHours] = useState(8.0);
  const [labQuality, setLabQuality] = useState<SleepQuality>('Great');
  const [labDreamType, setLabDreamType] = useState<DreamType>('good');

  if (!isOpen) return null;

  // The 6 Archetypal Sheep Phenotypes
  const breeds: BreedArchetype[] = [
    {
      id: 'cotton_candy',
      name: 'Cotton Candy Dreamer',
      subtitle: '棉花糖美梦羊',
      tagline: 'Born from joyful dreams and serene nights.',
      condition: 'Good Dream + Great / Okay Sleep',
      description: 'Coated in pastel strawberry and lavender wool puffs. Possesses high vitality, bouncy trot kinematics, and emits playful melodic bleats.',
      colorSwatch: '#fbcfe8',
      hornType: 'none',
      aura: true,
      checkUnlocked: (flock) => flock.some((s) => s.dreamType === 'good'),
      getMatchingCount: (flock) => flock.filter((s) => s.dreamType === 'good' && s.hours < 8).length,
      samplePreset: { hours: 7.5, quality: 'Great', dreamType: 'good' },
    },
    {
      id: 'starlight_guardian',
      name: 'Starlight Celestial Guardian',
      subtitle: '星光守望羊',
      tagline: 'Born from deep, expansive slumber over 8 hours.',
      condition: 'Sleep ≥ 8.0 hrs + Good Dream',
      description: 'A rare celestial entity crowned with golden spiral horns and a shimmering starlight aura. Exerts gentle social cohesion over neighboring sheep.',
      colorSwatch: '#fef08a',
      hornType: 'spiral',
      aura: true,
      checkUnlocked: (flock) => flock.some((s) => s.hours >= 8 && s.dreamType === 'good'),
      getMatchingCount: (flock) => flock.filter((s) => s.hours >= 8 && s.dreamType === 'good').length,
      samplePreset: { hours: 9.0, quality: 'Great', dreamType: 'good' },
    },
    {
      id: 'storm_ash',
      name: 'Stormcloud Ash Wanderer',
      subtitle: '风暴灰云羊',
      tagline: 'The brave container of nocturnal nightmares.',
      condition: 'Nightmare Dream',
      description: 'Cloaked in dark slate and volcanic charcoal wool. Tends to maintain higher personal space (repulsion force) and paces cautiously along the meadow edge.',
      colorSwatch: '#64748b',
      hornType: 'none',
      aura: false,
      checkUnlocked: (flock) => flock.some((s) => s.dreamType === 'bad'),
      getMatchingCount: (flock) => flock.filter((s) => s.dreamType === 'bad').length,
      samplePreset: { hours: 5.0, quality: 'Poor', dreamType: 'bad' },
    },
    {
      id: 'dewdrop_sage',
      name: 'Dewdrop Meadow Grazer',
      subtitle: '青草晨露羊',
      tagline: 'Born from quiet, dreamless, restful nights.',
      condition: 'Neutral / Peaceful Dream',
      description: 'Adorned in refreshing mint sage wool. Spends significant time in contemplative grazing, softly bobbing its muzzle into the green grass.',
      colorSwatch: '#bbf7d0',
      hornType: 'none',
      aura: false,
      checkUnlocked: (flock) => flock.some((s) => s.dreamType === 'neutral' && s.hours > 3),
      getMatchingCount: (flock) => flock.filter((s) => s.dreamType === 'neutral' && s.hours > 3).length,
      samplePreset: { hours: 7.0, quality: 'Okay', dreamType: 'neutral' },
    },
    {
      id: 'siesta_napling',
      name: 'Siesta Napling',
      subtitle: '午后小憩羊',
      tagline: 'Born from short restorative daytime naps.',
      condition: 'Sleep Duration ≤ 3.5 hrs',
      description: 'A dainty, compact miniature sheep with sleepy crescent eyes. Ambles gently with shorter strides and loves resting under the afternoon sun.',
      colorSwatch: '#c7d2fe',
      hornType: 'none',
      aura: false,
      checkUnlocked: (flock) => flock.some((s) => s.hours <= 3.5),
      getMatchingCount: (flock) => flock.filter((s) => s.hours <= 3.5).length,
      samplePreset: { hours: 2.0, quality: 'Okay', dreamType: 'neutral' },
    },
    {
      id: 'sovereign_deep',
      name: 'Grand Somnolent Sovereign',
      subtitle: '远古睡神羊',
      tagline: 'The mythical lord of profound healing sleep.',
      condition: 'Sleep Duration ≥ 9.5 hrs + Great Quality',
      description: 'Possesses immense cloud-puff volume, regal golden spiraled horns, and a deep resonance bleat. A true testament to sublime sleep recovery.',
      colorSwatch: '#fed7aa',
      hornType: 'spiral',
      aura: true,
      checkUnlocked: (flock) => flock.some((s) => s.hours >= 9.5 && s.quality === 'Great'),
      getMatchingCount: (flock) => flock.filter((s) => s.hours >= 9.5 && s.quality === 'Great').length,
      samplePreset: { hours: 10.0, quality: 'Great', dreamType: 'good' },
    },
  ];

  const unlockedCount = breeds.filter((b) => b.checkUnlocked(sheepList)).length;

  // Handle setting lab parameters
  const handleLoadPresetIntoLab = (preset: { hours: number; quality: SleepQuality; dreamType: DreamType }) => {
    setLabHours(preset.hours);
    setLabQuality(preset.quality);
    setLabDreamType(preset.dreamType);
    setActiveTab('lab');
  };

  // Lab calculations
  const durationScale = Math.min(1.25, Math.max(0.8, 0.82 + labHours * 0.035));
  let labBaseSize = 34;
  let labSpeed = 1.15;
  if (labQuality === 'Great') {
    labBaseSize = 44;
    labSpeed = 1.6;
  } else if (labQuality === 'Poor') {
    labBaseSize = 26;
    labSpeed = 0.8;
  }
  const labFinalSize = Math.round(labBaseSize * durationScale);
  const labHasHorns = labHours >= 7.5;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Compendium Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-950/60 border border-amber-500/30 text-amber-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white font-display flex items-center gap-2">
                <span>Sheep Compendium & Genetics</span>
                <span className="text-xs font-mono font-normal text-amber-300 bg-amber-950/80 border border-amber-500/30 px-2 py-0.5 rounded-full">
                  图鉴 {unlockedCount}/{breeds.length} Discovered
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Discover algorithmic phenotypes emerging from your circadian sleep cycles and dream diaries.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="px-6 pt-3 border-b border-slate-800 bg-slate-950/20 flex gap-2">
          <button
            onClick={() => setActiveTab('compendium')}
            className={`pb-3 px-3 text-xs sm:text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'compendium'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Species Bestiary (图鉴档案)</span>
          </button>

          <button
            onClick={() => setActiveTab('lab')}
            className={`pb-3 px-3 text-xs sm:text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'lab'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Genetics Sandbox (基因调试器)</span>
          </button>

          <button
            onClick={() => setActiveTab('roster')}
            className={`pb-3 px-3 text-xs sm:text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'roster'
                ? 'border-emerald-400 text-emerald-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Heart className="w-4 h-4" />
            <span>Flock Roster ({sheepList.length} 羊群名单)</span>
          </button>
        </div>

        {/* Tab Contents (Scrollable Area) */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-6">
          
          {/* TAB 1: COMPENDIUM BESTIARY */}
          {activeTab === 'compendium' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {breeds.map((breed) => {
                  const isUnlocked = breed.checkUnlocked(sheepList);
                  const matchingCount = breed.getMatchingCount(sheepList);

                  return (
                    <div
                      key={breed.id}
                      className={`p-4 sm:p-5 rounded-2xl border transition-all flex flex-col justify-between space-y-3 ${
                        isUnlocked
                          ? 'bg-slate-900 border-slate-800 hover:border-slate-700'
                          : 'bg-slate-950/60 border-slate-900 opacity-70'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          {/* Creature avatar swatch */}
                          <div
                            className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-md border border-white/20 relative shrink-0"
                            style={{ backgroundColor: breed.colorSwatch }}
                          >
                            <span>🐑</span>
                            {breed.hornType === 'spiral' && (
                              <span className="absolute -top-1.5 -right-1.5 text-xs">👑</span>
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-base font-bold text-white font-display">
                                {breed.name}
                              </h3>
                              <span className="text-xs text-slate-400 font-mono">
                                {breed.subtitle}
                              </span>
                            </div>
                            <span className="text-[11px] text-amber-300/90 italic block">
                              "{breed.tagline}"
                            </span>
                          </div>
                        </div>

                        {/* Unlock badge */}
                        {isUnlocked ? (
                          <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-400 bg-emerald-950/80 border border-emerald-500/30 px-2 py-0.5 rounded-full shrink-0">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>{matchingCount} in flock</span>
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-[11px] font-mono text-slate-500 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded-full shrink-0">
                            <Lock className="w-3 h-3" />
                            <span>Locked</span>
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed">
                        {breed.description}
                      </p>

                      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                        <div className="text-[11px] text-slate-400">
                          <span className="font-semibold text-slate-300">Condition: </span>
                          <span>{breed.condition}</span>
                        </div>

                        <button
                          onClick={() => handleLoadPresetIntoLab(breed.samplePreset)}
                          className="px-2.5 py-1 rounded-lg bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-500/30 text-cyan-300 text-[11px] font-medium transition-colors"
                        >
                          Test Gene in Lab →
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: LAB SANDBOX */}
          {activeTab === 'lab' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                
                {/* Visual Phenotype Preview (5 cols) */}
                <div className="md:col-span-5 p-6 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col items-center justify-center space-y-4 text-center">
                  <div className="relative">
                    {/* Glowing aura if good */}
                    {labDreamType === 'good' && (
                      <div className="absolute inset-0 rounded-full bg-amber-400/20 blur-xl animate-pulse" />
                    )}
                    <div
                      className="w-24 h-24 rounded-3xl flex items-center justify-center text-4xl shadow-xl border-2 border-white/20 transition-all transform hover:scale-105 relative z-10"
                      style={{
                        backgroundColor:
                          labDreamType === 'good'
                            ? '#fbcfe8'
                            : labDreamType === 'bad'
                            ? '#64748b'
                            : '#bbf7d0',
                      }}
                    >
                      <span>🐑</span>
                      {labHasHorns && (
                        <span className="absolute -top-2 -right-2 text-xl">👑</span>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-white font-display">
                      {labHours >= 9.5 && labQuality === 'Great'
                        ? 'Grand Somnolent Sovereign'
                        : labHours >= 8.0 && labDreamType === 'good'
                        ? 'Starlight Celestial Guardian'
                        : labDreamType === 'bad'
                        ? 'Stormcloud Ash Wanderer'
                        : labDreamType === 'good'
                        ? 'Cotton Candy Dreamer'
                        : labHours <= 3.5
                        ? 'Siesta Napling'
                        : 'Dewdrop Meadow Grazer'}
                    </h3>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">
                      Bio-scale: {labFinalSize}px · Trot pace: {labSpeed} px/f
                    </p>
                  </div>

                  <button
                    onClick={() =>
                      soundEngine.playBleat(
                        labQuality === 'Poor' ? 1.25 : labQuality === 'Great' ? 0.95 : 1.05
                      )
                    }
                    className="px-3.5 py-1.5 rounded-xl bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-900/60 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Test Formant Vocal Bleat</span>
                  </button>
                </div>

                {/* Modifiers (7 cols) */}
                <div className="md:col-span-7 space-y-4 bg-slate-900/90 p-5 rounded-2xl border border-slate-800">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-800 text-sm font-semibold text-white">
                    <Sliders className="w-4 h-4 text-cyan-400" />
                    <span>Adjust Circadian & Dream Modifiers</span>
                  </div>

                  {/* Sleep Duration */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-300 font-medium">Sleep Duration:</span>
                      <span className="font-mono text-cyan-300 font-semibold">{labHours} hrs</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="12"
                      step="0.5"
                      value={labHours}
                      onChange={(e) => setLabHours(parseFloat(e.target.value))}
                      className="w-full accent-cyan-400 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                      <span>1h (Nap)</span>
                      <span>7.5h (Horns Unlock)</span>
                      <span>12h (Deep Rest)</span>
                    </div>
                  </div>

                  {/* Sleep Quality */}
                  <div className="space-y-1">
                    <span className="text-xs text-slate-300 font-medium block">Sleep Quality:</span>
                    <div className="grid grid-cols-3 gap-2">
                      {(['Great', 'Okay', 'Poor'] as SleepQuality[]).map((q) => (
                        <button
                          key={q}
                          onClick={() => setLabQuality(q)}
                          className={`py-1.5 px-2 rounded-lg border text-xs font-medium transition-colors ${
                            labQuality === q
                              ? 'bg-cyan-950/70 border-cyan-500/50 text-cyan-300 font-semibold'
                              : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Dream Mood */}
                  <div className="space-y-1">
                    <span className="text-xs text-slate-300 font-medium block">Dream Sentiment:</span>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => setLabDreamType('good')}
                        className={`py-1.5 px-2 rounded-lg border text-xs font-medium transition-colors ${
                          labDreamType === 'good'
                            ? 'bg-pink-950/70 border-pink-500/50 text-pink-300 font-semibold'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        🌈 Good Dream
                      </button>
                      <button
                        onClick={() => setLabDreamType('neutral')}
                        className={`py-1.5 px-2 rounded-lg border text-xs font-medium transition-colors ${
                          labDreamType === 'neutral'
                            ? 'bg-emerald-950/70 border-emerald-500/50 text-emerald-300 font-semibold'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        🌿 Neutral
                      </button>
                      <button
                        onClick={() => setLabDreamType('bad')}
                        className={`py-1.5 px-2 rounded-lg border text-xs font-medium transition-colors ${
                          labDreamType === 'bad'
                            ? 'bg-slate-800 border-slate-600 text-slate-200 font-semibold'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        🌑 Nightmare
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: FLOCK ROSTER */}
          {activeTab === 'roster' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400 pb-2 border-b border-slate-800 font-mono">
                <span>Total Sheep: {sheepList.length}</span>
                <span>Click sheep to inspect full diary card</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {sheepList.map((s) => (
                  <div
                    key={s.id}
                    onClick={() => {
                      onSelectSheep(s);
                      onClose();
                    }}
                    className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-base border border-white/20 shrink-0"
                        style={{ backgroundColor: s.woolColor }}
                      >
                        🐑
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white font-display">{s.name}</h4>
                        <div className="text-[11px] text-slate-400 font-mono">
                          {s.hours}h · {s.quality} · {s.dreamType}
                        </div>
                      </div>
                    </div>
                    <span className="text-xs text-slate-500 font-mono">#{s.id}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
