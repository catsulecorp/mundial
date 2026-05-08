import { useEffect, useRef, useCallback } from "react";
import { supabase } from "../lib/supabase";
import type { PlayerRole, GameMode } from "../lib/truco/types";

interface MatchmakingProps {
  sessionId: string;
  user: any;
  gameMode: GameMode;
  rivalId: string | null;
  isHost: boolean;
  gameState: string;
  playerHand: any[];
  playedCards: any[];
  starterIdx: number;
  playerHandRef: any;
  cpuHandRef: any;
  isRoundEnding: boolean;
  setGameState: (state: any) => void;
  setRivalName: (name: string) => void;
  resetRound: (hands?: any, starter?: number) => void;
  playCardRemote: (card: any, owner: PlayerRole) => void;
  wrappedHandleCall: (type: any, level: number, caller: PlayerRole, isRemote: boolean) => void;
  wrappedHandleResponse: (accept: boolean, isRemote: boolean) => void;
  handleMazo: (isRemote: boolean) => void;
  setScore: (score: any) => void;
  score: any;
}

export const useMatchmaking = ({
  sessionId, user, gameMode, rivalId, isHost, gameState, playerHand, playedCards, starterIdx,
  playerHandRef, cpuHandRef, isRoundEnding,
  setGameState, setRivalName, resetRound, playCardRemote, wrappedHandleCall, wrappedHandleResponse, handleMazo, setScore, score
}: MatchmakingProps) => {
  const rivalChannelRef = useRef<any>(null);
  const syncRetryRef = useRef<any>(null);
  const abandonmentTimeoutRef = useRef<any>(null);

  const broadcastMove = useCallback((payload: any) => {
    if (rivalChannelRef.current) {
      rivalChannelRef.current.send({
        type: 'broadcast',
        event: 'move',
        payload: { ...payload, senderId: sessionId }
      });
    }
  }, [sessionId]);

  // Sync initial game state (only host)
  useEffect(() => {
    if (gameMode !== "multiplayer" || !user || !rivalId) return;

    const matchId = [sessionId, rivalId].sort().join('_');
    const channel = supabase.channel(`game_${matchId}`, {
      config: { presence: { key: sessionId } }
    });
    rivalChannelRef.current = channel;

    channel
      .on('broadcast', { event: 'move' }, ({ payload }) => {
        if (payload.senderId === sessionId) return;

        if (payload.type === 'playCard') playCardRemote(payload.card, "cpu");
        else if (payload.type === 'call') wrappedHandleCall(payload.callType, payload.level, "cpu", true);
        else if (payload.type === 'response') wrappedHandleResponse(payload.wants !== undefined ? payload.wants : payload.accept, true);
        else if (payload.type === 'sync') {
          setGameState("playing");
          resetRound({ player: [...payload.cpuHand], cpu: [...payload.playerHand] }, 1 - payload.starter);
          broadcastMove({ type: 'sync_ack' });
        }
        else if (payload.type === 'sync_ack' && isHost) {
          if (syncRetryRef.current) {
            clearInterval(syncRetryRef.current);
            syncRetryRef.current = null;
          }
        }
        else if (payload.type === 'ready' && isHost) {
          if (syncRetryRef.current) clearInterval(syncRetryRef.current);
          
          const sendSync = () => {
            broadcastMove({ 
              type: 'sync', 
              playerHand: playerHandRef.current, 
              cpuHand: cpuHandRef.current,
              starter: starterIdx
            });
          };

          sendSync();
          syncRetryRef.current = setInterval(sendSync, 2000);
        }
        else if (payload.type === 'mazo') handleMazo(true);
        else if (payload.type === 'scoreSync') setScore({ player: payload.score.cpu, cpu: payload.score.player });
        else if (payload.type === 'nextRound') {
          resetRound({ player: [...payload.cpuHand], cpu: [...payload.playerHand] }, (1 - payload.starter));
        }
      })
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
      .on('presence', { event: 'leave' }, ({ leftPresences }) => {
        const rivalLeft = leftPresences.some((p: any) => p.presence_key === rivalId);
        if (rivalLeft && gameState === "playing") {
          // Handle rival leaving
        }
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({ user_id: user.id, name: user.user_metadata.full_name, presence_key: sessionId });
          if (!isHost) {
            channel.send({
              type: 'broadcast',
              event: 'move',
              payload: { type: 'ready', senderId: sessionId }
            });
          }
        }
      });

    return () => {
      channel.unsubscribe();
      rivalChannelRef.current = null;
      if (syncRetryRef.current) clearInterval(syncRetryRef.current);
    };
  }, [user?.id, rivalId, gameMode, sessionId, isHost, playerHandRef, cpuHandRef, starterIdx, playCardRemote, wrappedHandleCall, wrappedHandleResponse, handleMazo, setScore, setGameState, setRivalName, resetRound, broadcastMove, gameState]);

  // Sync score
  useEffect(() => {
    if (gameMode === "multiplayer" && isHost) {
      broadcastMove({ type: 'scoreSync', score });
    }
  }, [score.player, score.cpu, gameMode, isHost, broadcastMove]);

  // Broadcast nextRound
  useEffect(() => {
    if (gameMode === "multiplayer" && isHost && gameState === "playing" && isRoundEnding === false && playerHand.length === 3 && playedCards.length === 0) {
      const timer = setTimeout(() => {
        broadcastMove({
          type: 'nextRound',
          starter: starterIdx,
          playerHand: playerHand,
          cpuHand: cpuHandRef.current
        });
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [playerHand, playedCards.length, isRoundEnding, gameMode, isHost, starterIdx, broadcastMove, gameState, cpuHandRef]);

  return { broadcastMove };
};
