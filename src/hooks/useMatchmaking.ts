import { useRef } from "react";
import type { MatchmakingProps } from "./matchmaking/types";
import { useMatchmakingBroadcast } from "./matchmaking/useMatchmakingBroadcast";
import { useMatchmakingHandlers } from "./matchmaking/useMatchmakingHandlers";
import { useMatchmakingNetwork } from "./matchmaking/useMatchmakingNetwork";
import { useMatchmakingEffects } from "./matchmaking/useMatchmakingEffects";

export const useMatchmaking = (props: MatchmakingProps) => {
  const { sessionId, rivalId, matchId: propMatchId, gameMode } = props;
  
  const syncRetryRef = useRef<any>(null);
  const hasStartedRef = useRef(false);
  const matchId = propMatchId || (rivalId ? [sessionId, rivalId].sort().join('_') : null);

  // 1. Broadcast logic
  const { broadcastMove, cleanupMatch } = useMatchmakingBroadcast(sessionId, gameMode, matchId);

  // 2. Handlers (processing moves)
  const { handleRemoteMove } = useMatchmakingHandlers(props, broadcastMove, syncRetryRef, hasStartedRef);

  // 3. Network (Sync & Realtime)
  useMatchmakingNetwork(props, handleRemoteMove, syncRetryRef, hasStartedRef, matchId);

  // 4. Side Effects (Score & Rounds)
  useMatchmakingEffects(props, broadcastMove);

  return { broadcastMove, cleanupMatch };
};
export type { MatchmakingProps };
