import { useCallback, useEffect, useState } from 'react';
import FloatingHearts from './components/FloatingHearts';
import AgeTimeline from './components/AgeTimeline';
import GiftCountdownGate from './components/GiftCountdownGate';
import GamesSection from './components/GamesSection';
import HamburgerMenu from './components/HamburgerMenu';
import MemoryBook from './components/MemoryBook';
import StarMapHero from './components/StarMapHero';
import { getServerNow } from './utils/serverTime';

const unlockAt = new Date('2026-06-22T21:00:00+03:00');
const previewBypassKey = 'birthdayPreviewBypass';

function hasPreviewBypass() {
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
  const [serverNowMs, setServerNowMs] = useState<number | null>(null);
  const [timeCheckFailed, setTimeCheckFailed] = useState(false);
  const [unlocked, setUnlocked] = useState(hasPreviewBypass);
  const handleUnlocked = useCallback(() => setUnlocked(true), []);

  useEffect(() => {
    if (unlocked) {
      return undefined;
    }

    let cancelled = false;

    const checkServerTime = async () => {
      const trustedNow = await getServerNow();
      if (cancelled) {
        return;
      }

      if (trustedNow === null) {
        setTimeCheckFailed(true);
        return;
      }

      setTimeCheckFailed(false);
      setServerNowMs(trustedNow);
      if (trustedNow >= unlockAt.getTime()) {
        setUnlocked(true);
      }
    };

    checkServerTime();
    const retry = window.setInterval(checkServerTime, 30000);

    return () => {
      cancelled = true;
      window.clearInterval(retry);
    };
  }, [unlocked]);

  if (!unlocked) {
    return (
      <GiftCountdownGate
        serverNowMs={serverNowMs}
        timeCheckFailed={timeCheckFailed}
        onUnlocked={handleUnlocked}
      />
    );
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
