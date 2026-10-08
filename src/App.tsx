import React, { useState, useEffect } from 'react';
import { SheepCreature, SleepQuality, DreamType } from './types/sheep';
import { generateCreatureAttributes } from './simulation/flock';
import { soundEngine } from './audio/synth';
import { Navigation } from './components/Navigation';
import { FarmCanvas } from './simulation/FarmCanvas';
import { FloatingSleepForm } from './components/FloatingSleepForm';
import { SheepDiaryModal } from './components/SheepDiaryModal';
import { CompendiumModal } from './components/CompendiumModal';

const INITIAL_DEMO_SHEEP: Array<{
  name: string;
  date: string;
  hours: number;
  quality: SleepQuality;
  dreamType: DreamType;
  diary: string;
}> = [
  {
    name: 'Cloudy',
    date: '2026-10-05',
    hours: 7.5,
    quality: 'Great',
    dreamType: 'good',
    diary: 'Flew on a soft glowing cloud above a starlit lake.',
  },
  {
    name: 'Ash',
    date: '2026-10-06',
    hours: 5.0,
    quality: 'Poor',
    dreamType: 'bad',
    diary: 'Got chased through endless shadowy corridors in a dream storm.',
  },
  {
    name: 'Celeste',
    date: '2026-10-06',
    hours: 8.5,
    quality: 'Great',
    dreamType: 'good',
    diary: 'Stood under an emerald aurora and listened to soft glass wind chimes.',
  },
  {
    name: 'Meadow',
    date: '2026-10-07',
    hours: 6.5,
    quality: 'Okay',
    dreamType: 'neutral',
    diary: 'Sat peacefully beside a bubbling forest stream as morning mist cleared.',
  },
];

export default function App() {
  const [timeOfDay, setTimeOfDay] = useState<'night' | 'twilight' | 'dawn'>('night');
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isCompendiumOpen, setIsCompendiumOpen] = useState(false);
  const [selectedSheep, setSelectedSheep] = useState<SheepCreature | null>(null);

  // Initialize flock with localStorage persistence
  const [sheep, setSheep] = useState<SheepCreature[]>(() => {
    try {
      const saved = localStorage.getItem('sleep_farm_sheep_data_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // Ignore
    }

    // Default sample flock
    return INITIAL_DEMO_SHEEP.map((s, idx) =>
      generateCreatureAttributes(s.name, s.date, s.hours, s.quality, s.dreamType, s.diary, idx + 1, true)
    );
  });

  // Save sheep to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('sleep_farm_sheep_data_v2', JSON.stringify(sheep));
    } catch {
      // Ignore
    }
  }, [sheep]);

  // Audio toggle
  const handleToggleAudio = () => {
    const nextMuted = !isAudioMuted;
    setIsAudioMuted(nextMuted);
    soundEngine.setMuted(nextMuted);

    if (!nextMuted && !soundEngine.getIsAmbienceRunning()) {
      soundEngine.startNightAmbience();
    }
  };

  // Ring pasture summon bell
  const handleRingBell = () => {
    soundEngine.playBellChime();
    soundEngine.playBleat(1.0);
  };

  // Add new sheep from form
  const handleAddSheep = (data: {
    name: string;
    date: string;
    hours: number;
    quality: SleepQuality;
    dreamType: DreamType;
    diary: string;
  }) => {
    const nextId = sheep.length > 0 ? Math.max(...sheep.map((s) => s.id)) + 1 : 1;
    const newSheep = generateCreatureAttributes(
      data.name,
      data.date,
      data.hours,
      data.quality,
      data.dreamType,
      data.diary,
      nextId,
      false
    );

    setSheep((prev) => [...prev, newSheep]);

    // Audio confirmation
    soundEngine.playBellChime();
    setTimeout(() => {
      soundEngine.playBleat(newSheep.quality === 'Poor' ? 1.2 : newSheep.quality === 'Great' ? 0.95 : 1.05);
    }, 200);
  };

  // Pet sheep action
  const handlePetSheep = (s: SheepCreature) => {
    setSheep((prev) =>
      prev.map((item) =>
        item.id === s.id
          ? {
              ...item,
              lastPetTime: Date.now(),
              energy: Math.min(1.0, item.energy + 0.15),
            }
          : item
      )
    );
  };

  // Reset to initial demo flock
  const handleResetDemo = () => {
    const defaults = INITIAL_DEMO_SHEEP.map((s, idx) =>
      generateCreatureAttributes(s.name, s.date, s.hours, s.quality, s.dreamType, s.diary, idx + 1, true)
    );
    setSheep(defaults);
    try {
      localStorage.removeItem('sleep_farm_sheep_data_v2');
    } catch {
      // Ignore
    }
    soundEngine.playBellChime();
  };

  const todayStr = new Date().toISOString().slice(0, 10);
  const todayCount = sheep.filter((s) => s.date === todayStr && !s.isSample).length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans select-none">
      
      {/* Top Navigation Bar */}
      <Navigation
        isAudioMuted={isAudioMuted}
        onToggleAudio={handleToggleAudio}
        onOpenCompendium={() => setIsCompendiumOpen(true)}
        onRingBell={handleRingBell}
        onResetDemo={handleResetDemo}
        timeOfDay={timeOfDay}
        onChangeTimeOfDay={setTimeOfDay}
        flockCount={sheep.length}
      />

      {/* Main Single-Page Stage */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-5 flex flex-col">
        <div className="relative w-full flex-1 flex flex-col">
          
          {/* Farm Meadow Canvas */}
          <FarmCanvas
            sheep={sheep}
            onSelectSheep={(s) => setSelectedSheep(s)}
            timeOfDay={timeOfDay}
          />

          {/* On-Canvas Floating Sleep Form (Exact p5.js UX) */}
          <FloatingSleepForm
            onSubmit={handleAddSheep}
            todayCount={todayCount}
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-900 py-3 px-6 text-center text-xs text-slate-500 font-mono">
        Sleep Farm · Virtual Creature · Code as Creative Medium (Golan Levin & Tega Brain)
      </footer>

      {/* Sheep Diary & Details Modal */}
      <SheepDiaryModal
        sheep={selectedSheep}
        onClose={() => setSelectedSheep(null)}
        onPet={handlePetSheep}
      />

      {/* Sheep Collection Compendium & Genetics Modal */}
      <CompendiumModal
        isOpen={isCompendiumOpen}
        onClose={() => setIsCompendiumOpen(false)}
        sheepList={sheep}
        onSelectSheep={(s) => setSelectedSheep(s)}
      />
    </div>
  );
}
