import { useState, useRef } from "react";
import type { Card } from "../../data/cards";
import type { GameMode, GameState, Score, TrucoState, EnvidoState, PlayedCard } from "../../lib/truco/types";

export const useTrucoState = () => {
  const [gameState, setGameState] = useState<GameState>("landing");
  const [gameMode, setGameMode] = useState<GameMode>("1v1");
  const [score, setScore] = useState<Score>({ player: 0, cpu: 0 });
  const [rivalId, setRivalId] = useState<string | null>(null);
  const [rivalName, setRivalName] = useState("CPU");
  const [maxPoints, setMaxPoints] = useState(30);
  const [isHost, setIsHost] = useState(false);
  const [myIndex, setMyIndex] = useState(0);

  const [trucoState, setTrucoState] = useState<TrucoState>({ level: 0, caller: null, status: "none" });
  const [envidoState, setEnvidoState] = useState<EnvidoState>({ level: 0, caller: null, status: "none" });
  const [pendingAction, setPendingAction] = useState<any>(null);
  const [suspendedTruco, setSuspendedTruco] = useState<any>(null);
  
  const [handWinners, setHandWinners] = useState<any[]>([]);
  const [isRoundEnding, setIsRoundEnding] = useState(false);
  const [isCooldown, setIsCooldown] = useState(false);
  const [isGameStarting, setIsGameStarting] = useState(false);
  const [showCountdown, setShowCountdown] = useState(false);
  
  const [activeCall, setActiveCall] = useState<{ text: string, id: number, color: string } | null>(null);
  const [winnerModal, setWinnerModal] = useState<null | "player" | "cpu">(null);
  const [scorePopups, setScorePopups] = useState<{ id: number, points: number, side: "player" | "cpu" }[]>([]);
  
  const [playerHand, setPlayerHand] = useState<Card[]>([]);
  const [playedCards, setPlayedCards] = useState<PlayedCard[]>([]);
  const [handWinningCardIds, setHandWinningCardIds] = useState<string[]>([]);
  const [roundWinningCardId, setRoundWinningCardId] = useState<string | null>(null);
  
  const [starterIdx, setStarterIdx] = useState(0);
  const [dealerIdx, setDealerIdx] = useState(1);
  const [cpuHandCount, setCpuHandCount] = useState(3);
  const [cpuPartnerHandCount, setCpuPartnerHandCount] = useState(3);
  const [cpuOpponent2HandCount, setCpuOpponent2HandCount] = useState(3);

  const cpuHandRef = useRef<Card[]>([]);
  const cpuPartnerHandRef = useRef<Card[]>([]);
  const cpuOpponent2HandRef = useRef<Card[]>([]);
  const playerHandRef = useRef<Card[]>([]);
  const lastProcessedHandRef = useRef(-1);
  const resetLockRef = useRef(false);

  // Synchronize refs with state for engine access
  playerHandRef.current = playerHand;

  return {
    gameState, setGameState,
    gameMode, setGameMode,
    score, setScore,
    rivalId, setRivalId,
    rivalName, setRivalName,
    maxPoints, setMaxPoints,
    isHost, setIsHost,
    myIndex, setMyIndex,
    trucoState, setTrucoState,
    envidoState, setEnvidoState,
    pendingAction, setPendingAction,
    suspendedTruco, setSuspendedTruco,
    handWinners, setHandWinners,
    isRoundEnding, setIsRoundEnding,
    isCooldown, setIsCooldown,
    isGameStarting, setIsGameStarting,
    showCountdown, setShowCountdown,
    activeCall, setActiveCall,
    winnerModal, setWinnerModal,
    scorePopups, setScorePopups,
    playerHand, setPlayerHand,
    playedCards, setPlayedCards,
    handWinningCardIds, setHandWinningCardIds,
    roundWinningCardId, setRoundWinningCardId,
    starterIdx, setStarterIdx,
    dealerIdx, setDealerIdx,
    cpuHandCount, setCpuHandCount,
    cpuPartnerHandCount, setCpuPartnerHandCount,
    cpuOpponent2HandCount, setCpuOpponent2HandCount,
    cpuHandRef, cpuPartnerHandRef, cpuOpponent2HandRef, playerHandRef,
    lastProcessedHandRef, resetLockRef
  };
};
