# Live Tactical Board Overlays

This branch adds the groundwork for wiring Phase 3 visuals into the live `TacticalBoard`.

## Added files

- `src/utils/tacticalOverlayPaths.ts`
  - builds curved run paths
  - builds ball paths
  - builds opponent shape lines
  - calculates set-piece delivery zones

- `src/components/LiveTacticalOverlays.tsx`
  - renders run trails for focused players
  - renders ball path during scenario playback
  - renders defensive/opponent shape line
  - renders set-piece delivery zone

## Intended mount point

Inside `src/components/TacticalBoard.tsx`, import:

```tsx
import { LiveTacticalOverlays } from './LiveTacticalOverlays';
```

Then mount inside the pitch container after the grid/field SVG layers and before the player layers:

```tsx
<LiveTacticalOverlays
  moment={moment}
  isPlaying={isPlaying}
  activeStep={activeStep}
  activeMotionStep={activeMotionStep}
  activePositions={activePositions}
  homeBasePositions={customPositions}
  ballPos={ballPos}
  opponentPositions={opponentPositions}
/>
```

## Why this is separate

`TacticalBoard.tsx` is a large file with existing animation, drag, pass, ball, AI analysis, and scenario logic. This PR keeps Phase 3 safe by adding the reusable overlay system first. The next small PR should only import and mount `LiveTacticalOverlays` in `TacticalBoard.tsx`.

## Expected visual result

When wired into the board:

- Active/focused players show curved run trails.
- Ball movement shows a visual path.
- Opponent defensive/midfield lines show their reaction shape.
- Set Pieces shows the delivery/target zone.
