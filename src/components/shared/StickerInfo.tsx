import React from 'react';

interface StickerInfoProps {
  country: string;
  club: string;
  isHovered: boolean;
}

export const StickerInfo: React.FC<StickerInfoProps> = ({ country, club, isHovered }) => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "2px",
        opacity: isHovered ? 1 : 0,
        transition: "opacity 0.15s ease",
        pointerEvents: "none",
      }}
    >
      <span
        className="text-display"
        style={{
          color: "var(--color-primary)",
          fontSize: "0.8rem",
          lineHeight: 1.2,
        }}
      >
        {country}
      </span>
      <span
        className="text-display"
        style={{
          color: "var(--color-primary)",
          fontSize: "0.75rem",
          lineHeight: 1.2,
          opacity: 0.8
        }}
      >
        ({club})
      </span>
    </div>
  );
};
