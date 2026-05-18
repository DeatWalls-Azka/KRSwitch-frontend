import { useEffect, useRef } from 'react';

// ---------------------------------------------------------------------------
// Subtle animated network node background — emerald green palette
// Nodes are seeded on a jittered grid to avoid clumping and lone outliers.
// They drift with gentle sinusoidal wave motion and draw soft lines between
// close neighbours, connecting and disconnecting organically as they move.
// ---------------------------------------------------------------------------

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  opacity: number;
  opacityDir: number;
  phase: number;
}

// Node count is now calculated dynamically based on screen width
const MAX_DIST = 160; // px — max distance to draw a connection line
const MAX_OPACITY_NODE = 0.25;
const MAX_OPACITY_LINE = 0.25;
const MIN_OPACITY_NODE = 0;
const MIN_OPACITY_LINE = 0;

// Emerald-500 / Emerald-600
const NODE_COLOR = '16, 185, 129';  // emerald-500  rgb
const LINE_COLOR = '5, 150, 105';   // emerald-600  rgb

export default function NetworkBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    // Fit canvas to its CSS container
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);



    // Determine node count dynamically based on screen width (clamped 50-150)
    const nodeCount = Math.max(50, Math.min(150, Math.floor(window.innerWidth / 10)));

    // ── Jittered-grid seeding ─────────────────────────────────────────────
    // Divide the canvas into a grid and place one node per cell with a random
    // offset inside the cell. This guarantees even distribution with no
    // clumping or isolated lone nodes.
    const cols = Math.round(Math.sqrt(nodeCount * (canvas.width / canvas.height)));
    const rows = Math.ceil(nodeCount / cols);
    const cellW = canvas.width / cols;
    const cellH = canvas.height / rows;

    const nodes: Node[] = [];
    for (let i = 0; i < nodeCount; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      nodes.push({
        x: (col + Math.random()) * cellW,
        y: (row + Math.random()) * cellH,
        // Slower base velocity with more variance between nodes (some move very little, some move a bit more)
        vx: (Math.random() - 0.5) * (Math.random() * 0.2 + 0.05),
        vy: (Math.random() - 0.5) * (Math.random() * 0.2 + 0.05),
        radius: Math.random() * 1.5 + 0.7,
        opacity: MIN_OPACITY_NODE + Math.random() * (MAX_OPACITY_NODE - MIN_OPACITY_NODE),
        opacityDir: Math.random() > 0.5 ? 1 : -1,
        phase: Math.random() * Math.PI * 2,
      });
    }

    let t = 0;

    const draw = () => {
      t += 0.003; // Slower wave time progression
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // ── Update positions ───────────────────────────────────────────────
      for (const n of nodes) {
        // Smaller wave amplitude for calmer movement
        n.x += n.vx + Math.sin(t + n.phase) * 0.08;
        n.y += n.vy + Math.cos(t + n.phase * 0.8) * 0.08;



        // Wrap gracefully out of bounds so nodes drift off-screen fully before wrapping
        // Margin increased to 200px so off-screen nodes can still connect to on-screen nodes
        const margin = 200;
        if (n.x < -margin) n.x = canvas.width + margin;
        if (n.x > canvas.width + margin) n.x = -margin;
        if (n.y < -margin) n.y = canvas.height + margin;
        if (n.y > canvas.height + margin) n.y = -margin;

        // Calm breathing pulse
        n.opacity += n.opacityDir * 0.0025;
        if (n.opacity >= MAX_OPACITY_NODE) n.opacityDir = -1;
        if (n.opacity <= MIN_OPACITY_NODE) n.opacityDir = 1;
      }

      // ── Draw edges ─────────────────────────────────────────────────────
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i];
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d = Math.sqrt(dx * dx + dy * dy);

          if (d < MAX_DIST) {
            const alpha = MIN_OPACITY_LINE + (MAX_OPACITY_LINE - MIN_OPACITY_LINE) * (1 - d / MAX_DIST);
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(${LINE_COLOR}, ${alpha.toFixed(3)})`;
            ctx.lineWidth = 1.2;
            ctx.stroke();
          }
        }
      }

      // ── Draw nodes ─────────────────────────────────────────────────────
      for (const n of nodes) {
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);

        ctx.fillStyle = `rgba(${NODE_COLOR}, ${n.opacity.toFixed(3)})`;
        ctx.fill();
      }

      animId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="absolute inset-0 w-full h-full pointer-events-none z-0"
    />
  );
}
