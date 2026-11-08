import React, { useState } from 'react';
import { X, BookOpen, Sliders, Heart, Award, CheckCircle2, Lock, Cloud } from 'lucide-react';
import { SheepCreature, SleepQuality, DreamType } from '../types/sheep';
import { CreatureLab } from './CreatureLab';
import { WordSheepCloud } from './WordSheepCloud';
import {
  Language,
  translations,
  getPersonalityLabel,
  getGenderLabel,
  getQualityLabel,
  getDreamTypeLabel,
} from '../i18n/translations';

interface CompendiumModalProps {
  isOpen: boolean;
  onClose: () => void;
  sheepList: SheepCreature[];
  onSelectSheep: (s: SheepCreature) => void;
  currentLang?: Language;
}

interface BreedArchetype {
  id: string;
  name: string;
  subtitle: string;
  tagline: string;
  condition: string;
  description: string;
  colorSwatch: string;
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
  currentLang = 'en',
}) => {
  const [activeTab, setActiveTab] = useState<'compendium' | 'lab' | 'wordsheep' | 'roster'>('compendium');
  const comp = translations[currentLang].compendium;

  if (!isOpen) return null;

  // The 6 Archetypal Sheep Phenotypes (Valais Blacknose)
  const breeds: BreedArchetype[] = [
    {
      id: 'cotton_candy',
      name: 'Cotton Candy Dreamer',
      subtitle: 'Pastel Cloud Lamb',
      tagline: 'Born from joyful dreams and serene nights.',
      condition: 'Good Dream + Great / Okay Sleep',
      description: 'Coated in pastel strawberry and lavender wool puffs with a jet-black face. Possesses high vitality, bouncy trot kinematics, and emits playful melodic bleats.',
      colorSwatch: '#fbcfe8',
      checkUnlocked: (flock) => flock.some((s) => s.dreamType === 'good'),
      getMatchingCount: (flock) => flock.filter((s) => s.dreamType === 'good' && s.hours < 8).length,
      samplePreset: { hours: 7.5, quality: 'Great', dreamType: 'good' },
    },
    {
      id: 'starlight_guardian',
      name: 'Starlight Celestial Guardian',
      subtitle: 'Golden Slumber Guardian',
      tagline: 'Born from deep, expansive slumber over 8 hours.',
      condition: 'Sleep ≥ 8.0 hrs + Good Dream',
      description: 'A luminous entity crowned with golden starlight fleece and deep serene ring eyes. Exerts gentle social cohesion over neighboring sheep.',
      colorSwatch: '#fef08a',
      checkUnlocked: (flock) => flock.some((s) => s.hours >= 8 && s.dreamType === 'good'),
      getMatchingCount: (flock) => flock.filter((s) => s.hours >= 8 && s.dreamType === 'good').length,
      samplePreset: { hours: 9.0, quality: 'Great', dreamType: 'good' },
    },
    {
      id: 'storm_ash',
      name: 'Stormcloud Ash Wanderer',
      subtitle: 'Nocturnal Nightmare Container',
      tagline: 'The brave container of nocturnal nightmares.',
      condition: 'Nightmare Dream',
      description: 'Cloaked in misty silver and volcanic ash wool, contrasting sharply with its black ears and face. Paces cautiously along the meadow perimeter.',
      colorSwatch: '#94a3b8',
      checkUnlocked: (flock) => flock.some((s) => s.dreamType === 'bad'),
      getMatchingCount: (flock) => flock.filter((s) => s.dreamType === 'bad').length,
      samplePreset: { hours: 5.0, quality: 'Poor', dreamType: 'bad' },
    },
    {
      id: 'dewdrop_sage',
      name: 'Dewdrop Meadow Grazer',
      subtitle: 'Sage Mint Grazer',
      tagline: 'Born from quiet, dreamless, restful nights.',
      condition: 'Neutral / Peaceful Dream',
      description: 'Adorned in refreshing mint sage wool. Spends significant time in contemplative grazing, softly bobbing its black muzzle into the green grass.',
      colorSwatch: '#bbf7d0',
      checkUnlocked: (flock) => flock.some((s) => s.dreamType === 'neutral' && s.hours > 3),
      getMatchingCount: (flock) => flock.filter((s) => s.dreamType === 'neutral' && s.hours > 3).length,
      samplePreset: { hours: 7.0, quality: 'Okay', dreamType: 'neutral' },
    },
    {
      id: 'siesta_napling',
      name: 'Siesta Napling',
      subtitle: 'Dainty Restorative Napling',
      tagline: 'Born from short restorative daytime naps.',
      condition: 'Sleep Duration ≤ 3.5 hrs',
      description: 'A dainty, compact miniature sheep with sleepy crescent ring eyes. Ambles gently with shorter strides and loves resting under the afternoon sky.',
      colorSwatch: '#c7d2fe',
      checkUnlocked: (flock) => flock.some((s) => s.hours <= 3.5),
      getMatchingCount: (flock) => flock.filter((s) => s.hours <= 3.5).length,
      samplePreset: { hours: 2.0, quality: 'Okay', dreamType: 'neutral' },
    },
    {
      id: 'sovereign_deep',
      name: 'Grand Somnolent Sovereign',
      subtitle: 'Regal Apricot Slumber Lord',
      tagline: 'The mythical lord of profound healing sleep.',
      condition: 'Sleep Duration ≥ 9.5 hrs + Great Quality',
      description: 'Possesses immense cloud-puff volume, regal apricot-cream wool density, and a deep resonance bleat. A true testament to sublime sleep recovery.',
      colorSwatch: '#fed7aa',
      checkUnlocked: (flock) => flock.some((s) => s.hours >= 9.5 && s.quality === 'Great'),
      getMatchingCount: (flock) => flock.filter((s) => s.hours >= 9.5 && s.quality === 'Great').length,
      samplePreset: { hours: 10.0, quality: 'Great', dreamType: 'good' },
    },
  ];

  const unlockedCount = breeds.filter((b) => b.checkUnlocked(sheepList)).length;
  const undiscoveredCount = breeds.length - unlockedCount;

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
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-bold text-white font-display">
                  {comp.modalTitle}
                </h2>
                <span className="text-xs font-mono font-medium text-amber-300 bg-amber-950/80 border border-amber-500/30 px-2 py-0.5 rounded-full">
                  {comp.discovered} {unlockedCount}/{breeds.length}
                </span>
                {undiscoveredCount > 0 && (
                  <span className="text-xs font-mono font-normal text-slate-400 bg-slate-800/80 border border-slate-700 px-2 py-0.5 rounded-full">
                    {comp.undiscoveredCount.replace('{count}', String(undiscoveredCount))}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {comp.modalSubtitle}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close"
            className="p-2 rounded-xl bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="px-6 pt-3 border-b border-slate-800 bg-slate-950/20 flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTab('compendium')}
            className={`pb-3 px-3 text-xs sm:text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'compendium'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>{comp.tabCompendium}</span>
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
            <span>{comp.tabLab}</span>
          </button>

          <button
            onClick={() => setActiveTab('wordsheep')}
            className={`pb-3 px-3 text-xs sm:text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'wordsheep'
                ? 'border-pink-400 text-pink-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Cloud className="w-4 h-4" />
            <span>{comp.tabWordSheep}</span>
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
            <span>{comp.tabRoster} ({sheepList.length})</span>
          </button>
        </div>

        {/* Tab Contents (Scrollable Area) */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-6">
          
          {/* TAB 1: COMPENDIUM BESTIARY WITH MYSTERY MASKING FOR LOCKED BREEDS */}
          {activeTab === 'compendium' && (
            <div className="space-y-4">
              
              {/* Mystery Guidance Banner */}
              <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between text-xs gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-amber-400 text-sm">✨</span>
                  <span className="text-slate-300 font-medium">
                    {undiscoveredCount > 0
                      ? comp.mysteryBanner.replace('{count}', String(undiscoveredCount))
                      : comp.allDiscoveredBanner}
                  </span>
                </div>
                <span className="font-mono text-cyan-400 font-semibold shrink-0">
                  {unlockedCount} / {breeds.length}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {breeds.map((breed) => {
                  const isUnlocked = breed.checkUnlocked(sheepList);
                  const matchingCount = breed.getMatchingCount(sheepList);
                  const trans = comp.breeds.find((b) => b.id === breed.id);

                  if (isUnlocked) {
                    // --- UNLOCKED PHENOTYPE ---
                    const name = trans?.name || breed.name;
                    const subtitle = trans?.subtitle || breed.subtitle;
                    const tagline = trans?.tagline || breed.tagline;
                    const condition = trans?.condition || breed.condition;
                    const description = trans?.description || breed.description;

                    return (
                      <div
                        key={breed.id}
                        className="p-4 sm:p-5 rounded-2xl border border-slate-800 bg-slate-900 hover:border-slate-700 transition-all flex flex-col justify-between space-y-3 shadow-sm"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            {/* Creature avatar swatch */}
                            <div
                              className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-md border border-white/20 relative shrink-0 overflow-hidden"
                              style={{ backgroundColor: breed.colorSwatch }}
                            >
                              <div className="w-7 h-6 rounded-full bg-[#1c1917] flex items-center justify-center gap-1 shadow-sm">
                                <span className="w-1.5 h-1.5 rounded-full border border-[#fafaf9] inline-block"></span>
                                <span className="w-1.5 h-1.5 rounded-full border border-[#fafaf9] inline-block"></span>
                              </div>
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="text-base font-bold text-white font-display">
                                  {name}
                                </h3>
                                <span className="text-xs text-slate-400 font-mono">
                                  {subtitle}
                                </span>
                              </div>
                              <span className="text-[11px] text-amber-300/90 italic block">
                                "{tagline}"
                              </span>
                            </div>
                          </div>

                          {/* Unlock badge */}
                          <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-400 bg-emerald-950/80 border border-emerald-500/30 px-2 py-0.5 rounded-full shrink-0">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>{matchingCount} {comp.inFlock}</span>
                          </span>
                        </div>

                        <p className="text-xs text-slate-300 leading-relaxed">
                          {description}
                        </p>

                        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                          <div className="text-[11px] text-slate-400">
                            <span className="font-semibold text-slate-300">{comp.conditionLabel} </span>
                            <span>{condition}</span>
                          </div>

                          <button
                            onClick={() => setActiveTab('lab')}
                            className="px-2.5 py-1 rounded-lg bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-500/30 text-cyan-300 text-[11px] font-medium transition-colors"
                          >
                            {comp.testInLab}
                          </button>
                        </div>
                      </div>
                    );
                  }

                  // --- MYSTERIOUS LOCKED PHENOTYPE (Hides exact look, condition, and details) ---
                  return (
                    <div
                      key={breed.id}
                      className="p-4 sm:p-5 rounded-2xl border border-dashed border-slate-800/80 bg-slate-950/70 transition-all flex flex-col justify-between space-y-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          {/* Mystical shadow silhouette */}
                          <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-slate-900/90 border border-slate-800 text-slate-600 relative shrink-0 shadow-inner">
                            <div className="w-7 h-6 rounded-full bg-slate-800/80 flex items-center justify-center text-slate-400 font-bold font-mono text-sm">
                              ?
                            </div>
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-base font-bold text-slate-300 font-display">
                                {comp.mysteryTitle}
                              </h3>
                              <span className="text-xs text-slate-500 font-mono">
                                {comp.mysterySubtitle}
                              </span>
                            </div>
                            <span className="text-[11px] text-slate-500 italic block">
                              "{comp.mysteryTagline}"
                            </span>
                          </div>
                        </div>

                        <span className="flex items-center gap-1 text-[11px] font-mono text-slate-400 bg-slate-900/90 border border-slate-800 px-2.5 py-0.5 rounded-full shrink-0">
                          <Lock className="w-3 h-3 text-slate-500" />
                          <span>{comp.locked}</span>
                        </span>
                      </div>

                      <p className="text-xs text-slate-400 leading-relaxed italic">
                        {comp.mysteryDesc}
                      </p>

                      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                        <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                          <span className="font-semibold text-slate-400">{comp.conditionLabel}</span>
                          <span className="italic text-slate-400 font-sans">{comp.mysteryCondition}</span>
                        </div>

                        <span className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800/60 text-slate-600 text-[11px] font-mono flex items-center gap-1 cursor-default">
                          <Lock className="w-3 h-3" />
                          <span>{comp.locked}</span>
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: LAB SANDBOX */}
          {activeTab === 'lab' && (
            <CreatureLab currentLang={currentLang} />
          )}

          {/* TAB 3: WORD SHEEP (DREAM WORD CLOUD) */}
          {activeTab === 'wordsheep' && (
            <WordSheepCloud
              sheepList={sheepList}
              currentLang={currentLang}
              onSelectSheep={(s) => {
                onSelectSheep(s);
                onClose();
              }}
            />
          )}

          {/* TAB 4: FLOCK ROSTER */}
          {activeTab === 'roster' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400 pb-2 border-b border-slate-800 font-mono">
                <span>{comp.totalSheep} {sheepList.length}</span>
                <span>{comp.clickInspect}</span>
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
                        className="w-10 h-10 rounded-xl flex items-center justify-center border border-white/20 shrink-0"
                        style={{ backgroundColor: s.woolColor }}
                      >
                        <div className="w-6 h-5 rounded-full bg-[#1c1917] flex items-center justify-center gap-1 shadow-sm">
                          <span className="w-1 h-1 rounded-full border border-[#fafaf9] inline-block"></span>
                          <span className="w-1 h-1 rounded-full border border-[#fafaf9] inline-block"></span>
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className="text-sm font-bold text-white font-display">{s.name}</h4>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-medium ${
                            s.gender === 'ram' ? 'bg-amber-500/20 text-amber-300 border border-amber-400/30' : 'bg-pink-500/20 text-pink-300 border border-pink-400/30'
                          }`}>
                            {getGenderLabel(s.gender, currentLang)}
                          </span>
                          {s.personality && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded font-medium bg-slate-800 text-slate-200 border border-slate-700">
                              {getPersonalityLabel(s.personality, currentLang)}
                              {(s.hasRedBowTie || s.personality === '文静' || s.personality === '温顺' || s.personality === '善良') ? ' 🎀' : (s.hasHorns || s.personality === '活泼' || s.personality === '开朗' || s.personality === '暴躁') ? ' 📐' : ' 🌙'}
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                          {s.hours}{currentLang === 'zh' ? '小时' : 'h'} · {getQualityLabel(s.quality, currentLang)} · {getDreamTypeLabel(s.dreamType, currentLang)}
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
