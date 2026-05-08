import React from 'react';

interface InstructionsPanelProps {
  maxPoints?: number;
}

export const InstructionsPanel: React.FC<InstructionsPanelProps> = ({ maxPoints = 30 }) => {
  return (
    <>
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
              Ej: MESSI (ARG·10) + DIBU (ARG·23)
            </p>
            <p>
              → Misma Selección (ARG): Sumás ambos + 20 →{" "}
              <strong style={{ color: "var(--color-primary)" }}>
                33
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
              Ej: MESSI (ARG·10) + MBAPPÉ (FRA·10)
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
            Retirarse de la mano. El rival gana los puntos que se estaban jugando.
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
            <strong style={{ color: 'var(--color-accent)' }}>El primero en llegar a {maxPoints} puntos gana la partida.</strong>
          </p>
        </div>
      </div>
    </>
  );
};
