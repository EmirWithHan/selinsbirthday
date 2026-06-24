import type { GameId, GameProgress, HiddenUnlockState } from '../games/gameProgress';
import { isGameUnlocked } from '../games/gameProgress';

type GameCardProps = {
  id: GameId;
  index: number;
  title: string;
  description: string;
  progress: GameProgress;
  hiddenUnlocks: HiddenUnlockState;
  onPlay: (id: GameId) => void;
  onLockedTap: (id: GameId) => void;
};

export default function GameCard({
  id,
  index,
  title,
  description,
  progress,
  hiddenUnlocks,
  onPlay,
  onLockedTap,
}: GameCardProps) {
  const unlocked = isGameUnlocked(id, progress, hiddenUnlocks);
  const completed = progress[id];

  return (
    <article
      className={`glass-panel select-none rounded-3xl p-5 transition duration-150 [touch-action:pan-y] [-webkit-touch-callout:none] ${
        unlocked ? '' : 'cursor-pointer active:scale-[0.992] active:shadow-[0_0_24px_rgba(255,143,184,0.16)]'
      }`}
      onClick={() => {
        if (!unlocked) onLockedTap(id);
      }}
      onContextMenu={(event) => event.preventDefault()}
    >
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
        aria-disabled={!unlocked}
        onClick={() => {
          if (unlocked) onPlay(id);
        }}
        className={`mt-6 min-h-12 w-full rounded-full px-5 font-bold transition ${
          unlocked
            ? 'bg-gradient-to-r from-roseglow to-champagne text-[#321337] shadow-glow'
            : 'cursor-default bg-white/10 text-white/40 shadow-none'
        }`}
      >
        {unlocked ? 'Oyna' : 'Önceki Sürprizi Tamamla'}
      </button>
    </article>
  );
}
