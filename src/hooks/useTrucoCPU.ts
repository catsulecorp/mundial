import { useEffect, useRef } from 'react';
import type { Card } from '../data/cards';
import { calculateEnvido } from '../lib/truco/engine';
import type { GameMode, PlayerRole, PendingAction, PlayedCard } from '../lib/truco/types';

interface UseTrucoCPUProps {
  gameState: string;
  gameMode: GameMode;
  playedCards: PlayedCard[];
  handWinners: any[];
  pendingAction: PendingAction | null;
  isRoundEnding: boolean;
  isCooldown: boolean;
  whoseTurn: PlayerRole | null;
  cpuHandRef: React.MutableRefObject<Card[]>;
  cpuPartnerHandRef: React.MutableRefObject<Card[]>;
  cpuOpponent2HandRef: React.MutableRefObject<Card[]>;
  isCpuThinking: boolean;
  trucoState: any;
  envidoState: any;
  setIsCpuThinking: (val: boolean) => void;
  playCard: (card: Card) => void;
  handleCall: (type: "truco" | "envido", level: number, caller: PlayerRole) => void;
  handleResponse: (accept: boolean) => void;
}

export const useTrucoCPU = ({
  gameState,
  gameMode,
  playedCards,
  handWinners,
  pendingAction,
  isRoundEnding,
  isCooldown,
  whoseTurn,
  cpuHandRef,
  cpuPartnerHandRef,
  cpuOpponent2HandRef,
  isCpuThinking,
  trucoState,
  envidoState,
  setIsCpuThinking,
  playCard,
  handleCall,
  handleResponse
}: UseTrucoCPUProps) => {
  const cpuMoveTimeoutRef = useRef<any>(null);

  useEffect(() => {
    if (gameState !== "playing" || gameMode === "multiplayer") return;
    
    const isBoardFull = playedCards.length >= (gameMode === "2v2" ? 12 : 6);
    if (isBoardFull) return;

    // --- Handle Pending Actions (Responses) ---
    if (pendingAction && pendingAction.caller === "player" && !isCpuThinking && !isRoundEnding) {
      setIsCpuThinking(true);
      if (cpuMoveTimeoutRef.current) clearTimeout(cpuMoveTimeoutRef.current);
      
      cpuMoveTimeoutRef.current = setTimeout(() => {
        // Simple AI logic: 80% chance to accept
        const accept = Math.random() < 0.8;
        handleResponse(accept);
        setIsCpuThinking(false);
      }, 1500 + Math.random() * 500);
      return;
    }

    const isActionActive = pendingAction !== null || isRoundEnding || isCooldown;
    const isCpuTurn = whoseTurn === "cpu" || whoseTurn === "partner" || whoseTurn === "cpu2";

    if (isCpuTurn && !isActionActive && !isCpuThinking) {
      setIsCpuThinking(true);
      
      if (cpuMoveTimeoutRef.current) clearTimeout(cpuMoveTimeoutRef.current);
      
      cpuMoveTimeoutRef.current = setTimeout(() => {
        // Double check turn and activity after timeout to avoid race conditions
        const freshIsActionActive = pendingAction !== null || isRoundEnding || isCooldown;
        const freshIsCpuTurn = whoseTurn === "cpu" || whoseTurn === "partner" || whoseTurn === "cpu2";
        if (!freshIsCpuTurn || freshIsActionActive) {
          setIsCpuThinking(false);
          return;
        }

        const dice = Math.random();
        
        // 1. CPU Escalates Truco if it has the right
        const canCPUCallTruco = trucoState.status === "none" || 
                                (trucoState.status === "accepted" && (trucoState.caller === "player" || trucoState.caller === "partner"));

        if (dice < 0.12 && canCPUCallTruco && trucoState.level < 3) { 
          const nextLevel = trucoState.level + 1;
          handleCall("truco", nextLevel, whoseTurn as PlayerRole); 
          setIsCpuThinking(false);
          return; // STOP HERE. Don't play a card if we called truco.
        }

        // 2. CPU Calls Envido (only if CPU hasn't played a card yet and no truco pending)
        let cpuPlayedCount = 0;
        if (whoseTurn === "cpu") {
          cpuPlayedCount = 3 - cpuHandRef.current.length;
        } else if (whoseTurn === "partner") {
          cpuPlayedCount = 3 - cpuPartnerHandRef.current.length;
        } else if (whoseTurn === "cpu2") {
          cpuPlayedCount = 3 - cpuOpponent2HandRef.current.length;
        }

        if (envidoState.status === "none" && cpuPlayedCount === 0) {
          // Calculate actual points to decide
          let currentHand: Card[] = [];
          if (whoseTurn === "cpu") currentHand = cpuHandRef.current;
          else if (whoseTurn === "partner") currentHand = cpuPartnerHandRef.current;
          else if (whoseTurn === "cpu2") currentHand = cpuOpponent2HandRef.current;

          const points = calculateEnvido(currentHand);
          
          // Decision Logic:
          // - If points > 28: 80% chance
          // - If points > 25: 50% chance
          // - Bluff: 15% chance regardless of points
          const shouldCall = (points > 28 && dice < 0.8) || (points > 25 && dice < 0.5) || (dice < 0.15);

          if (shouldCall) {
            handleCall("envido", 1, whoseTurn as PlayerRole);
            setIsCpuThinking(false);
            return;
          }
        }

        // 3. Play a card (only if we didn't call anything above)
        let currentHand: Card[] = [];
        if (whoseTurn === "cpu") currentHand = cpuHandRef.current;
        else if (whoseTurn === "partner") currentHand = cpuPartnerHandRef.current;
        else if (whoseTurn === "cpu2") currentHand = cpuOpponent2HandRef.current;

        if (currentHand.length > 0) {
          const randomIndex = Math.floor(Math.random() * currentHand.length);
          const cardToPlay = currentHand[randomIndex];
          
          // Remove from ref
          if (whoseTurn === "cpu") cpuHandRef.current = cpuHandRef.current.filter(c => c.id !== cardToPlay.id);
          else if (whoseTurn === "partner") cpuPartnerHandRef.current = cpuPartnerHandRef.current.filter(c => c.id !== cardToPlay.id);
          else if (whoseTurn === "cpu2") cpuOpponent2HandRef.current = cpuOpponent2HandRef.current.filter(c => c.id !== cardToPlay.id);
          
          playCard(cardToPlay);
        }
        setIsCpuThinking(false);
      }, 2000 + Math.random() * 1000); // Increased delay for more human-like pacing
    }
  }, [gameState, gameMode, playedCards.length, handWinners.length, pendingAction, isRoundEnding, isCooldown, whoseTurn, isCpuThinking, trucoState, envidoState]);
};
