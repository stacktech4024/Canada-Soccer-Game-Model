export interface TacticalPoint {
  x: number;
  y: number;
}

export interface RunTrailInput {
  playerNumber: number;
  from: TacticalPoint;
  to: TacticalPoint;
  intent?: string;
}

export interface RunTrailPath extends RunTrailInput {
  path: string;
  label: string;
}

export interface DeliveryZone {
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export const clampPointToPitch = (point: TacticalPoint): TacticalPoint => ({
  x: clamp(point.x, 4, 96),
  y: clamp(point.y, 4, 116),
});

export const createCurvedPath = (from: TacticalPoint, to: TacticalPoint, curve = 0.18) => {
  const start = clampPointToPitch(from);
  const end = clampPointToPitch(to);
  const midX = (start.x + end.x) / 2;
  const midY = (start.y + end.y) / 2;
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const controlX = clamp(midX - dy * curve, 4, 96);
  const controlY = clamp(midY + dx * curve, 4, 116);

  return `M ${start.x} ${start.y} Q ${controlX} ${controlY} ${end.x} ${end.y}`;
};

export const createLinePath = (points: TacticalPoint[]) => {
  const clamped = points.map(clampPointToPitch);
  if (clamped.length === 0) return '';
  return clamped.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ');
};

export const createBallPath = (points: TacticalPoint[]) => {
  if (points.length < 2) return '';
  if (points.length === 2) return createCurvedPath(points[0], points[1], 0.08);

  const [first, ...rest] = points.map(clampPointToPitch);
  return `M ${first.x} ${first.y} ${rest.map((point) => `L ${point.x} ${point.y}`).join(' ')}`;
};

export const buildRunTrails = (runs: RunTrailInput[]): RunTrailPath[] => {
  return runs.map((run) => ({
    ...run,
    path: createCurvedPath(run.from, run.to, run.intent === 'overlap' ? 0.28 : 0.18),
    label: `#${run.playerNumber} ${run.intent ?? 'run'}`,
  }));
};

export const createOpponentShapeLine = (opponents: TacticalPoint[]) => {
  if (opponents.length < 2) return '';
  const sorted = [...opponents].sort((a, b) => a.x - b.x);
  return createLinePath(sorted);
};

export const getSetPieceDeliveryZone = (ball: TacticalPoint): DeliveryZone => {
  const isRightCorner = ball.x > 75;
  const isLeftCorner = ball.x < 25;

  if (isRightCorner || isLeftCorner) {
    return {
      x: 38,
      y: 11,
      width: 28,
      height: 15,
      label: 'Corridor delivery zone',
    };
  }

  return {
    x: clamp(ball.x - 10, 8, 72),
    y: clamp(ball.y - 20, 8, 78),
    width: 22,
    height: 16,
    label: 'Set-piece target zone',
  };
};
