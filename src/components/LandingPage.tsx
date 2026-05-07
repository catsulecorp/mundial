
import { motion } from 'framer-motion';
import { Button } from './ui/Button';
import { Zap } from 'lucide-react';
import { Sticker } from './Sticker';
import { CARDS } from '../data/cards';


interface LandingPageProps {
  onStart: (mode: "1v1" | "2v2") => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
  return (
    <div className="landing-container" style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      textAlign: 'center',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background Decorative Elements */}
      <motion.div 
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        style={{
          position: 'absolute',
          top: '-10%',
          right: '-10%',
          width: '400px',
          height: '400px',
          background: 'var(--color-primary)',
          filter: 'blur(150px)',
          opacity: 0.1,
          pointerEvents: 'none'
        }}
      />
      
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: '1200px' }}
      >
        <div style={{ 
          display: 'flex', 
          flexDirection: 'row',
          flexWrap: 'wrap',
          alignItems: 'center', 
          justifyContent: 'center',
          gap: '1.5rem', 
          marginBottom: '2rem',
          width: '100%'
        }}>
          {/* Floating Card - Messi */}
          <motion.div
            animate={{ 
              y: [0, -10, 0],
              rotate: [-5, -8, -5]
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            style={{ flexShrink: 0 }}
          >
            <Sticker card={CARDS[0]} disabled />
          </motion.div>

          <h1 className="text-display" style={{ 
            fontSize: 'var(--fs-title)', 
            lineHeight: 0.9, 
            textAlign: 'center',
            textShadow: '0 8px 30px rgba(0,0,0,0.8), 4px 4px 0px rgba(0,0,0,1)' 
          }}>
            Mucho <br />
            <span style={{ color: 'var(--color-primary)' }}>Mundial</span>
          </h1>
        </div>

        <p style={{ 
          color: 'var(--color-text)', 
          fontSize: 'var(--fs-subtitle)', 
          maxWidth: '600px', 
          marginBottom: '2rem', 
          textAlign: 'center',
          textShadow: '0 2px 10px rgba(0,0,0,0.9)',
          fontWeight: 700
        }}>
          El clásico argentino, ahora con las figuritas del mundial.
        </p>





        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <Button onClick={() => onStart("1v1")} variant="secondary" className="btn-landing">
            <Zap fill="currentColor" /> 1 VS 1
          </Button>
          <Button onClick={() => onStart("2v2")} variant="secondary" className="btn-landing desktop-only">
            <Zap fill="currentColor" /> 2 VS 2
          </Button>
        </div>

      </motion.div>


    </div>
  );
};

