import { motion } from 'motion/react';
import { Route, ArrowRight, Waves, Target } from 'lucide-react';

const playerRuns = [
  { id: '9-near', label: '#9 near-post', d: 'M 63 35 C 58 29, 54 24, 49 17', intent: 'finish' },
  { id: '5-central', label: '#5 central', d: 'M 47 39 C 49 31, 51 25, 53 19', intent: 'finish' },
  { id: '11-far', label: '#11 far-post', d: 'M 34 38 C 30 31, 27 25, 23 18', intent: 'arrive late' },
  { id: '8-edge', label: '#8 second ball', d: 'M 49 58 C 48 51, 48 45, 48 39', intent: 'support' },
];

const opponentShape = 'M 22 24 L 38 22 L 55 22 L 72 25';

export const TacticalOverlayPreview = () => {
  return (
    <section className="bg-stone-900/70 border border-stone-800 rounded-2xl p-5 shadow-xl">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 border-b border-stone-800 pb-4 mb-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-amber-500">Phase 3 Overlay Prototype</p>
          <h3 className="text-xl font-black uppercase tracking-tighter text-white mt-1">Run trails, ball path, and set-piece target zone</h3>
        </div>
        <p className="text-[10px] text-stone-500 font-mono uppercase tracking-widest max-w-xl">
          Prototype layer for the visuals that will be wired into the live TacticalBoard next.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_360px] gap-5 items-start">
        <div className="relative aspect-[100/70] rounded-2xl overflow-hidden border border-stone-800 bg-green-950 shadow-inner">
          <div className="absolute inset-0 opacity-20 bg-[linear-gradient(90deg,transparent_49%,rgba(255,255,255,0.25)_50%,transparent_51%)]" />
          <svg viewBox="0 0 100 70" className="absolute inset-0 w-full h-full">
            <defs>
              <marker id="preview-run-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="4" markerHeight="4" orient="auto">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#f59e0b" />
              </marker>
              <marker id="preview-ball-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#fbbf24" />
              </marker>
            </defs>

            <rect x="4" y="4" width="92" height="62" fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="0.5" />
            <rect x="25" y="4" width="50" height="16" fill="none" stroke="rgba(255,255,255,0.45)" strokeWidth="0.45" />
            <rect x="38" y="4" width="24" height="6" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="0.35" />
            <circle cx="50" cy="16" r="0.7" fill="rgba(255,255,255,0.75)" />

            <motion.rect
              x="38"
              y="12"
              width="28"
              height="14"
              rx="2"
              fill="rgba(245,158,11,0.14)"
              stroke="#f59e0b"
              strokeWidth="0.6"
              strokeDasharray="2 1.5"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0.35, 0.85, 0.35] }}
              transition={{ duration: 1.8, repeat: Infinity }}
            />
            <text x="40" y="24" fontSize="2.5" fill="#fbbf24" fontWeight="900">DELIVERY ZONE</text>

            <motion.path
              d="M 91 10 C 79 10, 68 13, 53 19"
              fill="none"
              stroke="#fbbf24"
              strokeWidth="1.2"
              strokeDasharray="4 2"
              markerEnd="url(#preview-ball-arrow)"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.95 }}
              transition={{ duration: 1.2, repeat: Infinity, repeatDelay: 1.2 }}
            />

            <motion.path
              d={opponentShape}
              fill="none"
              stroke="#ef4444"
              strokeWidth="0.9"
              strokeDasharray="2 2"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0.35, 0.8, 0.35] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <text x="22" y="20" fontSize="2.5" fill="#f87171" fontWeight="900">OPPONENT DROP LINE</text>

            {playerRuns.map((run, index) => (
              <g key={run.id}>
                <motion.path
                  d={run.d}
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="0.9"
                  strokeDasharray={run.intent === 'support' ? '2 2' : '4 2'}
                  markerEnd="url(#preview-run-arrow)"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 0.9 }}
                  transition={{ duration: 1.3, delay: index * 0.22, repeat: Infinity, repeatDelay: 1.4 }}
                />
              </g>
            ))}

            {[{ n: 2, x: 91, y: 10 }, { n: 9, x: 63, y: 35 }, { n: 5, x: 47, y: 39 }, { n: 11, x: 34, y: 38 }, { n: 8, x: 49, y: 58 }, { n: 10, x: 63, y: 52 }, { n: 4, x: 50, y: 64 }].map((p) => (
              <g key={p.n}>
                <circle cx={p.x} cy={p.y} r="2.7" fill="#facc15" stroke="#1c1917" strokeWidth="0.6" />
                <text x={p.x} y={p.y + 0.8} fontSize="2.4" textAnchor="middle" fill="#1c1917" fontWeight="900">{p.n}</text>
              </g>
            ))}
          </svg>
        </div>

        <div className="space-y-3">
          {[
            { icon: Route, title: 'Run trails', detail: 'Staggered player paths show who moves first, who attacks the box, and who supports the second ball.' },
            { icon: ArrowRight, title: 'Ball path', detail: 'The delivery path is visually separate from player movement so the session plan is easier to read.' },
            { icon: Waves, title: 'Opponent reaction', detail: 'The defending line shows the opposition dropping and shifting toward the delivery zone.' },
            { icon: Target, title: 'Set-piece target', detail: 'The highlighted zone shows where the cross should arrive, not just where players finish.' },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="bg-stone-950/80 border border-stone-800 rounded-xl p-4 flex gap-3">
                <div className="w-9 h-9 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                  <Icon size={17} />
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase tracking-tight text-white">{item.title}</h4>
                  <p className="text-[10px] text-stone-500 leading-relaxed mt-1">{item.detail}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
