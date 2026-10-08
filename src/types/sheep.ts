export type DreamType = 'good' | 'bad' | 'neutral';
export type SleepQuality = 'Great' | 'Okay' | 'Poor';

export interface SheepCreature {
  id: number;
  name: string;
  date: string;
  hours: number;
  quality: SleepQuality;
  dreamType: DreamType;
  diary: string;
  isSample?: boolean;
  
  // Biological & Morphological Attributes
  size: number;
  woolColor: string;
  woolSecondaryColor: string;
  puffCount: number;
  eyeStyle: 'awake' | 'sleepy' | 'serene';
  hornType?: 'none' | 'small' | 'spiral';
  auraGlow: boolean;
  
  // Physics & Simulation State
  x: number;
  y: number;
  vx: number;
  vy: number;
  facing: 1 | -1;
  legPhase: number;
  wanderAngle: number;
  maxSpeed: number;
  energy: number; // 0 to 1
  isGrazing: boolean;
  grazingTimer: number;
  lastPetTime: number;
}

export interface DreamFodder {
  x: number;
  y: number;
  createdTime: number;
  life: number;
}

export interface AmbientParticle {
  x: number;
  y: number;
  baseY: number;
  size: number;
  alpha: number;
  phase: number;
  speed: number;
}
