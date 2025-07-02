const Logo = () => {
  return (
    <div className="flex p-5 justify-start items-center gap-3 group transition-all">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        height="36" // Reduced from 44
        viewBox="0 0 512 512"
        className="transition-transform duration-300 group-hover:scale-105 drop-shadow-md"
      >
        <defs>
          <linearGradient id="tealGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#20B2AA" />
            <stop offset="100%" stopColor="#008080" />
          </linearGradient>
        </defs>

        {/* Chat bubble shape */}
        <path
          d="M256 32C114.6 32 0 125.1 0 240c0 49.8 24.5 95.3 65.3 130.1-5.6 27.3-20.5 52.7-42.6 72.9-2.7 2.5-3.5 6.5-2.1 9.9s4.6 5.5 8.2 5.5c66.2 0 116.3-31.5 143.8-53.2 26.7 6.9 55.5 10.8 85.4 10.8 141.4 0 256-93.1 256-208S397.4 32 256 32z"
          fill="url(#tealGradient)"
        />

        {/* Pulsing Typing Dots */}
        <circle cx="160" cy="208" r="8" fill="#00CED1">
          <animate attributeName="r" values="8;11;8" dur="1.2s" repeatCount="indefinite" begin="0s" />
        </circle>
        <circle cx="256" cy="208" r="8" fill="#40E0D0">
          <animate attributeName="r" values="8;11;8" dur="1.2s" repeatCount="indefinite" begin="0.2s" />
        </circle>
        <circle cx="352" cy="208" r="8" fill="#48D1CC">
          <animate attributeName="r" values="8;11;8" dur="1.2s" repeatCount="indefinite" begin="0.4s" />
        </circle>
      </svg>

      {/* Unchanged title text style */}
      <span className="text-3xl font-extrabold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-[#20B2AA] to-[#008080]">
        Chatterbox
      </span>
    </div>
  );
};

export default Logo;
