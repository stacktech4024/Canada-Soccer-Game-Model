import React from 'react';
import { PlayerProfile } from '../data/players';
import { Shield, Zap, Target, Crosshair, Users, Microscope, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MovementVisualizer } from './MovementVisualizer';

interface PlayerCardProps {
  player: PlayerProfile | null;
}

export const PlayerCard: React.FC<PlayerCardProps> = ({ player }) => {
  if (!player) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-stone-800 rounded-xl text-stone-600">
        <Users size={48} className="mb-4 opacity-20" />
        <p className="font-mono text-xs uppercase tracking-widest">Select a position on the pitch</p>
      </div>
    );
  }

  const getIcon = () => {
    switch (player.id) {
      case 'gk': return <Shield size={20} />;
      case 'cb': return <Shield size={20} />;
      case 'fb': return <Zap size={20} />;
      case 'dm': return <Crosshair size={20} />;
      case 'am': return <Microscope size={20} />;
      case 'wf': return <Zap size={20} />;
      case 'cf': return <Target size={20} />;
      default: return <Users size={20} />;
    }
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={player.id}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="bg-stone-900 border border-stone-800 rounded-xl overflow-hidden shadow-xl"
      >
        <div className="p-6 bg-stone-800/50 flex justify-between items-start border-b border-stone-700/50">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-amber-500">{getIcon()}</span>
              <span className="font-mono text-[10px] uppercase tracking-wider text-stone-400">Position #{player.number}</span>
            </div>
            <h2 className="text-2xl font-bold text-stone-100">{player.position}</h2>
            <p className="text-amber-500 italic font-medium text-sm">{player.title}</p>
          </div>
          <div className="text-4xl font-mono font-black text-stone-700/50 select-none">
            {player.number.toString().padStart(2, '0')}
          </div>
        </div>

        <div className="p-6 space-y-6">
          <section>
            <h3 className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-stone-500 font-bold mb-3 border-b border-stone-800 pb-1">
              General Profile
            </h3>
            <p className="text-stone-300 leading-relaxed text-sm">
              {player.bio}
            </p>
          </section>

          <section>
            <h3 className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-stone-500 font-bold mb-3 border-b border-stone-800 pb-1">
              Movement Patterns
            </h3>
            <MovementVisualizer player={player} />
          </section>

          <section>
            <h3 className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-stone-500 font-bold mb-3 border-b border-stone-800 pb-1">
              Strategic Ideology
            </h3>
            <p className="text-stone-300 leading-relaxed text-sm">
              {player.ideology}
            </p>
          </section>

          <section>
            <h3 className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-stone-500 font-bold mb-3 border-b border-stone-800 pb-1">
              Key Responsibilities
            </h3>
            <p className="text-stone-300 leading-relaxed text-sm">
              {player.role}
            </p>
          </section>
        </div>

        <div className="px-6 py-4 bg-stone-950/50 border-t border-stone-800 flex justify-between items-center">
          <div className="flex gap-4">
             <div className="flex flex-col">
               <span className="text-[10px] text-stone-500 uppercase font-mono tracking-tighter">System</span>
               <span className="text-xs text-stone-300 font-mono">1-4-4-2 / 1-4-2-3-1</span>
             </div>
             <div className="flex flex-col">
               <span className="text-[10px] text-stone-500 uppercase font-mono tracking-tighter">Legacy</span>
               <span className="text-xs text-stone-300 font-mono">B Diploma</span>
             </div>
          </div>
          <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
