import React from 'react';
import { Button } from '../ui/Button';

interface PointSelectorProps {
  onSelect: (points: number) => void;
}

export const PointSelector: React.FC<PointSelectorProps> = ({ onSelect }) => {
  const getButtonStyle = () => ({
    width: "100%", 
    height: "75px", 
    fontSize: "2.8rem", 
    fontWeight: 900,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 0,
    textAlign: "center" as const,
    color: "#000",
    backgroundColor: "#00f2ff", // Force Celeste
    border: "none",
    boxShadow: "4px 4px 0px #000",
    transition: "none",
    cursor: "pointer",
  });

  return (
    <div style={{ display: "flex", gap: "1.5rem", marginBottom: "2rem", width: "100%", justifyContent: "center" }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1, alignItems: 'center' }}>
        <Button
          onClick={() => onSelect(15)}
          className="btn-hover-dark"
          style={getButtonStyle()}
        >
          <span style={{ width: '100%', textAlign: 'center' }}>15</span>
        </Button>
        <span style={{ fontSize: '0.8rem', fontWeight: 900, opacity: 0.8, letterSpacing: '0.1em', color: '#fff' }}>RÁPIDA</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1, alignItems: 'center' }}>
        <Button
          onClick={() => onSelect(30)}
          className="btn-hover-dark"
          style={getButtonStyle()}
        >
          <span style={{ width: '100%', textAlign: 'center' }}>30</span>
        </Button>
        <span style={{ fontSize: '0.8rem', fontWeight: 900, opacity: 0.8, letterSpacing: '0.1em', color: '#fff' }}>COMPLETA</span>
      </div>
    </div>
  );
};
