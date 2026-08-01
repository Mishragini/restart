import { motion, useAnimationFrame } from "motion/react";
import { useMemo, useRef } from "react";

type Pt = { x: number; y: number };

const anchors: Pt[] = [
  { x: 40, y: 165 },
  { x: 110, y: 120 },
  { x: 240, y: 200 },
  { x: 360, y: 125 },
  { x: 485, y: 70 },
  { x: 610, y: 155 },
  { x: 690, y: 95 },
];

function baseYAt(x: number) {
  let i = 0;
  while (i < anchors.length - 2 && anchors[i + 1].x < x) i++;

  const p0 = anchors[Math.max(i - 1, 0)];
  const p1 = anchors[i];
  const p2 = anchors[Math.min(i + 1, anchors.length - 1)];
  const p3 = anchors[Math.min(i + 2, anchors.length - 1)];

  const span = p2.x - p1.x || 1;
  const t = Math.min(Math.max((x - p1.x) / span, 0), 1);
  const t2 = t * t;
  const t3 = t2 * t;

  return (
    0.5 *
    (2 * p1.y +
      (-p0.y + p2.y) * t +
      (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 +
      (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3)
  );
}

function edgeTaper(x: number, xMin: number, xMax: number, feather = 40) {
  const left = Math.min(1, (x - xMin) / feather);
  const right = Math.min(1, (xMax - x) / feather);
  const t = Math.max(0, Math.min(left, right));
  return t * t * (3 - 2 * t);
}

const X_MIN = anchors[0].x;
const X_MAX = anchors[anchors.length - 1].x;
const STEP = 6;

const WAVELENGTH = 350;
const AMPLITUDE = 30; // was 20 — bigger swing on the y-axis
const K = (2 * Math.PI) / WAVELENGTH;

const sampleXs: number[] = [];
for (let x = X_MIN; x <= X_MAX; x += STEP) sampleXs.push(x);
if (sampleXs[sampleXs.length - 1] !== X_MAX) sampleXs.push(X_MAX);

// Precompute the static parts ONCE — these never change frame to frame.
const baseYs = sampleXs.map((x) => baseYAt(x));
const tapers = sampleXs.map((x) => edgeTaper(x, X_MIN, X_MAX));

// Gradient scroll settings
const GRADIENT_X1 = 40;
const GRADIENT_X2 = 690;
const GRADIENT_CYCLE = GRADIENT_X2 - GRADIENT_X1; // one full tile width
const GRADIENT_SPEED = 0.03; // px per ms — increase for faster color flow

export const GraphSVG = ({ className = "" }: { className?: string }) => {
  const pathRef = useRef<SVGPathElement>(null);
  const gradientRef = useRef<SVGLinearGradientElement>(null);
  const phase = useRef(0);
  const gradientOffset = useRef(0);

  const circleRefs = useRef<(SVGCircleElement | null)[]>([]);
  const labelRefs = useRef<(SVGTextElement | null)[]>([]);

  const points = useMemo(
    () => [
      { x: 110, label: "POLITICS", time: "03PM" },
      { x: 240, label: "POLITICS", time: "04PM" },
      { x: 360, label: "TECH", time: "08PM" },
      { x: 485, label: "SPORTS", time: "12PM" },
      { x: 610, label: "SPORTS", time: "12AM" },
    ],
    [],
  );

  // Precompute each labeled point's base curve value + taper once,
  // so the animation loop only ever does a sin() + a couple multiplies.
  const pointBases = useMemo(
    () =>
      points.map((p) => ({
        base: baseYAt(p.x),
        taper: edgeTaper(p.x, X_MIN, X_MAX),
      })),
    [points],
  );

  const gridX = [110, 240, 360, 485, 610];

  const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  // Reusable buffer for the path's "d" segments, avoids re-allocating
  // a new array/string every single frame.
  const pathParts = useRef<string[]>(new Array(sampleXs.length));

  useAnimationFrame((_, delta) => {
    if (prefersReducedMotion) return;

    phase.current += delta * 0.001;
    const ph = phase.current;

    for (let idx = 0; idx < sampleXs.length; idx++) {
      const x = sampleXs[idx];
      const y = baseYs[idx] + Math.sin(K * x - ph) * AMPLITUDE * tapers[idx];
      pathParts.current[idx] = idx === 0 ? `M${x} ${y}` : `L${x} ${y}`;
    }
    pathRef.current?.setAttribute("d", pathParts.current.join(" "));

    points.forEach((p, i) => {
      const { base, taper } = pointBases[i];
      const y = base + Math.sin(K * p.x - ph) * AMPLITUDE * taper;
      circleRefs.current[i]?.setAttribute("cy", String(y));
      labelRefs.current[i]?.setAttribute("y", String(y - 20));
    });

    // scroll the gradient pattern in -x direction so the right-end color
    // travels toward and reappears at the left end (seamless via repeat)
    gradientOffset.current =
      (gradientOffset.current + delta * GRADIENT_SPEED) % GRADIENT_CYCLE;
    gradientRef.current?.setAttribute(
      "gradientTransform",
      `translate(${-gradientOffset.current} 0)`,
    );
  });

  // Initial render values (before the animation loop kicks in on mount)
  const initialD = useMemo(() => {
    const parts: string[] = [];
    sampleXs.forEach((x, idx) => {
      const y = baseYs[idx] + Math.sin(K * x - 0) * AMPLITUDE * tapers[idx];
      parts.push(idx === 0 ? `M${x} ${y}` : `L${x} ${y}`);
    });
    return parts.join(" ");
  }, []);

  return (
    <svg
      viewBox="0 0 700 300"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient
          ref={gradientRef}
          id="graphGradient"
          x1={GRADIENT_X1}
          y1="0"
          x2={GRADIENT_X2}
          y2="0"
          gradientUnits="userSpaceOnUse"
          spreadMethod="repeat"
        >
          {/* first & last stop match so each repeated tile blends seamlessly */}
          <stop offset="0%" stopColor="#62F0FF" />
          <stop offset="35%" stopColor="#E8F7FF" />
          <stop offset="55%" stopColor="#FFF4D6" />
          <stop offset="80%" stopColor="#FFE56C" />
          <stop offset="100%" stopColor="#62F0FF" />
        </linearGradient>

        <filter id="graphGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {gridX.map((x) => (
        <line
          key={x}
          x1={x}
          y1={35}
          x2={x}
          y2={250}
          stroke="#2E3137"
          strokeWidth="1"
        />
      ))}

      <motion.path
        ref={pathRef}
        d={initialD}
        stroke="url(#graphGradient)"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        filter="url(#graphGlow)"
      />

      <line x1="40" y1="35" x2="40" y2="250" stroke="#8A8D93" strokeWidth="2" />
      <line
        x1="40"
        y1="250"
        x2="690"
        y2="250"
        stroke="#8A8D93"
        strokeWidth="2"
      />

      <text x="30" y="272" fill="#C8C8C8" fontSize="12" textAnchor="middle">
        0PM
      </text>

      {points.map((point, i) => {
        const { base, taper } = pointBases[i];
        const initialY = base + Math.sin(K * point.x - 0) * AMPLITUDE * taper;
        return (
          <g key={i}>
            <circle
              ref={(el) => {
                circleRefs.current[i] = el;
              }}
              cx={point.x}
              cy={initialY}
              r="7"
              fill="#4A4A4A"
              stroke="#5A5A5A"
              strokeWidth="2"
            />

            <text
              ref={(el) => {
                labelRefs.current[i] = el;
              }}
              x={point.x}
              y={initialY - 20}
              fill="white"
              fontSize="16"
              fontWeight="500"
              textAnchor="middle"
            >
              {point.label}
            </text>

            <text
              x={point.x}
              y="272"
              fill="#C8C8C8"
              fontSize="12"
              textAnchor="middle"
            >
              {point.time}
            </text>
          </g>
        );
      })}

      <text x="675" y="272" fill="#C8C8C8" fontSize="12" textAnchor="middle">
        03PM
      </text>
    </svg>
  );
};
