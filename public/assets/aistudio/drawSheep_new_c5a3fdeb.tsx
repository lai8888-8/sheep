  // ===== NEW SHEEP LOOK =====================================================
  // Paste this over the whole old `const drawSheep = ...;` block in
  // src/simulation/FarmCanvas.tsx (from `const drawSheep = (` down to the
  // closing `};` just above the `// Fireflies` comment).
  //
  // Style: round wool body (colour + size come from the data), black face,
  // ears and legs, white ring eyes, small Y mouth, darker outline on the wool.

  // --- Look settings: change these two lines to switch features on/off ---
  const SHOW_HORNS = false; // true = draw horns for long sleepers (hornType)
  const SHOW_AURA = false; // true = keep the yellow glow for good dreams
  const SHEEP_BLACK = '#1c1917';

  // Darken (amt < 0) or lighten (amt > 0) a #rrggbb colour
  const shade = (hex: string, amt: number): string => {
    const n = parseInt(hex.replace('#', ''), 16);
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
    ctx.translate(s.x, s.y);

    const scaleX = s.facing;
    ctx.scale(scaleX, 1);

    const sz = s.size;
    const isGrazing = s.isGrazing;
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

    // Black legs with the same walking cycle as before (stand still when grazing)
    const legLength = sz * 0.52;
    const legWidth = Math.max(4, sz * 0.13);
    const legSwing = Math.sin(s.legPhase) * sz * 0.22;
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

    // Wool body: tail, torso and satellite puffs (one outlined group)
    const tailWag = Math.sin(frame * 0.15) * 3;
    const puffR = sz * 0.32;
    const bodyBlobs: number[][] = [
      [-sz * 0.68, -sz * 0.05 + tailWag, sz * 0.18, sz * 0.18], // tail
      [0, 0, sz * 1.15, sz * 0.88], // torso
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

    // Head position: lowers while grazing, with a small chewing bob
    const chew = isGrazing ? Math.sin(frame * 0.3) * sz * 0.03 : 0;
    const headX = sz * 0.58;
    const headY = (isGrazing ? sz * 0.22 : -sz * 0.08) + chew;

    // Black ears (behind the face)
    const earFlutter = Math.sin(frame * 0.1 + s.id) * 2;
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

    // Eyes: white rings, or closed white arcs when blinking / sleepy
    const eyeXs = [headX + sz * 0.02, headX + sz * 0.26];
    const eyeY = headY + sz * 0.08;
    const eyeR = sz * 0.075;
    const isBlinking = frame % 180 > 172;
    ctx.strokeStyle = '#fafaf9';
    ctx.lineWidth = Math.max(1.5, sz * 0.045);
    ctx.lineCap = 'round';
    for (const ex of eyeXs) {
      ctx.beginPath();
      if (isBlinking || s.eyeStyle === 'sleepy') {
        ctx.arc(ex, eyeY - eyeR * 0.3, eyeR, 0.15 * Math.PI, 0.85 * Math.PI);
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

    // Floating name and quality tag when hovered (unchanged)
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
