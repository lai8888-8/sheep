import React, { useEffect, useRef, useState } from 'react';
import { AmbientParticle, DreamFodder, SheepCreature, TimeOfDay } from '../types/sheep';
import { updateFlock } from './flock';
import { soundEngine, getSheepBleatConfig } from '../audio/synth';

interface FarmCanvasProps {
  sheep: SheepCreature[];
  onSelectSheep: (sheep: SheepCreature) => void;
  timeOfDay: TimeOfDay;
  showDebugForces?: boolean;
}

export const FarmCanvas: React.FC<FarmCanvasProps> = ({
  sheep,
  onSelectSheep,
  timeOfDay,
  showDebugForces = false,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const [hoveredSheepId, setHoveredSheepId] = useState<number | null>(null);
  const [fodder, setFodder] = useState<DreamFodder | null>(null);

  const starsRef = useRef<Array<{ x: number; y: number; r: number; baseA: number; speed: number }>>([]);
  const cloudsRef = useRef<Array<{
    x: number;
    y: number;
    speed: number;
    scale: number;
    opacity: number;
    puffs: Array<{ dx: number; dy: number; rx: number; ry: number }>;
  }>>([
    {
      x: 60,
      y: 42,
      speed: 0.22,
      scale: 1.1,
      opacity: 0.95,
      puffs: [
        { dx: 0, dy: 0, rx: 48, ry: 22 },
        { dx: -28, dy: 6, rx: 32, ry: 18 },
        { dx: 28, dy: 5, rx: 34, ry: 19 },
        { dx: -12, dy: -12, rx: 26, ry: 18 },
        { dx: 14, dy: -10, rx: 28, ry: 17 },
      ],
    },
    {
      x: 340,
      y: 85,
      speed: 0.16,
      scale: 1.25,
      opacity: 0.98,
      puffs: [
        { dx: 0, dy: 0, rx: 60, ry: 26 },
        { dx: -40, dy: 7, rx: 38, ry: 20 },
        { dx: 38, dy: 5, rx: 42, ry: 22 },
        { dx: -18, dy: -14, rx: 34, ry: 20 },
        { dx: 20, dy: -12, rx: 32, ry: 20 },
      ],
    },
    {
      x: 680,
      y: 38,
      speed: 0.26,
      scale: 0.95,
      opacity: 0.92,
      puffs: [
        { dx: 0, dy: 0, rx: 42, ry: 20 },
        { dx: -24, dy: 5, rx: 28, ry: 16 },
        { dx: 26, dy: 4, rx: 30, ry: 17 },
        { dx: -10, dy: -10, rx: 22, ry: 15 },
        { dx: 10, dy: -8, rx: 24, ry: 16 },
      ],
    },
    {
      x: 210,
      y: 135,
      speed: 0.12,
      scale: 0.85,
      opacity: 0.84,
      puffs: [
        { dx: 0, dy: 0, rx: 36, ry: 16 },
        { dx: -22, dy: 4, rx: 24, ry: 13 },
        { dx: 22, dy: 3, rx: 26, ry: 14 },
        { dx: -8, dy: -8, rx: 20, ry: 13 },
      ],
    },
    {
      x: 880,
      y: 110,
      speed: 0.2,
      scale: 1.15,
      opacity: 0.94,
      puffs: [
        { dx: 0, dy: 0, rx: 52, ry: 24 },
        { dx: -34, dy: 6, rx: 34, ry: 18 },
        { dx: 34, dy: 4, rx: 36, ry: 19 },
        { dx: -14, dy: -12, rx: 28, ry: 17 },
        { dx: 14, dy: -10, rx: 28, ry: 17 },
      ],
    },
  ]);
  const firefliesRef = useRef<AmbientParticle[]>([]);
  const grassBladesRef = useRef<Array<{ x: number; h: number; swayOffset: number; color: string }>>([]);
  const grassCrumbsRef = useRef<Array<{ x: number; y: number; vx: number; vy: number; life: number; color: string; size: number }>>([]);
  const snoreParticlesRef = useRef<Array<{ x: number; y: number; vx: number; vy: number; life: number; text: string; size: number; phase: number }>>([]);
  const petHeartsRef = useRef<Array<{
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    life: number;
    decay: number;
    wobblePhase: number;
    wobbleSpeed: number;
    color: string;
    hasShine: boolean;
  }>>([]);
  const moodBubblesRef = useRef<Array<{
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    life: number;
    decay: number;
    wobblePhase: number;
    wobbleSpeed: number;
    symbol: string;
    color: string;
  }>>([]);
  const bonkSparksRef = useRef<Array<{
    x: number;
    y: number;
    vx: number;
    vy: number;
    life: number;
    color: string;
    size: number;
  }>>([]);

  const lastClickRef = useRef<number>(0);

  // Initialize stars and fireflies once
  useEffect(() => {
    const stars = [];
    for (let i = 0; i < 120; i++) {
      stars.push({
        x: Math.random(),
        y: Math.random() * 0.58,
        r: 0.8 + Math.random() * 1.6,
        baseA: 0.3 + Math.random() * 0.7,
        speed: 1.5 + Math.random() * 3.5,
      });
    }
    starsRef.current = stars;

    const fireflies: AmbientParticle[] = [];
    for (let i = 0; i < 20; i++) {
      fireflies.push({
        x: Math.random() * 900,
        y: 360 + Math.random() * 220,
        baseY: 360 + Math.random() * 220,
        size: 2 + Math.random() * 2.5,
        alpha: Math.random(),
        phase: Math.random() * Math.PI * 2,
        speed: 0.4 + Math.random() * 0.6,
      });
    }
    firefliesRef.current = fireflies;

    const grass = [];
    for (let i = 0; i < 180; i++) {
      grass.push({
        x: Math.random(),
        h: 9 + Math.random() * 15,
        swayOffset: Math.random() * Math.PI * 2,
        color: Math.random() > 0.5 ? 'rgba(52, 211, 153, 0.28)' : 'rgba(16, 185, 129, 0.22)',
      });
    }
    grassBladesRef.current = grass;
  }, []);

  // Main Render & Simulation Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let frame = 0;

    const render = () => {
      frame++;

      // Compute logical CSS dimensions
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const w = Math.max(300, rect.width || 900);
      const h = Math.max(300, rect.height || 620);

      // Match physical buffer to pixel density
      const targetBufferW = Math.round(w * dpr);
      const targetBufferH = Math.round(h * dpr);
      if (canvas.width !== targetBufferW || canvas.height !== targetBufferH) {
        canvas.width = targetBufferW;
        canvas.height = targetBufferH;
      }

      // Re-anchor any sheep whose initial position was outside current screen height
      const groundTop = h * 0.62;
      const groundBottom = h - 45;
      for (const s of sheep) {
        if (s.y < groundTop || s.y > groundBottom || isNaN(s.y)) {
          s.y = groundTop + 30 + (s.id * 37) % (groundBottom - groundTop - 40);
        }
        if (s.x < 40 || s.x > w - 40 || isNaN(s.x)) {
          s.x = 60 + ((s.id * 149) % (w - 120));
        }
      }

      // Physics update in logical units
      const targetPoint = fodder ? { x: fodder.x, y: fodder.y } : null;
      updateFlock(sheep, w, h, targetPoint);

      if (fodder && Date.now() - fodder.createdTime > 7500) {
        setFodder(null);
      }

      // Clear & Draw with DPR scale isolation
      ctx.save();
      ctx.scale(dpr, dpr);

      // Sky
      drawSky(ctx, w, h, timeOfDay);

      // Stars (visible in night/twilight/dawn, hidden in daytime)
      drawStars(ctx, w, h, frame, timeOfDay);

      // Sun or Moon
      drawCelestial(ctx, w, timeOfDay, frame);

      // Floating clouds
      drawClouds(ctx, w, h, timeOfDay);

      // Meadow
      drawMeadow(ctx, w, h, frame, timeOfDay);

      // Target Fodder
      if (fodder) {
        drawDreamFodder(ctx, fodder.x, fodder.y, frame);
      }

      // Sheep sorted by Y for 2.5D depth
      const sortedSheep = [...sheep].sort((a, b) => a.y - b.y);
      for (const s of sortedSheep) {
        // Grazing audio & grass particles
        if (s.isGrazing) {
          // Play chewing crunch sound during grazing
          if ((frame + s.id * 11) % 34 === 0) {
            soundEngine.playChewSound();
          }
          // Emit tiny emerald grass crumbs
          if ((frame + s.id * 7) % 16 === 0) {
            const mouthWorldX = s.x + (s.size * 0.7) * s.facing;
            const mouthWorldY = s.y + s.size * 0.42;
            grassCrumbsRef.current.push({
              x: mouthWorldX,
              y: mouthWorldY,
              vx: (Math.random() - 0.5) * 1.5,
              vy: Math.random() * 0.7 + 0.3,
              life: 1.0,
              color: Math.random() > 0.4 ? '#34d399' : '#10b981',
              size: 1.6 + Math.random() * 1.6,
            });
          }
        } else if (s.isSleeping) {
          // Gentle soft snore sound while asleep
          if ((frame + s.id * 37) % 150 === 0) {
            soundEngine.playSnoreSound();
          }
          // Drift dreamy zZ bubbles
          if ((frame + s.id * 19) % 48 === 0) {
            snoreParticlesRef.current.push({
              x: s.x + (s.size * 0.48) * s.facing + (Math.random() - 0.5) * 8,
              y: s.y - s.size * 0.35,
              vx: (Math.random() - 0.5) * 0.25,
              vy: -(0.55 + Math.random() * 0.25),
              life: 1.0,
              text: Math.random() > 0.4 ? 'z' : 'Z',
              size: 11 + Math.random() * 6,
              phase: Math.random() * Math.PI * 2,
            });
          }
        }

        // Headbutting bonk contact audio & spark particles
        if (s.socialAction === 'headbutt') {
          const dur = s.socialDuration || 52;
          const impactFrame = Math.floor(dur * 0.48);
          if (s.socialTimer === impactFrame) {
            if (!s.socialPartnerId || s.id < s.socialPartnerId) {
              soundEngine.playBonkSound();
              const contactX = s.x + (s.size * 0.65) * s.facing;
              const contactY = s.y - s.size * 0.05;
              for (let sp = 0; sp < 6; sp++) {
                const ang = Math.random() * Math.PI * 2;
                const spd = 1.2 + Math.random() * 2.2;
                bonkSparksRef.current.push({
                  x: contactX,
                  y: contactY,
                  vx: Math.cos(ang) * spd,
                  vy: Math.sin(ang) * spd,
                  life: 1.0,
                  color: Math.random() > 0.5 ? '#fde047' : '#f97316',
                  size: 2.2 + Math.random() * 2.5,
                });
              }
            }
          }
        }

        // After social play completes (socialTimer === 1): spawn cheerful mood bubble
        if (s.socialAction && s.socialTimer === 1) {
          if (!s.socialPartnerId || s.id < s.socialPartnerId) {
            soundEngine.playHappyChirpSound();
          }
          moodBubblesRef.current.push({
            x: s.x + (Math.random() - 0.5) * 6,
            y: s.y - s.size * 0.9,
            vx: (Math.random() - 0.5) * 0.35,
            vy: -(0.75 + Math.random() * 0.35),
            size: 15 + Math.random() * 4,
            life: 1.0,
            decay: 0.012 + Math.random() * 0.005,
            wobblePhase: Math.random() * Math.PI * 2,
            wobbleSpeed: 0.07 + Math.random() * 0.04,
            symbol: s.socialAction === 'headbutt' ? '😊' : '✨',
            color: '#fef08a',
          });
        }

        drawSheep(ctx, s, frame, s.id === hoveredSheepId, showDebugForces);
      }

      // Grass chew crumbs
      drawGrassCrumbs(ctx);

      // Sleeping zZ snore particles
      drawSnoreParticles(ctx, frame);

      // Headbutt contact sparks
      drawBonkSparks(ctx);

      // Cheerful play mood smiley bubbles
      drawMoodBubbles(ctx, frame);

      // Fireflies / Daytime floating pollen
      drawFireflies(ctx, w, h, frame, timeOfDay);

      // Pet floating heart bubbles
      drawPetHeartParticles(ctx, frame);

      ctx.restore();

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [sheep, hoveredSheepId, fodder, timeOfDay, showDebugForces]);

  // Sky drawing
  const drawSky = (
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    tod: TimeOfDay
  ) => {
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    if (tod === 'day') {
      // Clear Blue Sky (蓝天白云)
      grad.addColorStop(0, '#0284c7');    // deep azure sky at top
      grad.addColorStop(0.25, '#38bdf8'); // clear vibrant blue
      grad.addColorStop(0.65, '#7dd3fc'); // bright soft azure
      grad.addColorStop(0.88, '#bae6fd'); // warm sunlit horizon glow
      grad.addColorStop(1, '#e0f2fe');    // soft horizon mist
    } else if (tod === 'night') {
      grad.addColorStop(0, '#090d16');
      grad.addColorStop(0.35, '#0f172a');
      grad.addColorStop(0.65, '#1e293b');
      grad.addColorStop(1, '#0f2922');
    } else if (tod === 'twilight') {
      grad.addColorStop(0, '#1e1b4b');
      grad.addColorStop(0.35, '#4c1d95');
      grad.addColorStop(0.65, '#831843');
      grad.addColorStop(1, '#1e3a2f');
    } else {
      // Dawn
      grad.addColorStop(0, '#1e293b');
      grad.addColorStop(0.3, '#334155');
      grad.addColorStop(0.6, '#ca8a04');
      grad.addColorStop(1, '#166534');
    }

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
  };

  // Stars (Visible during night/twilight/dawn, hidden in bright daytime)
  const drawStars = (ctx: CanvasRenderingContext2D, w: number, h: number, frame: number, tod: TimeOfDay) => {
    if (tod === 'day') return;
    for (const star of starsRef.current) {
      const alpha = star.baseA + Math.sin(frame * 0.03 * star.speed) * 0.25;
      const todMult = tod === 'dawn' ? 0.45 : tod === 'twilight' ? 0.6 : 1.0;
      ctx.fillStyle = `rgba(255, 255, 240, ${Math.max(0.1, Math.min(1, alpha * todMult))})`;
      ctx.beginPath();
      ctx.arc(star.x * w, star.y * h, star.r, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  // Radiant Warm Daytime Sun (太阳)
  const drawSun = (ctx: CanvasRenderingContext2D, w: number, frame: number) => {
    const sunX = Math.min(w - 95, w * 0.85);
    const sunY = 75;
    const sunR = 32;

    // 1. Soft pulsing outer ambient sun warmth aura
    const pulse = Math.sin(frame * 0.03) * 4;
    const glow = ctx.createRadialGradient(sunX, sunY, sunR * 0.4, sunX, sunY, sunR * 3.4 + pulse);
    glow.addColorStop(0, 'rgba(254, 240, 138, 0.65)');
    glow.addColorStop(0.35, 'rgba(253, 224, 71, 0.35)');
    glow.addColorStop(0.7, 'rgba(251, 191, 36, 0.12)');
    glow.addColorStop(1, 'rgba(251, 191, 36, 0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(sunX, sunY, sunR * 3.4 + pulse, 0, Math.PI * 2);
    ctx.fill();

    // 2. Gentle rotating subtle sunbeams / rays
    ctx.save();
    ctx.translate(sunX, sunY);
    ctx.rotate(frame * 0.005);
    const rayCount = 12;
    for (let i = 0; i < rayCount; i++) {
      ctx.rotate((Math.PI * 2) / rayCount);
      const rayLen = sunR * 1.6 + Math.sin(frame * 0.05 + i) * 3;
      ctx.fillStyle = 'rgba(254, 240, 138, 0.22)';
      ctx.beginPath();
      ctx.moveTo(-3, sunR * 0.85);
      ctx.lineTo(0, rayLen);
      ctx.lineTo(3, sunR * 0.85);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();

    // 3. Inner sun disc with warm radiant center
    const innerGrad = ctx.createRadialGradient(sunX - 5, sunY - 5, sunR * 0.2, sunX, sunY, sunR);
    innerGrad.addColorStop(0, '#ffffff'); // bright pure core
    innerGrad.addColorStop(0.4, '#fef08a'); // soft buttery yellow
    innerGrad.addColorStop(1, '#fde047'); // golden yellow rim
    ctx.fillStyle = innerGrad;
    ctx.beginPath();
    ctx.arc(sunX, sunY, sunR, 0, Math.PI * 2);
    ctx.fill();
  };

  // Moon (月亮)
  const drawMoon = (
    ctx: CanvasRenderingContext2D,
    w: number,
    tod: TimeOfDay,
    frame: number
  ) => {
    const moonX = Math.min(w - 90, w * 0.88);
    const moonY = 85;
    const moonR = 34;

    // Outer soft glow
    const glow = ctx.createRadialGradient(moonX, moonY, moonR * 0.8, moonX, moonY, moonR * 2.8);
    glow.addColorStop(0, 'rgba(254, 240, 138, 0.4)');
    glow.addColorStop(1, 'rgba(254, 240, 138, 0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(moonX, moonY, moonR * 2.8, 0, Math.PI * 2);
    ctx.fill();

    // Moon disc
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.arc(moonX, moonY, moonR, 0, Math.PI * 2);
    ctx.fill();

    // Crescent shadow
    ctx.fillStyle = tod === 'night' ? '#0f172a' : tod === 'twilight' ? '#2e1065' : '#334155';
    ctx.beginPath();
    ctx.arc(moonX + 13, moonY - 6, moonR * 0.9, 0, Math.PI * 2);
    ctx.fill();
  };

  // Celestial controller: renders Sun during day, Moon during other times
  const drawCelestial = (
    ctx: CanvasRenderingContext2D,
    w: number,
    tod: TimeOfDay,
    frame: number
  ) => {
    if (tod === 'day') {
      drawSun(ctx, w, frame);
    } else {
      drawMoon(ctx, w, tod, frame);
    }
  };

  // Fluffy procedural clouds drifting across the pasture sky (白云)
  const drawClouds = (
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    tod: TimeOfDay
  ) => {
    for (const c of cloudsRef.current) {
      // Continual smooth drift across sky
      c.x += c.speed;
      const totalWidth = 140 * c.scale;
      if (c.x - totalWidth > w) {
        c.x = -totalWidth;
      }

      ctx.save();
      ctx.translate(c.x, c.y);
      ctx.scale(c.scale, c.scale);

      if (tod === 'day') {
        ctx.globalAlpha = c.opacity;

        // Soft cloud base / underside shadow
        ctx.fillStyle = 'rgba(219, 234, 254, 0.75)'; // light azure-gray ambient bottom shadow
        for (const p of c.puffs) {
          ctx.beginPath();
          ctx.ellipse(p.dx, p.dy + 4, p.rx, p.ry, 0, 0, Math.PI * 2);
          ctx.fill();
        }

        // Fluffy bright white body
        ctx.fillStyle = '#ffffff';
        for (const p of c.puffs) {
          ctx.beginPath();
          ctx.ellipse(p.dx, p.dy, p.rx, p.ry, 0, 0, Math.PI * 2);
          ctx.fill();
        }

        // Soft sunlit warm highlight on top puffs
        ctx.fillStyle = 'rgba(255, 253, 240, 0.65)';
        for (const p of c.puffs) {
          if (p.dy <= 0) {
            ctx.beginPath();
            ctx.ellipse(p.dx, p.dy - 3, p.rx * 0.75, p.ry * 0.65, 0, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      } else if (tod === 'twilight') {
        ctx.globalAlpha = c.opacity * 0.45;
        // Sunset rose and golden highlights
        ctx.fillStyle = '#f472b6';
        for (const p of c.puffs) {
          ctx.beginPath();
          ctx.ellipse(p.dx, p.dy + 3, p.rx, p.ry, 0, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.fillStyle = '#fed7aa';
        for (const p of c.puffs) {
          ctx.beginPath();
          ctx.ellipse(p.dx, p.dy, p.rx * 0.85, p.ry * 0.85, 0, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (tod === 'dawn') {
        ctx.globalAlpha = c.opacity * 0.5;
        // Morning peach mist
        ctx.fillStyle = '#fde68a';
        for (const p of c.puffs) {
          ctx.beginPath();
          ctx.ellipse(p.dx, p.dy, p.rx, p.ry, 0, 0, Math.PI * 2);
          ctx.fill();
        }
      } else {
        // Night: faint wispy midnight clouds
        ctx.globalAlpha = c.opacity * 0.18;
        ctx.fillStyle = '#334155';
        for (const p of c.puffs) {
          ctx.beginPath();
          ctx.ellipse(p.dx, p.dy, p.rx, p.ry, 0, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ctx.restore();
    }
  };

  // Meadow (草场)
  const drawMeadow = (
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    frame: number,
    tod: TimeOfDay
  ) => {
    const groundTop = h * 0.62;

    // Distant rolling hill curve
    ctx.fillStyle =
      tod === 'day'
        ? '#16a34a' // rich sunlit hill green
        : tod === 'night'
        ? '#0c281e'
        : tod === 'twilight'
        ? '#143828'
        : '#14532d';
    ctx.beginPath();
    ctx.moveTo(0, groundTop - 25);
    ctx.quadraticCurveTo(w * 0.35, groundTop - 45, w * 0.7, groundTop - 20);
    ctx.quadraticCurveTo(w * 0.9, groundTop - 5, w, groundTop - 15);
    ctx.lineTo(w, groundTop + 10);
    ctx.lineTo(0, groundTop + 10);
    ctx.closePath();
    ctx.fill();

    // Foreground meadow ground
    const meadowGrad = ctx.createLinearGradient(0, groundTop, 0, h);
    if (tod === 'day') {
      meadowGrad.addColorStop(0, '#22c55e');    // vibrant emerald grass
      meadowGrad.addColorStop(0.45, '#16a34a'); // rich meadow green
      meadowGrad.addColorStop(1, '#15803d');    // deep green turf
    } else if (tod === 'night') {
      meadowGrad.addColorStop(0, '#102a1c');
      meadowGrad.addColorStop(0.4, '#0d2217');
      meadowGrad.addColorStop(1, '#08170f');
    } else if (tod === 'twilight') {
      meadowGrad.addColorStop(0, '#163b28');
      meadowGrad.addColorStop(0.5, '#133020');
      meadowGrad.addColorStop(1, '#0a1d13');
    } else {
      // Dawn
      meadowGrad.addColorStop(0, '#15803d');
      meadowGrad.addColorStop(0.5, '#166534');
      meadowGrad.addColorStop(1, '#14532d');
    }

    ctx.fillStyle = meadowGrad;
    ctx.fillRect(0, groundTop, w, h - groundTop);

    // Decorative swaying grass blades
    ctx.lineWidth = 1.6;
    ctx.lineCap = 'round';
    for (const blade of grassBladesRef.current) {
      const bx = blade.x * w;
      const by = groundTop + (blade.swayOffset % 1) * (h - groundTop - 15);
      const sway = Math.sin(frame * 0.04 + blade.swayOffset) * 4;

      ctx.strokeStyle =
        tod === 'day'
          ? blade.swayOffset % 2 > 1
            ? 'rgba(134, 239, 172, 0.65)'
            : 'rgba(74, 222, 128, 0.55)'
          : blade.color;
      ctx.beginPath();
      ctx.moveTo(bx, by);
      ctx.quadraticCurveTo(bx + sway * 0.5, by - blade.h * 0.6, bx + sway, by - blade.h);
      ctx.stroke();
    }
  };

  // Dream Clover Fodder
  const drawDreamFodder = (ctx: CanvasRenderingContext2D, fx: number, fy: number, frame: number) => {
    const pulse = (frame % 60) / 60;
    ctx.strokeStyle = `rgba(167, 243, 208, ${1 - pulse})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(fx, fy, 15 + pulse * 45, 0, Math.PI * 2);
    ctx.stroke();

    ctx.save();
    ctx.translate(fx, fy);
    ctx.scale(1 + Math.sin(frame * 0.1) * 0.12, 1 + Math.sin(frame * 0.1) * 0.12);

    ctx.fillStyle = '#34d399';
    for (let i = 0; i < 4; i++) {
      ctx.rotate(Math.PI / 2);
      ctx.beginPath();
      ctx.ellipse(0, -6, 5, 8, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.arc(0, 0, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  };

  // ===== NEW SHEEP LOOK (Valais Blacknose / 参考图风格) =================================
  const SHOW_HORNS = true; // Ram horns & long-sleeper horns
  const SHOW_AURA = false; // true = keep the yellow glow for good dreams
  const SHEEP_BLACK = '#1c1917';

  // Darken (amt < 0) or lighten (amt > 0) a #rrggbb colour
  const shade = (hex: string, amt: number): string => {
    const cleanHex = hex.replace('#', '');
    const n = parseInt(cleanHex.length === 3 ? cleanHex.split('').map((c) => c + c).join('') : cleanHex, 16);
    const f = (v: number) => Math.max(0, Math.min(255, Math.round(v + amt * 255)));
    return `rgb(${f((n >> 16) & 255)}, ${f((n >> 8) & 255)}, ${f(n & 255)})`;
  };

  const drawSheep = (
    ctx: CanvasRenderingContext2D,
    s: SheepCreature,
    frame: number,
    isHovered: boolean,
    showDebug: boolean
  ) => {
    ctx.save();
    const isSleeping = s.isSleeping;
    const isGrazing = s.isGrazing;
    const sz = s.size;

    // Resting sheep sinks down onto the meadow turf; hopping jumps up; headbutt charges forward
    const sleepSink = isSleeping ? sz * 0.16 : 0;
    const jumpY = s.jumpY || 0;
    const headbuttOffset = (s.headbuttOffset || 0);

    ctx.translate(s.x + headbuttOffset, s.y + sleepSink + jumpY);

    const scaleX = s.facing;
    ctx.scale(scaleX, 1);

    const wool = s.woolColor;
    const outline = shade(wool, -0.3);
    const OW = Math.max(1.5, sz * 0.05); // outline thickness

    // Draw a group of ellipses with an outline: all outlines first, then all
    // fills, so neighbouring blobs do not draw their outline over each other.
    const woolGroup = (blobs: number[][]) => {
      ctx.fillStyle = outline;
      for (const [x, y, rx, ry] of blobs) {
        ctx.beginPath();
        ctx.ellipse(x, y, rx + OW, ry + OW, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = wool;
      for (const [x, y, rx, ry] of blobs) {
        ctx.beginPath();
        ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    // Optional aura glow (off by default)
    if (SHOW_AURA && s.auraGlow) {
      const glowGrad = ctx.createRadialGradient(0, 0, sz * 0.4, 0, 0, sz * 1.35);
      glowGrad.addColorStop(0, 'rgba(253, 224, 71, 0.32)');
      glowGrad.addColorStop(1, 'rgba(253, 224, 71, 0)');
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.ellipse(0, 0, sz * 1.35, sz * 1.1, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // Ground shadow (scales down when sheep hops up)
    const shadowScale = jumpY < 0 ? Math.max(0.4, 1 + jumpY * 0.025) : 1;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.42)';
    ctx.beginPath();
    ctx.ellipse(0, sz * 0.65 - jumpY, sz * 1.05 * shadowScale, sz * 0.24 * shadowScale, 0, 0, Math.PI * 2);
    ctx.fill();

    // Legs: if sleeping, draw folded hooves tucked under the belly; otherwise standing/walking legs
    const legLength = sz * 0.52;
    const legWidth = Math.max(4, sz * 0.13);
    const legSwing = Math.sin(s.legPhase) * sz * 0.22;

    if (isSleeping) {
      // Folded hooves tucked under body
      ctx.fillStyle = SHEEP_BLACK;
      const tuckY = sz * 0.36;
      const hooves = [-sz * 0.36, -sz * 0.14, sz * 0.12, sz * 0.34];
      for (const hx of hooves) {
        ctx.beginPath();
        ctx.ellipse(hx, tuckY, Math.max(3.5, sz * 0.11), Math.max(2.5, sz * 0.07), 0, 0, Math.PI * 2);
        ctx.fill();
      }
    } else {
      const isHopping = s.socialAction === 'hop';
      const legPositions = [
        { bx: -sz * 0.38, swing: isHopping ? sz * 0.12 : legSwing },
        { bx: -sz * 0.16, swing: isHopping ? -sz * 0.12 : -legSwing },
        { bx: sz * 0.14, swing: isHopping ? sz * 0.12 : legSwing },
        { bx: sz * 0.36, swing: isHopping ? -sz * 0.12 : -legSwing },
      ];
      ctx.strokeStyle = SHEEP_BLACK;
      ctx.lineWidth = legWidth;
      ctx.lineCap = 'round';
      for (const leg of legPositions) {
        const startY = sz * 0.35;
        const endX = leg.bx + (isGrazing ? 0 : leg.swing);
        ctx.beginPath();
        ctx.moveTo(leg.bx, startY);
        ctx.lineTo(endX, startY + legLength);
        ctx.stroke();
      }
    }

    // Wool body: tail, torso and satellite puffs (with gentle rhythmic breathing swell)
    const tailWag = isSleeping ? 0 : Math.sin(frame * 0.15) * 3;
    const breathe = isSleeping ? Math.sin(frame * 0.05 + s.id) * sz * 0.035 : 0;
    const puffR = sz * 0.32;
    const bodyBlobs: number[][] = [
      [-sz * 0.68, -sz * 0.05 + tailWag, sz * 0.18, sz * 0.18], // tail
      [0, 0, sz * 1.15 + breathe, sz * 0.88 + breathe], // torso with gentle breathing
      [-sz * 0.5, -sz * 0.15, puffR, puffR],
      [-sz * 0.38, -sz * 0.35, puffR, puffR],
      [-sz * 0.15, -sz * 0.42, puffR, puffR],
      [sz * 0.1, -sz * 0.42, puffR, puffR],
      [sz * 0.32, -sz * 0.32, puffR, puffR],
      [sz * 0.45, -sz * 0.1, puffR, puffR],
      [sz * 0.35, sz * 0.18, puffR, puffR],
      [sz * 0.12, sz * 0.35, puffR, puffR],
      [-sz * 0.18, sz * 0.35, puffR, puffR],
      [-sz * 0.42, sz * 0.2, puffR, puffR],
    ];
    woolGroup(bodyBlobs);

    // Soft shade patches (secondary wool colour, semi-transparent)
    ctx.globalAlpha = 0.35;
    ctx.fillStyle = s.woolSecondaryColor;
    ctx.beginPath();
    ctx.ellipse(-sz * 0.1, sz * 0.5, sz * 0.7, sz * 0.2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(-sz * 0.2, -sz * 0.45, sz * 0.45, sz * 0.16, -0.15, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;

    // Head position: lowers while grazing, headbutting, or sleeping; shakes while idle
    const chew = isGrazing ? Math.sin(frame * 0.3) * sz * 0.04 : 0;
    let headX = sz * 0.58;
    let headY = isGrazing ? sz * 0.22 + chew : isSleeping ? sz * 0.06 + breathe * 0.4 : -sz * 0.08;

    // Headbutting posture: dips head down for the charge
    if (s.socialAction === 'headbutt') {
      headY += sz * 0.12;
      headX += sz * 0.06;
    }

    // Idle head shake gesture
    if (s.scratchType === 'head_shake') {
      const shakePhase = Math.sin(frame * 0.55);
      headX += shakePhase * (sz * 0.08);
      headY += Math.abs(shakePhase) * (sz * 0.04);
    }

    // Black ears (behind the face) with idle flutter or gentle sway
    const isEarFluttering = s.scratchType === 'ear_flutter';
    const earFlutter = isSleeping
      ? 0
      : isEarFluttering
      ? Math.sin(frame * 0.85) * 6.5
      : Math.sin(frame * 0.1 + s.id) * 2;

    ctx.fillStyle = SHEEP_BLACK;
    ctx.beginPath();
    ctx.ellipse(headX - sz * 0.2, headY - sz * 0.04 + earFlutter, sz * 0.17, sz * 0.09, -0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(headX + sz * 0.46, headY - sz * 0.02 - earFlutter, sz * 0.15, sz * 0.08, 0.5, 0, Math.PI * 2);
    ctx.fill();

    // Black face
    ctx.fillStyle = SHEEP_BLACK;
    ctx.beginPath();
    ctx.ellipse(headX + sz * 0.12, headY + sz * 0.04, sz * 0.38, sz * 0.36, 0, 0, Math.PI * 2);
    ctx.fill();

    // Wool fringe over the forehead
    woolGroup([
      [headX - sz * 0.12, headY - sz * 0.26, sz * 0.26, sz * 0.2],
      [headX + sz * 0.1, headY - sz * 0.32, sz * 0.26, sz * 0.2],
      [headX + sz * 0.3, headY - sz * 0.24, sz * 0.2, sz * 0.17],
    ]);

    // Personality-based traits:
    // 1. Two short black triangular cone horns (短小的两个黑色三角锥)
    // 活泼、开朗、暴躁等活力激越类羊头上有角
    const hasHorns = s.hasHorns ?? (s.personality === '活泼' || s.personality === '开朗' || s.personality === '暴躁' || (s.personality === '独立' && s.gender === 'ram'));
    
    // 2. Red Bow Tie (红色领结)
    // 文静、温顺、善良等温和善意类小羊佩戴红色领结
    const hasRedBowTie = s.hasRedBowTie ?? (s.personality === '文静' || s.personality === '温顺' || s.personality === '善良');

    // 3. Closed Eyes (忧郁的小羊眼睛是闭着的)
    const isMelancholy = s.personality === '忧郁';
    const hasClosedEyes = s.hasClosedEyes ?? isMelancholy;

    // --- DRAW HORNS: TWO SHORT BLACK TRIANGULAR CONES (短小的两个黑色三角锥) ---
    if (hasHorns) {
      ctx.fillStyle = SHEEP_BLACK;
      ctx.strokeStyle = '#0c0a09';
      ctx.lineWidth = Math.max(1.2, sz * 0.035);
      ctx.lineJoin = 'round';

      // Left Cone Horn (slightly behind)
      ctx.beginPath();
      ctx.moveTo(headX - sz * 0.12, headY - sz * 0.24);
      ctx.lineTo(headX - sz * 0.14, headY - sz * 0.46); // Sharp cone tip pointing up-back
      ctx.lineTo(headX - sz * 0.02, headY - sz * 0.28);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Right Cone Horn (front horn)
      ctx.beginPath();
      ctx.moveTo(headX + sz * 0.11, headY - sz * 0.29);
      ctx.lineTo(headX + sz * 0.20, headY - sz * 0.50); // Sharp cone tip pointing up
      ctx.lineTo(headX + sz * 0.23, headY - sz * 0.28);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Subtle 3D cone ridge highlight
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.lineWidth = Math.max(1, sz * 0.025);
      ctx.beginPath();
      ctx.moveTo(headX - sz * 0.07, headY - sz * 0.26);
      ctx.lineTo(headX - sz * 0.14, headY - sz * 0.46);
      ctx.moveTo(headX + sz * 0.17, headY - sz * 0.285);
      ctx.lineTo(headX + sz * 0.20, headY - sz * 0.50);
      ctx.stroke();
    }

    // --- DRAW RED BOW TIE (红色领结) ---
    if (hasRedBowTie) {
      const bowX = headX - sz * 0.02;
      const bowY = headY + sz * 0.38;

      ctx.save();
      // Left ribbon wing
      ctx.beginPath();
      ctx.moveTo(bowX, bowY);
      ctx.lineTo(bowX - sz * 0.15, bowY - sz * 0.08);
      ctx.lineTo(bowX - sz * 0.17, bowY + sz * 0.08);
      ctx.closePath();
      ctx.fillStyle = '#dc2626';
      ctx.fill();
      ctx.strokeStyle = '#991b1b';
      ctx.lineWidth = Math.max(1, sz * 0.025);
      ctx.stroke();

      // Right ribbon wing
      ctx.beginPath();
      ctx.moveTo(bowX, bowY);
      ctx.lineTo(bowX + sz * 0.15, bowY - sz * 0.06);
      ctx.lineTo(bowX + sz * 0.14, bowY + sz * 0.09);
      ctx.closePath();
      ctx.fillStyle = '#ef4444';
      ctx.fill();
      ctx.strokeStyle = '#991b1b';
      ctx.stroke();

      // Ribbon tails
      ctx.fillStyle = '#b91c1c';
      ctx.beginPath();
      ctx.moveTo(bowX - sz * 0.02, bowY + sz * 0.04);
      ctx.lineTo(bowX - sz * 0.09, bowY + sz * 0.18);
      ctx.lineTo(bowX - sz * 0.04, bowY + sz * 0.15);
      ctx.closePath();
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(bowX + sz * 0.02, bowY + sz * 0.04);
      ctx.lineTo(bowX + sz * 0.08, bowY + sz * 0.18);
      ctx.lineTo(bowX + sz * 0.03, bowY + sz * 0.15);
      ctx.closePath();
      ctx.fill();

      // Center Knot
      ctx.beginPath();
      ctx.arc(bowX, bowY, Math.max(2.5, sz * 0.055), 0, Math.PI * 2);
      ctx.fillStyle = '#dc2626';
      ctx.fill();
      ctx.strokeStyle = '#7f1d1d';
      ctx.stroke();

      // Tiny glossy highlight
      ctx.fillStyle = 'rgba(254, 202, 202, 0.85)';
      ctx.beginPath();
      ctx.arc(bowX - sz * 0.015, bowY - sz * 0.015, Math.max(1, sz * 0.02), 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }

    // --- EYES: CLOSED FOR MELANCHOLY/SLEEPING, RING FOR AWAKE ---
    const eyeXs = [headX + sz * 0.02, headX + sz * 0.26];
    const eyeY = headY + sz * 0.08;
    const eyeR = sz * 0.075;
    const isBlinking = frame % 180 > 172;
    const eyesAreClosed = isSleeping || isBlinking || hasClosedEyes || s.eyeStyle === 'sleepy';

    ctx.strokeStyle = '#fafaf9';
    ctx.lineWidth = Math.max(1.5, sz * 0.045);
    ctx.lineCap = 'round';
    for (const ex of eyeXs) {
      ctx.beginPath();
      if (eyesAreClosed) {
        // Serene closed arc (闭着的眼睛)
        ctx.arc(ex, eyeY - eyeR * 0.15, eyeR, 0.15 * Math.PI, 0.85 * Math.PI);
      } else {
        // Alert white ring eye
        ctx.arc(ex, eyeY, eyeR, 0, Math.PI * 2);
      }
      ctx.stroke();
    }

    // Melancholy dreamy starlight/tear droplet highlight near cheek
    if (isMelancholy) {
      ctx.fillStyle = 'rgba(186, 230, 253, 0.85)';
      ctx.beginPath();
      ctx.arc(headX + sz * 0.35, eyeY + sz * 0.08, Math.max(1.5, sz * 0.035), 0, Math.PI * 2);
      ctx.fill();
    }

    // Grumpy (暴躁) cute determined furrowed brows
    if (s.personality === '暴躁' && !isSleeping) {
      ctx.strokeStyle = '#fafaf9';
      ctx.lineWidth = Math.max(1.5, sz * 0.04);
      // Left brow slanted inward
      ctx.beginPath();
      ctx.moveTo(eyeXs[0] - eyeR * 0.7, eyeY - eyeR * 1.3);
      ctx.lineTo(eyeXs[0] + eyeR * 0.7, eyeY - eyeR * 0.8);
      ctx.stroke();
      // Right brow slanted inward
      ctx.beginPath();
      ctx.moveTo(eyeXs[1] - eyeR * 0.7, eyeY - eyeR * 0.8);
      ctx.lineTo(eyeXs[1] + eyeR * 0.7, eyeY - eyeR * 1.3);
      ctx.stroke();
    }

    // Small Y mouth
    ctx.strokeStyle = '#d6d3d1';
    ctx.lineWidth = Math.max(1.2, sz * 0.035);
    const mx = headX + sz * 0.14;
    const my = headY + sz * 0.2;
    ctx.beginPath();
    ctx.moveTo(mx, my);
    ctx.lineTo(mx, my + sz * 0.06);
    ctx.moveTo(mx, my + sz * 0.06);
    ctx.lineTo(mx - sz * 0.05, my + sz * 0.11);
    ctx.moveTo(mx, my + sz * 0.06);
    ctx.lineTo(mx + sz * 0.05, my + sz * 0.11);
    ctx.stroke();

    // Fresh green grass sprig chewing in mouth when grazing
    if (isGrazing) {
      ctx.strokeStyle = '#34d399';
      ctx.lineWidth = Math.max(1.5, sz * 0.045);
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(mx, my + sz * 0.03);
      ctx.quadraticCurveTo(mx + sz * 0.12, my + sz * 0.01, mx + sz * 0.22, my - sz * 0.04);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(mx, my + sz * 0.03);
      ctx.quadraticCurveTo(mx + sz * 0.09, my + sz * 0.08, mx + sz * 0.18, my + sz * 0.11);
      ctx.stroke();
    }

    // Hover highlight outline
    if (isHovered) {
      ctx.strokeStyle = '#fde047';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.ellipse(0, 0, sz * 1.35, sz * 1.05, 0, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Debug steering velocity vector
    if (showDebug) {
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(s.vx * 30 * scaleX, s.vy * 30);
      ctx.stroke();
    }

    ctx.restore();

    // Floating name, gender, and quality tag when hovered
    if (isHovered) {
      ctx.save();
      ctx.font = '600 13px "Plus Jakarta Sans", sans-serif';
      const genderTag = s.gender === 'ram' ? '♂ Ram' : '♀ Ewe';
      const statusLabel = isSleeping
        ? ' · Snoozing 💤'
        : isGrazing
        ? ' · Grazing 🌿'
        : s.socialAction === 'headbutt'
        ? ' · Headbutt 💥'
        : s.socialAction === 'hop'
        ? ' · Play Hop ✨'
        : s.scratchType === 'ear_flutter'
        ? ' · Fluttering Ears 🌾'
        : s.scratchType === 'head_shake'
        ? ' · Shaking Head 🎵'
        : '';
      const personalityTag = s.personality ? ` · ${s.personality}` : '';
      const traitIcon = (s.hasRedBowTie || s.personality === '文静' || s.personality === '温顺' || s.personality === '善良')
        ? ' 🎀'
        : (s.hasHorns || s.personality === '活泼' || s.personality === '开朗' || s.personality === '暴躁')
        ? ' 📐'
        : s.personality === '忧郁'
        ? ' 🌙'
        : '';
      const label = `${s.name} (${genderTag}${personalityTag}${traitIcon} · ${s.hours}h · ${s.quality}${statusLabel})`;
      const textW = ctx.measureText(label).width;

      ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
      ctx.strokeStyle = 'rgba(254, 240, 138, 0.6)';
      ctx.lineWidth = 1;
      const pillY = s.y - sz * 1.4;

      ctx.beginPath();
      ctx.roundRect(s.x - textW / 2 - 10, pillY - 14, textW + 20, 24, 6);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#fef08a';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(label, s.x, pillY - 2);
      ctx.restore();
    }
  };

  // Cheerful mood symbol bubbles floating up after play / socializing
  const drawMoodBubbles = (ctx: CanvasRenderingContext2D, frame: number) => {
    const list = moodBubblesRef.current;
    for (let i = list.length - 1; i >= 0; i--) {
      const p = list[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.95;
      p.vy -= 0.02; // gentle buoyancy
      p.life -= p.decay;

      if (p.life <= 0) {
        list.splice(i, 1);
        continue;
      }

      const sway = Math.sin(frame * p.wobbleSpeed + p.wobblePhase) * 1.5;
      ctx.save();
      ctx.translate(p.x + sway, p.y);
      const scale = (0.75 + (1 - p.life) * 0.28) * (p.size / 16);
      ctx.scale(scale, scale);
      ctx.globalAlpha = Math.max(0, Math.min(1, p.life * 1.25));

      // Glowing outer shadow
      ctx.shadowColor = 'rgba(253, 224, 71, 0.65)';
      ctx.shadowBlur = 10;

      // Soft luminous bubble gradient
      const grad = ctx.createRadialGradient(-3, -3, 2, 0, 0, 14);
      grad.addColorStop(0, 'rgba(254, 240, 138, 0.92)');
      grad.addColorStop(0.65, 'rgba(250, 204, 21, 0.65)');
      grad.addColorStop(1, 'rgba(234, 179, 8, 0.3)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(0, 0, 14, 0, Math.PI * 2);
      ctx.fill();

      // Border outline
      ctx.strokeStyle = 'rgba(254, 240, 138, 0.9)';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // Glossy specular highlight
      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.beginPath();
      ctx.ellipse(-4, -5, 3.5, 2, -0.4, 0, Math.PI * 2);
      ctx.fill();

      // Symbol
      ctx.font = '13px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(p.symbol, 0, 1);

      ctx.restore();
    }
  };

  // Contact sparks for headbutt bonk
  const drawBonkSparks = (ctx: CanvasRenderingContext2D) => {
    const list = bonkSparksRef.current;
    for (let i = list.length - 1; i >= 0; i--) {
      const s = list[i];
      s.x += s.vx;
      s.y += s.vy;
      s.vx *= 0.92;
      s.vy *= 0.92;
      s.life -= 0.045;

      if (s.life <= 0) {
        list.splice(i, 1);
        continue;
      }

      ctx.save();
      ctx.globalAlpha = Math.max(0, s.life);
      ctx.fillStyle = s.color;
      ctx.shadowColor = s.color;
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.size * s.life, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  };

  // Grass chew crumbs
  const drawGrassCrumbs = (ctx: CanvasRenderingContext2D) => {
    const list = grassCrumbsRef.current;
    for (let i = list.length - 1; i >= 0; i--) {
      const p = list[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= 0.025;
      if (p.life <= 0) {
        list.splice(i, 1);
        continue;
      }
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.life;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  };

  // Sleeping zZ snore particles
  const drawSnoreParticles = (ctx: CanvasRenderingContext2D, frame: number) => {
    const list = snoreParticlesRef.current;
    for (let i = list.length - 1; i >= 0; i--) {
      const p = list[i];
      p.y += p.vy;
      p.x += Math.sin(frame * 0.08 + p.phase) * 0.35;
      p.life -= 0.012;
      if (p.life <= 0) {
        list.splice(i, 1);
        continue;
      }
      ctx.save();
      ctx.font = `bold ${Math.round(p.size)}px "Plus Jakarta Sans", sans-serif`;
      ctx.fillStyle = `rgba(186, 230, 253, ${p.life * 0.85})`;
      ctx.shadowColor = 'rgba(56, 189, 248, 0.5)';
      ctx.shadowBlur = 6;
      ctx.fillText(p.text, p.x, p.y);
      ctx.restore();
    }
  };

  // Fireflies (night) / Sunlit pollen floaters (day)
  const drawFireflies = (ctx: CanvasRenderingContext2D, w: number, h: number, frame: number, tod: TimeOfDay) => {
    for (const p of firefliesRef.current) {
      p.phase += 0.03 * p.speed;
      p.x += Math.cos(p.phase) * 0.4;
      p.y = p.baseY + Math.sin(p.phase * 1.2) * 14;

      if (p.x < 0) p.x = w;
      if (p.x > w) p.x = 0;

      const alpha = 0.3 + Math.sin(frame * 0.06 + p.phase) * 0.4;
      if (alpha > 0) {
        if (tod === 'day') {
          // Floating soft white dandelion seeds and sunlit pollen
          ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.65})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 0.85, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillStyle = `rgba(167, 243, 208, ${alpha})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
  };

  // Dreamy floating affection heart bubbles (matching the float of zZ snores)
  const drawPetHeartParticles = (ctx: CanvasRenderingContext2D, frame: number) => {
    const list = petHeartsRef.current;
    for (let i = list.length - 1; i >= 0; i--) {
      const p = list[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.94; // air resistance
      p.vy -= 0.025; // buoyancy float
      p.life -= p.decay;

      if (p.life <= 0) {
        list.splice(i, 1);
        continue;
      }

      // Gentle rhythmic side-to-side wobble
      const sway = Math.sin(frame * p.wobbleSpeed + p.wobblePhase) * 1.4;

      ctx.save();
      ctx.translate(p.x + sway, p.y);
      const scale = (0.75 + (1 - p.life) * 0.35) * (p.size / 14);
      ctx.scale(scale, scale);
      ctx.globalAlpha = Math.max(0, Math.min(1, p.life * 1.15));

      // Dreamy glowing shadow
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 9;

      // Draw vector heart
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.moveTo(0, 3);
      ctx.bezierCurveTo(0, -3, -8, -3, -8, 3);
      ctx.bezierCurveTo(-8, 9, 0, 13, 0, 16);
      ctx.bezierCurveTo(0, 13, 8, 9, 8, 3);
      ctx.bezierCurveTo(8, -3, 0, -3, 0, 3);
      ctx.closePath();
      ctx.fill();

      // Soft white glossy shine bubble highlight
      if (p.hasShine) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
        ctx.beginPath();
        ctx.ellipse(-3, 2, 2, 1.2, -0.4, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }
  };

  // Mouse Interactivity
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    let foundId: number | null = null;
    for (const s of sheep) {
      const d = Math.hypot(x - s.x, y - s.y);
      if (d < s.size * 1.2) {
        foundId = s.id;
        break;
      }
    }
    setHoveredSheepId(foundId);
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check if clicked on a sheep
    for (let i = sheep.length - 1; i >= 0; i--) {
      const s = sheep[i];
      const d = Math.hypot(x - s.x, y - s.y);
      if (d < s.size * 1.35) {
        // Wake up immediately if sleeping
        if (s.isSleeping) {
          s.isSleeping = false;
          s.sleepTimer = 0;
        }
        s.lastPetTime = Date.now();
        // Play distinct acoustic bleat based on biometric sleep phenotype
        const voice = getSheepBleatConfig(s);
        soundEngine.playBleatVariation(voice.variety, voice.pitchMod);
        soundEngine.playPetSound();

        // Spawn a rich cluster of 7 dreamy floating heart bubbles
        const heartColors = ['#f472b6', '#fb7185', '#ec4899', '#fda4af', '#f43f5e', '#ff70a6'];
        for (let k = 0; k < 7; k++) {
          const spreadAngle = -Math.PI / 2 + (Math.random() - 0.5) * 1.5;
          const launchSpeed = 1.2 + Math.random() * 2.2;
          petHeartsRef.current.push({
            x: s.x + (Math.random() - 0.5) * s.size * 0.7,
            y: s.y - s.size * 0.35 + (Math.random() - 0.5) * 12,
            vx: Math.cos(spreadAngle) * launchSpeed,
            vy: Math.sin(spreadAngle) * launchSpeed,
            size: 11 + Math.random() * 8,
            life: 1.0,
            decay: 0.011 + Math.random() * 0.007,
            wobblePhase: Math.random() * Math.PI * 2,
            wobbleSpeed: 0.08 + Math.random() * 0.06,
            color: heartColors[k % heartColors.length],
            hasShine: Math.random() > 0.25,
          });
        }

        onSelectSheep(s);
        return;
      }
    }

    // Detect double click on grass to summon flock with bell chime
    const now = Date.now();
    const isDoubleClick = now - lastClickRef.current < 380;

    if (isDoubleClick && y > canvas.height / (window.devicePixelRatio || 1) * 0.55) {
      setFodder({ x, y, createdTime: now, life: 1.0 });
      soundEngine.playBellChime();
      lastClickRef.current = 0;
    } else {
      lastClickRef.current = now;
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[620px] md:h-[660px] rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-2xl select-none"
    >
      <canvas
        ref={canvasRef}
        onMouseMove={handleMouseMove}
        onClick={handleCanvasClick}
        className="w-full h-full cursor-pointer block"
      />

      {/* Floating Canvas Quick Guidance */}
      <div className="absolute bottom-3 left-3 sm:left-4 z-10 flex flex-wrap items-center gap-2 sm:gap-3 bg-slate-950/85 backdrop-blur-md px-3.5 py-1.5 sm:py-2 rounded-xl border border-slate-800/80 text-[11px] sm:text-xs text-slate-300">
        <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          Autonomous Flock Active
        </span>
        <span className="text-slate-600 hidden sm:inline">·</span>
        <span>Click sheep: inspect diary & pet</span>
        <span className="text-slate-600 hidden sm:inline">·</span>
        <span>Double-click grass: ring bell to summon flock</span>
      </div>

      {/* Flock count counter in top right */}
      <div className="absolute top-3 right-3 sm:right-4 z-10 flex items-center gap-2 bg-slate-950/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800/80 text-xs text-slate-300">
        <span className="text-slate-400">Flock Size:</span>
        <span className="font-mono font-semibold text-amber-300 tabular-nums">{sheep.length} sheep</span>
      </div>
    </div>
  );
};
