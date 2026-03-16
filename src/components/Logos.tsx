import React from 'react';
import logoImg from '../assets/images/Logo.png';

export const LogoIconSVG = ({ className = '' }: { className?: string }) => (
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
    
    <path
      d="M 12 50 A 38 38 0 1 1 35 83"
      stroke="url(#logoIconGradient1)"
      strokeWidth="8"
      strokeLinecap="round"
    />
    <circle cx="12" cy="50" r="4.5" fill="#FACC15" />

    <path
      d="M 50 18 A 32 32 0 1 1 25 50"
      stroke="url(#logoIconGradient2)"
      strokeWidth="8"
      strokeLinecap="round"
    />
    <circle cx="50" cy="18" r="4.5" fill="#A855F7" />

    <path
      d="M 50 82 A 25 25 0 1 1 73 50"
      stroke="url(#logoIconGradient3)"
      strokeWidth="8"
      strokeLinecap="round"
    />
    <circle cx="50" cy="82" r="4.5" fill="#9333EA" />

    <path
      d="M 55 35 A 15 15 0 0 1 70 50"
      stroke="#006CEE"
      strokeWidth="6"
      strokeLinecap="round"
      opacity="0.7"
    />
  </svg>
);

export const MainLogo = ({ className = '', size = 'medium' }: { className?: string, size?: 'small' | 'medium' | 'large' }) => {
  const isSmall = size === 'small';
  const isLarge = size === 'large';
  
  return (
    <div className={`flex items-center justify-start ${className} select-none w-full ${isSmall ? 'h-10' : isLarge ? 'h-32' : 'h-20'}`}>
      <img 
        src={logoImg} 
        alt="Magalog Logo" 
        className={`max-h-full max-w-full object-contain transition-all duration-500 hover:scale-105 drop-shadow-sm`}
        style={{ filter: 'brightness(1.1) contrast(1.05)' }}
      />
    </div>
  );
};

export const TopMagalogLogo = ({ className = '' }: { className?: string }) => (
  <div className={`flex items-center gap-4 ${className} select-none`}>
    <div className="flex flex-col items-center">
      <div className="flex items-center gap-1">
        <span className="text-3xl sm:text-4xl font-black text-[#006CEE] tracking-tighter" style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}>Top</span>
        <div className="flex text-yellow-400 drop-shadow-sm" style={{ filter: 'drop-shadow(0px 2px 2px rgba(0,0,0,0.3))' }}>
          {[...Array(5)].map((_, i) => (
            <svg key={i} className="w-4 h-4 sm:w-5 sm:h-5 fill-current" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
        </div>
      </div>
      <div className="flex items-center">
        <div className="flex flex-col gap-[2px] mr-1.5 mt-1">
          <div className="w-5 h-[3px] bg-yellow-400 rounded-full" style={{ boxShadow: '0 0 4px rgba(250,204,21,0.6)' }}></div>
          <div className="w-5 h-[3px] bg-red-500 rounded-full" style={{ boxShadow: '0 0 4px rgba(239,68,68,0.6)' }}></div>
          <div className="w-5 h-[3px] bg-fuchsia-500 rounded-full" style={{ boxShadow: '0 0 4px rgba(217,70,239,0.6)' }}></div>
          <div className="w-5 h-[3px] bg-cyan-400 rounded-full" style={{ boxShadow: '0 0 4px rgba(34,211,238,0.6)' }}></div>
        </div>
        <span className="text-4xl sm:text-5xl font-black text-[#006CEE] pb-0.5 pt-1" style={{ fontFamily: 'Arial, Helvetica, sans-serif', textTransform: 'lowercase' }}>magalog</span>
      </div>
    </div>
    <div className="flex flex-col justify-center border-l-2 border-gray-300 dark:border-zinc-700 pl-3 sm:pl-4 h-full py-1">
      <span className="text-sm sm:text-base font-bold text-[#003865] dark:text-blue-300 leading-tight tracking-tight">Programa de</span>
      <span className="text-sm sm:text-base font-bold text-[#003865] dark:text-blue-300 leading-tight tracking-tight">Excelência</span>
    </div>
  </div>
);
