import React from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ScoreboardProps {
  scoreA: number;
  scoreB: number;
  labelA: string;
  labelB: string;
  popups?: { id: number; points: number; side: "player" | "cpu" }[];
}

export const Scoreboard: React.FC<ScoreboardProps> = ({ scoreA, scoreB, labelA, labelB, popups = [] }) => {
  return (
    <div className="scoreboard">
      {/* Item A (Rival / Top / Left) */}
      <div className="scoreboard-item" style={{ position: "relative" }}>
        <div className="scoreboard-label">{labelA}</div>
        <div className="scoreboard-value text-digital" style={{ color: 'var(--color-accent)' }}>{scoreA.toString().padStart(2, '0')}</div>
        
        <AnimatePresence>
          {popups.filter(p => p.side === "cpu").map((popup) => (
            <motion.div
              key={popup.id}
              initial={{ opacity: 0, y: 0 }}
              animate={{ opacity: 1, y: -50 }}
              exit={{ opacity: 0, y: -80 }}
              className="score-popup"
              style={{
                position: "absolute",
                top: "0",
                left: "0",
                right: "0",
                color: "var(--color-accent)",
                fontSize: "2.5rem",
                fontWeight: "900",
                textShadow: "0 0 15px rgba(0,0,0,0.8), 4px 4px 0px #000",
                zIndex: 2100,
                textAlign: "center",
                pointerEvents: "none"
              }}
            >
              +{popup.points}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      
      <div className="text-digital" style={{ fontSize: '2.5rem', color: 'var(--color-accent)', opacity: 0.5 }}>:</div>
      
      {/* Item B (Player / Bottom / Right) */}
      <div className="scoreboard-item" style={{ position: "relative" }}>
        <div className="scoreboard-label">{labelB}</div>
        <div className="scoreboard-value text-digital" style={{ color: 'var(--color-accent)' }}>{scoreB.toString().padStart(2, '0')}</div>

        <AnimatePresence>
          {popups.filter(p => p.side === "player").map((popup) => (
            <motion.div
              key={popup.id}
              initial={{ opacity: 0, y: 0 }}
              // On desktop (large screens), we use a CSS class to control the animation direction
              // But framer-motion handles it here. We'll use a responsive check.
              animate={{ opacity: 1, y: window.innerWidth > 1024 ? 100 : -50 }}
              exit={{ opacity: 0, y: window.innerWidth > 1024 ? 130 : -80 }}
              className="score-popup score-popup-player"
              style={{
                position: "absolute",
                top: "0",
                left: "0",
                right: "0",
                color: "var(--color-accent)",
                fontSize: "2.5rem",
                fontWeight: "900",
                textShadow: "0 0 15px rgba(0,0,0,0.8), 4px 4px 0px #000",
                zIndex: 2100,
                textAlign: "center",
                pointerEvents: "none"
              }}
            >
              +{popup.points}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};
