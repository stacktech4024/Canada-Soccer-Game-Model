# Game-Realistic Motion Engine

This branch adds the first layer of a motion-realism system for the Canada Soccer Game Model.

## Why this exists

Traditional tactical boards often move players in straight lines from point A to point B. That is easy to read, but it can look robotic. A more realistic coaching animation should still be simple enough to teach from, while showing football behaviours that feel believable.

## Motion principles

The motion engine is built around six coaching principles:

1. **Intent before animation**
   A movement should know why it is happening: support, rotate, overlap, press, recover, carry, finish, or hold.

2. **Role-based movement**
   A winger, fullback, centre-back, striker, and goalkeeper should not move with the same speed or timing.

3. **Acceleration and deceleration**
   Movement should ease in and out so players do not look like icons snapping between static diagram points.

4. **Curved paths**
   Most football actions are not perfectly straight. Overlaps, rotations, and finishing runs use curved support waypoints.

5. **Readable coaching visuals**
   The goal is not full video-game simulation. The model should remain clean, explainable, and useful for session planning.

6. **Ball moves differently than players**
   Passes, crosses, carries, and shots should have different timing profiles.

## Files added or changed

- `src/utils/motionRealism.ts`
  - Defines motion roles, movement intents, role-based timing profiles, pitch clamping, curved waypoint generation, and ball transition timing.

- `src/components/MovementVisualizer.tsx`
  - Replaces straight movement lines with curved paths.
  - Adds a moving ghost marker to communicate timing, acceleration, and directional realism.
  - Labels movement paths by inferred intent.

## Next integration step

The next step is to wire this engine directly into `TacticalBoard.tsx` so live tactical scenarios use:

- role-based player transitions,
- curved sequence movement,
- realistic ball timing,
- opponent reaction triggers,
- and scenario-level movement intents stored in `tactics.ts`.

## Suggested future TacticalStep extension

```ts
movementIntents?: Record<number, MovementIntent>;
ballAction?: 'pass' | 'carry' | 'cross' | 'shot';
stepDurationMs?: number;
```

That would allow each scenario step to explicitly describe how each player should move instead of relying only on automatic inference.
