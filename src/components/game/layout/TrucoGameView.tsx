import React from "react";
import { motion } from "framer-motion";
import { Scoreboard } from "./Scoreboard";
import { GameSidebar } from "./GameSidebar";
import { GameField } from "../core/GameField";
import { CPUHands } from "../core/CPUHands";
import { GameModals } from "../modals/GameModals";
import { GameTopBar } from "../controls/GameTopBar";
import { GameBottomBar } from "../controls/GameBottomBar";
import { Zap } from "lucide-react";
import type { GameMode, PlayerRole } from "../../../lib/truco/types";

interface TrucoGameViewProps {
  user: any;
  gameMode: GameMode;
  gameState: string;
  playerHand: any[];
  playedCards: any[];
  cpuHandCount: number;
  cpuPartnerHandCount: number;
  score: any;
  activeCall: any;
  trucoState: any;
  envidoState: any;
  pendingAction: any;
  handWinners: any[];
  handWinningCardIds: string[];
  scorePopups: any[];
  winnerModal: any;
  rivalName: string;
  isBusy: boolean;
  isRoundEnding: boolean;
  whoseTurn: PlayerRole | null;
  maxPoints: number;
  showCountdown: boolean;
  roundWinningCardId: string | null;
  cpuPartnerHandRef: any;
  showExitModal: boolean;
  onExitRequest: () => void;
  onRestartGame: () => void;
  onPlayCard: (card: any) => void;
  onHandleCall: (type: any, level: number, caller: PlayerRole) => void;
  onHandleResponse: (accept: boolean) => void;
  onHandleMazo: () => void;
  onCloseExit: () => void;
  onConfirmExit: () => void;
}

export const TrucoGameView: React.FC<TrucoGameViewProps> = ({
  user, gameMode, gameState, playerHand, playedCards, cpuHandCount, cpuPartnerHandCount,
  score, activeCall, trucoState, envidoState, pendingAction, handWinners, handWinningCardIds,
  scorePopups, winnerModal, rivalName, isBusy, isRoundEnding, whoseTurn, maxPoints,
  showCountdown, roundWinningCardId, cpuPartnerHandRef, showExitModal,
  onExitRequest, onRestartGame, onPlayCard, onHandleCall, onHandleResponse, onHandleMazo,
  onCloseExit, onConfirmExit
}) => {
  // console.log("TrucoGameView rendering with rivalName:", rivalName);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="game-container"
      style={{
        width: "100vw",
        height: "100dvh",
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url("/playground.png")`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        overflowY: "auto",
        overflowX: "hidden",
        position: "relative",
        padding: "1rem"
      }}
    >
      <GameTopBar onExit={onExitRequest} />

      {/* Bottom Left: Points Indicator */}
      <div
        className="points-indicator points-indicator-fixed"
        style={{
          background: "rgba(255, 255, 255, 0.1)",
          backdropFilter: "blur(12px)",
          height: "40px",
          borderRadius: "1rem",
          padding: "0 1.25rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "0.6rem",
          border: "1px solid rgba(255, 255, 255, 0.2)",
          color: "white",
          pointerEvents: "none"
        }}
      >
        <Zap size={16} fill="currentColor" />
        <span style={{ fontWeight: 900, fontSize: "0.85rem", letterSpacing: "0.1em", fontStyle: "italic" }}>A {maxPoints} PUNTOS</span>
      </div>

      {/* Responsive Scoreboard: Rival on Top (A), Player on Bottom (B) */}
      <div className="game-scoreboard-wrapper">
        <Scoreboard
          scoreA={score.cpu}
          scoreB={score.player}
          labelA={(rivalName || (gameMode === "multiplayer" ? "RIVAL" : "CPU")).toUpperCase()}
          labelB={user ? (user.user_metadata.full_name?.split(' ')[0] || user.user_metadata.name?.split(' ')[0] || user.email.split('@')[0]).toUpperCase() : "VOS"}
          popups={scorePopups}
        />
      </div>

      {gameMode !== "2v2" && <GameSidebar maxPoints={maxPoints} />}

      <div style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        gap: "0.5rem",
        width: "100%",
        maxWidth: gameMode === "2v2" ? "1200px" : "860px",
        marginTop: "4.5rem"
      }}>
        <CPUHands
          gameMode={gameMode}
          cpuHandCount={cpuHandCount}
          cpuPartnerHandRef={cpuPartnerHandRef}
          cpuPartnerHandCount={cpuPartnerHandCount}
        />

        {/* Turn Pill (Always centered) */}
        {(gameMode === "1v1" || gameMode === "multiplayer") && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.25rem", marginBottom: "5px", zIndex: 100, position: "relative" }}>
            <motion.div
              animate={{ scale: [1, 1.05, 1], opacity: [0.8, 1, 0.8] }}
              transition={{ duration: 2, repeat: Infinity }}
              style={{
                padding: "0.3rem 1rem",
                background: (whoseTurn === "player" && !showCountdown) ? "rgba(0, 242, 255, 0.2)" : "rgba(255, 255, 255, 0.05)",
                border: `1px solid ${(whoseTurn === "player" && !showCountdown) ? "#00f2ff" : "rgba(255,255,255,0.2)"}`,
                borderRadius: "2rem",
                color: (whoseTurn === "player" && !showCountdown) ? "#00f2ff" : "white",
                fontSize: "0.6rem",
                fontWeight: 900,
                textTransform: "uppercase",
                letterSpacing: "0.2em",
              }}
            >
              {showCountdown ? "• • •" : (whoseTurn === "player" ? "TU TURNO" : `ESPERANDO A ${rivalName.toUpperCase()}...`)}
            </motion.div>
          </div>
        )}

        <GameField
          gameMode={gameMode}
          playedCards={playedCards}
          handWinners={handWinners}
          roundWinningCardId={roundWinningCardId}
          handWinningCardIds={handWinningCardIds}
          activeCall={activeCall}
          gameState={gameState}
          isRoundEnding={isRoundEnding}
          isGameStarting={showCountdown}
        />

        <GameBottomBar
          pendingAction={pendingAction}
          envidoState={envidoState}
          trucoState={trucoState}
          playedCards={playedCards}
          gameMode={gameMode}
          whoseTurn={whoseTurn}
          isRoundEnding={isRoundEnding}
          isBusy={isBusy}
          playerHand={playerHand}
          onPlayCard={onPlayCard}
          onHandleMazo={onHandleMazo}
          onHandleResponse={onHandleResponse}
          onHandleCall={onHandleCall}
        />
      </div>

      <GameModals
        winnerModal={winnerModal}
        showExitModal={showExitModal}
        abandonmentModal={false}
        onRestart={onRestartGame}
        onCloseExit={onCloseExit}
        onConfirmExit={onConfirmExit}
        onContinue={onCloseExit}
      />
    </motion.div>
  );
};
