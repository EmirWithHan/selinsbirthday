export type GameId = 'jump' | 'cake' | 'gift' | 'slingshot';

const storageKey = 'romantic-birthday-game-progress';
const hiddenUnlockStorageKey = 'birthdayHiddenUnlocks';
const lockedTapCountStorageKey = 'birthdayLockedTapCounts';

export type GameProgress = Record<GameId, boolean>;
export type HiddenUnlockState = Partial<Record<GameId, boolean>>;
export type LockedTapCountState = Partial<Record<GameId, number>>;

export const initialProgress: GameProgress = {
  jump: false,
  cake: false,
  gift: false,
  slingshot: false,
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

function loadStoredObject(key: string): Record<string, unknown> {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(key) ?? '{}');
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
      ? parsed as Record<string, unknown>
      : {};
  } catch {
    return {};
  }
}

export function loadHiddenUnlocks(): HiddenUnlockState {
  const stored = loadStoredObject(hiddenUnlockStorageKey);
  return Object.fromEntries(
    Object.entries(stored).filter((entry): entry is [GameId, boolean] => entry[1] === true),
  ) as HiddenUnlockState;
}

export function saveHiddenUnlocks(unlocks: HiddenUnlockState) {
  localStorage.setItem(hiddenUnlockStorageKey, JSON.stringify(unlocks));
}

export function loadLockedTapCounts(): LockedTapCountState {
  const stored = loadStoredObject(lockedTapCountStorageKey);
  return Object.fromEntries(
    Object.entries(stored)
      .filter((entry): entry is [GameId, number] => typeof entry[1] === 'number' && Number.isFinite(entry[1]))
      .map(([id, count]) => [id, Math.max(0, Math.min(7, Math.floor(count)))]),
  ) as LockedTapCountState;
}

export function saveLockedTapCounts(counts: LockedTapCountState) {
  localStorage.setItem(lockedTapCountStorageKey, JSON.stringify(counts));
}

function isGameNormallyUnlocked(id: GameId, progress: GameProgress) {
  if (id === 'jump') return true;
  if (id === 'cake') return progress.jump;
  if (id === 'gift') return progress.jump && progress.cake;
  return progress.jump && progress.cake && progress.gift;
}

export function isGameUnlocked(id: GameId, progress: GameProgress, hiddenUnlocks: HiddenUnlockState = {}) {
  return isGameNormallyUnlocked(id, progress) || hiddenUnlocks[id] === true;
}
