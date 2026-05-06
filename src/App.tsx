import { useState, useRef, useEffect } from "react";
import { LandingPage } from "./components/LandingPage";
import { Scoreboard } from "./components/Scoreboard";
import { RankingSidebar } from "./components/RankingSidebar";
import { Sticker } from "./components/Sticker";
import { CARDS } from "./data/cards";
import type { Card } from "./data/cards";
import { Button } from "./components/ui/Button";
import { Modal } from "./components/ui/Modal";
import { motion, AnimatePresence } from "framer-motion";

function App() {
  // Declarar todos los hooks de estado al principio
  const [gameState, setGameState] = useState<"landing" | "playing">("landing");
  const [playerHand, setPlayerHand] = useState<Card[]>([]);
  const cpuHandRef = useRef<Card[]>([]);
  const [playedCards, setPlayedCards] = useState<
    (Card & {
      rotation: number;
      x: number;
      y: number;
      owner: "player" | "cpu";
      instanceId: string;
    })[]
  >([]);
  const [score, setScore] = useState({ player: 0, cpu: 0 });
  const [isCpuThinking, setIsCpuThinking] = useState(false);
  const [activeCall, setActiveCall] = useState<{
    text: string;
    id: number;
    color: string;
  } | null>(null);
  const [isRoundEnding, setIsRoundEnding] = useState(false);
  const [isCooldown, setIsCooldown] = useState(false);
  const cpuMoveTimeoutRef = useRef<any>(null);
  const interactionLockRef = useRef(false);
  const [trucoState, setTrucoState] = useState({
    level: 0,
    caller: null as "player" | "cpu" | null,
    status: "none" as "none" | "pending" | "accepted",
  });
  const [envidoState, setEnvidoState] = useState({
    level: 0,
    caller: null as "player" | "cpu" | null,
    status: "none" as "none" | "pending" | "accepted" | "finished",
  });
  const [pendingAction, setPendingAction] = useState<{
    type: "truco" | "envido";
    level: number;
    caller: "player" | "cpu";
  } | null>(null);
  const [handWinners, setHandWinners] = useState<("player" | "cpu" | "draw")[]>([]);
  const [scorePopups, setScorePopups] = useState<
    { id: number; value: number; owner: "player" | "cpu" }[]
  >([]);
  const [cpuHandCount, setCpuHandCount] = useState(0);
  const [roundWinningCardId, setRoundWinningCardId] = useState<string | null>(null);
  const prevScoreRef = useRef(score);
  const [winnerModal, setWinnerModal] = useState<null | "player" | "cpu">(null);
  const playerHandRef = useRef(playerHand);

  useEffect(() => {
    playerHandRef.current = playerHand;
  }, [playerHand]);

  useEffect(() => {
    if (score.player >= 30) {
      setWinnerModal("player");
    } else if (score.cpu >= 30) {
      setWinnerModal("cpu");
    }
  }, [score.player, score.cpu]);

  const handleRestartGame = () => {
    setScore({ player: 0, cpu: 0 });
    setWinnerModal(null);
    setGameState("playing");
    resetRound();
  };
  // ...existing code...

  useEffect(() => {
    const diffPlayer = score.player - prevScoreRef.current.player;
    const diffCpu = score.cpu - prevScoreRef.current.cpu;

    if (diffPlayer > 0) {
      const id = Date.now();
      setScorePopups((prev) => [
        ...prev,
        { id, value: diffPlayer, owner: "player" },
      ]);
      setTimeout(
        () => setScorePopups((prev) => prev.filter((p) => p.id !== id)),
        1500,
      );
    }
    if (diffCpu > 0) {
      const id = Date.now() + 1;
      setScorePopups((prev) => [...prev, { id, value: diffCpu, owner: "cpu" }]);
      setTimeout(
        () => setScorePopups((prev) => prev.filter((p) => p.id !== id)),
        1500,
      );
    }

    prevScoreRef.current = score;
  }, [score]);

  const isBusy =
    isCpuThinking ||
    isRoundEnding ||
    isCooldown ||
    pendingAction !== null;

  const startCooldown = (ms: number = 1000) => {
    setIsCooldown(true);
    setTimeout(() => setIsCooldown(false), ms);
  };

  const resetRound = () => {
    if (cpuMoveTimeoutRef.current) {
      clearTimeout(cpuMoveTimeoutRef.current);
      cpuMoveTimeoutRef.current = null;
    }
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    suspendedActionRef.current = null;
    interactionLockRef.current = false;
    setIsCpuThinking(false);
    setIsRoundEnding(false);
    setIsCooldown(false);
    setTrucoState({ level: 0, caller: null, status: "none" });
    setEnvidoState({ level: 0, caller: null, status: "none" });
    setPendingAction(null);
    setActiveCall(null);
    setHandWinners([]);
    setPlayedCards([]);
    setPlayerHand(CARDS.slice(0, 3));
    cpuHandRef.current = CARDS.slice(3, 6);
    setCpuHandCount(3);
    setRoundWinningCardId(null);
  };

  const timersRef = useRef<any[]>([]);
  const suspendedActionRef = useRef<{
    type: "truco" | "envido";
    level: number;
    caller: "player" | "cpu";
  } | null>(null);

  // Monitor round and hand winners
  useEffect(() => {
    // 1. Determine hand winner when 2 cards are played for the hand
    if (playedCards.length > 0 && playedCards.length % 2 === 0) {
      const lastTwo = playedCards.slice(-2);
      const playerCard = lastTwo.find((c) => c.owner === "player");
      const cpuCard = lastTwo.find((c) => c.owner === "cpu");

      if (
        playerCard &&
        cpuCard &&
        handWinners.length < playedCards.length / 2
      ) {
        let winner: "player" | "cpu" | "draw";
        // LOWER power wins (VAL 1 > VAL 7)
        if (playerCard.power < cpuCard.power) winner = "player";
        else if (cpuCard.power < playerCard.power) winner = "cpu";
        else winner = "draw";

        setHandWinners((prev) => [...prev, winner]);
      }
    }

    // 2. Check for Round Winner (Best of 3)
    if (!isRoundEnding && handWinners.length >= 2) {
      let roundWinner: "player" | "cpu" | null = null;

      const pWins = handWinners.filter((w) => w === "player").length;
      const cWins = handWinners.filter((w) => w === "cpu").length;
      const draws = handWinners.filter((w) => w === "draw").length;

      // Traditional Best of 3 Logic
      if (pWins >= 2) {
        roundWinner = "player";
      } else if (cWins >= 2) {
        roundWinner = "cpu";
      } else if (handWinners.length === 2) {
        // Decide at 2nd hand ONLY if there was a draw or someone won both
        if (draws === 1) {
          // One won, one drew -> that winner takes the round
          if (pWins === 1) roundWinner = "player";
          if (cWins === 1) roundWinner = "cpu";
        } else if (draws === 2) {
          // Double draw -> keep going to 3rd hand
        }
        // If it's 1-1 (player-cpu), we don't set roundWinner, so it continues to 3rd hand.
      } else if (handWinners.length === 3) {
        // Final hand tie-breakers
        if (pWins > cWins) roundWinner = "player";
        else if (cWins > pWins) roundWinner = "cpu";
        else {
          // Tied in wins (e.g. draw-draw-draw or win-loss-draw)
          // Rule: Whoever won the FIRST hand wins.
          if (handWinners[0] === "player") roundWinner = "player";
          else if (handWinners[0] === "cpu") roundWinner = "cpu";
          else {
            // If 1st hand was a draw, whoever won the 2nd wins
            if (handWinners[1] === "player") roundWinner = "player";
            else if (handWinners[1] === "cpu") roundWinner = "cpu";
            else {
              // If 1st and 2nd were draws, 3rd decides
              if (handWinners[2] === "player") roundWinner = "player";
              else roundWinner = "cpu"; // Default to dealer/CPU
            }
          }
        }
      }

      if (roundWinner) {
        setIsRoundEnding(true);
        interactionLockRef.current = true;

        const winner = roundWinner;

        // Find the hero card (the winner's card in the last hand)
        const lastTwo = playedCards.slice(-2);
        const hero = lastTwo.find((c) => c.owner === winner);
        if (hero) setRoundWinningCardId(hero.instanceId);

        // 1. Show Winner and animate hero card
        timersRef.current.push(
          setTimeout(() => {
            const points =
              trucoState.status === "accepted" ? trucoState.level + 1 : 1;

            if (winner === "player") {
              setScore((prev) => ({ ...prev, player: prev.player + points }));
              triggerCall("¡GANASTE!", "#ffea00");
            } else {
              setScore((prev) => ({ ...prev, cpu: prev.cpu + points }));
              triggerCall("¡CPU GANA!", "var(--color-secondary)");
            }
          }, 500),
        );

        // 2. Countdown sequence
        timersRef.current.push(
          setTimeout(() => triggerCall("PRÓXIMA EN 3...", "#ffffff"), 1500),
        );
        timersRef.current.push(
          setTimeout(() => triggerCall("PRÓXIMA EN 2...", "#ffffff"), 2500),
        );
        timersRef.current.push(
          setTimeout(() => triggerCall("PRÓXIMA EN 1...", "#ffffff"), 3500),
        );
        timersRef.current.push(
          setTimeout(() => {
            setIsRoundEnding(false);
            resetRound();
          }, 4500),
        );
      }
    }
  }, [playedCards.length, isRoundEnding, trucoState, handWinners]);

  const startGame = () => {
    if (cpuMoveTimeoutRef.current) clearTimeout(cpuMoveTimeoutRef.current);
    timersRef.current.forEach(clearTimeout);
    interactionLockRef.current = false;
    setGameState("playing");
    setPlayedCards([]);
    setIsCpuThinking(false);
    setIsRoundEnding(false);
    setIsCooldown(false);
    setActiveCall(null);
    setScore({ player: 0, cpu: 0 });
    setPlayerHand(CARDS.slice(0, 3));
    cpuHandRef.current = CARDS.slice(3, 6);
    setCpuHandCount(3);
  };

  const triggerCall = (
    text: string,
    color: string = "var(--color-primary)",
  ) => {
    const id = Date.now();
    setActiveCall({ text, id, color });
    setTimeout(() => {
      setActiveCall((prev) => (prev?.id === id ? null : prev));
    }, 2000);
  };

  // Reactive CPU move trigger
  useEffect(() => {
    const isOdd = playedCards.length % 2 !== 0;
    const isBoardNotFull = playedCards.length < 6;
    const lastCardWasPlayer =
      playedCards.length > 0 &&
      playedCards[playedCards.length - 1].owner === "player";

    // CPU leads if even number of cards and it won (or drew) last hand
    const cpuShouldLead =
      (playedCards.length === 2 && handWinners[0] === "cpu") ||
      (playedCards.length === 4 && handWinners[1] === "cpu") ||
      (playedCards.length === 2 && handWinners[0] === "draw") ||
      (playedCards.length === 4 &&
        handWinners[1] === "draw" &&
        handWinners[0] === "cpu");

    if (
      ((isOdd && lastCardWasPlayer) || cpuShouldLead) &&
      isBoardNotFull &&
      !isRoundEnding
    ) {
      setIsCpuThinking(true);

      const playId = Date.now();
      const isMobile = window.innerWidth < 768;
      const cardIndex = Math.floor(playedCards.length / 2);
      const spacing = isMobile ? 95 : 200;
      const xPos = (cardIndex - 1) * spacing;
      const yOffset = isMobile ? 60 : 100;

      if (cpuMoveTimeoutRef.current) clearTimeout(cpuMoveTimeoutRef.current);

      cpuMoveTimeoutRef.current = setTimeout(() => {
        // CPU DECISION PHASE
        const dice = Math.random();

        // 1. Check for Mazo (5% chance)
        if (dice < 0.05) {
          handleCpuMazo();
          return;
        }

        // 2. Check for Truco (10% chance)
        if (dice < 0.15 && trucoState.status === "none") {
          handleCall("truco", 1, "cpu");
          return;
        }

        // 3. Check for Envido (15% chance in first hand) - ONLY if no Truco called yet
        if (
          dice < 0.3 &&
          envidoState.status === "none" &&
          trucoState.status === "none" &&
          playedCards.length === 1
        ) {
          handleCall("envido", 1, "cpu");
          return;
        }

        let cardToPlay: Card | null = null;

        if (cpuHandRef.current.length > 0) {
          cardToPlay = cpuHandRef.current[0];
          cpuHandRef.current = cpuHandRef.current.slice(1);
        }

        if (cardToPlay) {
          const cardObj = cardToPlay as Card;
          const cpuCardEntry = {
            ...cardObj,
            rotation: (Math.random() - 0.5) * 5,
            x: xPos,
            y: -yOffset,
            owner: "cpu" as const,
            instanceId: `c-${cardObj.id}-${playId}`,
          };
          setPlayedCards((prev) => [...prev, cpuCardEntry]);
          setCpuHandCount((prev) => Math.max(0, prev - 1));
        }

        setIsCpuThinking(false);
        cpuMoveTimeoutRef.current = null;
      }, 1000);
    }
  }, [
    playedCards.length,
    isRoundEnding,
    trucoState.status,
    envidoState.status,
    handWinners,
  ]);

  const handleCpuMazo = () => {
    triggerCall("¡ME VOY AL MAZO!", "var(--color-secondary)");
    setIsRoundEnding(true);
    let points = 1;
    if (trucoState.status === "accepted") {
      points = trucoState.level + 1;
    } else {
      // Rule: 2 points if 1st player of 1st hand surrenders, 1 if 2nd.
      if (playedCards.length === 0) points = 2;
      else points = 1;
    }
    setTimeout(() => {
      setScore((prev) => ({ ...prev, player: prev.player + points }));
      triggerCall("¡GANASTE!", "#ffea00");
    }, 1000);
    setTimeout(() => resetRound(), 3000);
  };

  const playCard = (card: Card) => {
    if (
      isBusy ||
      interactionLockRef.current ||
      !playerHandRef.current.some((c) => c.id === card.id) ||
      playedCards.length >= 6
    )
      return;

    interactionLockRef.current = true;
    startCooldown();

    setTimeout(() => {
      interactionLockRef.current = false;
    }, 500);

    const playId = Date.now();
    const isMobile = window.innerWidth < 768;
    const cardIndex = Math.floor(playedCards.length / 2);
    const spacing = isMobile ? 95 : 200;
    const xPos = (cardIndex - 1) * spacing;
    const yOffset = isMobile ? 60 : 100;

    setPlayerHand((prev) => prev.filter((c) => c.id !== card.id));

    const playerCardEntry = {
      ...card,
      rotation: (Math.random() - 0.5) * 5,
      x: xPos,
      y: yOffset,
      owner: "player" as const,
      instanceId: `p-${card.id}-${playId}`,
    };

    setPlayedCards((prev) => [...prev, playerCardEntry]);

    // Failsafe: unlock after 5s no matter what
    setTimeout(() => {
      setIsCpuThinking(false);
    }, 5000);
  };

  const calculateEnvido = (hand: Card[]) => {
    // We use the 'env' property exclusively now
    const values = hand.map((c) => c.env ?? 0);
    return Math.max(...values, 0);
  };

  const handleCall = (
    type: "truco" | "envido",
    level: number,
    caller: "player" | "cpu",
  ) => {
    if (isRoundEnding) return;
    startCooldown();

    const texts = {
      truco: ["TRUCO!", "RE-TRUCO!", "VALE 4!"],
      envido: ["ENVIDO", "ENVIDO (x2)", "REAL ENVIDO", "FALTA ENVIDO"],
    };

    const colors = {
      truco: caller === "player" ? "#ffea00" : "var(--color-secondary)",
      envido:
        caller === "player" ? "var(--color-primary)" : "var(--color-secondary)",
    };

    triggerCall(texts[type][level - 1], colors[type]);
    if (pendingAction && pendingAction.type === "truco" && type === "envido") {
      suspendedActionRef.current = pendingAction;
    }
    setPendingAction({ type, level, caller });

    if (caller === "player") {
      // Simulate CPU response after 1.5s
      setTimeout(() => {
        const wants = Math.random() > 0.3;
        if (wants) {
          triggerCall("QUIERO!", "var(--color-secondary)");
          if (type === "truco") {
            setTrucoState({ level, caller, status: "accepted" });
            setPendingAction(suspendedActionRef.current);
            suspendedActionRef.current = null;
          } else {
            // Compare Envido points
            const playerPts = calculateEnvido(playerHand);
            const cpuPts = calculateEnvido(cpuHandRef.current);
            // Envido points: 1=2, 2=4, 3=7, 4=15
            let envPoints = 2;
            if (level === 2) envPoints = 4; // Envido (x2)
            else if (level === 3) envPoints = 7; // Real Envido
            else if (level === 4) envPoints = 15; // Falta Envido

            setTimeout(() => {
              triggerCall(`${cpuPts}!`, "var(--color-secondary)");
              setTimeout(() => {
                if (cpuPts >= playerPts) {
                  triggerCall("¡GANÉ ENVIDO!", "var(--color-secondary)");
                  setScore((prev) => ({ ...prev, cpu: prev.cpu + envPoints }));
                  setTimeout(() => {
                    setPendingAction(suspendedActionRef.current);
                    suspendedActionRef.current = null;
                  }, 1500);
                } else {
                  triggerCall(`${playerPts}!`, "#ffea00");
                  setTimeout(() => {
                    triggerCall("¡GANASTE ENVIDO!", "#ffea00");
                    setScore((prev) => ({
                      ...prev,
                      player: prev.player + envPoints,
                    }));
                    setTimeout(() => {
                      setPendingAction(suspendedActionRef.current);
                      suspendedActionRef.current = null;
                    }, 1500);
                  }, 1000);
                }
              }, 1000);
            }, 500);
            setEnvidoState({ level, caller, status: "finished" });
          }
        } else {
          triggerCall("NO QUIERO", "var(--color-secondary)");
          // Update score and trigger countdown on "No Quiero"
          if (type === "truco") {
            setIsRoundEnding(true);
            setScore((prev) => ({
              ...prev,
              player: prev.player + (level === 1 ? 1 : level - 1),
            }));
            triggerCall("¡GANASTE!", "#ffea00");

            timersRef.current.push(
              setTimeout(() => triggerCall("PRÓXIMA EN 3...", "#ffffff"), 1500),
            );
            timersRef.current.push(
              setTimeout(() => triggerCall("PRÓXIMA EN 2...", "#ffffff"), 2500),
            );
            timersRef.current.push(
              setTimeout(() => triggerCall("PRÓXIMA EN 1...", "#ffffff"), 3500),
            );
            timersRef.current.push(setTimeout(() => resetRound(), 4500));
          } else {
            setScore((prev) => ({ ...prev, player: prev.player + 1 }));
            setEnvidoState((prev) => ({ ...prev, status: "finished" }));
          }
          if (type !== "truco" || suspendedActionRef.current) {
             setPendingAction(suspendedActionRef.current);
             suspendedActionRef.current = null;
          } else {
             setPendingAction(null);
          }
        }
      }, 1500);
    }
  };

  const handleResponse = (wants: boolean) => {
    if (!pendingAction) return;
    startCooldown();

    if (wants) {
      triggerCall("QUIERO!", "#ffea00"); // Player says Quiero
      if (pendingAction.type === "truco") {
        setTrucoState({
          ...trucoState,
          status: "accepted",
          level: pendingAction.level,
        });
      } else {
        // Compare Envido points
        const playerPts = calculateEnvido(playerHand);
        const cpuPts = calculateEnvido(cpuHandRef.current);
        // Envido points: 1=2, 2=4, 3=7, 4=15
        let envPoints = 2;
        if (pendingAction.level === 2) envPoints = 4; // Envido (x2)
        else if (pendingAction.level === 3) envPoints = 7; // Real Envido
        else if (pendingAction.level === 4) envPoints = 15; // Falta Envido

        setTimeout(() => {
          triggerCall(`${playerPts}!`, "#ffea00");
          setTimeout(() => {
            if (playerPts > cpuPts) {
              triggerCall("¡GANASTE ENVIDO!", "#ffea00");
              setScore((prev) => ({
                ...prev,
                player: prev.player + envPoints,
              }));
            } else {
              triggerCall(`${cpuPts}!`, "var(--color-secondary)");
              setTimeout(() => {
                triggerCall("¡GANÉ ENVIDO!", "var(--color-secondary)");
                setScore((prev) => ({ ...prev, cpu: prev.cpu + envPoints }));
              }, 1000);
            }
          }, 1000);
        }, 500);
        setEnvidoState({
          ...envidoState,
          status: "finished",
          level: pendingAction.level,
        });
      }
    } else {
      triggerCall("NO QUIERO", "#ffffff"); // Player says No Quiero
      if (pendingAction.type === "truco") {
        setIsRoundEnding(true);
        setScore((prev) => ({
          ...prev,
          cpu:
            prev.cpu +
            (pendingAction.level === 1 ? 1 : pendingAction.level - 1),
        }));
        triggerCall("¡CPU GANA!", "var(--color-secondary)");

        timersRef.current.push(
          setTimeout(() => triggerCall("PRÓXIMA EN 3...", "#ffffff"), 1500),
        );
        timersRef.current.push(
          setTimeout(() => triggerCall("PRÓXIMA EN 2...", "#ffffff"), 2500),
        );
        timersRef.current.push(
          setTimeout(() => triggerCall("PRÓXIMA EN 1...", "#ffffff"), 3500),
        );
        timersRef.current.push(setTimeout(() => resetRound(), 4500));
      } else {
        setScore((prev) => ({ ...prev, cpu: prev.cpu + 1 }));
        setEnvidoState((prev) => ({ ...prev, status: "finished" }));
      }
    }

    const wasCpuTurn = pendingAction.caller === "cpu";
    setPendingAction(null);

    // If it was CPU's turn, unblock it so it can play its card or continue
    if (wasCpuTurn) {
      setIsCpuThinking(false); // This will re-trigger the useEffect to play the card
    }
  };

  const handleMazo = () => {
    if (isBusy) return;

    startCooldown();
    setIsRoundEnding(true);
    interactionLockRef.current = true;

    // Clear ALL timers when retiring
    if (cpuMoveTimeoutRef.current) clearTimeout(cpuMoveTimeoutRef.current);
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];

    // 1. Show Al Mazo
    triggerCall("¡AL MAZO!", "#ffffff");

    // 2. Show Loss & Update Score (after 1s)
    let points = 1;
    if (trucoState.status === "accepted") {
      points = trucoState.level + 1;
    } else {
      // Rule: 2 points if 1st player of 1st hand surrenders, 1 if 2nd.
      if (playedCards.length === 0) points = 2;
      else points = 1;
    }
    timersRef.current.push(
      setTimeout(() => {
        setScore((prev) => ({ ...prev, cpu: prev.cpu + points }));
        triggerCall("¡CPU GANA!", "var(--color-secondary)");
      }, 1000),
    );

    // 3. Countdown sequence (starting from 2s)
    timersRef.current.push(
      setTimeout(() => triggerCall("PRÓXIMA EN 3...", "#ffffff"), 2000),
    );
    timersRef.current.push(
      setTimeout(() => triggerCall("PRÓXIMA EN 2...", "#ffffff"), 3000),
    );
    timersRef.current.push(
      setTimeout(() => triggerCall("PRÓXIMA EN 1...", "#ffffff"), 4000),
    );

    // 4. Reset board (after 5s)
    timersRef.current.push(
      setTimeout(() => {
        resetRound();
      }, 5000),
    );
  };



  return (
    <div
      className="app"
      style={{
        backgroundImage: `linear-gradient(rgba(10, 10, 12, 0.75), rgba(10, 10, 12, 0.75)), url(${gameState === "landing" ? "/background.png" : "/playground.png"})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
        minHeight: "100vh",
        position: "relative",
      }}
    >
      <AnimatePresence>
        {activeCall && (
          <motion.div
            key={activeCall.id}
            initial={{ scale: 0, opacity: 0, x: "-50%", y: "-50%" }}
            animate={{ scale: 1, opacity: 1, x: "-50%", y: "-50%" }}
            exit={{ scale: 1.5, opacity: 0, x: "-50%", y: "-100%" }}
            style={{
              position: "fixed",
              top: "50%",
              left: "50%",
              zIndex: 1000,
              pointerEvents: "none",
              width: "100%",
              textAlign: "center",
            }}
          >
            <div
              className="text-display"
              style={{
                fontSize: "clamp(3rem, 15vw, 8rem)",
                color: activeCall.color,
                textShadow: `0 0 40px ${activeCall.color}88, 6px 6px 0px #000`,
                WebkitTextStroke: "3px #000",
                lineHeight: 1,
              }}
            >
              {activeCall.text}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Modal open={!!winnerModal} onClose={() => {}}>
        <div style={{ textAlign: "center", padding: "1.5rem 0 0 0" }}>
          <h2 className="text-display" style={{ fontSize: "2.2rem", color: winnerModal === "player" ? "var(--color-primary)" : "var(--color-secondary)", marginBottom: 16 }}>
            {winnerModal === "player" ? "You win!" : "CPU wins!"}
          </h2>
          <p style={{ fontSize: "1.1rem", marginBottom: 24 }}>First to 30 points wins the game.</p>
          <Button variant="primary" style={{ fontSize: "1.1rem", padding: "0.7rem 2.5rem" }} onClick={handleRestartGame}>
            Play Again
          </Button>
        </div>
      </Modal>

      <AnimatePresence mode="wait">
        {gameState === "landing" ? (
          <LandingPage key="landing" onStart={startGame} />
        ) : (
          <motion.div
            key="game"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              minHeight: "100vh",
              padding: "1rem",
              paddingBottom: "120px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "1rem",
              overflowX: "hidden",
              overflowY: "auto",
            }}
          >
            <RankingSidebar />

            {/* Desktop Instructions - Right (Fixed) */}
            <div className="sidebar-help sidebar-right">
              <h3
                className="text-display"
                style={{
                  color: "var(--color-accent)",
                  fontSize: "0.95rem",
                  marginBottom: "1rem",
                  letterSpacing: "0.05em",
                }}
              >
                CÓMO JUGAR
              </h3>
              <div
                style={{
                  fontSize: "0.75rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
                  color: "rgba(255,255,255,0.8)",
                }}
              >
                <div>
                  <p
                    style={{
                      fontWeight: "bold",
                      color: "#fff",
                      marginBottom: "0.3rem",
                    }}
                  >
                    TRUCO
                  </p>
                  <p>
                    Vale 2 pts (o más con Re-Truco o Vale 4). Jugás 3 manos,
                    gana el que gana 2.{" "}
                    <strong style={{ color: "var(--color-accent)" }}>
                      En cada mano, la carta más alta del ranking gana.
                    </strong>{" "}
                    Messi le gana a todos.
                  </p>
                </div>
                <div>
                  <p
                    style={{
                      fontWeight: "bold",
                      color: "#fff",
                      marginBottom: "0.3rem",
                    }}
                  >
                    ENVIDO
                  </p>
                  <p style={{ marginBottom: "0.4rem" }}>
                    Sumá los ENV de tus dos mejores jugadores que compartan{" "}
                    <strong style={{ color: "#fff" }}>Selección</strong> o{" "}
                    <strong style={{ color: "#fff" }}>Club</strong>.
                  </p>
                  <div
                    style={{
                      background: "rgba(255,255,255,0.06)",
                      borderRadius: "8px",
                      padding: "0.5rem",
                      fontSize: "0.68rem",
                    }}
                  >
                    <p
                      style={{
                        color: "var(--color-primary)",
                        fontWeight: "bold",
                        marginBottom: "0.2rem",
                      }}
                    >
                      Ej: Messi (ARG·10) + Yamal (ESP·19) + Haaland (NOR·9)
                    </p>
                    <p>
                      → Sin matches de país ni club: solo el más alto cuenta →{" "}
                      <strong style={{ color: "var(--color-primary)" }}>
                        19
                      </strong>
                    </p>
                    <p
                      style={{
                        color: "var(--color-primary)",
                        fontWeight: "bold",
                        marginBottom: "0.2rem",
                        marginTop: "0.5rem",
                      }}
                    >
                      Ej: CR7 (POR·7) + Mbappé (FRA·10) + Neymar (BRA·10)
                    </p>
                    <p>
                      → Sin matches de país ni club: solo el más alto cuenta →{" "}
                      <strong style={{ color: "var(--color-primary)" }}>
                        10
                      </strong>
                    </p>
                  </div>
                </div>
                <div>
                  <p
                    style={{
                      fontWeight: "bold",
                      color: "#fff",
                      marginBottom: "0.3rem",
                    }}
                  >
                    AL MAZO
                  </p>
                  <p>
                    Retirarse de la mano. El rival gana 2 pts si fue en la 1ra ronda, 1 pt después.
                  </p>
                </div>
                <div>
                  <p
                    style={{
                      fontWeight: "bold",
                      color: "#fff",
                      marginBottom: "0.3rem",
                    }}
                  >
                    FINAL DEL JUEGO
                  </p>
                  <p>
                    <strong style={{ color: 'var(--color-accent)' }}>El primero en llegar a 30 puntos gana la partida.</strong> ¡A jugar otra vez desde el modal!
                  </p>
                </div>
              </div>
            </div>

            {/* Main Board Container - Centralized */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "flex-start",
                gap: "0.5rem",
                width: "100%",
                maxWidth: "860px",
              }}
            >
              {/* CPU Hand Visualization */}
              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  marginBottom: "10px",
                  height: "60px",
                }}
              >
                <AnimatePresence>
                  {[...Array(cpuHandCount)].map((_, i) => (
                    <motion.div
                      key={`cpu-card-${i}`}
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.5 }}
                      className="cpu-card-back"
                    />
                  ))}
                </AnimatePresence>
              </div>

              {/* Integrated Info Section - Now Top */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "0.1rem",
                  position: "relative",
                }}
              >
                <Scoreboard
                  scoreA={score.player}
                  scoreB={score.cpu}
                  labelA="VOS"
                  labelB="CPU"
                />

                {/* Score Popups */}
                <AnimatePresence>
                  {scorePopups.map((popup) => (
                    <motion.div
                      key={popup.id}
                      initial={{
                        opacity: 0,
                        y: 0,
                        x: popup.owner === "player" ? -90 : 70,
                      }}
                      animate={{ opacity: 1, y: -40 }}
                      exit={{ opacity: 0, y: -80 }}
                      transition={{ duration: 0.5 }}
                      style={{
                        position: "absolute",
                        top: "20px",
                        left: "50%",
                        color: "var(--color-accent)",
                        fontSize: "2rem",
                        fontWeight: "900",
                        textShadow: "0 0 15px rgba(0,0,0,0.8)",
                        zIndex: 100,
                        pointerEvents: "none",
                      }}
                    >
                      +{popup.value}
                    </motion.div>
                  ))}
                </AnimatePresence>

                <h2
                  className="text-display"
                  onClick={() => setGameState("landing")}
                  style={{
                    fontSize: "clamp(0.9rem, 4vw, 1.5rem)",
                    opacity: 0.8,
                    letterSpacing: "0.2em",
                    marginTop: "0.25rem",
                    cursor: "pointer",
                    transition: "opacity 0.2s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.8")}
                >
                  MUCHO MUNDIAL
                </h2>
              </div>

              {/* The Field */}
              <div
                style={{
                  width: "100%",
                  maxWidth: "800px",
                  aspectRatio: "16/10",
                  background: "rgba(255,255,255,0.06)",
                  border: "2px dashed rgba(255,255,255,0.2)",
                  borderRadius: "24px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  position: "relative",
                  boxShadow: "inset 0 0 60px rgba(0,0,0,0.6)",
                  perspective: "1200px",
                  overflow: "visible",
                }}
              >
                <AnimatePresence>
                  {/* Card Silhouettes (Placeholders) */}
                  {[0, 1, 2].map((col) =>
                    [0, 1].map((row) => {
                      const isMobile = window.innerWidth < 768;
                      if (isMobile) return null;
                      const spacing = 200;
                      const xPos = (col - 1) * spacing;
                      const yPos = row === 0 ? -100 : 100;

                      return (
                        <div
                          key={`sil-${col}-${row}`}
                          className="card-silhouette"
                          style={{
                            transform: `translate(${xPos}px, ${yPos}px) rotateX(30deg) scale(0.85)`,
                            position: "absolute",
                          }}
                        />
                      );
                    }),
                  )}

                  {playedCards.map((card, index) => {
                    const handIndex = Math.floor(index / 2);
                    const isHandDecided = handWinners.length > handIndex;
                    const handWinner = handWinners[handIndex];

                    let isLoser = false;
                    let isWinner = false;
                    if (isHandDecided && handWinner !== "draw") {
                      isLoser = card.owner !== handWinner;
                      isWinner = card.owner === handWinner;
                    }

                    const isHero = card.instanceId === roundWinningCardId;

                    return (
                      <motion.div
                        key={card.instanceId}
                        initial={{
                          y: card.owner === "player" ? 400 : -400,
                          opacity: 0,
                          rotateX: 0,
                          rotateY: card.owner === "cpu" ? 180 : 0,
                          scale: 1.2,
                        }}
                        animate={{
                          y: isHero ? card.y - 60 : card.y,
                          x: card.x,
                          opacity: isLoser ? 0.65 : 1,
                          rotateX: isHero ? 20 : 30,
                          rotateY: 0,
                          rotateZ: card.rotation,
                          scale: isHero ? 1.15 : isWinner ? 0.9 : 0.85,
                          filter: isHero
                            ? "brightness(1.4) contrast(1.2) drop-shadow(0 0 50px rgba(255, 234, 0, 0.7))"
                            : isWinner
                              ? "brightness(1.2) contrast(1.1) drop-shadow(0 0 20px rgba(255,255,255,0.4))"
                              : isLoser
                                ? "brightness(0.8) grayscale(0.3)"
                                : "brightness(1) grayscale(0)",
                        }}
                        transition={
                          isHero
                            ? {
                                type: "spring",
                                stiffness: 100,
                                damping: 12,
                                mass: 1,
                              }
                            : {
                                type: "spring",
                                stiffness: 80,
                                damping: 15,
                                mass: 1,
                              }
                        }
                        style={{
                          position: "absolute",
                          zIndex: isHero ? 100 : isWinner ? 10 : index + 1,
                          transformStyle: "preserve-3d",
                          filter: isLoser
                            ? "none"
                            : "drop-shadow(0 20px 30px rgba(0,0,0,0.5))",
                        }}
                      >
                        <Sticker card={card} disabled hideEnv={isHero} />
                        {/* Label for owner */}
                        <div
                          style={{
                            position: "absolute",
                            [card.owner === "player" ? "top" : "bottom"]:
                              "-25px",
                            left: "50%",
                            transform: "translateX(-50%)",
                            fontSize: "0.7rem",
                            fontWeight: "900",
                            color:
                              card.owner === "player"
                                ? "var(--color-primary)"
                                : "var(--color-secondary)",
                            textShadow: "0 2px 10px rgba(0,0,0,1)",
                            opacity: isLoser ? 0.5 : 1,
                            pointerEvents: "none",
                            letterSpacing: "0.2em",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {card.owner === "player" ? "TUYA" : "CPU"}
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>

                {playedCards.length === 0 && (
                  <p
                    style={{
                      color: "var(--color-text-muted)",
                      fontSize: "0.8rem",
                      letterSpacing: "0.1em",
                    }}
                  >
                    CAMPO DE JUEGO
                  </p>
                )}
              </div>
            </div>

            {/* Actions / Hand - Bottom Fixed */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.75rem",
                alignItems: "center",
                marginBottom: "0.5rem",
                width: "100%",
                marginTop: "0.5rem",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.5rem",
                  alignItems: "center",
                }}
              >
                <AnimatePresence mode="wait">
                  {pendingAction && pendingAction.caller === "cpu" ? (
                    <motion.div
                      key="responses"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      style={{
                        display: "flex",
                        gap: "0.5rem",
                        flexWrap: "wrap",
                        justifyContent: "center",
                      }}
                    >
                      {/* Envido options (Left) */}
                      {pendingAction.type === "truco" &&
                        envidoState.status === "none" &&
                        playedCards.length === 1 && (
                          <Button
                            variant="primary"
                            onClick={() => {
                              triggerCall("EL ENVIDO ESTÁ PRIMERO!", "#fff");
                              handleCall("envido", 1, "player");
                            }}
                          >
                            EL ENVIDO ESTÁ PRIMERO!
                          </Button>
                        )}

                      {/* Main Responses (Middle) */}
                      <Button
                        variant={pendingAction.type === "envido" ? undefined : "secondary"}
                        style={pendingAction.type === "envido" ? { background: "var(--color-primary)", color: "#000", fontWeight: 700, border: "4px solid #000" } : {}}
                        onClick={() => handleResponse(true)}
                      >
                        QUIERO
                      </Button>
                      <Button
                        variant="white"
                        onClick={() => handleResponse(false)}
                      >
                        NO QUIERO
                      </Button>

                      {/* Escalations (Right) */}
                      {pendingAction.type === "envido" && pendingAction.level === 1 && (
                        <Button
                          style={{ background: "var(--color-primary)", color: "#000", fontWeight: 700, border: "4px solid #000" }}
                          onClick={() => handleCall("envido", 2, "player")}
                        >
                          ENVIDO (x2)
                        </Button>
                      )}
                      {pendingAction.type === "envido" && pendingAction.level === 2 && (
                        <Button
                          variant="secondary"
                          onClick={() => handleCall("envido", 3, "player")}
                        >
                          REAL ENVIDO
                        </Button>
                      )}
                      {pendingAction.type === "envido" && pendingAction.level === 3 && (
                        <Button
                          variant="secondary"
                          onClick={() => handleCall("envido", 4, "player")}
                        >
                          FALTA ENVIDO
                        </Button>
                      )}
                      {pendingAction.type === "truco" &&
                        pendingAction.level < 3 && (
                          <Button
                            variant="secondary"
                            onClick={() =>
                              handleCall(
                                "truco",
                                pendingAction.level + 1,
                                "player",
                              )
                            }
                          >
                            {pendingAction.level === 1
                              ? "RE-TRUCO!"
                              : "VALE 4!"}
                          </Button>
                        )}
                    </motion.div>
                  ) : (
                    <motion.div
                      key="actions"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      style={{
                        display: "flex",
                        gap: "0.5rem",
                        flexWrap: "wrap",
                        justifyContent: "center",
                      }}
                    >
                      {/* Envido only in first hand (playedCards.length 0 or 1) and before Truco */}
                      {playedCards.length <= 1 && trucoState.status === "none" && (
                        <Button
                          variant="primary"
                          style={{ padding: "0.5rem 1rem", fontSize: "0.9rem" }}
                          disabled={
                            isBusy ||
                            envidoState.status !== "none" ||
                            trucoState.status !== "none"
                          }
                          onClick={() => handleCall("envido", 1, "player")}
                        >
                          {envidoState.status !== "none" &&
                          envidoState.caller === "player"
                            ? "ENVIDO (rival)"
                            : "ENVIDO"}
                        </Button>
                      )}

                      {(() => {
                        const cpuHasTruco =
                          trucoState.status !== "none" &&
                          trucoState.caller === "player";
                        const trucoLabel =
                          trucoState.level === 0
                            ? "TRUCO!"
                            : trucoState.level === 1
                              ? cpuHasTruco
                                ? "RE-TRUCO (rival)"
                                : "RE-TRUCO!"
                              : cpuHasTruco
                                ? "VALE 4 (rival)"
                                : "VALE 4!";
                        return (
                          <Button
                            variant="secondary"
                            style={{
                              padding: "0.5rem 1rem",
                              fontSize: "0.9rem",
                            }}
                            disabled={
                              isBusy || cpuHasTruco || trucoState.level >= 3
                            }
                            onClick={() =>
                              handleCall(
                                "truco",
                                trucoState.level + 1,
                                "player",
                              )
                            }
                          >
                            {trucoLabel}
                          </Button>
                        );
                      })()}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div
                style={{
                  display: "flex",
                  gap: "0.75rem",
                  overflowX: "auto",
                  overflow: "visible",
                  padding: "0.5rem 2.5rem",
                  width: "100%",
                  maxWidth: "600px",
                  justifyContent: "center",
                  marginTop: "1.25rem",
                  marginBottom: "1.25rem",
                  boxSizing: "border-box",
                }}
              >
                <AnimatePresence>
                  {playerHand.map((card, idx) => (
                    <motion.div
                      key={card.id}
                      layout
                      animate={{ y: [0, -8, 0] }}
                      transition={{
                        y: {
                          duration: 3 + idx * 0.5,
                          repeat: Infinity,
                          ease: "easeInOut",
                        },
                        default: { duration: 0.3 },
                      }}
                      exit={{ y: -100, opacity: 0, scale: 0.8 }}
                    >
                      <Sticker
                        card={card}
                        onClick={() => playCard(card)}
                        disabled={isBusy}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Al Mazo Button Always Below */}
              <div style={{ marginTop: "0.5rem" }}>
                <Button
                  variant="white"
                  style={{
                    padding: "0.5rem 2rem",
                    fontSize: "1rem",
                    width: "100%",
                    maxWidth: "200px",
                  }}
                  disabled={isBusy}
                  onClick={handleMazo}
                >
                  AL MAZO
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
