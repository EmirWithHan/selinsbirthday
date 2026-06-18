type FloatingHeartsProps = {
  hidden: boolean;
};

const hearts = Array.from({ length: 20 }, (_, index) => ({
  id: index,
  left: `${(index * 37) % 100}%`,
  delay: `${(index * 0.9) % 9}s`,
  duration: `${9 + (index % 7)}s`,
  size: `${10 + (index % 4) * 3}px`,
  opacity: 0.24 + (index % 5) * 0.06,
}));

export default function FloatingHearts({ hidden }: FloatingHeartsProps) {
  if (hidden) {
    return null;
  }

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-20 overflow-hidden"
    >
      {hearts.map((heart) => (
        <span
          key={heart.id}
          className="absolute -top-8 block rotate-45 animate-[heartFall_var(--duration)_linear_infinite] rounded-[40%_40%_0_40%] bg-roseglow shadow-[0_0_18px_rgba(255,143,184,0.42)] before:absolute before:-left-1/2 before:top-0 before:h-full before:w-full before:rounded-full before:bg-roseglow after:absolute after:-top-1/2 after:left-0 after:h-full after:w-full after:rounded-full after:bg-roseglow"
          style={
            {
              left: heart.left,
              width: heart.size,
              height: heart.size,
              opacity: heart.opacity,
              animationDelay: heart.delay,
              '--duration': heart.duration,
            } as React.CSSProperties
          }
        />
      ))}
      <style>
        {`
          @keyframes heartFall {
            0% { transform: translate3d(0, -6vh, 0) rotate(45deg); opacity: 0; }
            12% { opacity: var(--heart-opacity, 0.36); }
            100% { transform: translate3d(26px, 108vh, 0) rotate(45deg); opacity: 0; }
          }
        `}
      </style>
    </div>
  );
}
