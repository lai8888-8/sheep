export type DreamType = 'good' | 'bad' | 'neutral';
export type SleepQuality = 'Great' | 'Okay' | 'Poor';
export type TimeOfDay = 'day' | 'dawn' | 'twilight' | 'night';

export type PersonalityCategory = 'gentle' | 'lively' | 'melancholy';

export type PersonalityType =
  // 温和/善意类
  | '温顺'
  | '文静'
  | '善良'
  // 活力/激越类
  | '活泼'
  | '开朗'
  | '暴躁'
  // 忧郁/独处类
  | '忧郁'
  | '独立';

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
  gender: 'ram' | 'ewe'; // Ram (公羊) or Ewe (母羊)
  personality: PersonalityType;
  personalityCategory: PersonalityCategory;
  hasHorns: boolean; // Two short black triangular cone horns (短小的两个黑色三角锥)
  hasRedBowTie: boolean; // Cute red ribbon bow tie on chest (红色领结)
  hasClosedEyes: boolean; // Closed contemplative/sleepy eyes (眼睛是闭着的)
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
  isSleeping: boolean;
  sleepTimer: number;
  lastSnoreTime: number;
  lastPetTime: number;

  // Social & Idle Behavior State
  socialAction?: 'headbutt' | 'hop' | null;
  socialTimer?: number;
  socialDuration?: number;
  socialPartnerId?: number | null;
  lastSocialTime?: number;
  scratchType?: 'ear_flutter' | 'head_shake' | 'scratch' | null;
  scratchTimer?: number;
  lastScratchTime?: number;
  jumpY?: number;
  headbuttOffset?: number;
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
