import { useState, useEffect } from 'react';

const BASE_PLAYERS = [
  { id: 'messi',   rank: 1, name: 'Lionel Messi',      country: 'Argentina', club: 'Inter Miami CF', baseVotes: 248 },
  { id: 'cr7',     rank: 2, name: 'Cristiano Ronaldo', country: 'Portugal',  club: 'Al Nassr',       baseVotes: 189 },
  { id: 'mbappe',  rank: 3, name: 'Kylian Mbappé',     country: 'Francia',   club: 'Real Madrid',    baseVotes: 134 },
  { id: 'yamal',   rank: 4, name: 'Lamine Yamal',      country: 'España',    club: 'FC Barcelona',   baseVotes: 97  },
  { id: 'neymar',  rank: 5, name: 'Neymar Jr',         country: 'Brasil',    club: 'Al Hilal',       baseVotes: 72  },
  { id: 'haaland', rank: 6, name: 'Erling Haaland',    country: 'Noruega',   club: 'Man City',       baseVotes: 61  },
];

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
    <div className="sidebar-help sidebar-left">
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

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
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
    </div>
  );
};
