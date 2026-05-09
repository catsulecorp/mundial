import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../../ui/Button";
import type { PlayerRole, GameMode, EnvidoState, TrucoState, PlayedCard } from "../../../lib/truco/types";
import { PendingChallenge } from "./PendingChallenge";
import { EnvidoSubMenu } from "./EnvidoSubMenu";

interface GameActionsProps {
  pendingAction: any;
  envidoState: EnvidoState;
  trucoState: TrucoState;
  playedCards: PlayedCard[];
  gameMode: GameMode;
  whoseTurn: PlayerRole | null;
  isRoundEnding: boolean;
  isBusy: boolean;
  hideMazo?: boolean;
  handleResponse: (accept: boolean) => void;
  handleCall: (type: "truco" | "envido", level: number, caller: PlayerRole) => void;
  handleMazo: () => void;
  triggerCall: (text: string, color?: string) => void;
}

export const GameActions: React.FC<GameActionsProps> = ({
  pendingAction,
  envidoState,
  trucoState,
  playedCards,
  gameMode,
  whoseTurn,
  isRoundEnding,
  isBusy,
  hideMazo = false,
  handleResponse,
  handleCall,
  handleMazo
}) => {
  const [showEnvidoOptions, setShowEnvidoOptions] = useState(false);
  const [confirmEnvido, setConfirmEnvido] = useState(false);
  const confirmTimeoutRef = React.useRef<any>(null);

  const onEnvidoClick = () => {
    if (confirmEnvido) {
      handleCall("envido", 1, "player");
      setConfirmEnvido(false);
      setShowEnvidoOptions(false);
      if (confirmTimeoutRef.current) clearTimeout(confirmTimeoutRef.current);
    } else {
      setConfirmEnvido(true);
      setShowEnvidoOptions(true);
      
      if (confirmTimeoutRef.current) clearTimeout(confirmTimeoutRef.current);
      confirmTimeoutRef.current = setTimeout(() => {
        setConfirmEnvido(false);
        setShowEnvidoOptions(false);
      }, 2000);
    }
  };

  const isHeroTeamTurn = whoseTurn === "player" || whoseTurn === "partner";

  // Reset hover state when round ends or envido status changes
  React.useEffect(() => {
    setShowEnvidoOptions(false);
    setConfirmEnvido(false);
  }, [isRoundEnding, envidoState.status]);

  return (
    <div className="game-actions" style={{
      height: "80px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      position: "relative",
      zIndex: 1000
    }}>
      <AnimatePresence mode="wait">
        {pendingAction && (pendingAction.caller !== "player" && pendingAction.caller !== "partner") ? (
          <PendingChallenge 
            pendingAction={pendingAction}
            gameMode={gameMode}
            envidoState={envidoState}
            playedCards={playedCards}
            handleResponse={handleResponse}
            handleCall={handleCall}
          />
        ) : (
          <motion.div
            key="actions"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", justifyContent: "center" }}
          >
            {/* Envido Button with Hover Options */}
            {envidoState.status === "none" && 
             trucoState.status === "none" && 
             playedCards.filter(c => c.owner === "player").length === 0 && (
              <div 
                style={{ position: 'relative' }}
                onMouseEnter={() => {
                  if (window.innerWidth > 768) setShowEnvidoOptions(true);
                }}
                onMouseLeave={() => {
                  if (!confirmEnvido) setShowEnvidoOptions(false);
                }}
              >
                <AnimatePresence>
                  {showEnvidoOptions && !isRoundEnding && isHeroTeamTurn && (
                    <EnvidoSubMenu 
                      disabled={!isHeroTeamTurn || isBusy || pendingAction !== null}
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
                  disabled={!isHeroTeamTurn || isBusy || pendingAction !== null}
                  onClick={onEnvidoClick}
                >
                  ¡ENVIDO!
                </Button>
              </div>
            )}

            {/* Truco Button */}
            {trucoState.status !== "finished" && (
              (trucoState.status === "none" || (trucoState.status === "accepted" && trucoState.caller === "cpu")) && (
                <Button
                  variant="secondary"
                  disabled={!isHeroTeamTurn || isBusy || pendingAction !== null}
                  onClick={() => handleCall("truco", trucoState.level === 0 ? 1 : trucoState.level + 1, "player")}
                >
                  {trucoState.status === "none" ? "¡TRUCO!" : trucoState.level === 1 ? "¡RE-TRUCO!" : "¡VALE 4!"}
                </Button>
              )
            )}

            {/* Mazo Button */}
            {!hideMazo && (
              <Button
                variant="white"
                disabled={!isHeroTeamTurn || isBusy || pendingAction !== null}
                onClick={() => handleMazo()}
                style={{ minWidth: '100px' }}
              >
                AL MAZO
              </Button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
