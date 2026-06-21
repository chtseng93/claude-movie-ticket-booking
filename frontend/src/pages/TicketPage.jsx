import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import html2canvas from 'html2canvas';
import { getBooking } from '../api/client';

/** 假 QR Code — 固定圖案，視覺裝飾用途。 */
function FakeQR({ bookingNumber }) {
  // 以 bookingNumber 當 seed 決定格子顏色，產生一致的假 QR
  const cells = 17;
  const seed = bookingNumber.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const filled = (r, c) => {
    // 角落 finder patterns
    if ((r < 3 && c < 3) || (r < 3 && c >= cells - 3) || (r >= cells - 3 && c < 3)) return true;
    return ((seed * (r * 23 + c * 7 + 13)) & 0xff) > 120;
  };
  const size = cells * 8;
  return (
    <svg width={size} height={size} style={{ imageRendering: 'pixelated', display: 'block' }}>
      {Array.from({ length: cells }, (_, r) =>
        Array.from({ length: cells }, (_, c) =>
          filled(r, c) ? <rect key={`${r}-${c}`} x={c * 8} y={r * 8} width={8} height={8} fill="#fff" /> : null
        )
      )}
    </svg>
  );
}

/** 訂單完成 / 電子票頁。版面移植自 design/ticket_neon.html。 */
export default function TicketPage() {
  const { bookingNumber } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState(false);
  const ticketRef = useRef(null);

  /** 將票券 DOM 截圖並下載為 PNG，同時在新分頁開啟預覽 */
  const downloadPNG = async () => {
    if (!ticketRef.current || saved) return;
    const canvas = await html2canvas(ticketRef.current, { backgroundColor: null, scale: 2, useCORS: true });
    const dataUrl = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `${bookingNumber}.png`;
    a.click();
    setSaved(true);
    window.open(dataUrl, '_blank');
  };

  useEffect(() => {
    getBooking(bookingNumber).then(setBooking).catch(() => setError('Booking not found.'));
  }, [bookingNumber]);

  if (error) return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-6 text-primary">
      <span className="material-symbols-outlined text-[64px]">error_outline</span>
      <p className="font-headline-md text-headline-md">{error}</p>
      <button onClick={() => navigate('/')} className="px-8 py-3 border border-primary text-primary font-label-md text-label-md uppercase">Back to Home</button>
    </div>
  );

  if (!booking) return (
    <div className="min-h-screen bg-background flex items-center justify-center text-primary">Loading...</div>
  );

  const startTime = new Date(booking.showtime.startTime);
  const dateStr = startTime.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase();
  const timeStr = startTime.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

  return (
    <>
      {/* Nav */}
      <header className="fixed top-0 w-full z-50 flex justify-between items-center px-margin-desktop py-4 bg-background/40 backdrop-blur-xl border-b border-white/10">
        <span className="font-headline-md text-headline-md font-bold tracking-tighter text-primary cursor-pointer" onClick={() => navigate('/')}>CINEMIST</span>
        <span className="font-label-sm text-label-sm text-primary font-bold">TICKETS</span>
      </header>

      <main className="relative min-h-screen pt-24 pb-32 flex flex-col items-center justify-center overflow-hidden">
        {/* Background streaks */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-20">
          {[{ top: '10%', delay: '0s' }, { top: '35%', delay: '2s' }, { top: '65%', delay: '5s' }].map((s, i) => (
            <div key={i} className="absolute h-px w-[200%] bg-gradient-to-r from-transparent via-primary to-transparent"
              style={{ top: s.top, left: '-50%', animation: `streak 10s linear ${s.delay} infinite`, transform: 'rotate(-45deg)' }} />
          ))}
        </div>

        <div className="max-w-md w-full px-margin-mobile relative z-20">
          {/* Ticket */}
          <div ref={ticketRef} className="ticket-shape relative backdrop-blur-2xl overflow-hidden neon-glow" style={{ boxShadow: '0 0 15px rgba(0,242,255,0.3)' }}>
            {/* Notches */}
            <div className="absolute w-10 h-10 rounded-full bg-background border border-primary/20 z-10" style={{ top: '67.5%', left: '-22px', transform: 'translateY(-50%)' }} />
            <div className="absolute w-10 h-10 rounded-full bg-background border border-primary/20 z-10" style={{ top: '67.5%', right: '-22px', transform: 'translateY(-50%)' }} />

            {/* Header */}
            <div className="p-8 text-center border-b border-white/5 bg-gradient-to-b from-primary/10 to-transparent">
              <h1 className="font-headline-lg text-headline-lg text-primary tracking-widest mb-1">{booking.movie.title}</h1>
              <p className="font-label-sm text-label-sm text-primary/60 tracking-tighter uppercase">Official Digital Pass</p>
            </div>

            {/* Poster */}
            <div className="relative w-full overflow-hidden" style={{ aspectRatio: '4/3' }}>
              <img src={booking.movie.posterUrl} alt={booking.movie.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-8">
                <span className="bg-primary text-on-primary px-3 py-1 font-label-md text-label-md rounded-sm">STANDARD</span>
              </div>
            </div>

            {/* QR section */}
            <div className="p-8 flex flex-col items-center border-t border-dashed border-white/20 mt-4">
              <p className="font-label-md text-label-md text-primary mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">qr_code_scanner</span>
                SCAN TO ENTER
              </p>
              <div className="relative p-3 bg-white/5 rounded-xl border border-white/10 overflow-hidden">
                {/* Scan animation */}
                <div className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent opacity-60"
                  style={{ animation: 'scan 3s linear infinite' }} />
                <FakeQR bookingNumber={bookingNumber} />
              </div>
              <p className="font-label-sm text-label-sm text-on-surface-variant mt-4 opacity-60">{booking.bookingNumber}</p>
            </div>

            {/* Details grid */}
            <div className="p-8 pt-0 grid grid-cols-2 gap-y-6 gap-x-4">
              <div className="flex flex-col">
                <span className="font-label-sm text-label-sm text-on-surface-variant/60 uppercase mb-1">Date</span>
                <span className="font-label-md text-label-md text-on-surface">{dateStr}</span>
              </div>
              <div className="flex flex-col">
                <span className="font-label-sm text-label-sm text-on-surface-variant/60 uppercase mb-1">Time</span>
                <span className="font-label-md text-label-md text-on-surface">{timeStr}</span>
              </div>
              <div className="flex flex-col">
                <span className="font-label-sm text-label-sm text-on-surface-variant/60 uppercase mb-1">Cinema</span>
                <span className="font-label-md text-label-md text-on-surface">{booking.showtime.theater.name}</span>
              </div>
              <div className="flex flex-col">
                <span className="font-label-sm text-label-sm text-on-surface-variant/60 uppercase mb-1">Total</span>
                <span className="font-label-md text-label-md text-on-surface">${Number(booking.totalAmount).toFixed(2)}</span>
              </div>
              <div className="flex flex-col col-span-2">
                <span className="font-label-sm text-label-sm text-on-surface-variant/60 uppercase mb-2">Seats</span>
                <div className="flex flex-wrap gap-2">
                  {booking.seats.map(s => (
                    <span key={`${s.rowLabel}${s.seatNumber}`} className="bg-primary/20 text-primary border border-primary/30 px-3 py-1 rounded-sm font-label-md text-label-md">
                      {s.rowLabel}{s.seatNumber}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer stripe */}
            <div className="h-2 w-full bg-gradient-to-r from-primary via-secondary to-primary opacity-30" />
          </div>

          {/* Actions */}
          <div className="mt-12 flex flex-col gap-4 items-center">
            <button
              onClick={downloadPNG}
              className={`flex items-center gap-2 px-8 py-3 font-label-md text-label-md uppercase transition-all duration-300 ${
                saved
                  ? 'bg-primary-container text-on-primary border border-primary-container shadow-[0_0_20px_rgba(0,242,255,0.5)]'
                  : 'border border-primary text-primary hover:bg-primary/10'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">{saved ? 'check_circle' : 'download'}</span>
              {saved ? 'SAVED!' : 'SAVE TICKET'}
            </button>
            <button
              onClick={() => navigate('/')}
              className="group flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors font-label-sm text-label-sm"
            >
              <span className="material-symbols-outlined group-hover:-translate-x-1 transition-transform">arrow_back</span>
              BACK TO HOME
            </button>
          </div>
        </div>
      </main>

      <style>{`
        @keyframes scan { 0% { top: 0 } 100% { top: 100% } }
        @keyframes streak {
          0% { transform: translate(-100%, -100%) rotate(-45deg); }
          100% { transform: translate(100%, 100%) rotate(-45deg); }
        }
        .ticket-shape {
          background: linear-gradient(135deg, rgba(20,20,20,0.8) 0%, rgba(10,10,10,0.95) 100%);
          border: 1px solid rgba(0,242,255,0.2);
          clip-path: polygon(0% 0%, 100% 0%, 100% 65%, 95% 67.5%, 100% 70%, 100% 100%, 0% 100%, 0% 70%, 5% 67.5%, 0% 65%);
        }
      `}</style>
    </>
  );
}
