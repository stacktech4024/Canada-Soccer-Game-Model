import { AnimatePresence, motion } from 'motion/react';
import { Moment, TacticalStep, OpponentRole } from '../data/tactics';
import {
  buildRunTrails,
  createBallPath,
  createOpponentShapeLine,
  getSetPieceDeliveryZone,
  TacticalPoint,
} from '../utils/tacticalOverlayPaths';
import { ScenarioMotionStep } from '../data/scenarioMotion';

interface LiveOpponent extends TacticalPoint {
  id: number;
  role: OpponentRole;
}

interface LiveTacticalOverlaysProps {
  moment: Moment;
  isPlaying: boolean;
  activeStep: TacticalStep | null;
  activeMotionStep: ScenarioMotionStep | null;
  activePositions: Record<number, TacticalPoint>;
  homeBasePositions: Record<number, TacticalPoint>;
  ballPos: TacticalPoint;
  opponentPositions: LiveOpponent[];
}

const getIntentStroke = (intent?: string) => {
  if (intent === 'finish') return '#facc15';
  if (intent === 'overlap') return '#38bdf8';
  if (intent === 'press' || intent === 'recover') return '#fb7185';
  return '#f59e0b';
};

export const LiveTacticalOverlays = ({
  moment,
  isPlaying,
  activeStep,
  activeMotionStep,
  activePositions,
  homeBasePositions,
  ballPos,
  opponentPositions,
}: LiveTacticalOverlaysProps) => {
  const focusPlayers = activeStep?.focusPlayers ?? [];
  const runTrails = buildRunTrails(
    focusPlayers
      .map((playerNumber) => {
        const from = homeBasePositions[playerNumber];
        const to = activePositions[playerNumber];
        if (!from || !to) return null;
        return {
          playerNumber,
          from,
          to,
          intent: activeMotionStep?.movementIntents?.[playerNumber] ?? 'support',
        };
      })
      .filter(Boolean) as Parameters<typeof buildRunTrails>[0]
  );

  const ballPath = activeStep?.ballPath?.length
    ? createBallPath(activeStep.ballPath)
    : activeStep?.ballPos
      ? createBallPath([ballPos, activeStep.ballPos])
      : '';

  const defensiveShape = createOpponentShapeLine(
    opponentPositions
      .filter((opponent) => opponent.role === 'DEF' || opponent.role === 'MID')
      .map((opponent) => ({ x: opponent.x, y: opponent.y }))
  );

  const deliveryZone = moment === 'set-pieces' ? getSetPieceDeliveryZone(ballPos) : null;

  return (
    <svg viewBox="0 0 100 120" className="absolute inset-0 w-full h-full pointer-events-none z-[35]">
      <defs>
        <marker id="live-run-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="4" markerHeight="4" orient="auto">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#f59e0b" />
        </marker>
        <marker id="live-ball-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#fbbf24" />
        </marker>
      </defs>

      <AnimatePresence>
        {deliveryZone && (
          <motion.g
            key="set-piece-delivery-zone"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.3, 0.75, 0.3] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.8, repeat: Infinity }}
          >
            <rect
              x={deliveryZone.x}
              y={deliveryZone.y}
              width={deliveryZone.width}
              height={deliveryZone.height}
              rx="2"
              fill="rgba(245,158,11,0.12)"
              stroke="#f59e0b"
              strokeWidth="0.6"
              strokeDasharray="2 1.5"
            />
            <text x={deliveryZone.x + 2} y={deliveryZone.y + deliveryZone.height - 2} fontSize="2.5" fill="#fbbf24" fontWeight="900">
              {deliveryZone.label.toUpperCase()}
            </text>
          </motion.g>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isPlaying && defensiveShape && (
          <motion.path
            key={`defensive-shape-${activeMotionStep?.opponentReaction ?? 'hold'}`}
            d={defensiveShape}
            fill="none"
            stroke="#ef4444"
            strokeWidth="0.75"
            strokeDasharray="2 2"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.75 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isPlaying && ballPath && (
          <motion.path
            key={`ball-path-${activeMotionStep?.ballAction ?? 'pass'}-${activeStep?.label ?? 'step'}`}
            d={ballPath}
            fill="none"
            stroke="#fbbf24"
            strokeWidth="0.95"
            strokeDasharray={activeMotionStep?.ballAction === 'carry' ? '1.5 1.5' : '4 2'}
            markerEnd="url(#live-ball-arrow)"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.95 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.75, ease: 'easeOut' }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isPlaying && runTrails.map((trail, index) => (
          <motion.g key={`run-${trail.playerNumber}-${trail.intent}-${activeStep?.label ?? 'step'}`}>
            <motion.path
              d={trail.path}
              fill="none"
              stroke={getIntentStroke(trail.intent)}
              strokeWidth="0.75"
              strokeDasharray={trail.intent === 'hold' ? '1 2' : trail.intent === 'support' ? '2 2' : '4 2'}
              markerEnd="url(#live-run-arrow)"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.85 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.9, delay: index * 0.12 }}
            />
            <motion.text
              x={(trail.from.x + trail.to.x) / 2}
              y={(trail.from.y + trail.to.y) / 2 - 1.2}
              fontSize="2.2"
              fill={getIntentStroke(trail.intent)}
              fontWeight="900"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.85 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.25 + index * 0.12 }}
            >
              {trail.label.toUpperCase()}
            </motion.text>
          </motion.g>
        ))}
      </AnimatePresence>
    </svg>
  );
};
