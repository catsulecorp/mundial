import React from 'react';
import { Modal } from '../../ui/Modal';
import { Button } from '../../ui/Button';

interface GameModalsProps {
  winnerModal: "player" | "cpu" | null;
  showExitModal: boolean;
  abandonmentModal: boolean;
  onRestart: () => void;
  onCloseExit: () => void;
  onConfirmExit: () => void;
  onContinue: () => void;
}

export const GameModals: React.FC<GameModalsProps> = ({
  winnerModal,
  showExitModal,
  abandonmentModal,
  onRestart,
  onCloseExit,
  onConfirmExit,
  onContinue
}) => {
  console.log("[MODALS] Winner Modal Status:", winnerModal);
  return (
    <>
      <Modal open={!!winnerModal} onClose={() => {}} showClose={false}>
        <div style={{ textAlign: "center", padding: "0.5rem 0" }}>
          <h2 className="text-display" style={{ fontSize: "3.5rem", color: winnerModal === "player" ? "#00f2ff" : "var(--color-secondary)", marginBottom: 12, lineHeight: 1.2, marginTop: 10 }}>
            {winnerModal === "player" ? "¡GANASTE!" : "¡GANÓ LA CPU!"}
          </h2>
          <Button 
            variant="white" 
            className="btn-hover-dark"
            style={{ fontSize: "1.2rem", padding: "0.8rem 3rem", fontWeight: 800 }} 
            onClick={onConfirmExit}
          >
            VOLVER AL INICIO
          </Button>
        </div>
      </Modal>

      <Modal open={showExitModal} onClose={onCloseExit}>
        <div style={{ textAlign: "center", padding: "0.5rem 0 0 0" }}>
          <h2 className="text-display" style={{ fontSize: "2rem", color: "#fff", marginBottom: 20, width: "100%", textAlign: "center" }}>
            ¿Volver al inicio?
          </h2>
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", width: "100%", alignItems: "stretch" }}>
            <Button 
              variant="white" 
              className="btn-hover-dark"
              onClick={onConfirmExit} 
              style={{ flex: 1, fontSize: "1.2rem", padding: "0.6rem", lineHeight: 0.8, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}
            >
              <span style={{ marginBottom: "-2px" }}>VOLVER</span>
              <span>AL INICIO</span>
            </Button>
            <Button 
              variant="secondary" 
              className="btn-hover-dark"
              onClick={onContinue} 
              style={{ flex: 1, fontSize: "1.2rem", padding: "0.6rem", display: "flex", alignItems: "center", justifyContent: "center" }}
            >
              SEGUIR JUGANDO
            </Button>
          </div>
        </div>
      </Modal>

      <Modal open={abandonmentModal} onClose={() => {}} showClose={false}>
        <div style={{ textAlign: "center", padding: "1.5rem 0 0 0" }}>
          <h2 className="text-display" style={{ fontSize: "2rem", color: "var(--color-secondary)", marginBottom: 16 }}>
            ¡PARTIDA ABANDONADA!
          </h2>
          <p style={{ color: "rgba(255,255,255,0.7)", marginBottom: 24, fontSize: "1.1rem" }}>
            El otro jugador ha abandonado la partida.
          </p>
          <Button variant="primary" style={{ fontSize: "1.1rem", padding: "0.7rem 2.5rem" }} onClick={onRestart}>
            Volver al Inicio
          </Button>
        </div>
      </Modal>
    </>
  );
};
