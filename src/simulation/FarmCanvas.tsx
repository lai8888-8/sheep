import React, { useEffect, useRef, useState } from 'react';
import { AmbientParticle, DreamFodder, SheepCreature } from '../types/sheep';
import { updateFlock } from './flock';
import { soundEngine, getSheepBleatConfig } from '../audio/synth';

interface FarmCanvasProps {
  sheep: SheepCreature[];
  onSelectSheep: (sheep: SheepCreature) => void;
  timeOfDay: 'night' | 'twilight' | 'dawn';
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

      // Stars
      drawStars(ctx, w, h, frame);

      // Moon
      drawMoon(ctx, w, timeOfDay, frame);

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

        drawSheep(ctx, s, frame, s.id === hoveredSheepId, showDebugForces);
      }

      // Grass chew crumbs
      drawGrassCrumbs(ctx);

      // Sleeping zZ snore particles
      drawSnoreParticles(ctx, frame);

      // Fireflies
      drawFireflies(ctx, w, h, frame);

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
    tod: 'night' | 'twilight' | 'dawn'
  ) => {
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    if (tod === 'night') {
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

  // Stars
  const drawStars = (ctx: CanvasRenderingContext2D, w: number, h: number, frame: number) => {
    for (const star of starsRef.current) {
      const alpha = star.baseA + Math.sin(frame * 0.03 * star.speed) * 0.25;
      ctx.fillStyle = `rgba(255, 255, 240, ${Math.max(0.15, Math.min(1, alpha))})`;
      ctx.beginPath();
      ctx.arc(star.x * w, star.y * h, star.r, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  // Moon
  const drawMoon = (
    ctx: CanvasRenderingContext2D,
    w: number,
    tod: 'night' | 'twilight' | 'dawn',
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

  // Meadow
  const drawMeadow = (
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    frame: number,
    tod: 'night' | 'twilight' | 'dawn'
  ) => {
    const groundTop = h * 0.62;

    // Distant rolling hill curve
    ctx.fillStyle = tod === 'night' ? '#0c281e' : tod === 'twilight' ? '#143828' : '#14532d';
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
    if (tod === 'night') {
      meadowGrad.addColorStop(0, '#102a1c');
      meadowGrad.addColorStop(0.4, '#0d2217');
      meadowGrad.addColorStop(1, '#08170f');
    } else if (tod === 'twilight') {
      meadowGrad.addColorStop(0, '#163b28');
      meadowGrad.addColorStop(0.5, '#133020');
      meadowGrad.addColorStop(1, '#0a1d13');
    } else {
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

      ctx.strokeStyle = blade.color;
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
  const SHOW_HORNS = false; // true = draw horns for long sleepers (hornType)
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

    // Resting sheep sinks down onto the meadow turf
    const sleepSink = isSleeping ? sz * 0.16 : 0;
    ctx.translate(s.x, s.y + sleepSink);

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

    // Ground shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.42)';
    ctx.beginPath();
    ctx.ellipse(0, sz * 0.65, sz * 1.05, sz * 0.24, 0, 0, Math.PI * 2);
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
      const legPositions = [
        { bx: -sz * 0.38, swing: legSwing },
        { bx: -sz * 0.16, swing: -legSwing },
        { bx: sz * 0.14, swing: legSwing },
        { bx: sz * 0.36, swing: -legSwing },
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

    // Head position: lowers while grazing with chewing bob, or rests serenely while sleeping
    const chew = isGrazing ? Math.sin(frame * 0.3) * sz * 0.04 : 0;
    const headX = sz * 0.58;
    const headY = isGrazing ? sz * 0.22 + chew : isSleeping ? sz * 0.06 + breathe * 0.4 : -sz * 0.08;

    // Black ears (behind the face)
    const earFlutter = isSleeping ? 0 : Math.sin(frame * 0.1 + s.id) * 2;
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

    // Optional horns (off by default)
    if (SHOW_HORNS && s.hornType === 'spiral') {
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = sz * 0.09;
      ctx.beginPath();
      ctx.arc(headX - sz * 0.05, headY - sz * 0.38, sz * 0.22, 0.8 * Math.PI, 1.8 * Math.PI);
      ctx.stroke();
    } else if (SHOW_HORNS && s.hornType === 'small') {
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.moveTo(headX - sz * 0.02, headY - sz * 0.34);
      ctx.lineTo(headX - sz * 0.08, headY - sz * 0.5);
      ctx.lineTo(headX + sz * 0.04, headY - sz * 0.38);
      ctx.fill();
    }

    // Eyes: serene closed arc when sleeping/blinking, or white rings when awake
    const eyeXs = [headX + sz * 0.02, headX + sz * 0.26];
    const eyeY = headY + sz * 0.08;
    const eyeR = sz * 0.075;
    const isBlinking = frame % 180 > 172;
    ctx.strokeStyle = '#fafaf9';
    ctx.lineWidth = Math.max(1.5, sz * 0.045);
    ctx.lineCap = 'round';
    for (const ex of eyeXs) {
      ctx.beginPath();
      if (isSleeping || isBlinking || s.eyeStyle === 'sleepy') {
        // Closed eyelid curve
        ctx.arc(ex, eyeY - eyeR * 0.2, eyeR, 0.15 * Math.PI, 0.85 * Math.PI);
      } else {
        ctx.arc(ex, eyeY, eyeR, 0, Math.PI * 2);
      }
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

    // Floating name and quality tag when hovered
    if (isHovered) {
      ctx.save();
      ctx.font = '600 13px "Plus Jakarta Sans", sans-serif';
      const statusLabel = isSleeping ? ' · Snoozing 💤' : isGrazing ? ' · Grazing 🌿' : '';
      const label = `${s.name} (${s.hours}h · ${s.quality}${statusLabel})`;
      const textW = ctx.measureText(label).width;

      ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
      ctx.strokeStyle = 'rgba(254, 240, 138, 0.5)';
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

  // Fireflies
  const drawFireflies = (ctx: CanvasRenderingContext2D, w: number, h: number, frame: number) => {
    for (const p of firefliesRef.current) {
      p.phase += 0.03 * p.speed;
      p.x += Math.cos(p.phase) * 0.4;
      p.y = p.baseY + Math.sin(p.phase * 1.2) * 14;

      if (p.x < 0) p.x = w;
      if (p.x > w) p.x = 0;

      const alpha = 0.3 + Math.sin(frame * 0.06 + p.phase) * 0.4;
      if (alpha > 0) {
        ctx.fillStyle = `rgba(167, 243, 208, ${alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
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
