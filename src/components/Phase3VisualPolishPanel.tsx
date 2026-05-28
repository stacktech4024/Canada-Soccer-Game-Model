import { ArrowRight, Route, Target, Waves } from 'lucide-react';

const polishItems = [
  {
    icon: Route,
    title: 'Animated run trails',
    detail: 'Show curved player movement paths during scenario playback so runs feel planned, staggered, and coach-readable.',
  },
  {
    icon: ArrowRight,
    title: 'Ball-path lines',
    detail: 'Differentiate passes, crosses, carries, and shots with visible path language and timing cues.',
  },
  {
    icon: Waves,
    title: 'Opponent reaction shape',
    detail: 'Make defensive movement easier to read by showing press, drop, shift, recover, and hold reactions.',
  },
  {
    icon: Target,
    title: 'Set-piece focus',
    detail: 'When Set Pieces is selected, keep the routine objective, runners, and delivery zone visible beside the board.',
  },
];

export const Phase3VisualPolishPanel = () => {
  return (
    <section className="bg-stone-900/70 border border-stone-800 rounded-2xl p-5 shadow-xl">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 border-b border-stone-800 pb-4 mb-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-amber-500">Phase 3</p>
          <h3 className="text-xl font-black uppercase tracking-tighter text-white mt-1">Visual realism polish</h3>
        </div>
        <p className="text-[10px] text-stone-500 font-mono uppercase tracking-widest max-w-xl">
          First pass: define the visual language before deeper TacticalBoard animation work.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
        {polishItems.map((item) => {
          const Icon = item.icon;
          return (
            <article key={item.title} className="bg-stone-950/80 border border-stone-800 rounded-xl p-4">
              <div className="w-9 h-9 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center mb-3">
                <Icon size={17} />
              </div>
              <h4 className="text-xs font-black uppercase tracking-tight text-white">{item.title}</h4>
              <p className="text-[10px] text-stone-500 leading-relaxed mt-2">{item.detail}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
};
