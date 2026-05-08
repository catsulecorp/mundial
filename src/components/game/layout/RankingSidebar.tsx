import { useState, useEffect } from 'react';
import { CARDS } from '../../../data/cards';

const BASE_PLAYERS = CARDS.map(card => ({
  id: card.id,
  name: card.name,
  country: card.country,
  club: card.club,
  // We calculate a reasonable base vote count based on their truco power
  baseVotes: (40 - card.power) * 5 
}));

const STORAGE_KEY = 'mundial-user-votes-v2';

function loadUserVotes(): Record<string, 1 | -1 | 0> {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
}

export const RankingSidebar = () => {
  const [search, setSearch] = useState('');
  const [userVotes, setUserVotes] = useState<Record<string, 1 | -1 | 0>>(loadUserVotes);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userVotes));
  }, [userVotes]);

  const toggleVote = (id: string, dir: 1 | -1) => {
    setUserVotes(prev => {
      const current = prev[id] ?? 0;
      // Same direction = remove vote (toggle off)
      return { ...prev, [id]: current === dir ? 0 : dir };
    });
  };

  const sorted = [...BASE_PLAYERS]
    .map(p => ({
      ...p,
      totalVotes: p.baseVotes + (userVotes[p.id] ?? 0),
    }))
    .sort((a, b) => b.totalVotes - a.totalVotes);

  const filtered = sorted.filter(p => {
    const q = search.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.country.toLowerCase().includes(q) ||
      p.club.toLowerCase().includes(q)
    );
  });

  return (
    <>
      <h3 className="text-display" style={{ color: 'var(--color-accent)', fontSize: '0.9rem', marginBottom: '0.75rem', letterSpacing: '0.05em' }}>
        RANKING DE LAS CARTAS
      </h3>

      {/* Search */}
      <input
        type="text"
        placeholder="Buscar jugador..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{
          width: '100%',
          padding: '0.4rem 0.6rem',
          marginBottom: '0.75rem',
          background: 'rgba(255,255,255,0.08)',
          border: '1px solid rgba(255,255,255,0.15)',
          borderRadius: '8px',
          color: '#fff',
          fontSize: '0.75rem',
          outline: 'none',
          boxSizing: 'border-box',
        }}
      />

      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '0.5rem', 
        maxHeight: '420px', 
        overflowY: 'auto',
        paddingRight: '6px',
        scrollbarWidth: 'thin',
        scrollbarColor: 'rgba(255,255,255,0.2) transparent'
      }}>
        {filtered.length === 0 && (
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', textAlign: 'center' }}>Sin resultados</p>
        )}
        {filtered.map((p, i) => {
          const myVote = userVotes[p.id] ?? 0;
          return (
            <div key={p.id} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              {/* Rank number */}
              <span className="text-display" style={{ color: 'var(--color-accent)', minWidth: '22px', fontSize: '1.1rem', textAlign: 'right' }}>
                {i + 1}.
              </span>

              {/* Player info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 'bold', color: '#fff', fontSize: '0.78rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {p.name}
                </div>
                <div style={{ opacity: 0.6, fontSize: '0.65rem' }}>{p.country} · {p.club}</div>
              </div>

              {/* Vote buttons: ▼ score ▲ */}
              <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '3px' }}>
                <button
                  onClick={() => toggleVote(p.id, -1)}
                  title="Bajar en el ranking"
                  style={{
                    background: myVote === -1 ? 'var(--color-secondary)' : 'rgba(255,255,255,0.1)',
                    border: 'none',
                    borderRadius: '4px',
                    color: '#fff',
                    width: '20px',
                    height: '20px',
                    fontSize: '0.6rem',
                    cursor: 'pointer',
                    lineHeight: 1,
                    fontWeight: 'bold',
                  }}
                >▼</button>
                <span style={{
                  fontSize: '0.65rem',
                  minWidth: '28px',
                  textAlign: 'center',
                  color: myVote === 1 ? 'var(--color-accent)' : myVote === -1 ? 'var(--color-secondary)' : 'rgba(255,255,255,0.5)',
                  fontWeight: 'bold',
                }}>
                  {p.totalVotes > 0 ? `+${p.totalVotes}` : p.totalVotes}
                </span>
                <button
                  onClick={() => toggleVote(p.id, 1)}
                  title="Subir en el ranking"
                  style={{
                    background: myVote === 1 ? 'var(--color-accent)' : 'rgba(255,255,255,0.1)',
                    border: 'none',
                    borderRadius: '4px',
                    color: myVote === 1 ? '#000' : '#fff',
                    width: '20px',
                    height: '20px',
                    fontSize: '0.6rem',
                    cursor: 'pointer',
                    lineHeight: 1,
                    fontWeight: 'bold',
                  }}
                >▲</button>
              </div>
            </div>
          );
        })}
      </div>

      <p style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)', textAlign: 'center', marginTop: '0.75rem' }}>
        Tu voto mueve el ranking · se guarda localmente
      </p>
    </>
  );
};
