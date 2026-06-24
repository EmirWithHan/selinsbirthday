import { useEffect, useMemo, useState } from 'react';
import { siteContent } from '../data/siteContent';
import GameCard from './GameCard';
import GameModal from './GameModal';
import type { GameId, GameProgress, HiddenUnlockState, LockedTapCountState } from '../games/gameProgress';
import {
  isGameUnlocked,
  loadGameProgress,
  loadHiddenUnlocks,
  loadLockedTapCounts,
  saveGameProgress,
  saveHiddenUnlocks,
  saveLockedTapCounts,
} from '../games/gameProgress';

type GamesSectionProps = {
  onModalStateChange: (open: boolean) => void;
};

const ids: GameId[] = ['jump', 'cake', 'gift', 'slingshot'];

export default function GamesSection({ onModalStateChange }: GamesSectionProps) {
  const [progress, setProgress] = useState<GameProgress>(() => loadGameProgress());
  const [hiddenUnlocks, setHiddenUnlocks] = useState<HiddenUnlockState>(() => loadHiddenUnlocks());
  const [lockedTapCounts, setLockedTapCounts] = useState<LockedTapCountState>(() => loadLockedTapCounts());
  const [activeGame, setActiveGame] = useState<GameId | null>(null);

  useEffect(() => {
    saveGameProgress(progress);
  }, [progress]);

  useEffect(() => {
    saveHiddenUnlocks(hiddenUnlocks);
  }, [hiddenUnlocks]);

  useEffect(() => {
    saveLockedTapCounts(lockedTapCounts);
  }, [lockedTapCounts]);

  useEffect(() => {
    onModalStateChange(activeGame !== null);
  }, [activeGame, onModalStateChange]);

  const activeContent = useMemo(() => {
    if (!activeGame) return null;
    const index = ids.indexOf(activeGame);
    return siteContent.games.items[index];
  }, [activeGame]);

  const handleComplete = (id: GameId) => {
    setProgress((current) => ({ ...current, [id]: true }));
  };

  const handleLockedTap = (id: GameId) => {
    if (isGameUnlocked(id, progress, hiddenUnlocks)) {
      setActiveGame(id);
      return;
    }
    const nextCount = Math.min(7, (lockedTapCounts[id] ?? 0) + 1);
    setLockedTapCounts((current) => ({ ...current, [id]: nextCount }));
    if (nextCount === 7) {
      setHiddenUnlocks((unlocks) => ({ ...unlocks, [id]: true }));
      setActiveGame(id);
    }
  };

  const allComplete = progress.jump && progress.cake && progress.gift && progress.slingshot;

  return (
    <section id="games" className="relative px-4 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 max-w-2xl">
          <p className="text-sm font-bold uppercase tracking-[0.28em] text-roseglow">
            Küçük Sürprizler
          </p>
          <h2 className="mt-3 font-display text-4xl text-champagne sm:text-5xl">
            {siteContent.games.title}
          </h2>
          <p className="mt-4 text-base leading-7 text-white/72">{siteContent.games.text}</p>
        </div>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {siteContent.games.items.map((game, index) => (
            <GameCard
              key={game.id}
              id={game.id as GameId}
              index={index}
              title={game.title}
              description={game.description}
              progress={progress}
              hiddenUnlocks={hiddenUnlocks}
              onPlay={setActiveGame}
              onLockedTap={handleLockedTap}
            />
          ))}
        </div>
        {allComplete ? (
          <div className="glass-panel mt-8 rounded-3xl p-6 text-center">
            <p className="font-display text-2xl leading-9 text-champagne">
              {siteContent.games.finalMessage}
            </p>
          </div>
        ) : null}
      </div>
      {activeGame && activeContent ? (
        <GameModal
          id={activeGame}
          title={activeContent.title}
          successMessage={activeContent.success}
          completed={progress[activeGame]}
          onClose={() => setActiveGame(null)}
          onComplete={() => handleComplete(activeGame)}
        />
      ) : null}
    </section>
  );
}
