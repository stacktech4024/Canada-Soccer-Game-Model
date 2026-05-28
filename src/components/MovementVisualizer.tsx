import React from 'react';
import { PlayerProfile } from '../data/players';
import { motion } from 'motion/react';
import { PlayerPiece } from './PlayerPiece';
import {
  buildMotionWaypoints,
  inferMotionRole,
  inferMovementIntent,
  getMotionProfile,
  MovementIntent,
  Point,
} from '../utils/motionRealism';

interface MovementVisualizerProps {
  player: PlayerProfile;
}

const getCurvedPath = (points: Point[], intent: MovementIntent) => {
  if (points.length < 2) return '';

  const waypoints = buildMotionWaypoints(points[0], points[points.length - 1], intent);
  if (waypoints.length < 3) {
    return `M ${waypoints[0].x} ${waypoints[0].y} L ${waypoints[1].x} ${waypoints[1].y}`;
  }

  const [start, control, end] = waypoints;
  return `M ${start.x} ${start.y} Q ${control.x} ${control.y} ${end.x} ${end.y}`;
};

export const MovementVisualizer: React.FC<MovementVisualizerProps> = ({ player }) => {
  const playerRole = inferMotionRole(player.shortPos, player.number);

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
        <defs>
          <marker id={`movement-arrow-${player.id}`} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="4" markerHeight="4" orient="auto">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="white" opacity="0.8" />
          </marker>
        </defs>

        {/* Draw Zones First */}
        {player.patterns.filter(p => p.type === 'zone').map((pattern) => (
          <motion.polygon
            key={pattern.id}
            points={pattern.points.map(p => `${p.x},${p.y}`).join(' ')}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.2 }}
            className="fill-amber-500 stroke-amber-500/50 stroke-1"
            transition={{ duration: 1 }}
          >
            <title>{pattern.label}</title>
          </motion.polygon>
        ))}

        {/* Draw Paths with game-realistic curves instead of straight robotic lines */}
        {player.patterns.filter(p => p.type === 'path').map((pattern) => {
          const from = pattern.points[0];
          const to = pattern.points[pattern.points.length - 1];
          const loweredLabel = pattern.label.toLowerCase();
          const intent = loweredLabel.includes('overlap')
            ? 'overlap'
            : loweredLabel.includes('recover')
              ? 'recover'
              : loweredLabel.includes('rush') || loweredLabel.includes('challenge')
                ? 'press'
                : loweredLabel.includes('attack')
                  ? 'finish'
                  : inferMovementIntent(from, to, playerRole, 'att-org');
          const profile = getMotionProfile(playerRole, intent, true);
          const curvedPath = getCurvedPath(pattern.points, intent);

          return (
            <g key={pattern.id}>
              <motion.path
                d={curvedPath}
                fill="none"
                stroke="white"
                strokeWidth="1.5"
                strokeDasharray={intent === 'press' || intent === 'recover' ? '2 1.5' : '4 2'}
                markerEnd={`url(#movement-arrow-${player.id})`}
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: intent === 'press' || intent === 'recover' ? 0.85 : 0.65 }}
                transition={{
                  duration: profile.durationMs / 1000,
                  ease: intent === 'press' || intent === 'recover' ? 'easeOut' : 'easeInOut',
                  repeat: Infinity,
                  repeatDelay: 1,
                }}
              />

              {/* Moving player ghost: shows timing, acceleration, and curved run direction */}
              <motion.circle
                r="1.6"
                fill="white"
                initial={{ offsetDistance: '0%', opacity: 0 }}
                animate={{ offsetDistance: ['0%', '55%', '100%'], opacity: [0, 0.9, 0] }}
                transition={{
                  duration: profile.durationMs / 1000,
                  delay: profile.delayMs / 1000,
                  ease: intent === 'press' || intent === 'recover' ? 'easeOut' : 'easeInOut',
                  repeat: Infinity,
                  repeatDelay: 1,
                }}
                style={{
                  offsetPath: `path('${curvedPath}')`,
                }}
              />

              <text
                x={to.x}
                y={to.y + 6}
                textAnchor="middle"
                className="fill-stone-500 font-mono text-[2.4px] uppercase tracking-widest font-bold pointer-events-none"
              >
                {intent} · {pattern.label}
              </text>
            </g>
          );
        })}

        {/* Player Piece Representation */}
        <foreignObject
          x={player.coordinates.x - 4}
          y={player.coordinates.y - 4}
          width="8"
          height="8"
          className="overflow-visible"
        >
          <div className="w-full h-full flex items-center justify-center">
            <PlayerPiece 
              number={player.number}
              type={player.number === 1 ? 'pfc_gk' : 'pfc_player'}
              isSelected={false}
              isFocused={false}
              className="w-full h-full"
            />
          </div>
        </foreignObject>

        {/* Dynamic Labels on Pitch */}
        {player.patterns.filter(p => p.type === 'zone').map((pattern) => {
          const point = pattern.points[0];
          return (
            <motion.g
              key={`label-group-${pattern.id}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2 }}
            >
              <text
                x={point.x}
                y={point.y + 2}
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
        Motion Engine :: {player.shortPos}
      </div>
    </div>
  );
};