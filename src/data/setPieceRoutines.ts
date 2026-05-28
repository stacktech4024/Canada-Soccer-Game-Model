export interface SetPieceRoutine {
  id: string;
  title: string;
  type: 'corner' | 'free-kick' | 'throw-in';
  trigger: string;
  objective: string;
  coachingPoints: string[];
  playerRoles: { number: number; role: string }[];
}

export const SET_PIECE_ROUTINES: SetPieceRoutine[] = [
  {
    id: 'corner-short-decoy-corridor',
    title: 'Corner: Short Decoy to Corridor Attack',
    type: 'corner',
    trigger: 'Attacking corner from the right side. Show a short option to pull one defender out, then deliver into the corridor between the six-yard box and penalty spot.',
    objective: 'Create separation through staggered timing: near-post run, central power run, far-post hold, and second-ball support.',
    coachingPoints: [
      'Do not let every runner arrive at the same time. The short option shows first, the near-post run starts second, and the central/far-post runs arrive last.',
      'The delivery should travel into the corridor of uncertainty rather than directly onto the goalkeeper.',
      'One midfielder must stay connected outside the box for the second ball, clearance, or cutback.',
      'Rest defence stays alert: at least two players remain positioned to stop the counter attack.'
    ],
    playerRoles: [
      { number: 2, role: 'Short option/decoy. Pulls a defender out and can receive if the corner is played short.' },
      { number: 9, role: 'Near-post runner. Attacks the front zone quickly to screen or redirect.' },
      { number: 5, role: 'Central power runner. Attacks the penalty spot/six-yard corridor.' },
      { number: 11, role: 'Far-post runner. Holds width, then arrives late behind the defensive line.' },
      { number: 8, role: 'Second-ball support. Waits on the edge for clearance, recycle, or shot.' },
      { number: 10, role: 'Cutback option. Balances the edge and can combine if the ball drops centrally.' },
      { number: 4, role: 'Rest-defence cover. Protects against the counter with the goalkeeper and weak-side defender.' }
    ]
  }
];

export const getPrimarySetPieceRoutine = () => SET_PIECE_ROUTINES[0];
