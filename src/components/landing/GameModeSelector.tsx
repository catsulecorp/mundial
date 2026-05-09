import React from 'react';
import { Button } from '../ui/Button';
import { Users, User, Globe } from 'lucide-react';
import type { GameMode } from '../../lib/truco/types';

interface GameModeSelectorProps {
  selectedMode: GameMode;
  onSelect: (mode: GameMode) => void;
}

export const GameModeSelector: React.FC<GameModeSelectorProps> = ({ selectedMode, onSelect }) => {
  const commonStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#000",
    height: "55px",
    fontSize: "1.1rem",
    fontWeight: 900,
    border: "none",
    boxShadow: "4px 4px 0px #000",
    transition: "transform 0.1s ease", // Keep smooth scale if we want, but filter will be instant via CSS
    cursor: "pointer",
    opacity: 1
  };

  const getButtonStyle = (mode: GameMode, baseColor: string) => ({
    ...commonStyle,
    backgroundColor: baseColor,
    transform: "none",
    zIndex: selectedMode === mode ? 10 : 1
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "2rem", width: "100%", maxWidth: "550px" }}>
      {/* Primary Option: Online */}
      <Button
        onClick={() => onSelect("multiplayer")}
        className="btn-hover-dark"
        style={{
          ...getButtonStyle("multiplayer", "#00f2ff"),
          width: "100%",
          gap: "0.75rem",
        }}
      >
        <Globe size={22} />
        JUGAR ONLINE (1 VS 1)
      </Button>

      {/* Secondary Options: Local Modes */}
      <div className="game-mode-secondary-row" style={{ display: "flex", gap: "1rem", width: "100%" }}>
        <Button
          onClick={() => onSelect("1v1")}
          className="btn-hover-dark"
          style={{
            ...getButtonStyle("1v1", "#ffdf00"),
            width: "100%",
            gap: "0.5rem",
          }}
        >
          <User size={20} />
          VS CPU
        </Button>
        <Button
          onClick={() => onSelect("2v2")}
          disabled={true}
          style={{
            ...getButtonStyle("2v2", "#ffdf00"),
            width: "100%",
            gap: "0.5rem",
            opacity: 0.5,
            filter: "grayscale(1)",
            cursor: "not-allowed",
          }}
        >
          <Users size={20} />
          PRÓXIMAMENTE
        </Button>
      </div>
    </div>
  );
};
