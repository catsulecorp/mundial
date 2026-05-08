import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import type { PlayedCard as PlayedCardType, GameMode, PlayerRole } from '../../../lib/truco/types';
import { FieldSlots } from './FieldSlots';
import { PlayedCard } from './PlayedCard';
import { CallOverlay } from '../controls/CallOverlay';
import { RoundCountdown } from '../modals/RoundCountdown';

interface GameFieldProps {
  gameMode: GameMode;
  playedCards: PlayedCardType[];
  handWinners: (PlayerRole | "draw")[];
  roundWinningCardId?: string | null;
  handWinningCardIds?: string[];
  activeCall: {
    id: number;
    text: string;
    color: string;
  } | null;
  gameState: string;
  isRoundEnding: boolean;
  isGameStarting: boolean;
}

export const GameField: React.FC<GameFieldProps> = ({
  gameMode,
  playedCards,
  handWinners,
  roundWinningCardId,
  handWinningCardIds = [],
  activeCall,
  gameState,
  isRoundEnding,
  isGameStarting
}) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const is1v1 = gameMode === "1v1" || gameMode === "multiplayer";

  // Constantes de posicionamiento SINCRONIZADAS con FieldSlots
  // slotWidth + gap
  const xStep = isMobile ? (105 + 10) : (140 + 45); 
  // (verticalGap + slotHeight) / 2
  const yOffset = isMobile ? (40 + 135) / 2 : (70 + 190) / 2;

  return (
    <div className="game-field" style={{
      width: "100%",
      maxWidth: gameMode === "2v2" ? "1100px" : "800px",
      height: isMobile ? (gameMode === "2v2" ? "500px" : "420px") : (gameMode === "2v2" ? "750px" : "550px"),
      position: "relative",
      margin: "0 auto",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1,
    }}>
      <FieldSlots gameMode={gameMode} />

      {/* Central Brand Logo */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        textAlign: 'center',
        opacity: 0.1,
        pointerEvents: 'none',
        userSelect: 'none',
        zIndex: 0,
        width: '100%'
      }}>
        <h2 className="text-display" style={{ 
          fontSize: is1v1 ? 'clamp(1.5rem, 5vw, 2.5rem)' : 'clamp(2rem, 8vw, 3.5rem)', 
          lineHeight: 1,
          margin: 0,
          color: '#fff',
          letterSpacing: '0.05em',
          whiteSpace: 'nowrap'
        }}>
          MUCHO MUNDIAL
        </h2>
      </div>

      <CallOverlay activeCall={activeCall} gameState={gameState} />
      <RoundCountdown isActive={isRoundEnding || isGameStarting} isGameStarting={isGameStarting} />

      <AnimatePresence>
        {playedCards.map((card, idx) => {
          const isPlayer = card.owner === "player";
          const isPartner = card.owner === "partner";
          const isCpu = card.owner === "cpu";
          const isCpu2 = card.owner === "cpu2";

          const handIndex = Math.floor(idx / (gameMode === "2v2" ? 4 : 2));
          const isHandDecided = handWinners.length > handIndex;
          const handWinner = handWinners[handIndex];

          let isLoser = false;
          let isWinner = false;
          if (isHandDecided && handWinner !== "draw") {
            isLoser = card.owner !== handWinner;
            isWinner = card.owner === handWinner;
          }

          const isHero = card.id === roundWinningCardId;
          const isHandWinner = handWinningCardIds.includes(card.id);

          let xPos = 0;
          let yPos = 0;
          let rotate = 0;

          if (is1v1) {
            const handIdx = Math.floor(idx / 2);
            xPos = (handIdx - 1) * xStep; 
            yPos = isPlayer ? yOffset : -yOffset;
          } else {
            const handIdx = Math.floor(idx / 4);
            const centerCardSpacing = isMobile ? 90 : 185;
            const lateralCardSpacing = isMobile ? 25 : 45;
            
            if (isPlayer) { xPos = (handIdx - 1) * centerCardSpacing; yPos = isMobile ? 180 : 320; }
            else if (isPartner) { xPos = (handIdx - 1) * centerCardSpacing; yPos = isMobile ? -180 : -320; }
            else if (isCpu) { xPos = isMobile ? -180 : -375; yPos = (handIdx - 1) * lateralCardSpacing; rotate = 90; }
            else if (isCpu2) { xPos = isMobile ? 180 : 375; yPos = (handIdx - 1) * lateralCardSpacing; rotate = -90; }
          }

          return (
            <PlayedCard 
              key={card.id}
              card={card}
              idx={idx}
              isHero={isHero}
              isWinner={isWinner}
              isHandWinner={isHandWinner}
              isLoser={isLoser}
              xPos={xPos}
              yPos={yPos}
              rotate={rotate}
              isPlayer={isPlayer}
            />
          );
        })}
      </AnimatePresence>
    </div>
  );
};
