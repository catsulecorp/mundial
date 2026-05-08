import type { Card } from "../../data/cards";
export type { Card };

export type GameMode = "1v1" | "2v2" | "multiplayer";
export type GameState = "landing" | "playing";
export type PlayerRole = "player" | "cpu" | "partner" | "opponent2" | "cpu2";

export interface PlayedCard extends Card {
  rotation?: number;
  x?: number;
  y?: number;
  owner: "player" | "cpu" | "partner" | "opponent2" | "cpu2";
  instanceId?: string;
}

export interface TrucoState {
  level: number; // 0: none, 1: truco, 2: retruco, 3: vale4
  caller: PlayerRole | null;
  status: "none" | "pending" | "accepted" | "declined" | "finished";
}

export interface EnvidoState {
  level: number; // 0: none, 1: envido, 2: envido-envido, 3: real, 4: falta
  caller: PlayerRole | null;
  status: "none" | "pending" | "accepted" | "declined" | "finished";
  prevLevel?: number;
}

export interface PendingAction {
  type: "truco" | "envido";
  level: number;
  caller: PlayerRole;
}

export interface Score {
  player: number;
  cpu: number;
}
