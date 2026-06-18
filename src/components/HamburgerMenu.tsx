import { useState } from 'react';
import { siteContent } from '../data/siteContent';
import { publicAsset } from '../utils/assets';

export default function HamburgerMenu() {
  const [open, setOpen] = useState(false);

  const handleClick = (href: string) => {
    setOpen(false);
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <header className="fixed left-0 right-0 top-0 z-40 px-4 pt-4">
      <nav className="mx-auto flex max-w-6xl items-center justify-between rounded-full border border-white/15 bg-ink/55 px-3 py-2 shadow-glass backdrop-blur-xl">
        <button
          type="button"
          className="flex min-h-12 items-center gap-2 rounded-full border border-white/10 bg-white/8 px-2.5 py-2 pr-4 text-left shadow-[0_0_22px_rgba(255,143,184,0.12)]"
          onClick={() => handleClick('#star-map')}
        >
          <img
            src={publicAsset('avatar/girlfriend-pixel.jpg')}
            alt=""
            className="h-8 w-8 rounded-full object-cover"
          />
          <span className="text-sm font-black text-champagne">Lvl 21</span>
        </button>
        <button
          type="button"
          aria-label="Menüyü aç/kapat"
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
          className="flex h-12 w-12 items-center justify-center rounded-full border border-white/15 bg-white/10"
        >
          <span className="relative h-4 w-5">
            <span
              className={`absolute left-0 top-0 h-0.5 w-5 rounded bg-white transition ${open ? 'translate-y-2 rotate-45' : ''}`}
            />
            <span
              className={`absolute left-0 top-2 h-0.5 w-5 rounded bg-white transition ${open ? 'opacity-0' : ''}`}
            />
            <span
              className={`absolute left-0 top-4 h-0.5 w-5 rounded bg-white transition ${open ? '-translate-y-2 -rotate-45' : ''}`}
            />
          </span>
        </button>
      </nav>
      <div
        className={`mx-auto mt-3 max-w-6xl overflow-hidden rounded-3xl border border-white/15 bg-midnight/85 shadow-glass backdrop-blur-xl transition-all duration-300 ${
          open ? 'max-h-72 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="grid gap-2 p-3">
          {siteContent.navigation.map((item) => (
            <button
              key={item.href}
              type="button"
              onClick={() => handleClick(item.href)}
              className="min-h-12 rounded-2xl px-4 text-left text-sm font-semibold text-white transition hover:bg-white/10 active:bg-white/15"
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}
