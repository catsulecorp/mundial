import React from 'react';
import { Home } from 'lucide-react';
import { Button } from '../../ui/Button';

interface GameTopBarProps {
  onExit: () => void;
}

export const GameTopBar: React.FC<GameTopBarProps> = ({ onExit }) => {
  return (
    <>
      {/* Top Left: Home Button */}
      <Button
        variant="white"
        onClick={onExit}
        className="home-btn-fixed"
        style={{
          background: "rgba(255, 255, 255, 0.1)",
          backdropFilter: "blur(12px)",
          height: "40px",
          borderRadius: "1rem",
          padding: "0 1rem",
          display: "flex",
          gap: "0.5rem",
          color: "white",
          border: "1px solid rgba(255, 255, 255, 0.1)"
        }}
      >
        <Home size={16} />
        <span style={{ fontWeight: 900, fontSize: "0.75rem", letterSpacing: "0.05em", textShadow: "0 0 0.5px white" }}>INICIO</span>
      </Button>

      {/* Top Right: Twitch Button */}
      <a
        href="https://www.twitch.tv/muchomovimiento/videos"
        target="_blank"
        rel="noopener noreferrer"
        className="twitch-btn"
        style={{
          position: "fixed",
          top: "1.5rem",
          right: "2.25rem",
          background: "rgba(145, 70, 255, 0.2)",
          backdropFilter: "blur(12px)",
          zIndex: 2000,
          height: "40px",
          borderRadius: "1rem",
          padding: "0 1rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "0.5rem",
          color: "white",
          textDecoration: "none",
          border: "1px solid rgba(145, 70, 255, 0.3)",
          boxShadow: "0 4px 14px rgba(145, 70, 255, 0.1)"
        }}
      >
        <svg 
          width="16" 
          height="16" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <path d="M21 2H3v16h5v4l4-4h5l4-4V2zm-10 9V7m5 4V7"/>
        </svg>
        <span style={{ fontWeight: 800, fontSize: "0.75rem", letterSpacing: "0.05em" }} className="desktop-only">MUCHOMOVIMIENTO</span>
        <span style={{ fontWeight: 800, fontSize: "0.75rem", letterSpacing: "0.05em" }} className="mobile-only">LIVE</span>
      </a>
    </>
  );
};
