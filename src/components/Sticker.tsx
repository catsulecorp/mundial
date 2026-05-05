import { motion } from 'framer-motion';
import type { Card } from '../data/cards';

interface StickerProps {
  card: Card;
  onClick?: () => void;
  disabled?: boolean;
}

export const Sticker: React.FC<StickerProps> = ({ card, onClick, disabled }) => {
  return (
    <motion.div
      whileHover={!disabled ? { scale: 1.1, rotate: 2, zIndex: 10 } : {}}
      whileTap={!disabled ? { scale: 0.95 } : {}}
      className={`sticker ${disabled ? 'disabled' : ''}`}
      onClick={!disabled ? onClick : undefined}
      style={{
        cursor: disabled ? 'default' : 'pointer',
        opacity: disabled ? 0.6 : 1,
        borderColor: card.isLegendary ? 'var(--color-accent)' : '#fff'
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

      {/* Overlay gradient to keep text readable if needed, but if the image is the full card, maybe we don't want overlay */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        width: '100%',
        height: '40%',
        background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
        zIndex: 2
      }} />

      {/* Stats / Info */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        width: '100%',
        padding: '8px',
        textAlign: 'center',
        zIndex: 3
      }}>
        <div className="text-display" style={{ fontSize: '0.9rem', marginBottom: '2px', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>{card.name}</div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px' }}>
          <div style={{ fontSize: '0.8rem' }}>
            <span style={{ color: 'rgba(255,255,255,0.7)' }}>VAL</span>
            <div className="text-display" style={{ color: 'var(--color-accent)', fontSize: '1.2rem' }}>{card.value}</div>
          </div>
          <div style={{ fontSize: '0.8rem' }}>
            <span style={{ color: 'rgba(255,255,255,0.7)' }}>ENV</span>
            <div className="text-display" style={{ color: 'var(--color-primary)', fontSize: '1.2rem' }}>{card.env || 10}</div>
          </div>

        </div>


      </div>

    </motion.div>
  );
};
