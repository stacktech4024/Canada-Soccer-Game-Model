import { SCENARIO_MOTION } from '../data/scenarioMotion';
import { PRINCIPLES, Moment } from '../data/tactics';

const MOMENT_ORDER: Moment[] = ['att-org', 'trans-def', 'def-org', 'trans-att', 'set-pieces'];

const getReactionLabel = (reaction: string) => {
  switch (reaction) {
    case 'press':
      return 'Opponent presses';
    case 'drop':
      return 'Opponent drops';
    case 'recover':
      return 'Opponent recovers';
    case 'shift':
      return 'Opponent shifts';
    default:
      return 'Opponent holds';
  }
};

export const MotionRealismOverview = () => {
  return (
    <section className="bg-stone-900/70 border border-stone-800 rounded-2xl p-5 shadow-xl">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 border-b border-stone-800 pb-4 mb-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-amber-500">Motion Realism Engine</p>
          <h3 className="text-xl font-black uppercase tracking-tighter text-white mt-1">Game-realistic movement rules</h3>
        </div>
        <p className="text-[10px] text-stone-500 font-mono uppercase tracking-widest max-w-xl">
          Players now move by intent, role, and ball action instead of only jumping between diagram points.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-3">
        {MOMENT_ORDER.map((moment) => {
          const steps = SCENARIO_MOTION[moment];
          const firstStep = steps[0];
          const uniqueIntents = Array.from(
            new Set(steps.flatMap(step => Object.values(step.movementIntents)))
          );

          return (
            <div key={moment} className="bg-stone-950/70 border border-stone-800 rounded-xl p-4 flex flex-col gap-3">
              <div>
                <p className="text-[9px] text-stone-500 font-mono uppercase tracking-widest">{moment}</p>
                <h4 className="text-sm font-black text-white uppercase tracking-tight leading-tight mt-1">
                  {PRINCIPLES[moment].title}
                </h4>
              </div>

              <div className="flex flex-wrap gap-1">
                {uniqueIntents.slice(0, 5).map(intent => (
                  <span key={intent} className="px-2 py-1 rounded-full bg-amber-500/10 text-amber-500 text-[8px] font-black uppercase tracking-wider">
                    {intent}
                  </span>
                ))}
              </div>

              <div className="space-y-2 text-[10px] leading-relaxed text-stone-400">
                <p>
                  <span className="font-black text-stone-300 uppercase">Ball:</span> {firstStep.ballAction}
                </p>
                <p>
                  <span className="font-black text-stone-300 uppercase">Reaction:</span> {getReactionLabel(firstStep.opponentReaction)}
                </p>
                <p className="text-stone-500">{firstStep.coachingNote}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
