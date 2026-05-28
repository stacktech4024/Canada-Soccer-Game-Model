import { Flag, Target, Users, CheckCircle2 } from 'lucide-react';
import { SET_PIECE_ROUTINES } from '../data/setPieceRoutines';

export const SetPieceRoutinePanel = () => {
  const routine = SET_PIECE_ROUTINES[0];

  return (
    <section className="bg-stone-900/70 border border-stone-800 rounded-2xl p-5 shadow-xl">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 border-b border-stone-800 pb-4 mb-5">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-blue-400">Set Piece Routine</p>
          <h3 className="text-xl font-black uppercase tracking-tighter text-white mt-1">{routine.title}</h3>
          <p className="text-xs text-stone-500 leading-relaxed mt-2 max-w-3xl">{routine.trigger}</p>
        </div>
        <div className="px-3 py-2 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-300 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 w-fit">
          <Flag size={14} /> {routine.type}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_420px] gap-5">
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-stone-950/80 border border-stone-800">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-amber-500 flex items-center gap-2 mb-2">
              <Target size={14} /> Objective
            </h4>
            <p className="text-sm text-stone-300 leading-relaxed">{routine.objective}</p>
          </div>

          <div className="p-4 rounded-xl bg-stone-950/80 border border-stone-800">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-amber-500 flex items-center gap-2 mb-3">
              <CheckCircle2 size={14} /> Coaching Points
            </h4>
            <ul className="space-y-2">
              {routine.coachingPoints.map((point) => (
                <li key={point} className="flex gap-2 text-xs text-stone-400 leading-relaxed">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-500/70 shrink-0" />
                  {point}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-stone-950/80 border border-stone-800">
          <h4 className="text-[10px] font-black uppercase tracking-widest text-amber-500 flex items-center gap-2 mb-3">
            <Users size={14} /> Player Roles
          </h4>
          <div className="space-y-2">
            {routine.playerRoles.map((player) => (
              <div key={player.number} className="flex gap-3 p-3 rounded-lg bg-stone-900 border border-stone-800">
                <div className="w-8 h-8 rounded-full bg-amber-500 text-stone-950 font-black flex items-center justify-center shrink-0 text-xs">
                  {player.number}
                </div>
                <p className="text-xs text-stone-400 leading-relaxed">{player.role}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
