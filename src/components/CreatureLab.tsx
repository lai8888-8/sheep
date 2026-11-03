import React, { useState, useEffect, useRef } from 'react';
import { Sliders, Volume2, Sparkles, Activity, Eye, Zap, Info, Moon, Utensils } from 'lucide-react';
import { DreamType, SleepQuality } from '../types/sheep';
import { soundEngine, getSheepBleatConfig } from '../audio/synth';

export const CreatureLab: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Lab Controls State
  const [hours, setHours] = useState(8.0);
  const [quality, setQuality] = useState<SleepQuality>('Great');
  const [dreamType, setDreamType] = useState<DreamType>('good');
  const [facing, setFacing] = useState<1 | -1>(1);
  const [isGrazing, setIsGrazing] = useState(false);
  const [isSleeping, setIsSleeping] = useState(false);

  // Derived attributes
  const durationScale = Math.min(1.25, Math.max(0.8, 0.82 + hours * 0.035));
  let baseSize = 34;
  let puffCount = 10;
  let energy = 0.6;
  let maxSpeed = 1.1;

  if (quality === 'Great') {
    baseSize = 44;
    puffCount = 12;
    energy = 0.95;
    maxSpeed = 1.6;
  } else if (quality === 'Poor') {
    baseSize = 26;
    puffCount = 8;
    energy = 0.3;
    maxSpeed = 0.8;
  } else {
    baseSize = 34;
    puffCount = 10;
    energy = 0.65;
    maxSpeed = 1.15;
  }

  const finalSize = baseSize * durationScale;
  const voice = getSheepBleatConfig({ hours, size: finalSize, quality, dreamType });

  let woolColor = '#fbcfe8';
  let woolSecondary = '#f472b6';
  let auraGlow = false;

  if (dreamType === 'good') {
    woolColor = '#fbcfe8';
    woolSecondary = '#c084fc';
    auraGlow = true;
  } else if (dreamType === 'bad') {
    woolColor = '#94a3b8';
    woolSecondary = '#64748b';
    auraGlow = false;
  } else {
    woolColor = '#bbf7d0';
    woolSecondary = '#86efac';
    auraGlow = false;
  }

  const hasHorns = hours >= 7.5;

  // Render loop in lab canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let frame = 0;
    let legPhase = 0;

    const render = () => {
      frame++;
      const w = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, w, h);

      // Lab checkered or soft circular background stage
      const cx = w / 2;
      const cy = h / 2 + 30;

      // Platform disc
      ctx.fillStyle = 'rgba(30, 41, 59, 0.5)';
      ctx.beginPath();
      ctx.ellipse(cx, cy + finalSize * 0.7, finalSize * 2.2, finalSize * 0.6, 0, 0, Math.PI * 2);
      ctx.fill();

      // Soft light beam
      const beamGrad = ctx.createRadialGradient(cx, cy - 60, 20, cx, cy, 180);
      beamGrad.addColorStop(0, 'rgba(56, 189, 248, 0.12)');
      beamGrad.addColorStop(1, 'rgba(56, 189, 248, 0)');
      ctx.fillStyle = beamGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, 180, 0, Math.PI * 2);
      ctx.fill();

      // Leg swing (stops if resting or grazing)
      legPhase += (isGrazing || isSleeping ? 0 : maxSpeed) * 0.08;

      // Draw Creature (Valais Blacknose Look matching FarmCanvas)
      ctx.save();
      const sleepSink = isSleeping ? finalSize * 0.16 : 0;
      ctx.translate(cx, cy + sleepSink);
      ctx.scale(facing * 1.5, 1.5); // 1.5x zoom in lab

      const sz = finalSize;
      const wool = woolColor;
      const SHEEP_BLACK = '#1c1917';
      const cleanHex = wool.replace('#', '');
      const n = parseInt(cleanHex.length === 3 ? cleanHex.split('').map((c) => c + c).join('') : cleanHex, 16);
      const f = (v: number) => Math.max(0, Math.min(255, Math.round(v - 0.3 * 255)));
      const outline = `rgb(${f((n >> 16) & 255)}, ${f((n >> 8) & 255)}, ${f(n & 255)})`;
      const OW = Math.max(1.5, sz * 0.05);

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

      // Shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
      ctx.beginPath();
      ctx.ellipse(0, sz * 0.65, sz * 1.05, sz * 0.24, 0, 0, Math.PI * 2);
      ctx.fill();

      // Legs: folded hooves if sleeping, otherwise walking/standing legs
      const legLength = sz * 0.52;
      const legWidth = Math.max(4, sz * 0.13);
      const legSwing = Math.sin(legPhase) * sz * 0.22;

      if (isSleeping) {
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

      // Wool body: tail, torso and satellite puffs (with gentle rhythmic breathing)
      const tailWag = isSleeping ? 0 : Math.sin(frame * 0.15) * 3;
      const breathe = isSleeping ? Math.sin(frame * 0.05) * sz * 0.035 : 0;
      const puffR = sz * 0.32;
      const bodyBlobs: number[][] = [
        [-sz * 0.68, -sz * 0.05 + tailWag, sz * 0.18, sz * 0.18],
        [0, 0, sz * 1.15 + breathe, sz * 0.88 + breathe],
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

      // Soft shade patches
      ctx.globalAlpha = 0.35;
      ctx.fillStyle = woolSecondary;
      ctx.beginPath();
      ctx.ellipse(-sz * 0.1, sz * 0.5, sz * 0.7, sz * 0.2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(-sz * 0.2, -sz * 0.45, sz * 0.45, sz * 0.16, -0.15, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;

      // Head position with chewing bob or serene resting position
      const chew = isGrazing ? Math.sin(frame * 0.3) * sz * 0.04 : 0;
      const headX = sz * 0.58;
      const headY = isGrazing ? sz * 0.22 + chew : isSleeping ? sz * 0.06 + breathe * 0.4 : -sz * 0.08;

      // Black ears
      const earFlutter = isSleeping ? 0 : Math.sin(frame * 0.1) * 2;
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

      // Wool fringe over forehead
      woolGroup([
        [headX - sz * 0.12, headY - sz * 0.26, sz * 0.26, sz * 0.2],
        [headX + sz * 0.1, headY - sz * 0.32, sz * 0.26, sz * 0.2],
        [headX + sz * 0.3, headY - sz * 0.24, sz * 0.2, sz * 0.17],
      ]);

      // Eyes: white rings, or closed white arcs when sleeping / sleepy / blinking
      const eyeXs = [headX + sz * 0.02, headX + sz * 0.26];
      const eyeY = headY + sz * 0.08;
      const eyeR = sz * 0.075;
      const isBlink = frame % 150 > 142;
      ctx.strokeStyle = '#fafaf9';
      ctx.lineWidth = Math.max(1.5, sz * 0.045);
      ctx.lineCap = 'round';
      for (const ex of eyeXs) {
        ctx.beginPath();
        if (isSleeping || isBlink || quality === 'Poor') {
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

      // Snooze zZ bubble on stage
      if (isSleeping) {
        ctx.save();
        ctx.font = 'bold 16px "Plus Jakarta Sans", sans-serif';
        const zAlpha = 0.5 + Math.sin(frame * 0.08) * 0.4;
        ctx.fillStyle = `rgba(186, 230, 253, ${zAlpha})`;
        ctx.fillText('zZ', headX + sz * 0.3, headY - sz * 0.35 + Math.sin(frame * 0.05) * 5);
        ctx.restore();
      }

      ctx.restore();

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [finalSize, woolColor, woolSecondary, auraGlow, hasHorns, quality, facing, isGrazing, isSleeping, maxSpeed]);

  const handleTestBleat = () => {
    soundEngine.playBleatVariation(voice.variety, voice.pitchMod);
  };

  const handleTestChew = () => {
    setIsGrazing(true);
    setIsSleeping(false);
    soundEngine.playChewSound();
  };

  const handleTestSnore = () => {
    setIsSleeping(true);
    setIsGrazing(false);
    soundEngine.playSnoreSound();
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
        <div>
          <h2 className="text-xl font-bold text-white font-display flex items-center gap-2">
            <Sliders className="w-5 h-5 text-cyan-400" />
            <span>Creature Genetics Lab & Parametric Inspector</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time biometric sandbox demonstrating the mathematical formulas mapping sleep to creature phenotype.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleTestChew}
            title="Listen to procedural grass crunch bite"
            className="px-3 py-1.5 rounded-xl bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-900/60 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Utensils className="w-3.5 h-3.5" />
            <span>Munch Grass</span>
          </button>
          <button
            onClick={handleTestSnore}
            title="Listen to gentle procedural breathing snore"
            className="px-3 py-1.5 rounded-xl bg-indigo-950/60 border border-indigo-500/30 text-indigo-300 hover:bg-indigo-900/60 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Moon className="w-3.5 h-3.5" />
            <span>Gentle Snore</span>
          </button>
          <button
            onClick={handleTestBleat}
            title="Listen to parametric bleat vocalization based on current sleep data"
            className="px-3.5 py-1.5 rounded-xl bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-900/60 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>Vocal: {voice.label}</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Visualizer Stage vs Parameter Sliders */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Stage (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col items-center justify-between min-h-[460px]">
          <div className="w-full flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>ISOLATED MORPHOLOGY STAGE</span>
            <span className="text-cyan-400">1.5× MAGNIFICATION</span>
          </div>

          <div className="relative w-full flex items-center justify-center py-6">
            <canvas
              ref={canvasRef}
              width={480}
              height={320}
              className="max-w-full rounded-xl bg-slate-950/80 border border-slate-800/80 shadow-inner"
            />
          </div>

          {/* Real-time Math Output Card */}
          <div className="w-full grid grid-cols-3 gap-3 text-xs bg-slate-950/70 p-3.5 rounded-xl border border-slate-800/80 font-mono">
            <div>
              <span className="text-slate-500 block text-[11px]">Radius Formula</span>
              <span className="text-emerald-400 font-semibold">{Math.round(finalSize)}px</span>
              <span className="text-slate-500 text-[10px] block">base * (0.82 + h*0.035)</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Gait Velocity</span>
              <span className="text-amber-400 font-semibold">{maxSpeed.toFixed(2)} px/f</span>
              <span className="text-slate-500 text-[10px] block">Kinematic trot pace</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Phenotype Feature</span>
              <span className="text-slate-300 font-semibold">Valais Blacknose</span>
              <span className="text-slate-500 text-[10px] block">White ring eyes & black face</span>
            </div>
          </div>
        </div>

        {/* Right Parameter Controls (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800 text-sm font-semibold text-white">
            <Activity className="w-4 h-4 text-cyan-400" />
            <span>Circadian Parameter Modifiers</span>
          </div>

          {/* Slider 1: Sleep Hours */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-medium">Sleep Duration:</span>
              <span className="font-mono text-cyan-300 font-semibold">{hours.toFixed(1)} hrs</span>
            </div>
            <input
              type="range"
              min="1"
              max="14"
              step="0.5"
              value={hours}
              onChange={(e) => setHours(parseFloat(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer"
            />
            <p className="text-[11px] text-slate-500">
              Hours scale cellular wool volume and roundness across the pasture.
            </p>
          </div>

          {/* Radio: Sleep Quality */}
          <div className="space-y-1.5">
            <span className="text-xs text-slate-300 font-medium block">Sleep Quality:</span>
            <div className="grid grid-cols-3 gap-2">
              {(['Great', 'Okay', 'Poor'] as SleepQuality[]).map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => setQuality(q)}
                  className={`py-2 px-2.5 rounded-xl border text-xs font-medium transition-colors ${
                    quality === q
                      ? 'bg-cyan-950/70 border-cyan-500/50 text-cyan-300 font-semibold shadow-sm'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {q}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-slate-500">
              Alters physical vitality, eyelid alertness, and harmonic trot speed.
            </p>
          </div>

          {/* Radio: Dream Type */}
          <div className="space-y-1.5">
            <span className="text-xs text-slate-300 font-medium block">Dream Sentiment Mood:</span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setDreamType('good')}
                className={`py-2 px-2.5 rounded-xl border text-xs font-medium transition-colors ${
                  dreamType === 'good'
                    ? 'bg-pink-950/70 border-pink-500/50 text-pink-300 font-semibold'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                Lucid / Good
              </button>
              <button
                type="button"
                onClick={() => setDreamType('neutral')}
                className={`py-2 px-2.5 rounded-xl border text-xs font-medium transition-colors ${
                  dreamType === 'neutral'
                    ? 'bg-emerald-950/70 border-emerald-500/50 text-emerald-300 font-semibold'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                Peaceful
              </button>
              <button
                type="button"
                onClick={() => setDreamType('bad')}
                className={`py-2 px-2.5 rounded-xl border text-xs font-medium transition-colors ${
                  dreamType === 'bad'
                    ? 'bg-slate-800 border-slate-600 text-slate-200 font-semibold'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                Nightmare
              </button>
            </div>
            <p className="text-[11px] text-slate-500">
              Shifts wool pigmentation from cotton-candy pastel to storm ash.
            </p>
          </div>

          {/* Secondary Toggles */}
          <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
            <button
              onClick={() => setFacing((f) => (f === 1 ? -1 : 1))}
              className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 hover:text-white"
            >
              Flip ({facing === 1 ? 'Right' : 'Left'})
            </button>
            <button
              onClick={() => {
                setIsGrazing((g) => {
                  const next = !g;
                  if (next) {
                    setIsSleeping(false);
                    soundEngine.playChewSound();
                  }
                  return next;
                });
              }}
              className={`px-3 py-1.5 rounded-lg border transition-colors ${
                isGrazing
                  ? 'bg-emerald-950 border-emerald-500/40 text-emerald-300 font-semibold'
                  : 'bg-slate-950 border-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              {isGrazing ? 'Grazing 🌿' : 'Simulate Grazing'}
            </button>
            <button
              onClick={() => {
                setIsSleeping((s) => {
                  const next = !s;
                  if (next) {
                    setIsGrazing(false);
                    soundEngine.playSnoreSound();
                  }
                  return next;
                });
              }}
              className={`px-3 py-1.5 rounded-lg border transition-colors ${
                isSleeping
                  ? 'bg-indigo-950 border-indigo-500/40 text-indigo-300 font-semibold'
                  : 'bg-slate-950 border-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              {isSleeping ? 'Snoozing 💤' : 'Simulate Sleep'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
