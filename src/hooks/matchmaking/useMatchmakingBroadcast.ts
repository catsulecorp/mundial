import { useCallback } from "react";
import { supabase } from "../../lib/supabase";
import type { GameMode } from "../../lib/truco/types";

export const useMatchmakingBroadcast = (
  sessionId: string,
  gameMode: GameMode,
  matchId: string | null
) => {
  const broadcastMove = useCallback(async (payload: any, overrideId?: string) => {
    const finalId = overrideId || matchId;
    if (!finalId || (gameMode !== "multiplayer" && !overrideId)) return;

    const { error } = await supabase
      .from('game_sync')
      .upsert({ 
        match_id: finalId, 
        last_move: { ...payload, senderId: sessionId },
        updated_at: new Date().toISOString()
      }, { onConflict: 'match_id' });

    if (error) console.error("Error syncing move:", error);
  }, [gameMode, matchId, sessionId]);

  const cleanupMatch = useCallback(async (overrideId?: string) => {
    const finalId = overrideId || matchId;
    if (!finalId) return;
    await supabase.from('game_sync').delete().eq('match_id', finalId);
  }, [matchId]);

  return { broadcastMove, cleanupMatch };
};
