import React, { useState } from 'react';
import { RankingSidebar } from './RankingSidebar';
import { InstructionsPanel } from './InstructionsPanel';

export const GameSidebar: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'ranking' | 'rules'>('rules');

  return (
    <div className="sidebar-help sidebar-left">
      {/* Tabs */}
      <div style={{ 
        display: "flex", 
        gap: "0.5rem", 
        marginBottom: "1.25rem",
        background: "rgba(255,255,255,0.05)",
        padding: "0.25rem",
        borderRadius: "12px",
        border: "1px solid rgba(255,255,255,0.1)"
      }}>
        <button
          onClick={() => setActiveTab('rules')}
          style={{
            flex: 1,
            padding: "0.5rem",
            borderRadius: "10px",
            border: "none",
            background: activeTab === 'rules' ? "rgba(255,255,255,0.1)" : "transparent",
            color: activeTab === 'rules' ? "var(--color-accent)" : "rgba(255,255,255,0.5)",
            fontSize: "0.7rem",
            fontWeight: 800,
            cursor: "pointer",
            transition: "all 0.2s"
          }}
        >
          REGLAS
        </button>
        <button
          onClick={() => setActiveTab('ranking')}
          style={{
            flex: 1,
            padding: "0.5rem",
            borderRadius: "10px",
            border: "none",
            background: activeTab === 'ranking' ? "rgba(255,255,255,0.1)" : "transparent",
            color: activeTab === 'ranking' ? "var(--color-accent)" : "rgba(255,255,255,0.5)",
            fontSize: "0.7rem",
            fontWeight: 800,
            cursor: "pointer",
            transition: "all 0.2s"
          }}
        >
          RANKING
        </button>
      </div>

      {/* Content */}
      <div style={{ height: "100%", overflowY: "auto" }}>
        {activeTab === 'rules' ? <InstructionsPanel /> : <RankingSidebar />}
      </div>
    </div>
  );
};
