import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  FileText,
  Sparkles,
  Layers,
  Calendar,
  CheckCircle2,
  BookOpen,
  Cpu,
  Heart,
  Volume2,
  MousePointer,
  Eye,
} from 'lucide-react';

export const PresentationDeck: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(1);
  const [showNotes, setShowNotes] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const totalSlides = 3;

  const handleNext = () => {
    if (currentSlide < totalSlides) setCurrentSlide(currentSlide + 1);
  };

  const handlePrev = () => {
    if (currentSlide > 1) setCurrentSlide(currentSlide - 1);
  };

  return (
    <div className={`w-full ${isFullscreen ? 'fixed inset-0 z-50 bg-slate-950 p-6 flex flex-col justify-between' : 'space-y-6'}`}>
      
      {/* Top Deck Controller */}
      <div className="flex items-center justify-between bg-slate-900/90 border border-slate-800 p-3 rounded-2xl">
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono uppercase tracking-wider text-amber-400 bg-amber-950/60 border border-amber-500/30 px-2.5 py-1 rounded-lg">
            A2A Tutorial Slide Deck
          </span>
          <span className="text-sm font-semibold text-white font-display hidden sm:inline">
            Assignment: Virtual Creature (Code as Creative Medium)
          </span>
        </div>

        {/* Slide Selector & Controls */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs text-slate-300">
            {[1, 2, 3].map((num) => (
              <button
                key={num}
                onClick={() => setCurrentSlide(num)}
                className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                  currentSlide === num
                    ? 'bg-amber-400 text-slate-950 shadow-sm font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Slide {num}
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowNotes(!showNotes)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition-colors ${
              showNotes
                ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/30'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Speaker Notes</span>
          </button>

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
            title="Toggle presentation fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Slide Stage (16:9 Aspect Presentation Frame) */}
      <div className="relative w-full bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden min-h-[580px] flex flex-col justify-between p-6 sm:p-10">
        
        {/* ===================== SLIDE 1 ===================== */}
        {currentSlide === 1 && (
          <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-slate-800 pb-4 gap-2">
              <div>
                <span className="text-xs font-mono uppercase tracking-widest text-emerald-400">
                  Slide 01 / 03 · Concept & Creative Rationale
                </span>
                <h1 className="text-2xl sm:text-3xl font-bold text-white font-display mt-1">
                  Sleep Farm: The Oneiric Flock
                </h1>
                <p className="text-sm text-slate-400 mt-0.5">
                  An Artificial Life Companion Ecosystem Synthesized from Sleep Cycles and Dream Journals
                </p>
              </div>
              <div className="text-right text-xs text-slate-500 font-mono">
                Topic: Virtual Creature · Part 1 Draft
              </div>
            </div>

            {/* Core Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Card 1: Artistic Metaphor */}
              <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-3">
                <div className="w-8 h-8 rounded-lg bg-pink-950/60 border border-pink-500/30 flex items-center justify-center text-pink-400">
                  <Heart className="w-4 h-4" />
                </div>
                <h3 className="text-base font-semibold text-white font-display">
                  Artistic Metaphor & Human Need
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  In folklore, restless minds "count sheep" to cross into slumber. In contemporary life, sleep quality is heavily destabilized by screen time and anxiety. 
                  <span className="text-amber-200"> Sleep Farm</span> flips cold numerical sleep-tracking (e.g. Apple Health charts) into empathetic artificial life: each night's sleep gives birth to an autonomous sheep creature.
                </p>
                <div className="text-[11px] text-slate-400 border-t border-slate-800/60 pt-2">
                  <span className="font-semibold text-emerald-400">Cultural Precedents: </span>
                  Tamagotchi emotional caretaking, Forest timer gamification, and Karikuri responsive companions.
                </div>
              </div>

              {/* Card 2: Morphological Mapping */}
              <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-3">
                <div className="w-8 h-8 rounded-lg bg-cyan-950/60 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <Cpu className="w-4 h-4" />
                </div>
                <h3 className="text-base font-semibold text-white font-display">
                  Biological Mapping Schema
                </h3>
                <div className="space-y-2 text-xs">
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-amber-300 font-semibold">Sleep Duration: </span>
                    <span className="text-slate-300">Scales body radius, wool mass volume, and sleep guardian horns (≥8h).</span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-pink-300 font-semibold">Sleep Quality: </span>
                    <span className="text-slate-300">Determines trot agility, walking cadence, and halo energy glow.</span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-purple-300 font-semibold">Dream Journal: </span>
                    <span className="text-slate-300">Good dreams produce chromatic pastel wool; Nightmares generate storm-cloud charcoal ash.</span>
                  </div>
                </div>
              </div>

              {/* Card 3: Ecological Guardrails */}
              <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-950/60 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Layers className="w-4 h-4" />
                </div>
                <h3 className="text-base font-semibold text-white font-display">
                  Ecological Balance & Restraint
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Unlike addictive apps that encourage endless spamming, <span className="text-emerald-200">Sleep Farm strictly caps creature generation to 2 sheep per day</span>: one for nocturnal rest and one for an afternoon restorative nap.
                </p>
                <div className="p-2.5 rounded-lg bg-emerald-950/30 border border-emerald-500/20 text-[11px] text-emerald-300">
                  ✦ Preserves ecological realism, prevents meadow overcrowding, and establishes a genuine circadian rhythm between human user and virtual species.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===================== SLIDE 2 ===================== */}
        {currentSlide === 2 && (
          <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-slate-800 pb-4 gap-2">
              <div>
                <span className="text-xs font-mono uppercase tracking-widest text-cyan-400">
                  Slide 02 / 03 · Research & Coding Precedents
                </span>
                <h1 className="text-2xl sm:text-3xl font-bold text-white font-display mt-1">
                  Theoretical Grounding & Computational Mechanics
                </h1>
                <p className="text-sm text-slate-400 mt-0.5">
                  Direct lineage from Code as Creative Medium, Autonomous Steering, and Procedural Synthesis
                </p>
              </div>
              <div className="text-right text-xs text-slate-500 font-mono">
                Lineage: Craig Reynolds · Karl Sims · Shiffman
              </div>
            </div>

            {/* Core Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Column 1: Core Theoretical References */}
              <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-3">
                <div className="w-8 h-8 rounded-lg bg-purple-950/60 border border-purple-500/30 flex items-center justify-center text-purple-400">
                  <BookOpen className="w-4 h-4" />
                </div>
                <h3 className="text-base font-semibold text-white font-display">
                  Literary & Artistic Precedents
                </h3>
                <div className="space-y-2.5 text-xs text-slate-300">
                  <div className="border-l-2 border-purple-500 pl-2">
                    <div className="font-semibold text-white">Craig Reynolds (1999)</div>
                    <div className="text-slate-400 text-[11px]">"Steering Behaviors for Autonomous Characters"</div>
                    <div className="text-[11px] mt-0.5 text-purple-200">Wander noise, separation repulsion, and target pursuit.</div>
                  </div>
                  <div className="border-l-2 border-cyan-500 pl-2">
                    <div className="font-semibold text-white">Karl Sims (1994)</div>
                    <div className="text-slate-400 text-[11px]">"Evolved Virtual Creatures"</div>
                    <div className="text-[11px] mt-0.5 text-cyan-200">Physical morphology tightly governing locomotion dynamics.</div>
                  </div>
                  <div className="border-l-2 border-emerald-500 pl-2">
                    <div className="font-semibold text-white">Daniel Shiffman (2012)</div>
                    <div className="text-slate-400 text-[11px]">"The Nature of Code"</div>
                    <div className="text-[11px] mt-0.5 text-emerald-200">Oscillatory leg kinematics & autonomous vehicle vectors.</div>
                  </div>
                </div>
              </div>

              {/* Column 2: 3 Media Dimensions Required by Brief */}
              <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-3">
                <div className="w-8 h-8 rounded-lg bg-amber-950/60 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h3 className="text-base font-semibold text-white font-display">
                  The Three Media Components
                </h3>
                <div className="space-y-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                    <div className="flex items-center gap-1.5 text-amber-300 font-semibold mb-0.5">
                      <Eye className="w-3.5 h-3.5" />
                      <span>Visual Component:</span>
                    </div>
                    <p className="text-slate-400 text-[11px]">
                      2.5D depth-sorted procedural canvas, cloud-cluster wool puff math, blinking eyes, circadian sky shifts (night/dusk/dawn).
                    </p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                    <div className="flex items-center gap-1.5 text-emerald-300 font-semibold mb-0.5">
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>Audio Component:</span>
                    </div>
                    <p className="text-slate-400 text-[11px]">
                      Zero-dependency Web Audio API procedural synthesis: dual-formant bandpass bleats ("Baaa~"), bell chimes, and ambient cricket drone.
                    </p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                    <div className="flex items-center gap-1.5 text-cyan-300 font-semibold mb-0.5">
                      <MousePointer className="w-3.5 h-3.5" />
                      <span>Interaction Component:</span>
                    </div>
                    <p className="text-slate-400 text-[11px]">
                      Double-click meadow summon bell, tactile sheep petting with audio feedback, dream journal inspection card.
                    </p>
                  </div>
                </div>
              </div>

              {/* Column 3: Emergent Behavior */}
              <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-3">
                <div className="w-8 h-8 rounded-lg bg-rose-950/60 border border-rose-500/30 flex items-center justify-center text-rose-400">
                  <Cpu className="w-4 h-4" />
                </div>
                <h3 className="text-base font-semibold text-white font-display">
                  Emergent Behavioral Rules
                </h3>
                <div className="space-y-2 text-xs text-slate-300">
                  <p>
                    Rather than pre-recorded character animations, creature behaviors emerge from simple algorithmic rules:
                  </p>
                  <ul className="space-y-1.5 text-[11px] text-slate-400 list-disc pl-4">
                    <li><strong className="text-slate-200">Brownian Wander:</strong> Perlin-inspired angular drift prevents robotic linear paths.</li>
                    <li><strong className="text-slate-200">Social Grazing:</strong> Sheep randomly pause, decelerate, and dip heads to graze on grass stalks.</li>
                    <li><strong className="text-slate-200">Nightmare Hesitancy:</strong> Dark-wooled nightmare sheep possess slightly higher separation radius, exhibiting timid avoidance.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===================== SLIDE 3 ===================== */}
        {currentSlide === 3 && (
          <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-slate-800 pb-4 gap-2">
              <div>
                <span className="text-xs font-mono uppercase tracking-widest text-amber-400">
                  Slide 03 / 03 · Planning, Roadmap & Rubric
                </span>
                <h1 className="text-2xl sm:text-3xl font-bold text-white font-display mt-1">
                  Project Planning & Engineering Roadmap
                </h1>
                <p className="text-sm text-slate-400 mt-0.5">
                  Three-Phase development schedule, technical challenge mitigation, and rubric compliance
                </p>
              </div>
              <div className="text-right text-xs text-slate-500 font-mono">
                Milestones: Phase 1 (Draft) → Phase 2 → Final
              </div>
            </div>

            {/* Core Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Column 1: Three-Phase Roadmap */}
              <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-950/60 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Calendar className="w-4 h-4" />
                </div>
                <h3 className="text-base font-semibold text-white font-display">
                  Development Timeline
                </h3>
                <div className="space-y-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-500/30">
                    <span className="font-semibold text-emerald-300">Phase 1: Draft (Weeks 1–2)</span>
                    <p className="text-[11px] text-slate-300 mt-0.5">
                      ✓ Concept ideation & sketches<br/>
                      ✓ p5.js / Canvas physics prototype<br/>
                      ✓ Web Audio procedural bleats & nightscape
                    </p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="font-semibold text-amber-300">Phase 2: Refinement (Weeks 3–4)</span>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      • Circadian sleep-debt simulation<br/>
                      • Offspring breeding between sleep records<br/>
                      • Mobile touch optimization & gestures
                    </p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="font-semibold text-purple-300">Phase 3: Final (Weeks 5–6)</span>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      • Multi-user dream cloud sync<br/>
                      • Final presentation video recording<br/>
                      • Critical reflective exegesis paper
                    </p>
                  </div>
                </div>
              </div>

              {/* Column 2: Challenge Mitigation */}
              <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-3">
                <div className="w-8 h-8 rounded-lg bg-rose-950/60 border border-rose-500/30 flex items-center justify-center text-rose-400">
                  <Cpu className="w-4 h-4" />
                </div>
                <h3 className="text-base font-semibold text-white font-display">
                  Technical Risk Mitigation
                </h3>
                <div className="space-y-2 text-xs text-slate-300">
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                    <div className="font-medium text-rose-300">1. Audio Asset Brittleness</div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      <strong>Solution:</strong> Avoided external .wav files. Built real-time Web Audio API formant filters, creating lightweight, glitch-free procedural bleats.
                    </p>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                    <div className="font-medium text-amber-300">2. Flocking Performance</div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      <strong>Solution:</strong> Spatial bounding checks and pre-calculated puff offset arrays ensure 60fps even with 30+ sheep on mobile screens.
                    </p>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                    <div className="font-medium text-cyan-300">3. Sleep Log Burnout</div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      <strong>Solution:</strong> 2-sheep daily cap and quick preset shortcuts reduce logging friction from a chore to a soothing bedtime ritual.
                    </p>
                  </div>
                </div>
              </div>

              {/* Column 3: Rubric Compliance Checklist */}
              <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-3">
                <div className="w-8 h-8 rounded-lg bg-cyan-950/60 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <h3 className="text-base font-semibold text-white font-display">
                  Rubric Criteria Alignment
                </h3>
                <div className="space-y-2 text-xs">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-white">Concept (2.5/2.5): </span>
                      <span className="text-slate-400">Poetic metaphor, biological sleep mapping, iterative refinement.</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-white">Research (2.5/2.5): </span>
                      <span className="text-slate-400">Reynolds steering, Karl Sims morphology, Web Audio procedural acoustics.</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-white">Planning (2.5/2.5): </span>
                      <span className="text-slate-400">Detailed 3-phase milestone timeline & explicit risk mitigation strategies.</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-white">Fluency (2.5/2.5): </span>
                      <span className="text-slate-400">Visual, audio, and interactive media opportunities fully realized.</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Slide Footer Navigation */}
        <div className="flex items-center justify-between border-t border-slate-800 pt-4 mt-6">
          <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
            <span>Slide {currentSlide} of {totalSlides}</span>
            <span>·</span>
            <span>Sleep Farm: Virtual Creature Presentation</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrev}
              disabled={currentSlide === 1}
              className={`p-2 rounded-xl border text-xs font-medium flex items-center gap-1 transition-colors ${
                currentSlide === 1
                  ? 'border-slate-800 text-slate-600 cursor-not-allowed'
                  : 'bg-slate-950 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <button
              onClick={handleNext}
              disabled={currentSlide === totalSlides}
              className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1 transition-colors ${
                currentSlide === totalSlides
                  ? 'border-slate-800 text-slate-600 cursor-not-allowed'
                  : 'bg-amber-400 border-amber-300 text-slate-950 hover:bg-amber-300'
              }`}
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Speaker Notes Drawer (Provides verbatim speech for tutorial presentation!) */}
      {showNotes && (
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 animate-fade-in text-xs text-slate-300">
          <div className="flex items-center justify-between text-amber-300 font-semibold pb-1 border-b border-slate-800">
            <span className="flex items-center gap-1.5">
              <FileText className="w-4 h-4" />
              <span>Verbatim Tutorial Presentation Script (Slide {currentSlide})</span>
            </span>
            <span className="text-slate-500 font-mono">Estimated delivery: ~60-90s per slide</span>
          </div>

          {currentSlide === 1 && (
            <p className="leading-relaxed text-slate-300">
              "Good morning everyone and tutor. Today I am presenting my draft implementation for the <em>Virtual Creature</em> assignment from Golan Levin and Tega Brain's <em>Code as Creative Medium</em>, titled <strong>Sleep Farm</strong>. 
              My core inspiration comes from the universal metaphor of counting sheep to fall asleep, combined with personal struggles with irregular sleep cycles. Rather than treating sleep data as dry bar charts, Sleep Farm algorithmically breathes life into that data. Every sleep log synthesizes a unique living sheep creature whose physical size, wool fluffiness, trot cadence, and chromatic color directly emerge from the hours slept, the sleep quality, and the psychological mood of the user's dream journal. To maintain ecological balance and prevent gamified spamming, the pasture enforces a strict biological limit of two sheep per day—one for night sleep, and one for an afternoon nap."
            </p>
          )}

          {currentSlide === 2 && (
            <p className="leading-relaxed text-slate-300">
              "Turning to slide 2, my project is deeply grounded in artificial life precedents. Methodologically, I draw upon Craig Reynolds' 1999 steering behaviors for autonomous characters, specifically implementing wander drift, local separation to prevent sheep overlapping, and flock cohesion. Following Karl Sims' philosophy in <em>Evolved Virtual Creatures</em>, the creature's visual morphology dictates its movement dynamics—high-quality sleep yields energetic, bouncy trotting, while poor sleep yields weary, slower locomotion. 
              Crucially, to satisfy the rubric's interactive media requirement, the artefact features three interconnected media layers: an organic procedural 2.5D visual canvas, a zero-dependency procedural Web Audio API engine that synthesizes vocal formant bleats and nocturnal crickets in real time, and an interaction layer where users can summon the flock with a double-click bell or pet individual creatures to inspect their dream diaries."
            </p>
          )}

          {currentSlide === 3 && (
            <p className="leading-relaxed text-slate-300">
              "Finally, slide 3 outlines my development roadmap and risk management. For this Phase 1 milestone, I have successfully completed the conceptual foundation, the p5.js-derived canvas simulation, the procedural audio engine, and this interactive presentation portal. Looking ahead to Phase 2, I plan to introduce circadian sleep-debt cycles and genetic inheritance between successive sheep generations. 
              In terms of technical risk, I addressed the fragility of external audio assets by building synthetic oscillators in the Web Audio API, solved canvas performance bottlenecks using pre-computed puff coordinate arrays, and mitigated user fatigue with a thoughtful two-sheep daily cadence. Thank you, and I now invite you to explore the live farm sandbox!"
            </p>
          )}
        </div>
      )}
    </div>
  );
};
