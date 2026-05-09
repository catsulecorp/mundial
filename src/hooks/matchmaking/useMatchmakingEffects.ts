import { useEffect, useRef } from "react";
import type { MatchmakingProps } from "./types";

export const useMatchmakingEffects = (
  props: MatchmakingProps,
  broadcastMove: (payload: any) => Promise<void>
) => {
  const {
    gameMode, isHost, isGameStarting, score, user,
    gameState, isRoundEnding, playerHand, playedCards, starterIdx, cpuHandRef
  } = props;

  // Sync score
  useEffect(() => {
    if (gameMode === "multiplayer" && isHost && !isGameStarting) {
      broadcastMove({ 
        type: 'scoreSync', 
        score,
        senderName: user?.user_metadata?.full_name?.split(' ')[0] || "HOST" 
      });
    }
  }, [score.player, score.cpu, gameMode, isHost, isGameStarting, broadcastMove, user]);

  // Round transitions
  const isFirstDealRef = useRef(true);
  const prevIsRoundEndingRef = useRef(false);
  
  useEffect(() => {
    if (gameState !== "playing") isFirstDealRef.current = true;
  }, [gameState]);

  useEffect(() => {
    if (gameMode !== "multiplayer" || !isHost || gameState !== "playing" || isGameStarting) return;

    if (prevIsRoundEndingRef.current === true && isRoundEnding === false) {
      const timer = setTimeout(() => {
        broadcastMove({
          type: 'nextRound',
          starter: starterIdx,
          playerHand: cpuHandRef.current,
          cpuHand: playerHand,
          score: score,
          senderName: user?.user_metadata?.full_name?.split(' ')[0] || "HOST"
        });
      }, 1500);
      prevIsRoundEndingRef.current = false;
      return () => clearTimeout(timer);
    }

    if (isRoundEnding === false && playerHand.length === 3 && playedCards.length === 0 && isFirstDealRef.current) {
      isFirstDealRef.current = false;
    }
    prevIsRoundEndingRef.current = isRoundEnding;
  }, [gameMode, isHost, gameState, isGameStarting, isRoundEnding, playerHand.length, playedCards.length, starterIdx, broadcastMove, cpuHandRef, playerHand, score, user]);

  return null;
};
