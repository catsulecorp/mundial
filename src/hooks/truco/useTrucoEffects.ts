import { useEffect } from "react";
import { determineWinner } from "../../lib/truco/engine";

export const useTrucoEffects = (state: any, logic: any) => {
  const {
    playedCards, gameMode, isRoundEnding, isCooldown, trucoState, starterIdx,
    setIsCooldown, setIsRoundEnding, setHandWinners, setHandWinningCardIds, setRoundWinningCardId, setShowCountdown,
    lastProcessedHandRef, handWinners, score, maxPoints, setWinnerModal, setGameState
  } = state;

  const { addPoints, resetRound, clearRoundData } = logic;

  // --- Match Winner Effect ---
  useEffect(() => {
    console.log("[SCORE CHECK]", score.player, score.cpu, "Target:", maxPoints);
    if (score.player >= maxPoints) {
      console.log("[WINNER] Player Wins!");
      setWinnerModal("player");
      setGameState("winner");
    } else if (score.cpu >= maxPoints) {
      console.log("[WINNER] CPU Wins!");
      setWinnerModal("cpu");
      setGameState("winner");
    }
  }, [score.player, score.cpu, maxPoints, setWinnerModal, setGameState]);

  // --- Hand Resolution Effect ---
  useEffect(() => {
    const cardsPerHand = gameMode === "2v2" ? 4 : 2;
    const currentHandIdx = Math.floor((playedCards.length - 1) / cardsPerHand);
    
    if (playedCards.length > 0 && playedCards.length % cardsPerHand === 0 && !isRoundEnding && !isCooldown) {
      if (lastProcessedHandRef.current === currentHandIdx) return;
      lastProcessedHandRef.current = currentHandIdx;
      
      setIsCooldown(true);

      setTimeout(() => {
        const currentHandCards = playedCards.slice(-cardsPerHand);
        const handWinner = determineWinner(currentHandCards);
        const newWinners = [...handWinners, handWinner];

        // --- Robust Truco Round Logic ---
        let roundWinner: "player" | "cpu" | null = null;
        const h1 = newWinners[0], h2 = newWinners[1];
        const isP = (w: any) => w === "player" || w === "partner";
        const isC = (w: any) => w === "cpu" || w === "cpu2" || w === "opponent2";

        if (newWinners.length === 2) {
          if (isP(h1) && isP(h2)) roundWinner = "player";
          else if (isC(h1) && isC(h2)) roundWinner = "cpu";
          else if (h1 === "draw" && isP(h2)) roundWinner = "player";
          else if (h1 === "draw" && isC(h2)) roundWinner = "cpu";
          else if (isP(h1) && h2 === "draw") roundWinner = "player";
          else if (isC(h1) && h2 === "draw") roundWinner = "cpu";
        } else if (newWinners.length === 3) {
          const pWins = newWinners.filter(isP).length;
          const cWins = newWinners.filter(isC).length;
          if (pWins > cWins) roundWinner = "player";
          else if (cWins > pWins) roundWinner = "cpu";
          else {
            if (h1 !== "draw") roundWinner = isP(h1) ? "player" : "cpu";
            else if (h2 !== "draw") roundWinner = isP(h2) ? "player" : "cpu";
            else roundWinner = starterIdx === 0 ? "player" : "cpu"; 
          }
        }

        setHandWinners(newWinners);

        // Track winning cards
        const winningCard = currentHandCards.find((c: any) => c.owner === handWinner);
        if (winningCard) setHandWinningCardIds((prev: string[]) => [...prev, winningCard.id]);

        if (roundWinner) {
          setIsRoundEnding(true);
          setShowCountdown(true);
          clearRoundData();
          if (winningCard) setRoundWinningCardId(winningCard.id);
          
          if (gameMode !== "multiplayer") {
            const points = trucoState.level + 1;
            addPoints(roundWinner, points);
            
            // Synchronize reset and unlock with "VAMO' A JUGÁ!" (3s)
            setTimeout(() => {
              resetRound();
              setIsRoundEnding(false);
              setIsCooldown(false);
            }, 3000);
          }
          
          // Clear visual countdown message shortly after (4s)
          setTimeout(() => {
            setShowCountdown(false);
          }, 4000);
        } else {
          setIsCooldown(false);
        }
      }, 1000);
    }
  }, [playedCards.length, gameMode, isRoundEnding, isCooldown, trucoState.level, starterIdx, addPoints, resetRound, clearRoundData, setIsCooldown, setIsRoundEnding, setHandWinners, setHandWinningCardIds, setRoundWinningCardId, setShowCountdown, lastProcessedHandRef, handWinners]);
};
