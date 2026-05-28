import { MovementIntent } from '../utils/motionRealism';
import { Moment } from './tactics';

export type BallAction = 'pass' | 'carry' | 'cross' | 'shot';

export interface ScenarioMotionStep {
  stepDurationMs: number;
  ballAction: BallAction;
  movementIntents: Record<number, MovementIntent>;
  opponentReaction: 'hold' | 'shift' | 'press' | 'drop' | 'recover';
  coachingNote: string;
}

export const SCENARIO_MOTION: Record<Moment, ScenarioMotionStep[]> = {
  'att-org': [
    {
      stepDurationMs: 2600,
      ballAction: 'pass',
      movementIntents: { 1: 'hold', 4: 'support', 5: 'support', 6: 'support' },
      opponentReaction: 'press',
      coachingNote: 'The goalkeeper invites pressure while centre-backs split and the anchor creates a passing lane.',
    },
    {
      stepDurationMs: 2400,
      ballAction: 'pass',
      movementIntents: { 4: 'support', 6: 'support', 8: 'rotate', 10: 'rotate' },
      opponentReaction: 'shift',
      coachingNote: 'The first line is broken with a controlled pass into the anchor; interiors rotate into half-space support.',
    },
    {
      stepDurationMs: 2800,
      ballAction: 'pass',
      movementIntents: { 2: 'overlap', 6: 'support', 7: 'rotate', 9: 'support', 10: 'support', 11: 'hold' },
      opponentReaction: 'shift',
      coachingNote: 'The switch should feel faster than the supporting run; the wide player receives as the winger stretches depth.',
    },
    {
      stepDurationMs: 3000,
      ballAction: 'cross',
      movementIntents: { 2: 'carry', 7: 'support', 8: 'support', 9: 'finish', 10: 'support', 11: 'finish' },
      opponentReaction: 'drop',
      coachingNote: 'Final-third movement should stagger: ball carrier first, box runners second, cutback support last.',
    },
    {
      stepDurationMs: 1800,
      ballAction: 'shot',
      movementIntents: { 9: 'finish', 11: 'support' },
      opponentReaction: 'recover',
      coachingNote: 'The finish is the quickest ball action; the striker movement should arrive before the ball reaches goal.',
    },
  ],
  'def-org': [
    {
      stepDurationMs: 2500,
      ballAction: 'pass',
      movementIntents: { 7: 'press', 8: 'press', 9: 'press', 10: 'press', 11: 'press' },
      opponentReaction: 'hold',
      coachingNote: 'The first pressing line jumps together while the second line stays compact behind the press.',
    },
    {
      stepDurationMs: 2800,
      ballAction: 'pass',
      movementIntents: { 2: 'hold', 3: 'hold', 4: 'hold', 5: 'hold', 6: 'support', 8: 'support', 10: 'support', 11: 'press' },
      opponentReaction: 'shift',
      coachingNote: 'The block slides side-to-side as a connected unit, with far-side players narrowing instead of chasing.',
    },
    {
      stepDurationMs: 2600,
      ballAction: 'carry',
      movementIntents: { 4: 'hold', 5: 'hold', 6: 'hold', 8: 'hold', 9: 'press' },
      opponentReaction: 'shift',
      coachingNote: 'Compact control is slower and more patient; players should not sprint unless a trigger appears.',
    },
  ],
  'trans-att': [
    {
      stepDurationMs: 1600,
      ballAction: 'carry',
      movementIntents: { 6: 'carry', 9: 'support', 10: 'support' },
      opponentReaction: 'recover',
      coachingNote: 'The first action after winning possession is a clean touch and immediate vertical support.',
    },
    {
      stepDurationMs: 1900,
      ballAction: 'pass',
      movementIntents: { 7: 'rotate', 9: 'finish', 10: 'support', 11: 'rotate' },
      opponentReaction: 'recover',
      coachingNote: 'The striker stretches depth immediately while wide players sprint into lanes at different angles.',
    },
    {
      stepDurationMs: 2200,
      ballAction: 'cross',
      movementIntents: { 7: 'carry', 8: 'support', 9: 'finish', 11: 'finish' },
      opponentReaction: 'drop',
      coachingNote: 'The cross should arrive after the striker has separated from the defender, not before.',
    },
    {
      stepDurationMs: 1500,
      ballAction: 'shot',
      movementIntents: { 9: 'finish', 11: 'support' },
      opponentReaction: 'recover',
      coachingNote: 'The shot is explosive and direct; supporting runners continue for rebounds.',
    },
  ],
  'trans-def': [
    {
      stepDurationMs: 1400,
      ballAction: 'carry',
      movementIntents: { 4: 'recover', 6: 'press', 8: 'press' },
      opponentReaction: 'press',
      coachingNote: 'The nearest players react first; recovery players protect the central lane.',
    },
    {
      stepDurationMs: 1800,
      ballAction: 'carry',
      movementIntents: { 6: 'press', 8: 'press', 10: 'press' },
      opponentReaction: 'press',
      coachingNote: 'The five-second fuse should look aggressive, with short explosive pressure around the ball.',
    },
    {
      stepDurationMs: 2400,
      ballAction: 'pass',
      movementIntents: { 1: 'recover', 2: 'recover', 3: 'recover', 4: 'recover', 5: 'recover' },
      opponentReaction: 'shift',
      coachingNote: 'Once the counter-press is broken, recovery runs become longer and more goal-side.',
    },
  ],
  'set-pieces': [
    {
      stepDurationMs: 2700,
      ballAction: 'cross',
      movementIntents: { 2: 'hold', 5: 'finish', 7: 'support', 8: 'support', 9: 'finish', 10: 'support', 11: 'finish' },
      opponentReaction: 'drop',
      coachingNote: 'Simple corner routine: show a short-corner decoy, then attack the corridor between the six-yard box and penalty spot. #9 attacks the near-post lane, #5 attacks central height, #11 holds the far-post lane, and #8/#10 stay alive for the second ball or cutback.',
    },
  ],
};

export const getScenarioMotionStep = (moment: Moment, stepIndex: number): ScenarioMotionStep | null => {
  const steps = SCENARIO_MOTION[moment];
  if (!steps || steps.length === 0) return null;
  return steps[Math.min(stepIndex, steps.length - 1)] ?? null;
};
