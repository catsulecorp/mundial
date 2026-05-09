import { useMemo } from "react";
import type { PlayerRole, GameMode, PlayedCard } from "../../lib/truco/types";

export const useTrucoTurn = (
  gameState: string,
  gameMode: GameMode,
  playedCards: PlayedCard[],
  starterIdx: number,
  handWinners: any[],
  isRoundEnding: boolean,
  isCooldown: boolean,
  pendingAction: any,
  myIndex: number = 0
) => {
  const whoseTurn = useMemo(() => {
    if (gameState !== "playing" || isRoundEnding || isCooldown || pendingAction !== null) return null;
    
    const cardsPerHand = gameMode === "2v2" ? 4 : 2;
    const currentHandIdx = Math.floor(playedCards.length / cardsPerHand);
    const cardsInCurrentHand = playedCards.length % cardsPerHand;
    
    // Absolute mapping logic
    const getRoleFromIdx = (idx: number): PlayerRole => {
      if (gameMode === "multiplayer") {
        return idx === myIndex ? "player" : "cpu";
      }
      // Single player / 2v2 logic
      if (idx === 0) return "player";
      if (idx === 1) return "cpu";
      if (idx === 2) return "partner";
      return "cpu2";
    };

    if (currentHandIdx === 0) {
      const turnIdx = (starterIdx + cardsInCurrentHand) % (gameMode === "2v2" ? 4 : 2);
      return getRoleFromIdx(turnIdx);
    }
    
    const lastWinner = handWinners[currentHandIdx - 1];
    if (cardsInCurrentHand === 0 && currentHandIdx > 0 && !lastWinner) return null;
    
    if (!lastWinner || lastWinner === "draw") {
      const turnIdx = (starterIdx + cardsInCurrentHand) % (gameMode === "2v2" ? 4 : 2);
      return getRoleFromIdx(turnIdx);
    }
    
    // For hands 2 and 3, winners are already relative roles ("player", "cpu", etc.)
    // But we need to ensure the order is correct.
    const roles: PlayerRole[] = gameMode === "2v2" ? ["player", "cpu2", "partner", "cpu"] : ["player", "cpu"];
    const winnerStartIdx = roles.indexOf(lastWinner as PlayerRole);
    return roles[(winnerStartIdx + cardsInCurrentHand) % roles.length];
  }, [gameState, starterIdx, playedCards.length, gameMode, handWinners, isCooldown, isRoundEnding, pendingAction, myIndex]);

  return whoseTurn;
};
