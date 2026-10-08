import React, { useEffect, useRef, useState } from 'react';
import { AmbientParticle, DreamFodder, SheepCreature } from '../types/sheep';
import { updateFlock } from './flock';
import { soundEngine } from '../audio/synth';

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
  const [petEffects, setPetEffects] = useState<Array<{ x: number; y: number; life: number }>>([]);

  const starsRef = useRef<Array<{ x: number; y: number; r: number; baseA: number; speed: number }>>([]);
  const firefliesRef = useRef<AmbientParticle[]>([]);
  const grassBladesRef = useRef<Array<{ x: number; h: number; swayOffset: number; color: string }>>([]);

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
        drawSheep(ctx, s, frame, s.id === hoveredSheepId, showDebugForces);
      }

      // Fireflies
      drawFireflies(ctx, w, h, frame);

      // Pet heart particles
      drawPetParticles(ctx);

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

  // The Sheep Creature Rendering
  const drawSheep = (
    ctx: CanvasRenderingContext2D,
    s: SheepCreature,
    frame: number,
    isHovered: boolean,
    showDebug: boolean
  ) => {
    ctx.save();
    ctx.translate(s.x, s.y);

    const scaleX = s.facing;
    ctx.scale(scaleX, 1);

    const sz = s.size;
    const isGrazing = s.isGrazing;

    // Optional aura glow for Good / Lucid Dreams
    if (s.auraGlow) {
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

    // Four legs with sinusoidal walking cycle
    const legLength = sz * 0.52;
    const legWidth = Math.max(3.5, sz * 0.11);
    const legSwing = Math.sin(s.legPhase) * sz * 0.22;
    const legColor = '#d6d3d1';
    const hoofColor = '#78716c';

    const legPositions = [
      { bx: -sz * 0.38, swing: legSwing },
      { bx: -sz * 0.16, swing: -legSwing },
      { bx: sz * 0.14, swing: legSwing },
      { bx: sz * 0.36, swing: -legSwing },
    ];

    ctx.lineWidth = legWidth;
    ctx.lineCap = 'round';
    for (const leg of legPositions) {
      const startY = sz * 0.35;
      const endX = leg.bx + (isGrazing ? 0 : leg.swing);
      const endY = startY + legLength;

      ctx.strokeStyle = legColor;
      ctx.beginPath();
      ctx.moveTo(leg.bx, startY);
      ctx.lineTo(endX, endY);
      ctx.stroke();

      ctx.strokeStyle = hoofColor;
      ctx.beginPath();
      ctx.moveTo(endX, endY - 2);
      ctx.lineTo(endX, endY + 2);
      ctx.stroke();
    }

    // Tail (wagging gently)
    const tailWag = Math.sin(frame * 0.15) * 3;
    ctx.fillStyle = s.woolColor;
    ctx.beginPath();
    ctx.arc(-sz * 0.68, -sz * 0.05 + tailWag, sz * 0.18, 0, Math.PI * 2);
    ctx.fill();

    // Central Torso Fluff
    ctx.fillStyle = s.woolColor;
    ctx.beginPath();
    ctx.ellipse(0, 0, sz * 1.15, sz * 0.88, 0, 0, Math.PI * 2);
    ctx.fill();

    // Procedural Satellite Wool Puffs
    const puffRadius = sz * 0.32;
    const puffs = [
      [-sz * 0.5, -sz * 0.15],
      [-sz * 0.38, -sz * 0.35],
      [-sz * 0.15, -sz * 0.42],
      [sz * 0.1, -sz * 0.42],
      [sz * 0.32, -sz * 0.32],
      [sz * 0.45, -sz * 0.1],
      [sz * 0.35, sz * 0.18],
      [sz * 0.12, sz * 0.35],
      [-sz * 0.18, sz * 0.35],
      [-sz * 0.42, sz * 0.2],
    ];

    for (const p of puffs) {
      ctx.beginPath();
      ctx.arc(p[0], p[1], puffRadius, 0, Math.PI * 2);
      ctx.fill();
    }

    // Head position: tilts down if grazing
    const headOffsetY = isGrazing ? sz * 0.22 : -sz * 0.08;
    const headX = sz * 0.58;
    const headY = headOffsetY;

    // Head base wool puff
    ctx.beginPath();
    ctx.ellipse(headX, headY, sz * 0.6, sz * 0.55, 0, 0, Math.PI * 2);
    ctx.fill();

    // Crown / Bangs wool puffs
    ctx.fillStyle = s.woolSecondaryColor;
    ctx.beginPath();
    ctx.arc(headX - sz * 0.14, headY - sz * 0.34, sz * 0.22, 0, Math.PI * 2);
    ctx.arc(headX + sz * 0.06, headY - sz * 0.38, sz * 0.22, 0, Math.PI * 2);
    ctx.arc(headX + sz * 0.24, headY - sz * 0.3, sz * 0.18, 0, Math.PI * 2);
    ctx.fill();

    // Soft Skin Face
    ctx.fillStyle = '#ffedd5';
    ctx.beginPath();
    ctx.ellipse(headX + sz * 0.14, headY + sz * 0.04, sz * 0.38, sz * 0.34, 0, 0, Math.PI * 2);
    ctx.fill();

    // Cute Droopy / Perked Ears
    const earFlutter = Math.sin(frame * 0.1 + s.id) * 2;
    ctx.fillStyle = '#fbcfe8';
    ctx.beginPath();
    ctx.ellipse(headX - sz * 0.12, headY - sz * 0.08 + earFlutter, sz * 0.18, sz * 0.09, -0.4, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.ellipse(headX + sz * 0.36, headY - sz * 0.04 - earFlutter, sz * 0.15, sz * 0.08, 0.4, 0, Math.PI * 2);
    ctx.fill();

    // Horns for deep sleepers
    if (s.hornType === 'spiral') {
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = sz * 0.09;
      ctx.beginPath();
      ctx.arc(headX - sz * 0.05, headY - sz * 0.32, sz * 0.22, 0.8 * Math.PI, 1.8 * Math.PI);
      ctx.stroke();
    } else if (s.hornType === 'small') {
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.moveTo(headX - sz * 0.02, headY - sz * 0.28);
      ctx.lineTo(headX - sz * 0.08, headY - sz * 0.44);
      ctx.lineTo(headX + sz * 0.04, headY - sz * 0.32);
      ctx.fill();
    }

    // Eyes: Blink animation
    const isBlinking = frame % 180 > 172;
    if (isBlinking || s.eyeStyle === 'sleepy') {
      ctx.strokeStyle = '#44403c';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.arc(headX + sz * 0.1, headY + sz * 0.02, sz * 0.07, 0.2 * Math.PI, 0.8 * Math.PI);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(headX + sz * 0.28, headY + sz * 0.02, sz * 0.07, 0.2 * Math.PI, 0.8 * Math.PI);
      ctx.stroke();
    } else {
      ctx.fillStyle = '#1c1917';
      ctx.beginPath();
      ctx.arc(headX + sz * 0.1, headY + sz * 0.02, sz * 0.075, 0, Math.PI * 2);
      ctx.arc(headX + sz * 0.28, headY + sz * 0.02, sz * 0.075, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(headX + sz * 0.12, headY, sz * 0.025, 0, Math.PI * 2);
      ctx.arc(headX + sz * 0.3, headY, sz * 0.025, 0, Math.PI * 2);
      ctx.fill();
    }

    // Rosy Cheeks
    ctx.fillStyle = 'rgba(244, 114, 182, 0.45)';
    ctx.beginPath();
    ctx.ellipse(headX + sz * 0.05, headY + sz * 0.14, sz * 0.09, sz * 0.055, 0, 0, Math.PI * 2);
    ctx.ellipse(headX + sz * 0.32, headY + sz * 0.14, sz * 0.08, sz * 0.05, 0, 0, Math.PI * 2);
    ctx.fill();

    // Mouth
    ctx.strokeStyle = '#57534e';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(headX + sz * 0.18, headY + sz * 0.14);
    ctx.lineTo(headX + sz * 0.18, headY + sz * 0.2);
    ctx.moveTo(headX + sz * 0.13, headY + sz * 0.24);
    ctx.quadraticCurveTo(headX + sz * 0.18, headY + sz * 0.21, headX + sz * 0.23, headY + sz * 0.24);
    ctx.stroke();

    // Hover Highlight outline
    if (isHovered) {
      ctx.strokeStyle = '#fde047';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.ellipse(0, 0, sz * 1.35, sz * 1.05, 0, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Debug Steering Velocity Vector
    if (showDebug) {
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(s.vx * 30 * scaleX, s.vy * 30);
      ctx.stroke();
    }

    ctx.restore();

    // Floating Name & Quality Tag if Hovered
    if (isHovered) {
      ctx.save();
      ctx.font = '600 13px "Plus Jakarta Sans", sans-serif';
      const label = `${s.name} (${s.hours}h · ${s.quality})`;
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

  // Pet heart particles
  const drawPetParticles = (ctx: CanvasRenderingContext2D) => {
    if (petEffects.length === 0) return;

    setPetEffects((prev) =>
      prev
        .map((p) => ({ ...p, y: p.y - 1.2, life: p.life - 0.025 }))
        .filter((p) => p.life > 0)
    );

    for (const p of petEffects) {
      ctx.save();
      ctx.fillStyle = `rgba(244, 114, 182, ${p.life})`;
      ctx.translate(p.x, p.y);
      ctx.scale(0.8 * p.life, 0.8 * p.life);
      ctx.font = '20px serif';
      ctx.textAlign = 'center';
      ctx.fillText('💖', 0, 0);
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
      if (d < s.size * 1.3) {
        // Pet sheep
        s.lastPetTime = Date.now();
        soundEngine.playBleat(s.quality === 'Poor' ? 1.2 : s.quality === 'Great' ? 0.95 : 1.05);
        soundEngine.playPetSound();

        // Spawn heart particle
        setPetEffects((prev) => [...prev, { x: s.x, y: s.y - s.size * 0.8, life: 1.0 }]);

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
