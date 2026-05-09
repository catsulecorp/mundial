import { useEffect } from "react";
// import type { GameMode } from "../lib/truco/types";
import { useTrucoState } from "./truco/useTrucoState";
import { useTrucoTurn } from "./truco/useTrucoTurn";
import { useTrucoLogic } from "./truco/useTrucoLogic";
import { useTrucoHandlers } from "./truco/useTrucoHandlers";
import { useTrucoEffects } from "./truco/useTrucoEffects";

/**
 * Main Game Engine Hook (Modularized)
 * Orchestrates state, turn calculation, logic, and effects.
 */
export const useTrucoCore = (_sessionId: string | null) => {
  const state = useTrucoState();
  const logic = useTrucoLogic(state);
  const handlers = useTrucoHandlers(state, logic);
  
  const { 
    gameState, gameMode, playedCards, starterIdx, handWinners, isRoundEnding, isCooldown, pendingAction
  } = state;

  const whoseTurn = useTrucoTurn(
    gameState, gameMode, playedCards, starterIdx, handWinners, isRoundEnding, isCooldown, pendingAction, state.myIndex
  );

  // Initialize Effects
  useTrucoEffects(state, logic);

  // Debug Busy State & Turn
  useEffect(() => {
    if (gameState === "playing") {
      // Logic silenced
    }
  }, [isRoundEnding, isCooldown, pendingAction, gameState, whoseTurn, gameMode, state.isGameStarting]);

  // Unified API
  return {
    ...state,
    ...logic,
    ...handlers,
    whoseTurn,
    isBusy: isRoundEnding || isCooldown || pendingAction !== null || state.isGameStarting
  };
};
