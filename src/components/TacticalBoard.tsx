import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { SQUAD, PRINCIPLES, OPPONENTS, Moment, SEQUENCES, TacticalStep, FORMATIONS, OpponentRole } from '../data/tactics';
import { players } from '../data/players';
import { Settings2, RotateCcw, LayoutGrid, ShieldAlert, Zap, Info, Target, Users, Play, Pause, MousePointer2, Pencil } from 'lucide-react';

import { getTacticalAnalysis } from '../services/geminiService';
import { PlayerPiece } from './PlayerPiece';

const UnitLinks: React.FC<{ players: number[], positions: Record<number, { x: number, y: number }>, color: string, strokeWidth?: number }> = ({ players, positions, color, strokeWidth = 0.5 }) => {
  if (players.length < 2) return null;
  const points = players.map(id => positions[id]).filter(Boolean);
  if (points.length < 2) return null;

  return (
    <motion.path
      d={`M ${points[0].x} ${points[0].y} ${points.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ')}`}
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeDasharray="2 2"
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: 1 }}
    />
  );
};

export const TacticalBoard: React.FC = () => {
  const [moment, setMoment] = useState<Moment>('att-org');
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [prevSelectedId, setPrevSelectedId] = useState<number | null>(null);
  const [showGrid, setShowGrid] = useState(true);

  // Animation State
  const [isPlaying, setIsPlaying] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

  const [showAllLanes, setShowAllLanes] = useState(false);
  const [showUnitConnections, setShowUnitConnections] = useState(true);

  // New Interactive State
  const [customPositions, setPlayerPositions] = useState<Record<number, { x: number; y: number }>>(
    Object.fromEntries(SQUAD.map(p => [p.number, p.positions[moment]]))
  );
  const [currentFormation, setCurrentFormation] = useState('1-4-4-2');
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [arrows, setArrows] = useState<{ 
    start: { x: number; y: number; id?: number }; 
    end: { x: number; y: number; id?: number } 
  }[]>([]);
  const [currentArrow, setCurrentArrow] = useState<{ 
    start: { x: number; y: number; id?: number }; 
    end: { x: number; y: number; id?: number } 
  } | null>(null);

  const [aiAnnotation, setAiAnnotation] = useState<string>("");
  const [isAiLoading, setIsAiLoading] = useState(false);

  const [manualBallPos, setManualBallPos] = useState<{ x: number; y: number } | null>(null);

  // Auto-switch formations and reset ball on moment change
  useEffect(() => {
    const formationKey = moment === 'att-org' ? '1-4-3-3' : (moment.includes('att') ? '1-4-4-2' : '1-4-2-3-1');
    if (!isPlaying) {
      applyFormation(formationKey);
      setManualBallPos(null); // Clear manual ball pos to use moment default
    }
  }, [moment]);

  const getPitchCoords = (event: React.MouseEvent | React.TouchEvent | MouseEvent | TouchEvent) => {
    const pitch = document.getElementById('tactical-pitch');
    if (!pitch) return null;
    const rect = pitch.getBoundingClientRect();
    
    let clientX, clientY;
    if ('touches' in event) {
      clientX = event.touches[0].clientX;
      clientY = event.touches[0].clientY;
    } else {
      clientX = event.clientX;
      clientY = event.clientY;
    }

    return {
      x: ((clientX - rect.left) / rect.width) * 100,
      y: ((clientY - rect.top) / rect.height) * 100
    };
  };

  const getPlayerAtCoords = (coords: { x: number; y: number }) => {
    return SQUAD.find(p => {
      const pos = activePositions[p.number];
      if (!pos) return false;
      const dist = Math.sqrt(Math.pow(pos.x - coords.x, 2) + Math.pow(pos.y - coords.y, 2));
      return dist < 4;
    })?.number;
  };

  const handlePitchMouseDown = (e: React.MouseEvent) => {
    if (!isDrawingMode) return;
    const coords = getPitchCoords(e);
    if (coords) {
      const playerId = getPlayerAtCoords(coords);
      setCurrentArrow({ 
        start: { ...coords, id: playerId }, 
        end: { ...coords, id: playerId } 
      });
    }
  };

  const handlePitchMouseMove = (e: React.MouseEvent) => {
    if (!isDrawingMode || !currentArrow) return;
    const coords = getPitchCoords(e);
    if (coords) {
      const playerId = getPlayerAtCoords(coords);
      setCurrentArrow(prev => prev ? { 
        ...prev, 
        end: { ...coords, id: playerId } 
      } : null);
    }
  };

  const handlePitchMouseUp = () => {
    if (!isDrawingMode || !currentArrow) return;
    setArrows(prev => [...prev, currentArrow]);
    setCurrentArrow(null);
  };

  const sequence = SEQUENCES[moment] || [];
  const activeStep: TacticalStep | null = isPlaying && sequence.length > 0 ? sequence[stepIndex] : null;
  const isGoalStep = activeStep?.label.toUpperCase().includes('GOAL');
  const isTransitionMoment = moment === 'trans-att' || moment === 'trans-def';

  const getBallPos = (playersMap?: Record<number, { x: number; y: number }>) => {
    // 1. Playback takes top priority
    if (isPlaying && activeStep?.ballPos) return activeStep.ballPos;
    if (isPlaying && activeStep?.ballPath && activeStep.ballPath.length > 0) {
      return activeStep.ballPath[0];
    }
    
    // 2. Possession (selected player) takes second priority
    if (selectedId) {
      const pPos = playersMap ? playersMap[selectedId] : (customPositions[selectedId] || { x: 50, y: 70 });
      return { x: pPos.x, y: pPos.y };
    }

    // 3. Manual drag position
    if (manualBallPos) return manualBallPos;

    // 4. Default start based on moment
    if (moment === 'att-org') return { x: 50, y: 92 }; // Our GK
    if (moment === 'def-org') return { x: 50, y: 15 }; // Opponent GK area
    if (moment === 'set-pieces') return { x: 95, y: 5 }; // Corner kick area

    return { x: 50, y: 60 };
  };

  const distanceToSegment = (p: { x: number; y: number }, v: { x: number; y: number }, w: { x: number; y: number }) => {
    const l2 = Math.pow(v.x - w.x, 2) + Math.pow(v.y - w.y, 2);
    if (l2 === 0) return Math.sqrt(Math.pow(p.x - v.x, 2) + Math.pow(p.y - v.y, 2));
    let t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
    t = Math.max(0, Math.min(1, t));
    return Math.sqrt(Math.pow(p.x - (v.x + t * (w.x - v.x)), 2) + Math.pow(p.y - (v.y + t * (w.y - v.y)), 2));
  };

  // Derive active positions merging step overrides and reactive ball sliding
  const getActivePositions = (opps: any[]) => {
    const base = { ...customPositions };
    const stepOverrides = activeStep?.playerPositions || {};
    
    let merged = {
      ...base,
      ...stepOverrides
    };

    // If we're not playing a fixed sequence, apply reactive sliding and Pickering FC rules
    if (!isPlaying) {
      const ballPosForSliding = getBallPos(merged);
      const isAttacking = moment.includes('att');
      
      // Calculate slide intensity - stronger for defending
      const slideFactorX = moment === 'def-org' ? 0.4 : 0.2;
      const slideFactorY = 0.15;

      const slideX = (ballPosForSliding.x - 50) * slideFactorX;
      const slideY = (ballPosForSliding.y - 65) * slideFactorY;

      // Unit grouping for more cohesive movement
      const units = {
        def: [1, 2, 3, 4, 5],
        mid: [6, 8, 10, 7, 11],
        fwd: [9]
      };

      Object.keys(merged).forEach((id) => {
        const pid = Number(id);
        if (pid === selectedId && !manualBallPos) return;

        let newX = merged[pid].x + slideX;
        let newY = merged[pid].y + slideY;

        // "Squeezing" - Far side players pull in more to maintain block compactness
        if (moment === 'def-org') {
          const ballOnRight = ballPosForSliding.x > 60;
          const ballOnLeft = ballPosForSliding.x < 40;
          
          if (ballOnRight && merged[pid].x < 50) {
            newX += (50 - merged[pid].x) * 0.2; // Squeeze towards center from left
          } else if (ballOnLeft && merged[pid].x > 50) {
            newX -= (merged[pid].x - 50) * 0.2; // Squeeze towards center from right
          }
        }

        // Rule: #9 blocks CB-to-CB pass in Defending Organization
        if (moment === 'def-org' && pid === 9) {
          if (ballPosForSliding.y < 40) { 
            newX = ballPosForSliding.x; 
            newY = ballPosForSliding.y + 12; 
          }
        }

        // Rule: Attacking Overloads & Onside Discipline
        if (isAttacking) {
          const opponentDefenders = opps.filter(o => o.role === 'DEF');
          const lastDefenderY = opponentDefenders.length > 0 ? Math.min(...opponentDefenders.map(d => d.y)) : 10; 
          
          if (newY < lastDefenderY + 2) {
            newY = lastDefenderY + 2; // Stay 2 units onside
          }

          // Winger movement when ball is wide
          if ((ballPosForSliding.x > 75 || ballPosForSliding.x < 25)) {
             if ([9, 10, 11, 7].includes(pid)) {
                // If ball is on opposite side, winger (7/11) should attack far post
                const playerProfile = players.find(p => p.number === pid);
                const isLW = pid === 11 || playerProfile?.position?.includes('LW') || playerProfile?.shortPos === 'LW';
                const isRW = pid === 7 || playerProfile?.position?.includes('RW') || playerProfile?.shortPos === 'RW';
                
                if (ballPosForSliding.x > 75 && isLW) { // Ball on right, LW 11 attacks far post
                  newX = 40; newY = 18;
                } else if (ballPosForSliding.x < 25 && isRW) { // Ball on left, RW 7 attacks far post
                  newX = 60; newY = 18;
                }
             }
          }
        }

        // Rule: Collective Covering (Defending Transition)
        if (moment === 'trans-def' && pid !== selectedId) {
           const distToBall = Math.sqrt(Math.pow(merged[pid].x - ballPosForSliding.x, 2) + Math.pow(merged[pid].y - ballPosForSliding.y, 2));
           if (distToBall > 30) {
             newY += 8; // Faster recovery drop
           } else {
             // Aggressive closing down for nearest
             newX = merged[pid].x + (ballPosForSliding.x - merged[pid].x) * 0.3;
             newY = merged[pid].y + (ballPosForSliding.y - merged[pid].y) * 0.3;
           }
        }

        merged[pid] = {
          x: Math.max(2, Math.min(98, newX)),
          y: Math.max(2, Math.min(115, newY))
        };
      });
    }

    return merged;
  };

  const getOpponentPositions = (currentBall: { x: number; y: number }) => {
    return OPPONENTS.map((opp, i) => {
      const basePos = activeStep?.opponentPositions?.[i] || opp;
      if (isPlaying) return basePos;

      const ballX = currentBall.x;
      const ballY = currentBall.y;
      
      let shiftedX = basePos.x;
      let shiftedY = basePos.y;

      // Realistic opponent unit shifting (they also shift as a unit)
      const horizontalShift = (ballX - 50) * 0.4;
      const verticalShift = (ballY - 60) * 0.2;

      shiftedX += horizontalShift;
      shiftedY += verticalShift;

      // Opponent Squeezing (Compactness)
      if (ballX > 60 && shiftedX < 50) {
        shiftedX += (50 - shiftedX) * 0.15;
      } else if (ballX < 40 && shiftedX > 50) {
        shiftedX -= (shiftedX - 50) * 0.15;
      }

      if (opp.role === 'GK') {
        shiftedX = 50 + (ballX - 50) * 0.1;
        shiftedY = basePos.y + (ballY - 60) * 0.05;
      }

      return {
        ...opp,
        x: Math.max(5, Math.min(95, shiftedX)),
        y: Math.max(2, Math.min(95, shiftedY))
      };
    });
  };


  // Break circular dependency with multi-pass calculation
  const initialBallPos = getBallPos(customPositions);
  const opponentPositionsDraft = getOpponentPositions(initialBallPos);
  const activePositions = getActivePositions(opponentPositionsDraft);
  const ballPos = getBallPos(activePositions);
  const opponentPositions = getOpponentPositions(ballPos);

  const currentPos = selectedId ? activePositions[selectedId] : null;
  const prevPos = prevSelectedId ? activePositions[prevSelectedId] : null;

  const [practiceType, setPracticeType] = useState<'match' | 'functional'>('match');

  // Use debounced selection for analysis to improve performance
  useEffect(() => {
    if (!selectedId || isPlaying) {
      setAiAnnotation("");
      return;
    }
    
    const timer = setTimeout(async () => {
      setIsAiLoading(true);
      const player = SQUAD.find(p => p.number === selectedId);
      if (!player || !currentPos) return;

      const z = Math.max(1, Math.min(4, Math.ceil(4 - currentPos.y / 25)));
      const ch = currentPos.x < 16.6 ? 1 : 
                 currentPos.x < 33.3 ? 2 : 
                 currentPos.x < 50 ? 3 : 
                 currentPos.x < 66.6 ? 3 : 
                 currentPos.x < 83.3 ? 2 : 1;

      const analysis = await getTacticalAnalysis(
        player.label,
        player.role,
        PRINCIPLES[moment].title,
        `Zone ${z}`,
        `Channel ${ch}`,
        currentFormation,
        currentPos.x,
        currentPos.y
      );
      setAiAnnotation(analysis);
      setIsAiLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, [selectedId, moment, currentFormation, isPlaying]);

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
      }, 3500);
    }
    return () => clearTimeout(timer);
  }, [isPlaying, stepIndex, sequence]);

  const handlePlayerSelect = (id: number) => {
    if (isPlaying || isDrawingMode) return;
    setPrevSelectedId(selectedId);
    setSelectedId(id);
  };

  const applyFormation = (name: string) => {
    const formation = FORMATIONS[name];
    if (!formation) return;
    
    setCurrentFormation(name);
    const newPositions: Record<number, { x: number; y: number }> = {};
    Object.entries(formation.positions).forEach(([id, pos]) => {
      newPositions[Number(id)] = { x: pos.x, y: pos.y };
    });
    
    setPlayerPositions(newPositions);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Main Tactical Pitch Area */}
      <div className="flex-1 flex flex-col gap-4">
        
        {/* Moment & Interaction Toolbar */}
        <div className="flex flex-col gap-4 bg-stone-900 border border-stone-800 p-2 rounded-xl shadow-inner">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex bg-stone-950 p-1 rounded-lg border border-stone-800">
              {Object.keys(FORMATIONS).map(f => (
                <button
                  key={f}
                  onClick={() => applyFormation(f)}
                  className={`px-3 py-1 rounded text-[9px] font-black transition-all ${currentFormation === f ? 'bg-amber-500 text-stone-950' : 'text-stone-500 hover:text-stone-300'}`}
                >
                  {f.replace('1-', '')}
                </button>
              ))}
            </div>

            <div className="flex bg-stone-950 p-1 rounded-lg border border-stone-800">
              <button 
                onClick={() => setIsDrawingMode(false)}
                className={`p-1.5 rounded transition-all ${!isDrawingMode ? 'bg-blue-500 text-white' : 'text-stone-500'}`}
                title="Select Mode"
              >
                <MousePointer2 size={14} />
              </button>
              <button 
                onClick={() => setIsDrawingMode(true)}
                className={`p-1.5 rounded transition-all ${isDrawingMode ? 'bg-blue-500 text-white' : 'text-stone-500'}`}
                title="Drawing Mode"
              >
                <Pencil size={14} />
              </button>
              <button 
                onClick={() => setShowAllLanes(!showAllLanes)}
                className={`p-1.5 rounded transition-all ${showAllLanes ? 'bg-amber-500 text-stone-950' : 'text-stone-500'}`}
                title="All Passing Lanes"
              >
                <Users size={14} />
              </button>
              <button 
                onClick={() => setShowUnitConnections(!showUnitConnections)}
                className={`p-1.5 rounded transition-all ${showUnitConnections ? 'bg-amber-500 text-stone-950' : 'text-stone-500'}`}
                title="Unit Connections"
              >
                <LayoutGrid size={14} />
              </button>
              {arrows.length > 0 && (
                <button 
                  onClick={() => {
                    setArrows([]);
                    setManualBallPos(null);
                  }}
                  className="p-1.5 rounded text-red-500 hover:bg-red-500/10 transition-all"
                  title="Reset Board"
                >
                  <RotateCcw size={14} />
                </button>
              )}
            </div>
            
            <div className="h-4 w-px bg-stone-800 hidden md:block" />

            <div className="grid grid-cols-2 md:flex flex-1 gap-1">
              {(['att-org', 'trans-def', 'def-org', 'trans-att', 'set-pieces'] as Moment[]).map((m) => (
                <button
                  key={m}
                  onClick={() => { setMoment(m); setSelectedId(null); setPrevSelectedId(null); setIsPlaying(false); setStepIndex(0); }}
                  className={`flex items-center justify-center gap-2 px-2 py-2.5 rounded-lg text-[9px] font-black uppercase tracking-tighter transition-all
                    ${moment === m 
                      ? (m.includes('att') ? 'bg-green-600 text-white shadow-lg' : m === 'set-pieces' ? 'bg-blue-600 text-white shadow-lg' : 'bg-red-600 text-white shadow-lg') 
                      : 'bg-stone-800/50 text-stone-500 hover:bg-stone-700/50 hover:text-stone-300'}`}
                >
                  {m.includes('att') ? <Zap size={10} /> : <ShieldAlert size={10} />}
                  {PRINCIPLES[m].title}
                </button>
              ))}
            </div>
          </div>
          
          <button
            onClick={() => { setIsPlaying(!isPlaying); setStepIndex(0); }}
            className={`flex items-center justify-center gap-2 w-full py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all
              ${isPlaying ? 'bg-amber-500 text-stone-900' : 'bg-stone-100 text-stone-900 hover:bg-white'}`}
          >
            {isPlaying ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" />}
            {isPlaying ? 'Viewing Scenario...' : 'Play Scenario Sequence'}
          </button>
        </div>

        {/* The Pitch Rendering */}
        <div 
          id="tactical-pitch" 
          onMouseDown={handlePitchMouseDown}
          onMouseMove={handlePitchMouseMove}
          onMouseUp={handlePitchMouseUp}
          className={`relative aspect-[100/120] bg-stone-950 rounded-2xl border-stone-800 border-4 overflow-hidden shadow-2xl group ${isDrawingMode ? 'cursor-crosshair' : ''}`}
        >
          {/* 5-Second Transition Visual Effect */}
          <AnimatePresence>
            {isTransitionMoment && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: [0.05, 0.15, 0.05] }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1, repeat: Infinity }}
                className="absolute inset-0 bg-red-500/20 pointer-events-none z-0"
              />
            )}
          </AnimatePresence>

          {/* Goal Animation Overlay */}
          <AnimatePresence>
            {isGoalStep && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 1.5, opacity: 0 }}
                transition={{ delay: 0.8, duration: 0.5 }}
                className="absolute inset-0 flex items-center justify-center z-[100] pointer-events-none bg-stone-950/40 backdrop-blur-sm"
              >
                <div className="flex flex-col items-center">
                  <motion.h2 
                    animate={{ y: [0, -20, 0], scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 0.5 }}
                    className="text-7xl font-black text-amber-500 italic uppercase tracking-tighter drop-shadow-[0_0_30px_rgba(245,158,11,0.6)]"
                  >
                    GOAL!
                  </motion.h2>
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    className="h-1 bg-amber-500 mt-2 shadow-[0_0_10px_rgba(245,158,11,1)]"
                  />
                  <p className="text-white font-black uppercase tracking-widest text-[10px] mt-4 opacity-80">Clinical Finish</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 5-Second Fuse Countdown Visual */}
          <AnimatePresence>
            {moment === 'trans-def' && isPlaying && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="absolute inset-x-0 top-1/4 flex flex-col items-center pointer-events-none z-[80]"
              >
                <div className="flex items-center gap-4 bg-red-600 px-6 py-2 rounded-full shadow-2xl border-4 border-white/20">
                  <Zap size={24} className="text-white fill-white animate-pulse" />
                  <span className="text-3xl font-black text-white italic tracking-tighter uppercase">5-Second Fuse</span>
                </div>
                <div className="mt-2 text-white/60 font-black text-[10px] uppercase tracking-[0.3em]">Aggressive Counter-Press</div>
              </motion.div>
            )}
          </AnimatePresence>

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
                  left: activeStep.highlightChannel === 'Left Flank' ? '0%' : 
                        activeStep.highlightChannel === 'Left Half' ? '20%' :
                        activeStep.highlightChannel === 'Central' ? '40%' :
                        activeStep.highlightChannel === 'Right Half' ? '60%' : '80%',
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
                {/* Horizontal Zones 1-4 (Pickering FC Framework) */}
                <div className="absolute inset-x-0 top-[25%] h-px bg-amber-500/10" />
                <div className="absolute inset-x-0 top-[50%] h-px bg-white/20" /> 
                <div className="absolute inset-x-0 top-[75%] h-px bg-amber-500/10" />

                {/* Vertical Channels (5 Sections) */}
                <div className="absolute inset-y-0 left-[20%] w-px bg-white/5" />
                <div className="absolute inset-y-0 left-[40%] w-px bg-white/10" />
                <div className="absolute inset-y-0 left-[60%] w-px bg-white/10" />
                <div className="absolute inset-y-0 left-[80%] w-px bg-white/5" />

                {/* Grid Labels (Pickering FC System) */}
                <div className="absolute top-1.5 left-0 right-0 flex justify-around px-2 font-mono text-[6px] text-white/30 font-bold uppercase tracking-[0.2em]">
                   <span>LEFT</span><span>L HALF</span><span>CENTRAL</span><span>R HALF</span><span>RIGHT</span>
                </div>
                <div className="absolute inset-y-0 right-4 flex flex-col justify-around py-4 z-50">
                   {[
                     { l: 'Z4: PENETRATE', c: 'bg-red-600' },
                     { l: 'Z3: SUPPLY', c: 'bg-amber-600' },
                     { l: 'Z2: UNBALANCE', c: 'bg-stone-700' },
                     { l: 'Z1: BUILD UP', c: 'bg-stone-800' }
                   ].map((z, i) => (
                     <div key={i} className={`${z.c} text-white px-2 py-0.5 rounded-sm text-[7px] font-black shadow-lg flex items-center gap-1`}>
                       {z.l}
                     </div>
                   ))}
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
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -20, opacity: 0 }}
                className="absolute bottom-4 left-4 bg-stone-900/95 backdrop-blur-md border border-amber-500 px-4 py-2 rounded-xl shadow-2xl z-[70] flex flex-col items-start gap-1"
              >
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center text-stone-950 text-[9px] font-black">
                    {stepIndex + 1}
                  </div>
                  <span className="text-[10px] font-black text-amber-500 uppercase tracking-tight leading-none">{activeStep.label}</span>
                </div>
                <span className="text-[7px] text-stone-400 uppercase font-bold tracking-widest leading-none">Scenario Step</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Pitch Markings & Strategic Graphics */}
          <svg viewBox="0 0 100 120" className="absolute inset-0 w-full h-full pointer-events-none">
            <defs>
              <marker id="intent-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="4" markerHeight="4" orient="auto">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor" />
              </marker>
              <marker id="ball-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#fbbf24" />
              </marker>
              <marker id="draw-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#3b82f6" />
              </marker>
            </defs>

            {/* Opponent Defensive Line (Visualizing Offside/Structure) */}
            <AnimatePresence>
              {(moment.includes('att') || moment === 'trans-att') && !isPlaying && (
                <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  {(() => {
                    const defs = opponentPositions.filter(o => o.role === 'DEF');
                    const lastDefY = Math.min(...defs.map(d => d.y));
                    return (
                      <>
                        <line x1="5" y1={lastDefY} x2="95" y2={lastDefY} stroke="#ef4444" strokeWidth="0.4" strokeDasharray="2 2" opacity="0.4" />
                        <text x="7" y={lastDefY - 1} fontSize="2.5" fill="#ef4444" fontWeight="black" opacity="0.6 uppercase">OFFSIDE LINE</text>
                        <path 
                          d={`M ${defs[2].x} ${defs[2].y} L ${defs[0].x} ${defs[0].y} L ${defs[1].x} ${defs[1].y} L ${defs[3].x} ${defs[3].y}`} 
                          fill="none" 
                          stroke="#ef4444" 
                          strokeWidth="0.6" 
                          strokeDasharray="1 1"
                          opacity="0.3"
                        />
                      </>
                    );
                  })()}
                </motion.g>
              )}
            </AnimatePresence>

            {/* Defending Block Links (Compactness Visualizer) */}
            <AnimatePresence>
              {showUnitConnections && !isPlaying && (
                <motion.g initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }}>
                  {moment === 'def-org' && (
                    <>
                      <UnitLinks players={[1, 5, 4, 3, 2]} positions={activePositions} color="#ef4444" />
                      <UnitLinks players={[6, 8, 7, 11]} positions={activePositions} color="#fb923c" />
                    </>
                  )}
                  {moment === 'att-org' && (
                    <>
                      <UnitLinks players={[2, 4, 5, 3]} positions={activePositions} color="#3b82f6" />
                      <UnitLinks players={[7, 6, 8, 11]} positions={activePositions} color="#22c55e" />
                      <UnitLinks players={[9, 10]} positions={activePositions} color="#fbbf24" strokeWidth={1} />
                    </>
                  )}
                </motion.g>
              )}
            </AnimatePresence>

            {/* Strategic Movement Arrows (Game Model Intent) */}
            <AnimatePresence>
              {!isPlaying && !isDrawingMode && (
                <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  {SQUAD.map(p => {
                    const pos = activePositions[p.number];
                    if (!pos) return null;
                    
                    const isBallCarrier = selectedId === p.number;
                    const isAttacking = moment.includes('att');

                    let intent: { x: number; y: number; type: 'move' | 'pass' | 'dribble' } | null = null;
                    
                    if (moment === 'att-org') {
                       if ([2, 3].includes(p.number)) intent = { x: pos.x, y: pos.y - 12, type: 'move' }; 
                       if ([9, 10].includes(p.number)) intent = { x: pos.x, y: pos.y - 6, type: 'move' };
                       if ([7, 11].includes(p.number)) {
                         const targetX = pos.x < 50 ? pos.x + 8 : pos.x - 8;
                         intent = { x: targetX, y: pos.y - 4, type: isBallCarrier ? 'dribble' : 'move' };
                       }
                    } else if (moment === 'def-org') {
                       if ([7, 11, 2, 3].includes(p.number)) intent = { x: 50 + (pos.x - 50) * 0.7, y: pos.y, type: 'move' };
                       if ([9].includes(p.number)) intent = { x: ballPos.x, y: ballPos.y + 10, type: 'move' };
                    }

                    if (!intent) return null;

                    const color = isAttacking ? "#4ade80" : "#f87171";

                    if (intent.type === 'dribble') {
                      const dx = intent.x - pos.x;
                      const dy = intent.y - pos.y;
                      const angle = Math.atan2(dy, dx);
                      const midX = pos.x + dx/2 + Math.cos(angle + Math.PI/2) * 2;
                      const midY = pos.y + dy/2 + Math.sin(angle + Math.PI/2) * 2;
                      
                      return (
                        <motion.path
                          key={`intent-${p.number}`}
                          d={`M ${pos.x} ${pos.y} Q ${midX} ${midY} ${intent.x} ${intent.y}`}
                          stroke={color}
                          strokeWidth="0.5"
                          fill="none"
                          strokeDasharray="2 2"
                          markerEnd="url(#intent-arrow)"
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: 1 }}
                        />
                      );
                    }

                    return (
                      <motion.line
                        key={`intent-${p.number}`}
                        x1={pos.x} y1={pos.y}
                        x2={intent.x} y2={intent.y}
                        stroke={color}
                        strokeWidth="0.4"
                        strokeDasharray={intent.type === 'move' ? "3 3" : "none"}
                        markerEnd="url(#intent-arrow)"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                      />
                    );
                  })}
                </motion.g>
              )}
            </AnimatePresence>

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

            <AnimatePresence>
              {arrows.map((arrow, i) => {
                const startPos = arrow.start.id ? activePositions[arrow.start.id] : arrow.start;
                const endPos = arrow.end.id ? activePositions[arrow.end.id] : arrow.end;
                if (!startPos || !endPos) return null;

                return (
                  <motion.line
                    key={`arrow-${i}`}
                    x1={startPos.x} y1={startPos.y}
                    x2={endPos.x} y2={endPos.y}
                    stroke="#3b82f6"
                    strokeWidth="0.8"
                    markerEnd="url(#draw-arrow)"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  />
                );
              })}
              {currentArrow && (
                <line
                  x1={currentArrow.start.id ? activePositions[currentArrow.start.id].x : currentArrow.start.x}
                  y1={currentArrow.start.id ? activePositions[currentArrow.start.id].y : currentArrow.start.y}
                  x2={currentArrow.end.id ? activePositions[currentArrow.end.id].x : currentArrow.end.x}
                  y2={currentArrow.end.id ? activePositions[currentArrow.end.id].y : currentArrow.end.y}
                  stroke="#3b82f6"
                  strokeWidth="0.8"
                  strokeDasharray="2 2"
                  markerEnd="url(#draw-arrow)"
                />
              )}
            </AnimatePresence>

            {/* Defensive Shape Visualizer (Convex Hull Mockup for 1-4-4-2 block) */}
            {moment === 'def-org' && (
              <motion.path
                d={`M ${activePositions[4].x} ${activePositions[4].y} 
                   L ${activePositions[2].x} ${activePositions[2].y} 
                   L ${activePositions[7].x} ${activePositions[7].y} 
                   L ${activePositions[9].x} ${activePositions[9].y} 
                   L ${activePositions[11].x} ${activePositions[11].y} 
                   L ${activePositions[3].x} ${activePositions[3].y} Z`}
                fill="rgba(239, 68, 68, 0.1)"
                stroke="rgba(239, 68, 68, 0.3)"
                strokeWidth="0.5"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="pointer-events-none"
              >
                <title>Defensive Unit Compactness</title>
              </motion.path>
            )}

            {/* Selected Player Patterns Overlay */}
            <AnimatePresence>
              {selectedId && !isPlaying && (
                <motion.g 
                  key={`patterns-${selectedId}`} 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  exit={{ opacity: 0 }}
                >
                  {players.find(p => p.number === selectedId)?.patterns.map(pattern => (
                    <g key={pattern.id}>
                      {pattern.type === 'zone' ? (
                        <motion.polygon
                          points={pattern.points.map(p => `${p.x} ${p.y}`).join(' ')}
                          fill="rgba(251, 191, 36, 0.1)"
                          stroke="rgba(251, 191, 36, 0.2)"
                          strokeWidth="0.3"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                        >
                          <title>{pattern.label}</title>
                        </motion.polygon>
                      ) : (
                        <>
                          <motion.path
                            d={`M ${pattern.points[0].x} ${pattern.points[0].y} ${pattern.points.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ')}`}
                            fill="none"
                            stroke="rgba(251, 191, 36, 0.4)"
                            strokeWidth="0.5"
                            strokeDasharray="2 2"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                          />
                          <motion.path
                            d="M 0 -1 L 1.5 0 L 0 1 Z"
                            fill="rgba(251, 191, 36, 0.6)"
                            initial={{ opacity: 0 }}
                            animate={{ 
                              opacity: 1,
                              x: pattern.points[pattern.points.length - 1].x,
                              y: pattern.points[pattern.points.length - 1].y,
                              rotate: Math.atan2(
                                pattern.points[pattern.points.length - 1].y - pattern.points[pattern.points.length - 2].y,
                                pattern.points[pattern.points.length - 1].x - pattern.points[pattern.points.length - 2].x
                              ) * (180 / Math.PI)
                            }}
                          />
                        </>
                      )}
                    </g>
                  ))}
                </motion.g>
              )}
            </AnimatePresence>

            {/* Potential Passing Lanes */}
            <AnimatePresence>
              {(selectedId || showAllLanes) && !isPlaying && (
                <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  {SQUAD.map((p1, idx1) => (
                    SQUAD.slice(idx1 + 1).map((p2) => {
                      const isRelevant = showAllLanes || p1.number === selectedId || p2.number === selectedId;
                      if (!isRelevant) return null;

                      const pos1 = activePositions[p1.number];
                      const pos2 = activePositions[p2.number];
                      if (!pos1 || !pos2) return null;
                      
                      const dist = Math.sqrt(Math.pow(pos1.x - pos2.x, 2) + Math.pow(pos1.y - pos2.y, 2));
                      if (dist > 60) return null; // Passing range limit

                      const isBlocked = opponentPositions.some(opp => distanceToSegment(opp, pos1, pos2) < 4);

                      return (
                        <motion.g key={`lane-${p1.number}-${p2.number}`}>
                          {/* The Lane Connection */}
                          <motion.line 
                            x1={pos1.x} y1={pos1.y}
                            x2={pos2.x} y2={pos2.y}
                            stroke={isBlocked ? "#fb923c" : "#4ade80"} 
                            strokeWidth={isBlocked ? "0.4" : "0.8"}
                            strokeDasharray={isBlocked ? "2 2" : "none"}
                            initial={{ pathLength: 0, opacity: 0 }}
                            animate={{ pathLength: 1, opacity: isBlocked ? 0.3 : 0.8 }}
                            transition={{ duration: 0.5 }}
                          />
                          
                          {/* Indicator on target player if lane is open and we have a selected source */}
                          {!isBlocked && dist < 45 && (p1.number === selectedId || p2.number === selectedId) && (
                            <motion.circle 
                              cx={p1.number === selectedId ? pos2.x : pos1.x} 
                              cy={p1.number === selectedId ? pos2.y : pos1.y} r="2.5" 
                              fill="none" stroke="#4ade80" strokeWidth="0.3"
                              initial={{ scale: 1, opacity: 0 }}
                              animate={{ scale: [1, 2], opacity: [0.6, 0] }}
                              transition={{ repeat: Infinity, duration: 1.5, ease: "easeOut" }}
                            />
                          )}
                        </motion.g>
                      );
                    })
                  ))}
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

          {/* Opponent Layer (Defensive Shadows & Shifting) */}
          {opponentPositions.map((opp, i) => {
            return (
              <motion.div 
                key={`opp-${i}`}
                animate={{ left: `${opp.x}%`, top: `${opp.y}%` }}
                transition={{ type: 'spring', damping: 25, stiffness: 45 }}
                className="absolute -translate-x-1/2 -translate-y-1/2 w-7 h-7 z-20 pointer-events-none"
              >
                <PlayerPiece 
                  type="opp_player" 
                  number={opp.id} 
                />
              </motion.div>
            );
          })}

          {/* Home Team Layer with Drag Support */}
          {SQUAD.map((player) => {
            const pos = activePositions[player.number] || { x: 0, y: 0 };
            const isSelected = selectedId === player.number;
            const isFocused = activeStep?.focusPlayers?.includes(player.number);

            return (
              <motion.div
                key={`player-${player.number}`}
                drag={!isPlaying}
                dragMomentum={false}
                onDragEnd={(_, info) => {
                  const pitchRect = document.getElementById('tactical-pitch')?.getBoundingClientRect();
                  if (pitchRect) {
                    const x = ((info.point.x - pitchRect.left) / pitchRect.width) * 100;
                    const y = ((info.point.y - pitchRect.top) / pitchRect.height) * 100;
                    setPlayerPositions(prev => ({
                      ...prev,
                      [player.number]: { x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) }
                    }));
                  }
                }}
                layout
                animate={{ 
                  left: `${pos.x}%`, 
                  top: `${pos.y}%`,
                  y: isSelected ? [0, -4, 0] : 0,
                  scale: isSelected || isFocused ? 1.3 : 1,
                  opacity: isPlaying && activeStep?.focusPlayers && !isFocused ? 0.3 : 1,
                  zIndex: isSelected || isFocused ? 40 : 10
                }}
                transition={{ 
                  left: isPlaying ? { duration: 1.2, ease: "easeInOut" } : { type: 'spring', damping: 20, stiffness: 80, mass: 0.5 },
                  top: isPlaying ? { duration: 1.2, ease: "easeInOut" } : { type: 'spring', damping: 20, stiffness: 80, mass: 0.5 },
                  y: { repeat: Infinity, duration: 2, ease: "easeInOut" },
                  scale: { type: 'spring', damping: 15, stiffness: 100 }
                }}
                onClick={() => handlePlayerSelect(player.number)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handlePlayerSelect(player.number);
                  }
                }}
                role="button"
                tabIndex={0}
                aria-label={`Player ${player.number}: ${player.label}`}
                className="absolute -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex flex-col items-center justify-center cursor-pointer transition-all duration-300 focus:outline-none"
              >
                <div className="relative">
                  <PlayerPiece 
                    number={player.number}
                    type={player.number === 1 ? 'pfc_gk' : 'pfc_player'}
                    isSelected={isSelected}
                    isFocused={isFocused}
                  />
                  {/* Transition Intensity Visual (Sprint/Counter-press) */}
                  {isTransitionMoment && isPlaying && isFocused && (
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: [1, 2], opacity: [0.6, 0] }}
                      transition={{ duration: 1, repeat: Infinity }}
                      className={`absolute inset-0 rounded-full blur-[2px] ${moment === 'trans-def' ? 'bg-red-500' : 'bg-amber-500'}`}
                    />
                  )}
                </div>
                <span className={`text-[5px] font-black uppercase mt-1 transition-all
                  ${isSelected ? 'text-amber-500 scale-110' : 'text-stone-500 group-hover:text-stone-300'}`}>
                  {player.label}
                </span>
              </motion.div>
            );
          })}

          {/* Tactical Ball */}
          <motion.div
            layoutId="ball"
            drag={!isPlaying && !selectedId}
            dragMomentum={false}
            onDrag={(e) => {
                if (selectedId) return;
                const coords = getPitchCoords(e as any);
                if (coords) setManualBallPos(coords);
            }}
            animate={{ 
              left: activeStep?.ballPath ? activeStep.ballPath.map(p => `${p.x}%`) : (selectedId ? `${ballPos.x + 1.8}%` : `${ballPos.x}%`), 
              top: activeStep?.ballPath ? activeStep.ballPath.map(p => `${p.y}%`) : (selectedId ? `${ballPos.y + 1.8}%` : `${ballPos.y}%`), 
              rotate: isPlaying ? stepIndex * 360 : 0,
              scale: isPlaying || selectedId ? [1, 1.4, 1.2] : 1,
              opacity: 1,
              filter: isTransitionMoment ? 'drop-shadow(0 0 8px rgba(239,68,68,0.8))' : 'none'
            }}
            transition={{ 
              type: 'spring', 
              damping: 30, 
              stiffness: 70, 
              mass: 0.8,
              scale: { duration: 0.3, repeat: isPlaying ? Infinity : 0 },
              left: { duration: isPlaying ? 1.2 : 0.4, ease: "easeInOut" },
              top: { duration: isPlaying ? 1.2 : 0.4, ease: "easeInOut" }
            }}
            className="absolute -translate-x-1/2 -translate-y-1/2 w-5 h-5 z-[60] flex items-center justify-center cursor-grab active:cursor-grabbing"
          >
            <div className="relative">
              {isPlaying && (
                <motion.div 
                  animate={{ scale: [1, 2], opacity: [0.5, 0] }}
                  transition={{ repeat: Infinity, duration: 1 }}
                  className="absolute inset-0 bg-amber-500 rounded-full blur-sm"
                />
              )}
              <PlayerPiece type="ball" number="" />
            </div>
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
            <div className="flex items-center justify-between mb-4 mt-2">
              <h4 className="text-[10px] font-black text-amber-500 uppercase tracking-widest flex items-center gap-2">
                <Info size={14} /> Fundamental Principles
              </h4>
              <div className="flex gap-1">
                <button 
                  onClick={() => setPracticeType('match')}
                  className={`px-2 py-1 rounded text-[8px] font-black transition-all ${practiceType === 'match' ? 'bg-stone-100 text-stone-900' : 'bg-stone-800 text-stone-500'}`}
                >MATCH</button>
                <button 
                  onClick={() => setPracticeType('functional')}
                  className={`px-2 py-1 rounded text-[8px] font-black transition-all ${practiceType === 'functional' ? 'bg-amber-500 text-stone-950' : 'bg-stone-800 text-stone-500'}`}
                >FUNCTIONAL</button>
              </div>
            </div>

            {practiceType === 'functional' ? (
              <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl mb-4">
                <p className="text-[10px] font-black text-amber-500 uppercase mb-2">Functional Activity Focus</p>
                <p className="text-[11px] text-stone-300 leading-relaxed italic">
                   Developing understanding of attacking/defending roles in a specific area (Central vs Wide). 
                   Only primary and secondary units involved in the tactical problem.
                </p>
              </div>
            ) : (
              <ul className="space-y-3 mb-4">
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
            )}

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
                    <p className="text-[10px] text-stone-500 uppercase font-bold tracking-widest">Live AI Analysis</p>
                  </div>
                </div>
                <div className="min-h-[60px] flex items-center">
                  {isAiLoading ? (
                    <div className="flex gap-1">
                      <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1 h-1 bg-amber-500 rounded-full" />
                      <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1 h-1 bg-amber-500 rounded-full" />
                      <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1 h-1 bg-amber-500 rounded-full" />
                    </div>
                  ) : (
                    <p className="text-[11px] text-stone-300 italic leading-relaxed">
                      {aiAnnotation || "Select a player to receive live tactical analysis from Coach Darren's Game Model."}
                    </p>
                  )}
                </div>
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
                <Target size={12} /> 
                Live Geography: {currentPos ? (() => {
                  const z = Math.max(1, Math.min(4, Math.ceil(4 - currentPos.y / 25)));
                  const ch = currentPos.x < 16.6 ? 1 : 
                             currentPos.x < 33.3 ? 2 : 
                             currentPos.x < 50 ? 3 : 
                             currentPos.x < 66.6 ? 3 : 
                             currentPos.x < 83.3 ? 2 : 1;
                  return `Zone ${z} / Channel ${ch}`;
                })() : 'Scanning...'}
              </div>
              <div className="px-3 py-1 bg-stone-800 rounded flex items-center gap-2 border border-stone-700">
                <div className="w-1.5 h-1.5 rounded-full bg-stone-500" />
                <span className="text-[8px] text-stone-400 font-black uppercase tracking-widest">Set Pieces</span>
              </div>
            </div>

            <div className="mt-4 p-4 bg-stone-900/50 border border-stone-800 rounded-xl space-y-4">
              <div className="flex items-center justify-between">
                <h5 className="text-[9px] font-black text-amber-500 uppercase tracking-widest flex items-center gap-2">
                  <Info size={12} /> Framework Definitions
                </h5>
                <span className="text-[7px] text-stone-600 font-black uppercase ring-1 ring-stone-800 px-1.5 py-0.5 rounded">Whole-Part-Whole</span>
              </div>
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
                <div>
                  <p className="text-[8px] font-black text-stone-300 uppercase tracking-tighter mb-0.5">Skill Set</p>
                  <p className="text-[9px] text-stone-500 leading-tight">Solving game problems using soccer actions in the right place at the right time.</p>
                </div>
              </div>
            </div>

            <div className="mt-2 p-4 bg-stone-900 border border-stone-800 rounded-xl">
              <h5 className="text-[9px] font-black text-stone-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                <Target size={12} /> Tactical Notation
              </h5>
              <div className="grid grid-cols-1 gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-0.5 bg-amber-500" />
                  <span className="text-[9px] text-stone-400 font-black uppercase tracking-widest">Pass / Shot</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-0.5 border-b border-dashed border-stone-400" />
                  <span className="text-[9px] text-stone-400 font-black uppercase tracking-widest">Player Movement</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-3 flex items-center">
                    <svg viewBox="0 0 40 10" className="w-full h-full">
                      <path d="M 0 5 Q 10 0 20 5 Q 30 10 40 5" fill="none" stroke="#4ade80" strokeWidth="2" strokeDasharray="2 2" />
                    </svg>
                  </div>
                  <span className="text-[9px] text-stone-400 font-black uppercase tracking-widest">Dribbling Intent</span>
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
