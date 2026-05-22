export interface MovementPattern {
  id: string;
  type: 'path' | 'zone';
  points: { x: number; y: number }[];
  label: string;
}

export interface PlayerProfile {
  id: string;
  number: number;
  position: string;
  shortPos: string;
  title: string;
  bio: string;
  ideology: string;
  role: string;
  roles: string[]; // Responsibilities in different phases
  coordinates: { x: number; y: number }; // x: 0-100, y: 0-100 (top-left based)
  patterns: MovementPattern[];
}

export const players: PlayerProfile[] = [
  {
    id: 'gk',
    number: 1,
    shortPos: 'GK',
    position: 'Goalkeeper',
    title: 'Sweeper Keeper',
    bio: 'The last line of defense and first line of attack. Vocal leader who organizes the back line and manages space.',
    ideology: 'Step line high, communicate constantly, and win early balls out of the box. A leader who pushes the defensive line forward.',
    role: 'Leader, communicator, ball-player. Capable of switching play or playing direct/short depending on match requirements.',
    roles: [
      "AO: Invites pressure to create build-up solutions",
      "DO: Vocal leader managing heights and distances",
      "AT: Precise distribution to initiate fast counters",
      "DT: Sweeper-keeper winning early balls out of the box"
    ],
    coordinates: { x: 50, y: 88 },
    patterns: [
      { id: 'p1', type: 'zone', label: 'Primary Coverage', points: [{ x: 35, y: 85 }, { x: 65, y: 85 }, { x: 65, y: 95 }, { x: 35, y: 95 }] },
      { id: 'p2', type: 'path', label: 'Sweeper Rush', points: [{ x: 50, y: 90 }, { x: 50, y: 75 }] }
    ]
  },
  {
    id: 'cb-l',
    number: 4,
    shortPos: 'CB',
    position: 'Center Back',
    title: 'The Rock',
    bio: 'Vocal and brave commander of the defensive line. Exceptional aerial ability and calm on the ball.',
    ideology: 'High-discipline leader focused on managing the team shape. Maintains safe distances during Attacking Organization and acts as the final recovery line in Defensive Transition.',
    role: 'Vocal lead, build-up initiator. Dictates the defensive height based on the active Zone (1 or 2).',
    roles: [
      "AO: Bypasses the first line to find the Anchor (6)",
      "DO: Maintains team vertical distances < 30m",
      "AT: Switches play to exploit overloads",
      "DT: Final recovery line to protect against counters"
    ],
    coordinates: { x: 30, y: 72 },
    patterns: [
      { id: 'p1', type: 'zone', label: 'Defensive Anchor', points: [{ x: 30, y: 65 }, { x: 70, y: 65 }, { x: 70, y: 80 }, { x: 30, y: 80 }] },
      { id: 'p2', type: 'path', label: 'Direct Build-up', points: [{ x: 50, y: 75 }, { x: 35, y: 45 }] },
      { id: 'p3', type: 'path', label: 'Aerial Challenge', points: [{ x: 50, y: 72 }, { x: 50, y: 60 }] }
    ]
  },
  {
    id: 'cb-r',
    number: 5,
    shortPos: 'CB',
    position: 'Center Back',
    title: 'The Pillar',
    bio: 'Athletic and perceptive defender who excels at read-and-react situations. Provides secondary cover for the expansive wingbacks.',
    ideology: 'Maintains tactical balance when the team transitions. Primary aerial threat during set pieces.',
    role: 'Covering defender, aerial specialist. Ensures the team remains compact when pressing the ball carrier.',
    roles: [
      "AO: Supports build-up and provides cover for RB",
      "DO: Strong aerial presence in central 18-yard box",
      "AT: Recycles play if counter is not immediate",
      "DT: Squeezes central space to maintain compactness"
    ],
    coordinates: { x: 70, y: 72 },
    patterns: [
      { id: 'p1', type: 'zone', label: 'Covering Zone', points: [{ x: 60, y: 65 }, { x: 90, y: 65 }, { x: 90, y: 80 }, { x: 60, y: 80 }] },
      { id: 'p2', type: 'path', label: 'Set Piece Attack', points: [{ x: 70, y: 72 }, { x: 50, y: 15 }] }
    ]
  },
  {
    id: 'rb',
    number: 2,
    shortPos: 'RB',
    position: 'Right Back',
    title: 'The Engine',
    bio: 'Dynamic wide defender who provides offensive width through overlapping runs and excels in 1v1 duels.',
    ideology: 'Dynamic wide outlet who expands the team shape vertically and horizontally. Rapidly transitions to high width during Attacking Organization to penetrate Zone 4.',
    role: 'Crossing specialist, overlapping runner. Managed by the 5-second mental transition rule to recover shape instantly when possession is lost.',
    roles: [
      "AO: Expands team shape vertically to penetrate Zone 4",
      "DO: Primary wide marker for 1v1 defensive duels",
      "AT: Rapid overlapping run providing wing outlet",
      "DT: 5-second recovery sprint to established shape"
    ],
    coordinates: { x: 82, y: 68 },
    patterns: [
      { id: 'p1', type: 'path', label: 'Overlapping Run', points: [{ x: 85, y: 70 }, { x: 88, y: 30 }] },
      { id: 'p2', type: 'zone', label: 'Wide Defense', points: [{ x: 75, y: 55 }, { x: 95, y: 55 }, { x: 95, y: 80 }, { x: 75, y: 80 }] },
      { id: 'p3', type: 'path', label: 'Inside Recovery', points: [{ x: 90, y: 40 }, { x: 70, y: 70 }] }
    ]
  },
  {
    id: 'lb',
    number: 3,
    shortPos: 'LB',
    position: 'Left Back',
    title: 'The Wingback',
    bio: 'High-fitness wide player who balances defensive stability with progressive ball carrying.',
    ideology: 'Maintains tactical width and provides an outlet for switching play. In transitional moments, prioritizes central recovery if the ball is on the opposite flank.',
    role: 'Progressive carrier, overlapping runner. Integral to the diamond support structure in wide channels.',
    roles: [
      "AO: Maintains tactical width as a relief outlet",
      "DO: Balances defensive stability on the far side",
      "AT: Stretches the opposition vertically at high speed",
      "DT: Immediate central recovery if ball is lost wide"
    ],
    coordinates: { x: 18, y: 68 },
    patterns: [
      { id: 'p1', type: 'path', label: 'Overlapping Run', points: [{ x: 15, y: 70 }, { x: 12, y: 30 }] },
      { id: 'p2', type: 'zone', label: 'Wide Defense', points: [{ x: 5, y: 55 }, { x: 25, y: 55 }, { x: 25, y: 80 }, { x: 5, y: 80 }] },
      { id: 'p3', type: 'path', label: 'Inside Recovery', points: [{ x: 10, y: 40 }, { x: 30, y: 70 }] }
    ]
  },
  {
    id: 'dm',
    number: 6,
    shortPos: 'DM',
    position: 'Defensive Midfielder',
    title: 'The Shield',
    bio: "The defender's best friend. Strong, disciplined anchor who wins aerial battles and breaks up play.",
    ideology: 'Aggressive ball winner who identifies markers and protects central spaces. Recovers and recycles possession efficiently.',
    role: 'Ball winner, playmaker link, defensive anchor. Aggressive in tackles and disciplined in tracking markers.',
    roles: [
      "AO: Anchor link between build-up and infiltration",
      "DO: Protects central spaces and denies slot entries",
      "AT: Plays the 'first pass' to start 5-second pulse",
      "DT: Counter-presses ball carrier to force turnovers"
    ],
    coordinates: { x: 50, y: 55 },
    patterns: [
      { id: 'p1', type: 'zone', label: 'Anchoring Zone', points: [{ x: 30, y: 45 }, { x: 70, y: 45 }, { x: 70, y: 65 }, { x: 30, y: 65 }] },
      { id: 'p2', type: 'path', label: 'Covering Shift', points: [{ x: 50, y: 55 }, { x: 20, y: 65 }] },
      { id: 'p3', type: 'path', label: 'Covering Shift', points: [{ x: 50, y: 55 }, { x: 80, y: 65 }] }
    ]
  },
  {
    id: 'am',
    number: 10,
    shortPos: 'AM',
    position: 'Attacking Midfielder',
    title: 'The Maestro',
    bio: 'Creative link between midfield and attack. Dictates possession and switches play to exploit overloaded channels.',
    ideology: 'Constant movement to find gaps and create service for strikers. Comfortable shooting from distance or recycling wide.',
    role: 'Primary playmaker, creative link, goal threat. Switches play and penetrates the final third with diagonal passes.',
    roles: [
      "AO: Finds gaps in defensive block to create chances",
      "DO: Coordinates mid-block pressing triggers",
      "AT: Primary creative link to facilitate rapid strike",
      "DT: Immediate counter-press after possession loss"
    ],
    coordinates: { x: 60, y: 45 },
    patterns: [
      { id: 'p1', type: 'zone', label: 'Creative Hub', points: [{ x: 25, y: 25 }, { x: 75, y: 25 }, { x: 75, y: 50 }, { x: 25, y: 50 }] },
      { id: 'p2', type: 'path', label: 'Diagonal Penetration', points: [{ x: 50, y: 45 }, { x: 80, y: 20 }] },
      { id: 'p3', type: 'path', label: 'Diagonal Penetration', points: [{ x: 50, y: 45 }, { x: 20, y: 20 }] }
    ]
  },
  {
    id: 'wf',
    number: 7,
    shortPos: 'RW',
    position: 'Right Winger',
    title: 'The Speedster',
    bio: 'Elite speed threat who thrives in 1v1 isolations. Drives low balls into the box or cuts inside to finish.',
    ideology: 'Utilizes pace to beat defenders and penetrate side channels. Tactically aware to track back in defensive transitions.',
    role: 'Speed threat, 1v1 specialist, crosser. Beating markers with pace and providing service to the central forward.',
    roles: [
      "AO: Isolates 1v1 situations to provide final service",
      "DO: Tracks back to provide defensive channel cover",
      "AT: Immediate depth threat focused on far post",
      "DT: Recovery run to defensive shape under-lapping FB"
    ],
    coordinates: { x: 82, y: 28 },
    patterns: [
      { id: 'p1', type: 'path', label: 'Dribbling Cut', points: [{ x: 85, y: 35 }, { x: 60, y: 20 }] },
      { id: 'p2', type: 'path', label: 'Winger Run', points: [{ x: 85, y: 50 }, { x: 90, y: 15 }] },
      { id: 'p3', type: 'zone', label: '1v1 Isolation Area', points: [{ x: 75, y: 10 }, { x: 95, y: 10 }, { x: 95, y: 45 }, { x: 75, y: 45 }] }
    ]
  },
  {
    id: 'wf-l',
    number: 11,
    shortPos: 'LW',
    position: 'Left Winger',
    title: 'The Acrobat',
    bio: 'Technically gifted wide player who thrives in tight spaces. Uses agility to bypass markers and deliver dangerous balls into the corridor of uncertainty.',
    ideology: 'Prioritizes cutting inside to utilize his stronger foot for service or finishing. Disciplined in defensive transitions to force play central.',
    role: 'Agility specialist, inside forward, creator. Breaking down compact blocks with intricate movement.',
    roles: [
      "AO: Dribbling threat focused on cutting inside",
      "DO: Denies wide expansion and forces play central",
      "AT: High-speed penetration of weak-side channels",
      "DT: Immediate recovery sprint to drop into block"
    ],
    coordinates: { x: 18, y: 28 },
    patterns: [
      { id: 'p1', type: 'path', label: 'In-swinging Cross', points: [{ x: 10, y: 35 }, { x: 30, y: 20 }] },
      { id: 'p2', type: 'zone', label: 'Half-Space Attack', points: [{ x: 15, y: 15 }, { x: 35, y: 15 }, { x: 35, y: 40 }, { x: 15, y: 40 }] }
    ]
  },
  {
    id: 'cm',
    number: 8,
    shortPos: 'CM',
    position: 'Central Midfielder',
    title: 'The Engine Room',
    bio: 'Box-to-box powerhouse who supports both transitions. Excellent work rate and spatial awareness.',
    ideology: 'Connector between the Anchor and the Maestro. Focuses on late runs into the box and secondary pressing triggers.',
    role: 'Connector, workhorse, late runner. Provides the numerical advantage in central overloads.',
    roles: [
      "AO: Powerful box-to-box presence for late runs",
      "DO: High-intensity workhorse closing central gaps",
      "AT: Numerical advantage in transition overloads",
      "DT: Executes aggressive secondary pressing triggers"
    ],
    coordinates: { x: 35, y: 45 },
    patterns: [
      { id: 'p1', type: 'zone', label: 'Midfield Engine', points: [{ x: 20, y: 35 }, { x: 50, y: 35 }, { x: 50, y: 65 }, { x: 20, y: 65 }] },
      { id: 'p2', type: 'path', label: 'Late Box Run', points: [{ x: 35, y: 50 }, { x: 45, y: 15 }] },
      { id: 'p3', type: 'path', label: 'Defensive Support', points: [{ x: 35, y: 45 }, { x: 40, y: 75 }] }
    ]
  },
  {
    id: 'cf',
    number: 9,
    shortPos: 'CF',
    position: 'Center Forward',
    title: 'The Marksman',
    bio: 'Physically strong centerpiece who excels at holding up play. Intelligent finisher with precise shooting.',
    ideology: 'Selfless marksman who balances scoring with creating. First line of pressure against opposing center-backs.',
    role: 'Target man, finisher, pressing initiator. Holds up play to involve wingers and attacking midfielders.',
    roles: [
      "AO: Target man holding play for supporting runs",
      "DO: First line of pressure against opposing CBs",
      "AT: Stretch defensive line with deep verticality",
      "DT: Pressure initiator disrupting build-up flow"
    ],
    coordinates: { x: 50, y: 15 },
    patterns: [
      { id: 'p1', type: 'zone', label: 'Penalty Box Threat', points: [{ x: 30, y: 5 }, { x: 70, y: 5 }, { x: 70, y: 25 }, { x: 30, y: 25 }] },
      { id: 'p2', type: 'path', label: 'Target Drop', points: [{ x: 50, y: 15 }, { x: 50, y: 35 }] },
      { id: 'p3', type: 'path', label: 'Pressing Arc', points: [{ x: 35, y: 15 }, { x: 65, y: 15 }] }
    ]
  }
];
