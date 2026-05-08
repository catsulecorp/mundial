import React from 'react';

interface StickerBadgeProps {
  label: string;
  value: string | number;
  color?: string;
  subLabel?: string;
}

export const StickerBadge: React.FC<StickerBadgeProps> = ({ label, value, color = "#fff", subLabel }) => {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <span style={{ fontSize: "0.55rem", fontWeight: 700, color: "rgba(255,255,255,0.7)", letterSpacing: "0.05em", marginBottom: "-2px" }}>
        {label}
      </span>
      <div style={{ display: "flex", alignItems: "baseline", gap: "2px" }}>
        <span style={{ fontSize: "1.1rem", fontWeight: 900, color: color, textShadow: "0 0 10px rgba(255,255,255,0.3)" }}>
          {value}
        </span>
        {subLabel && (
          <span style={{ fontSize: "0.5rem", fontWeight: 600, color: "rgba(255,255,255,0.5)" }}>
            {subLabel}
          </span>
        )}
      </div>
    </div>
  );
};
