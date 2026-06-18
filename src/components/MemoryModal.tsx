import { useEffect } from 'react';
import type { Memory } from '../data/memories';
import ImageWithFallback from './ImageWithFallback';

type MemoryModalProps = {
  memory: Memory;
  onClose: () => void;
};

export default function MemoryModal({ memory, onClose }: MemoryModalProps) {
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-ink/78 p-4 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
    >
      <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-white/15 bg-[#fff5f8] p-4 text-plum shadow-glass">
        <ImageWithFallback
          src={memory.image}
          alt={memory.title}
          className="h-72 w-full rounded-2xl object-cover"
        />
        <div className="p-2 pt-5">
          <p className="text-center font-display text-3xl text-[#46183c]">{memory.title}</p>
          <button
            type="button"
            onClick={onClose}
            className="mt-7 min-h-12 w-full rounded-full bg-plum px-5 font-semibold text-white shadow-glow"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
}
