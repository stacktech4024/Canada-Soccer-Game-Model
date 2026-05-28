export type Point = { x: number; y: number };

export type MovementIntent =
  | 'support'
  | 'rotate'
  | 'overlap'
  | 'press'
  | 'recover'
  | 'carry'
  | 'finish'
  | 'hold';

export type PlayerMotionRole =
  | 'GK'
  | 'CB'
  | 'FB'
  | 'CDM'
  | 'CM'
  | 'AM'
  | 'W'
  | 'CF'
  | 'DEFAULT';

export interface MotionProfile {
  role: PlayerMotionRole;
  intent: MovementIntent;
  delayMs: number;
  durationMs: number;
  stiffness: number;
  damping: number;
  mass: number;
}

export interface MotionWaypoint extends Point {
  t: number;
  intent?: MovementIntent;
}

export const clampPitchPoint = (point: Point): Point => ({
  x: Math.min(96, Math.max(4, point.x)),
  y: Math.min(112, Math.max(8, point.y)),
});

export const inferMotionRole = (label: string, playerNumber?: number): PlayerMotionRole => {
  if (playerNumber === 1 || label.includes('GK')) return 'GK';
  if (label.includes('CB')) return 'CB';
  if (label.includes('RB') || label.includes('LB') || label.includes('FB')) return 'FB';
  if (label.includes('CDM')) return 'CDM';
  if (label.includes('CAM')) return 'AM';
  if (label.includes('CM')) return 'CM';
  if (label.includes('RW') || label.includes('LW') || label.includes('W')) return 'W';
  if (label.includes('CF') || label.includes('ST')) return 'CF';
  return 'DEFAULT';
};

export const inferMovementIntent = (
  from: Point,
  to: Point,
  role: PlayerMotionRole,
  moment: string,
  hasBall = false
): MovementIntent => {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const distance = Math.hypot(dx, dy);

  if (hasBall) return 'carry';
  if (moment === 'trans-def') return dy > 8 ? 'recover' : 'press';
  if (moment === 'def-org') return 'hold';
  if (to.y < 24 && (role === 'CF' || role === 'W' || role === 'AM')) return 'finish';
  if (role === 'FB' && Math.abs(dx) > 8 && dy < -8) return 'overlap';
  if (distance > 18 && dy < 0) return 'rotate';
  return 'support';
};

export const getMotionProfile = (
  role: PlayerMotionRole,
  intent: MovementIntent,
  isFocused = false
): MotionProfile => {
  const baseByRole: Record<PlayerMotionRole, Pick<MotionProfile, 'durationMs' | 'stiffness' | 'damping' | 'mass'>> = {
    GK: { durationMs: 1300, stiffness: 42, damping: 24, mass: 1.1 },
    CB: { durationMs: 1250, stiffness: 48, damping: 22, mass: 1.0 },
    FB: { durationMs: 1050, stiffness: 62, damping: 19, mass: 0.85 },
    CDM: { durationMs: 1150, stiffness: 55, damping: 21, mass: 0.95 },
    CM: { durationMs: 1050, stiffness: 60, damping: 20, mass: 0.9 },
    AM: { durationMs: 950, stiffness: 68, damping: 18, mass: 0.8 },
    W: { durationMs: 900, stiffness: 74, damping: 17, mass: 0.75 },
    CF: { durationMs: 900, stiffness: 72, damping: 17, mass: 0.78 },
    DEFAULT: { durationMs: 1100, stiffness: 55, damping: 20, mass: 0.9 },
  };

  const intentModifiers: Record<MovementIntent, { durationScale: number; delayMs: number; stiffnessBoost: number }> = {
    hold: { durationScale: 1.2, delayMs: 120, stiffnessBoost: -6 },
    support: { durationScale: 1, delayMs: 80, stiffnessBoost: 0 },
    rotate: { durationScale: 1.08, delayMs: 120, stiffnessBoost: -2 },
    overlap: { durationScale: 0.86, delayMs: 160, stiffnessBoost: 8 },
    press: { durationScale: 0.72, delayMs: 0, stiffnessBoost: 16 },
    recover: { durationScale: 0.78, delayMs: 20, stiffnessBoost: 12 },
    carry: { durationScale: 1.15, delayMs: 0, stiffnessBoost: -4 },
    finish: { durationScale: 0.78, delayMs: 100, stiffnessBoost: 12 },
  };

  const base = baseByRole[role];
  const mod = intentModifiers[intent];

  return {
    role,
    intent,
    delayMs: isFocused ? Math.max(0, mod.delayMs - 50) : mod.delayMs,
    durationMs: Math.round(base.durationMs * mod.durationScale),
    stiffness: Math.max(30, base.stiffness + mod.stiffnessBoost),
    damping: base.damping,
    mass: base.mass,
  };
};

export const buildSupportWaypoint = (from: Point, to: Point, intent: MovementIntent): Point => {
  const mid = {
    x: from.x + (to.x - from.x) * 0.52,
    y: from.y + (to.y - from.y) * 0.52,
  };

  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const distance = Math.max(1, Math.hypot(dx, dy));
  const curve = intent === 'overlap' || intent === 'rotate' ? 3.5 : intent === 'finish' ? 2 : 0.8;

  return clampPitchPoint({
    x: mid.x + (-dy / distance) * curve,
    y: mid.y + (dx / distance) * curve,
  });
};

export const buildMotionWaypoints = (from: Point, to: Point, intent: MovementIntent): MotionWaypoint[] => {
  const safeFrom = clampPitchPoint(from);
  const safeTo = clampPitchPoint(to);
  const distance = Math.hypot(safeTo.x - safeFrom.x, safeTo.y - safeFrom.y);

  if (distance < 3 || intent === 'hold' || intent === 'press') {
    return [
      { ...safeFrom, t: 0, intent },
      { ...safeTo, t: 1, intent },
    ];
  }

  const support = buildSupportWaypoint(safeFrom, safeTo, intent);
  return [
    { ...safeFrom, t: 0, intent },
    { ...support, t: 0.55, intent },
    { ...safeTo, t: 1, intent },
  ];
};

export const getBallTransition = (action: 'pass' | 'carry' | 'cross' | 'shot' = 'pass') => {
  const speedByAction = {
    pass: { duration: 0.42, ease: 'easeOut' as const },
    carry: { duration: 0.9, ease: 'easeInOut' as const },
    cross: { duration: 0.58, ease: 'easeOut' as const },
    shot: { duration: 0.32, ease: 'easeIn' as const },
  };

  return speedByAction[action];
};
