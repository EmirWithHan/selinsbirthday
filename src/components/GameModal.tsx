import { useEffect, useState } from 'react';
import CakePlatformGame from '../games/CakePlatformGame';
import GiftFlightGame from '../games/GiftFlightGame';
import type { GameId } from '../games/gameProgress';
import JumpToHeartGame from '../games/JumpToHeartGame';

type GameModalProps = {
  id: GameId;
  title: string;
  successMessage: string;
  completed: boolean;
  onClose: () => void;
  onComplete: () => void;
};

function LivesHud({ lives }: { lives: number }) {
  return (
    <div
      className="flex items-center gap-1 rounded-full border border-red-400/45 bg-red-950/35 px-2.5 py-2 shadow-[0_0_18px_rgba(239,68,68,0.2)]"
      aria-label={`${lives} can kaldı`}
    >
      {[0, 1, 2].map((index) => {
        const alive = index < lives;
        return (
          <span
            key={`${index}-${alive ? 'alive' : 'lost'}`}
            className={`grid h-5 w-5 place-items-center text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.75)] ${
              alive ? '' : 'animate-[heartBreak_260ms_ease-out] opacity-90'
            }`}
          >
            {alive ? <HeartIcon broken={false} /> : <HeartIcon broken />}
          </span>
        );
      })}
    </div>
  );
}

function HeartIcon({ broken }: { broken: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
      <path
        d="M12 21.2C8.2 17.8 3 14.2 3 8.7 3 5.6 5.4 3.4 8.2 3.4c1.6 0 3 .7 3.8 1.9.8-1.2 2.2-1.9 3.8-1.9 2.8 0 5.2 2.2 5.2 5.3 0 5.5-5.2 9.1-9 12.5Z"
        fill="#ef1f1f"
        stroke="#ffb3b3"
        strokeWidth="1.2"
      />
      {broken ? (
        <path
          d="M12.4 5.3 10 9.4l3.2 2.1-2.4 4.6 3.8-4.8-3.1-2.1 2.1-3.9"
          fill="none"
          stroke="#7f0612"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.8"
        />
      ) : null}
    </svg>
  );
}

export default function GameModal({
  id,
  title,
  successMessage,
  completed,
  onClose,
  onComplete,
}: GameModalProps) {
  const [lives, setLives] = useState(3);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-ink p-3 text-white sm:p-5" role="dialog" aria-modal="true">
      <div className="mb-3 flex items-center justify-between gap-3 rounded-3xl border border-white/12 bg-white/8 px-4 py-3 backdrop-blur">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-roseglow">Oyun</p>
          <h2 className="font-display text-2xl text-champagne">{title}</h2>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <LivesHud lives={lives} />
          <div className="rounded-full border border-white/15 bg-white/10 px-3 py-2 text-sm font-black text-white">
            Lvl 21
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-12 w-12 place-items-center rounded-full border border-white/15 bg-white/10 text-xl font-bold"
            aria-label="Oyunu kapat"
          >
            ×
          </button>
        </div>
      </div>
      <div className="min-h-0 flex-1">
        {id === 'jump' ? <JumpToHeartGame onComplete={onComplete} onLivesChange={setLives} /> : null}
        {id === 'cake' ? <CakePlatformGame onComplete={onComplete} onLivesChange={setLives} /> : null}
        {id === 'gift' ? <GiftFlightGame onComplete={onComplete} onLivesChange={setLives} /> : null}
      </div>
      {completed ? (
        <div className="mt-3 rounded-3xl border border-roseglow/30 bg-roseglow/12 p-4 text-sm font-semibold leading-6 text-champagne">
          {successMessage}
        </div>
      ) : null}
      <style>
        {`
          @keyframes heartBreak {
            0% { transform: scale(1.25) rotate(-8deg); filter: brightness(1.35); }
            55% { transform: scale(0.82) rotate(9deg); }
            100% { transform: scale(1) rotate(0deg); }
          }
        `}
      </style>
    </div>
  );
}
