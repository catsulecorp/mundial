import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '../../ui/Button';
import type { PlayerRole, GameMode, EnvidoState, PlayedCard } from '../../../lib/truco/types';

interface PendingChallengeProps {
  pendingAction: any;
  gameMode: GameMode;
  envidoState: EnvidoState;
  playedCards: PlayedCard[];
  handleResponse: (accept: boolean) => void;
  handleCall: (type: "truco" | "envido", level: number, caller: PlayerRole) => void;
}

export const PendingChallenge: React.FC<PendingChallengeProps> = ({
  pendingAction,
  gameMode,
  envidoState,
  playedCards,
  handleResponse,
  handleCall
}) => {
  // Check if "El envido está primero" rule applies:
  const canCallEnvidoFirst = 
    pendingAction.type === "truco" && 
    envidoState.status === "none" && 
    playedCards.filter(c => c.owner === "player").length === 0;

  return (
    <motion.div
      key="pending"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "0.5rem",
        alignItems: "center",
        zIndex: 50
      }}
    >
      {/* "EL ENVIDO ESTÁ PRIMERO" button (Top) */}
      {canCallEnvidoFirst && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Button
            variant="primary"
            style={{ 
              fontWeight: 900, 
              border: "none", 
              width: "100%", 
              height: "60px",
              fontSize: "1.1rem",
              background: "#00f2ff", // Celeste para que resalte
              color: "#000"
            }}
            onClick={() => handleCall("envido", 1, "player")}
          >
            ¡EL ENVIDO ESTÁ PRIMERO!
          </Button>
        </motion.div>
      )}

      {/* Response Row */}
      <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center", width: "100%", maxWidth: "600px", alignItems: "center" }}>
        <Button
          variant={pendingAction.type === "envido" ? "primary" : "secondary"}
          style={{ fontWeight: 800, border: "none", flex: 1, minWidth: "110px", height: "60px", whiteSpace: "nowrap", padding: "0 1.25rem", fontSize: "1rem" }}
          onClick={() => handleResponse(true)}
        >
          {gameMode === "2v2" ? "¡QUEREMOS!" : "¡QUIERO!"}
        </Button>

        <Button
          variant="white"
          style={{ border: "none", flex: 1, minWidth: "110px", height: "60px", whiteSpace: "nowrap", padding: "0 1.25rem", fontSize: "1rem" }}
          onClick={() => handleResponse(false)}
        >
          {gameMode === "2v2" ? "¡NO QUEREMOS!" : "¡NO QUIERO!"}
        </Button>

        {/* Escalations (Truco or Envido) */}
        {pendingAction.type === "envido" && pendingAction.level === 1 && (
          <Button
            variant="primary"
            style={{ fontWeight: 800, border: "none", flex: 1, minWidth: "110px", height: "60px", whiteSpace: "nowrap", padding: "0 1.25rem", fontSize: "1rem" }}
            onClick={() => handleCall("envido", 2, "player")}
          >
            ¡ENVIDO! (x2)
          </Button>
        )}
        {pendingAction.type === "envido" && pendingAction.level === 2 && (
          <Button
            variant="secondary"
            style={{ border: "none", flex: 1, minWidth: "110px", height: "60px", whiteSpace: "nowrap", padding: "0 1.25rem", fontSize: "1rem" }}
            onClick={() => handleCall("envido", 3, "player")}
          >
            ¡REAL ENVIDO!
          </Button>
        )}
        {pendingAction.type === "envido" && pendingAction.level === 3 && (
          <Button
            variant="secondary"
            style={{ border: "none", flex: 1, minWidth: "110px", height: "60px", whiteSpace: "nowrap", padding: "0 1.25rem", fontSize: "1rem" }}
            onClick={() => handleCall("envido", 4, "player")}
          >
            ¡FALTA ENVIDO!
          </Button>
        )}
        {pendingAction.type === "truco" && pendingAction.level < 3 && (
          <Button
            variant="secondary"
            style={{ border: "none", flex: 1, minWidth: "110px", height: "60px", whiteSpace: "nowrap", padding: "0 1.25rem", fontSize: "1rem" }}
            onClick={() => handleCall("truco", pendingAction.level + 1, "player")}
          >
            {pendingAction.level === 1 ? "¡RE-TRUCO!" : "¡VALE 4!"}
          </Button>
        )}
      </div>
    </motion.div>
  );
};
