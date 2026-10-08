# Sleep Farm: The Oneiric Flock 🐑🌙
> **Interactive Media & Artificial Life Artefact**  
> Based on *Code as Creative Medium* (Golan Levin & Tega Brain) — Part 1: *Virtual Creature*  

---

## 📖 Concept & Overview

**Sleep Farm** is an interactive artificial life ecosystem that transforms circadian sleep records and dream diaries into autonomous virtual creatures. Rather than treating sleep as cold quantified telemetry, the project draws upon the universal folklore metaphor of *"counting sheep to fall asleep"* and reimagines it as an empathetic companion system.

Every night's rest synthesizes an algorithmic sheep whose morphology and movement emerge from:
1. **Sleep Duration (0.5h – 14h)**: Scales cellular wool volume, mass, and unlocks mythical celestial horns ($\ge 7.5\text{h}$).
2. **Sleep Quality (Great / Okay / Poor)**: Regulates trot velocity, harmonic stride kinematics, eyelid alertness, and vitality aura.
3. **Dream Sentiment (Good / Nightmare / Neutral)**: Alters wool pigmentation (chromatic pastel vs. storm-cloud ash vs. mint sage) and social repulsion distance.

To prevent gamified exploitation and preserve ecological realism, the farm enforces a strict biological capacity limit of **two sheep per day** (one for night sleep, one for an afternoon nap).

---

## 🎨 Three Media Components (Rubric Alignment)

- **Visual Component**:
  - Procedural 2.5D depth-sorted Canvas rendering.
  - Multi-puff cloud-cluster wool geometry and sinusoidal 4-leg walk cycles.
  - Circadian atmospheric lighting engine (Night with twinkling stars & fireflies, Twilight, and Dawn).
- **Audio Component (Zero External Asset Dependencies)**:
  - Procedural Web Audio API acoustic formant synthesis.
  - Dual-bandpass vocal tract filters (~650Hz & ~1350Hz) and throat tremor LFOs synthesize realistic, adorable sheep bleats (`Baaa~`).
  - Generative nocturnal soundscape: periodic cricket chirps and warm sub-bass sleep drone.
  - Resonant pasture bell chimes.
- **Interaction Component**:
  - **Craig Reynolds Autonomous Steering Behaviors**: Smooth Brownian wander, local peer separation (anti-overlap), and weak flock cohesion.
  - **Pasture Summon**: Double-clicking the meadow (or clicking Summon Bell) drops glowing dream clover fodder that draws the herd.
  - **Emotional Caretaking**: Clicking any sheep pets it, triggers heart particles, plays a vocal bleat, and reveals the creature's dream diary card.
  - **Sheep Compendium & Genetics Lab (图鉴)**: An illustrated bestiary documenting 6 discovered phenotypes and an interactive real-time parameter sandbox.

---

## 🚀 Quick Start & Development

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (version 18 or newer)
- npm or pnpm

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/your-username/sleep-farm.git
cd sleep-farm

# Install dependencies
npm install

# Start local development server
npm run dev
```
Open your browser at `http://localhost:3000` to interact with the farm.

### 3. Production Build
```bash
npm run build
```
Generates clean, optimized static production assets in the `dist/` directory ready for deployment to GitHub Pages or Vercel.

---

## 📚 Academic Grounding & References
- **Golan Levin & Tega Brain (2021)**: *Code as Creative Medium: A Handbook for Computational Art and Design*, MIT Press.
- **Craig W. Reynolds (1999)**: *"Steering Behaviors for Autonomous Characters"*, Game Developers Conference.
- **Karl Sims (1994)**: *"Evolved Virtual Creatures"*, ACM SIGGRAPH.
- **Daniel Shiffman (2012)**: *The Nature of Code: Simulating Natural Systems with Processing*.
- **Design I/O (2015)**: *Connected Worlds*, New York Hall of Science.

---

## 📄 License
MIT License. Created for Interactive Media / Interaction Design Academic Submission.
