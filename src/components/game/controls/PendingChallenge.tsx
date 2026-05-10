import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../../ui/Button';
import type { PlayerRole, GameMode, EnvidoState, PlayedCard } from '../../../lib/truco/types';
import { EnvidoSubMenu } from './EnvidoSubMenu';

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
  const [showEnvidoOptions, setShowEnvidoOptions] = useState(false);
  const [showRealEnvidoOptions, setShowRealEnvidoOptions] = useState(false);
  const [confirmEnvido, setConfirmEnvido] = useState(false);
  const confirmTimeoutRef = useRef<any>(null);

  const onEnvidoClick = () => {
    if (window.innerWidth > 768) {
      handleCall("envido", 2, "player");
      return;
    }

    if (confirmEnvido) {
      handleCall("envido", 2, "player");
      setConfirmEnvido(false);
      setShowEnvidoOptions(false);
      if (confirmTimeoutRef.current) clearTimeout(confirmTimeoutRef.current);
    } else {
      setConfirmEnvido(true);
      setShowEnvidoOptions(true);
      setShowRealEnvidoOptions(false);

      if (confirmTimeoutRef.current) clearTimeout(confirmTimeoutRef.current);
      confirmTimeoutRef.current = setTimeout(() => {
        setConfirmEnvido(false);
        setShowEnvidoOptions(false);
      }, 2000);
    }
  };

  const onRealEnvidoClick = () => {
    if (window.innerWidth > 768) {
      handleCall("envido", 3, "player");
      return;
    }

    if (confirmEnvido) {
      handleCall("envido", 3, "player");
      setConfirmEnvido(false);
      setShowRealEnvidoOptions(false);
      if (confirmTimeoutRef.current) clearTimeout(confirmTimeoutRef.current);
    } else {
      setConfirmEnvido(true);
      setShowRealEnvidoOptions(true);
      setShowEnvidoOptions(false);

      if (confirmTimeoutRef.current) clearTimeout(confirmTimeoutRef.current);
      confirmTimeoutRef.current = setTimeout(() => {
        setConfirmEnvido(false);
        setShowRealEnvidoOptions(false);
      }, 2000);
    }
  };

  // Check if "El envido está primero" rule applies:
  const canCallEnvidoFirst =
    pendingAction.type === "truco" &&
    envidoState.status === "none" &&
    playedCards.filter(c => c.owner === "player").length === 0;

  const btnHeight = "44px";
  const isHighStakesEnvido = pendingAction.type === "envido" && pendingAction.level >= 3;

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
          style={{ width: "100%" }}
        >
          <Button
            variant="primary"
            style={{
              fontWeight: 900,
              border: "none",
              width: "100%",
              height: btnHeight,
              fontSize: "1rem",
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
          style={{ fontWeight: 800, border: "none", flex: 1, minWidth: "110px", height: btnHeight, whiteSpace: "nowrap", padding: "0 1.25rem", fontSize: "0.9rem" }}
          onClick={() => handleResponse(true)}
        >
          {isHighStakesEnvido
            ? (gameMode === "2v2" ? "¡QUEREMOS!" : "¡QUIERO!")
            : (gameMode === "2v2" ? "QUEREMOS" : "QUIERO")
          }
        </Button>

        <Button
          variant="white"
          style={{ border: "none", flex: 1, minWidth: "110px", height: btnHeight, whiteSpace: "nowrap", padding: "0 1.25rem", fontSize: "0.9rem" }}
          onClick={() => handleResponse(false)}
        >
          {isHighStakesEnvido
            ? (gameMode === "2v2" ? "NO QUEREMOS..." : "NO QUIERO...")
            : (gameMode === "2v2" ? "NO QUEREMOS" : "NO QUIERO")
          }
        </Button>

        {/* Escalations (Truco or Envido) */}
        {pendingAction.type === "envido" && pendingAction.level === 1 && (
          <div
            style={{ position: 'relative', flex: 1, minWidth: "130px" }}
            onMouseEnter={() => {
              if (window.innerWidth > 768) setShowEnvidoOptions(true);
            }}
            onMouseLeave={() => {
              if (!confirmEnvido) setShowEnvidoOptions(false);
            }}
          >
            <AnimatePresence>
              {showEnvidoOptions && (
                <EnvidoSubMenu
                  onCall={(level) => {
                    handleCall("envido", level, "player");
                    setConfirmEnvido(false);
                    setShowEnvidoOptions(false);
                  }}
                />
              )}
            </AnimatePresence>
            <Button
              variant="primary"
              style={{ fontWeight: 800, border: "none", width: "100%", height: btnHeight, whiteSpace: "nowrap", padding: "0 1.25rem", fontSize: "0.9rem" }}
              onClick={onEnvidoClick}
            >
              ¡ENVIDO! (x2)
            </Button>
          </div>
        )}
        {pendingAction.type === "envido" && pendingAction.level === 2 && (
          <div
            style={{ position: 'relative', flex: 1, minWidth: "140px" }}
            onMouseEnter={() => {
              if (window.innerWidth > 768) setShowRealEnvidoOptions(true);
            }}
            onMouseLeave={() => {
              if (!confirmEnvido) setShowRealEnvidoOptions(false);
            }}
          >
            <AnimatePresence>
              {showRealEnvidoOptions && (
                <EnvidoSubMenu
                  hideRealEnvido={true}
                  onCall={(level) => {
                    handleCall("envido", level, "player");
                    setConfirmEnvido(false);
                    setShowRealEnvidoOptions(false);
                  }}
                />
              )}
            </AnimatePresence>
            <Button
              variant="primary"
              style={{
                fontWeight: 800,
                border: "none",
                width: "100%",
                height: btnHeight,
                whiteSpace: "nowrap",
                padding: "0 1.25rem",
                fontSize: "0.9rem",
                background: "#00f2ff",
                color: "#000"
              }}
              onClick={onRealEnvidoClick}
            >
              ¡REAL ENVIDO!
            </Button>
          </div>
        )}
        {pendingAction.type === "envido" && pendingAction.level === 3 && (
          <Button
            variant="primary"
            style={{
              fontWeight: 800,
              border: "none",
              flex: 1,
              minWidth: "140px",
              height: btnHeight,
              whiteSpace: "nowrap",
              padding: "0 1.25rem",
              fontSize: "0.9rem",
              background: "#00f2ff",
              color: "#000"
            }}
            onClick={() => handleCall("envido", 4, "player")}
          >
            ¡FALTA ENVIDO!
          </Button>
        )}
        {pendingAction.type === "truco" && pendingAction.level < 3 && (
          <Button
            variant="secondary"
            style={{ border: "none", flex: 1, minWidth: "110px", height: btnHeight, whiteSpace: "nowrap", padding: "0 1.25rem", fontSize: "0.9rem" }}
            onClick={() => handleCall("truco", pendingAction.level + 1, "player")}
          >
            {pendingAction.level === 1 ? "¡RE-TRUCO!" : "¡VALE 4!"}
          </Button>
        )}
      </div>
    </motion.div>
  );
};
