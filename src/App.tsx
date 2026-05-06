import { useState, useRef, useEffect } from 'react';
import { LandingPage } from './components/LandingPage';
import { Scoreboard } from './components/Scoreboard';
import { Sticker } from './components/Sticker';
import { CARDS } from './data/cards';
import type { Card } from './data/cards';
import { Button } from './components/ui/Button';
import { motion, AnimatePresence } from 'framer-motion';

function App() {
  const [gameState, setGameState] = useState<'landing' | 'playing'>('landing');
  const [playerHand, setPlayerHand] = useState<Card[]>([]);
  const cpuHandRef = useRef<Card[]>([]);
  const [playedCards, setPlayedCards] = useState<(Card & { rotation: number; x: number; y: number; owner: 'player' | 'cpu'; instanceId: string })[]>([]);
  const [score, setScore] = useState({ player: 0, cpu: 0 });
  const [isCpuThinking, setIsCpuThinking] = useState(false);
  const [activeCall, setActiveCall] = useState<{ text: string; id: number; color: string } | null>(null);
  const [isRoundEnding, setIsRoundEnding] = useState(false);
  const [isCooldown, setIsCooldown] = useState(false);
  const cpuMoveTimeoutRef = useRef<any>(null);
  const interactionLockRef = useRef(false);

  // Truco & Envido State
  const [trucoState, setTrucoState] = useState({ level: 0, caller: null as 'player' | 'cpu' | null, status: 'none' as 'none' | 'pending' | 'accepted' });
  const [envidoState, setEnvidoState] = useState({ level: 0, caller: null as 'player' | 'cpu' | null, status: 'none' as 'none' | 'pending' | 'accepted' | 'finished' });
  const [pendingAction, setPendingAction] = useState<{ type: 'truco' | 'envido'; level: number; caller: 'player' | 'cpu' } | null>(null);
  const [handWinners, setHandWinners] = useState<('player' | 'cpu' | 'draw')[]>([]);

  const isBusy = isCpuThinking || isRoundEnding || isCooldown || (pendingAction !== null && pendingAction.caller === 'cpu');

  const startCooldown = (ms: number = 1000) => {
    setIsCooldown(true);
    setTimeout(() => setIsCooldown(false), ms);
  };

  const resetRound = () => {
    if (cpuMoveTimeoutRef.current) {
      clearTimeout(cpuMoveTimeoutRef.current);
      cpuMoveTimeoutRef.current = null;
    }
    interactionLockRef.current = false;
    setIsCpuThinking(false);
    setIsRoundEnding(false);
    setIsCooldown(false);
    setTrucoState({ level: 0, caller: null, status: 'none' });
    setEnvidoState({ level: 0, caller: null, status: 'none' });
    setPendingAction(null);
    setHandWinners([]);
    setPlayedCards([]);
    setPlayerHand(CARDS.slice(0, 3));
    cpuHandRef.current = CARDS.slice(3, 6);
  };

  const timersRef = useRef<any[]>([]);

  // Monitor round and hand winners
  useEffect(() => {
    // 1. Determine hand winner when 2 cards are played for the hand
    if (playedCards.length > 0 && playedCards.length % 2 === 0) {
      const lastTwo = playedCards.slice(-2);
      const playerCard = lastTwo.find(c => c.owner === 'player');
      const cpuCard = lastTwo.find(c => c.owner === 'cpu');
      
      if (playerCard && cpuCard && handWinners.length < playedCards.length / 2) {
        let winner: 'player' | 'cpu' | 'draw';
        // LOWER power wins (VAL 1 > VAL 7)
        if (playerCard.power < cpuCard.power) winner = 'player';
        else if (cpuCard.power < playerCard.power) winner = 'cpu';
        else winner = 'draw';
        
        setHandWinners(prev => [...prev, winner]);
      }
    }

    // 2. Check for Round Winner (Best of 3)
    if (!isRoundEnding && handWinners.length >= 2) {
      let roundWinner: 'player' | 'cpu' | null = null;
      
      const pWins = handWinners.filter(w => w === 'player').length;
      const cWins = handWinners.filter(w => w === 'cpu').length;
      const draws = handWinners.filter(w => w === 'draw').length;
      
      // Traditional Best of 3 Logic
      if (pWins >= 2) {
        roundWinner = 'player';
      } else if (cWins >= 2) {
        roundWinner = 'cpu';
      } else if (handWinners.length === 2) {
        // Decide at 2nd hand ONLY if there was a draw or someone won both
        if (draws === 1) {
          // One won, one drew -> that winner takes the round
          if (pWins === 1) roundWinner = 'player';
          if (cWins === 1) roundWinner = 'cpu';
        } else if (draws === 2) {
          // Double draw -> keep going to 3rd hand
        }
        // If it's 1-1 (player-cpu), we don't set roundWinner, so it continues to 3rd hand.
      } else if (handWinners.length === 3) {
        // Final hand tie-breakers
        if (pWins > cWins) roundWinner = 'player';
        else if (cWins > pWins) roundWinner = 'cpu';
        else {
          // Tied in wins (e.g. draw-draw-draw or win-loss-draw)
          // Rule: Whoever won the FIRST hand wins.
          if (handWinners[0] === 'player') roundWinner = 'player';
          else if (handWinners[0] === 'cpu') roundWinner = 'cpu';
          else {
            // If 1st hand was a draw, whoever won the 2nd wins
            if (handWinners[1] === 'player') roundWinner = 'player';
            else if (handWinners[1] === 'cpu') roundWinner = 'cpu';
            else {
              // If 1st and 2nd were draws, 3rd decides
              if (handWinners[2] === 'player') roundWinner = 'player';
              else roundWinner = 'cpu'; // Default to dealer/CPU
            }
          }
        }
      }

      if (roundWinner) {
        setIsRoundEnding(true);
        interactionLockRef.current = true;
        
        const winner = roundWinner;
        
        // 1. Show Winner
        timersRef.current.push(setTimeout(() => {
          const points = trucoState.status === 'accepted' ? trucoState.level + 1 : 1;
          
          if (winner === 'player') {
            setScore(prev => ({ ...prev, player: prev.player + points }));
            triggerCall('¡GANASTE!', '#ffea00');
          } else {
            setScore(prev => ({ ...prev, cpu: prev.cpu + points }));
            triggerCall('¡CPU GANA!', 'var(--color-secondary)');
          }
        }, 500));

        // 2. Countdown sequence
        timersRef.current.push(setTimeout(() => triggerCall('PRÓXIMA EN 3...', '#ffffff'), 1500));
        timersRef.current.push(setTimeout(() => triggerCall('PRÓXIMA EN 2...', '#ffffff'), 2500));
        timersRef.current.push(setTimeout(() => triggerCall('PRÓXIMA EN 1...', '#ffffff'), 3500));
        timersRef.current.push(setTimeout(() => resetRound(), 4500));
      }
    }
  }, [playedCards.length, isRoundEnding, trucoState, handWinners]);

  const startGame = () => {
    if (cpuMoveTimeoutRef.current) clearTimeout(cpuMoveTimeoutRef.current);
    timersRef.current.forEach(clearTimeout);
    interactionLockRef.current = false;
    setGameState('playing');
    setPlayedCards([]);
    setIsCpuThinking(false);
    setIsRoundEnding(false);
    setIsCooldown(false);
    setActiveCall(null);
    setScore({ player: 0, cpu: 0 });
    setPlayerHand(CARDS.slice(0, 3)); 
    cpuHandRef.current = CARDS.slice(3, 6);
  };

  const triggerCall = (text: string, color: string = 'var(--color-primary)') => {
    const id = Date.now();
    setActiveCall({ text, id, color });
    setTimeout(() => {
      setActiveCall(prev => prev?.id === id ? null : prev);
    }, 2000);
  };

  // Reactive CPU move trigger
  useEffect(() => {
    const isOdd = playedCards.length % 2 !== 0;
    const isBoardNotFull = playedCards.length < 6;
    const lastCardWasPlayer = playedCards.length > 0 && playedCards[playedCards.length - 1].owner === 'player';
    
    // CPU leads if even number of cards and it won (or drew) last hand
    const cpuShouldLead = 
      (playedCards.length === 2 && handWinners[0] === 'cpu') ||
      (playedCards.length === 4 && handWinners[1] === 'cpu') ||
      (playedCards.length === 2 && handWinners[0] === 'draw') ||
      (playedCards.length === 4 && handWinners[1] === 'draw' && handWinners[0] === 'cpu');

    if (((isOdd && lastCardWasPlayer) || cpuShouldLead) && isBoardNotFull && !isRoundEnding) {
      setIsCpuThinking(true);
      
      const playId = Date.now();
      const isMobile = window.innerWidth < 768;
      const cardIndex = Math.floor(playedCards.length / 2);
      const spacing = isMobile ? 95 : 200;
      const xPos = (cardIndex - 1) * spacing;
      const yOffset = isMobile ? 60 : 100;

      if (cpuMoveTimeoutRef.current) clearTimeout(cpuMoveTimeoutRef.current);
      
      cpuMoveTimeoutRef.current = setTimeout(() => {
        // CPU DECISION PHASE
        const dice = Math.random();
        
        // 1. Check for Mazo (5% chance)
        if (dice < 0.05) {
          handleCpuMazo();
          return;
        }

        // 2. Check for Truco (10% chance)
        if (dice < 0.15 && trucoState.status === 'none') {
          handleCall('truco', 1, 'cpu');
          return;
        }

        // 3. Check for Envido (15% chance in first hand) - ONLY if no Truco called yet
        if (dice < 0.30 && envidoState.status === 'none' && trucoState.status === 'none' && playedCards.length === 1) {
          handleCall('envido', 1, 'cpu');
          return;
        }

        let cardToPlay: Card | null = null;
        
        if (cpuHandRef.current.length > 0) {
          cardToPlay = cpuHandRef.current[0];
          cpuHandRef.current = cpuHandRef.current.slice(1);
        }

        if (cardToPlay) {
          const cardObj = cardToPlay as Card;
          const cpuCardEntry = {
            ...cardObj,
            rotation: (Math.random() - 0.5) * 5,
            x: xPos,
            y: -yOffset,
            owner: 'cpu' as const,
            instanceId: `c-${cardObj.id}-${playId}`
          };
          setPlayedCards(prev => [...prev, cpuCardEntry]);
        }
        
        setIsCpuThinking(false);
        cpuMoveTimeoutRef.current = null;
      }, 1000);
    }
  }, [playedCards.length, isRoundEnding, trucoState.status, envidoState.status, handWinners]);

  const handleCpuMazo = () => {
    triggerCall('¡ME VOY AL MAZO!', 'var(--color-secondary)');
    const points = trucoState.status === 'accepted' ? trucoState.level + 1 : 1;
    setTimeout(() => {
      setScore(prev => ({ ...prev, player: prev.player + points }));
      triggerCall('¡GANASTE!', '#ffea00');
    }, 1000);
    setTimeout(() => resetRound(), 3000);
  };

  const playCard = (card: Card) => {
    if (isBusy || !playerHand.some(c => c.id === card.id) || playedCards.length >= 6) return;
    
    startCooldown();

    const playId = Date.now();
    const isMobile = window.innerWidth < 768;
    const cardIndex = Math.floor(playedCards.length / 2); 
    const spacing = isMobile ? 95 : 200;
    const xPos = (cardIndex - 1) * spacing;
    const yOffset = isMobile ? 60 : 100;

    setPlayerHand(prev => prev.filter(c => c.id !== card.id));
    
    const playerCardEntry = {
      ...card,
      rotation: (Math.random() - 0.5) * 5,
      x: xPos,
      y: yOffset,
      owner: 'player' as const,
      instanceId: `p-${card.id}-${playId}`
    };
    
    setPlayedCards(prev => [...prev, playerCardEntry]);

    // Failsafe: unlock after 5s no matter what
    setTimeout(() => {
      setIsCpuThinking(false);
    }, 5000);
  };

  const calculateEnvido = (hand: Card[]) => {
    // We use the 'env' property exclusively now
    const values = hand.map(c => c.env ?? 0);
    return Math.max(...values, 0);
  };

  const handleCall = (type: 'truco' | 'envido', level: number, caller: 'player' | 'cpu') => {
    if (isRoundEnding) return;
    startCooldown();

    const texts = {
      truco: ['TRUCO!', 'RE-TRUCO!', 'VALE 4!'],
      envido: ['ENVIDO', 'REAL ENVIDO', 'FALTA ENVIDO']
    };

    const colors = {
      truco: caller === 'player' ? '#ffea00' : 'var(--color-secondary)',
      envido: caller === 'player' ? 'var(--color-primary)' : 'var(--color-secondary)'
    };

    triggerCall(texts[type][level - 1], colors[type]);

    if (caller === 'player') {
      // Simulate CPU response after 1.5s
      setTimeout(() => {
        const wants = Math.random() > 0.3;
        if (wants) {
          triggerCall('QUIERO!', 'var(--color-secondary)');
          if (type === 'truco') {
            setTrucoState({ level, caller, status: 'accepted' });
          } else {
            // Compare Envido points
            const playerPts = calculateEnvido(playerHand);
            const cpuPts = calculateEnvido(cpuHandRef.current);
            const envPoints = level === 1 ? 2 : level === 2 ? 3 : 15; // Simple points for now

            setTimeout(() => {
              triggerCall(`${cpuPts}!`, 'var(--color-secondary)');
              setTimeout(() => {
                if (cpuPts >= playerPts) {
                  triggerCall('¡GANÉ ENVIDO!', 'var(--color-secondary)');
                  setScore(prev => ({ ...prev, cpu: prev.cpu + envPoints }));
                } else {
                  triggerCall(`${playerPts}!`, '#ffea00');
                  setTimeout(() => {
                    triggerCall('¡GANASTE ENVIDO!', '#ffea00');
                    setScore(prev => ({ ...prev, player: prev.player + envPoints }));
                  }, 1000);
                }
              }, 1000);
            }, 500);
            setEnvidoState({ level, caller, status: 'finished' });
          }
        } else {
          triggerCall('NO QUIERO', 'var(--color-secondary)');
          // Update score and trigger countdown on "No Quiero"
          if (type === 'truco') {
            setIsRoundEnding(true);
            setScore(prev => ({ ...prev, player: prev.player + (level === 1 ? 1 : level - 1) }));
            triggerCall('¡GANASTE!', '#ffea00');
            
            timersRef.current.push(setTimeout(() => triggerCall('PRÓXIMA EN 3...', '#ffffff'), 1500));
            timersRef.current.push(setTimeout(() => triggerCall('PRÓXIMA EN 2...', '#ffffff'), 2500));
            timersRef.current.push(setTimeout(() => triggerCall('PRÓXIMA EN 1...', '#ffffff'), 3500));
            timersRef.current.push(setTimeout(() => resetRound(), 4500));
          } else {
            setScore(prev => ({ ...prev, player: prev.player + 1 }));
            setEnvidoState(prev => ({ ...prev, status: 'finished' }));
          }
        }
      }, 1500);
    } else {
      setPendingAction({ type, level, caller });
    }
  };

  const handleResponse = (wants: boolean) => {
    if (!pendingAction) return;
    startCooldown();

    if (wants) {
      triggerCall('QUIERO!', '#ffea00'); // Player says Quiero
      if (pendingAction.type === 'truco') {
        setTrucoState({ ...trucoState, status: 'accepted', level: pendingAction.level });
      } else {
        // Compare Envido points
        const playerPts = calculateEnvido(playerHand);
        const cpuPts = calculateEnvido(cpuHandRef.current);
        const envPoints = pendingAction.level === 1 ? 2 : pendingAction.level === 2 ? 3 : 15;

        setTimeout(() => {
          triggerCall(`${playerPts}!`, '#ffea00');
          setTimeout(() => {
            if (playerPts > cpuPts) {
              triggerCall('¡GANASTE ENVIDO!', '#ffea00');
              setScore(prev => ({ ...prev, player: prev.player + envPoints }));
            } else {
              triggerCall(`${cpuPts}!`, 'var(--color-secondary)');
              setTimeout(() => {
                triggerCall('¡GANÉ ENVIDO!', 'var(--color-secondary)');
                setScore(prev => ({ ...prev, cpu: prev.cpu + envPoints }));
              }, 1000);
            }
          }, 1000);
        }, 500);
        setEnvidoState({ ...envidoState, status: 'finished', level: pendingAction.level });
      }
    } else {
      triggerCall('NO QUIERO', '#ffffff'); // Player says No Quiero
      if (pendingAction.type === 'truco') {
        setIsRoundEnding(true);
        setScore(prev => ({ ...prev, cpu: prev.cpu + (pendingAction.level === 1 ? 1 : pendingAction.level - 1) }));
        triggerCall('¡CPU GANA!', 'var(--color-secondary)');
        
        timersRef.current.push(setTimeout(() => triggerCall('PRÓXIMA EN 3...', '#ffffff'), 1500));
        timersRef.current.push(setTimeout(() => triggerCall('PRÓXIMA EN 2...', '#ffffff'), 2500));
        timersRef.current.push(setTimeout(() => triggerCall('PRÓXIMA EN 1...', '#ffffff'), 3500));
        timersRef.current.push(setTimeout(() => resetRound(), 4500));
      } else {
        setScore(prev => ({ ...prev, cpu: prev.cpu + 1 }));
        setEnvidoState(prev => ({ ...prev, status: 'finished' }));
      }
    }
    
    const wasCpuTurn = pendingAction.caller === 'cpu';
    setPendingAction(null);
    
    // If it was CPU's turn and they just called, they still need to play their card
    if (wasCpuTurn && wants) {
      setIsCpuThinking(false); // This will re-trigger the useEffect to play the card
    }
  };

  const handleMazo = () => {
    if (isBusy) return;
    
    startCooldown();
    setIsRoundEnding(true);
    interactionLockRef.current = true;
    
    // Clear ALL timers when retiring
    if (cpuMoveTimeoutRef.current) clearTimeout(cpuMoveTimeoutRef.current);
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];

    // 1. Show Al Mazo
    triggerCall('¡AL MAZO!', '#ffffff');

    // 2. Show Loss & Update Score (after 1s)
    const points = trucoState.status === 'accepted' ? trucoState.level + 1 : 1;
    timersRef.current.push(setTimeout(() => {
      setScore(prev => ({ ...prev, cpu: prev.cpu + points }));
      triggerCall('¡CPU GANA!', 'var(--color-secondary)');
    }, 1000));

    // 3. Countdown sequence (starting from 2s)
    timersRef.current.push(setTimeout(() => triggerCall('PRÓXIMA EN 3...', '#ffffff'), 2000));
    timersRef.current.push(setTimeout(() => triggerCall('PRÓXIMA EN 2...', '#ffffff'), 3000));
    timersRef.current.push(setTimeout(() => triggerCall('PRÓXIMA EN 1...', '#ffffff'), 4000));
    
    // 4. Reset board (after 5s)
    timersRef.current.push(setTimeout(() => {
      resetRound();
    }, 5000));
  };

  const collectCards = () => {
    if (isBusy || interactionLockRef.current) return;
    interactionLockRef.current = true;

    // This is used for the manual "MAZO" call
    if (cpuMoveTimeoutRef.current) {
      clearTimeout(cpuMoveTimeoutRef.current);
      cpuMoveTimeoutRef.current = null;
    }
    setIsCpuThinking(false);
    
    setPlayedCards(currentPlayed => {
      if (currentPlayed.length === 0) {
        interactionLockRef.current = false;
        return currentPlayed;
      }

      const playersBack = currentPlayed.filter(c => c.owner === 'player').map(({ rotation, x, y, owner, instanceId, ...card }) => card as Card);
      const cpusBack = currentPlayed.filter(c => c.owner === 'cpu').map(({ rotation, x, y, owner, instanceId, ...card }) => card as Card);

      setPlayerHand(prev => {
        const existingIds = new Set(prev.map(p => p.id));
        const unique = playersBack.filter(p => !existingIds.has(p.id));
        const combined = [...prev, ...unique];
        return combined.slice(0, 3); // NEVER more than 3
      });

      const existingCpuIds = new Set(cpuHandRef.current.map(p => p.id));
      const uniqueCpu = cpusBack.filter(p => !existingCpuIds.has(p.id));
      const combinedCpu = [...cpuHandRef.current, ...uniqueCpu];
      cpuHandRef.current = combinedCpu.slice(0, 3); // NEVER more than 3

      interactionLockRef.current = false;
      return [];
    });
  };

  return (
    <div className="app" style={{ 
      backgroundImage: 'linear-gradient(rgba(10, 10, 12, 0.75), rgba(10, 10, 12, 0.75)), url(/background.png)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      minHeight: '100vh',
      position: 'relative'
    }}>
      <AnimatePresence>
        {activeCall && (
          <motion.div
            key={activeCall.id}
            initial={{ scale: 0, opacity: 0, x: '-50%', y: '-50%' }}
            animate={{ scale: 1, opacity: 1, x: '-50%', y: '-50%' }}
            exit={{ scale: 1.5, opacity: 0, x: '-50%', y: '-100%' }}
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              zIndex: 1000,
              pointerEvents: 'none',
              width: '100%',
              textAlign: 'center'
            }}
          >
            <div className="text-display" style={{ 
              fontSize: 'clamp(3rem, 15vw, 8rem)', 
              color: activeCall.color,
              textShadow: `0 0 40px ${activeCall.color}88, 6px 6px 0px #000`,
              WebkitTextStroke: '3px #000',
              lineHeight: 1
            }}>
              {activeCall.text}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {gameState === 'landing' ? (
          <LandingPage key="landing" onStart={startGame} />
        ) : (
          <motion.div 
            key="game"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ 
              minHeight: '100vh', 
              padding: '0.5rem', 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '0.5rem',
              overflowX: 'hidden',
              justifyContent: 'center'
            }}
          >

            {/* Main Board Container - Centralized */}
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center',
              gap: '0.5rem',
              width: '100%'
            }}>
              {/* Integrated Info Section - Now Top */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.1rem' }}>
                <Scoreboard 
                  scoreA={score.player} 
                  scoreB={score.cpu} 
                  labelA="VOS" 
                  labelB="CPU" 
                />
                <h2 
                  className="text-display" 
                  onClick={() => setGameState('landing')}
                  style={{ 
                    fontSize: 'clamp(0.9rem, 4vw, 1.5rem)', 
                    opacity: 0.8,
                    letterSpacing: '0.2em',
                    marginTop: '0.25rem',
                    cursor: 'pointer',
                    transition: 'opacity 0.2s',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                  onMouseLeave={(e) => e.currentTarget.style.opacity = '0.8'}
                >MUCHO MUNDIAL</h2>


              </div>

              {/* The Field */}
              <div 
                onClick={collectCards}
                style={{ 
                  width: '100%',
                  maxWidth: '800px',
                  aspectRatio: '16/10',
                  background: 'rgba(255,255,255,0.03)', 
                  border: '2px dashed rgba(255,255,255,0.1)',
                  borderRadius: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  boxShadow: 'inset 0 0 40px rgba(0,0,0,0.5)',
                  perspective: '1200px',
                  cursor: isBusy || playedCards.length === 0 ? 'default' : 'pointer'
                }}
              >
                <AnimatePresence>
                  {playedCards.map((card, index) => (
                    <motion.div
                      key={card.instanceId}
                      initial={{ 
                        y: card.owner === 'player' ? 400 : -400, 
                        opacity: 0, 
                        rotateX: 0, 
                        rotateY: card.owner === 'cpu' ? 180 : 0, // Cards could come face down? 
                        scale: 1.2 
                      }}
                      animate={{ 
                        y: card.y, 
                        x: card.x,
                        opacity: 1, 
                        rotateX: 30, 
                        rotateY: 0,
                        rotateZ: card.rotation,
                        scale: 0.85
                      }}
                      transition={{ 
                        type: "spring", 
                        stiffness: 80, 
                        damping: 15,
                        mass: 1
                      }}
                      style={{
                        position: 'absolute',
                        zIndex: index + 1,
                        transformStyle: 'preserve-3d',
                        filter: 'drop-shadow(0 20px 30px rgba(0,0,0,0.5))'
                      }}
                    >
                      <Sticker card={card} disabled />
                      {/* Label for owner */}
                      <div style={{
                        position: 'absolute',
                        [card.owner === 'player' ? 'top' : 'bottom']: '-25px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        fontSize: '0.7rem',
                        fontWeight: '900',
                        color: card.owner === 'player' ? 'var(--color-primary)' : 'var(--color-secondary)',
                        textShadow: '0 2px 10px rgba(0,0,0,1)',
                        pointerEvents: 'none',
                        letterSpacing: '0.2em',
                        whiteSpace: 'nowrap'
                      }}>
                        {card.owner === 'player' ? 'TUYA' : 'CPU'}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {playedCards.length === 0 && (
                  <p style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', letterSpacing: '0.1em' }}>ÁREA DE JUEGO</p>
                )}
              </div>
            </div>



            {/* Actions / Hand - Bottom Fixed */}
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '0.75rem', 
              alignItems: 'center', 
              marginBottom: '0.5rem', 
              width: '100%',
              marginTop: '0.5rem' 
            }}>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center' }}>
                <AnimatePresence mode="wait">
                  {pendingAction ? (
                    <motion.div 
                      key="responses"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center' }}
                    >
                      <Button variant="secondary" onClick={() => handleResponse(true)}>QUIERO</Button>
                      <Button variant="white" onClick={() => handleResponse(false)}>NO QUIERO</Button>
                      
                      {pendingAction.type === 'truco' && pendingAction.level < 3 && (
                        <Button variant="secondary" onClick={() => handleCall('truco', pendingAction.level + 1, 'player')}>
                          {pendingAction.level === 1 ? 'RE-TRUCO' : 'VALE 4'}
                        </Button>
                      )}
                      
                      {pendingAction.type === 'truco' && envidoState.status === 'none' && playedCards.length === 1 && (
                        <Button variant="primary" onClick={() => {
                          triggerCall('EL ENVIDO ESTÁ PRIMERO!', '#fff');
                          handleCall('envido', 1, 'player');
                        }}>ENVIDO</Button>
                      )}

                      {pendingAction.type === 'envido' && pendingAction.level < 3 && (
                        <Button variant="primary" onClick={() => handleCall('envido', pendingAction.level + 1, 'player')}>
                          {pendingAction.level === 1 ? 'REAL ENVIDO' : 'FALTA ENVIDO'}
                        </Button>
                      )}

                      <Button variant="white" onClick={handleMazo}>MAZO</Button>
                    </motion.div>
                  ) : (
                    <motion.div 
                      key="actions"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center' }}
                    >
                      <Button 
                        variant="secondary" 
                        style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }} 
                        disabled={isBusy || (trucoState.status !== 'none' && trucoState.caller === 'player') || trucoState.level >= 3}
                        onClick={() => handleCall('truco', trucoState.level + 1, 'player')}
                      >
                        {trucoState.level === 0 ? 'TRUCO!' : trucoState.level === 1 ? 'RE-TRUCO!' : 'VALE 4!'}
                      </Button>
                      
                      {/* Envido only in first hand (playedCards.length 0 or 1) and before Truco */}
                      <Button 
                        variant="primary" 
                        style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }} 
                        disabled={isBusy || envidoState.status !== 'none' || trucoState.status !== 'none' || playedCards.length > 1}
                        onClick={() => handleCall('envido', 1, 'player')}
                      >ENVIDO</Button>
                      
                      <Button 
                        variant="white" 
                        style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }} 
                        disabled={isBusy}
                        onClick={handleMazo}
                      >MAZO</Button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              
              <div style={{ 
                display: 'flex', 
                gap: '0.75rem', 
                overflowX: 'auto', 
                padding: '0.5rem',
                width: '100%',
                justifyContent: 'center'
              }}>
                <AnimatePresence>
                  {playerHand.map((card) => (
                    <motion.div
                      key={card.id}
                      layout
                      exit={{ y: -100, opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Sticker 
                        card={card} 
                        onClick={() => playCard(card)} 
                        disabled={isBusy}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>



          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
