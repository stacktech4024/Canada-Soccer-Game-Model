import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { SQUAD, PRINCIPLES, OPPONENTS, Moment, SEQUENCES, TacticalStep } from '../data/tactics';
import { Settings2, RotateCcw, LayoutGrid, ShieldAlert, Zap, Info, Target, Users, Play, Pause } from 'lucide-react';

export const TacticalBoard: React.FC = () => {
  const [moment, setMoment] = useState<Moment>('att-org');
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [prevSelectedId, setPrevSelectedId] = useState<number | null>(null);
  const [showGrid, setShowGrid] = useState(true);

  // Animation State
  const [isPlaying, setIsPlaying] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

  const sequence = SEQUENCES[moment];
  const activeStep: TacticalStep | null = isPlaying ? sequence[stepIndex] : null;

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying) {
      timer = setTimeout(() => {
        if (stepIndex < sequence.length - 1) {
          setStepIndex(prev => prev + 1);
        } else {
          setIsPlaying(false);
          setStepIndex(0);
        }
      }, 3000);
    }
    return () => clearTimeout(timer);
  }, [isPlaying, stepIndex, sequence]);

  const handlePlayerSelect = (id: number) => {
    if (isPlaying) return;
    setPrevSelectedId(selectedId);
    setSelectedId(id);
  };

  const currentPos = selectedId ? SQUAD.find(p => p.number === selectedId)?.positions[moment] : null;
  const prevPos = prevSelectedId ? SQUAD.find(p => p.number === prevSelectedId)?.positions[moment] : null;
  const ballPos = currentPos || { x: 50, y: 60 };

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Main Tactical Pitch Area */}
      <div className="flex-1 flex flex-col gap-4">
        
        {/* Moment Selector */}
        <div className="flex flex-col md:flex-row gap-4 bg-stone-900 border border-stone-800 p-2 rounded-xl shadow-inner">
          <div className="grid grid-cols-2 lg:flex-1 gap-1">
            {(['att-org', 'trans-def', 'def-org', 'trans-att'] as Moment[]).map((m) => (
              <button
                key={m}
                onClick={() => { setMoment(m); setSelectedId(null); setPrevSelectedId(null); setIsPlaying(false); setStepIndex(0); }}
                className={`flex items-center justify-center gap-2 px-2 py-2.5 rounded-lg text-[9px] font-black uppercase tracking-tighter transition-all
                  ${moment === m 
                    ? (m.includes('att') ? 'bg-green-600 text-white shadow-lg' : 'bg-red-600 text-white shadow-lg') 
                    : 'bg-stone-800/50 text-stone-500 hover:bg-stone-700/50 hover:text-stone-300'}`}
              >
                {m.includes('att') ? <Zap size={10} /> : <ShieldAlert size={10} />}
                {PRINCIPLES[m].title}
              </button>
            ))}
          </div>
          
          <button
            onClick={() => { setIsPlaying(!isPlaying); setStepIndex(0); }}
            className={`flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all
              ${isPlaying ? 'bg-amber-500 text-stone-900' : 'bg-stone-100 text-stone-900 hover:bg-white'}`}
          >
            {isPlaying ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" />}
            {isPlaying ? 'Following...' : 'Play Scenario'}
          </button>
        </div>

        {/* The Pitch Rendering */}
        <div className="relative aspect-[100/120] bg-stone-950 rounded-2xl border-stone-800 border-4 overflow-hidden shadow-2xl group">
          {/* Pitch Texture */}
          <div className="absolute inset-0 opacity-20 pointer-events-none" 
            style={{ backgroundImage: 'radial-gradient(circle, #fff 0.5px, transparent 0.5px)', backgroundSize: '15px 15px' }} 
          />

          {/* Animation Sequence Highlights */}
          <AnimatePresence>
            {activeStep?.highlightZone && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.15 }}
                exit={{ opacity: 0 }}
                className="absolute inset-x-0 bg-amber-500 pointer-events-none"
                style={{ 
                  top: `${(4 - activeStep.highlightZone) * 25}%`,
                  height: '25%'
                }}
              />
            )}
            {activeStep?.highlightChannel && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.15 }}
                exit={{ opacity: 0 }}
                className="absolute inset-y-0 bg-blue-500 pointer-events-none"
                style={{ 
                  left: activeStep.highlightChannel === 'L-Flank' ? '0%' : 
                        activeStep.highlightChannel === 'L-Half' ? '20%' :
                        activeStep.highlightChannel === 'Central' ? '40%' :
                        activeStep.highlightChannel === 'R-Half' ? '60%' : '80%',
                  width: '20%'
                }}
              />
            )}
          </AnimatePresence>

          {/* Grid Framework (Zones & Channels) */}
          <AnimatePresence>
            {showGrid && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 pointer-events-none"
              >
                {/* Horizontal Zones 1-4 (Canada Soccer Framework) */}
                <div className="absolute inset-x-0 top-[25%] h-px bg-amber-500/10" />
                <div className="absolute inset-x-0 top-[50%] h-px bg-white/20" /> 
                <div className="absolute inset-x-0 top-[75%] h-px bg-amber-500/10" />

                {/* Vertical Channels (5) */}
                <div className="absolute inset-y-0 left-[20%] w-px bg-white/5" />
                <div className="absolute inset-y-0 left-[40%] w-px bg-white/10" />
                <div className="absolute inset-y-0 left-[60%] w-px bg-white/10" />
                <div className="absolute inset-y-0 left-[80%] w-px bg-white/5" />

                {/* Grid Labels */}
                <div className="absolute top-1.5 left-0 right-0 flex justify-around px-4 font-mono text-[7px] text-stone-600 font-bold uppercase tracking-[0.2em]">
                   <span>Ch 1</span><span>Ch 2</span><span>Ch 3</span><span>Ch 2</span><span>Ch 1</span>
                </div>
                <div className="absolute inset-y-0 right-2 flex flex-col justify-around font-mono text-[8px] text-amber-500/25 font-bold uppercase [writing-mode:vertical-lr] tracking-[0.3em]">
                   <span>Zone 4 (Attacking)</span>
                   <span>Zone 3 (Att-Mid)</span>
                   <span>Zone 2 (Def-Mid)</span>
                   <span>Zone 1 (Defensive)</span>
                </div>
                {/* Midfield Line Label */}
                <div className="absolute top-1/2 left-4 -translate-y-1/2 text-[6px] text-stone-700 uppercase font-black tracking-widest">
                  Halfway Line
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Animated Labels during sequence */}
          <AnimatePresence>
            {activeStep && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                className="absolute bottom-12 left-1/2 -translate-x-1/2 bg-stone-900/90 backdrop-blur-md border border-amber-500/40 px-6 py-3 rounded-full shadow-2xl z-[60] flex items-center gap-3 whitespace-nowrap"
              >
                <div className="w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center text-stone-950 text-[10px] font-black">
                  {stepIndex + 1}
                </div>
                <span className="text-[11px] font-black text-amber-500 uppercase tracking-tight">{activeStep.label}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Pitch Markings & Strategic Graphics */}
          <svg viewBox="0 0 100 120" className="absolute inset-0 w-full h-full pointer-events-none">
            <defs>
              <marker id="ball-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#fbbf24" />
              </marker>
            </defs>

            {/* General Markings */}
            <rect x="5" y="5" width="90" height="110" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="0.4" />
            <circle cx="50" cy="60" r="12" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="0.4" />
            <line x1="5" y1="60" x2="95" y2="60" stroke="rgba(255,255,255,0.2)" strokeWidth="0.4" />
            
            {/* Penalty Areas */}
            <rect x="22" y="5" width="56" height="18" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="0.4" />
            <rect x="22" y="97" width="56" height="18" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="0.4" />
            
            {/* Goal Areas (6-yard boxes) */}
            <rect x="38" y="5" width="24" height="6" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="0.4" />
            <rect x="38" y="109" width="24" height="6" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="0.4" />

            {/* The Nets (Goals) - Aligned to Goal Line (y=5 and y=115) */}
            <g className="opacity-80">
              {/* Top Goal */}
              <rect x="42" y="1.5" width="16" height="3.5" fill="rgba(255,255,255,0.05)" stroke="white" strokeWidth="0.8" rx="0.5" />
              {/* Bottom Goal */}
              <rect x="42" y="115" width="16" height="3.5" fill="rgba(255,255,255,0.05)" stroke="white" strokeWidth="0.8" rx="0.5" />
            </g>

            {/* Strategic Unit Links */}
            <AnimatePresence>
              {selectedId && !isPlaying && (
                <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  {SQUAD.map(p => {
                    const activeP = SQUAD.find(ap => ap.number === selectedId);
                    if (!activeP || p.number === selectedId) return null;
                    const pos1 = activeP.positions[moment];
                    const pos2 = p.positions[moment];
                    const dist = Math.sqrt(Math.pow(pos1.x - pos2.x, 2) + Math.pow(pos1.y - pos2.y, 2));
                    if (dist > 35) return null; // Only link immediate tactical units

                    return (
                      <motion.line 
                        key={`link-${p.number}`}
                        x1={pos1.x} y1={pos1.y}
                        x2={pos2.x} y2={pos2.y}
                        stroke="#fbbf24"
                        strokeWidth="0.4"
                        strokeDasharray="2 2"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 0.3 }}
                      />
                    );
                  })}
                </motion.g>
              )}
            </AnimatePresence>

            {/* Animated Passing Path */}
            <AnimatePresence>
              {prevPos && currentPos && selectedId !== prevSelectedId && !isPlaying && (
                <motion.path
                  key={`pass-${prevSelectedId}-${selectedId}`}
                  d={`M ${prevPos.x} ${prevPos.y} L ${currentPos.x} ${currentPos.y}`}
                  stroke="#fbbf24"
                  strokeWidth="0.8"
                  strokeDasharray="4 2"
                  markerEnd="url(#ball-arrow)"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 0.8 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                />
              )}
            </AnimatePresence>
          </svg>

          {/* Opponent Layer (Defensive Shadows) */}
          {OPPONENTS.map((opp, i) => {
            const roleColors = {
              GK: 'bg-stone-500/30 border-stone-400/30',
              DEF: 'bg-red-700/30 border-red-600/40',
              MID: 'bg-red-500/25 border-red-400/30',
              FWD: 'bg-red-400/20 border-red-300/20'
            };

            return (
              <div 
                key={`opp-${i}`}
                className={`absolute -translate-x-1/2 -translate-y-1/2 w-5 h-5 border rounded-full flex items-center justify-center transition-all shadow-lg ${roleColors[opp.role]}`}
                style={{ left: `${opp.x}%`, top: `${opp.y}%` }}
              >
                <span className="text-[6px] font-bold text-red-200/50 select-none">{opp.label}</span>
              </div>
            );
          })}

          {/* Home Team Layer */}
          {SQUAD.map((player) => {
            const pos = player.positions[moment];
            const isSelected = selectedId === player.number;
            const isFocused = activeStep?.focusPlayers?.includes(player.number);

            return (
              <motion.div
                key={`player-${player.number}`}
                layout
                initial={false}
                animate={{ 
                  left: `${pos.x}%`, 
                  top: `${pos.y}%`,
                  scale: isSelected || isFocused ? 1.3 : 1,
                  opacity: isPlaying && !isFocused ? 0.3 : 1,
                  zIndex: isSelected || isFocused ? 40 : 10
                }}
                transition={{ type: 'spring', damping: 20, stiffness: 80 }}
                onClick={() => handlePlayerSelect(player.number)}
                className={`absolute -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex flex-col items-center justify-center cursor-pointer transition-all duration-300
                  ${isSelected ? 'bg-amber-500 text-stone-900 shadow-[0_0_20px_rgba(245,158,11,0.6)]' : 
                    isFocused ? 'bg-amber-400 text-stone-950 shadow-lg' : 'bg-stone-800 text-stone-300 hover:bg-stone-700'}`}
              >
                <span className="text-[10px] font-black">{player.number}</span>
                <span className="text-[5px] font-black uppercase opacity-60 group-hover:opacity-100">{player.label}</span>
              </motion.div>
            );
          })}

          {/* Tactical Ball */}
          <motion.div
            layoutId="ball"
            animate={{ left: `${ballPos.x}%`, top: `${ballPos.y}%` }}
            transition={{ type: 'spring', damping: 25, stiffness: 60, mass: 0.8 }}
            className="absolute -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white rounded-full shadow-[0_0_15px_rgba(255,255,255,1)] z-50 flex items-center justify-center border border-stone-300"
          >
            <div className="w-1.5 h-1.5 bg-stone-900 rounded-full opacity-20" />
          </motion.div>
        </div>

        {/* Pitch Utility Controls */}
        <div className="flex items-center justify-between px-2">
           <button onClick={() => setShowGrid(!showGrid)} className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-colors ${showGrid ? 'text-amber-500' : 'text-stone-500'}`}>
             <LayoutGrid size={14} /> Zones/Channels
           </button>
           <button onClick={() => { setSelectedId(null); setPrevSelectedId(null); }} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-stone-500 hover:text-white transition-colors">
             <RotateCcw size={14} /> Reset Scenario
           </button>
        </div>
      </div>

      {/* Sidebar Analysis (Game Model Principles) */}
      <div className="w-full lg:w-96 flex flex-col gap-6">
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center gap-3 mb-6 pb-6 border-b border-stone-800">
            <div className={`p-3 rounded-xl ${moment.includes('att') ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
              <Settings2 size={24} />
            </div>
            <div>
              <h3 className="text-base font-black text-white uppercase tracking-tighter">Tactical Moment</h3>
              <p className="text-[10px] text-stone-500 font-mono font-bold uppercase tracking-widest">{PRINCIPLES[moment].title}</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="p-4 bg-stone-800/40 rounded-xl border border-stone-700/50">
              <h4 className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Info size={14} /> Fundamental Principles
              </h4>
              <ul className="space-y-3">
                {PRINCIPLES[moment].keys.map((key, i) => (
                  <motion.li 
                    key={`${moment}-${key}`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-start gap-3 text-xs text-stone-300 font-semibold leading-snug"
                  >
                    <div className="w-2 h-2 rounded-full bg-amber-500/40 mt-1 flex-shrink-0" />
                    {key}
                  </motion.li>
                ))}
              </ul>
            </div>

            {selectedId && (
              <motion.div 
                key={`sidebar-${selectedId}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-5 bg-amber-500/5 rounded-xl border border-amber-500/20"
              >
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center text-stone-950 font-black text-sm shadow-lg shadow-amber-500/20">
                    {selectedId}
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-white uppercase tracking-tighter">{SQUAD.find(p => p.number === selectedId)?.role}</h4>
                    <p className="text-[10px] text-stone-500 uppercase font-bold tracking-widest">Unit Analysis</p>
                  </div>
                </div>
                <p className="text-[11px] text-stone-400 italic leading-relaxed">
                  Establishing links with nearby units to optimize passing lanes. Current objective: <span className="text-amber-500/80 font-bold not-italic">Numerical Superiority</span> in the active channel.
                </p>
              </motion.div>
            )}

            <div className="flex items-start gap-4 p-5 bg-blue-500/5 rounded-xl border border-blue-500/10">
              <Users size={20} className="text-blue-400/60 flex-shrink-0" />
              <div className="space-y-1">
                <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Structural State</h4>
                <p className="text-xs text-stone-400 leading-relaxed font-medium">
                  {moment.includes('att') 
                    ? '1-4-3-3 Horizontal Dispersal. Exploiting the Wide Flanks.' 
                    : '1-4-4-2 Compact Organization. Protecting the Central Canal.'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center gap-3 px-2 py-1 text-[9px] text-stone-600 font-bold uppercase tracking-widest">
                <Target size={12} /> Live Geography: {currentPos ? `Zone ${Math.ceil(4 - currentPos.y / 25)}` : 'Scanning...'}
              </div>
              <div className="px-3 py-1 bg-stone-800 rounded flex items-center gap-2 border border-stone-700">
                <div className="w-1.5 h-1.5 rounded-full bg-stone-500" />
                <span className="text-[8px] text-stone-400 font-black uppercase tracking-widest">Set Pieces</span>
              </div>
            </div>

            <div className="mt-4 p-4 bg-stone-900/50 border border-stone-800 rounded-xl space-y-4">
              <h5 className="text-[9px] font-black text-amber-500 uppercase tracking-widest flex items-center gap-2">
                <Info size={12} /> Framework Definitions
              </h5>
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <p className="text-[8px] font-black text-stone-300 uppercase tracking-tighter mb-0.5">System</p>
                  <p className="text-[9px] text-stone-500 leading-tight">Positional arrangement establishing communication channels into units.</p>
                </div>
                <div>
                  <p className="text-[8px] font-black text-stone-300 uppercase tracking-tighter mb-0.5">Strategy</p>
                  <p className="text-[9px] text-stone-500 leading-tight">Plans and principles decided before a match to organize activity.</p>
                </div>
                <div>
                  <p className="text-[8px] font-black text-stone-300 uppercase tracking-tighter mb-0.5">Tactics</p>
                  <p className="text-[9px] text-stone-500 leading-tight">Immediate solutions guided by principles to fulfill the strategy.</p>
                </div>
              </div>
            </div>

            <div className="mt-2 p-4 bg-stone-900 border border-stone-800 rounded-xl">
              <h5 className="text-[9px] font-black text-stone-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                <Users size={12} /> Opponent Legend
              </h5>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-700/60 border border-red-600/40" />
                  <span className="text-[9px] text-stone-400 font-bold">DEFENDER</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500/50 border border-red-400/30" />
                  <span className="text-[9px] text-stone-400 font-bold">MIDFIELD</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-400/40 border border-red-300/20" />
                  <span className="text-[9px] text-stone-400 font-bold">ATTACKER</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-stone-500/50 border border-stone-400/30" />
                  <span className="text-[9px] text-stone-400 font-bold">GOALIE</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
