import { useState } from 'react';
import { memories, type Memory } from '../data/memories';
import { siteContent } from '../data/siteContent';
import MemoryCard from './MemoryCard';
import MemoryModal from './MemoryModal';

export default function MemoryBook() {
  const [selected, setSelected] = useState<Memory | null>(null);

  return (
    <section id="memory-book" className="relative px-4 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 max-w-2xl">
          <p className="text-sm font-bold uppercase tracking-[0.28em] text-roseglow">
            Bizden Kalanlar
          </p>
          <h2 className="mt-3 font-display text-4xl text-champagne sm:text-5xl">
            {siteContent.memory.title}
          </h2>
          <p className="mt-4 text-base leading-7 text-white/72">{siteContent.memory.text}</p>
        </div>
        <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
          {memories.map((memory) => (
            <MemoryCard key={memory.id} memory={memory} onOpen={setSelected} />
          ))}
        </div>
      </div>
      {selected ? <MemoryModal memory={selected} onClose={() => setSelected(null)} /> : null}
    </section>
  );
}
