import { motion } from "motion/react";

/*
 * All green segments live in a single path (multiple `M` subpaths), same for
 * peach. The old per-group transforms (translate/scale/mirror) are baked into
 * the coordinates, and segments that previously animated in the opposite
 * direction are reversed so one dash-offset animation flows correctly through
 * every subpath.
 */
const GREEN_D = [
  // top-left elbow (reversed: flows top → left edge)
  "M370 0 V235 C370 260 355 275 330 275 H0",
  // stepped/jagged path (old translate(0,450) scale(1.6) baked in)
  "M0 496.4 H252.8 C275.2 496.4 288 514 288 552.4 V632.4 L328 656.4 V774.8 L427.2 811.6 H536 L584 714",
  // orthogonal connector: graph card bottom → yes button (the start tucks up
  // behind the card so the line appears attached to it)
  "M340 1870 V1910 Q340 1950 300 1950 H70 Q30 1950 30 1910 V920 Q30 880 70 880 H544 Q584 880 584 840 V445",
  // right-side connector: graph card bottom → into the graph card side
  "M1110 1870 V1910 Q1110 1950 1150 1950 H1260 Q1300 1950 1300 1910 V1410 Q1300 1370 1260 1370 H920",
  // vertical line from Sentiment Tracker text upward, turning right to the screen edge
  "M705 1350 V970 Q705 930 745 930 H1455",
].join(" ");

const PEACH_D = [
  // top-right elbow (old translate(1455,0) scale(-1,1) baked in, reversed)
  "M1085 0 V360 C1085 385 1100 400 1125 400 H1455",
  // L-path from right edge → up to Trade No button
  "M1455 720 H910 Q870 720 870 680 V445",
].join(" ");

export const AnimatedSVG = ({ ...props }) => {
  return (
    <motion.svg
      width="100%"
      height="100%"
      viewBox="0 0 873 1200"
      /* stretch with the content box so the lines track the layout at any
         page height — the page is no longer sized by a background image */
      preserveAspectRatio="none"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={props.className}
      aria-hidden
    >
      <defs>
        {/*
          userSpaceOnUse with an explicit pixel region instead of
          objectBoundingBox percentages: percentage regions collapse to zero on
          zero-width/zero-height bboxes (e.g. a perfectly vertical subpath),
          which makes the filter region degenerate and content disappear (most
          reliably reproducible in Firefox). The region is padded well beyond
          the paths' bounds to leave room for the largest blur pass
          (stdDeviation=20) plus the morphology dilation.
        */}
        {/* teal glow */}
        <filter
          id="glow"
          x="-1000"
          y="-1000"
          width="5000"
          height="5000"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feMorphology
            radius="1"
            operator="dilate"
            in="SourceAlpha"
            result="effect1_dropShadow"
          />
          <feOffset />
          <feGaussianBlur stdDeviation="3" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0.3 0 0 0 0 0.95 0 0 0 0 0.85 0 0 0 0.9 0"
          />
          <feBlend
            mode="normal"
            in2="BackgroundImageFix"
            result="effect1_dropShadow"
          />

          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feMorphology
            radius="2"
            operator="dilate"
            in="SourceAlpha"
            result="effect2_dropShadow"
          />
          <feOffset />
          <feGaussianBlur stdDeviation="8" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0.3 0 0 0 0 0.95 0 0 0 0 0.85 0 0 0 0.5 0"
          />
          <feBlend
            mode="normal"
            in2="effect1_dropShadow"
            result="effect2_dropShadow"
          />

          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feMorphology
            radius="4"
            operator="dilate"
            in="SourceAlpha"
            result="effect3_dropShadow"
          />
          <feOffset />
          <feGaussianBlur stdDeviation="20" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0.2 0 0 0 0 0.8 0 0 0 0 0.7 0 0 0 0.25 0"
          />
          <feBlend
            mode="normal"
            in2="effect2_dropShadow"
            result="effect3_dropShadow"
          />

          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect3_dropShadow"
            result="shape"
          />
        </filter>

        {/* orange glow — same structure, color constants swapped to orange */}
        <filter
          id="glow-orange"
          x="-1000"
          y="-1000"
          width="5000"
          height="5000"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feMorphology
            radius="1"
            operator="dilate"
            in="SourceAlpha"
            result="effect1_dropShadow"
          />
          <feOffset />
          <feGaussianBlur stdDeviation="3" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 1 0 0 0 0 0.58 0 0 0 0 0.4 0 0 0 0.9 0"
          />
          <feBlend
            mode="normal"
            in2="BackgroundImageFix"
            result="effect1_dropShadow"
          />

          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feMorphology
            radius="2"
            operator="dilate"
            in="SourceAlpha"
            result="effect2_dropShadow"
          />
          <feOffset />
          <feGaussianBlur stdDeviation="8" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 1 0 0 0 0 0.58 0 0 0 0 0.4 0 0 0 0.5 0"
          />
          <feBlend
            mode="normal"
            in2="effect1_dropShadow"
            result="effect2_dropShadow"
          />

          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feMorphology
            radius="4"
            operator="dilate"
            in="SourceAlpha"
            result="effect3_dropShadow"
          />
          <feOffset />
          <feGaussianBlur stdDeviation="20" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0.85 0 0 0 0 0.45 0 0 0 0 0.28 0 0 0 0.25 0"
          />
          <feBlend
            mode="normal"
            in2="effect2_dropShadow"
            result="effect3_dropShadow"
          />

          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect3_dropShadow"
            result="shape"
          />
        </filter>
      </defs>

      <g transform="scale(0.6)">
        {/* GREEN — single combined path */}
        <g filter="url(#glow)">
          <path d={GREEN_D} stroke="#4DF2D9" strokeWidth="2.5" opacity={0.25} />
          <motion.path
            d={GREEN_D}
            stroke="#4DF2D9"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeDasharray="560 50"
            animate={{ strokeDashoffset: [20, -500] }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          />
        </g>

        {/* PEACH — single combined path */}
        <g filter="url(#glow-orange)">
          <path d={PEACH_D} stroke="#FF9466" strokeWidth="2.5" opacity={0.25} />
          <motion.path
            d={PEACH_D}
            stroke="#FF9466"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeDasharray="560 50"
            animate={{ strokeDashoffset: [20, -500] }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          />
        </g>
      </g>
    </motion.svg>
  );
};

export default AnimatedSVG;
