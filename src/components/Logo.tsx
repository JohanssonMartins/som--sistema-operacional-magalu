const LogoSymbolSVG = ({ className = '' }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg" style={{ overflow: 'visible' }}>
    <defs>
      <linearGradient id="logoIconGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FACC15" />
        <stop offset="50%" stopColor="#FB923C" />
        <stop offset="100%" stopColor="#FB7185" />
      </linearGradient>
      <linearGradient id="logoIconGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#A855F7" />
        <stop offset="33%" stopColor="#3B82F6" />
        <stop offset="66%" stopColor="#06B6D4" />
        <stop offset="100%" stopColor="#22C55E" />
      </linearGradient>
      <linearGradient id="logoIconGradient3" x1="100%" y1="100%" x2="0%" y2="0%">
        <stop offset="0%" stopColor="#9333EA" />
        <stop offset="100%" stopColor="#EC4899" />
      </linearGradient>
    </defs>
    
    {/* Outer Arc (starts at left) */}
    <path
      d="M 12 50 A 38 38 0 1 1 35 83"
      stroke="url(#logoIconGradient1)"
      strokeWidth="8"
      strokeLinecap="round"
    />
    <circle cx="12" cy="50" r="4.5" fill="#FACC15" />

    {/* Middle Arc (starts at top) */}
    <path
      d="M 50 18 A 32 32 0 1 1 25 50"
      stroke="url(#logoIconGradient2)"
      strokeWidth="8"
      strokeLinecap="round"
    />
    <circle cx="50" cy="18" r="4.5" fill="#A855F7" />

    {/* Inner Arc (starts at bottom) */}
    <path
      d="M 50 82 A 25 25 0 1 1 73 50"
      stroke="url(#logoIconGradient3)"
      strokeWidth="8"
      strokeLinecap="round"
    />
    <circle cx="50" cy="82" r="4.5" fill="#9333EA" />

    {/* Center Eye */}
    <path
      d="M 55 35 A 15 15 0 0 1 70 50"
      stroke="#006CEE"
      strokeWidth="6"
      strokeLinecap="round"
      opacity="0.7"
    />
  </svg>
);

export default function Logo() {
  return (
    <div className="flex flex-col items-center justify-center select-none group">
      <div className="flex items-center gap-1.5 leading-none mb-1">
        <span className="font-black tracking-tighter bg-gradient-to-b from-[#00AEEF] to-[#006CEE] bg-clip-text text-transparent text-5xl md:text-6xl transition-transform duration-300 group-hover:scale-105">
          S
        </span>
        <div className="w-14 h-14 md:w-16 md:h-16 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
          <LogoSymbolSVG />
        </div>
        <span className="font-black tracking-tighter bg-gradient-to-b from-[#00AEEF] to-[#006CEE] bg-clip-text text-transparent text-5xl md:text-6xl transition-transform duration-300 group-hover:scale-105">
          M
        </span>
      </div>
      <div className="text-[#006CEE] font-bold tracking-[0.25em] text-center uppercase text-[8px] md:text-[10px] mt-1 transition-all duration-300 group-hover:tracking-[0.35em]">
        SISTEMA OPERACIONAL MAGALOG
      </div>
    </div>
  );
}
