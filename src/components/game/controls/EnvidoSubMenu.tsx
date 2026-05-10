import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '../../ui/Button';

interface EnvidoSubMenuProps {
  onCall: (level: number) => void;
  disabled?: boolean;
  hideRealEnvido?: boolean;
}

export const EnvidoSubMenu: React.FC<EnvidoSubMenuProps> = ({ onCall, disabled = false, hideRealEnvido = false }) => {
  // Lateral position for Real Envido -> Falta Envido
  if (hideRealEnvido) {
    return (
      <div style={{ 
        position: 'absolute', 
        left: 'calc(100% + 8px)', 
        top: '0', 
        display: 'flex', 
        flexDirection: 'column', 
        zIndex: 100,
        width: '100%',
        minWidth: '140px'
      }}>
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          style={{ width: '100%' }}
        >
          <Button
            variant="primary"
            style={{ 
              fontSize: '0.9rem', 
              padding: '0 1.25rem', 
              height: '44px',
              whiteSpace: 'nowrap', 
              border: 'none', 
              width: '100%', 
              background: '#00f2ff', 
              color: '#000',
              fontWeight: 800
            }}
            disabled={disabled}
            onClick={(e) => { e.stopPropagation(); onCall(4); }}
          >
            ¡FALTA ENVIDO!
          </Button>
        </motion.div>
      </div>
    );
  }

  // Vertical position for Envido -> (Real/Falta)
  return (
    <>
      {/* REAL ENVIDO (Top) */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1, y: -8 }}
        exit={{ opacity: 0, scale: 0.8, y: 0 }}
        style={{ position: 'absolute', bottom: '100%', left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 10 }}
      >
        <Button
          variant="primary"
          style={{ fontSize: '0.7rem', padding: '0.3rem 0.6rem', whiteSpace: 'nowrap', border: '2px solid #000' }}
          disabled={disabled}
          onClick={(e) => { e.stopPropagation(); onCall(3); }}
        >
          ¡REAL ENVIDO!
        </Button>
      </motion.div>

      {/* FALTA ENVIDO (Bottom) */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1, y: 8 }}
        exit={{ opacity: 0, scale: 0.8, y: 0 }}
        style={{ position: 'absolute', top: '100%', left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 10 }}
      >
        <Button
          variant="primary"
          style={{ fontSize: '0.7rem', padding: '0.3rem 0.6rem', whiteSpace: 'nowrap', border: '2px solid #000', background: '#00f2ff', color: '#000' }}
          disabled={disabled}
          onClick={(e) => { e.stopPropagation(); onCall(4); }}
        >
          ¡FALTA ENVIDO!
        </Button>
      </motion.div>
    </>
  );
};
