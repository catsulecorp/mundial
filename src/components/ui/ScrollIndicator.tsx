import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const ScrollIndicator: React.FC = () => {
  const [isAtBottom, setIsAtBottom] = useState(false);
  const [showIndicator, setShowIndicator] = useState(false);

  const getScrollContainer = () => {
    return document.querySelector('.game-container') || document.documentElement;
  };

  useEffect(() => {
    const handleScroll = () => {
      const target = getScrollContainer();
      const scrollTop = target.scrollTop || window.scrollY;
      const scrollHeight = target.scrollHeight || document.documentElement.scrollHeight;
      const clientHeight = target.clientHeight || window.innerHeight;
      
      // Determine if there's actual content to scroll
      const canScroll = scrollHeight > clientHeight + 20;
      
      // Determine if we are near the bottom
      const bottomThreshold = Math.max(0, scrollHeight - clientHeight - 60);
      const nearBottom = scrollTop > bottomThreshold;

      setIsAtBottom(nearBottom);
      setShowIndicator(canScroll);
    };

    // Listen to both for safety
    const gameContainer = document.querySelector('.game-container');
    if (gameContainer) {
      gameContainer.addEventListener('scroll', handleScroll);
    }
    window.addEventListener('scroll', handleScroll);
    
    // Check periodically as content might load/render late
    const interval = setInterval(handleScroll, 1000);
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (gameContainer) gameContainer.removeEventListener('scroll', handleScroll);
      clearInterval(interval);
    };
  }, []);

  const handleClick = () => {
    const target = getScrollContainer();
    const scrollHeight = target.scrollHeight || document.documentElement.scrollHeight;

    if (isAtBottom) {
      target.scrollTo({ top: 0, behavior: 'smooth' });
      if (target === document.documentElement) window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      target.scrollTo({ top: scrollHeight, behavior: 'smooth' });
      if (target === document.documentElement) window.scrollTo({ top: scrollHeight, behavior: 'smooth' });
    }
  };

  return (
    <AnimatePresence>
      {showIndicator && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5 }}
          onClick={handleClick}
          style={{
            position: 'fixed',
            bottom: '25px',
            right: '35px',
            zIndex: 9999,
            cursor: 'pointer',
            pointerEvents: 'auto'
          }}
        >
          <motion.div
            animate={{ 
              y: isAtBottom ? [0, -8, 0] : [0, 8, 0],
              rotate: isAtBottom ? 180 : 0 
            }}
            transition={{ 
              y: { duration: 1.5, repeat: Infinity, ease: "easeInOut" },
              rotate: { duration: 0.4, ease: "backOut" }
            }}
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.12)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
            }}
          >
            <svg 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="white" 
              strokeWidth="3" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M7 13l5 5 5-5M7 6l5 5 5-5" />
            </svg>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
