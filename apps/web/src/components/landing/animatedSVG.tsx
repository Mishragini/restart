import { motion } from "motion/react";

/** Fraction of a path lit by the travelling highlight. */
const PULSE_LENGTH = 0.22;

interface NeonPathProps {
  d: string;
  color: string;
  filter: string;
  strokeWidth?: number;
  /** 1 runs from the path's start point toward its end, -1 runs the other way. */
  direction?: 1 | -1;
  duration?: number;
  className?: string;
  transform?: string;
}

/**
 * A neon run: a solid base stroke with a highlight travelling along it.
 *
 * The base stroke is what keeps the run reading as one connected line — the
 * highlight only ever adds brightness, it never opens a gap in the middle.
 *
 * pathLength + pathSpacing sum to 1, so `motion` normalises the path to a
 * single dash period regardless of its actual length. Animating pathOffset
 * across exactly 0 → ±1 therefore lands back where it started and the loop
 * repeats without the jump you get from an arbitrary strokeDashoffset range.
 */
const NeonPath = ({
  d,
  color,
  filter,
  strokeWidth = 2.5,
  direction = 1,
  duration = 2.4,
  className,
  transform,
}: NeonPathProps) => (
  <g filter={filter} className={className} transform={transform}>
    <path
      d={d}
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
      opacity={0.6}
    />
    <motion.path
      d={d}
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
      initial={{
        pathLength: PULSE_LENGTH,
        pathSpacing: 1 - PULSE_LENGTH,
        pathOffset: 0,
      }}
      animate={{
        pathLength: PULSE_LENGTH,
        pathSpacing: 1 - PULSE_LENGTH,
        pathOffset: [0, direction],
      }}
      transition={{ duration, repeat: Infinity, ease: "linear" }}
    />
  </g>
);

/**
 * The neon runs are authored against background.png's own 873x1802 pixel grid,
 * so `preserveAspectRatio` has to mirror the <img>'s `object-cover object-top`
 * exactly — `slice` is cover, `xMidYMin` is the top anchor. Any mismatch and
 * the runs drift off the grooves they are meant to trace.
 */
export const AnimatedSVG = ({ ...props }) => {
  return (
    <motion.svg
      width="100%"
      height="100%"
      viewBox="0 0 873 1802"
      preserveAspectRatio="xMidYMin slice"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={props.className}
      aria-hidden
    >
      <defs>
        {/* teal glow*/}
        <filter
          id="glow"
          x="-50%"
          y="-50%"
          width="200%"
          height="200%"
          filterUnits="objectBoundingBox"
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

        {/*
          dedicated filter for perfectly straight (vertical/horizontal) paths.
          objectBoundingBox percentages collapse to zero on a zero-width/zero-height
          bbox, which makes the "#glow" filter region degenerate and the content
          disappear (most reliably reproducible in Firefox). userSpaceOnUse with an
          explicit pixel region sidesteps that entirely. Region is padded well beyond
          the path's own bounds (x=500, y=900..1500) to leave room for the largest
          blur pass (stdDeviation=20) plus the morphology dilation.
        */}
        <filter
          id="glow-line"
          x="-1000"
          y="-1000"
          width="5000"
          height="5000"
          filterUnits="userSpaceOnUse"
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
          x="-50%"
          y="-50%"
          width="200%"
          height="200%"
          filterUnits="objectBoundingBox"
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

      {/*
        Every run below traces a seam that is actually etched into
        background.png, in that image's own pixel coordinates. The seams were
        measured off the asset rather than eyeballed — the panel network in the
        top half is:

          verticals    x=221 (y 0-149, rounds into y=166)
                       x=245 (y 0-150, chamfers to 130,266)
                       x=127 (y 267-996)
                       x=553 (y 477-686)
                       x=741 (y 0-1617)
          horizontals  y=166 (x 0-208)   y=267 (x 0-127)
                       y=477 (x 127-738) y=686 (x 130-741)
          chamfers     (245,148)->(130,266)   (127,476)->(22,581)
                       (873,26)->(741,158)    (741,412)->(676,477)
                       (741,480)->(873,612)

        Because the runs and the artwork now share one coordinate space, a run
        stays welded to its seam at every viewport size — which is what lets the
        separate mobile/desktop copies of each path go away.
      */}

      {/* TEAL — in from the left edge, along the y=166 seam, rounds up the x=221 riser. */}
      <NeonPath
        d="M0 166 H207 Q221 166 221 152 V0"
        color="#4DF2D9"
        filter="url(#glow)"
        direction={-1}
      />

      {/* TEAL — the long left run: down the x=245 riser, across the chamfer onto
          the x=127 vertical, right along the y=477 seam, then down the x=553 riser. */}
      <NeonPath
        d="M245 0 V148 L129 264 V466 Q127 477 138 477 H543 Q553 477 553 488 V686"
        color="#4DF2D9"
        filter="url(#glow)"
      />

      {/* TEAL — in from the left edge on the lower chamfer, meeting the run above. */}
      <NeonPath
        d="M0 603 L127 476"
        color="#4DF2D9"
        filter="url(#glow)"
      />

      {/* ORANGE — in at the top-right corner chamfer, down the x=741 spine,
          out along the chamfer onto the y=477 seam. */}
      <NeonPath
        d="M873 26 L741 158 V412 L676 477"
        color="#FF9466"
        filter="url(#glow-orange)"
      />

      {/* ORANGE — in from the right edge on the lower chamfer, down to the y=686 seam. */}
      <NeonPath
        d="M873 612 L741 480 V686 H563"
        color="#FF9466"
        filter="url(#glow-orange)"
      />
    </motion.svg>
  );
};

export default AnimatedSVG;
