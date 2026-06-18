import { useEffect, useMemo, useState } from 'react';

const unlockAt = new Date('2026-06-22T21:00:00+03:00');
const openedKey = 'birthdayGiftGateOpened';
const clickCountKey = 'birthdayGiftGateClickCount';

type GiftCountdownGateProps = {
  onUnlocked: () => void;
};

type RemainingTime = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

function getRemainingTime(): RemainingTime {
  const diff = Math.max(0, unlockAt.getTime() - Date.now());
  const totalSeconds = Math.floor(diff / 1000);

  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  };
}

function isUnlocked() {
  return Date.now() >= unlockAt.getTime();
}

export default function GiftCountdownGate({ onUnlocked }: GiftCountdownGateProps) {
  const [opened, setOpened] = useState(() => localStorage.getItem(openedKey) === 'true');
  const [clicks, setClicks] = useState(() => Number(localStorage.getItem(clickCountKey) ?? 0));
  const [bursting, setBursting] = useState(false);
  const [remaining, setRemaining] = useState(getRemainingTime);

  const scale = useMemo(() => 1 + Math.min(clicks, 4) * 0.08, [clicks]);

  useEffect(() => {
    if (isUnlocked()) {
      onUnlocked();
      return undefined;
    }

    const interval = window.setInterval(() => {
      if (isUnlocked()) {
        onUnlocked();
        return;
      }
      setRemaining(getRemainingTime());
    }, 1000);

    return () => window.clearInterval(interval);
  }, [onUnlocked]);

  const handleGiftClick = () => {
    if (opened || bursting) {
      return;
    }

    const nextClicks = clicks + 1;
    setClicks(nextClicks);
    localStorage.setItem(clickCountKey, String(nextClicks));

    if (nextClicks >= 5) {
      setBursting(true);
      window.setTimeout(() => {
        localStorage.setItem(openedKey, 'true');
        setOpened(true);
      }, 620);
    }
  };

  return (
    <main className="relative grid min-h-screen overflow-hidden bg-[radial-gradient(circle_at_50%_18%,rgba(255,143,184,0.22),transparent_18rem),linear-gradient(180deg,#05071a,#151039_58%,#2a1446)] px-4 py-10 text-white">
      <div className="pointer-events-none absolute inset-0">
        {Array.from({ length: 18 }, (_, index) => (
          <span
            key={index}
            className="absolute block h-1.5 w-1.5 animate-[gateSparkle_5s_ease-in-out_infinite] rounded-full bg-champagne/70 shadow-[0_0_18px_rgba(255,224,199,0.7)]"
            style={{
              left: `${(index * 29) % 100}%`,
              top: `${12 + ((index * 37) % 74)}%`,
              animationDelay: `${index * 0.24}s`,
            }}
          />
        ))}
      </div>

      <section className="relative z-10 mx-auto flex w-full max-w-xl flex-col items-center justify-center text-center">
        {!opened ? (
          <>
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.28em] text-roseglow">
              Küçük Bir Sır
            </p>
            <h1 className="font-display text-4xl leading-tight text-champagne sm:text-5xl">
              Bu hediye biraz sabır istiyor
            </h1>
            <p className="mt-4 max-w-md text-base leading-7 text-white/72">
              Kutunun içinde sana sakladığım küçük bir gece var.
            </p>

            <button
              type="button"
              aria-label="Hediye kutusu"
              onClick={handleGiftClick}
              className={`relative mt-10 grid h-48 w-48 place-items-center rounded-[2rem] transition duration-300 focus:outline-none focus:ring-4 focus:ring-roseglow/35 ${
                bursting ? 'animate-[giftBurst_620ms_ease-out_forwards]' : 'animate-[giftPulse_2.5s_ease-in-out_infinite]'
              }`}
              style={{ transform: `scale(${scale})` }}
            >
              <span className="absolute inset-0 rounded-[2rem] bg-roseglow/20 blur-2xl" />
              <span className="absolute bottom-0 h-32 w-40 rounded-b-3xl rounded-t-lg border border-white/20 bg-gradient-to-br from-[#ff6f9f] to-[#8f4dff] shadow-[0_24px_70px_rgba(0,0,0,0.34)]" />
              <span className="absolute bottom-0 h-32 w-8 bg-champagne/95" />
              <span className="absolute bottom-14 h-8 w-40 bg-champagne/95" />
              <span className="absolute top-8 h-12 w-48 rounded-2xl border border-white/25 bg-gradient-to-r from-[#ff8fb8] to-[#a98bff] shadow-glow" />
              <span className="absolute top-2 h-14 w-16 -rotate-12 rounded-full border-[10px] border-champagne/95" />
              <span className="absolute top-2 h-14 w-16 rotate-12 rounded-full border-[10px] border-champagne/95" />
            </button>

            <p className="mt-10 rounded-full border border-white/12 bg-white/8 px-4 py-2 text-sm text-white/70 backdrop-blur">
              Kalbin ne zaman hazırsa kutuya dokun
            </p>
          </>
        ) : (
          <div className="w-full rounded-[2rem] border border-white/14 bg-white/[0.07] p-6 shadow-glass backdrop-blur-xl sm:p-8">
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-roseglow">
              Sürprizin Açılmasına Kalan
            </p>
            <h1 className="mt-3 font-display text-4xl text-champagne sm:text-5xl">
              Henüz zamanı gelmedi
            </h1>
            <p className="mt-3 text-sm font-semibold text-white/68">22.06.2026 · 21:00</p>

            <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <TimeCard value={remaining.days} label="Gün" />
              <TimeCard value={remaining.hours} label="Saat" />
              <TimeCard value={remaining.minutes} label="Dakika" />
              <TimeCard value={remaining.seconds} label="Saniye" />
            </div>

            <p className="mt-8 text-base leading-7 text-white/74">
              Bazı şeyler tam zamanında güzel. Bu sayfa o gece senin için açılacak.
            </p>
          </div>
        )}
      </section>

      <style>
        {`
          @keyframes giftPulse {
            0%, 100% { filter: drop-shadow(0 0 18px rgba(255,143,184,0.35)); }
            50% { filter: drop-shadow(0 0 34px rgba(255,143,184,0.62)); }
          }

          @keyframes giftBurst {
            0% { transform: scale(1.32) rotate(0deg); opacity: 1; }
            45% { transform: scale(1.5) rotate(-4deg); opacity: 1; }
            100% { transform: scale(1.95) rotate(8deg); opacity: 0; }
          }

          @keyframes gateSparkle {
            0%, 100% { transform: translateY(0) scale(0.75); opacity: 0.22; }
            50% { transform: translateY(-18px) scale(1); opacity: 0.78; }
          }

          @media (prefers-reduced-motion: reduce) {
            * { animation-duration: 0.001ms !important; animation-iteration-count: 1 !important; }
          }
        `}
      </style>
    </main>
  );
}

function TimeCard({ value, label }: { value: number; label: string }) {
  return (
    <div className="rounded-3xl border border-white/12 bg-ink/45 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
      <p className="font-display text-4xl text-champagne">{String(value).padStart(2, '0')}</p>
      <p className="mt-1 text-xs font-bold uppercase tracking-[0.16em] text-white/58">{label}</p>
    </div>
  );
}
