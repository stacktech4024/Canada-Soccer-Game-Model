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
    coordinates: { x: 50, y: 88 },
    patterns: [
      { id: 'p1', type: 'zone', label: 'Primary Coverage', points: [{ x: 35, y: 85 }, { x: 65, y: 85 }, { x: 65, y: 95 }, { x: 35, y: 95 }] },
      { id: 'p2', type: 'path', label: 'Sweeper Rush', points: [{ x: 50, y: 90 }, { x: 50, y: 75 }] }
    ]
  },
  {
    id: 'cb',
    number: 4,
    shortPos: 'CB',
    position: 'Center Back',
    title: 'The Rock',
    bio: 'Vocal and brave commander of the defensive line. Exceptional aerial ability and calm on the ball.',
    ideology: 'High-discipline leader focused on managing the team shape. Maintains safe distances during Attacking Organization and acts as the final recovery line in Defensive Transition.',
    role: 'Vocal lead, build-up initiator. Dictates the defensive height based on the active Zone (1 or 2).',
    coordinates: { x: 50, y: 72 },
    patterns: [
      { id: 'p1', type: 'zone', label: 'Defensive Anchor', points: [{ x: 30, y: 65 }, { x: 70, y: 65 }, { x: 70, y: 80 }, { x: 30, y: 80 }] },
      { id: 'p2', type: 'path', label: 'Direct Build-up', points: [{ x: 50, y: 75 }, { x: 35, y: 45 }] },
      { id: 'p3', type: 'path', label: 'Aerial Challenge', points: [{ x: 50, y: 72 }, { x: 50, y: 60 }] }
    ]
  },
  {
    id: 'fb',
    number: 2,
    shortPos: 'FB',
    position: 'Full Back',
    title: 'The Engine',
    bio: 'Dynamic wide defender who provides offensive width through overlapping runs and excels in 1v1 duels.',
    ideology: 'Dynamic wide outlet who expands the team shape vertically and horizontally. Rapidly transitions to high width during Attacking Organization to penetrate Zone 4.',
    role: 'Crossing specialist, overlapping runner. Managed by the 5-second mental transition rule to recover shape instantly when possession is lost.',
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
    coordinates: { x: 50, y: 38 },
    patterns: [
      { id: 'p1', type: 'zone', label: 'Creative Hub', points: [{ x: 25, y: 25 }, { x: 75, y: 25 }, { x: 75, y: 50 }, { x: 25, y: 50 }] },
      { id: 'p2', type: 'path', label: 'Diagonal Penetration', points: [{ x: 50, y: 45 }, { x: 80, y: 20 }] },
      { id: 'p3', type: 'path', label: 'Diagonal Penetration', points: [{ x: 50, y: 45 }, { x: 20, y: 20 }] }
    ]
  },
  {
    id: 'wf',
    number: 7,
    shortPos: 'WF',
    position: 'Wide Forward',
    title: 'The Speedster',
    bio: 'Elite speed threat who thrives in 1v1 isolations. Drives low balls into the box or cuts inside to finish.',
    ideology: 'Utilizes pace to beat defenders and penetrate side channels. Tactically aware to track back in defensive transitions.',
    role: 'Speed threat, 1v1 specialist, crosser. Beating markers with pace and providing service to the central forward.',
    coordinates: { x: 82, y: 28 },
    patterns: [
      { id: 'p1', type: 'path', label: 'Dribbling Cut', points: [{ x: 85, y: 35 }, { x: 60, y: 20 }] },
      { id: 'p2', type: 'path', label: 'Winger Run', points: [{ x: 85, y: 50 }, { x: 90, y: 15 }] },
      { id: 'p3', type: 'zone', label: '1v1 Isolation Area', points: [{ x: 75, y: 10 }, { x: 95, y: 10 }, { x: 95, y: 45 }, { x: 75, y: 45 }] }
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
    coordinates: { x: 50, y: 15 },
    patterns: [
      { id: 'p1', type: 'zone', label: 'Penalty Box Threat', points: [{ x: 30, y: 5 }, { x: 70, y: 5 }, { x: 70, y: 25 }, { x: 30, y: 25 }] },
      { id: 'p2', type: 'path', label: 'Target Drop', points: [{ x: 50, y: 15 }, { x: 50, y: 35 }] },
      { id: 'p3', type: 'path', label: 'Pressing Arc', points: [{ x: 35, y: 15 }, { x: 65, y: 15 }] }
    ]
  }
];
