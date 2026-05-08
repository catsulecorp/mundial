import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/Button';
import { Zap, X } from 'lucide-react';

interface MatchmakingOverlayProps {
  isWaiting: boolean;
  timeLeft: number;
  showVersus: boolean;
  rivalData: { name: string; id: string } | null;
  userName: string;
  onCancel: () => void;
  formatTime: (seconds: number) => string;
}

export const MatchmakingOverlay: React.FC<MatchmakingOverlayProps> = ({
  isWaiting,
  timeLeft,
  showVersus,
  rivalData,
  userName,
  onCancel,
  formatTime
}) => {
  return (
    <AnimatePresence>
      {isWaiting && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'fixed',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
            textAlign: 'center',
            background: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(10px)',
            zIndex: 3000
          }}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              padding: '2.5rem',
              borderRadius: '2.5rem',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
              width: '100%',
              maxWidth: '480px',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <AnimatePresence mode="wait">
              {showVersus && rivalData ? (
                <motion.div
                  key="versus"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 1.1 }}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1.5rem', width: '100%' }}>
                    <div className="text-display" style={{ fontSize: '1.8rem', color: '#fff', flex: 1 }}>{userName.toUpperCase()}</div>
                    <motion.div
                      initial={{ scale: 3, rotate: -45, opacity: 0 }}
                      animate={{ scale: 1, rotate: 0, opacity: 1 }}
                      transition={{ type: 'spring', damping: 12, stiffness: 200, delay: 0.2 }}
                      style={{ fontSize: '3.5rem', fontWeight: 950, color: 'var(--color-accent)', textShadow: '0 0 30px rgba(255,223,0,0.4)', fontStyle: 'italic' }}
                    >
                      VS
                    </motion.div>
                    <div className="text-display" style={{ fontSize: '1.8rem', color: '#fff', flex: 1 }}>{rivalData.name.toUpperCase()}</div>
                  </div>
                  <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    transition={{ delay: 0.6 }} 
                    className="text-display" 
                    style={{ color: '#00f2ff', fontSize: '1.2rem', letterSpacing: '0.1em' }}
                  >
                    ¡PARTIDA ENCONTRADA!
                  </motion.div>
                </motion.div>
              ) : (
                <motion.div
                  key="waiting"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                >
                  <motion.div
                    animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Zap size={56} fill="currentColor" style={{ color: 'var(--color-accent)', marginBottom: '1.5rem', filter: 'drop-shadow(0 0 15px rgba(255,223,0,0.5))' }} />
                  </motion.div>
                  
                  <h2 className="text-display" style={{ fontSize: '2.5rem', marginBottom: '1rem', color: '#fff', lineHeight: 1 }}>
                    BUSCANDO<br />
                    <span style={{ color: 'var(--color-accent)' }}>RIVAL...</span>
                  </h2>
                  
                  <p style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>
                    Esperando a que otro jugador se conecte.
                  </p>
                  <p style={{ fontSize: '0.9rem', marginBottom: '1.5rem', color: 'var(--color-accent)', fontStyle: 'italic', opacity: 0.8 }}>
                    ¡Andá preparando el mate!
                  </p>
                  
                  <div style={{ 
                    fontSize: '3rem', 
                    fontWeight: 900, 
                    marginBottom: '2rem', 
                    color: '#fff',
                    fontFamily: 'var(--font-digital)',
                    letterSpacing: '2px'
                  }}>
                    {formatTime(timeLeft)}
                  </div>
                  
                  <Button 
                    variant="white"
                    onClick={onCancel} 
                    className="btn-hover-dark"
                    style={{ 
                      background: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      color: 'white',
                      height: '40px',
                      borderRadius: '1rem',
                      padding: '0 1.5rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      fontSize: '0.8rem',
                      fontWeight: 900,
                      cursor: 'pointer',
                      transition: 'none',
                      textTransform: 'uppercase'
                    }}
                  >
                    <X size={18} />
                    CANCELAR
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
