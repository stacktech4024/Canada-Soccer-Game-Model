import React from 'react';
import { PlayerProfile } from '../data/players';

interface PitchProps {
  activePlayerId: string | null;
  players: PlayerProfile[];
  onPlayerSelect: (id: string) => void;
}

export const Pitch: React.FC<PitchProps> = ({ activePlayerId, players, onPlayerSelect }) => {
  return (
    <div className="relative aspect-[100/120] w-full max-w-[450px] border-4 border-stone-800 bg-stone-950 overflow-hidden rounded-2xl shadow-2xl mx-auto lg:mx-0">
      {/* Grass Texture */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_0.5px,transparent_0.5px)] [background-size:10px_10px] pointer-events-none" />

      {/* Zonal Grid (Horizontal 1-4 Canada Soccer Framework) */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute inset-x-0 top-[25%] h-px bg-white/50" />
        <div className="absolute inset-x-0 top-[50%] h-px bg-white" />
        <div className="absolute inset-x-0 top-[75%] h-px bg-white/50" />
      </div>

      {/* Channel Grid (Vertical 5 Channels) */}
      <div className="absolute inset-0 pointer-events-none opacity-10">
        <div className="absolute inset-y-0 left-[20%] w-px bg-white" />
        <div className="absolute inset-y-0 left-[40%] w-px bg-white" />
        <div className="absolute inset-y-0 left-[60%] w-px bg-white" />
        <div className="absolute inset-y-0 left-[80%] w-px bg-white" />
      </div>

      {/* Pitch Markings SVG */}
      <svg viewBox="0 0 100 120" className="absolute inset-0 w-full h-full pointer-events-none">
        <rect x="5" y="5" width="90" height="110" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" />
        <circle cx="50" cy="60" r="12" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" />
        <line x1="5" y1="60" x2="95" y2="60" stroke="rgba(255,255,255,0.3)" strokeWidth="0.5" />
        <rect x="25" y="5" width="50" height="18" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" />
        <rect x="25" y="97" width="50" height="18" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" />
        
        {/* The Nets (Goals) */}
        <rect x="42" y="2" width="16" height="3" fill="none" stroke="white" strokeWidth="1" opacity="0.4" rx="1" />
        <rect x="42" y="115" width="16" height="3" fill="none" stroke="white" strokeWidth="1" opacity="0.4" rx="1" />
      </svg>

      {/* Players */}
      {players.map((player) => (
        <button
          key={player.id}
          onClick={() => onPlayerSelect(player.id)}
          className={`absolute -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center text-xs font-black transition-all duration-300 transform
            ${activePlayerId === player.id 
              ? 'bg-amber-500 text-stone-950 scale-125 z-20 shadow-[0_0_20px_rgba(245,158,11,0.6)]' 
              : 'bg-stone-800 text-stone-400 hover:bg-stone-700 hover:scale-110 z-10'}`}
          style={{ 
            left: `${player.coordinates.x}%`, 
            top: `${player.coordinates.y}%` 
          }}
        >
          {player.number}
          <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-[9px] text-stone-500 font-bold tracking-tighter uppercase">
            {player.shortPos}
          </span>
        </button>
      ))}

      {/* Aesthetic Labels */}
      <div className="absolute top-4 left-4 text-[8px] font-mono text-stone-600 uppercase tracking-widest opacity-50 select-none">
        Zonal Framework v2.0
      </div>
    </div>
  );
};
