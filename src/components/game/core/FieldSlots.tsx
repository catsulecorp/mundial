import React, { useState, useEffect } from 'react';
import type { GameMode } from '../../../lib/truco/types';

interface FieldSlotsProps {
  gameMode: GameMode;
}

export const FieldSlots: React.FC<FieldSlotsProps> = ({ gameMode }) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const is1v1 = gameMode === "1v1" || gameMode === "multiplayer";
  
  // Constantes de diseño sincronizadas con GameField
  const slotWidth = isMobile ? "105px" : "140px";
  const slotHeight = isMobile ? "135px" : "190px";
  const horizontalGap = isMobile ? "10px" : "45px";
  const verticalGap = isMobile ? "40px" : "70px";

  return (
    <>
      {/* Top/Bottom Center Slots */}
      <div style={{ 
        position: "absolute", 
        left: "50%", 
        top: "50%", 
        transform: "translate(-50%, -50%)", 
        display: "flex", 
        gap: horizontalGap 
      }}>
        {[0, 1, 2].map((i) => (
          <div key={`slot-center-${i}`} style={{ display: "flex", flexDirection: "column", gap: verticalGap }}>
            <div style={{ width: slotWidth, height: slotHeight, border: "2px dashed rgba(255,255,255,0.1)", borderRadius: "12px" }} />
            <div style={{ width: slotWidth, height: slotHeight, border: "2px dashed rgba(255,255,255,0.1)", borderRadius: "12px" }} />
          </div>
        ))}
      </div>

      {!is1v1 && (
        <>
          {/* Left/Right slots for 2v2 (Simplified for now) */}
          {/* ... keeping these same as before but responsive if needed ... */}
        </>
      )}
    </>
  );
};
