import { useEffect, useRef } from 'react';
import type { Card } from '../data/cards';
import type { GameMode, PlayedCard, PendingAction, PlayerRole } from '../lib/truco/types';

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
  handleMazo: (isRemote: boolean) => void;
  triggerCall: (text: string, color: string) => void;
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
  handleResponse,
  handleMazo,
  triggerCall
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
        const dice = Math.random();
        // Random CPU calls logic
        if (dice < 0) { // Disabled for debugging
          triggerCall("¡ME VOY AL MAZO!", "var(--color-secondary)");
          handleMazo(true); 
          setIsCpuThinking(false);
          return; 
        }
        
        // 1. CPU Escalates Truco if it has the right
        const canCPUCallTruco = trucoState.status === "none" || 
                                (trucoState.status === "accepted" && (trucoState.caller === "player" || trucoState.caller === "partner"));

        if (dice < 0.08 && !pendingAction && canCPUCallTruco && trucoState.level < 3) { 
          const nextLevel = trucoState.level + 1;
          handleCall("truco", nextLevel, whoseTurn as PlayerRole); 
          setIsCpuThinking(false);
          return;
        }

        // 2. CPU Calls Envido (only if nothing played and no truco pending)
        if (dice < 0.15 && !pendingAction && envidoState.status === "none" && playedCards.length === 0) {
          handleCall("envido", 1, whoseTurn as PlayerRole);
          setIsCpuThinking(false);
          return;
        }

        // Play a random card from the correct hand
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
      }, 1500 + Math.random() * 1000);
    }
  }, [gameState, gameMode, playedCards.length, handWinners.length, pendingAction, isRoundEnding, isCooldown, whoseTurn, isCpuThinking, trucoState, envidoState]);
};
