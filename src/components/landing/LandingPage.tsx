import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, LogOut } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { LandingHeader } from './LandingHeader';
import { GameModeSelector } from './GameModeSelector';
import { PointSelector } from './PointSelector';
import { MatchmakingOverlay } from './MatchmakingOverlay';

interface LandingPageProps {
  onStart: (mode: "1v1" | "2v2" | "multiplayer", points: 15 | 30, rivalName?: string, rivalId?: string) => void;
  sessionId: string;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStart, sessionId }) => {
  const [isWaiting, setIsWaiting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300);
  const [user, setUser] = useState<any>(null);
  const [rivalData, setRivalData] = useState<{ name: string, id: string } | null>(null);
  const [showVersus, setShowVersus] = useState(false);
  const [selectedMode, setSelectedMode] = useState<"1v1" | "2v2" | "multiplayer" | null>(null);
  const [isSelectingPoints, setIsSelectingPoints] = useState(false);
  const [selectedMaxPoints, setSelectedMaxPoints] = useState<15 | 30>(30);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }: any) => setUser(session?.user ?? null));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: any, session: any) => setUser(session?.user ?? null));
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    let timer: any;
    if (isWaiting && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    } else if (timeLeft === 0) {
      setIsWaiting(false);
    }
    return () => clearInterval(timer);
  }, [isWaiting, timeLeft]);

  const handleAuth = async () => {
    if (user) await supabase.auth.signOut();
    else await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin } });
  };

  const initiateGame = (mode: "1v1" | "2v2" | "multiplayer", points: 15 | 30) => {
    if (mode === 'multiplayer') {
      if (!user) {
        alert("Debes iniciar sesión para jugar online.");
        setIsSelectingPoints(false);
      } else {
        setSelectedMaxPoints(points);
        setIsWaiting(true);
        setTimeLeft(300);
        setIsSelectingPoints(false);
      }
    } else {
      onStart(mode, points);
    }
  };

  useEffect(() => {
    if (!isWaiting || !user || selectedMode !== "multiplayer") return;
    const channel = supabase.channel('matchmaking', { config: { presence: { key: sessionId } } });

    const checkMatch = () => {
      const state = channel.presenceState();
      const presences: any[] = [];
      Object.entries(state).forEach(([key, presenceList]: [string, any]) => {
        presenceList.forEach((p: any) => presences.push({ ...p, presence_key: key }));
      });

      if (presences.length >= 2) {
        const rival = presences.find(p => p.presence_key !== sessionId && Number(p.points) === Number(selectedMaxPoints) && p.status === 'waiting');
        if (rival && !rivalData) {
          const rName = rival.name || "OPONENTE";
          const rId = rival.presence_key;
          setRivalData({ name: rName, id: rId });
          setShowVersus(true);
          setTimeout(() => {
            setIsWaiting(false);
            setShowVersus(false);
            onStart("multiplayer", selectedMaxPoints, rName, rId);
          }, 3500);
        }
      }
    };

    channel.on('presence', { event: 'sync' }, checkMatch)
      .on('presence', { event: 'join' }, checkMatch)
      .subscribe(async (status: any) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            user_id: user.id,
            name: user.user_metadata.full_name?.split(' ')[0] || user.user_metadata.name?.split(' ')[0] || user.email.split('@')[0],
            points: Number(selectedMaxPoints),
            status: 'waiting'
          });
        }
      });

    return () => { channel.unsubscribe(); };
  }, [isWaiting, user, selectedMaxPoints, selectedMode, sessionId, rivalData, onStart]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      position: 'relative',
      overflowX: 'hidden'
    }}>      {/* Auth Button - Way Up Top & Centered */}
      <button
        onClick={handleAuth}
        className="btn-hover-dark"
        style={{
          position: 'absolute',
          top: '3.5rem',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(255, 255, 255, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          color: 'white',
          height: '40px',
          padding: '0 1.25rem',
          borderRadius: '1rem',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.75rem',
          fontSize: '0.75rem',
          fontWeight: 800,
          letterSpacing: '0.05em',
          backdropFilter: 'blur(12px)',
          textTransform: 'uppercase',
          transition: 'none',
          zIndex: 1000
        }}
      >
        {user ? (
          <>
            <LogOut size={18} style={{ transform: 'scaleX(-1)' }} />
            Cerrar Sesión
          </>
        ) : (
          <>
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Iniciar Sesión
          </>
        )}
      </button>

      <MatchmakingOverlay
        isWaiting={isWaiting}
        timeLeft={timeLeft}
        showVersus={showVersus}
        rivalData={rivalData}
        userName={user?.user_metadata.full_name?.split(' ')[0] || "VOS"}
        onCancel={() => setIsWaiting(false)}
        formatTime={formatTime}
      />

      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: '600px' }}
      >
        <LandingHeader user={user} />

        <p style={{ color: '#00f2ff', fontSize: '1.25rem', maxWidth: '600px', margin: '1rem 0 2rem 0', fontWeight: 700, opacity: 1, textAlign: 'center' }}>
          El clásico argentino, ahora con las figuritas del mundial.
        </p>

        <div style={{ width: '100%', paddingLeft: '22px' }}>
          <GameModeSelector
            selectedMode={selectedMode || "multiplayer"}
            onSelect={(mode) => {
              setSelectedMode(mode);
              setIsSelectingPoints(true);
            }}
          />
        </div>
      </motion.div>

      {/* Twitch Button - Way Down Bottom & Centered */}
      <a
        href="https://twitch.tv/muchomovimiento"
        target="_blank"
        rel="noopener noreferrer"
        className="btn-hover-dark"
        style={{
          position: 'fixed',
          bottom: '4.5rem',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(145, 70, 255, 0.2)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(145, 70, 255, 0.3)',
          color: 'white',
          height: '40px',
          padding: '0 1.25rem',
          borderRadius: '1rem',
          textDecoration: 'none',
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
          fontSize: '0.75rem',
          fontWeight: 800,
          letterSpacing: '0.05em',
          zIndex: 1000,
          textTransform: 'uppercase'
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
        MUCHOMOVIMIENTO
      </a>

      {/* Point Selection Modal */}
      <AnimatePresence>
        {isSelectingPoints && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.85)',
              backdropFilter: 'blur(10px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 2000,
              padding: '2rem'
            }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                padding: '3rem',
                borderRadius: '2.5rem',
                width: '100%',
                maxWidth: '500px',
                textAlign: 'center',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
              }}
            >
              <h2 className="text-display" style={{ fontSize: '3rem', color: '#fff', marginBottom: '2.5rem', lineHeight: 1 }}>
                ¿A CUÁNTOS<br />
                <span style={{ color: '#00f2ff' }}>PUNTOS?</span>
              </h2>

              <PointSelector onSelect={(points) => initiateGame(selectedMode!, points as 15 | 30)} />

              <motion.div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                <button
                  onClick={() => setIsSelectingPoints(false)}
                  className="btn-hover-dark"
                  style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    color: 'white',
                    marginTop: '0.25rem',
                    height: '40px',
                    borderRadius: '1rem',
                    padding: '0 1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '0.8rem',
                    fontWeight: 900,
                    cursor: 'pointer',
                    transition: 'none'
                  }}
                >
                  <Home size={18} />
                  VOLVER
                </button>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
