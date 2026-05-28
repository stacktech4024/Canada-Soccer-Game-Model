import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { SQUAD, PRINCIPLES, OPPONENTS, Moment, SEQUENCES, TacticalStep, FORMATIONS, OpponentRole } from '../data/tactics';
import { players } from '../data/players';
import { Settings2, RotateCcw, LayoutGrid, ShieldAlert, Zap, Info, Target, Users, Play, Pause, MousePointer2, Pencil } from 'lucide-react';
import { getScenarioMotionStep } from '../data/scenarioMotion';
import { getBallTransition, getMotionProfile, inferMotionRole, MovementIntent } from '../utils/motionRealism';

import { getTacticalAnalysis } from '../services/geminiService';
import { PlayerPiece } from './PlayerPiece';
import { PitchBackground } from './PitchBackground';  // ADD THIS IMPORT
import { LiveTacticalOverlays } from './LiveTacticalOverlays';

const UnitLinks: React.FC<{ players: number[], positions: Record<number, { x: number; y: number }>, color: string, strokeWidth?: number }> = ({ players, positions, color, strokeWidth = 0.5 }) => {
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

const getOpponentReactionLabel = (reaction: 'hold' | 'shift' | 'press' | 'drop' | 'recover') => {
  switch (reaction) {
    case 'press':
      return 'Press';
    case 'drop':
      return 'Drop';
    case 'recover':
      return 'Recover';
    case 'shift':
      return 'Shift';
    default:
      return 'Hold';
  }
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

  // Passing animation state (ball moves while not playing)
  const [passInProgress, setPassInProgress] = useState(false);
  const [passFromId, setPassFromId] = useState<number | null>(null);
  const [passToId, setPassToId] = useState<number | null>(null);
  const [passStartAt, setPassStartAt] = useState<number | null>(null);
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

  // Shooting animation state
  const [shooting, setShooting] = useState(false);
  const [goalTarget, setGoalTarget] = useState<{ x: number; y: number } | null>(null);


  // Auto-switch formations and reset ball on moment change
  useEffect(() => {
    const formationKey = moment === 'att-org' ? '1-4-3-3' : (moment.includes('att') ? '1-4-4-2' : '1-4-2-3-1');
    if (!isPlaying) {
      applyFormation(formationKey);
      setManualBallPos(null);
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
  const activeMotionStep = isPlaying ? getScenarioMotionStep(moment, stepIndex) : null;
  const sidebarMotionStep = getScenarioMotionStep(moment, isPlaying ? stepIndex : 0);
  const isGoalStep = activeStep?.label.toUpperCase().includes('GOAL');
  const isTransitionMoment = moment === 'trans-att' || moment === 'trans-def';
  const ballTransition = getBallTransition(activeMotionStep?.ballAction ?? 'pass');

  const getBallPos = (playersMap?: Record<number, { x: number; y: number }>) => {
    // Priority 1: Animated sequence ball path
    if (isPlaying && activeStep?.ballPath && activeStep.ballPath.length > 0) {
      const stepBall = activeStep.ballPath[stepIndex % activeStep.ballPath.length];
      if (stepBall) {
        // Clamp to field boundaries
        return {
          x: Math.min(96, Math.max(4, stepBall.x)),
          y: Math.min(112, Math.max(4, stepBall.y))
        };
      }
    }

    if (isPlaying && activeStep?.ballPos) {
      return {
        x: Math.min(96, Math.max(4, activeStep.ballPos.x)),
        y: Math.min(112, Math.max(4, activeStep.ballPos.y))
      };
    }

    // Priority 2: Ball stays with selected player (possession)
    if (passInProgress && !isPlaying && passFromId !== null && passToId !== null) {
      const fromPos = playersMap?.[passFromId] ?? customPositions[passFromId] ?? { x: 50, y: 70 };
      const toPos = playersMap?.[passToId] ?? customPositions[passToId] ?? { x: 50, y: 70 };

      const now = Date.now();
      const start = passStartAt ?? now;
      if (passStartAt === null) setPassStartAt(start);

      const t = Math.min(1, Math.max(0, (now - start) / 300));
      // easeInOut
      const easedT = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

      // Ball offset slightly in front of receiver direction
      const x = fromPos.x + (toPos.x - fromPos.x) * easedT;
      const y = fromPos.y + (toPos.y - fromPos.y) * easedT;

      return {
        x: Math.min(96, Math.max(4, x)),
        y: Math.min(112, Math.max(8, y))
      };
    }

    if (selectedId && !isPlaying) {
      const playerPos = playersMap ? playersMap[selectedId] : (customPositions[selectedId] || { x: 50, y: 70 });
      const isAttacking = moment.includes('att');
      const offsetY = isAttacking ? -2 : 1.5;
      const offsetX = (playerPos.x - 50) * 0.1;
      // Clamp to field boundaries - keep ball ON the field
      return {
        x: Math.min(96, Math.max(4, playerPos.x + offsetX)),
        y: Math.min(112, Math.max(8, playerPos.y + offsetY))
      };
    }

    // Priority 3: Manually dragged ball position - clamp to field
    if (manualBallPos) {
      return {
        x: Math.min(96, Math.max(4, manualBallPos.x)),
        y: Math.min(112, Math.max(8, manualBallPos.y))
      };
    }

    // Priority 4: Default ball position based on tactical moment
    const defaultPositions: Record<Moment, { x: number; y: number }> = {
      'att-org': { x: 50, y: 88 },
      'def-org': { x: 50, y: 28 },
      'trans-att': { x: 50, y: 55 },
      'trans-def': { x: 50, y: 48 },
      'set-pieces': { x: 88, y: 12 }
    };

    const defaultPos = defaultPositions[moment] || { x: 50, y: 60 };
    return {
      x: Math.min(96, Math.max(4, defaultPos.x)),
      y: Math.min(112, Math.max(8, defaultPos.y))
    };
  };

  const distanceToSegment = (p: { x: number; y: number }, v: { x: number; y: number }, w: { x: number; y: number }) => {
    const l2 = Math.pow(v.x - w.x, 2) + Math.pow(v.y - w.y, 2);
    if (l2 === 0) return Math.sqrt(Math.pow(p.x - v.x, 2) + Math.pow(p.y - v.y, 2));
    let t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
    t = Math.max(0, Math.min(1, t));
    return Math.sqrt(Math.pow(p.x - (v.x + t * (w.x - v.x)), 2) + Math.pow(p.y - (v.y + t * (w.y - v.y)), 2));
  };

  const getActivePositions = (opps: any[]) => {
    const base = { ...customPositions };
    const stepOverrides = activeStep?.playerPositions || {};

    let merged = {
      ...base,
      ...stepOverrides
    };

    if (!isPlaying) {
      const ballPosForMovement = getBallPos(merged);
      const isAttacking = moment.includes('att');

      const idealPositions = SQUAD.reduce((acc, player) => {
        acc[player.number] = player.positions[moment];
        return acc;
      }, {} as Record<number, { x: number; y: number }>);

      const teamCenter = Object.values(merged).reduce(
        (acc, p) => ({
          x: acc.x + p.x / Object.keys(merged).length,
          y: acc.y + p.y / Object.keys(merged).length
        }),
        { x: 0, y: 0 }
      );

      Object.keys(merged).forEach((id) => {
        const pid = Number(id);
        const ideal = idealPositions[pid];
        const current = merged[pid];
        if (!ideal || !current) return;

        // Natural drift towards ideal position
        let newX = current.x + (ideal.x - current.x) * 0.06;
        let newY = current.y + (ideal.y - current.y) * 0.06;

        const hasBall = (pid === selectedId && !manualBallPos);

        // Ball carrier: move slightly ahead, slower
        if (hasBall) {
          const opponentGoalY = isAttacking ? 15 : 85; // attacking = go up, defending = go down
          newY += (opponentGoalY - newY) * 0.04;
          newX += (ideal.x - newX) * 0.03;
        }


        // Team shifting: all players move slightly towards ball (defensive) or forward (attacking)
        if (!hasBall) {
          const influence = 0.05;
          if (moment === 'def-org') {
            newX += (ballPosForMovement.x - newX) * influence;
            newY += (ballPosForMovement.y - newY) * influence;
          } else if (isAttacking) {
            // Support runs: move forward if ball is advanced
            newY -= (ballPosForMovement.y - 50) * 0.03;
          }
        }

        // Defensive drop: if ball is behind, defenders push deeper
        if (moment === 'def-org' && pid !== 1 && ballPosForMovement.y > 60 && newY < 70) {
          newY += 1.5; // drop back
        }


        // Attacking box occupancy
        if (isAttacking && (pid === 9 || pid === 11)) {
          const ballX = ballPosForMovement.x;
          const ballY = ballPosForMovement.y;
          if (ballY < 25) {
            if (pid === 9) {
              // Center forward attacks near post
              newX = 50 + (ballX - 50) * 0.3;
              newY = 15;
            } else if (pid === 11) {
              // Left winger attacks far post
              newX = ballX > 50 ? 20 : 80;
              newY = 18;
            }
          }
        }

        // Keep players inside field
        merged[pid] = {
          x: Math.min(96, Math.max(4, newX)),
          y: Math.min(112, Math.max(8, newY))
        };

        // Optional centering: preserve shape compactness
        const distToCenter = Math.hypot(merged[pid].x - teamCenter.x, merged[pid].y - teamCenter.y);
        if (distToCenter > 40) {
          merged[pid] = {
            x: teamCenter.x + (merged[pid].x - teamCenter.x) * 0.92,
            y: teamCenter.y + (merged[pid].y - teamCenter.y) * 0.92
          };
        }

        // Preserve existing defensive/offside safety for non-ball carriers
        if (isAttacking && pid !== 1 && !hasBall) {
          const opponentDefenders = opps.filter(o => o.role === 'DEF');
          const lastDefenderY = opponentDefenders.length > 0 ? Math.min(...opponentDefenders.map(d => d.y)) : 12;
          if (merged[pid].y < lastDefenderY + 3) merged[pid].y = lastDefenderY + 3;
        }

        if (moment === 'def-org' && pid === 9 && ballPosForMovement.y < 40) {
          merged[pid] = {
            x: ballPosForMovement.x,
            y: ballPosForMovement.y + 10
          };
        }

        // Final clamp after adjustments
        merged[pid] = {
          x: Math.min(96, Math.max(4, merged[pid].x)),
          y: Math.min(112, Math.max(8, merged[pid].y))
        };
      });
    }

    return merged;
  };

  const getOpponentPositions = (currentBall: { x: number; y: number }) => {
    return OPPONENTS.map((opp) => {
      const basePos = activeStep?.opponentPositions?.[opp.id] || opp;
      if (isPlaying) {
        const reaction = activeMotionStep?.opponentReaction ?? 'hold';
        let reactiveX = basePos.x;
        let reactiveY = basePos.y;
        const toBallX = currentBall.x - basePos.x;
        const toBallY = currentBall.y - basePos.y;

        if (reaction === 'press') {
          reactiveX += toBallX * 0.18;
          reactiveY += toBallY * 0.18;
        } else if (reaction === 'shift') {
          reactiveX += toBallX * 0.22;
          reactiveY += toBallY * 0.08;
        } else if (reaction === 'drop') {
          reactiveY -= 3.5;
          reactiveX += toBallX * 0.08;
        } else if (reaction === 'recover') {
          reactiveX += (opp.x - basePos.x) * 0.25;
          reactiveY += (opp.y - basePos.y) * 0.25;
        }

        return {
          ...opp,
          x: Math.max(5, Math.min(95, reactiveX)),
          y: Math.max(2, Math.min(95, reactiveY))
        };
      }

      const ballX = currentBall.x;
      const ballY = currentBall.y;
      
      let shiftedX = basePos.x;
      let shiftedY = basePos.y;

      const horizontalShift = (ballX - 50) * 0.4;
      const verticalShift = (ballY - 60) * 0.2;

      shiftedX += horizontalShift;
      shiftedY += verticalShift;

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


  const initialBallPos = getBallPos(customPositions);
  const opponentPositionsDraft = getOpponentPositions(initialBallPos);
  const activePositions = getActivePositions(opponentPositionsDraft);

  // Ball carrier: only when ball is effectively with a selected player
  const ballCarrierId = selectedId && !manualBallPos && !passInProgress ? selectedId : null;

  // Auto-shoot when selected carrier is in opponent box
  useEffect(() => {
    if (!ballCarrierId || isPlaying || passInProgress) return;

    const pos = activePositions[ballCarrierId];
    if (!pos) return;

    // If carrier is inside opponent penalty area (y < 25) and not already shooting
    if (pos.y < 25 && !shooting) {
      setShooting(true);
      setGoalTarget({ x: 50, y: 5 }); // top goal center

      const t = window.setTimeout(() => {
        setShooting(false);
        setGoalTarget(null);
      }, 600);

      return () => window.clearTimeout(t);
    }
  }, [ballCarrierId, activePositions, isPlaying, passInProgress, shooting]);


  const ballPos = getBallPos(activePositions);
  const opponentPositions = getOpponentPositions(ballPos);

  const currentPos = selectedId ? activePositions[selectedId] : null;
  const prevPos = prevSelectedId ? activePositions[prevSelectedId] : null;

  const [practiceType, setPracticeType] = useState<'match' | 'functional'>('match');

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
      }, activeMotionStep?.stepDurationMs ?? 3500);
    }
    return () => clearTimeout(timer);
  }, [isPlaying, stepIndex, sequence, activeMotionStep?.stepDurationMs]);

  const handlePlayerSelect = (id: number) => {
    if (isPlaying || isDrawingMode) return;
    if (selectedId !== null && selectedId !== id) {
      // Passing: animate ball from current player to new player
      setPrevSelectedId(selectedId);
      setSelectedId(id);
      // pass animation is driven by pass state in getBallPos
      setPassInProgress(true);
      setPassStartAt(Date.now());
      setPassFromId(selectedId);
      setPassToId(id);
      setTimeout(() => {
        setPassInProgress(false);
        setPassFromId(null);
        setPassToId(null);
        setPassStartAt(null);
      }, 300);
      return;
    }

    setPrevSelectedId(selectedId);
    setSelectedId(id);
    // if clicking same/empty, cancel any pass
    if (passInProgress) {
      setPassInProgress(false);
      setPassFromId(null);
      setPassToId(null);
      setPassStartAt(null);
    }
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
          className={`relative aspect-[100/120] rounded-2xl border-stone-800 border-4 overflow-hidden shadow-2xl group ${isDrawingMode ? 'cursor-crosshair' : ''}`}
        >
          {/* Realistic Green Pitch Background */}
          <PitchBackground showGrid={showGrid} moment={moment} />

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
                className="absolute inset-0 flex items-center justify-center z-[100] pointer-events-none bg-black/40 backdrop-blur-sm"
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

          {/* Soccer Field Markings - White Lines */}
          <svg viewBox="0 0 100 120" className="absolute inset-0 w-full h-full pointer-events-none z-10">
            {/* Outer boundary */}
            <rect x="4" y="4" width="92" height="112" fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="0.6" />
            
            {/* Halfway line */}
            <line x1="4" y1="60" x2="96" y2="60" stroke="rgba(255,255,255,0.8)" strokeWidth="0.5" />
            
            {/* Center circle */}
            <circle cx="50" cy="60" r="10" fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="0.5" />
            
            {/* Center spot */}
            <circle cx="50" cy="60" r="0.8" fill="rgba(255,255,255,0.9)" />
            
            {/* Penalty areas */}
            <rect x="25" y="4" width="50" height="18" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="0.5" />
            <rect x="25" y="98" width="50" height="18" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="0.5" />
            
            {/* Goal areas */}
            <rect x="38" y="4" width="24" height="6" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="0.4" />
            <rect x="38" y="110" width="24" height="6" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="0.4" />
            
            {/* Penalty spots */}
            <circle cx="50" cy="16" r="0.5" fill="rgba(255,255,255,0.8)" />
            <circle cx="50" cy="104" r="0.5" fill="rgba(255,255,255,0.8)" />
            
            {/* Corner arcs */}
            <path d="M 4 4 A 3 3 0 0 1 7 1" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="0.4" />
            <path d="M 96 4 A 3 3 0 0 0 99 7" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="0.4" />
            <path d="M 4 116 A 3 3 0 0 0 7 119" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="0.4" />
            <path d="M 96 116 A 3 3 0 0 1 99 113" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="0.4" />
          </svg>

          {/* Grid Framework (Zones & Channels) - Optional overlay */}
          <AnimatePresence>
            {showGrid && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 pointer-events-none z-20"
              >
                {/* Horizontal Zones 1-4 */}
                <div className="absolute inset-x-0 top-[25%] h-px bg-amber-500/20" />
                <div className="absolute inset-x-0 top-[50%] h-px bg-white/30" /> 
                <div className="absolute inset-x-0 top-[75%] h-px bg-amber-500/20" />

                {/* Vertical Channels */}
                <div className="absolute inset-y-0 left-[20%] w-px bg-white/10" />
                <div className="absolute inset-y-0 left-[40%] w-px bg-white/15" />
                <div className="absolute inset-y-0 left-[60%] w-px bg-white/15" />
                <div className="absolute inset-y-0 left-[80%] w-px bg-white/10" />

                {/* Grid Labels */}
                <div className="absolute top-1.5 left-0 right-0 flex justify-around px-2 font-mono text-[6px] text-white/40 font-bold uppercase tracking-[0.2em]">
                   <span>LEFT</span><span>L HALF</span><span>CENTRAL</span><span>R HALF</span><span>RIGHT</span>
                </div>
                <div className="absolute inset-y-0 right-4 flex flex-col justify-around py-4 z-50">
                   {[
                     { l: 'Z4: PENETRATE', c: 'bg-red-600/80' },
                     { l: 'Z3: SUPPLY', c: 'bg-amber-600/80' },
                     { l: 'Z2: UNBALANCE', c: 'bg-stone-700/80' },
                     { l: 'Z1: BUILD UP', c: 'bg-stone-800/80' }
                   ].map((z, i) => (
                     <div key={i} className={`${z.c} text-white px-2 py-0.5 rounded-sm text-[7px] font-black shadow-lg flex items-center gap-1`}>
                       {z.l}
                     </div>
                   ))}
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

          {/* Strategic Graphics SVG Overlay */}
          <svg viewBox="0 0 100 120" className="absolute inset-0 w-full h-full pointer-events-none z-15">
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

            {/* Opponent Defensive Line */}
            <AnimatePresence>
              {(moment.includes('att') || moment === 'trans-att') && !isPlaying && (
                <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  {(() => {
                    const defs = opponentPositions.filter(o => o.role === 'DEF');
                    const lastDefY = Math.min(...defs.map(d => d.y));
                    return (
                      <>
                        <line x1="5" y1={lastDefY} x2="95" y2={lastDefY} stroke="#ef4444" strokeWidth="0.4" strokeDasharray="2 2" opacity="0.5" />
                        <text x="7" y={lastDefY - 1} fontSize="2.5" fill="#ef4444" fontWeight="black" opacity="0.7">OFFSIDE LINE</text>
                      </>
                    );
                  })()}
                </motion.g>
              )}
            </AnimatePresence>

            {/* Goal Nets */}
            <g opacity="0.5">
              <path d="M 42 2 L 42 5 L 40 7 L 38 5 L 38 2 Z" fill="none" stroke="#fff" strokeWidth="0.3" strokeDasharray="0.5 0.5" />
              <path d="M 58 2 L 58 5 L 60 7 L 62 5 L 62 2 Z" fill="none" stroke="#fff" strokeWidth="0.3" strokeDasharray="0.5 0.5" />
              <path d="M 42 118 L 42 115 L 40 113 L 38 115 L 38 118 Z" fill="none" stroke="#fff" strokeWidth="0.3" strokeDasharray="0.5 0.5" />
              <path d="M 58 118 L 58 115 L 60 113 L 62 115 L 62 118 Z" fill="none" stroke="#fff" strokeWidth="0.3" strokeDasharray="0.5 0.5" />
            </g>

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

          <LiveTacticalOverlays
            moment={moment}
            isPlaying={isPlaying}
            activeStep={activeStep}
            activeMotionStep={activeMotionStep}
            activePositions={activePositions}
            homeBasePositions={customPositions}
            ballPos={ballPos}
            opponentPositions={opponentPositions}
          />

          {/* Opponent Layer */}
          {opponentPositions.map((opp) => {
            return (
              <motion.div 
                key={`opp-${opp.id}`}
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

          {/* Home Team Layer */}
          {SQUAD.map((player) => {
            const pos = activePositions[player.number] || { x: 0, y: 0 };
            const isSelected = selectedId === player.number;
            const isFocused = activeStep?.focusPlayers?.includes(player.number);
            const playerRole = inferMotionRole(player.label, player.number);
            const movementIntent: MovementIntent = activeMotionStep?.movementIntents?.[player.number] || (isFocused ? 'support' : 'hold');
            const movementProfile = getMotionProfile(playerRole, movementIntent, isFocused);
            const movementEase = movementIntent === 'press' || movementIntent === 'recover' ? 'easeOut' : 'easeInOut';

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
                  left: isPlaying
                    ? { duration: movementProfile.durationMs / 1000, delay: movementProfile.delayMs / 1000, ease: movementEase }
                    : { type: 'spring', damping: 18, stiffness: 65, mass: 0.8 },
                  top: isPlaying
                    ? { duration: movementProfile.durationMs / 1000, delay: movementProfile.delayMs / 1000, ease: movementEase }
                    : { type: 'spring', damping: 18, stiffness: 65, mass: 0.8 },
                  y: { repeat: isSelected ? Infinity : 0, duration: 1.8, ease: "easeInOut" },
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
                className="absolute -translate-x-1/2 -translate-y-1/2 w-8 h-8 z-20 cursor-pointer"
              >
                <div className="relative">
                  <PlayerPiece 
                    number={player.number}
                    type={player.number === 1 ? 'pfc_gk' : 'pfc_player'}
                    isSelected={isSelected}
                    isFocused={isFocused}
                  />
                  {isTransitionMoment && isPlaying && isFocused && (
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: [1, 2], opacity: [0.6, 0] }}
                      transition={{ duration: 1, repeat: Infinity }}
                      className={`absolute inset-0 rounded-full blur-[2px] ${moment === 'trans-def' ? 'bg-red-500' : 'bg-amber-500'}`}
                    />
                  )}
                </div>
                <span className={`text-[5px] font-black uppercase mt-1 block text-center
                  ${isSelected ? 'text-amber-500 scale-110' : 'text-white/60'}`}>
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
            onDrag={(e, info) => {
              if (selectedId) return;
              const coords = getPitchCoords(e as any);
              if (coords) {
                // Clamp to field boundaries (prevents dragging the ball off the pitch)
                setManualBallPos({
                  x: Math.min(96, Math.max(4, coords.x)),
                  y: Math.min(112, Math.max(8, coords.y))
                });
              }
            }}
            animate={{ 
              left: shooting && goalTarget ? `${goalTarget.x}%` : `${ballPos.x}%`, 
              top: shooting && goalTarget ? `${goalTarget.y}%` : `${ballPos.y}%`, 
              rotate: isPlaying
                ? (activeMotionStep?.ballAction === 'shot' ? stepIndex * 540 : activeMotionStep?.ballAction === 'cross' ? stepIndex * 280 : stepIndex * 200)
                : (selectedId ? 360 : 0),
              scale: isPlaying || selectedId ? [1, 1.3, 1.1] : 1,
              opacity: 1,
              filter: isTransitionMoment ? 'drop-shadow(0 0 8px rgba(239,68,68,0.8))' : 'none'
            }}
            transition={{ 
              type: 'spring', 
              damping: 20, 
              stiffness: 60, 
              mass: 0.6,
              scale: { duration: 0.3, repeat: isPlaying ? Infinity : (selectedId ? Infinity : 0), repeatType: "reverse" },
              left: isPlaying
                ? { duration: ballTransition.duration, ease: ballTransition.ease }
                : { type: 'spring', damping: 18, stiffness: 55 },
              top: isPlaying
                ? { duration: ballTransition.duration, ease: ballTransition.ease }
                : { type: 'spring', damping: 18, stiffness: 55 }
            }}
            className="absolute -translate-x-1/2 -translate-y-1/2 w-5 h-5 z-[60] cursor-grab active:cursor-grabbing"
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

      {/* Sidebar - Restored AI Analysis Section */}
      <div className="w-full lg:w-96 flex flex-col gap-6">
        {/* Sidebar Analysis (Game Model Principles) */}
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
            {/* Fundamental Principles */}
            <div>
              <h4 className="text-[10px] font-black text-amber-500 uppercase tracking-widest flex items-center gap-2 mb-3">
                <Info size={14} /> Fundamental Principles
              </h4>
              <ul className="space-y-2">
                {PRINCIPLES[moment].keys.map((key, i) => (
                  <motion.li 
                    key={`${moment}-${key}`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-start gap-2 text-xs text-stone-300"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500/50 mt-1" />
                    {key}
                  </motion.li>
                ))}
              </ul>
            </div>

            {sidebarMotionStep && (
              <motion.div
                key={`${moment}-motion-note-${isPlaying ? stepIndex : 0}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-blue-500/10 rounded-xl border border-blue-500/30"
              >
                <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2">Motion Coaching Note</h4>
                <p className="text-xs text-stone-300 leading-relaxed">{sidebarMotionStep.coachingNote}</p>
                <div className="mt-3 flex flex-wrap gap-2 text-[9px] font-black uppercase tracking-widest">
                  <span className="px-2 py-1 rounded-full bg-amber-500/15 text-amber-400">Ball: {sidebarMotionStep.ballAction}</span>
                  <span className="px-2 py-1 rounded-full bg-red-500/15 text-red-400">Reaction: {getOpponentReactionLabel(sidebarMotionStep.opponentReaction)}</span>
                  <span className="px-2 py-1 rounded-full bg-stone-700 text-stone-200">Step: {sidebarMotionStep.stepDurationMs}ms</span>
                </div>
              </motion.div>
            )}

            {/* AI ANALYSIS SECTION - This is what shows player insights */}
            {selectedId && (
              <motion.div 
                key={`sidebar-${selectedId}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-amber-500/10 rounded-xl border border-amber-500/30"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center text-stone-950 font-black">
                    {selectedId}
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-white">{SQUAD.find(p => p.number === selectedId)?.role}</h4>
                    <p className="text-[9px] text-amber-500 uppercase font-bold">AI Tactical Analysis</p>
                  </div>
                </div>
                <div className="min-h-[60px]">
                  {isAiLoading ? (
                    <div className="flex gap-1 py-2">
                      <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                      <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse delay-150" />
                      <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse delay-300" />
                    </div>
                  ) : (
                    <p className="text-sm text-stone-300 leading-relaxed italic">
                      {aiAnnotation || "Select a player to receive AI tactical analysis"}
                    </p>
                  )}
                </div>
              </motion.div>
            )}

            {/* Live Geography */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[10px] text-stone-500 font-bold uppercase">
                <Target size={12} /> 
                Live Geography: {currentPos ? (() => {
                  const z = Math.max(1, Math.min(4, Math.ceil(4 - currentPos.y / 25)));
                  return `Zone ${z}`;
                })() : '—'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};