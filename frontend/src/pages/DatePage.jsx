import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getMovie, getShowtimes } from '../api/client';

const DAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

/** 日期 / 場次選擇頁。版面移植自 design/date_neon.html。 */
export default function DatePage() {
  const { movieId } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [showtimes, setShowtimes] = useState([]);
  const [activeDate, setActiveDate] = useState(null);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    getMovie(movieId).then(setMovie);
    getShowtimes(movieId).then(list => {
      setShowtimes(list);
      if (list.length > 0) setActiveDate(list[0].startTime.slice(0, 10));
    });
  }, [movieId]);

  // 依日期分組
  const byDate = useMemo(() => {
    const map = {};
    for (const s of showtimes) {
      const date = s.startTime.slice(0, 10);
      (map[date] = map[date] || []).push(s);
    }
    return map;
  }, [showtimes]);

  const dates = Object.keys(byDate).sort();
  const current = activeDate ?? dates[0];
  const sessions = byDate[current] ?? [];

  if (!movie) return <div className="min-h-screen bg-background flex items-center justify-center text-primary">Loading...</div>;

  return (
    <>
      {/* TopNav */}
      <nav className="fixed top-0 w-full z-50 bg-background/40 backdrop-blur-md border-b border-white/10">
        <div className="flex justify-between items-center px-margin-desktop py-4 max-w-max-width mx-auto">
          <span onClick={() => navigate('/')} className="font-display-lg text-headline-lg tracking-tighter text-primary drop-shadow-[0_0_10px_rgba(0,242,255,0.5)] uppercase cursor-pointer">CINEMIST</span>
          <div className="hidden md:flex items-center gap-10">
            <span onClick={() => navigate('/')} className="text-on-surface-variant hover:text-primary transition-colors duration-300 font-label-md text-label-md cursor-pointer">Movies</span>
          </div>
        </div>
      </nav>

      <main className="pt-32 pb-20 max-w-max-width mx-auto px-margin-desktop min-h-screen">
        {/* Movie header */}
        <div className="flex flex-col md:flex-row gap-12 items-end mb-16 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="relative w-full md:w-64 h-96 shrink-0 group">
            <div className="absolute -inset-1 bg-gradient-to-tr from-primary-container to-secondary-container opacity-30 blur group-hover:opacity-60 transition duration-500" />
            <div className="relative w-full h-full overflow-hidden glass-panel">
              <img className="w-full h-full object-cover" src={movie.posterUrl} alt={movie.title} />
            </div>
          </div>
          <div className="flex-grow pb-4">
            <div className="flex items-center gap-4 mb-4">
              <span className="px-3 py-1 bg-primary-container text-background font-label-sm text-label-sm rounded-sm">{movie.genre}</span>
              <span className="flex items-center gap-1 text-primary">
                <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                <span className="font-label-md">{movie.rating}</span>
              </span>
            </div>
            <h1 className="font-display-lg text-display-lg-mobile md:text-display-lg leading-none uppercase mb-4 tracking-tighter text-primary">{movie.title}</h1>
            <p className="text-on-surface-variant max-w-2xl font-body-lg text-body-lg">Select your preferred session.</p>
          </div>
        </div>

        {/* Date picker */}
        <section className="mb-12">
          <h2 className="font-headline-md text-headline-md uppercase tracking-widest text-primary flex items-center gap-3 mb-6">
            <span className="w-8 h-[2px] bg-primary" /> Select Date
          </h2>
          <div className="flex gap-4 overflow-x-auto pb-4" style={{ WebkitMaskImage: 'linear-gradient(to right, black 85%, transparent 100%)', maskImage: 'linear-gradient(to right, black 85%, transparent 100%)' }}>
            {dates.map(d => {
              const dt = new Date(d);
              const isActive = d === current;
              return (
                <button key={d} onClick={() => { setActiveDate(d); setSelected(null); }}
                  className={`shrink-0 flex flex-col items-center justify-center w-24 h-32 glass-panel transition-all duration-300 ${isActive ? 'border-primary bg-primary/10' : 'border-white/5 hover:border-primary/40'}`}>
                  <span className="text-on-surface-variant font-label-sm text-label-sm uppercase mb-1">{DAYS[dt.getDay()]}</span>
                  <span className={`font-headline-lg text-headline-lg leading-none mb-1 ${isActive ? 'text-primary' : 'text-on-surface'}`}>{dt.getDate()}</span>
                  <div className={`w-6 h-1 ${isActive ? 'bg-primary' : 'bg-transparent'}`} />
                </button>
              );
            })}
          </div>
        </section>

        {/* Sessions */}
        <section className="space-y-8">
          <h2 className="font-headline-md text-headline-md uppercase tracking-widest text-primary flex items-center gap-3 mb-2">
            <span className="w-8 h-[2px] bg-primary" /> Sessions
          </h2>
          <div className="glass-panel glass-panel-hover p-8 relative overflow-hidden group">
<div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
              <div className="max-w-md">
                <div className="flex items-center gap-3 mb-2">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  <span className="text-primary font-label-sm text-label-sm uppercase tracking-widest">Active Hub</span>
                </div>
                <h3 className="font-headline-lg text-headline-lg uppercase mb-2">CINEMIST PRIME: TAIPEI</h3>
                <p className="text-on-surface-variant font-body-md text-body-md">Taipei Main Station. Ultra-wide immersive screens.</p>
              </div>
              <div className="flex-grow">
                <div className="flex items-center gap-2 mb-3">
                  <span className="font-label-md text-label-md text-primary-container">STANDARD DIGITAL</span>
                  <span className="h-[1px] flex-grow bg-white/10" />
                </div>
                <div className="flex flex-wrap gap-3">
                  {sessions.map(s => {
                    const time = s.startTime.slice(11, 16);
                    const isSel = selected?.id === s.id;
                    return (
                      <button key={s.id} onClick={() => setSelected(s)}
                        className={`px-6 py-3 glass-panel transition-all text-center min-w-[100px] ${isSel ? 'border-primary-container bg-primary-container/20 shimmer-sweep' : 'border-white/10 hover:border-primary-container hover:bg-primary-container/10'}`}>
                        <span className={`block font-headline-md text-headline-md leading-none ${isSel ? 'text-primary-container' : ''}`}>{time}</span>
                        <span className="text-[10px] text-primary uppercase font-label-sm">Available</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Selection footer */}
      {selected && (
        <div className="fixed bottom-0 left-0 w-full z-[60]">
          <div className="bg-primary-container text-background py-6 px-margin-desktop shadow-[0_-20px_50px_rgba(0,242,255,0.3)]">
            <div className="max-w-max-width mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-8">
                <div>
                  <span className="text-[10px] uppercase font-bold opacity-70 block mb-1">Selected Session</span>
                  <span className="font-headline-md text-headline-md leading-none">{selected.startTime.slice(11, 16)}</span>
                </div>
                <div className="w-[1px] h-10 bg-background/20 hidden md:block" />
                <div>
                  <span className="text-[10px] uppercase font-bold opacity-70 block mb-1">Location</span>
                  <span className="font-headline-md text-headline-md leading-none uppercase">{selected.theater?.name ?? 'Cinemist Prime'}</span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate(`/showtimes/${selected.id}/seats`, { state: { showtime: selected, movie } })}
                  className="px-10 py-4 bg-background text-primary border border-primary/20 hover:scale-105 active:scale-95 transition-all font-label-md text-label-md uppercase tracking-widest font-bold"
                >
                  Continue to Seats
                </button>
                <button onClick={() => setSelected(null)} className="w-12 h-12 flex items-center justify-center hover:bg-background/10 transition-colors">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
