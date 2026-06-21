import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { createBooking, getSeats } from '../api/client';

const PRICE = 18.50;
const ROWS = ['A', 'B', 'C', 'D', 'E', 'F'];

/** 座位選擇 + 結帳頁。版面移植自 design/checkout_neon.html。 */
export default function CheckoutPage() {
  const { showtimeId } = useParams();
  const navigate = useNavigate();
  const { state } = useLocation();
  const movie = state?.movie;
  const showtime = state?.showtime;

  const [seats, setSeats] = useState([]);
  const [selected, setSelected] = useState(new Set());
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    getSeats(showtimeId).then(setSeats);
  }, [showtimeId]);

  // 依座位 ID 建立快速查找 Map
  const seatMap = Object.fromEntries(seats.map(s => [`${s.rowLabel}${s.seatNumber}`, s]));

  function toggle(key) {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  }

  async function handleCheckout() {
    if (!selected.size || !email) return;
    setLoading(true);
    setError(null);
    try {
      const seatIds = [...selected].map(k => seatMap[k].seatId);
      const result = await createBooking({ showtimeId: Number(showtimeId), seatIds, email });
      navigate(`/tickets/${result.bookingNumber}`);
    } catch (err) {
      const status = err.response?.status;
      if (status === 409) {
        setError('One or more selected seats were just taken. Please re-select.');
        // 重新載入座位狀態
        const fresh = await getSeats(showtimeId);
        setSeats(fresh);
        setSelected(new Set());
      } else {
        setError(err.response?.data?.error ?? 'Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }

  const selectedList = [...selected].sort();
  const total = (selected.size * PRICE).toFixed(2);
  const canCheckout = selected.size > 0 && email.length > 0;

  return (
    <>
      {/* TopNav */}
      <nav className="fixed top-0 w-full z-50 bg-background/40 backdrop-blur-md border-b border-white/10">
        <div className="flex justify-between items-center px-margin-desktop py-4 max-w-max-width mx-auto">
          <span onClick={() => navigate('/')} className="font-display-lg text-headline-lg tracking-tighter text-primary drop-shadow-[0_0_10px_rgba(0,242,255,0.5)] uppercase cursor-pointer">CINEMIST</span>
        </div>
      </nav>

      <main className="pt-24 pb-12 px-margin-desktop max-w-max-width mx-auto min-h-screen flex flex-col md:flex-row gap-12">
        {/* Left: seat map */}
        <section className="flex-grow">
          <header className="mb-12">
            <h1 className="font-headline-lg text-headline-lg text-primary uppercase tracking-widest mb-2">
              {movie?.title ?? 'Seat Selection'}
            </h1>
            <div className="flex items-center gap-4 text-on-surface-variant font-label-md text-label-md">
              <span>STANDARD DIGITAL</span>
              <span className="w-1 h-1 bg-outline rounded-full" />
              <span>{showtime ? showtime.startTime.replace('T', ' ').slice(0, 16) : ''}</span>
            </div>
          </header>

          <div className="relative w-full aspect-[16/10] glass-panel rounded-xl overflow-hidden p-8 flex flex-col items-center" style={{ perspective: '1000px' }}>
            {/* Screen */}
            <div className="w-full h-2 mb-16 bg-primary-container/20 rounded-full blur-sm" style={{ filter: 'drop-shadow(0 0 20px rgba(0,242,255,0.4))' }} />
            <div className="w-2/3 h-1 bg-gradient-to-r from-transparent via-primary-container to-transparent opacity-50 mb-8" />
            <div className="font-label-sm text-label-sm uppercase tracking-[0.3em] text-on-surface-variant mb-10">SCREEN</div>

            {/* Seat grid */}
            <div className="w-full max-w-2xl" style={{ transform: 'rotateX(20deg)' }}>
              <div className="flex flex-col gap-3">
                {ROWS.map(row => (
                  <div key={row} className="flex justify-center items-center gap-2">
                    <span className="w-5 text-center font-label-sm text-label-sm text-on-surface-variant shrink-0">{row}</span>
                    <div className="flex gap-2">
                      {Array.from({ length: 12 }, (_, i) => {
                        const key = `${row}${i + 1}`;
                        const seat = seatMap[key];
                        const isSold = seat?.status === 'SOLD';
                        const isSel = selected.has(key);
                        return (
                          <button key={key} disabled={isSold}
                            onClick={() => toggle(key)}
                            title={key}
                            className={`w-8 h-8 md:w-9 md:h-9 rounded-sm text-[10px] font-label-sm transition-all duration-200 flex items-center justify-center ${
                              isSold ? 'seat-sold' : isSel ? 'seat-selected' : 'seat-available'
                            }`}>
                            {isSel ? key : ''}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Legend */}
            <div className="mt-10 flex gap-8 font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 seat-available rounded-sm" />
                <span>Available</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 seat-sold rounded-sm" />
                <span>Occupied</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 seat-selected rounded-sm" />
                <span>Selected</span>
              </div>
            </div>
          </div>
        </section>

        {/* Right: checkout sidebar */}
        <aside className="w-full md:w-96 flex flex-col gap-6">
          <div className="glass-panel rounded-xl p-8 sticky top-32">
            {movie?.posterUrl && (
              <div className="w-full h-48 rounded-lg overflow-hidden mb-6 border border-white/5">
                <img src={movie.posterUrl} alt={movie.title} className="w-full h-full object-cover" />
              </div>
            )}
            <h2 className="font-headline-md text-headline-md text-primary mb-1">BOOKING SUMMARY</h2>
            <p className="font-label-sm text-label-sm text-on-surface-variant mb-6">
              {showtime ? new Date(showtime.startTime).toLocaleString() : ''}
            </p>

            <div className="space-y-4 mb-6">
              <div className="flex justify-between items-center">
                <span className="font-label-md text-label-md text-on-surface-variant">Cinema</span>
                <span className="font-body-md text-body-md text-on-surface">{showtime?.theater?.name ?? 'Cinemist Prime'}</span>
              </div>
              <div className="flex justify-between items-start">
                <span className="font-label-md text-label-md text-on-surface-variant">Seats</span>
                <div className="text-right">
                  <span className="font-body-md text-body-md text-primary">
                    {selectedList.length > 0 ? selectedList.join(', ') : 'None'}
                  </span>
                </div>
              </div>
            </div>

            <div className="border-t border-white/10 pt-6 mb-6">
              <div className="flex justify-between items-center">
                <span className="font-label-md text-label-md text-on-surface-variant">Total Amount</span>
                <span className="font-headline-lg text-headline-lg text-primary">${total}</span>
              </div>
            </div>

            {/* Email input */}
            <div className="relative group mb-6">
              <input
                className="w-full bg-black border border-white/10 px-4 py-3 font-body-md text-body-md focus:outline-none focus:border-primary-container transition-all"
                placeholder="Email for digital ticket"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
              <div className="absolute bottom-0 left-0 h-[1px] bg-primary-container w-0 group-focus-within:w-full transition-all duration-500" />
            </div>

            {error && (
              <div className="mb-4 px-4 py-3 bg-error-container/20 border border-error/30 text-error font-label-sm text-label-sm rounded-sm">
                {error}
              </div>
            )}

            <button
              onClick={handleCheckout}
              disabled={!canCheckout || loading}
              className={`w-full py-5 bg-primary-container text-black font-label-md text-label-md font-bold tracking-widest uppercase flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed ${canCheckout ? 'digital-pulse' : ''}`}
            >
              {loading ? 'Processing...' : 'Complete Payment'}
              <span className="material-symbols-outlined">bolt</span>
            </button>

            <p className="mt-4 text-center font-label-sm text-[10px] text-on-surface-variant/60">
              By clicking complete, you agree to our Terms of Service. Digital tickets will be sent instantly.
            </p>
          </div>
        </aside>
      </main>
    </>
  );
}
