import type { PlayerRole, GameMode } from "../../lib/truco/types";

export interface MatchmakingProps {
  sessionId: string;
  user: any;
  gameMode: GameMode;
  rivalId: string | null;
  isHost: boolean;
  matchId?: string | null;
  gameState: string;
  playerHand: any[];
  playedCards: any[];
  starterIdx: number;
  cpuHandRef: any;
  isRoundEnding: boolean;
  isGameStarting: boolean;
  setGameState: (state: any) => void;
  setRivalName: (name: string) => void;
  resetRound: (hands?: any, starter?: number) => void;
  playCardRemote: (card: any, owner: PlayerRole) => void;
  wrappedHandleCall: (type: any, level: number, caller: PlayerRole, isRemote: boolean) => void;
  wrappedHandleResponse: (accept: boolean, isRemote: boolean) => void;
  handleMazo: (isRemote: boolean) => void;
  setScore: (score: any) => void;
  score: any;
  setIsGameStarting: (val: boolean) => void;
  setShowCountdown: (val: boolean) => void;
  setMaxPoints: (val: number) => void;
  setIsHost: (val: boolean) => void;
  setMyIndex: (val: number) => void;
}
