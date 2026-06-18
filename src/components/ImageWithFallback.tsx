import { useState } from 'react';

type ImageWithFallbackProps = {
  src: string;
  alt: string;
  className?: string;
};

export default function ImageWithFallback({ src, alt, className = '' }: ImageWithFallbackProps) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        className={`flex items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.9),transparent_9rem),linear-gradient(135deg,#ffe8f0,#ded7ff_48%,#ffd6bd)] ${className}`}
        aria-label={alt}
      >
        <div className="grid h-24 w-24 place-items-center rounded-full border border-white/70 bg-white/35 text-3xl text-plum shadow-glow">
          ♥
        </div>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setFailed(true)}
      loading="lazy"
    />
  );
}
