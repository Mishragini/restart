export const LiveMarket = () => {
  return (
    <div className="card-bg landing-card landing-group-card">
      {/* SVG  */}
      <svg
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="card-icon text-mint"
      >
        <defs>
          <filter
            id="live-market-glow"
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

        <g filter="url(#live-market-glow)">
          {/* Window */}
          <rect
            x="8"
            y="10"
            width="34"
            height="28"
            rx="3"
            stroke="currentColor"
            strokeWidth="2.5"
          />

          {/* Header */}
          <path
            d="M8 18H42"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Browser dots */}
          <circle cx="13" cy="14" r="1.4" fill="currentColor" />
          <circle cx="17" cy="14" r="1.4" fill="currentColor" />

          {/* Text lines */}
          <path
            d="M15 24H35"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <path
            d="M15 29H30"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <path
            d="M15 34H25"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Check badge */}
          <circle
            cx="39"
            cy="35"
            r="11"
            fill="#22272E"
            stroke="currentColor"
            strokeWidth="2.5"
          />

          <path
            d="M34.5 35L38 38.5L44 31.5"
            stroke="currentColor"
            strokeWidth="2.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      </svg>
      <p className="landing-card-heading">
        LIVE <br />
        MARKETS
      </p>{" "}
      <p className="landing-card-description">
        Real-time market odds that let you trade on live, ongoing events.
      </p>
    </div>
  );
};
