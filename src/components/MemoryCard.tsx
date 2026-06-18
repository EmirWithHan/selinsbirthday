import type { Memory } from '../data/memories';
import ImageWithFallback from './ImageWithFallback';

type MemoryCardProps = {
  memory: Memory;
  onOpen: (memory: Memory) => void;
};

export default function MemoryCard({ memory, onOpen }: MemoryCardProps) {
  return (
    <button
      type="button"
      onClick={() => onOpen(memory)}
      className="paper-card group rotate-[-1deg] rounded-[0.35rem] p-3 text-left text-plum shadow-[0_24px_55px_rgba(0,0,0,0.26)] transition duration-300 hover:-translate-y-1 hover:rotate-0 focus:outline-none focus:ring-4 focus:ring-roseglow/40"
    >
      <ImageWithFallback
        src={memory.image}
        alt={memory.title}
        className="h-56 w-full rounded-[0.2rem] object-cover shadow-inner"
      />
      <div className="px-2 pb-3 pt-4 text-center">
        <p className="font-display text-2xl text-[#46183c]">{memory.title}</p>
      </div>
    </button>
  );
}
