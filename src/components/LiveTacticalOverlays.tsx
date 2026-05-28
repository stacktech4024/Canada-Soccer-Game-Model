import { AnimatePresence, motion } from 'motion/react';
import { Moment, TacticalStep, OpponentRole } from '../data/tactics';
import {
  buildRunTrails,
  createBallPath,
  createCurvedPath,
  createOpponentShapeLine,
  getSetPieceDeliveryZone,
  TacticalPoint,
} from '../utils/tacticalOverlayPaths';
import { OpponentMovementIntent, ScenarioMotionStep } from '../data/scenarioMotion';

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

const getDefenderIntentStroke = (intent?: OpponentMovementIntent) => {
  if (intent === 'attack-ball') return '#fde68a';
  if (intent === 'track-runner') return '#fb7185';
  if (intent === 'mark') return '#f97316';
  if (intent === 'screen') return '#facc15';
  if (intent === 'recover-line') return '#93c5fd';
  return '#f87171';
};

const getDefenderIntentTarget = (opponent: LiveOpponent, intent?: OpponentMovementIntent, ballPos?: TacticalPoint): TacticalPoint => {
  const ball = ballPos ?? { x: 50, y: 15 };

  switch (intent) {
    case 'attack-ball':
      return { x: ball.x + (opponent.x < ball.x ? -3 : 3), y: Math.max(5, ball.y + 1.5) };
    case 'track-runner':
      return { x: opponent.x + (opponent.x < 50 ? 5 : -5), y: Math.max(8, opponent.y - 6) };
    case 'mark':
      return { x: opponent.x + (opponent.x < 50 ? 3.5 : -3.5), y: Math.max(8, opponent.y - 3.5) };
    case 'screen':
      return { x: 50, y: Math.max(10, opponent.y - 2) };
    case 'recover-line':
      return { x: opponent.x, y: Math.max(8, opponent.y - 8) };
    case 'cover-zone':
    default:
      return { x: opponent.x + (ball.x - opponent.x) * 0.2, y: Math.max(8, opponent.y - 2.5) };
  }
};

const GoalNet = ({ side, ripple }: { side: 'top' | 'bottom'; ripple: boolean }) => {
  const isTop = side === 'top';
  const mouthY = isTop ? 3.6 : 116.4;
  const backY = isTop ? -1.6 : 121.6;
  const postTopY = isTop ? 3.6 : 110.8;
  const postBottomY = isTop ? 9.4 : 116.4;

  return (
    <motion.g
      initial={false}
      animate={ripple ? { scaleY: [1, 1.22, 0.94, 1], opacity: [0.65, 0.98, 0.82, 0.72] } : { scaleY: 1, opacity: 0.72 }}
      transition={{ duration: ripple ? 0.85 : 0.4, ease: 'easeOut' }}
      style={{ transformOrigin: `50px ${mouthY}px` }}
    >
      {/* Goal frame */}
      <line x1="38" y1={mouthY} x2="62" y2={mouthY} stroke="rgba(255,255,255,0.95)" strokeWidth="0.75" strokeLinecap="round" />
      <line x1="38" y1={postTopY} x2="38" y2={postBottomY} stroke="rgba(255,255,255,0.95)" strokeWidth="0.75" strokeLinecap="round" />
      <line x1="62" y1={postTopY} x2="62" y2={postBottomY} stroke="rgba(255,255,255,0.95)" strokeWidth="0.75" strokeLinecap="round" />

      {/* Net roof/back */}
      <path
        d={`M 38 ${mouthY} L 34 ${backY} L 66 ${backY} L 62 ${mouthY}`}
        fill="rgba(255,255,255,0.06)"
        stroke="rgba(255,255,255,0.55)"
        strokeWidth="0.35"
      />

      {/* Net grid */}
      {[40, 44, 48, 52, 56, 60].map((x) => (
        <line key={`${side}-net-v-${x}`} x1={x} y1={mouthY} x2={x + (x < 50 ? -2 : 2)} y2={backY} stroke="rgba(255,255,255,0.42)" strokeWidth="0.22" />
      ))}
      {[0.25, 0.5, 0.75].map((t) => {
        const y = mouthY + (backY - mouthY) * t;
        return <line key={`${side}-net-h-${t}`} x1="36" y1={y} x2="64" y2={y} stroke="rgba(255,255,255,0.36)" strokeWidth="0.22" />;
      })}

      {/* Quick ball impact flash when a goal step plays */}
      {ripple && (
        <motion.circle
          cx="50"
          cy={isTop ? 4.8 : 115.2}
          r="1.4"
          fill="rgba(250,204,21,0.9)"
          initial={{ scale: 0.2, opacity: 0.9 }}
          animate={{ scale: 5.5, opacity: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      )}
    </motion.g>
  );
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
  const isGoalStep = Boolean(activeStep?.label?.toUpperCase().includes('GOAL'));
  const isAttackingGoal = ballPos.y < 60;
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

  const defenderTrails = moment === 'set-pieces'
    ? opponentPositions
        .filter((opponent) => activeMotionStep?.opponentMovementIntents?.[opponent.id])
        .map((opponent) => {
          const intent = activeMotionStep?.opponentMovementIntents?.[opponent.id];
          const to = getDefenderIntentTarget(opponent, intent, ballPos);
          return {
            opponent,
            intent,
            to,
            path: createCurvedPath(opponent, to, intent === 'track-runner' ? -0.22 : -0.12),
          };
        })
    : [];

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
        <marker id="defender-run-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="4" markerHeight="4" orient="auto">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#fb7185" />
        </marker>
        <filter id="net-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="0.9" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Realistic goal net overlays. These stay behind the tactical actors but give goals a real target. */}
      <g filter="url(#net-glow)">
        <GoalNet side="top" ripple={isPlaying && isGoalStep && isAttackingGoal} />
        <GoalNet side="bottom" ripple={isPlaying && isGoalStep && !isAttackingGoal} />
      </g>

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
        {isPlaying && defenderTrails.map(({ opponent, intent, path, to }, index) => (
          <motion.g key={`defender-run-${opponent.id}-${intent}-${activeStep?.label ?? 'step'}`}>
            <motion.path
              d={path}
              fill="none"
              stroke={getDefenderIntentStroke(intent)}
              strokeWidth="0.7"
              strokeDasharray={intent === 'screen' || intent === 'cover-zone' ? '1.4 1.4' : '3 1.8'}
              markerEnd="url(#defender-run-arrow)"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.88 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.95, delay: 0.08 + index * 0.1 }}
            />
            <motion.circle
              cx={to.x}
              cy={to.y}
              r="1.25"
              fill="rgba(248,113,113,0.22)"
              stroke={getDefenderIntentStroke(intent)}
              strokeWidth="0.35"
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: [0.9, 1.2, 0.9], opacity: 0.85 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2, repeat: Infinity, delay: index * 0.08 }}
            />
            <motion.text
              x={(opponent.x + to.x) / 2}
              y={(opponent.y + to.y) / 2 + 2.3}
              fontSize="2"
              fill={getDefenderIntentStroke(intent)}
              fontWeight="900"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.9 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.25 + index * 0.08 }}
            >
              D{opponent.id} {intent?.replace('-', ' ').toUpperCase()}
            </motion.text>
          </motion.g>
        ))}
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