export const Analytics = () => {
  return (
    <div className="card-bg landing-card landing-group-card">
      <svg
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="card-icon text-mint"
      >
        <defs>
          <filter
            id="analytics-glow"
            x="-50%"
            y="-50%"
            width="200%"
            height="200%"
          >
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <g filter="url(#analytics-glow)">
          {/* Axes */}
          <path
            d="M14 14V46H48"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Bars */}
          <path
            d="M20 46V37"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <path
            d="M26 46V31"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <path
            d="M32 46V35"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <path
            d="M38 46V26"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <path
            d="M44 46V20"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Trend line */}
          <path
            d="M18 27L27 19L35 25L46 14"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Arrow head */}
          <path
            d="M40 14H46V20"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      </svg>
      <p className="landing-card-heading">
        INSIGHT
        <br />
        ANALYTICS
      </p>
      <p className="landing-card-description">
        Deep sentiment data and real-time market trends to inform every trade.
      </p>
    </div>
  );
};
