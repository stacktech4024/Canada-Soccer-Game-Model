import { useState } from 'react';
import { players } from './data/players';
import { Pitch } from './components/Pitch';
import { PlayerCard } from './components/PlayerCard';
import { Info, Sparkles, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

import { TacticalBoard } from './components/TacticalBoard';

export default function App() {
  const [activeTab, setActiveTab] = useState<'profiles' | 'tactical'>('profiles');
  const [activePlayerId, setActivePlayerId] = useState<string | null>(players[0].id);

  const activePlayer = players.find(p => p.id === activePlayerId) || null;

  return (
    <div className="min-h-screen bg-stone-950 selection:bg-amber-500/30">
      {/* Header (same as before) */}
      <header className="border-b border-stone-800 px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4 bg-stone-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-amber-500 rounded-sm flex items-center justify-center font-black text-stone-950 text-xl transform rotate-3">
            B
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight uppercase tracking-tight">Canada Soccer Tactics</h1>
            <p className="text-xs font-mono text-stone-500 tracking-wider">B DIPLOMA PORTFOLIO / M6-M20</p>
          </div>
        </div>
        
        {/* Navigation Tabs */}
        <div className="flex bg-stone-900 p-1 rounded-lg border border-stone-800">
          <button 
            onClick={() => setActiveTab('profiles')}
            className={`px-4 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === 'profiles' ? 'bg-amber-500 text-stone-950 shadow-md' : 'text-stone-500 hover:text-stone-300'}`}
          >
            Positional Profiles
          </button>
          <button 
            onClick={() => setActiveTab('tactical')}
            className={`px-4 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === 'tactical' ? 'bg-amber-500 text-stone-950 shadow-md' : 'text-stone-500 hover:text-stone-300'}`}
          >
            Tactical Game Model
          </button>
        </div>

        <div className="hidden xl:flex gap-4">
          <div className="hidden md:flex items-center gap-2 border-r border-stone-800 pr-4">
            <Info size={14} className="text-stone-500" />
            <span className="text-[10px] font-mono text-stone-500 uppercase tracking-widest">Interactive Game Model v1.0</span>
          </div>
          <a 
            href="#"
            className="flex items-center gap-2 text-xs font-bold hover:text-amber-500 transition-colors uppercase tracking-widest"
          >
            <BookOpen size={14} />
            Portfolio
          </a>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 md:p-12">
        <AnimatePresence mode="wait">
          {activeTab === 'profiles' ? (
            <motion.div 
              key="profiles-view"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              className="grid grid-cols-1 lg:grid-cols-[1fr_450px] gap-12 items-start"
            >
              
              {/* Left Side: Pitch Visualization */}
              <div className="space-y-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-amber-500">
                    <Sparkles size={16} />
                    <span className="text-xs uppercase tracking-[0.3em] font-black">Strategic Overview</span>
                  </div>
                  <h2 className="text-4xl md:text-5xl font-bold max-w-2xl leading-none">
                    Define your role within the <span className="text-amber-500 italic">Game Model.</span>
                  </h2>
                  <p className="text-stone-400 text-sm md:text-base max-w-xl leading-relaxed">
                    Click on the player nodes to explorer their specific tactical responsibilities, 
                    mental triggers, and strategic ideology for both the 1-4-4-2 and 1-4-2-3-1 formations.
                  </p>
                </div>

                <Pitch 
                  activePlayerId={activePlayerId} 
                  players={players} 
                  onPlayerSelect={setActivePlayerId} 
                />

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-8">
                  <div className="p-4 border border-stone-800 rounded-lg bg-stone-900/40">
                    <p className="text-[10px] text-stone-500 uppercase font-bold tracking-widest mb-1">Moment</p>
                    <p className="text-sm font-medium">Attacking Org</p>
                  </div>
                  <div className="p-4 border border-stone-800 rounded-lg bg-stone-900/40">
                    <p className="text-[10px] text-stone-500 uppercase font-bold tracking-widest mb-1">Method</p>
                    <p className="text-sm font-medium">Functional Play</p>
                  </div>
                  <div className="p-4 border border-stone-800 rounded-lg bg-stone-900/40">
                    <p className="text-[10px] text-stone-500 uppercase font-bold tracking-widest mb-1">Area</p>
                    <p className="text-sm font-medium">Zones 3 & 4</p>
                  </div>
                  <div className="p-4 border border-stone-800 rounded-lg bg-stone-900/40">
                    <p className="text-[10px] text-stone-500 uppercase font-bold tracking-widest mb-1">Status</p>
                    <div className="flex items-center gap-2 text-green-500">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping" />
                      <p className="text-sm font-medium uppercase font-mono tracking-tighter">Connected</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Side: Player Card Container */}
              <div className="sticky top-24">
                <PlayerCard player={activePlayer} />
              </div>

            </motion.div>
          ) : (
            <motion.div
              key="tactical-view"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="max-w-2xl">
                 <h2 className="text-4xl font-bold mb-4 uppercase tracking-tighter">Tactical <span className="text-amber-500 italic">Game Model</span></h2>
                 <p className="text-stone-400 text-sm leading-relaxed">
                   Refining team organization across the 4 moments of the game. Analyze unit relationships 
                   within vertical channels and horizontal zones as defined by Canada Soccer proficiency standards.
                 </p>
              </div>
              <TacticalBoard />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer Decoration */}
      <footer className="mt-24 border-t border-stone-800 p-8 flex justify-center opacity-30">
        <div className="flex items-center gap-8 text-[10px] font-mono uppercase tracking-[0.5em] text-stone-500 whitespace-nowrap overflow-hidden">
          <span>Integrity</span>
          <span>•</span>
          <span>Growth</span>
          <span>•</span>
          <span>Accountability</span>
          <span>•</span>
          <span>Empathy</span>
          <span>•</span>
          <span>Integrity</span>
        </div>
      </footer>
    </div>
  );
}
