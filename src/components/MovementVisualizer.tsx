import React from 'react';
import { PlayerProfile } from '../data/players';
import { motion } from 'motion/react';

interface MovementVisualizerProps {
  player: PlayerProfile;
}

export const MovementVisualizer: React.FC<MovementVisualizerProps> = ({ player }) => {
  return (
    <div className="relative aspect-[4/3] w-full bg-stone-950 border border-stone-800 rounded-lg overflow-hidden group">
      {/* Background Grid */}
      <div className="absolute inset-x-0 top-0 h-px bg-stone-800/30" style={{ top: '25%' }} />
      <div className="absolute inset-x-0 top-0 h-px bg-stone-800/30" style={{ top: '50%' }} />
      <div className="absolute inset-x-0 top-0 h-px bg-stone-800/30" style={{ top: '75%' }} />
      <div className="absolute inset-y-0 left-0 w-px bg-stone-800/30" style={{ left: '25%' }} />
      <div className="absolute inset-y-0 left-0 w-px bg-stone-800/30" style={{ left: '50%' }} />
      <div className="absolute inset-y-0 left-0 w-px bg-stone-800/30" style={{ left: '75%' }} />

      <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full p-4 drop-shadow-2xl">
        {/* Draw Zones First */}
        {player.patterns.filter(p => p.type === 'zone').map((pattern) => (
          <motion.polygon
            key={pattern.id}
            points={pattern.points.map(p => `${p.x},${p.y}`).join(' ')}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.2 }}
            className="fill-amber-500 stroke-amber-500/50 stroke-1"
            transition={{ duration: 1 }}
          />
        ))}

        {/* Draw Paths */}
        {player.patterns.filter(p => p.type === 'path').map((pattern) => (
          <g key={pattern.id}>
            <motion.path
              d={`M ${pattern.points[0].x} ${pattern.points[0].y} ${pattern.points.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ')}`}
              fill="none"
              stroke="white"
              strokeWidth="1.5"
              strokeDasharray="4 2"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.6 }}
              transition={{ duration: 2, ease: "easeInOut", repeat: Infinity, repeatDelay: 1 }}
            />
            {/* Arrowhead */}
            <motion.path
              d="M -1.5 -2 L 0 0 L 1.5 -2"
              fill="none"
              stroke="white"
              strokeWidth="1"
              initial={{ opacity: 0 }}
              animate={{ 
                opacity: 0.8,
                x: pattern.points[pattern.points.length - 1].x,
                y: pattern.points[pattern.points.length - 1].y,
                rotate: Math.atan2(
                  pattern.points[pattern.points.length - 1].y - pattern.points[pattern.points.length - 2].y,
                  pattern.points[pattern.points.length - 1].x - pattern.points[pattern.points.length - 2].x
                ) * (180 / Math.PI) + 90
              }}
              transition={{ duration: 0.5, delay: 1.5 }}
            />
          </g>
        ))}

        {/* Player Position Dot */}
        <motion.circle
          cx={player.coordinates.x}
          cy={player.coordinates.y}
          r="3"
          className="fill-amber-500 shadow-amber-500 shadow-2xl"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
        />

        {/* Dynamic Labels on Pitch */}
        {player.patterns.map((pattern) => {
          const point = pattern.type === 'path' ? pattern.points[pattern.points.length - 1] : pattern.points[0];
          const yOffset = pattern.type === 'path' ? 6 : 2;
          
          return (
            <motion.g
              key={`label-group-${pattern.id}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2 }}
            >
              <text
                x={point.x}
                y={point.y + yOffset}
                textAnchor="middle"
                className="fill-stone-500 font-mono text-[2.5px] uppercase tracking-widest font-bold pointer-events-none"
              >
                {pattern.label}
              </text>
            </motion.g>
          );
        })}
      </svg>

      {/* Labels */}
      <div className="absolute bottom-2 left-2 flex flex-col gap-1">
        {player.patterns.map((p) => (
          <div key={p.id} className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${p.type === 'zone' ? 'bg-amber-500/50' : 'bg-white/50'}`} />
            <span className="text-[8px] font-mono text-stone-500 uppercase tracking-tighter">{p.label}</span>
          </div>
        ))}
      </div>

      <div className="absolute top-2 right-2 text-[8px] font-mono text-stone-700 uppercase">
        Positional Dynamics :: {player.shortPos}
      </div>
    </div>
  );
};
