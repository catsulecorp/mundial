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
  pendingAction: any
) => {
  const whoseTurn = useMemo(() => {
    if (gameState !== "playing" || isRoundEnding || isCooldown || pendingAction !== null) return null;
    
    const cardsPerHand = gameMode === "2v2" ? 4 : 2;
    const currentHandIdx = Math.floor(playedCards.length / cardsPerHand);
    const cardsInCurrentHand = playedCards.length % cardsPerHand;
    
    if (currentHandIdx === 0) {
      const turnIdx = (starterIdx + cardsInCurrentHand) % (gameMode === "2v2" ? 4 : 2);
      return turnIdx === 0 ? "player" : (turnIdx === 1 ? "cpu" : (turnIdx === 2 ? "partner" : "cpu2"));
    }
    
    const lastWinner = handWinners[currentHandIdx - 1];
    if (cardsInCurrentHand === 0 && currentHandIdx > 0 && !lastWinner) return null;
    
    if (!lastWinner || lastWinner === "draw") {
      const turnIdx = (starterIdx + cardsInCurrentHand) % (gameMode === "2v2" ? 4 : 2);
      return turnIdx === 0 ? "player" : (turnIdx === 1 ? "cpu" : (turnIdx === 2 ? "partner" : "cpu2"));
    }
    
    const roles: PlayerRole[] = gameMode === "2v2" ? ["player", "cpu2", "partner", "cpu"] : ["player", "cpu"];
    const winnerStartIdx = roles.indexOf(lastWinner as PlayerRole);
    return roles[(winnerStartIdx + cardsInCurrentHand) % roles.length];
  }, [gameState, starterIdx, playedCards.length, gameMode, handWinners, isCooldown, isRoundEnding, pendingAction]);

  return whoseTurn;
};
