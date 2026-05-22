import React from 'react';
import { motion } from 'motion/react';

// Piece image paths (assumed to be in src/assets/pieces/ after user upload)
// We use fallback base64 or SVGs for initial development if assets are missing
const PIECES = {
  pfc_gk: '/src/assets/pieces/pfc_gk.png',
  pfc_player: '/src/assets/pieces/pfc_player.png',
  opp_player: '/src/assets/pieces/opp_player.png',
  pfc_purple: '/src/assets/pieces/purple_piece.png',
  ball: '/src/assets/pieces/ball.png'
};

interface PlayerPieceProps {
  number: number | string;
  role?: string;
  type: 'pfc_player' | 'pfc_gk' | 'opp_player' | 'pfc_purple' | 'ball';
  isSelected?: boolean;
  isFocused?: boolean;
  className?: string;
}

export const PlayerPiece: React.FC<PlayerPieceProps> = ({ 
  number, 
  type, 
  isSelected, 
  isFocused, 
  className = "" 
}) => {
  // Determine color theme based on type for the fallback/glow
  const themes = {
    pfc_gk: 'shadow-yellow-500/50 text-stone-900',
    pfc_player: 'shadow-red-500/50 text-white',
    opp_player: 'shadow-stone-500/30 text-stone-300',
    pfc_purple: 'shadow-purple-500/50 text-white',
    ball: 'shadow-white/20'
  };

  const isBall = type === 'ball';

  return (
    <div 
      className={`relative flex items-center justify-center transition-all duration-300 ${className}
        ${isSelected ? 'scale-125 z-50' : isFocused ? 'scale-110 z-40' : ''}`}
    >
      {/* Glow Effect */}
      {isSelected && (
        <motion.div
          layoutId={`glow-${type}-${number}`}
          className={`absolute inset-0 rounded-full blur-md ${themes[type] === 'ball' ? 'bg-white/40' : 'bg-amber-500/40'}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        />
      )}

      {/* The Piece Figure */}
      <div className="relative w-full h-full">
        {/* Placeholder Piece (Mimicking the custom PNGs with SVG until assets are confirmed) */}
        <svg viewBox="0 0 40 40" className="w-full h-full drop-shadow-lg overflow-visible">
          {(type === 'pfc_gk') && (
            <g>
              <ellipse cx="20" cy="20" rx="18" ry="12" fill="#fbbf24" stroke="#451a03" strokeWidth="2" transform="rotate(-15 20 20)" />
              <circle cx="20" cy="20" r="10" fill="#f59e0b" stroke="#451a03" strokeWidth="2" />
            </g>
          )}
          {type === 'pfc_player' && (
            <g>
              <ellipse cx="20" cy="20" rx="18" ry="12" fill="#ef4444" stroke="#7f1d1d" strokeWidth="2" transform="rotate(-15 20 20)" />
              <circle cx="20" cy="20" r="10" fill="#dc2626" stroke="#7f1d1d" strokeWidth="2" />
            </g>
          )}
          {type === 'pfc_purple' && (
            <g>
              <ellipse cx="20" cy="20" rx="18" ry="12" fill="#a855f7" stroke="#581c87" strokeWidth="2" transform="rotate(-15 20 20)" />
              <circle cx="20" cy="20" r="10" fill="#9333ea" stroke="#581c87" strokeWidth="2" />
            </g>
          )}
          {type === 'opp_player' && (
            <g>
              <ellipse cx="20" cy="20" rx="18" ry="12" fill="#4b5563" stroke="#111827" strokeWidth="2" transform="rotate(-15 20 20)" />
              <circle cx="20" cy="20" r="10" fill="#1f2937" stroke="#111827" strokeWidth="2" />
            </g>
          )}
          {type === 'ball' && (
             <g>
               {/* Base sphere with realistic lighting */}
               <circle cx="20" cy="20" r="16" fill="white" stroke="#222" strokeWidth="0.5" />
               <defs>
                 <radialGradient id="ball-base" cx="30%" cy="30%" r="70%">
                   <stop offset="0%" stopColor="#fff" />
                   <stop offset="70%" stopColor="#f8f8f8" />
                   <stop offset="100%" stopColor="#ccc" />
                 </radialGradient>
                 <radialGradient id="ball-shimmer" cx="20%" cy="20%" r="40%">
                   <stop offset="0%" stopColor="white" stopOpacity="0.9" />
                   <stop offset="100%" stopColor="white" stopOpacity="0" />
                 </radialGradient>
                 <filter id="ball-shadow" x="-20%" y="-20%" width="140%" height="140%">
                   <feGaussianBlur in="SourceAlpha" stdDeviation="1" />
                   <feOffset dx="1" dy="1" />
                   <feComponentTransfer>
                     <feFuncA type="linear" slope="0.3" />
                   </feComponentTransfer>
                   <feMerge>
                     <feMergeNode />
                     <feMergeNode in="SourceGraphic" />
                   </feMerge>
                 </filter>
               </defs>

               <circle cx="20" cy="20" r="16" fill="url(#ball-base)" />

               {/* Modern Ball Pattern (Telstar/Nike combined style) */}
               <g fill="#111" stroke="#222" strokeWidth="0.2">
                 {/* Center Pentagon */}
                 <path d="M 20 12 L 27.6 17.5 L 24.7 26.5 L 15.3 26.5 L 12.4 17.5 Z" />
                 
                 {/* Panels radiating from center */}
                 <path d="M 12.4 17.5 L 5 15 L 2 26 L 8 32 L 15.3 26.5 Z" fill="white" />
                 <path d="M 27.6 17.5 L 35 15 L 38 26 L 32 32 L 24.7 26.5 Z" fill="white" />
                 
                 {/* Corner Pentagons (Partial) */}
                 <path d="M 5 15 L 7 4 L 18 4 L 20 12 L 12.4 17.5 Z" fill="#111" opacity="0.9" />
                 <path d="M 35 15 L 33 4 L 22 4 L 20 12 L 27.6 17.5 Z" fill="#111" opacity="0.9" />
                 
                 <path d="M 8 32 L 20 36 L 32 32 L 24.7 26.5 L 15.3 26.5 Z" fill="#111" opacity="0.9" />
               </g>

               {/* Strategic highlights for 3D effect */}
               <circle cx="20" cy="20" r="16" fill="url(#ball-shimmer)" />
               
               {/* Nike-style Aero-groove or Swoosh detail */}
               <path d="M 10 20 Q 20 15 30 20" fill="none" stroke="#ef4444" strokeWidth="0.8" strokeLinecap="round" opacity="0.6" />
             </g>
          )}

          {/* Number Overlay (Inside SVG for perfect scaling) */}
          {!isBall && (
            <text
              x="20"
              y="20.5"
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="12"
              fontWeight="900"
              className={`select-none pointer-events-none font-sans
                ${type === 'pfc_gk' ? 'fill-stone-900' : 'fill-white'}`}
              style={{ letterSpacing: '-0.05em' }}
            >
              {number}
            </text>
          )}
        </svg>
      </div>

      {/* Selection Ring & Animation */}
      {isSelected && (
        <>
          <motion.div 
            layoutId="selection-ring"
            className="absolute -inset-1 border-2 border-amber-500 rounded-full z-[-1]"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ 
              scale: [1, 1.15, 1],
              opacity: 1
            }}
            transition={{ 
              scale: { repeat: Infinity, duration: 2, ease: "easeInOut" },
              opacity: { duration: 0.3 }
            }}
          />
          <motion.div 
            className="absolute -inset-4 border border-amber-500/30 rounded-full z-[-2]"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: [1, 1.5], opacity: [0.3, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeOut" }}
          />
        </>
      )}
    </div>
  );
};
