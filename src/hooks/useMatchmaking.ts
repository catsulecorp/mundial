import { useEffect, useRef, useCallback } from "react";
import { supabase } from "../lib/supabase";
import type { PlayerRole, GameMode } from "../lib/truco/types";

interface MatchmakingProps {
  sessionId: string;
  user: any;
  gameMode: GameMode;
  rivalId: string | null;
  isHost: boolean;
  matchId?: string | null;
  gameState: string;
  playerHand: any[];
  playedCards: any[];
  starterIdx: number;
  cpuHandRef: any;
  isRoundEnding: boolean;
  isGameStarting: boolean;
  setGameState: (state: any) => void;
  setRivalName: (name: string) => void;
  resetRound: (hands?: any, starter?: number) => void;
  playCardRemote: (card: any, owner: PlayerRole) => void;
  wrappedHandleCall: (type: any, level: number, caller: PlayerRole, isRemote: boolean) => void;
  wrappedHandleResponse: (accept: boolean, isRemote: boolean) => void;
  handleMazo: (isRemote: boolean) => void;
  setScore: (score: any) => void;
  score: any;
  setIsGameStarting: (val: boolean) => void;
  setShowCountdown: (val: boolean) => void;
  setMaxPoints: (val: number) => void;
}

export const useMatchmaking = ({
  sessionId, user, gameMode, rivalId, isHost, matchId: propMatchId, gameState, playerHand, playedCards, starterIdx,
  cpuHandRef, isRoundEnding, isGameStarting,
  setGameState, setRivalName, resetRound, playCardRemote, wrappedHandleCall, wrappedHandleResponse, handleMazo, setScore, score,
  setIsGameStarting, setShowCountdown, setMaxPoints
}: MatchmakingProps) => {
  const syncRetryRef = useRef<any>(null);
  const abandonmentTimeoutRef = useRef<any>(null);
  const lastMoveRef = useRef<string>("");
  const matchId = propMatchId || (rivalId ? [sessionId, rivalId].sort().join('_') : null);

  const broadcastMove = useCallback(async (payload: any, overrideId?: string) => {
    const finalId = overrideId || matchId;
    // If we have an overrideId, we force the broadcast regardless of the current gameMode state
    // to avoid stale closure issues during initial setup.
    if (!finalId || (gameMode !== "multiplayer" && !overrideId)) return;

    console.log("¡ENVIANDO MENSAJE A DB!", finalId, payload.type);
    const { error } = await supabase
      .from('game_sync')
      .upsert({ 
        match_id: finalId, 
        last_move: { ...payload, senderId: sessionId },
        updated_at: new Date().toISOString()
      }, { onConflict: 'match_id' });

    if (error) console.error("Error syncing move:", error);
  }, [gameMode, matchId, sessionId]);

  const handleRemoteMove = useCallback((move: any) => {
    if (!move || move.senderId === sessionId) return;
    
    // Deduplication check
    const moveStr = JSON.stringify(move);
    if (lastMoveRef.current === moveStr) return;
    lastMoveRef.current = moveStr;

    console.log("Procesando movimiento remoto:", move);
    if (move.type === 'playCard') playCardRemote(move.card, "cpu");
    else if (move.type === 'call') wrappedHandleCall(move.callType, move.level, "cpu", true);
    else if (move.type === 'response') wrappedHandleResponse(move.wants !== undefined ? move.wants : move.accept, true);
    else if (move.type === 'sync' && !isHost) {
      console.log("Sincronización inicial aplicada (Modo Invitado).");
      const { playerHand, cpuHand, starter, maxPoints, senderName } = move;
      
      if (senderName) {
        console.log("Actualizando nombre del rival desde SYNC:", senderName);
        setRivalName(senderName);
      }
      if (maxPoints) setScore({ player: 0, cpu: 0 });
      if (maxPoints) setMaxPoints(maxPoints);
      
      setGameState("playing");
      
      resetRound({ 
        player: [...cpuHand], 
        cpu: [...playerHand] 
      }, 1 - (starter || 0));
      
      // Broadcast that we are ready to start
      broadcastMove({ type: 'ready' });

      setTimeout(() => {
        setIsGameStarting(false);
        setShowCountdown(false);
      }, 1500);
    }
    else if (move.type === 'ready' && isHost) {
      console.log("¡Invitado listo! Arrancando partida...");
      setIsGameStarting(false);
      setShowCountdown(false);
    }
    else if (move.type === 'mazo') handleMazo(true);
    else if (move.type === 'scoreSync') setScore({ player: move.score.cpu, cpu: move.score.player });
    else if (move.type === 'nextRound') {
      resetRound({ player: [...move.cpuHand], cpu: [...move.playerHand] }, (1 - move.starter));
    }
    else if (move.type === 'room_state') {
      if (isHost && move.guestName) {
        console.log("Actualizando nombre del rival (Invitado):", move.guestName);
        setRivalName(move.guestName);
      }
      else if (!isHost && move.creatorName) {
        console.log("Actualizando nombre del rival (Creador):", move.creatorName);
        setRivalName(move.creatorName);
      }
    }
  }, [sessionId, isHost, playCardRemote, wrappedHandleCall, wrappedHandleResponse, setScore, setMaxPoints, setGameState, resetRound, broadcastMove, setIsGameStarting, setShowCountdown, handleMazo, setRivalName]);

  const fetchInitialState = useCallback(async () => {
    if (!matchId) return;
    console.log("Intentando recuperar estado inicial para match:", matchId);
    const { data, error } = await supabase
      .from('game_sync')
      .select('last_move')
      .eq('match_id', matchId)
      .maybeSingle();
    
    if (!error && data?.last_move) {
      if (data.last_move.type === 'sync') {
        console.log("¡Sync inicial encontrado vía Poll!");
        handleRemoteMove(data.last_move);
        if (syncRetryRef.current) {
          clearInterval(syncRetryRef.current);
          syncRetryRef.current = null;
        }
      }
    }
  }, [matchId, handleRemoteMove]);

  // Sync initial game state and listen for changes
  useEffect(() => {
    if (gameMode !== "multiplayer" || !user || !rivalId || !matchId) return;
    
    // Initial check
    fetchInitialState();

    // Retry every 1.5s if we are the guest and haven't started
    if (!isHost) {
      if (syncRetryRef.current) clearInterval(syncRetryRef.current);
      syncRetryRef.current = setInterval(() => {
        fetchInitialState();
      }, 1500);
    }

    // 1. Listen for changes in the game_sync table (ALL changes: INSERT and UPDATE)
    const channel = supabase
      .channel(`table_sync_${matchId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'game_sync', filter: `match_id=eq.${matchId}` },
        (payload) => {
          const move = (payload.new as any)?.last_move;
          if (!move) return;
          if (move.senderId === sessionId) return; // Skip our own moves

          console.log("¡MENSAJE RECIBIDO!", move.type, move);
          handleRemoteMove(move);
        }
      )
      .on('presence', { event: 'join' }, ({ newPresences }) => {
        const rival = newPresences.find((p: any) => p.presence_key === rivalId);
        if (rival) {
          if (rival.name) setRivalName(rival.name);
          if (abandonmentTimeoutRef.current) {
            clearTimeout(abandonmentTimeoutRef.current);
            abandonmentTimeoutRef.current = null;
          }
        }
      })
      .subscribe((status) => {
        console.log("Estado de canal Supabase:", status);
      });

    return () => {
      channel.unsubscribe();
      if (syncRetryRef.current) clearInterval(syncRetryRef.current);
    };
  }, [matchId, isHost, sessionId, handleRemoteMove]);

  // Sync score (only if game is already active and not starting)
  useEffect(() => {
    if (gameMode === "multiplayer" && isHost && !isGameStarting) {
      broadcastMove({ type: 'scoreSync', score });
    }
  }, [score.player, score.cpu, gameMode, isHost, isGameStarting, broadcastMove]);

  // Broadcast nextRound (only if not starting and not the first deal)
  const isFirstDealRef = useRef(true);
  
  useEffect(() => {
    if (gameState !== "playing") {
      isFirstDealRef.current = true;
    }
  }, [gameState]);

  useEffect(() => {
    if (gameMode === "multiplayer" && isHost && gameState === "playing" && !isGameStarting && isRoundEnding === false && playerHand.length === 3 && playedCards.length === 0) {
      if (isFirstDealRef.current) {
        isFirstDealRef.current = false;
        return;
      }

      const timer = setTimeout(() => {
        console.log("Broadcasting nextRound sync...");
        broadcastMove({
          type: 'nextRound',
          starter: starterIdx,
          playerHand: playerHand,
          cpuHand: cpuHandRef.current
        });
      }, 1000); // Slightly more delay to ensure stability
      return () => clearTimeout(timer);
    }
  }, [playerHand.length, playedCards.length, isRoundEnding, gameMode, isHost, starterIdx, broadcastMove, gameState]);

  // Cleanup function to delete the record when game ends
  const cleanupMatch = useCallback(async () => {
    if (isHost && matchId) {
      console.log("Cleaning up game sync record...");
      await supabase
        .from('game_sync')
        .delete()
        .eq('match_id', matchId);
    }
  }, [isHost, matchId]);

  return { broadcastMove, cleanupMatch };
};

