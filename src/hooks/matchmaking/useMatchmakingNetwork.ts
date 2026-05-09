import { useEffect, useCallback } from "react";
import { supabase } from "../../lib/supabase";
import type { MatchmakingProps } from "./types";

export const useMatchmakingNetwork = (
  props: MatchmakingProps,
  handleRemoteMove: (move: any) => void,
  syncRetryRef: React.MutableRefObject<any>,
  hasStartedRef: React.MutableRefObject<boolean>,
  matchId: string | null
) => {
  const { gameMode, user, rivalId, isHost } = props;

  const fetchInitialState = useCallback(async () => {
    if (!matchId) return;
    const { data, error } = await supabase
      .from('game_sync')
      .select('last_move')
      .eq('match_id', matchId)
      .maybeSingle();
    
    if (!error && data?.last_move) {
      const type = data.last_move.type;
      // If we haven't started, look for sync. If started, look for score/nextRound.
      if (!hasStartedRef.current && type === 'sync') handleRemoteMove(data.last_move);
      else if (hasStartedRef.current && (type === 'scoreSync' || type === 'nextRound')) handleRemoteMove(data.last_move);
    }
  }, [matchId, handleRemoteMove, hasStartedRef]);

  useEffect(() => {
    if (gameMode !== "multiplayer" || !user || !rivalId || !matchId) return;
    
    fetchInitialState();
    
    // Polling fallback
    if (!isHost) {
      if (syncRetryRef.current) clearInterval(syncRetryRef.current);
      syncRetryRef.current = setInterval(fetchInitialState, 1500);
    }

    // Realtime channel
    const channel = supabase.channel(`match_${matchId}`);
    channel
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'game_sync', filter: `match_id=eq.${matchId}` }, (payload) => {
        handleRemoteMove(payload.new.last_move);
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'game_sync', filter: `match_id=eq.${matchId}` }, (payload) => {
        handleRemoteMove(payload.new.last_move);
      })
      .subscribe();

    return () => {
      if (syncRetryRef.current) clearInterval(syncRetryRef.current);
      supabase.removeChannel(channel);
    };
  }, [gameMode, user, rivalId, matchId, isHost, handleRemoteMove, fetchInitialState, syncRetryRef]);

  return { fetchInitialState };
};
