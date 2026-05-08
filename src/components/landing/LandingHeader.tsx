import React from 'react';
import { motion } from 'framer-motion';
import { Sticker } from '../shared/Sticker';
import { CARDS } from '../../data/cards';

interface LandingHeaderProps {
  user: any;
}

export const LandingHeader: React.FC<LandingHeaderProps> = ({ user }) => {
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'row', 
      alignItems: 'center', 
      justifyContent: 'center', 
      gap: '2.5rem', 
      marginBottom: '1rem', 
      width: '100%' 
    }}>
      {/* Messi Card (Left) */}
      <motion.div
        animate={{ y: [0, -10, 0], rotate: [-5, -8, -5] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        style={{ flexShrink: 0, transform: 'scale(0.8)', originX: 0.5, originY: 0.5 }}
      >
        <Sticker card={CARDS.find(c => c.id === 'messi') || CARDS[0]} disabled />
      </motion.div>

      {/* Title + Pill (Right Column) */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '0.75rem' }}>
        <h1 className="text-display" style={{ fontSize: 'clamp(2.5rem, 8vw, 4rem)', lineHeight: 0.9, color: '#fff', margin: 0 }}>
          MUCHO<br />
          MUNDIAL
        </h1>

        {user && (
          <div style={{ 
            color: '#00f2ff', 
            fontSize: '0.85rem', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem', 
            background: 'rgba(0,242,255,0.1)', 
            padding: '0.4rem 0.8rem', 
            borderRadius: '1rem', 
            border: '1px solid rgba(0,242,255,0.2)',
            fontWeight: 700
          }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#00f2ff' }} />
            <span className="desktop-only">Sesión iniciada como:&nbsp;</span>
            <span className="mobile-only">Sesión de:&nbsp;</span>
            <strong>{user.user_metadata.full_name?.split(' ')[0]}</strong>
          </div>
        )}
      </div>
    </div>
  );
};
