export type GameId = 'jump' | 'cake' | 'gift';

const storageKey = 'romantic-birthday-game-progress';

export type GameProgress = Record<GameId, boolean>;

export const initialProgress: GameProgress = {
  jump: false,
  cake: false,
  gift: false,
};

export function loadGameProgress(): GameProgress {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) {
      return initialProgress;
    }
    return { ...initialProgress, ...JSON.parse(raw) };
  } catch {
    return initialProgress;
  }
}

export function saveGameProgress(progress: GameProgress) {
  localStorage.setItem(storageKey, JSON.stringify(progress));
}

export function isGameUnlocked(id: GameId, progress: GameProgress) {
  if (id === 'jump') return true;
  if (id === 'cake') return progress.jump;
  return progress.jump && progress.cake;
}
