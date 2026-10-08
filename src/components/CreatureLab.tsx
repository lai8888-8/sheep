import React, { useState, useEffect, useRef } from 'react';
import { Sliders, Volume2, Sparkles, Activity, Eye, Zap, Info } from 'lucide-react';
import { DreamType, SleepQuality } from '../types/sheep';
import { soundEngine } from '../audio/synth';

export const CreatureLab: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Lab Controls State
  const [hours, setHours] = useState(8.0);
  const [quality, setQuality] = useState<SleepQuality>('Great');
  const [dreamType, setDreamType] = useState<DreamType>('good');
  const [facing, setFacing] = useState<1 | -1>(1);
  const [isGrazing, setIsGrazing] = useState(false);

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

  let woolColor = '#fbcfe8';
  let woolSecondary = '#f472b6';
  let auraGlow = false;

  if (dreamType === 'good') {
    woolColor = '#fbcfe8';
    woolSecondary = '#c084fc';
    auraGlow = true;
  } else if (dreamType === 'bad') {
    woolColor = '#64748b';
    woolSecondary = '#334155';
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

      // Leg swing
      legPhase += (isGrazing ? 0 : maxSpeed) * 0.08;

      // Draw Creature
      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(facing * 1.5, 1.5); // 1.5x zoom in lab

      const sz = finalSize;

      if (auraGlow) {
        const glow = ctx.createRadialGradient(0, 0, sz * 0.4, 0, 0, sz * 1.3);
        glow.addColorStop(0, 'rgba(253, 224, 71, 0.35)');
        glow.addColorStop(1, 'rgba(253, 224, 71, 0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.ellipse(0, 0, sz * 1.3, sz * 1.1, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      // Shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
      ctx.beginPath();
      ctx.ellipse(0, sz * 0.65, sz * 1.05, sz * 0.24, 0, 0, Math.PI * 2);
      ctx.fill();

      // Legs
      const legLength = sz * 0.52;
      const legWidth = Math.max(3.5, sz * 0.11);
      const legSwing = Math.sin(legPhase) * sz * 0.22;
      ctx.lineWidth = legWidth;
      ctx.lineCap = 'round';

      const legPositions = [
        { bx: -sz * 0.38, swing: legSwing },
        { bx: -sz * 0.16, swing: -legSwing },
        { bx: sz * 0.14, swing: legSwing },
        { bx: sz * 0.36, swing: -legSwing },
      ];

      for (const leg of legPositions) {
        const startY = sz * 0.35;
        const endX = leg.bx + (isGrazing ? 0 : leg.swing);
        const endY = startY + legLength;

        ctx.strokeStyle = '#d6d3d1';
        ctx.beginPath();
        ctx.moveTo(leg.bx, startY);
        ctx.lineTo(endX, endY);
        ctx.stroke();

        ctx.strokeStyle = '#78716c';
        ctx.beginPath();
        ctx.moveTo(endX, endY - 2);
        ctx.lineTo(endX, endY + 2);
        ctx.stroke();
      }

      // Tail
      ctx.fillStyle = woolColor;
      ctx.beginPath();
      ctx.arc(-sz * 0.68, -sz * 0.05 + Math.sin(frame * 0.15) * 3, sz * 0.18, 0, Math.PI * 2);
      ctx.fill();

      // Central Torso
      ctx.beginPath();
      ctx.ellipse(0, 0, sz * 1.15, sz * 0.88, 0, 0, Math.PI * 2);
      ctx.fill();

      // Satellite Puffs
      const puffR = sz * 0.32;
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
        ctx.arc(p[0], p[1], puffR, 0, Math.PI * 2);
        ctx.fill();
      }

      // Head
      const headOffsetY = isGrazing ? sz * 0.22 : -sz * 0.08;
      const headX = sz * 0.58;
      const headY = headOffsetY;

      ctx.beginPath();
      ctx.ellipse(headX, headY, sz * 0.6, sz * 0.55, 0, 0, Math.PI * 2);
      ctx.fill();

      // Crown bangs
      ctx.fillStyle = woolSecondary;
      ctx.beginPath();
      ctx.arc(headX - sz * 0.14, headY - sz * 0.34, sz * 0.22, 0, Math.PI * 2);
      ctx.arc(headX + sz * 0.06, headY - sz * 0.38, sz * 0.22, 0, Math.PI * 2);
      ctx.arc(headX + sz * 0.24, headY - sz * 0.3, sz * 0.18, 0, Math.PI * 2);
      ctx.fill();

      // Face skin
      ctx.fillStyle = '#ffedd5';
      ctx.beginPath();
      ctx.ellipse(headX + sz * 0.14, headY + sz * 0.04, sz * 0.38, sz * 0.34, 0, 0, Math.PI * 2);
      ctx.fill();

      // Ears
      const earFlutter = Math.sin(frame * 0.1) * 2;
      ctx.fillStyle = '#fbcfe8';
      ctx.beginPath();
      ctx.ellipse(headX - sz * 0.12, headY - sz * 0.08 + earFlutter, sz * 0.18, sz * 0.09, -0.4, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.ellipse(headX + sz * 0.36, headY - sz * 0.04 - earFlutter, sz * 0.15, sz * 0.08, 0.4, 0, Math.PI * 2);
      ctx.fill();

      // Horns
      if (hasHorns) {
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = sz * 0.09;
        ctx.beginPath();
        ctx.arc(headX - sz * 0.05, headY - sz * 0.32, sz * 0.22, 0.8 * Math.PI, 1.8 * Math.PI);
        ctx.stroke();
      }

      // Eyes
      const isBlink = frame % 150 > 142;
      if (isBlink || quality === 'Poor') {
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

      // Cheeks
      ctx.fillStyle = 'rgba(244, 114, 182, 0.45)';
      ctx.beginPath();
      ctx.ellipse(headX + sz * 0.05, headY + sz * 0.14, sz * 0.09, sz * 0.055, 0, 0, Math.PI * 2);
      ctx.ellipse(headX + sz * 0.32, headY + sz * 0.14, sz * 0.08, sz * 0.05, 0, 0, Math.PI * 2);
      ctx.fill();

      // Muzzle
      ctx.strokeStyle = '#57534e';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(headX + sz * 0.18, headY + sz * 0.14);
      ctx.lineTo(headX + sz * 0.18, headY + sz * 0.2);
      ctx.moveTo(headX + sz * 0.13, headY + sz * 0.24);
      ctx.quadraticCurveTo(headX + sz * 0.18, headY + sz * 0.21, headX + sz * 0.23, headY + sz * 0.24);
      ctx.stroke();

      ctx.restore();

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [finalSize, woolColor, woolSecondary, auraGlow, hasHorns, quality, facing, isGrazing, maxSpeed]);

  const handleTestBleat = () => {
    soundEngine.playBleat(quality === 'Poor' ? 1.25 : quality === 'Great' ? 0.95 : 1.05);
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

        <button
          onClick={handleTestBleat}
          className="px-3.5 py-2 rounded-xl bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-900/60 text-xs font-semibold flex items-center gap-2 transition-colors self-start sm:self-auto"
        >
          <Volume2 className="w-4 h-4" />
          <span>Acoustic Vocal Test</span>
        </button>
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
              <span className="text-slate-500 block text-[11px]">Aura Status</span>
              <span className={auraGlow ? 'text-pink-400 font-semibold' : 'text-slate-400'}>
                {auraGlow ? 'Active Halo' : 'Dormant'}
              </span>
              <span className="text-slate-500 text-[10px] block">Lucid resonance</span>
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
              Hours scale cellular wool volume; ≥7.5h develops ancestral celestial horns.
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
          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
            <button
              onClick={() => setFacing((f) => (f === 1 ? -1 : 1))}
              className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 hover:text-white"
            >
              Flip Facing ({facing === 1 ? 'Right' : 'Left'})
            </button>
            <button
              onClick={() => setIsGrazing((g) => !g)}
              className={`px-3 py-1.5 rounded-lg border transition-colors ${
                isGrazing
                  ? 'bg-emerald-950 border-emerald-500/40 text-emerald-300'
                  : 'bg-slate-950 border-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              {isGrazing ? 'Grazing Active' : 'Start Grazing'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
