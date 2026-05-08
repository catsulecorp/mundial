import { useCallback } from "react";
import type { Card } from "../../data/cards";
import { CARDS } from "../../data/cards";
import { calculateEnvido } from "../../lib/truco/engine";

export const useTrucoLogic = (state: any) => {
  const {
    setScore, setTrucoState, setEnvidoState, setPendingAction, setSuspendedTruco,
    setHandWinners, setIsRoundEnding, setIsCooldown, setStarterIdx, setDealerIdx,
    setPlayerHand, setCpuHandCount, setPlayedCards, setHandWinningCardIds, setRoundWinningCardId,
    setActiveCall, setScorePopups,
    playerHandRef, cpuHandRef, starterIdx, gameMode, lastProcessedHandRef, resetLockRef
  } = state;

  const triggerCall = useCallback((text: string, color: string = "var(--color-primary)") => {
    const id = Date.now();
    setActiveCall({ text, id, color });
    setTimeout(() => setActiveCall((prev: any) => prev?.id === id ? null : prev), 2000);
  }, [setActiveCall]);

  const addPoints = useCallback((side: "player" | "cpu", points: number) => {
    setScore((prev: any) => {
      const newScore = { ...prev, [side]: prev[side] + points };
      return newScore;
    });
    const id = Date.now() + Math.random();
    setScorePopups((prev: any) => [...prev, { id, points, side }]);
    setTimeout(() => setScorePopups((prev: any) => prev.filter((p: any) => p.id !== id)), 2500);
  }, [setScore, setScorePopups]);

  const generateRoundData = useCallback((remoteHands?: { player: Card[], cpu: Card[] }, forcedStarter?: number) => {
    let pHand, cHand;
    if (remoteHands) {
      pHand = remoteHands.player;
      cHand = remoteHands.cpu;
    } else {
      const shuffled = [...CARDS].sort(() => Math.random() - 0.5);
      pHand = shuffled.slice(0, 3);
      cHand = shuffled.slice(3, 6);
    }
    const nextStarter = forcedStarter !== undefined ? forcedStarter : (starterIdx + 1) % (gameMode === "2v2" ? 4 : 2);
    return { playerHand: pHand, cpuHand: cHand, starter: nextStarter };
  }, [gameMode, starterIdx]);

  const applyRoundData = useCallback((data: { playerHand: Card[], cpuHand: Card[], starter: number }) => {
    setIsRoundEnding(false);
    setIsCooldown(false);
    setTrucoState({ level: 0, caller: null, status: "none" });
    setEnvidoState({ level: 0, caller: null, status: "none" });
    setPendingAction(null);
    setHandWinners([]);
    setPlayedCards([]);
    setHandWinningCardIds([]);
    setRoundWinningCardId(null);
    setSuspendedTruco(null);
    lastProcessedHandRef.current = -1;
    
    setPlayerHand(data.playerHand);
    cpuHandRef.current = data.cpuHand;
    setCpuHandCount(data.cpuHand.length);
    setStarterIdx(data.starter);
    setDealerIdx((data.starter + (gameMode === "2v2" ? 3 : 1)) % (gameMode === "2v2" ? 4 : 2));
    
    setTimeout(() => { resetLockRef.current = false; }, 800);
  }, [gameMode, setTrucoState, setEnvidoState, setPendingAction, setHandWinners, setPlayedCards, setHandWinningCardIds, setRoundWinningCardId, setSuspendedTruco, setPlayerHand, setCpuHandCount, setStarterIdx, setDealerIdx, setIsRoundEnding, setIsCooldown, cpuHandRef, lastProcessedHandRef, resetLockRef]);

  const resetRound = useCallback((remoteHands?: { player: Card[], cpu: Card[] }, forcedStarter?: number) => {
    if (resetLockRef.current) return;
    resetLockRef.current = true;
    const data = generateRoundData(remoteHands, forcedStarter);
    applyRoundData(data);
    return data;
  }, [generateRoundData, applyRoundData, resetLockRef]);

  const clearRoundData = useCallback(() => {
    setPlayerHand([]);
    cpuHandRef.current = [];
    setCpuHandCount(0);
    setPlayedCards([]);
    setHandWinners([]);
    setHandWinningCardIds([]);
    setRoundWinningCardId(null);
    setPendingAction(null);
  }, [setPlayerHand, setCpuHandCount, setPlayedCards, setHandWinners, setHandWinningCardIds, setRoundWinningCardId, setPendingAction, cpuHandRef]);

  const resolveEnvido = useCallback(() => {
    const pPoints = calculateEnvido(playerHandRef.current);
    const cPoints = calculateEnvido(cpuHandRef.current);
    const isPlayerMano = starterIdx === 0;
    
    setIsCooldown(true);

    // 1st speaker (Mano)
    setTimeout(() => {
      if (isPlayerMano) {
        const text = pPoints >= 10 ? `¡TENGO ${pPoints}!` : `TENGO ${pPoints}`;
        triggerCall(text, "var(--color-accent)");
      } else {
        const text = cPoints >= 10 ? `¡TENGO ${cPoints}!` : `TENGO ${cPoints}`;
        triggerCall(text, "var(--color-secondary)");
      }

      // 2nd speaker (Response)
      setTimeout(() => {
        let pts = 0;
        if (state.envidoState.level === 4) {
          const leaderScore = Math.max(state.score.player, state.score.cpu);
          const target = (state.maxPoints === 30 && leaderScore < 15) ? 15 : state.maxPoints;
          pts = Math.max(1, target - leaderScore);
        } else {
          pts = state.envidoState.level === 3 ? 3 : (state.envidoState.level === 2 ? 4 : 2);
        }
        
        const pWins = pPoints > cPoints || (pPoints === cPoints && isPlayerMano);
        
        if (isPlayerMano) {
          if (pWins) {
            triggerCall("¡SON BUENAS!", "var(--color-secondary)");
            addPoints("player", pts);
          } else {
            triggerCall(`¡${cPoints} SON MEJORES!`, "var(--color-secondary)");
            addPoints("cpu", pts);
          }
        } else {
          if (pWins) {
            triggerCall(`¡${pPoints} SON MEJORES!`, "var(--color-accent)");
            addPoints("player", pts);
          } else {
            triggerCall("¡SON BUENAS!", "var(--color-accent)");
            addPoints("cpu", pts);
          }
        }

        if (state.suspendedTruco) {
          setTimeout(() => {
            setPendingAction(state.suspendedTruco);
            setSuspendedTruco(null);
            triggerCall(
              state.suspendedTruco.level === 1 ? "¡TRUCO!" : (state.suspendedTruco.level === 2 ? "¡RE-TRUCO!" : "¡VALE 4!"),
              (state.suspendedTruco.caller === "player" || state.suspendedTruco.caller === "partner") ? "var(--color-accent)" : "var(--color-secondary)"
            );
            setIsCooldown(false);
          }, 1500);
        } else {
          setIsCooldown(false);
        }
        setEnvidoState((prev: any) => ({ ...prev, status: "finished" }));
      }, 2500);
    }, 1500);
  }, [playerHandRef, cpuHandRef, starterIdx, triggerCall, addPoints, setEnvidoState, setIsCooldown, setPendingAction, setSuspendedTruco, state.envidoState, state.score, state.maxPoints, state.suspendedTruco]);

  return {
    triggerCall, addPoints, resetRound, generateRoundData, applyRoundData, clearRoundData, resolveEnvido
  };
};
