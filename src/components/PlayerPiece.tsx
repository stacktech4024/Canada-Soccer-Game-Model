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
  const isGoalkeeper = type === 'pfc_gk';

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
  <g>
    {/* Ground shadow */}
    <ellipse cx="20" cy="28" rx="12" ry="3" fill="rgba(0,0,0,0.3)" />
    
    {/* White ball base */}
    <circle cx="20" cy="20" r="14" fill="#ffffff" stroke="#cccccc" strokeWidth="0.5" />
    
    {/* Black pentagons (Telstar style) */}
    <g fill="#1a1a1a" stroke="#333" strokeWidth="0.3">
      <polygon points="20,11 26.5,15.5 24,23 16,23 13.5,15.5" />
      <polygon points="13.5,15.5 7,12 8,22 13,26 16,23" />
      <polygon points="26.5,15.5 33,12 32,22 27,26 24,23" />
      <polygon points="7,12 9,5 17,5 20,11 13.5,15.5" />
      <polygon points="33,12 31,5 23,5 20,11 26.5,15.5" />
      <polygon points="13,26 20,31 27,26 24,23 16,23" />
    </g>
    
    {/* White panel lines */}
    <g fill="none" stroke="#ffffff" strokeWidth="1" strokeLinecap="round">
      <line x1="20" y1="11" x2="26.5" y2="15.5" />
      <line x1="20" y1="11" x2="13.5" y2="15.5" />
      <line x1="13.5" y1="15.5" x2="7" y2="12" />
      <line x1="13.5" y1="15.5" x2="13" y2="26" />
      <line x1="26.5" y1="15.5" x2="33" y2="12" />
      <line x1="26.5" y1="15.5" x2="27" y2="26" />
      <line x1="7" y1="12" x2="9" y2="5" />
      <line x1="33" y1="12" x2="31" y2="5" />
      <line x1="9" y1="5" x2="17" y2="5" />
      <line x1="31" y1="5" x2="23" y2="5" />
      <line x1="17" y1="5" x2="20" y2="11" />
      <line x1="23" y1="5" x2="20" y2="11" />
      <line x1="13" y1="26" x2="20" y2="31" />
      <line x1="27" y1="26" x2="20" y2="31" />
      <line x1="13" y1="26" x2="16" y2="23" />
      <line x1="27" y1="26" x2="24" y2="23" />
    </g>
    
    {/* 3D shine */}
    <ellipse cx="15" cy="14" rx="5" ry="3" fill="rgba(255,255,255,0.6)" transform="rotate(-30 15 14)" />
    <ellipse cx="13" cy="12" rx="2" ry="1.5" fill="rgba(255,255,255,0.8)" transform="rotate(-30 13 12)" />
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