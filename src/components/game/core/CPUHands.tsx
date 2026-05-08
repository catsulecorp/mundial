import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sticker } from '../../shared/Sticker';
import type { Card } from '../../../data/cards';

interface CPUHandsProps {
  gameMode: "1v1" | "2v2" | "multiplayer";
  cpuHandCount: number;
  cpuPartnerHandRef: React.MutableRefObject<Card[]>;
  cpuPartnerHandCount: number;
}

export const CPUHands: React.FC<CPUHandsProps> = ({
  gameMode,
  cpuHandCount,
  cpuPartnerHandRef,
  cpuPartnerHandCount
}) => {
  return (
    <div
      style={{
        display: "flex",
        width: "100%",
        justifyContent: "center",
        padding: "0 1rem",
        marginBottom: "10px",
        height: "60px",
        boxSizing: "border-box",
      }}
    >
      {(gameMode === "1v1" || gameMode === "multiplayer") ? (
        <div style={{ display: "flex", gap: "10px", position: "relative" }}>
          <AnimatePresence mode="popLayout">
            {[...Array(cpuHandCount)].map((_, i) => (
              <motion.div
                key={`cpu-card-${i}`}
                layout
                initial={{ opacity: 0, y: -200, x: 0 }}
                animate={{ opacity: 1, y: 0, x: 0 }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                className="cpu-card-back"
              />
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div style={{ display: "flex", gap: "10px", position: "relative" }}>
          <AnimatePresence mode="popLayout">
            {cpuPartnerHandRef.current.slice(0, cpuPartnerHandCount).map((card, i) => (
              <motion.div
                key={`partner-card-${card.id}-${i}`}
                layout
                initial={{ opacity: 0, y: -200, x: 0 }}
                animate={{ opacity: 1, y: 0, x: 0 }}
                exit={{ opacity: 0, scale: 0.5 }}
                whileHover={{ scale: 2.5, y: 40, zIndex: 100 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                style={{ width: "42px", height: "57px", position: "relative", zIndex: 1, cursor: "pointer" }}
              >
                <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%) scale(0.3)", pointerEvents: "none" }}>
                  <Sticker card={card} disabled />
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default CPUHands;
