import { useCallback, useState } from 'react';
import FloatingHearts from './components/FloatingHearts';
import AgeTimeline from './components/AgeTimeline';
import GiftCountdownGate from './components/GiftCountdownGate';
import GamesSection from './components/GamesSection';
import HamburgerMenu from './components/HamburgerMenu';
import MemoryBook from './components/MemoryBook';
import StarMapHero from './components/StarMapHero';

const unlockAt = new Date('2026-06-22T21:00:00+03:00');
const previewBypassKey = 'birthdayPreviewBypass';

function shouldShowWebsite() {
  const targetReached = Date.now() >= unlockAt.getTime();
  if (targetReached) {
    return true;
  }

  const params = new URLSearchParams(window.location.search);
  if (params.get('gate') === '1') {
    localStorage.removeItem(previewBypassKey);
    return false;
  }

  if (params.get('preview') === 'emir') {
    localStorage.setItem(previewBypassKey, 'true');
    return true;
  }

  return localStorage.getItem(previewBypassKey) === 'true';
}

export default function App() {
  const [gameModalOpen, setGameModalOpen] = useState(false);
  const [unlocked, setUnlocked] = useState(shouldShowWebsite);
  const handleUnlocked = useCallback(() => setUnlocked(true), []);

  if (!unlocked) {
    return <GiftCountdownGate onUnlocked={handleUnlocked} />;
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-ink text-white">
      <FloatingHearts hidden={gameModalOpen} />
      <HamburgerMenu />
      <main>
        <StarMapHero />
        <AgeTimeline />
        <MemoryBook />
        <GamesSection onModalStateChange={setGameModalOpen} />
      </main>
    </div>
  );
}
