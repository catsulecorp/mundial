import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CallOverlayProps {
  activeCall: {
    id: number;
    text: string;
    color: string;
  } | null;
  gameState: string;
}

export const CallOverlay: React.FC<CallOverlayProps> = ({ activeCall, gameState }) => {
  return (
    <AnimatePresence>
      {activeCall && gameState === "playing" && (
        <motion.div
          key={activeCall.id}
          initial={{ scale: 0, opacity: 0, x: "-50%", y: "-50%" }}
          animate={{ scale: 1, opacity: 1, x: "-50%", y: "-50%" }}
          exit={{ scale: 1.5, opacity: 0, x: "-50%", y: "-100%" }}
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            zIndex: 3000,
            pointerEvents: "none",
            width: "100%",
            textAlign: "center"
          }}
        >
          <div
            className="text-display"
            style={{
              fontSize: "clamp(2rem, 12vw, 6rem)", // Reducido de 8rem a 6rem max
              color: activeCall.color,
              textShadow: "8px 8px 0px #000, 0 0 20px rgba(0,0,0,0.5)",
              WebkitTextStroke: "2.5px #000", // Reducido un poco el trazo también
              paintOrder: "stroke fill"
            }}
          >
            {activeCall.text}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
