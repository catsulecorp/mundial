import React from 'react';

export const InstructionsPanel: React.FC = () => {
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
    </>
  );
};
