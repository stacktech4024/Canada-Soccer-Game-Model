import React from 'react';
import { motion } from 'motion/react';

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
  const isBall = type === 'ball';

  return (
    <div 
      className={`relative flex items-center justify-center transition-all duration-300 ${className}
        ${isSelected ? 'scale-125 z-50' : isFocused ? 'scale-110 z-40' : ''}`}
    >
      {/* Selection Glow Effect */}
      {isSelected && (
        <motion.div
          className={`absolute inset-0 rounded-full blur-md ${isBall ? 'bg-white/40' : 'bg-amber-500/40'}`}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        />
      )}

      {/* The Piece Figure */}
      <div className="relative w-full h-full">
        <svg viewBox="0 0 40 40" className="w-full h-full drop-shadow-lg overflow-visible">
          <defs>
            {/* Gradients for realistic 3D effect */}
            <radialGradient id="playerGradient" cx="40%" cy="35%" r="60%">
              <stop offset="0%" stopColor="#fff" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#000" stopOpacity="0.2" />
            </radialGradient>
            <radialGradient id="gkGradient" cx="40%" cy="35%" r="60%">
              <stop offset="0%" stopColor="#fef08a" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#854d0e" stopOpacity="0.3" />
            </radialGradient>
            <radialGradient id="oppGradient" cx="40%" cy="35%" r="60%">
              <stop offset="0%" stopColor="#9ca3af" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#1f2937" stopOpacity="0.4" />
            </radialGradient>
            <radialGradient id="ballGradient" cx="35%" cy="28%" r="72%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="38%" stopColor="#f8fafc" />
              <stop offset="74%" stopColor="#d7dde5" />
              <stop offset="100%" stopColor="#8b96a3" />
            </radialGradient>
            <radialGradient id="ballShine" cx="35%" cy="24%" r="34%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
            </radialGradient>
            <clipPath id="ballClip">
              <circle cx="20" cy="20" r="14" />
            </clipPath>
            <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur in="SourceAlpha" stdDeviation="2" />
              <feOffset dx="0" dy="1.5" />
              <feComponentTransfer>
                <feFuncA type="linear" slope="0.3" />
              </feComponentTransfer>
              <feMerge>
                <feMergeNode />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="ballShadow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="1.6" stdDeviation="1.4" floodColor="#000000" floodOpacity="0.42" />
            </filter>
          </defs>

          {/* Goalkeeper - Distinctive kit with gloves */}
          {type === 'pfc_gk' && (
            <g filter="url(#softShadow)">
              {/* Body shape - more elongated for keeper */}
              <ellipse cx="20" cy="21" rx="14" ry="11" fill="#fbbf24" stroke="#b45309" strokeWidth="1.5" />
              <ellipse cx="20" cy="21" rx="14" ry="11" fill="url(#gkGradient)" />
              {/* Gloves - distinctive keeper feature */}
              <rect x="9" y="14" width="5" height="6" rx="2" fill="#fef3c7" stroke="#b45309" strokeWidth="0.8" />
              <rect x="26" y="14" width="5" height="6" rx="2" fill="#fef3c7" stroke="#b45309" strokeWidth="0.8" />
              {/* Head */}
              <circle cx="20" cy="12" r="6" fill="#fcd34d" stroke="#b45309" strokeWidth="1" />
              {/* Goalkeeper cap */}
              <path d="M 14 10 Q 20 7 26 10 L 25 12 L 15 12 Z" fill="#ef4444" />
              {/* Kit number */}
              <text x="20" y="24" textAnchor="middle" fontSize="11" fontWeight="900" fill="#451a03" fontFamily="sans-serif">
                {number}
              </text>
            </g>
          )}

          {/* Outfield Player - Dynamic running pose */}
          {type === 'pfc_player' && (
            <g filter="url(#softShadow)">
              {/* Kit shadow/base */}
              <ellipse cx="20" cy="22" rx="13" ry="10" fill="#ef4444" stroke="#7f1d1d" strokeWidth="1.2" />
              <ellipse cx="20" cy="22" rx="13" ry="10" fill="url(#playerGradient)" />
              {/* Head */}
              <circle cx="20" cy="12" r="6.5" fill="#fca5a5" stroke="#7f1d1d" strokeWidth="0.8" />
              {/* Hair */}
              <path d="M 14 10 Q 20 6 26 10 Q 23 8 20 9 Q 17 8 14 10 Z" fill="#451a03" />
              {/* Arms (running motion) */}
              <line x1="12" y1="18" x2="8" y2="14" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="28" y1="18" x2="32" y2="22" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" />
              {/* Kit number */}
              <text x="20" y="25" textAnchor="middle" fontSize="11" fontWeight="900" fill="white" fontFamily="sans-serif">
                {number}
              </text>
            </g>
          )}

          {/* Opponent Player - Darker, defensive stance */}
          {type === 'opp_player' && (
            <g filter="url(#softShadow)">
              <ellipse cx="20" cy="22" rx="13" ry="10" fill="#4b5563" stroke="#1f2937" strokeWidth="1.2" />
              <ellipse cx="20" cy="22" rx="13" ry="10" fill="url(#oppGradient)" />
              <circle cx="20" cy="12" r="6.5" fill="#9ca3af" stroke="#1f2937" strokeWidth="0.8" />
              {/* Defensive stance - arms wide */}
              <line x1="12" y1="18" x2="6" y2="16" stroke="#4b5563" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="28" y1="18" x2="34" y2="16" stroke="#4b5563" strokeWidth="2.5" strokeLinecap="round" />
              <text x="20" y="25" textAnchor="middle" fontSize="11" fontWeight="900" fill="#d1d5db" fontFamily="sans-serif">
                {number}
              </text>
            </g>
          )}

          {type === 'ball' && (
            <g filter="url(#ballShadow)">
              {/* Pitch contact shadow */}
              <motion.ellipse
                cx="20"
                cy="31"
                rx="11"
                ry="3.2"
                fill="rgba(0,0,0,0.35)"
                animate={{ rx: [9, 12, 9], opacity: [0.24, 0.42, 0.24] }}
                transition={{ duration: 0.9, repeat: Infinity, ease: 'easeInOut' }}
              />

              {/* Rotating match ball shell */}
              <motion.g
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 1.15, repeat: Infinity, ease: 'linear' }}
                style={{ transformOrigin: '20px 20px' }}
              >
                <circle cx="20" cy="20" r="14" fill="url(#ballGradient)" stroke="#111827" strokeWidth="0.7" />
                <g clipPath="url(#ballClip)">
                  {/* Modern panel seams */}
                  <path d="M 20 6 C 25 8 29 12 31 17 C 27 18 23 18 20 16 C 17 18 13 18 9 17 C 11 12 15 8 20 6 Z" fill="#111827" />
                  <path d="M 8 18 C 12 20 15 23 16 28 C 11 28 7 25 5 21 C 5.5 20 6.5 19 8 18 Z" fill="#111827" />
                  <path d="M 32 18 C 28 20 25 23 24 28 C 29 28 33 25 35 21 C 34.5 20 33.5 19 32 18 Z" fill="#111827" />
                  <path d="M 17 29 C 19 26 21 26 23 29 C 22 32 18 32 17 29 Z" fill="#111827" />
                  <path d="M 20 16 C 23 18 24 22 23 25 C 21 26 19 26 17 25 C 16 22 17 18 20 16 Z" fill="#111827" />
                  <g fill="none" stroke="#0f172a" strokeWidth="0.65" opacity="0.75">
                    <path d="M 20 6 C 19 10 19 13 20 16" />
                    <path d="M 9 17 C 12 18 15 19 20 16" />
                    <path d="M 31 17 C 28 18 25 19 20 16" />
                    <path d="M 8 18 C 11 22 14 25 17 25" />
                    <path d="M 32 18 C 29 22 26 25 23 25" />
                    <path d="M 17 25 C 18 27 19 28 20 31" />
                    <path d="M 23 25 C 22 27 21 28 20 31" />
                  </g>
                </g>
              </motion.g>

              {/* Stationary glass highlight gives the ball volume while the shell spins */}
              <circle cx="20" cy="20" r="14" fill="url(#ballShine)" opacity="0.8" />
              <ellipse cx="15" cy="13" rx="4.8" ry="2.8" fill="rgba(255,255,255,0.55)" transform="rotate(-28 15 13)" />
              <circle cx="20" cy="20" r="14" fill="none" stroke="rgba(255,255,255,0.75)" strokeWidth="0.45" />
            </g>
          )}
        </svg>
      </div>

      {/* Selection Ring Animation */}
      {isSelected && !isBall && (
        <>
          <motion.div 
            className="absolute -inset-1.5 border-2 border-amber-500 rounded-full"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: [1, 1.1, 1], opacity: 1 }}
            transition={{ scale: { repeat: Infinity, duration: 1.5, ease: "easeInOut" }, opacity: { duration: 0.3 } }}
          />
          <motion.div 
            className="absolute -inset-3 border border-amber-500/30 rounded-full"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: [1, 1.3], opacity: [0.3, 0] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "easeOut" }}
          />
        </>
      )}
      
      {/* Focus/Pressure indicator */}
      {isFocused && !isSelected && !isBall && (
        <motion.div 
          className="absolute -inset-1 border-2 border-red-500 rounded-full"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: [1, 1.05, 1], opacity: 0.6 }}
          transition={{ scale: { repeat: Infinity, duration: 0.8, ease: "easeInOut" } }}
        />
      )}
    </div>
  );
};