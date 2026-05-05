import { useState } from 'react';
import { LandingPage } from './components/LandingPage';
import { Scoreboard } from './components/Scoreboard';
import { Sticker } from './components/Sticker';
import { CARDS } from './data/cards';
import type { Card } from './data/cards';
import { Button } from './components/ui/Button';
import { motion, AnimatePresence } from 'framer-motion';

function App() {
  const [gameState, setGameState] = useState<'landing' | 'playing'>('landing');
  const [playerHand] = useState<Card[]>(CARDS.slice(0, 3));
  const [score] = useState({ player: 0, cpu: 0 });


  const startGame = () => {
    setGameState('playing');
  };

  return (
    <div className="app">
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
              backgroundImage: 'linear-gradient(rgba(10, 10, 12, 0.85), rgba(10, 10, 12, 0.85)), url(/playground.png)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
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
              <div style={{ 
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
                boxShadow: 'inset 0 0 40px rgba(0,0,0,0.5)'
              }}>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', letterSpacing: '0.1em' }}>ÁREA DE JUEGO</p>
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
                <Button variant="secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>TRUCO!</Button>
                <Button variant="primary" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>ENVIDO</Button>
                <Button variant="white" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>MAZO</Button>
              </div>
              
              <div style={{ 
                display: 'flex', 
                gap: '0.75rem', 
                overflowX: 'auto', 
                padding: '0.5rem',
                width: '100%',
                justifyContent: 'center'
              }}>
                {playerHand.map((card) => (
                  <Sticker key={card.id} card={card} onClick={() => console.log('Played', card.name)} />
                ))}
              </div>
            </div>



          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
