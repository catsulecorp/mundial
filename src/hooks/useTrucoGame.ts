import React, { useCallback } from "react";
import { useTrucoCore } from "./useTrucoCore";
import { useTrucoCPU } from "./useTrucoCPU";
import type { Card, PlayerRole, GameMode } from "../lib/truco/types";

export function useTrucoGame(sessionId: string | undefined, onSync?: (data: any) => void) {
  const core = useTrucoCore(sessionId || "local");

  const [isCpuThinking, setIsCpuThinking] = React.useState(false);

  // AI Logic - Only active in non-multiplayer modes
  useTrucoCPU({
    gameState: core.gameState,
    gameMode: core.gameMode,
    playedCards: core.playedCards,
    handWinners: core.handWinners,
    pendingAction: core.pendingAction,
    isRoundEnding: core.isRoundEnding,
    isCooldown: core.isCooldown,
    whoseTurn: core.whoseTurn,
    cpuHandRef: core.cpuHandRef,
    cpuPartnerHandRef: core.cpuPartnerHandRef,
    cpuOpponent2HandRef: core.cpuOpponent2HandRef,
    isCpuThinking,
    trucoState: core.trucoState,
    envidoState: core.envidoState,
    setIsCpuThinking, 
    playCard: (card) => {
      const owner = core.whoseTurn;
      if (!owner) return;
      
      // Use the core's official playCard logic but adapted for CPU
      if (core.isBusy || core.isRoundEnding || core.pendingAction) return;

      core.setPlayedCards((prev: any) => [...prev, { 
        ...card, 
        owner: owner as any, 
        id: `${card.id}_cpu_${Date.now()}`,
        rotation: 0, x: 0, y: 0, instanceId: `cpu_${card.id}_${Date.now()}`
      }]);
      if (owner === "cpu") core.setCpuHandCount(prev => Math.max(0, prev - 1));
      else if (owner === "partner") core.setCpuPartnerHandCount(prev => Math.max(0, prev - 1));
      else if (owner === "cpu2") core.setCpuOpponent2HandCount(prev => Math.max(0, prev - 1));
    },
    handleCall: (type, level, caller) => core.handleCall(type, level, caller),
    handleResponse: (accept) => core.handleResponse(accept, true)
  });

  const startGame = useCallback((mode: GameMode, _rName: string, rId: string, points: number) => {
    core.setGameMode(mode);
    core.setGameState("playing");
    core.setScore({ player: 0, cpu: 0 });
    core.setRivalId(rId || null);
    core.setMaxPoints(points);
    core.setIsGameStarting(true);
    core.setShowCountdown(true);
    core.clearRoundData(); // Clear field immediately
    
    // Generate data immediately to return it for sync
    const data = core.generateRoundData();
    
    // In multiplayer, we wait for the "ready" handshake from the guest.
    // In local mode, we start automatically after 2s.
    setTimeout(() => {
      core.applyRoundData(data);
      if (mode !== "multiplayer") {
        core.setIsGameStarting(false);
        core.setShowCountdown(false);
      }
    }, 2000);

    if (onSync && data) onSync(data);
    return data;
  }, [core, onSync]);

  return {
    ...core,
    startGame,
    isCpuThinking: false,
    scorePopups: core.scorePopups,
    handleRestartGame: () => core.resetRound(),
    playCardRemote: (card: Card, owner: PlayerRole) => {
      core.setPlayedCards((prev: any) => [...prev, { 
        ...card, 
        owner, 
        id: `${card.id}_rem_${Date.now()}`,
        rotation: 0, x: 0, y: 0, instanceId: `rem_${card.id}_${Date.now()}`
      }]);
      if (owner === "cpu") core.setCpuHandCount(prev => Math.max(0, prev - 1));
      else if (owner === "partner") core.setCpuPartnerHandCount(prev => Math.max(0, prev - 1));
      else if (owner === "cpu2") core.setCpuOpponent2HandCount(prev => Math.max(0, prev - 1));
    }
  };
}
