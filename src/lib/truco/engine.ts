import type { Card } from "../../data/cards";
import type { PlayedCard, PlayerRole } from "./types";

export const calculateEnvido = (hand: Card[]) => {
  if (!hand || hand.length === 0) return 0;
  
  let bestScore = Math.max(...hand.map(c => c.env || 0));

  // Check all possible pairs for matches
  for (let i = 0; i < hand.length; i++) {
    for (let j = i + 1; j < hand.length; j++) {
      const c1 = hand[i];
      const c2 = hand[j];
      
      if (c1.country === c2.country || c1.club === c2.club) {
        // User requested to remove the +20 base bonus
        const pairScore = (c1.env || 0) + (c2.env || 0);
        if (pairScore > bestScore) bestScore = pairScore;
      }
    }
  }

  return bestScore;
};

export const getCardValue = (card: Card): number => {
  // Mucho Mundial uses 'power' where LOWER is BETTER.
  // We return a value where HIGHER is BETTER for easier comparison.
  return 100 - card.power;
};

export const determineWinner = (playedCards: PlayedCard[]): PlayerRole | "draw" => {
  if (playedCards.length === 0) return "draw";
  
  let bestValue = -1;
  let winners: PlayedCard[] = [];

  playedCards.forEach(pc => {
    const val = getCardValue(pc);
    if (val > bestValue) {
      bestValue = val;
      winners = [pc];
    } else if (val === bestValue) {
      winners.push(pc);
    }
  });

  if (winners.length > 1) {
    const teams = winners.map(w => (w.owner === "player" || w.owner === "partner") ? "hero" : "rival");
    const allSameTeam = teams.every(t => t === teams[0]);
    if (allSameTeam) return winners[0].owner;
    return "draw";
  }

  return winners[0].owner;
};
