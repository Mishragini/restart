export const Settlement = () => {
  return (
    <div className="card-bg landing-card landing-group-card">
      <svg
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="card-icon text-peach"
      >
        <defs>
          <filter
            id="settlement-glow"
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

        <g filter="url(#settlement-glow)">
          {/* Top bill */}
          <path
            d="M16 18.5L38.5 14L48 20L25.5 24.5L16 18.5Z"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />

          {/* Center mark */}
          <circle
            cx="32"
            cy="19.2"
            r="2.8"
            stroke="currentColor"
            strokeWidth="2.3"
          />

          {/* First stack */}
          <path
            d="M16 18.5V25.5C16 27.8 20.2 30.2 27 30.2C33.8 30.2 38 27.8 38 25.5V18.5"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Second stack */}
          <path
            d="M16 25.5V31.5C16 33.8 20.2 36.2 27 36.2C33.8 36.2 38 33.8 38 31.5V25.5"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Bottom stack */}
          <path
            d="M16 31.5V37C16 39.3 20.2 41.5 27 41.5C33.8 41.5 38 39.3 38 37V31.5"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Coin */}
          <circle
            cx="43.5"
            cy="35.5"
            r="10"
            fill="#22272E"
            stroke="currentColor"
            strokeWidth="2.5"
          />

          {/* Dollar sign */}
          <path
            d="M43.5 29.5V41.5"
            stroke="currentColor"
            strokeWidth="2.3"
            strokeLinecap="round"
          />

          <path
            d="M46.2 31.5C45.5 30.3 44.3 29.7 43 29.7C41.2 29.7 39.8 30.8 39.8 32.4C39.8 34 41 34.6 43.5 35.2C46 35.8 47.2 36.6 47.2 38.4C47.2 40.2 45.7 41.4 43.5 41.4C41.7 41.4 40.2 40.7 39.2 39.2"
            stroke="currentColor"
            strokeWidth="2.3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      </svg>
      <p className="landing-card-heading">
        INSTANT
        <br />
        SETTLEMENT
      </p>
      <p className="landing-card-description">
        Receive instant automated payouts directly to your wallet the second an
        event resolves.
      </p>
    </div>
  );
};
