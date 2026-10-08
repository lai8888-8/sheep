import { DreamType, SheepCreature, SleepQuality } from '../types/sheep';

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
      { primary: '#64748b', secondary: '#475569' }, // Storm Slate
      { primary: '#78716c', secondary: '#57534e' }, // Volcanic Ash
      { primary: '#475569', secondary: '#334155' }, // Deep Twilight
      { primary: '#52525b', secondary: '#3f3f46' }, // Charcoal Mist
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

  // Horns for long sleepers
  let hornType: 'none' | 'small' | 'spiral' = 'none';
  if (hours >= 8.5) {
    hornType = Math.random() > 0.4 ? 'spiral' : 'small';
  } else if (hours >= 7.0 && Math.random() > 0.6) {
    hornType = 'small';
  }

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
    lastPetTime: 0,
  };
}

/**
 * Craig Reynolds Steering Behaviors update for flock of sheep
 */
export function updateFlock(
  sheep: SheepCreature[],
  width: number,
  height: number,
  targetPoint: { x: number; y: number } | null
) {
  const groundTop = height * 0.62;
  const groundBottom = height - 50;

  for (let i = 0; i < sheep.length; i++) {
    const s = sheep[i];

    // Grazing logic: sheep occasionally stops to munch on grass
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
      // 0.2% chance to begin grazing if not running towards a target
      if (!targetPoint && Math.random() < 0.0025) {
        s.grazingTimer = 90 + Math.floor(Math.random() * 140);
        continue;
      }
    }

    let ax = 0;
    let ay = 0;

    // 1. Wander behavior (smooth angular Brownian drift)
    s.wanderAngle += (Math.random() - 0.5) * 0.25;
    const wanderForce = 0.07 * s.energy;
    ax += Math.cos(s.wanderAngle) * wanderForce;
    ay += Math.sin(s.wanderAngle) * (wanderForce * 0.6); // Less vertical drift

    // 2. Craig Reynolds Separation & Cohesion
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
      const desiredSeparation = s.size + other.size + 14;

      if (dist > 0 && dist < desiredSeparation) {
        // Strong separation repulsion
        const force = (desiredSeparation - dist) / desiredSeparation;
        sepX += (dx / dist) * force * 0.25;
        sepY += (dy / dist) * force * 0.25;
      }

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

    // 3. Target seeking (Dream clover / Bell summon)
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

    // 4. Boundary avoidance and hard clamping
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
