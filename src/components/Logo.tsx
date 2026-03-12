const LogoSymbolSVG = ({ className = '' }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg shadow-sm overflow-visible">
    <defs>
      <linearGradient id="outerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FACC15" /> {/* Yellow */}
        <stop offset="50%" stopColor="#FB923C" /> {/* Orange */}
        <stop offset="100%" stopColor="#FB7185" /> {/* Pink/Red */}
      </linearGradient>
      <linearGradient id="middleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#A855F7" /> {/* Purple */}
        <stop offset="33%" stopColor="#3B82F6" /> {/* Blue */}
        <stop offset="66%" stopColor="#06B6D4" /> {/* Cyan */}
        <stop offset="100%" stopColor="#22C55E" /> {/* Green */}
      </linearGradient>
      <linearGradient id="innerGradient" x1="100%" y1="100%" x2="0%" y2="0%">
        <stop offset="0%" stopColor="#9333EA" /> {/* Purple */}
        <stop offset="100%" stopColor="#EC4899" /> {/* Pink */}
      </linearGradient>
    </defs>
    
    {/* Outer Arc (Dot at 9 o'clock) */}
    <path
      d="M 15 50 A 35 35 0 1 1 35 80"
      stroke="url(#outerGradient)"
      strokeWidth="7"
      strokeLinecap="round"
    />
    <circle cx="15" cy="50" r="4.5" fill="#FACC15" />

    {/* Middle Arc (Dot at 12 o'clock) */}
    <path
      d="M 50 22 A 28 28 0 1 1 28 50"
      stroke="url(#middleGradient)"
      strokeWidth="7"
      strokeLinecap="round"
    />
    <circle cx="50" cy="22" r="4.5" fill="#A855F7" />

    {/* Inner Arc (Dot at 6 o'clock) */}
    <path
      d="M 50 78 A 20.5 20.5 0 1 1 70 50"
      stroke="url(#innerGradient)"
      strokeWidth="7"
      strokeLinecap="round"
    />
    <circle cx="50" cy="78" r="4.5" fill="#9333EA" />

    {/* Eye Arc (Center Right) */}
    <path
      d="M 53 38 A 12 12 0 0 1 65 50"
      stroke="#3B82F6"
      strokeWidth="5"
      strokeLinecap="round"
    />
  </svg>
);

export default function Logo() {
  return (
    <div className="flex flex-col items-center justify-center select-none group">
      <div className="flex items-center gap-1 leading-none mb-1 translate-y-2">
        <span className="font-black tracking-tighter bg-gradient-to-b from-[#00AEEF] to-[#006CEE] bg-clip-text text-transparent text-5xl md:text-6xl transition-transform duration-300 group-hover:scale-110">
          S
        </span>
        <div className="w-14 h-14 md:w-16 md:h-16 flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12">
          <LogoSymbolSVG />
        </div>
        <span className="font-black tracking-tighter bg-gradient-to-b from-[#00AEEF] to-[#006CEE] bg-clip-text text-transparent text-5xl md:text-6xl transition-transform duration-300 group-hover:scale-110">
          M
        </span>
      </div>
      <div className="text-[#006CEE] font-bold tracking-[0.25em] text-center uppercase text-[8px] md:text-[10px] mt-1 transition-all duration-300 group-hover:tracking-[0.35em]">
        SISTEMA OPERACIONAL MAGALOG
      </div>
    </div>
  );
}
