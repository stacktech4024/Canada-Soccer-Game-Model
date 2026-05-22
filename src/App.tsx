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
  const [showPortfolio, setShowPortfolio] = useState(false);

  const activePlayer = players.find(p => p.id === activePlayerId) || null;

  return (
    <div className="min-h-screen bg-stone-950 selection:bg-amber-500/30">
      {/* Portfolio Modal */}
      <AnimatePresence>
        {showPortfolio && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-stone-950/90 backdrop-blur-xl p-6 md:p-12 overflow-y-auto"
          >
            <div className="max-w-4xl mx-auto space-y-12">
              <div className="flex justify-between items-center border-b border-stone-800 pb-8">
                <div>
                  <h2 className="text-3xl font-black uppercase tracking-tighter">B Diploma <span className="text-amber-500 italic">Portfolio</span></h2>
                  <p className="text-xs font-mono text-stone-500 tracking-widest mt-2 uppercase">Official Session Plans & Tactical Frameworks</p>
                </div>
                <button 
                  onClick={() => setShowPortfolio(false)}
                  className="px-6 py-2 bg-stone-900 border border-stone-800 rounded-lg text-[10px] font-black uppercase hover:bg-stone-800 transition-all"
                >
                  Close [ESC]
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {[
                  { title: 'Goal Setting & Objectives', category: 'Phase 1', desc: 'Establishing seasonal macrocycles and team identity.' },
                  { title: 'Attacking In The Final Third', category: 'Session Plan #12', desc: 'Functional activity focusing on wing overloads and box entries.' },
                  { title: 'Mid-Block Defensive Compactness', category: 'Session Plan #04', desc: 'Technical/Tactical lead on denial of central penetration.' },
                  { title: 'Transition To Defend (5s Rule)', category: 'Principles', desc: 'Mental triggers and recovery sprint logistics.' }
                ].map((doc, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="group bg-stone-900 border border-stone-800 p-6 rounded-2xl hover:border-amber-500/50 transition-all cursor-pointer"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest bg-amber-500/10 px-2 py-1 rounded">{doc.category}</span>
                      <BookOpen size={18} className="text-stone-700 group-hover:text-amber-500 transition-colors" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">{doc.title}</h3>
                    <p className="text-xs text-stone-500 leading-relaxed">{doc.desc}</p>
                    <div className="mt-6 flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-stone-600">
                      <div className="w-8 h-px bg-stone-800" />
                      View Documentation
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="p-8 border border-stone-800 border-dashed rounded-3xl text-center space-y-4">
                <p className="text-xs text-stone-500 uppercase font-black tracking-widest">Certification Status</p>
                <div className="flex justify-center gap-4">
                  <div className="px-4 py-2 bg-stone-900 rounded-full border border-stone-800 text-[10px] font-bold">CSA B DIPLOMA LICENSED</div>
                  <div className="px-4 py-2 bg-stone-900 rounded-full border border-stone-800 text-[10px] font-bold">UEFA C READY</div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="border-b border-stone-800 px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4 bg-stone-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-amber-500 rounded-sm flex items-center justify-center font-black text-stone-950 text-xl transform rotate-3">
            B
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight uppercase tracking-tight">Coach Darren Billy</h1>
            <p className="text-xs font-mono text-stone-500 tracking-wider">GAME MODEL PORTFOLIO / CSA B DIPLOMA</p>
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
          <button 
            onClick={() => setShowPortfolio(true)}
            className="flex items-center gap-2 text-xs font-bold hover:text-amber-500 transition-colors uppercase tracking-widest"
          >
            <BookOpen size={14} />
            Portfolio
          </button>
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
                 <p className="text-stone-400 text-sm leading-relaxed font-medium">
                   Refining team organization based on the <strong>Verticality & Transition</strong> ideology. 
                   Analyze unit relationships within vertical channels and horizontal zones, emphasizing the <strong>5-Second Mental Trigger</strong> for ball recovery.
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
