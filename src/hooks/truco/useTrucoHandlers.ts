import { useCallback } from "react";
import type { Card } from "../../data/cards";
import type { PlayerRole } from "../../lib/truco/types";

export const useTrucoHandlers = (state: any, logic: any) => {
  const {
    setPlayerHand, setPlayedCards, setTrucoState, setEnvidoState, setPendingAction, setSuspendedTruco, setIsRoundEnding, setIsCooldown, setActiveCall,
    isRoundEnding, isCooldown, pendingAction, trucoState, envidoState, suspendedTruco, gameMode, isHost
  } = state;
  const { triggerCall, addPoints, resetRound, resolveEnvido } = logic;

  const handleMazo = useCallback((remote: boolean = false) => {
    const win = remote ? "player" : "cpu";
    triggerCall(remote ? "ME VOY AL MAZO" : "ME VOY AL MAZO", remote ? "var(--color-secondary)" : "var(--color-accent)");
    const pts = trucoState.status === "accepted"
      ? (trucoState.level + 1)
      : (trucoState.level + 1 + (envidoState.status === "none" || envidoState.status === "pending" ? 1 : 0));
    addPoints(win, pts);
    setIsRoundEnding(true);
    if (gameMode !== "multiplayer" || isHost) {
      setTimeout(() => resetRound(), 3500);
    }
  }, [trucoState.level, envidoState.status, triggerCall, addPoints, setIsRoundEnding, resetRound, isHost, gameMode]);

  const playCard = useCallback((card: Card) => {
    if (isRoundEnding || isCooldown || pendingAction) return null;
    setPlayerHand((prev: Card[]) => prev.filter(c => c.id !== card.id));
    setPlayedCards((prev: any[]) => [...prev, { ...card, owner: "player", id: `${card.id}_${Date.now()}` }]);
    return card;
  }, [isRoundEnding, isCooldown, pendingAction, setPlayerHand, setPlayedCards]);

  const handleCall = useCallback((type: "truco" | "envido", level: number, caller: PlayerRole) => {
    let text = "";
    if (type === "truco") {
      text = level === 1 ? "¡TRUCO!" : (level === 2 ? "¡RE-TRUCO!" : "¡VALE 4!");
    } else {
      if (level === 3) text = "¡REAL ENVIDO!";
      else if (level === 4) text = "¡FALTA ENVIDO!";
      else text = "¡ENVIDO!";
    }

    triggerCall(text, (caller === "player" || caller === "partner") ? "var(--color-accent)" : "var(--color-secondary)");

    if (type === "truco") {
      setTrucoState({ status: "pending", level, caller });
      setPendingAction({ type, level, caller });
    } else {
      if (pendingAction && pendingAction.type === "truco") {
        setSuspendedTruco(pendingAction);
      }
      
      setEnvidoState((prev: any) => {
        const levelPoints: Record<number, number> = { 1: 2, 2: 2, 3: 3, 4: 0 };
        const callValue = levelPoints[level] || 0;
        return { 
          status: "pending", 
          level, 
          caller, 
          prevLevel: prev.level,
          prevAccumulated: prev.accumulated || 0, // Guardamos lo que ya estaba querido
          accumulated: (prev.accumulated || 0) + callValue
        };
      });
      setPendingAction({ type, level, caller });
    }
  }, [triggerCall, pendingAction, setTrucoState, setPendingAction, setSuspendedTruco, setEnvidoState]);

  const handleResponse = useCallback((accept: boolean, remote: boolean = false) => {
    if (!pendingAction) return 0;
    const resp = remote ? "cpu" : "player";
    triggerCall(accept ? "¡QUIERO!" : "NO QUIERO", remote ? "var(--color-secondary)" : "var(--color-accent)");

    if (accept) {
      if (pendingAction.type === "truco") {
        setTrucoState((prev: any) => ({ ...prev, status: "accepted" }));
      } else {
        setEnvidoState((prev: any) => ({ ...prev, status: "accepted" }));
        resolveEnvido();
      }
    } else {
      let pts = 1;
      if (pendingAction.type === "envido") {
        // En el rechazo, cobramos lo que ya estaba acumulado antes de esta apuesta
        pts = Math.max(1, envidoState.prevAccumulated || 0);
      } else {
        pts = pendingAction.level === 1 ? 1 : pendingAction.level - 1;
      }

      addPoints(resp === "player" ? "cpu" : "player", pts);
      if (pendingAction.type === "truco") {
        setIsRoundEnding(true);
        if (gameMode !== "multiplayer") {
          setTimeout(() => resetRound(), 3500);
        }
      }
      else {
        setEnvidoState((prev: any) => ({ ...prev, status: "finished" }));
        if (suspendedTruco) {
          setTimeout(() => {
            setPendingAction(suspendedTruco);
            setSuspendedTruco(null);
            triggerCall(
              suspendedTruco.level === 1 ? "¡TRUCO!" : (suspendedTruco.level === 2 ? "¡RE-TRUCO!" : "¡VALE 4!"),
              (suspendedTruco.caller === "player" || suspendedTruco.caller === "partner") ? "var(--color-accent)" : "var(--color-secondary)"
            );
            setIsCooldown(false);
          }, 1500);
        } else {
          setIsCooldown(false);
        }
      }
    }

    setPendingAction(null);
    return 0;
  }, [pendingAction, envidoState.prevAccumulated, suspendedTruco, triggerCall, setTrucoState, setEnvidoState, resolveEnvido, addPoints, setIsRoundEnding, resetRound, setPendingAction, setSuspendedTruco, setIsCooldown, setActiveCall]);

  return {
    handleMazo, playCard, handleCall, handleResponse
  };
};
