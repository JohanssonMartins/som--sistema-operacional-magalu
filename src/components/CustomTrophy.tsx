import React from 'react';

export const CustomTrophy = ({ className, gold = false, silver = false, bronze = false }: { className?: string, gold?: boolean, silver?: boolean, bronze?: boolean }) => {
  let mainColor = '#FACC15'; // Gold
  let borderHighlight = '#FEF08A';

  if (silver) {
    mainColor = '#CBD5E1';
    borderHighlight = '#F8FAFC';
  } else if (bronze) {
    mainColor = '#D97706';
    borderHighlight = '#FDE68A';
  }

  return (
    <svg viewBox="0 0 100 100" className={className} xmlns="http://www.w3.org/2000/svg">
      {/* Handles */}
      <path d="M 24 30 C 0 30 0 60 38 58" fill="none" stroke="#27272a" strokeWidth="9" strokeLinecap="round" />
      <path d="M 24 30 C 0 30 0 60 38 58" fill="none" stroke={mainColor} strokeWidth="4" strokeLinecap="round" />

      <path d="M 76 30 C 100 30 100 60 62 58" fill="none" stroke="#27272a" strokeWidth="9" strokeLinecap="round" />
      <path d="M 76 30 C 100 30 100 60 62 58" fill="none" stroke={mainColor} strokeWidth="4" strokeLinecap="round" />

      {/* Stem */}
      <rect x="42" y="65" width="16" height="15" fill={mainColor} stroke="#27272a" strokeWidth="5" strokeLinejoin="round" />

      {/* Lower Base */}
      <path d="M 30 85 L 70 85 L 70 95 L 30 95 Z" fill="#27272a" stroke="#27272a" strokeWidth="4" strokeLinejoin="round" />
      {/* Upper Base */}
      <path d="M 38 75 L 62 75 L 62 85 L 38 85 Z" fill="#3f3f46" stroke="#27272a" strokeWidth="4" strokeLinejoin="round" />

      {/* Bowl */}
      <path d="M 20 20 L 80 20 C 80 50 65 70 50 70 C 35 70 20 50 20 20 Z" fill={mainColor} stroke="#27272a" strokeWidth="5" strokeLinejoin="round" />

      {/* Highlight inside Bowl */}
      <path d="M 28 30 C 28 45 35 55 42 62" fill="none" stroke={borderHighlight} strokeWidth="4" strokeLinecap="round" />
      <circle cx="34" cy="53" r="2.5" fill={borderHighlight} />

      {/* Top Rim */}
      <line x1="18" y1="20" x2="82" y2="20" stroke="#27272a" strokeWidth="5" strokeLinecap="round" />
    </svg>
  );
};
