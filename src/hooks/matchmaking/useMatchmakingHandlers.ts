import { useCallback, useRef } from "react";
import type { MatchmakingProps } from "./types";

export const useMatchmakingHandlers = (
  props: MatchmakingProps,
  broadcastMove: (payload: any, overrideId?: string) => Promise<void>,
  syncRetryRef: React.MutableRefObject<any>,
  hasStartedRef: React.MutableRefObject<boolean>
) => {
  const {
    sessionId, isHost, setIsHost, setMyIndex, setRivalName, setMaxPoints,
    setGameState, resetRound, setIsGameStarting, setShowCountdown,
    playCardRemote, wrappedHandleCall, wrappedHandleResponse, setScore, handleMazo
  } = props;

  const lastMoveRef = useRef<string>("");

  const handleRemoteMove = useCallback((move: any) => {
    if (!move || move.senderId === sessionId) return;
    
    // Deduplication check
    const moveStr = JSON.stringify(move);
    if (lastMoveRef.current === moveStr) return;
    lastMoveRef.current = moveStr;

    // console.log("Procesando movimiento remoto:", move.type);

    if (move.type === 'sync' && !isHost) {
      // Guest initialization
      hasStartedRef.current = true;
      setIsHost(false);
      setMyIndex(1);

      const { playerHand, cpuHand, starter, maxPoints, senderName } = move;
      if (senderName) setRivalName(senderName);
      if (maxPoints) setMaxPoints(maxPoints);
      
      setGameState("playing");
      resetRound({ 
        player: [...cpuHand], 
        cpu: [...playerHand] 
      }, starter);
      
      broadcastMove({ type: 'ready' });
      if (syncRetryRef.current) {
        clearInterval(syncRetryRef.current);
        syncRetryRef.current = null;
      }
      setIsGameStarting(true);
      setShowCountdown(true);
      setTimeout(() => {
        setIsGameStarting(false);
        setShowCountdown(false);
      }, 2000);
    }
    else if (move.type === 'nextRound' && !isHost) {
      hasStartedRef.current = true;
      setIsHost(false);
      setMyIndex(1);

      resetRound({ player: move.playerHand, cpu: move.cpuHand }, move.starter);
      if (move.score) setScore({ player: move.score.cpu, cpu: move.score.player });
      if (move.senderName) setRivalName(move.senderName);
      
      setIsGameStarting(true);
      setShowCountdown(true);
      setTimeout(() => {
        setIsGameStarting(false);
        setShowCountdown(false);
      }, 2000);
    }
    else if (move.type === 'playCard') playCardRemote(move.card, "cpu");
    else if (move.type === 'call') wrappedHandleCall(move.callType, move.level, "cpu", true);
    else if (move.type === 'response') wrappedHandleResponse(move.wants !== undefined ? move.wants : move.accept, true);
    else if (move.type === 'ready' && isHost) {
      setIsGameStarting(false);
      setShowCountdown(false);
    }
    else if (move.type === 'mazo') handleMazo(true);
    else if (move.type === 'scoreSync' && !isHost) {
      if (move.senderName) setRivalName(move.senderName);
      setScore({ player: move.score.cpu, cpu: move.score.player });
    }
  }, [
    sessionId, isHost, setIsHost, setMyIndex, setRivalName, setMaxPoints,
    setGameState, resetRound, setIsGameStarting, setShowCountdown,
    playCardRemote, wrappedHandleCall, wrappedHandleResponse, setScore, handleMazo,
    broadcastMove, syncRetryRef, hasStartedRef
  ]);

  return { handleRemoteMove };
};
