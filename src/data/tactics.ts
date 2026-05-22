export type Moment = 'att-org' | 'def-org' | 'trans-att' | 'trans-def' | 'set-pieces';
export type Phase = 'attacking' | 'defending';

export interface TacticalPosition {
  number: number;
  label: string;
  role: string;
  positions: Record<Moment, { x: number; y: number }>;
}

export const SQUAD: TacticalPosition[] = [
  { 
    number: 1, label: 'GK', role: 'Sweeper Keeper (The 11th Player)', 
    positions: {
      'att-org': { x: 50, y: 92 },
      'trans-def': { x: 50, y: 95 },
      'def-org': { x: 50, y: 95 },
      'trans-att': { x: 50, y: 92 },
      'set-pieces': { x: 50, y: 95 }
    }
  },
  { 
    number: 4, label: 'CB', role: 'Left CB (Build-Up Specialist)', 
    positions: {
      'att-org': { x: 30, y: 82 },
      'trans-def': { x: 42, y: 82 },
      'def-org': { x: 42, y: 82 },
      'trans-att': { x: 40, y: 75 },
      'set-pieces': { x: 45, y: 82 }
    }
  },
  { 
    number: 5, label: 'CB', role: 'Right CB (Covering Defender)', 
    positions: {
      'att-org': { x: 70, y: 82 },
      'trans-def': { x: 58, y: 82 },
      'def-org': { x: 58, y: 82 },
      'trans-att': { x: 60, y: 75 },
      'set-pieces': { x: 55, y: 82 }
    }
  },
  { 
    number: 2, label: 'RB', role: 'Right Back (The Stretcher)', 
    positions: {
      'att-org': { x: 92, y: 65 },
      'trans-def': { x: 75, y: 78 },
      'def-org': { x: 75, y: 78 },
      'trans-att': { x: 85, y: 55 },
      'set-pieces': { x: 85, y: 75 }
    }
  },
  { 
    number: 3, label: 'LB', role: 'Left Back (The Stretcher)', 
    positions: {
      'att-org': { x: 8, y: 65 },
      'trans-def': { x: 25, y: 78 },
      'def-org': { x: 25, y: 78 },
      'trans-att': { x: 15, y: 55 },
      'set-pieces': { x: 15, y: 75 }
    }
  },
  { 
    number: 6, label: 'CDM', role: 'Anchor (The Pivot)', 
    positions: {
      'att-org': { x: 50, y: 72 },
      'trans-def': { x: 45, y: 65 },
      'def-org': { x: 45, y: 65 },
      'trans-att': { x: 45, y: 55 },
      'set-pieces': { x: 50, y: 70 }
    }
  },
  { 
    number: 8, label: 'CM', role: 'Box-to-Box (The Engine)', 
    positions: {
      'att-org': { x: 40, y: 55 },
      'trans-def': { x: 55, y: 65 },
      'def-org': { x: 55, y: 65 },
      'trans-att': { x: 42, y: 55 },
      'set-pieces': { x: 35, y: 55 }
    }
  },
  { 
    number: 10, label: 'CM', role: 'Advanced Mid (The Infiltrator)', 
    positions: {
      'att-org': { x: 60, y: 50 },
      'trans-def': { x: 50, y: 55 },
      'def-org': { x: 50, y: 55 },
      'trans-att': { x: 58, y: 45 },
      'set-pieces': { x: 65, y: 55 }
    }
  },
  { 
    number: 7, label: 'RW', role: 'Winger (Width & 1v1)', 
    positions: {
      'att-org': { x: 92, y: 35 },
      'trans-def': { x: 80, y: 55 },
      'def-org': { x: 80, y: 55 },
      'trans-att': { x: 85, y: 25 },
      'set-pieces': { x: 85, y: 35 }
    }
  },
  { 
    number: 11, label: 'LW', role: 'Winger (Width & 1v1)', 
    positions: {
      'att-org': { x: 8, y: 35 },
      'trans-def': { x: 20, y: 55 },
      'def-org': { x: 20, y: 55 },
      'trans-att': { x: 15, y: 25 },
      'set-pieces': { x: 15, y: 35 }
    }
  },
  { 
    number: 9, label: 'CF', role: 'Center Forward (The Finisher)', 
    positions: {
      'att-org': { x: 50, y: 35 },
      'trans-def': { x: 50, y: 40 },
      'def-org': { x: 50, y: 40 },
      'trans-att': { x: 50, y: 15 },
      'set-pieces': { x: 50, y: 20 }
    }
  },
];

export const FORMATIONS: Record<string, { name: string; positions: Record<number, { x: number; y: number; label: string; role: string }> }> = {
  '1-4-3-3': {
    name: '1-4-3-3 (G-4-3-3 Build Up)',
    positions: {
      1: { x: 50, y: 92, label: 'GK', role: 'Sweeper Keeper' },
      4: { x: 30, y: 82, label: 'CB', role: 'Left CB' },
      5: { x: 70, y: 82, label: 'CB', role: 'Right CB' },
      3: { x: 8, y: 65, label: 'LB', role: 'The Stretcher' },
      2: { x: 92, y: 65, label: 'RB', role: 'The Stretcher' },
      6: { x: 50, y: 72, label: 'CDM', role: 'Anchor' },
      8: { x: 40, y: 55, label: 'CM', role: 'Engine' },
      10: { x: 60, y: 50, label: 'CM', role: 'Infiltrator' },
      11: { x: 8, y: 35, label: 'LW', role: 'Winger' },
      7: { x: 92, y: 35, label: 'RW', role: 'Winger' },
      9: { x: 50, y: 35, label: 'CF', role: 'Finisher' }
    }
  },
  '1-4-4-2': {
    name: '1-4-4-2 (Mid-Block Compact)',
    positions: {
      1: { x: 50, y: 95, label: 'GK', role: 'Shot Stopper' },
      4: { x: 42, y: 82, label: 'CB', role: 'Left CB' },
      5: { x: 58, y: 82, label: 'CB', role: 'Right CB' },
      3: { x: 25, y: 75, label: 'LB', role: 'Fullback' },
      2: { x: 75, y: 75, label: 'RB', role: 'Fullback' },
      6: { x: 42, y: 65, label: 'CM', role: 'Holding' },
      8: { x: 58, y: 65, label: 'CM', role: 'Holding' },
      11: { x: 18, y: 55, label: 'LM', role: 'Wide Mid' },
      7: { x: 82, y: 55, label: 'RM', role: 'Wide Mid' },
      10: { x: 45, y: 40, label: 'CF', role: 'Deep Forward' },
      9: { x: 55, y: 42, label: 'CF', role: 'Finisher' }
    }
  },
  '1-4-2-3-1': {
    name: '1-4-2-3-1 (Defensive Structure)',
    positions: {
      1: { x: 50, y: 95, label: 'GK', role: 'Shot Stopper' },
      4: { x: 42, y: 85, label: 'CB', role: 'Stopper' },
      5: { x: 58, y: 85, label: 'CB', role: 'Stopper' },
      3: { x: 20, y: 80, label: 'LB', role: 'Defensive FB' },
      2: { x: 80, y: 80, label: 'RB', role: 'Defensive FB' },
      6: { x: 40, y: 68, label: 'CDM', role: 'Cover Shadow' },
      8: { x: 60, y: 68, label: 'CDM', role: 'Ball Winner' },
      11: { x: 15, y: 55, label: 'LW', role: 'Narrow Winger' },
      10: { x: 50, y: 55, label: 'CAM', role: 'N°10 Block' },
      7: { x: 85, y: 55, label: 'RW', role: 'Narrow Winger' },
      9: { x: 50, y: 45, label: 'CF', role: 'Single Pivot Block' }
    }
  }
};

export const PRINCIPLES: Record<Moment, { title: string; keys: string[] }> = {
  'att-org': {
    title: 'Attacking Organisation',
    keys: [
      'G-4-3-3 Structure: Creating the widest possible pitch to pull opponents out of shape.',
      'Split CBs: Using the width of the penalty area to bypass the first line of pressure.',
      'The Anchor (6): Always positioned in a passing lane to receive and switch play.',
      'The Half-Spaces: Interior midfielders (8/10) exploit corridors between opponent mid/def lines.',
      'Vertical Pulse: Progressive passes to the wingers (7/11) to isolate FBs in 1v1 situations.'
    ]
  },
  'def-org': {
    title: 'Defending Organisation',
    keys: [
      'Compactness: Vertical and horizontal distances between players to deny central penetration.',
      'Cover, Balance, Support: Every player identifies their secondary role when the press is triggered.',
      'Mid-Block (B-): Forcing the opponent into wide areas where the touchline acts as an extra defender.',
      'Protecting the 18: Defensive line drops as a unit to maintain goal-side superiority.',
      'Triggers: Anticipating the "Long Touch" or "Back-Pass" to initiate high intensity pressure.'
    ]
  },
  'trans-att': {
    title: 'Attacking Transition',
    keys: [
      'Clean vs Unclean: If ball won cleanly, verticality is prioritized. If not, protect possession.',
      'Pulse Move: Immediate sprint to stretch the pitch vertically and horizontally.',
      'The Out-let: CF (9) occupies the deepest defender to create immediate depth.',
      'Third-Man Runs: Using the nearest support player to find a runner in behind.'
    ]
  },
  'trans-def': {
    title: 'Defensive Transition',
    keys: [
      'The 5-Second Fuse: Aggressive counter-press for 5 seconds to force a turnover or foul.',
      'Recovery Sprint (The Box): Recovering to the central 18-yard area as a priority.',
      'Delay & Deny: Slowing the counter-attack to allow teammates to recover goal-side.',
      'Identification: Calling out markers to re-establish the defensive shape.'
    ]
  },
  'set-pieces': {
    title: 'Set Pieces',
    keys: [
      'Zonal/Man Mapping: Clear defensive allocation for first and second ball zones.',
      'Attacking Priority: Loading the goal corridor between the 6-yard and penalty spot.',
      'Aggression: Winning the initial aerial duel and the "scramble" immediately after.',
      'Transition Readiness: Designated players always stay back to cover the counter threat.'
    ]
  }
};

export interface TacticalStep {
  label: string;
  highlightZone?: number; 
  highlightChannel?: string; 
  focusPlayers?: number[];
  ballPos?: { x: number; y: number };
  ballPath?: { x: number; y: number }[];
  playerPositions?: Record<number, { x: number; y: number }>;
  opponentPositions?: Record<number, { x: number; y: number }>;
}

export const SEQUENCES: Record<Moment, TacticalStep[]> = {
  'att-org': [
    { 
      label: '1. Build Up: GK (1) invites pressure, starts play short', 
      highlightZone: 1, 
      focusPlayers: [1, 4, 5, 6],
      ballPos: { x: 30, y: 82 },
      ballPath: [{ x: 50, y: 92 }, { x: 30, y: 82 }],
      playerPositions: { 
        1: { x: 50, y: 92 }, 
        4: { x: 30, y: 82 }, 
        5: { x: 70, y: 82 }, 
        6: { x: 50, y: 75 }
      },
      opponentPositions: { 10: { x: 45, y: 65 }, 9: { x: 55, y: 75 } }
    },
    { 
      label: '2. Progression: Break first line via CB (4) to Anchor (6)', 
      focusPlayers: [4, 6],
      ballPos: { x: 50, y: 72 },
      ballPath: [{ x: 30, y: 82 }, { x: 50, y: 72 }],
      playerPositions: { 
        6: { x: 50, y: 72 }, 
        4: { x: 30, y: 82 },
        10: { x: 65, y: 55 },
        8: { x: 35, y: 55 }
      },
      opponentPositions: { 9: { x: 42, y: 75 }, 10: { x: 58, y: 75 }, 6: { x: 50, y: 60 } }
    },
    { 
      label: '3. Expansion: Anchor (6) switches to Wing-Back (2)', 
      focusPlayers: [6, 2, 10, 7], 
      ballPos: { x: 92, y: 55 },
      ballPath: [{ x: 50, y: 72 }, { x: 92, y: 55 }],
      playerPositions: { 
        2: { x: 92, y: 55 }, 
        10: { x: 70, y: 45 },
        7: { x: 88, y: 25 }, 
        9: { x: 55, y: 35 },
        11: { x: 15, y: 35 }
      },
      opponentPositions: { 4: { x: 75, y: 45 }, 5: { x: 60, y: 45 }, 2: { x: 88, y: 50 } }
    },
    { 
      label: '4. Creation: 9 and 11 attack the Box, 8/10 support for Cutback', 
      highlightZone: 4, 
      focusPlayers: [2, 9, 11, 8, 10],
      ballPos: { x: 55, y: 20 },
      ballPath: [{ x: 92, y: 55 }, { x: 94, y: 35 }, { x: 95, y: 15 }, { x: 55, y: 20 }],
      playerPositions: { 
        2: { x: 95, y: 15 }, 
        9: { x: 55, y: 18 }, 
        11: { x: 45, y: 18 }, 
        8: { x: 42, y: 32 }, 
        10: { x: 58, y: 32 },
        7: { x: 88, y: 25 }
      },
      opponentPositions: { 1: { x: 50, y: 8 }, 2: { x: 52, y: 18 }, 3: { x: 48, y: 18 } }
    },
    { 
      label: '5. GOAL: Clinical finish in the back of the net!', 
      highlightZone: 4, 
      focusPlayers: [9],
      ballPos: { x: 50, y: 3 },
      ballPath: [{ x: 55, y: 20 }, { x: 50, y: 3 }],
      playerPositions: { 9: { x: 52, y: 10 }, 11: { x: 48, y: 15 } },
      opponentPositions: { 1: { x: 58, y: 6 } }
    }
  ],
  'def-org': [
    { 
      label: '1. High-Press: Team lock on Opponent Build-Up', 
      highlightZone: 3, 
      focusPlayers: [9, 10, 7, 11, 8],
      ballPos: { x: 50, y: 12 },
      playerPositions: { 
        9: { x: 50, y: 28 }, 
        10: { x: 50, y: 40 }, 
        7: { x: 75, y: 38 }, 
        11: { x: 25, y: 38 }
      },
      opponentPositions: { 1: { x: 50, y: 12 }, 4: { x: 35, y: 22 }, 5: { x: 65, y: 22 } }
    },
    { 
      label: '2. Mid-Block Shift: Collective side slide, deny central entry', 
      focusPlayers: [1, 2, 3, 4, 5, 6, 8, 10],
      ballPos: { x: 25, y: 28 },
      ballPath: [{ x: 50, y: 12 }, { x: 25, y: 28 }],
      playerPositions: { 
        9: { x: 32, y: 32 }, 
        11: { x: 15, y: 38 },
        10: { x: 38, y: 45 }, 
        6: { x: 35, y: 60 }, 
        8: { x: 52, y: 62 }, 
        3: { x: 18, y: 72 },
        4: { x: 35, y: 75 },
        5: { x: 55, y: 75 },
        2: { x: 75, y: 75 }
      },
      opponentPositions: { 4: { x: 25, y: 28 }, 8: { x: 32, y: 42 } }
    },
    { 
      label: '3. Compact Control: Vertical distance < 30m', 
      focusPlayers: [4, 5, 6, 8],
      ballPos: { x: 15, y: 55 },
      playerPositions: { 
        4: { x: 35, y: 70 },
        6: { x: 32, y: 55 },
        8: { x: 48, y: 58 },
        9: { x: 28, y: 40 }
      },
      opponentPositions: { 4: { x: 15, y: 55 }, 6: { x: 25, y: 60 } }
    }
  ],
  'trans-att': [
    { 
      label: '1. Win: Clean interception by CDM (6)', 
      focusPlayers: [6, 10],
      ballPos: { x: 50, y: 65 },
      ballPath: [{ x: 50, y: 60 }, { x: 50, y: 65 }],
      playerPositions: {
        6: { x: 50, y: 65 },
        10: { x: 45, y: 55 },
        9: { x: 50, y: 40 }
      },
      opponentPositions: { 6: { x: 50, y: 60 }, 3: { x: 65, y: 65 } }
    },
    { 
      label: '2. Pulse: 5-Sec Counter - Immediate depth by #9', 
      ballPos: { x: 50, y: 35 },
      ballPath: [{ x: 50, y: 65 }, { x: 50, y: 35 }],
      focusPlayers: [6, 9, 7, 11],
      playerPositions: { 
        9: { x: 50, y: 35 }, 
        7: { x: 82, y: 38 },
        11: { x: 18, y: 38 },
        10: { x: 55, y: 48 }
      },
      opponentPositions: { 4: { x: 42, y: 40 }, 5: { x: 58, y: 40 } }
    },
    { 
      label: '3. Strike: 9 & 11 Attack Box, 7 Crosses to 9', 
      ballPos: { x: 55, y: 15 },
      ballPath: [{ x: 50, y: 35 }, { x: 85, y: 25 }, { x: 55, y: 15 }],
      focusPlayers: [9, 11, 7],
      playerPositions: { 
        7: { x: 85, y: 25 }, 
        9: { x: 55, y: 15 },
        11: { x: 45, y: 18 },
        8: { x: 50, y: 30 }
      },
      opponentPositions: { 4: { x: 58, y: 25 }, 1: { x: 50, y: 10 } }
    },
    { 
      label: '4. GOAL: Powerful transition finish!', 
      ballPos: { x: 50, y: 3 },
      ballPath: [{ x: 55, y: 15 }, { x: 50, y: 3 }],
      playerPositions: { 9: { x: 52, y: 10 }, 11: { x: 48, y: 12 } },
      opponentPositions: { 1: { x: 42, y: 8 } }
    }
  ],
  'trans-def': [
    { 
      label: '1. Loss: Ball turnover in Zone 3', 
      focusPlayers: [6, 4, 8],
      ballPos: { x: 65, y: 40 },
      ballPath: [{ x: 60, y: 55 }, { x: 65, y: 40 }],
      playerPositions: { 
        6: { x: 55, y: 55 }, 
        8: { x: 65, y: 55 },
        4: { x: 40, y: 75 }
      },
      opponentPositions: { 6: { x: 65, y: 40 }, 10: { x: 55, y: 35 } }
    },
    { 
      label: '2. Counter-Press: The 5-Sec Fuse - Squeeze ball!', 
      focusPlayers: [6, 8, 10],
      ballPos: { x: 65, y: 40 },
      playerPositions: { 
        6: { x: 62, y: 42 }, 
        8: { x: 68, y: 42 }, 
        10: { x: 65, y: 48 }
      },
      opponentPositions: { 6: { x: 65, y: 40 } }
    },
    { 
      label: '3. Recovery: Sprinting to "The Box" (Goal-Side)', 
      ballPos: { x: 50, y: 65 },
      ballPath: [{ x: 65, y: 40 }, { x: 50, y: 65 }],
      playerPositions: { 
        4: { x: 45, y: 82 }, 
        5: { x: 55, y: 82 },
        2: { x: 80, y: 78 },
        3: { x: 20, y: 78 },
        1: { x: 50, y: 95 }
      },
      opponentPositions: { 9: { x: 50, y: 65 } }
    }
  ],
  'set-pieces': [
    { 
      label: 'Corner: The Corridor of Uncertainty', 
      highlightZone: 4, 
      focusPlayers: [9, 5, 8],
      ballPos: { x: 48, y: 15 },
      ballPath: [{ x: 97, y: 3 }, { x: 48, y: 15 }],
      playerPositions: { 
        9: { x: 48, y: 15 }, 
        5: { x: 52, y: 18 },
        8: { x: 65, y: 25 }
      },
      opponentPositions: { 1: { x: 50, y: 12 }, 2: { x: 45, y: 18 } }
    }
  ]
};

export type OpponentRole = 'GK' | 'DEF' | 'MID' | 'FWD';

export interface Opponent {
  id: number;
  x: number;
  y: number;
  label: string;
  role: OpponentRole;
}

export const OPPONENTS: Opponent[] = [
  { id: 1, x: 50, y: 8, label: 'GK', role: 'GK' },
  { id: 2, x: 40, y: 25, label: 'CB', role: 'DEF' },
  { id: 3, x: 60, y: 25, label: 'CB', role: 'DEF' },
  { id: 4, x: 15, y: 35, label: 'LB', role: 'DEF' },
  { id: 5, x: 85, y: 35, label: 'RB', role: 'DEF' },
  { id: 6, x: 50, y: 45, label: 'CDM', role: 'MID' },
  { id: 8, x: 30, y: 50, label: 'CM', role: 'MID' },
  { id: 10, x: 70, y: 50, label: 'CM', role: 'MID' },
  { id: 7, x: 10, y: 65, label: 'LW', role: 'FWD' },
  { id: 11, x: 90, y: 65, label: 'RW', role: 'FWD' },
  { id: 9, x: 50, y: 75, label: 'CF', role: 'FWD' },
];

