import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '../../ui/Button';

interface EnvidoSubMenuProps {
  onCall: (level: number) => void;
  disabled: boolean;
}

export const EnvidoSubMenu: React.FC<EnvidoSubMenuProps> = ({ onCall, disabled }) => {
  return (
    <>
      {/* REAL ENVIDO */}
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

      {/* FALTA ENVIDO */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1, y: 8 }}
        exit={{ opacity: 0, scale: 0.8, y: 0 }}
        style={{ position: 'absolute', top: '100%', left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 10 }}
      >
        <Button
          variant="primary"
          style={{ fontSize: '0.7rem', padding: '0.3rem 0.6rem', whiteSpace: 'nowrap', border: '2px solid #000' }}
          disabled={disabled}
          onClick={(e) => { e.stopPropagation(); onCall(4); }}
        >
          ¡FALTA ENVIDO!
        </Button>
      </motion.div>
    </>
  );
};
