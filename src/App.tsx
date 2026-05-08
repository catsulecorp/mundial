import { useState, useRef, useEffect, useCallback } from "react";
import { LandingPage } from "./components/landing/LandingPage";
import { TrucoGameView } from "./components/game/layout/TrucoGameView";
import { supabase } from "./lib/supabase";
import { useTrucoGame } from "./hooks/useTrucoGame";
import { useMatchmaking } from "./hooks/useMatchmaking";
import { AnimatePresence } from "framer-motion";
import type { GameMode, PlayerRole } from "./lib/truco/types";

function App() {
  const [user, setUser] = useState<any>(null);
  const [sessionId] = useState(() => `sess_${Math.random().toString(36).substr(2, 9)}`);
  const [showExitModal, setShowExitModal] = useState(false);

  const syncRef = useRef<((data: any) => void) | null>(null);

  const stableHandleSync = useCallback((data: any) => {
    if (syncRef.current) syncRef.current(data);
  }, []);

  const core = useTrucoGame(sessionId, stableHandleSync);
  const isHost = sessionId && core.rivalId ? sessionId < core.rivalId : false;

  const { broadcastMove } = useMatchmaking({
    sessionId, user, gameMode: core.gameMode, rivalId: core.rivalId, isHost, gameState: core.gameState,
    playerHand: core.playerHand, playedCards: core.playedCards, starterIdx: core.starterIdx,
    playerHandRef: core.playerHandRef, cpuHandRef: core.cpuHandRef, isRoundEnding: core.isRoundEnding,
    setGameState: core.setGameState, setRivalName: core.setRivalName, resetRound: core.resetRound,
    playCardRemote: core.playCardRemote, wrappedHandleCall: (t, l, c, r) => wrappedHandleCall(t, l, c, r),
    wrappedHandleResponse: (w, r) => wrappedHandleResponse(w, r),
    handleMazo: core.handleMazo, setScore: core.setScore, score: core.score
  });

  useEffect(() => {
    syncRef.current = (data: any) => {
      if (core.gameMode === "multiplayer" && isHost) {
        broadcastMove({
          type: 'sync',
          playerHand: data.playerHand,
          cpuHand: data.cpuHand,
          starter: data.starter
        });
      }
    };
  }, [core.gameMode, isHost, broadcastMove]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const wrappedPlayCard = (card: any) => {
    if (core.isBusy) return;
    const move = core.playCard(card);
    if (move && core.gameMode === "multiplayer") {
      broadcastMove({ type: 'playCard', card });
    }
  };

  const wrappedHandleCall = (type: "truco" | "envido", level: number, caller: PlayerRole, isRemote: boolean = false) => {
    core.handleCall(type, level, caller);
    if (core.gameMode === "multiplayer" && !isRemote && caller === "player") {
      broadcastMove({ type: 'call', callType: type, level });
    }
  };

  const wrappedHandleResponse = (wants: boolean, isRemote: boolean = false) => {
    core.handleResponse(wants, isRemote);
    if (core.gameMode === "multiplayer" && !isRemote) {
      broadcastMove({ type: 'response', wants });
    }
  };

  const wrappedHandleMazo = (isRemote: boolean = false) => {
    core.handleMazo(isRemote);
    if (core.gameMode === "multiplayer" && !isRemote) {
      broadcastMove({ type: 'mazo' });
    }
  };

  const startGameWithSync = (mode: GameMode, points: number, rName?: string, rId?: string) => {
    const syncData = core.startGame(mode, rName || "CPU", rId || "", points);
    if (mode === "multiplayer" && isHost && syncData) {
      broadcastMove({ type: 'sync', starter: syncData.starter, playerHand: syncData.playerHand, cpuHand: syncData.cpuHand });
      setTimeout(() => {
        broadcastMove({ type: 'sync', starter: syncData.starter, playerHand: syncData.playerHand, cpuHand: syncData.cpuHand });
      }, 1000);
    }
  };

  const handleConfirmExit = () => {
    setShowExitModal(false);
    core.setWinnerModal(null);
    core.handleRestartGame();
    core.setRivalName("CPU");
    core.setGameState("landing");
  };

  return (
    <main style={{ minHeight: "100vh" }}>
      <AnimatePresence mode="wait">
        {core.gameState === "landing" ? (
          <LandingPage key="landing" sessionId={sessionId} onStart={startGameWithSync} />
        ) : (
          <TrucoGameView
            key="game"
            user={user}
            {...core}
            showExitModal={showExitModal}
            onExitRequest={() => setShowExitModal(true)}
            onRestartGame={core.handleRestartGame}
            onPlayCard={wrappedPlayCard}
            onHandleCall={wrappedHandleCall}
            onHandleResponse={wrappedHandleResponse}
            onHandleMazo={wrappedHandleMazo}
            onCloseExit={() => setShowExitModal(false)}
            onConfirmExit={handleConfirmExit}
          />
        )}
      </AnimatePresence>
    </main>
  );
}

export default App;
