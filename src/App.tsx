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
  const [currentRoomCode, setCurrentRoomCode] = useState<string | null>(null);
  const [isCreator, setIsCreator] = useState(false);

  const syncRef = useRef<((data: any) => void) | null>(null);

  const stableHandleSync = useCallback((data: any) => {
    if (syncRef.current) syncRef.current(data);
  }, []);

  const core = useTrucoGame(sessionId, stableHandleSync);
  const actualIsHost = currentRoomCode ? isCreator : (sessionId && core.rivalId ? sessionId < core.rivalId : false);

  const { broadcastMove, cleanupMatch } = useMatchmaking({
    sessionId, user, gameMode: core.gameMode, rivalId: core.rivalId, 
    isHost: actualIsHost, 
    matchId: currentRoomCode, // Use the room code as match identifier
    gameState: core.gameState,
    playerHand: core.playerHand, playedCards: core.playedCards, starterIdx: core.starterIdx,
    cpuHandRef: core.cpuHandRef, isRoundEnding: core.isRoundEnding, isGameStarting: core.isGameStarting,
    setGameState: core.setGameState, setRivalName: core.setRivalName, resetRound: core.resetRound,
    playCardRemote: core.playCardRemote, 
    wrappedHandleCall: (t: any, l: number, c: PlayerRole, r: boolean) => wrappedHandleCall(t, l, c, r),
    wrappedHandleResponse: (w: boolean, r: boolean) => wrappedHandleResponse(w, r),
    handleMazo: core.handleMazo, setScore: core.setScore, score: core.score,
    setIsGameStarting: core.setIsGameStarting, setShowCountdown: core.setShowCountdown,
    setMaxPoints: core.setMaxPoints,
    setIsHost: core.setIsHost, setMyIndex: core.setMyIndex
  });

  useEffect(() => {
    core.setIsHost(actualIsHost);
    core.setMyIndex(actualIsHost ? 0 : 1);
  }, [actualIsHost, core.setIsHost, core.setMyIndex]);

  useEffect(() => {
    syncRef.current = (data: any) => {
      if (core.gameMode === "multiplayer" && actualIsHost) {
        broadcastMove({
          type: 'sync',
          playerHand: data.playerHand,
          cpuHand: data.cpuHand,
          starter: data.starter
        });
      }
    };
  }, [core.gameMode, actualIsHost, broadcastMove]);

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

  const startGameWithSync = (mode: GameMode, points: number, rName?: string, rId?: string, isCreatorFlag?: boolean, roomCode?: string) => {
    const isHostForThisMatch = mode === "multiplayer" ? (isCreatorFlag || false) : false;
    setIsCreator(isHostForThisMatch);
    setCurrentRoomCode(roomCode || null);
    
    if (mode === "multiplayer") {
      const actualIsHost = isHostForThisMatch;
      core.setIsHost(actualIsHost);
      core.setMyIndex(actualIsHost ? 0 : 1);

      if (actualIsHost) {
        core.setGameMode(mode);
        core.setRivalId(rId || "");
        core.setRivalName(rName || "RIVAL");
        const syncData = core.startGame(mode, rName || "RIVAL", rId || "", points);
        if (syncData) {
        setTimeout(() => {
          console.log("Host enviando cartas iniciales vía broadcastMove...", roomCode);
          broadcastMove({ 
            type: 'sync', 
            starter: syncData.starter, 
            playerHand: syncData.playerHand, 
            cpuHand: syncData.cpuHand,
            maxPoints: points,
            senderId: sessionId,
            senderName: user?.user_metadata?.full_name?.split(' ')[0] || "HOST"
          }, roomCode);
        }, 1000);
        core.setIsGameStarting(true);
        core.setShowCountdown(true);
        setTimeout(() => {
          core.setIsGameStarting(false);
          core.setShowCountdown(false);
        }, 2500);
        }
      } else {
        // Guest MUST set "playing" to see the board, but doesn't startGame()
        core.setGameMode(mode);
        core.setRivalId(rId || "");
        core.setRivalName(rName || "RIVAL");
        core.setMaxPoints(points);
        core.setGameState("playing"); 
        core.setIsGameStarting(true);
        core.setShowCountdown(true);
        setTimeout(() => {
          core.setIsGameStarting(false);
          core.setShowCountdown(false);
        }, 2500);
      }
    } else {
      // Local modes
      core.startGame(mode, rName || "CPU", rId || "", points);
    }
  };

  const handleConfirmExit = () => {
    cleanupMatch(); // Clean up the Supabase record
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
            rivalName={core.rivalName}
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
