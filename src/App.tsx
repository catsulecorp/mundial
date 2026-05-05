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

  const isBusy = isCpuThinking || isRoundEnding || isCooldown;

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
    setPlayedCards([]);
    setPlayerHand(CARDS.slice(0, 3));
    cpuHandRef.current = CARDS.slice(3, 6);
  };

  const timersRef = useRef<any[]>([]);

  // Monitor round end
  useEffect(() => {
    if (playedCards.length >= 6 && !isRoundEnding) {
      setIsRoundEnding(true);
      interactionLockRef.current = true;
      const playerWins = Math.random() > 0.5;
      
      // Clear any existing ROUND timers (but NOT necessarily the CPU move)
      timersRef.current.forEach(clearTimeout);
      timersRef.current = [];

      // 1. Show Winner
      timersRef.current.push(setTimeout(() => {
        if (playerWins) {
          setScore(prev => ({ ...prev, player: prev.player + 1 }));
          triggerCall('¡GANASTE!', '#ffea00');
        } else {
          setScore(prev => ({ ...prev, cpu: prev.cpu + 1 }));
          triggerCall('¡CPU GANA!', 'var(--color-secondary)');
        }
      }, 500));

      // 2. Countdown sequence
      timersRef.current.push(setTimeout(() => triggerCall('PRÓXIMA EN 3...', '#ffffff'), 1500));
      timersRef.current.push(setTimeout(() => triggerCall('PRÓXIMA EN 2...', '#ffffff'), 2500));
      timersRef.current.push(setTimeout(() => triggerCall('PRÓXIMA EN 1...', '#ffffff'), 3500));
      timersRef.current.push(setTimeout(() => resetRound(), 4500));
    }
    
    return () => {
      // Only clear on complete reset or unmount
    };
  }, [playedCards.length, isRoundEnding]);

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

    if (isOdd && isBoardNotFull && lastCardWasPlayer && !isRoundEnding) {
      setIsCpuThinking(true);
      
      const playId = Date.now();
      const isMobile = window.innerWidth < 768;
      const cardIndex = Math.floor(playedCards.length / 2);
      const spacing = isMobile ? 95 : 200;
      const xPos = (cardIndex - 1) * spacing;
      const yOffset = isMobile ? 60 : 100;

      if (cpuMoveTimeoutRef.current) clearTimeout(cpuMoveTimeoutRef.current);
      
      cpuMoveTimeoutRef.current = setTimeout(() => {
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
      }, 800);
    }
  }, [playedCards.length, isRoundEnding]);

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
    timersRef.current.push(setTimeout(() => {
      setScore(prev => ({ ...prev, cpu: prev.cpu + 1 }));
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

              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                <Button 
                  variant="secondary" 
                  style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }} 
                  disabled={isBusy}
                  onClick={() => {
                    startCooldown();
                    triggerCall('¡TRUCO!', 'var(--color-accent)');
                  }}
                >TRUCO!</Button>
                <Button 
                  variant="primary" 
                  style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }} 
                  disabled={isBusy}
                  onClick={() => {
                    startCooldown();
                    triggerCall('¡ENVIDO!', 'var(--color-primary)');
                  }}
                >ENVIDO</Button>
                <Button 
                  variant="white" 
                  style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }} 
                  disabled={isBusy}
                  onClick={handleMazo}
                >MAZO</Button>
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
