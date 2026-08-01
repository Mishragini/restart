import { motion } from "motion/react";

export const AnimatedSVG = ({ ...props }) => {
  return (
    <motion.svg
      width="100%"
      height="100%"
      viewBox="0 0 873 1802"
      preserveAspectRatio="xMidYMid meet"
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

      <g transform="scale(0.6)">
        {/* GREEN — top-left side*/}
        <g filter="url(#glow)">
          <path
            d="M0 275H330C355 275 370 260 370 235V0"
            stroke="#4DF2D9"
            strokeWidth="2.5"
            opacity={0.25}
          />
          <motion.path
            d="M0 275H330C355 275 370 260 370 235V0"
            stroke="#4DF2D9"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeDasharray="560 50"
            animate={{ strokeDashoffset: [-500, 20] }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          />
        </g>

        {/* GREEN #2 — stepped/jagged path, animates left→right */}
        <g transform="translate(0,450) scale(1.6)" filter="url(#glow)">
          <path
            d="M0 29H158C172 29 180 40 180 64V114L205 129V203L267 226H335L365 165"
            stroke="#4DF2D9"
            strokeWidth="2"
            opacity={0.25}
          />
          <motion.path
            d="M0 29H158C172 29 180 40 180 64V114L205 129V203L267 226H335L365 165"
            stroke="#4DF2D9"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray="560 50"
            animate={{ strokeDashoffset: [20, -500] }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          />
        </g>

        {/* GREEN #3 — orthogonal connector (graph card → yes button), animates bottom→top */}
        <g filter="url(#glow)" className="translate-y-30 md:translate-y-0">
          <path
            d="M300 1950 H70 Q30 1950 30 1910 V920 Q30 880 70 880 H544 Q584 880 584 840 V480"
            stroke="#4DF2D9"
            strokeWidth="2.5"
            opacity={0.25}
            fill="none"
          />
          <motion.path
            d="M300 1950 H70 Q30 1950 30 1910 V920 Q30 880 70 880 H544 Q584 880 584 840 V480"
            stroke="#4DF2D9"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
            strokeDasharray="560 50"
            animate={{ strokeDashoffset: [20, -500] }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          />
        </g>

        <g filter="url(#glow)" className="hidden md:block ">
          <path
            d="M1150 1950 H1260 Q1300 1950 1300 1910 V1410 Q1300 1370 1260 1370 H920"
            stroke="#4DF2D9"
            strokeWidth="2.5"
            opacity={0.25}
            fill="none"
          />
          <motion.path
            d="M1150 1950 H1260 Q1300 1950 1300 1910 V1410 Q1300 1370 1260 1370 H920"
            stroke="#4DF2D9"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
            strokeDasharray="560 50"
            animate={{ strokeDashoffset: [20, -500] }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          />
        </g>
        <g filter="url(#glow)" className="md:hidden">
          <path
            d="M1250 2050 H1360 Q1400 2050 1400 2010 V1170 Q1400 1130 1360 1130 H920"
            stroke="#4DF2D9"
            strokeWidth="2.5"
            opacity={0.25}
            fill="none"
          />
          <motion.path
            d="M1250 2050 H1360 Q1400 2050 1400 2010 V1170 Q1400 1130 1360 1130 H920"
            stroke="#4DF2D9"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
            strokeDasharray="560 50"
            animate={{ strokeDashoffset: [20, -500] }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          />
        </g>

        {/* GREEN #4 — from Sentiment Tracker text upward, animates bottom→top
            (uses #glow-line instead of #glow — see filter comment above) */}
        <g filter="url(#glow-line)" className="hidden md:block">
          <path
            d="M705 1350 V930"
            stroke="#4DF2D9"
            strokeWidth="2.5"
            opacity={0.25}
            fill="none"
          />
          <motion.path
            d="M705 1350 V930"
            stroke="#4DF2D9"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
            strokeDasharray="560 50"
            animate={{ strokeDashoffset: [20, -500] }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          />
        </g>
        <g filter="url(#glow-line)" className=" md:hidden">
          <path
            d="M705 1110 V930"
            stroke="#4DF2D9"
            strokeWidth="2.5"
            opacity={0.25}
            fill="none"
          />
          <motion.path
            d="M705 1110 V930"
            stroke="#4DF2D9"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
            strokeDasharray="560 50"
            animate={{ strokeDashoffset: [20, -500] }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          />
        </g>

        {/* ORANGE — mirror image of green, taller vertical drop */}
        <g transform="translate(1455,0) scale(-1,1)" filter="url(#glow-orange)">
          <path
            d="M0 400H330C355 400 370 385 370 360V0"
            stroke="#FF9466"
            strokeWidth="2.5"
            opacity={0.25}
          />
          <motion.path
            d="M0 400H330C355 400 370 385 370 360V0"
            stroke="#FF9466"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeDasharray="560 50"
            animate={{ strokeDashoffset: [-500, 20] }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          />
        </g>

        {/* ORANGE #2 — L-path from right → up to Trade No button */}
        <g filter="url(#glow-orange)" className="hidden md:block">
          <path
            d="M1455 720 H910 Q870 720 870 680 V500"
            stroke="#FF9466"
            strokeWidth="2.5"
            opacity={0.25}
            fill="none"
          />
          <motion.path
            d="M1455 720 H910 Q870 720 870 680 V500"
            stroke="#FF9466"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
            strokeDasharray="560 50"
            animate={{ strokeDashoffset: [20, -500] }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          />
        </g>
        <g filter="url(#glow-orange)" className="md:hidden">
          <path
            d="M1455 720 H910 Q870 720 870 680 V600"
            stroke="#FF9466"
            strokeWidth="2.5"
            opacity={0.25}
            fill="none"
          />
          <motion.path
            d="M1455 720 H910 Q870 720 870 680 V600"
            stroke="#FF9466"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
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
