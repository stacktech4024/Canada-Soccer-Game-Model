import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PlayerProfile } from '../data/players';
import { PlayerPiece } from './PlayerPiece';

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

      {/* Channel Grid (Vertical 6 Channels Canada Soccer Framework) */}
      <div className="absolute inset-0 pointer-events-none opacity-10">
        <div className="absolute inset-y-0 left-[16.6%] w-px bg-white" />
        <div className="absolute inset-y-0 left-[33.3%] w-px bg-white" />
        <div className="absolute inset-y-0 left-[50%] w-px bg-white" />
        <div className="absolute inset-y-0 left-[66.6%] w-px bg-white" />
        <div className="absolute inset-y-0 left-[83.3%] w-px bg-white" />
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

        {/* Selected Player Patterns */}
        <AnimatePresence>
          {activePlayerId && (
            <motion.g 
              key={`patterns-${activePlayerId}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {players.find(p => p.id === activePlayerId)?.patterns.map(pattern => (
                <g key={pattern.id}>
                  {pattern.type === 'zone' ? (
                    <motion.polygon
                      points={pattern.points.map(p => `${p.x},${p.y}`).join(' ')}
                      className="fill-amber-500/10 stroke-amber-500/25 stroke-[0.3]"
                    >
                      <title>{pattern.label}</title>
                    </motion.polygon>
                  ) : (
                    <>
                      <motion.path
                        d={`M ${pattern.points[0].x} ${pattern.points[0].y} ${pattern.points.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ')}`}
                        fill="none"
                        stroke="rgba(255,255,255,0.3)"
                        strokeWidth="0.4"
                        strokeDasharray="1.5 1.5"
                      />
                      <motion.path
                        d="M 0 -1 L 1.5 0 L 0 1 Z"
                        fill="rgba(255,255,255,0.5)"
                        animate={{ 
                          x: pattern.points[pattern.points.length - 1].x,
                          y: pattern.points[pattern.points.length - 1].y,
                          rotate: Math.atan2(
                            pattern.points[pattern.points.length - 1].y - pattern.points[pattern.points.length - 2].y,
                            pattern.points[pattern.points.length - 1].x - pattern.points[pattern.points.length - 2].x
                          ) * (180 / Math.PI)
                        }}
                      />
                    </>
                  )}
                </g>
              ))}
            </motion.g>
          )}
        </AnimatePresence>
      </svg>

      {/* Players */}
      {players.map((player) => (
        <button
          key={player.id}
          onClick={() => onPlayerSelect(player.id)}
          title={`${player.position} (${player.shortPos})`}
          className={`absolute -translate-x-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center transition-all duration-300 transform
            ${activePlayerId === player.id ? 'z-20' : 'z-10'}`}
          style={{ 
            left: `${player.coordinates.x}%`, 
            top: `${player.coordinates.y}%` 
          }}
        >
          <PlayerPiece 
            number={player.number}
            type={player.number === 1 ? 'pfc_gk' : 'pfc_player'}
            isSelected={activePlayerId === player.id}
          />
        </button>
      ))}

      {/* Aesthetic Labels */}
      <div className="absolute top-4 left-4 text-[8px] font-mono text-stone-600 uppercase tracking-widest opacity-50 select-none">
        Zonal Framework v2.0
      </div>
    </div>
  );
};
