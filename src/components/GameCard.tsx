import type { GameId, GameProgress } from '../games/gameProgress';
import { isGameUnlocked } from '../games/gameProgress';

type GameCardProps = {
  id: GameId;
  index: number;
  title: string;
  description: string;
  progress: GameProgress;
  onPlay: (id: GameId) => void;
};

export default function GameCard({ id, index, title, description, progress, onPlay }: GameCardProps) {
  const unlocked = isGameUnlocked(id, progress);
  const completed = progress[id];

  return (
    <article className="glass-panel rounded-3xl p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white/12 font-display text-2xl text-champagne">
          {index + 1}
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-bold ${
            completed
              ? 'bg-emerald-300/18 text-emerald-100'
              : unlocked
                ? 'bg-roseglow/18 text-roseglow'
                : 'bg-white/10 text-white/48'
          }`}
        >
          {completed ? 'Tamamlandı' : unlocked ? 'Açık' : 'Kilitli'}
        </span>
      </div>
      <h3 className="mt-6 font-display text-3xl text-champagne">{title}</h3>
      <p className="mt-3 min-h-16 text-sm leading-6 text-white/68">{description}</p>
      <button
        type="button"
        disabled={!unlocked}
        onClick={() => onPlay(id)}
        className="mt-6 min-h-12 w-full rounded-full bg-gradient-to-r from-roseglow to-champagne px-5 font-bold text-[#321337] shadow-glow transition disabled:cursor-not-allowed disabled:from-white/12 disabled:to-white/10 disabled:text-white/40 disabled:shadow-none"
      >
        {unlocked ? 'Oyna' : 'Önceki Sürprizi Tamamla'}
      </button>
    </article>
  );
}
