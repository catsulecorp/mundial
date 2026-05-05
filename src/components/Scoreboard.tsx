

interface ScoreboardProps {
  scoreA: number;
  scoreB: number;
  labelA: string;
  labelB: string;
}

export const Scoreboard: React.FC<ScoreboardProps> = ({ scoreA, scoreB, labelA, labelB }) => {
  return (
    <div className="scoreboard">
      <div className="scoreboard-item">
        <div className="scoreboard-label">{labelA}</div>
        <div className="scoreboard-value text-digital">{scoreA.toString().padStart(2, '0')}</div>
      </div>
      
      <div className="text-digital" style={{ fontSize: '2rem', opacity: 0.5 }}>:</div>
      
      <div className="scoreboard-item">
        <div className="scoreboard-label">{labelB}</div>
        <div className="scoreboard-value text-digital">{scoreB.toString().padStart(2, '0')}</div>
      </div>
    </div>
  );
};
