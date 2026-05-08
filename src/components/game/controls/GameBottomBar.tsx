import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GameActions } from './GameActions';
import { Sticker } from '../../shared/Sticker';
import { Button } from '../../ui/Button';
import type { GameMode, PlayerRole, EnvidoState, TrucoState, PlayedCard } from '../../../lib/truco/types';

interface GameBottomBarProps {
  pendingAction: any;
  envidoState: EnvidoState;
  trucoState: TrucoState;
  playedCards: PlayedCard[];
  gameMode: GameMode;
  whoseTurn: PlayerRole | null;
  isRoundEnding: boolean;
  isBusy: boolean;
  playerHand: any[];
  onPlayCard: (card: any) => void;
  onHandleMazo: () => void;
  onHandleResponse: (accept: boolean) => void;
  onHandleCall: (type: any, level: number, caller: PlayerRole) => void;
}

export const GameBottomBar: React.FC<GameBottomBarProps> = ({
  pendingAction, envidoState, trucoState, playedCards, gameMode,
  whoseTurn, isRoundEnding, isBusy, playerHand,
  onPlayCard, onHandleMazo, onHandleResponse, onHandleCall
}) => {
  const isHeroTeamTurn = whoseTurn === "player" || whoseTurn === "partner";

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: "1.5rem",
      width: "100%",
      padding: "1rem 0",
      zIndex: 1000
    }}>
      {/* Truco/Envido Actions */}
      <GameActions
        pendingAction={pendingAction}
        envidoState={envidoState}
        trucoState={trucoState}
        playedCards={playedCards}
        gameMode={gameMode}
        whoseTurn={whoseTurn}
        isRoundEnding={isRoundEnding}
        isBusy={isBusy}
        hideMazo={true}
        handleResponse={onHandleResponse}
        handleCall={onHandleCall}
        handleMazo={onHandleMazo}
        triggerCall={() => {}}
      />

      {/* Player Hand */}
      <div style={{
        display: "flex",
        gap: "0.5rem",
        padding: "0 0.5rem",
        justifyContent: "center",
        flexWrap: "nowrap"
      }}>
        <AnimatePresence>
          {playerHand.map((card, idx) => (
            <motion.div
              key={card.id}
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Sticker
                card={card}
                disabled={isBusy || whoseTurn !== "player" || isRoundEnding}
                onClick={() => onPlayCard(card)}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Mazo Button at the very bottom */}
      <div style={{ marginBottom: "3rem" }}>
        <Button
          variant="white"
          disabled={!isHeroTeamTurn || isBusy || pendingAction !== null}
          onClick={() => onHandleMazo()}
          style={{ 
            minWidth: '130px', 
            fontSize: '0.9rem', 
            padding: '0.6rem 1.5rem',
            background: '#ffffff',
            color: '#000000',
            border: '3px solid #000',
            boxShadow: '4px 4px 0px #000',
            fontWeight: 900
          }}
        >
          AL MAZO
        </Button>
      </div>
    </div>
  );
};
