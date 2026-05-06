import { useState } from 'react';
import { motion } from 'framer-motion';
import type { Card } from '../data/cards';

interface StickerProps {
  card: Card;
  onClick?: () => void;
  disabled?: boolean;
  heroMode?: boolean;
  hideEnv?: boolean;
}

export const Sticker: React.FC<StickerProps> = ({ card, onClick, disabled, heroMode = false, hideEnv = false }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      whileHover={!disabled ? { scale: 1.1, rotate: 2, zIndex: 10 } : {}}
      whileTap={!disabled ? { scale: 0.95 } : {}}
      className={`sticker ${disabled ? 'disabled' : ''}`}
      onClick={!disabled ? onClick : undefined}
      onHoverStart={() => !disabled && setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      style={{
        cursor: disabled ? 'default' : 'pointer',
        opacity: disabled ? 0.6 : 1,
        borderColor: card.id === 'messi' ? '#a855f7' : '#fff',
        boxShadow: card.id === 'messi' ? '0 0 25px rgba(168, 85, 247, 0.9)' : undefined
      }}
    >
      <div className="sticker-glitter"></div>

      {/* Player Image */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundImage: `url(${card.image})`,
        backgroundSize: '100% 100%',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        zIndex: 1
      }} />

      {/* Top gradient */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '35%',
        background: 'linear-gradient(to bottom, rgba(0,0,0,0.75), transparent)',
        zIndex: 2
      }} />

      {/* Player name - top */}
      <div style={{
        position: 'absolute',
        top: '8px',
        left: 0,
        width: '100%',
        textAlign: 'center',
        zIndex: 3,
        padding: '0 6px',
      }}>
        <div className="text-display" style={{ fontSize: '0.85rem', color: '#fff', textShadow: '0 2px 6px rgba(0,0,0,0.9)', letterSpacing: '0.05em' }}>{card.name}</div>
      </div>

      {/* Bottom overlay gradient */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        width: '100%',
        height: '40%',
        background: 'linear-gradient(to top, rgba(0,0,0,0.85), transparent)',
        zIndex: 2
      }} />

      {/* Stats / Info */}
      <div style={{
        position: 'absolute',
        bottom: '18px',
        left: 0,
        width: '100%',
        padding: '8px',
        textAlign: 'center',
        zIndex: 3,
        overflow: 'hidden',
      }}>

        {/* Normal stats: RANK / ENV */}
        {!heroMode && (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '20px',
            opacity: isHovered ? 0 : 1,
            transition: 'opacity 0.15s ease',
            pointerEvents: 'none',
            position: 'absolute',
            bottom: '2px',
            left: 0,
            right: 0,
          }}>
            {!hideEnv && (
              <div style={{ fontSize: '0.8rem', textAlign: 'center' }}>
                <span style={{ color: '#fff', fontWeight: 'bold', fontSize: '0.7rem', letterSpacing: '0.08em' }}>ENV</span>
                <div className="text-display" style={{ color: 'var(--color-primary)', fontSize: '1.3rem', lineHeight: 1.1 }}>+{card.env}</div>
              </div>
            )}
            <div style={{ fontSize: '0.8rem', textAlign: 'center' }}>
              <span style={{ color: '#fff', fontWeight: 'bold', fontSize: '0.7rem', letterSpacing: '0.08em' }}>RANK</span>
              <div className="text-display" style={{ color: 'var(--color-accent)', fontSize: '1.3rem', lineHeight: 1.1 }}>{card.power}</div>
            </div>
          </div>
        )}

        {/* Hero mode: only RANK centered, large */}
        {heroMode && (
          <div style={{
            position: 'absolute',
            bottom: '2px',
            left: 0,
            right: 0,
            textAlign: 'center',
            pointerEvents: 'none',
          }}>
            <span style={{ color: '#fff', fontWeight: 'bold', fontSize: '0.75rem', letterSpacing: '0.08em', display: 'block' }}>RANK</span>
            <div className="text-display" style={{ color: 'var(--color-accent)', fontSize: '1.6rem', lineHeight: 1.1 }}>{card.power}</div>
          </div>
        )}

        {/* Hover stats: País / Club */}
        {!heroMode && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '2px',
            opacity: isHovered ? 1 : 0,
            transition: 'opacity 0.15s ease',
            pointerEvents: 'none',
          }}>
            <span className="text-display" style={{ color: 'var(--color-primary)', fontSize: '0.85rem', lineHeight: 1.2 }}>{card.country}</span>
            <span className="text-display" style={{ color: 'var(--color-primary)', fontSize: '0.85rem', lineHeight: 1.2 }}>({card.club})</span>
          </div>
        )}
      </div>

    </motion.div>
  );
};
