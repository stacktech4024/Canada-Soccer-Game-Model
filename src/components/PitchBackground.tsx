import React from 'react';

interface PitchBackgroundProps {
  showGrid?: boolean;
  moment?: string;
}

// Fixed shadow positions - generated once, not on every render
const SHADOW_POSITIONS = [
  { left: 15, top: 20 }, { left: 35, top: 45 }, { left: 55, top: 30 },
  { left: 75, top: 55 }, { left: 25, top: 70 }, { left: 45, top: 85 },
  { left: 65, top: 15 }, { left: 85, top: 40 }, { left: 10, top: 60 },
  { left: 50, top: 50 }, { left: 30, top: 35 }, { left: 70, top: 75 }
];

export const PitchBackground: React.FC<PitchBackgroundProps> = ({ showGrid = true, moment = 'att-org' }) => {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Base grass color */}
      <div className="absolute inset-0 bg-gradient-to-b from-green-700 via-green-600 to-green-700" />
      
      {/* Grass texture pattern - mowed lawn effect */}
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `repeating-linear-gradient(
            90deg,
            transparent,
            transparent 2px,
            rgba(0,0,0,0.1) 2px,
            rgba(0,0,0,0.1) 4px
          )`,
          backgroundSize: '4px 100%'
        }}
      />
      
      {/* Grass blade effect - diagonal lines */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `repeating-linear-gradient(
            45deg,
            transparent,
            transparent 6px,
            rgba(255,255,255,0.05) 6px,
            rgba(255,255,255,0.05) 8px
          )`,
          backgroundSize: '16px 16px'
        }}
      />
      
      {/* Darker penalty area zones */}
      <div className="absolute top-[4%] left-[25%] w-[50%] h-[15%] bg-green-800/30 pointer-events-none" />
      <div className="absolute bottom-[4%] left-[25%] w-[50%] h-[15%] bg-green-800/30 pointer-events-none" />
      
      {/* Center circle subtle shadow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[20%] h-[20%] rounded-full bg-green-800/20 pointer-events-none" />
      
      {/* Sun/lighting effect - subtle vignette */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 50% 30%, rgba(255,255,255,0.08) 0%, rgba(0,0,0,0.35) 100%)'
        }}
      />
      
      {/* Fixed shadow spots under players */}
      <div className="absolute inset-0 pointer-events-none">
        {SHADOW_POSITIONS.map((pos, i) => (
          <div
            key={i}
            className="absolute w-8 h-3 bg-black/20 rounded-full blur-sm"
            style={{
              left: `${pos.left}%`,
              top: `${pos.top}%`,
              transform: 'translate(-50%, -50%)'
            }}
          />
        ))}
      </div>
    </div>
  );
};