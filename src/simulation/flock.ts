import { DreamType, PersonalityCategory, PersonalityType, SheepCreature, SleepQuality } from '../types/sheep';
// 核心函数 1 —— 性格与特征生成器
// Core Function 1: Personality & Trait Generator
// 根据“梦境类型”，按概率随机分配羊的性格，并决定它是否长角、戴领结等。
// Randomly assigns personality based on "dream type" probabilities, determining horns, bow ties, etc.
export function determinePersonalityAndTraits(
  dreamType: DreamType,
  quality: SleepQuality,
  hours: number,
  gender: 'ram' | 'ewe'
): {
  personality: PersonalityType;
  personalityCategory: PersonalityCategory;
  hasHorns: boolean;
  hasRedBowTie: boolean;
  hasClosedEyes: boolean;
} {
  const rand = Math.random();
  let personality: PersonalityType;
  let personalityCategory: PersonalityCategory;
  
  // 美梦 (Good dream) 的权重：大概率温和文静，小概率活泼，极小概率独立。
  // Probabilities for Good dream: High chance of gentle, low chance of lively, rare independent.
  
  if (dreamType === 'good') {
    // Good dreams: predominantly gentle & serene (55%), or lively & cheerful (35%), rare independent (10%)
    if (rand < 0.22) {
      personality = '文静';
      personalityCategory = 'gentle';
    } else if (rand < 0.40) {
      personality = '温顺';
      personalityCategory = 'gentle';
    } else if (rand < 0.55) {
      personality = '善良';
      personalityCategory = 'gentle';
    } else if (rand < 0.75) {
      personality = '开朗';
      personalityCategory = 'lively';
    } else if (rand < 0.90) {
      personality = '活泼';
      personalityCategory = 'lively';
    } else {
      personality = '独立';
      personalityCategory = 'melancholy';
    }
  //  噩梦 (Bad dream) 的权重：大概率忧郁/暴躁，小概率文静。
  // Probabilities for Bad dream: High chance of melancholic/feisty, low chance of quiet.
  } else if (dreamType === 'bad') {
    // Bad dreams: high chance of melancholic / solitary (50%) and grumpy/feisty (35%), small quiet (15%)
    if (rand < 0.35) {
      personality = '忧郁';
      personalityCategory = 'melancholy';
    } else if (rand < 0.50) {
      personality = '独立';
      personalityCategory = 'melancholy';
    } else if (rand < 0.85) {
      personality = '暴躁';
      personalityCategory = 'lively';
    } else {
      personality = '文静';
      personalityCategory = 'gentle';
    }
  } else {
      //平静梦 (Neutral) 的权重：分布非常均匀。
  // Probabilities for Neutral dream: Balanced distribution.
    if (rand < 0.18) {
      personality = '温顺';
      personalityCategory = 'gentle';
    } else if (rand < 0.36) {
      personality = '文静';
      personalityCategory = 'gentle';
    } else if (rand < 0.50) {
      personality = '善良';
      personalityCategory = 'gentle';
    } else if (rand < 0.68) {
      personality = '活泼';
      personalityCategory = 'lively';
    } else if (rand < 0.84) {
      personality = '开朗';
      personalityCategory = 'lively';
    } else if (rand < 0.92) {
      personality = '独立';
      personalityCategory = 'melancholy';
    } else {
      personality = '忧郁';
      personalityCategory = 'melancholy';
    }
  }

  // Visual trait mapping:
  // 1. Horns: 活泼, 开朗, 暴躁 (活力/激越类) have two short black triangular cone horns!
  // Also rams with 独立 personality have short black cone horns.
  const hasHorns =
    personality === '活泼' ||
    personality === '开朗' ||
    personality === '暴躁' ||
    (personality === '独立' && gender === 'ram');

  // 2. Red Bow Tie: 文静 has red bow tie! Also 温顺 and 善良 wear cute bow ties.
  const hasRedBowTie =
    personality === '文静' ||
    personality === '温顺' ||
    personality === '善良';

  // 3. Closed Eyes: 忧郁 has eyes closed in serene reverie!
  const hasClosedEyes = personality === '忧郁';

  return {
    personality,
    personalityCategory,
    hasHorns,
    hasRedBowTie,
    hasClosedEyes,
  };
}
// =====================================================================
// 核心函数 2 —— 睡眠数据到生物形态的映射器
// Core Function 2: Sleep Data to Creature Morphology Mapper
// 这是把冷冰冰的输入（时长、质量、梦境）变成一只具象化的小羊的“造物主”函数。
// This is the "Creator" function that turns cold input into a tangible sheep.
// =====================================================================
export function generateCreatureAttributes(
  name: string,
  date: string,
  hours: number,
  quality: SleepQuality,
  dreamType: DreamType,
  diary: string,
  id: number,
  isSample = false,
  canvasWidth = 900,
  canvasHeight = 600
): SheepCreature {
  // Base size based on quality & hours
  let baseSize = 34;
  let puffCount = 10;
  let energy = 0.6;
  let maxSpeed = 1.1;
  let eyeStyle: 'awake' | 'sleepy' | 'serene' = 'serene';

  if (quality === 'Great') {
    baseSize = 42 + Math.random() * 6;
    puffCount = 12;
    energy = 0.85 + Math.random() * 0.15;
    maxSpeed = 1.4 + Math.random() * 0.4;
    eyeStyle = 'awake';
  } else if (quality === 'Poor') {
    baseSize = 25 + Math.random() * 5;
    puffCount = 8;
    energy = 0.25 + Math.random() * 0.2;
    maxSpeed = 0.75 + Math.random() * 0.25;
    eyeStyle = 'sleepy';
  } else {
    baseSize = 33 + Math.random() * 5;
    puffCount = 10;
    energy = 0.55 + Math.random() * 0.2;
    maxSpeed = 1.05 + Math.random() * 0.3;
    eyeStyle = 'serene';
  }

  // Duration modifier (longer sleep = slightly rounder wool)
  const durationScale = Math.min(1.25, Math.max(0.8, 0.82 + (hours * 0.035)));
  const finalSize = baseSize * durationScale;

  // Wool colors based on dream type
  let woolColor = '#f5f5f4';
  let woolSecondaryColor = '#e7e5e4';
  let auraGlow = false;

  if (dreamType === 'good') {
    const goodPalettes = [
      { primary: '#fbcfe8', secondary: '#f472b6' }, // Candy Pink
      { primary: '#fef08a', secondary: '#facc15' }, // Starlight Yellow
      { primary: '#bae6fd', secondary: '#38bdf8' }, // Sky Cyan
      { primary: '#e9d5ff', secondary: '#c084fc' }, // Dream Lilac
      { primary: '#fed7aa', secondary: '#fb923c' }, // Warm Apricot
    ];
    const picked = goodPalettes[Math.floor(Math.random() * goodPalettes.length)];
    woolColor = picked.primary;
    woolSecondaryColor = picked.secondary;
    auraGlow = true;
  } else if (dreamType === 'bad') {
    const badPalettes = [
      { primary: '#94a3b8', secondary: '#64748b' }, // Lightened Storm Slate
      { primary: '#a8a29e', secondary: '#78716c' }, // Lightened Volcanic Ash
      { primary: '#cbd5e1', secondary: '#94a3b8' }, // Misty Silver Cloud
      { primary: '#a1a1aa', secondary: '#71717a' }, // Smoky Moon Mist
    ];
    const picked = badPalettes[Math.floor(Math.random() * badPalettes.length)];
    woolColor = picked.primary;
    woolSecondaryColor = picked.secondary;
    auraGlow = false;
  } else {
    // Neutral
    const neutralPalettes = [
      { primary: '#bbf7d0', secondary: '#86efac' }, // Mint Dew
      { primary: '#c7d2fe', secondary: '#a5b4fc' }, // Lavender Mist
      { primary: '#fed7aa', secondary: '#ffedd5' }, // Cream Oatmeal
      { primary: '#e2e8f0', secondary: '#cbd5e1' }, // Cloud Silk
    ];
    const picked = neutralPalettes[Math.floor(Math.random() * neutralPalettes.length)];
    woolColor = picked.primary;
    woolSecondaryColor = picked.secondary;
    auraGlow = false;
  }

  // Gender: Ram (公羊) or Ewe (母羊)
  const gender: 'ram' | 'ewe' = Math.random() > 0.5 ? 'ram' : 'ewe';
  
  // 调用上面的函数，获取性格和外观特征 / Call the function above to get personality and visual traits
  // Determine personality & visual distinctions according to dream quality
  const {
    personality,
    personalityCategory,
    hasHorns,
    hasRedBowTie,
    hasClosedEyes,
  } = determinePersonalityAndTraits(dreamType, quality, hours, gender);

  // Behavioral dynamics modulated by personality
  if (personality === '活泼') {
    energy = Math.min(1.0, energy + 0.18);
    maxSpeed += 0.25;
  } else if (personality === '暴躁') {
    energy = Math.min(1.0, energy + 0.12);
    maxSpeed += 0.18;
  } else if (personality === '文静' || personality === '温顺') {
    energy = Math.max(0.35, energy - 0.1);
    maxSpeed = Math.max(0.8, maxSpeed - 0.15);
  } else if (personality === '忧郁') {
    energy = Math.max(0.25, energy - 0.15);
    maxSpeed = Math.max(0.7, maxSpeed - 0.2);
    eyeStyle = 'sleepy';
  }

  // HornType indicator for backward compatibility: all horns are now short black triangular cones
  const hornType: 'none' | 'small' | 'spiral' = hasHorns ? 'small' : 'none';

  const spawnY = canvasHeight * 0.65 + Math.random() * (canvasHeight * 0.28);
  const spawnX = 80 + Math.random() * (canvasWidth - 160);

  return {
    id,
    name,
    date,
    hours,
    quality,
    dreamType,
    diary,
    isSample,
    gender,
    personality,
    personalityCategory,
    hasHorns,
    hasRedBowTie,
    hasClosedEyes,
    size: finalSize,
    woolColor,
    woolSecondaryColor,
    puffCount,
    eyeStyle,
    hornType,
    auraGlow,
    x: spawnX,
    y: spawnY,
    vx: (Math.random() - 0.5) * 0.8,
    vy: (Math.random() - 0.5) * 0.4,
    facing: Math.random() > 0.5 ? 1 : -1,
    legPhase: Math.random() * Math.PI * 2,
    wanderAngle: Math.random() * Math.PI * 2,
    maxSpeed,
    energy,
    isGrazing: false,
    grazingTimer: 0,
    isSleeping: false,
    sleepTimer: 0,
    lastSnoreTime: 0,
    lastPetTime: 0,
    socialAction: null,
    socialTimer: 0,
    socialDuration: 0,
    socialPartnerId: null,
    lastSocialTime: Date.now() + Math.random() * 6000,
    scratchType: null,
    scratchTimer: 0,
    lastScratchTime: Date.now() + Math.random() * 4000,
    jumpY: 0,
    headbuttOffset: 0,
  };
}

/**
 * Craig Reynolds Steering Behaviors update for flock of sheep
 */
// =====================================================================
// 核心函数 3 —— 羊群物理与行为更新引擎
// Core Function 3: Flock Physics & Behavior Update Engine
// 这个函数每一帧都会被调用，负责计算所有羊的位置、状态和交互。
// This function is called every frame, calculating all sheep's positions, states, and interactions.
// =====================================================================
export function updateFlock(
  sheep: SheepCreature[],
  width: number,
  height: number,
  targetPoint: { x: number; y: number } | null
) {
  const groundTop = height * 0.62;
  const groundBottom = height - 50;
  
 // 遍历每一只羊 / Loop through every sheep
  for (let i = 0; i < sheep.length; i++) {
    const s = sheep[i];

    // Bell summon wakes sleeping sheep immediately
    if (targetPoint && s.isSleeping) {
      s.isSleeping = false;
      s.sleepTimer = 0;
    }
    
// 【状态机 1：睡眠状态】 / [State Machine 1: Sleeping State]
    
    // 1. Sleeping / Snoozing state
    if (s.sleepTimer > 0) {
      s.sleepTimer--;
      s.isSleeping = true;
      s.isGrazing = false;
      s.vx *= 0.75; // 逐渐减速停下 / Decelerate to a stop
      s.vy *= 0.75;
      s.x += s.vx;
      s.y += s.vy;
      continue;// 跳过后续的移动逻辑 / Skip subsequent movement logic
    } else {
      s.isSleeping = false;
    }
    
    // 【状态机 2：吃草状态】 / [State Machine 2: Grazing State]
    // 2. Grazing logic: sheep stops to munch on grass
    if (s.grazingTimer > 0) {
      s.grazingTimer--;
      s.vx *= 0.85;
      s.vy *= 0.85;
      s.x += s.vx;
      s.y += s.vy;
      s.isGrazing = true;
      continue;
    } else {
      s.isGrazing = false;
    }
    
    // 【状态机 3：社交互动状态（顶角或跳跃）】 / [State Machine 3: Social Interaction (Headbutt or Hop)]
    // 3. Social Interaction state (Headbutting or Play Hop)
    if (s.socialTimer && s.socialTimer > 0) {
      s.socialTimer--;
      const duration = s.socialDuration || 52;
      const progress = 1 - s.socialTimer / duration;

      if (s.socialAction === 'headbutt') {
         // 【批注 / Annotation】: 顶角动画分为四个阶段：蓄力后拉 -> 猛冲 -> 撞击 -> 反弹。
        // Headbutt animation has 4 phases: windup -> charge -> bonk -> recoil.
        if (progress < 0.32) {
          const t = progress / 0.32;
          s.headbuttOffset = -t * 6; // 后拉 / Windup
        } else if (progress < 0.52) {
          const t = (progress - 0.32) / 0.2;
          s.headbuttOffset = -6 + t * 16;// 猛冲 / Charge
        } else {
          const t = (progress - 0.52) / 0.48;
          s.headbuttOffset = 10 * (1 - t * 0.85);// 反弹 / Recoil
        }
      } else if (s.socialAction === 'hop') {
         // 【批注 / Annotation】: 跳跃动画使用正弦波实现平滑的抛物线。
        // Hop animation uses a sine wave for a smooth parabolic arc.
        // Joyful play bounce arc
        s.jumpY = -Math.sin(progress * Math.PI) * 16;
      }

      s.vx *= 0.6;
      s.vy *= 0.6;
      s.x += s.vx;
      s.y += s.vy;

      if (s.socialTimer <= 0) {
        s.socialAction = null;
        s.socialPartnerId = null;
        s.jumpY = 0;
        s.headbuttOffset = 0;
        s.lastSocialTime = Date.now();
      }
      continue;
    }

    // 【状态机 4：日常小动作（扑耳、晃头）】 / [State Machine 4: Idle Scratch / Ear Flutter / Head Shake]
    if (s.scratchTimer && s.scratchTimer > 0) {
      s.scratchTimer--;
      s.vx *= 0.75;
      s.vy *= 0.75;
      s.x += s.vx;
      s.y += s.vy;
      if (s.scratchTimer <= 0) {
        s.scratchType = null;
        s.lastScratchTime = Date.now();
      }
      continue;
    }

    const now = Date.now();

    // 【批注 / Annotation】: 随机触发机制。如果当前没有在向目标移动，羊会随机做小动作。
    // Random triggering mechanism. If not moving to a target, sheep will randomly perform actions.
    if (!targetPoint) {
      // Chance to start grazing on the sweet grass
      if (Math.random() < 0.0028) {
        s.grazingTimer = 100 + Math.floor(Math.random() * 140);
        s.isGrazing = true;
        continue;
      }

      // 【批注 / Annotation】: 睡眠质量越差（Poor）的羊，随机打盹的概率越高。
      // Sheep with Poor sleep quality have a higher chance of randomly napping.
      const napChance = s.quality === 'Poor' ? 0.0032 : s.quality === 'Okay' ? 0.0018 : 0.001;
      if (Math.random() < napChance) {
        s.sleepTimer = 200 + Math.floor(Math.random() * 220);
        s.isSleeping = true;
        continue;
      }

       // 随机扑耳/晃头 / Random ear flutter or head shake
      if (now - (s.lastScratchTime || 0) > 6500 && Math.random() < 0.006) {
        s.scratchType = Math.random() > 0.4 ? 'ear_flutter' : 'head_shake';
        s.scratchTimer = 35 + Math.floor(Math.random() * 25);
        s.lastScratchTime = now;
        continue;
      }

      // 【批注 / Annotation】: 社交检测。当两只羊距离在 36 到 72 像素之间，有概率触发互动。
      // Social encounter check. If two sheep are between 36 and 72 pixels apart, they might interact.
      if (now - (s.lastSocialTime || 0) > 9000) {
        for (let j = 0; j < sheep.length; j++) {
          if (i === j) continue;
          const other = sheep[j];
          if (
            !other.isSleeping &&
            !other.isGrazing &&
            !other.socialAction &&
            (!other.scratchTimer || other.scratchTimer <= 0) &&
            now - (other.lastSocialTime || 0) > 9000
          ) {
            const dx = other.x - s.x;
            const dy = other.y - s.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            // Proximity range for friendly interaction
            if (dist > 36 && dist < 72 && Math.random() < 0.045) {
              s.facing = s.x <= other.x ? 1 : -1;
              other.facing = (s.facing === 1 ? -1 : 1);
              
 // 性格决定互动方式。暴躁的羊大概率顶角，活泼的羊大概率跳跃。
 // Personality dictates interaction. Feisty sheep likely headbutt, playful sheep likely hop.
              let action: 'headbutt' | 'hop';
              if (s.personality === '暴躁' || other.personality === '暴躁') {
                action = Math.random() > 0.2 ? 'headbutt' : 'hop';
              } else if (s.personality === '活泼' || other.personality === '活泼' || s.personality === '开朗') {
                action = Math.random() > 0.25 ? 'hop' : 'headbutt';
              } else if (s.gender === 'ram' && other.gender === 'ram') { // 两只公羊大概率顶角 / Two rams likely headbutt
                action = Math.random() > 0.25 ? 'headbutt' : 'hop';
              } else {
                action = Math.random() > 0.35 ? 'hop' : 'headbutt';
              }
              
// 同步两只羊的动画状态 / Sync animation states for both sheep
              const dur = action === 'headbutt' ? 52 : 44;
              s.socialAction = action;
              s.socialTimer = dur;
              s.socialDuration = dur;
              s.socialPartnerId = other.id;

              other.socialAction = action;
              other.socialTimer = dur;
              other.socialDuration = dur;
              other.socialPartnerId = s.id;
              break;
            }
          }
        }
      }
    }
    
    // =================================================================
    // 物理引擎开始。累加所有受力（加速度）。
    // Physics Engine starts. Accumulate all forces (accelerations).
    // =================================================================
    let ax = 0;
    let ay = 0;
    // 1. 游走力（Wander） / Wander Force
    // 布朗运动。让羊在没有目标时，看起来像是在漫无目的地闲逛。
    // Brownian drift. Makes sheep look like they are wandering aimlessly when no target.
    s.wanderAngle += (Math.random() - 0.5) * 0.25;
    const wanderForce = 0.07 * s.energy;
    ax += Math.cos(s.wanderAngle) * wanderForce;
    ay += Math.sin(s.wanderAngle) * (wanderForce * 0.6); // Less vertical drift

    // 2. Craig Reynolds 的分离 (Separation) 与 聚集 (Cohesion)。
    //Craig Reynolds' Separation & Cohesion.
    let sepX = 0;
    let sepY = 0;
    let cohX = 0;
    let cohY = 0;
    let neighbors = 0;

    for (let j = 0; j < sheep.length; j++) {
      if (i === j) continue;
      const other = sheep[j];
      const dx = s.x - other.x;
      const dy = s.y - other.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const desiredSeparation = s.size + other.size + 14; // 安全距离 / Safe distance

      // 分离力（防重叠） / Separation force (anti-overlap)
      if (dist > 0 && dist < desiredSeparation) {
        // Strong separation repulsion
        const force = (desiredSeparation - dist) / desiredSeparation;
        sepX += (dx / dist) * force * 0.25;
        sepY += (dy / dist) * force * 0.25;
      }
      
// 寻找邻居（用于聚集） / Find neighbors (for cohesion)
      if (dist > 0 && dist < 220) {
        cohX += other.x;
        cohY += other.y;
        neighbors++;
      }
    }

    ax += sepX;
    ay += sepY;

    // Weak flock cohesion
    if (neighbors > 0) {
      cohX /= neighbors;
      cohY /= neighbors;
      const cdx = cohX - s.x;
      const cdy = cohY - s.y;
      const cdist = Math.sqrt(cdx * cdx + cdy * cdy);
      if (cdist > 100) {
        ax += (cdx / cdist) * 0.015;
        ay += (cdy / cdist) * 0.01;
      }
    }

    // 3. 目标吸引（双击草地后的草料） / Target seeking (clover after double-click)
    if (targetPoint) {
      const tx = targetPoint.x - s.x;
      const ty = targetPoint.y - s.y;
      const tdist = Math.sqrt(tx * tx + ty * ty);

      if (tdist > 40) {
        const seekSpeed = Math.min(0.35, 0.05 + (tdist / 400) * 0.2);
        ax += (tx / tdist) * seekSpeed;
        ay += (ty / tdist) * seekSpeed;
      } else if (tdist < 30) {
        // Gentle slowdown around clover
        ax -= (tx / tdist) * 0.04;
        ay -= (ty / tdist) * 0.04;
      }
    }

    // 4. 边界避让（羊不能走到天上去） / Boundary avoidance (sheep cannot walk into the sky)
    const margin = 40;
    if (s.x < margin) ax += 0.35;
    if (s.x > width - margin) ax -= 0.35;
    if (s.y < groundTop + 15) ay += 0.35;
    if (s.y > groundBottom - 10) ay -= 0.35;

    // Apply acceleration
    s.vx += ax;
    s.vy += ay;

    // Limit speed
    const currentSpeed = Math.sqrt(s.vx * s.vx + s.vy * s.vy);
    const speedLimit = targetPoint ? s.maxSpeed * 1.5 : s.maxSpeed;
    if (currentSpeed > speedLimit) {
      s.vx = (s.vx / currentSpeed) * speedLimit;
      s.vy = (s.vy / currentSpeed) * speedLimit;
    }

    // Update position
    s.x += s.vx;
    s.y += s.vy;

    // Hard boundary safety clamp (ensures sheep never disappear off-screen)
    if (s.x < 35) {
      s.x = 35;
      s.vx = Math.abs(s.vx) * 0.5;
    }
    if (s.x > width - 35) {
      s.x = width - 35;
      s.vx = -Math.abs(s.vx) * 0.5;
    }
    if (s.y < groundTop + 10) {
      s.y = groundTop + 10;
      s.vy = Math.abs(s.vy) * 0.5;
    }
    if (s.y > groundBottom) {
      s.y = groundBottom;
      s.vy = -Math.abs(s.vy) * 0.5;
    }

    // Facing direction
    if (s.vx > 0.08) s.facing = 1;
    else if (s.vx < -0.08) s.facing = -1;

    // Leg animation phase
    s.legPhase += currentSpeed * 0.18;
  }
}
