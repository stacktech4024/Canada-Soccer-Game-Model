export type Moment = 'att-org' | 'def-org' | 'trans-att' | 'trans-def';
export type Phase = 'attacking' | 'defending';

export interface TacticalPosition {
  number: number;
  label: string;
  role: string;
  positions: Record<Moment, { x: number; y: number }>;
}

export const SQUAD: TacticalPosition[] = [
  { 
    number: 1, label: 'GK', role: 'Sweeper', 
    positions: {
      'att-org': { x: 50, y: 95 },
      'trans-def': { x: 50, y: 92 },
      'def-org': { x: 50, y: 92 },
      'trans-att': { x: 50, y: 95 }
    }
  },
  { 
    number: 4, label: 'CB', role: 'Covering', 
    positions: {
      'att-org': { x: 42, y: 78 },
      'trans-def': { x: 45, y: 82 },
      'def-org': { x: 45, y: 85 },
      'trans-att': { x: 42, y: 75 }
    }
  },
  { 
    number: 5, label: 'CB', role: 'Stopping', 
    positions: {
      'att-org': { x: 58, y: 78 },
      'trans-def': { x: 55, y: 82 },
      'def-org': { x: 55, y: 85 },
      'trans-att': { x: 58, y: 75 }
    }
  },
  { 
    number: 2, label: 'RB', role: 'Fullback', 
    positions: {
      'att-org': { x: 92, y: 60 },
      'trans-def': { x: 85, y: 75 },
      'def-org': { x: 82, y: 80 },
      'trans-att': { x: 90, y: 55 }
    }
  },
  { 
    number: 3, label: 'LB', role: 'Fullback', 
    positions: {
      'att-org': { x: 8, y: 60 },
      'trans-def': { x: 15, y: 75 },
      'def-org': { x: 18, y: 80 },
      'trans-att': { x: 10, y: 55 }
    }
  },
  { 
    number: 6, label: 'DM', role: 'Anchor', 
    positions: {
      'att-org': { x: 50, y: 65 },
      'trans-def': { x: 50, y: 70 },
      'def-org': { x: 50, y: 75 },
      'trans-att': { x: 50, y: 60 }
    }
  },
  { 
    number: 8, label: 'CM', role: 'Box-to-Box', 
    positions: {
      'att-org': { x: 35, y: 50 },
      'trans-def': { x: 40, y: 65 },
      'def-org': { x: 40, y: 70 },
      'trans-att': { x: 35, y: 45 }
    }
  },
  { 
    number: 10, label: 'AM', role: 'Maestro', 
    positions: {
      'att-org': { x: 65, y: 50 },
      'trans-def': { x: 60, y: 65 },
      'def-org': { x: 60, y: 70 },
      'trans-att': { x: 65, y: 45 }
    }
  },
  { 
    number: 7, label: 'RW', role: 'Winger', 
    positions: {
      'att-org': { x: 88, y: 30 },
      'trans-def': { x: 75, y: 50 },
      'def-org': { x: 75, y: 65 },
      'trans-att': { x: 85, y: 25 }
    }
  },
  { 
    number: 11, label: 'LW', role: 'Winger', 
    positions: {
      'att-org': { x: 12, y: 30 },
      'trans-def': { x: 25, y: 50 },
      'def-org': { x: 25, y: 65 },
      'trans-att': { x: 15, y: 25 }
    }
  },
  { 
    number: 9, label: 'CF', role: 'Target', 
    positions: {
      'att-org': { x: 50, y: 15 },
      'trans-def': { x: 50, y: 40 },
      'def-org': { x: 50, y: 55 },
      'trans-att': { x: 50, y: 10 }
    }
  },
];

export const PRINCIPLES: Record<Moment, { title: string; keys: string[] }> = {
  'att-org': {
    title: 'Attacking Organization',
    keys: [
      'Dispersal: Expand the team shape to create space.',
      'Support: The ability to receive the ball.',
      'Mobility: Calculated movements to create opportunities.',
      'Penetration: Progress the ball towards the opponents goal.',
      'Improvisation: Actions and skills to eliminate opponents.'
    ]
  },
  'def-org': {
    title: 'Defending Organization',
    keys: [
      'Delay: Slow down opposition making forward progress.',
      'Deny: If you can win the ball back, win it.',
      'Direct: Force the opponents to advantageous space.',
      'Balance: Maintain team shape and denying space.',
      'Control & Restraint: Being patient to regain possession.'
    ]
  },
  'trans-att': {
    title: 'Attacking Transition',
    keys: [
      'Identify Ball Status (Clean/Unclean)',
      'Immediate Verticality vs Retention',
      'Mental 5-Second Goal rule',
      'Quick Expansion to Dispersal shape'
    ]
  },
  'trans-def': {
    title: 'Defensive Transition',
    keys: [
      'Identify Loss of Possession',
      'Apply Pressure (Counter-Press)',
      'Recover to Defensive Lines',
      'Protect the Central Goal area'
    ]
  }
};

export interface TacticalStep {
  label: string;
  highlightZone?: number; // 1-4
  highlightChannel?: string; // 'L-Flank', etc.
  focusPlayers?: number[];
}

export const SEQUENCES: Record<Moment, TacticalStep[]> = {
  'att-org': [
    { label: 'Dispersal: Expand shape to create space', highlightZone: 1, focusPlayers: [2, 3, 7, 11] },
    { label: 'Support: Ensure receiver availability', focusPlayers: [6, 8, 10] },
    { label: 'Penetration: Progress ball to Zone 4', highlightZone: 4, focusPlayers: [9] }
  ],
  'def-org': [
    { label: 'Delay: Slow down forward progress', highlightZone: 4, focusPlayers: [9, 10] },
    { label: 'Direct: Force play into Channel 1', highlightChannel: 'L-Flank', focusPlayers: [2, 7] },
    { label: 'Compactness: Maintain team shape/Balance', highlightZone: 2, focusPlayers: [4, 5, 6] }
  ],
  'trans-att': [
    { label: 'Identify Ball Status (Clean/Unclean)', focusPlayers: [1, 4, 5, 6, 8, 10, 2, 3, 7, 11, 9] },
    { label: 'Immediate Verticality vs Retention', focusPlayers: [9, 7, 11] }
  ],
  'trans-def': [
    { label: 'Apply Pressure (Counter-Press)', focusPlayers: [9, 10, 8] },
    { label: 'Recovery: Protect the Central Goal', highlightZone: 1, focusPlayers: [4, 5, 1] }
  ]
};

export interface Opponent {
  x: number;
  y: number;
  label: string;
  role: 'GK' | 'DEF' | 'MID' | 'FWD';
}

export const OPPONENTS: Opponent[] = [
  { x: 50, y: 8, label: 'GK', role: 'GK' },
  { x: 38, y: 18, label: 'CB', role: 'DEF' },
  { x: 62, y: 18, label: 'CB', role: 'DEF' },
  { x: 15, y: 25, label: 'LB', role: 'DEF' },
  { x: 85, y: 25, label: 'RB', role: 'DEF' },
  { x: 50, y: 35, label: 'DM', role: 'MID' },
  { x: 35, y: 45, label: 'CM', role: 'MID' },
  { x: 65, y: 45, label: 'CM', role: 'MID' },
  { x: 12, y: 55, label: 'LW', role: 'FWD' },
  { x: 88, y: 55, label: 'RW', role: 'FWD' },
  { x: 50, y: 65, label: 'CF', role: 'FWD' },
];
