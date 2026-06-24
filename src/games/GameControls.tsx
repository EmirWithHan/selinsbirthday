type Direction = 'left' | 'right' | 'jump';

type GameControlsProps = {
  directions: Direction[];
  onChange: (direction: Direction, pressed: boolean) => void;
};

const icons: Record<Direction, string> = { left: '←', right: '→', jump: '↑' };

export default function GameControls({ directions, onChange }: GameControlsProps) {
  return (
    <div className={`game-interaction mt-3 grid gap-3 sm:hidden ${directions.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
      {directions.map((direction) => (
        <button
          key={direction}
          type="button"
          aria-label={direction === 'left' ? 'Sola git' : direction === 'right' ? 'Sağa git' : 'Zıpla'}
          className="grid min-h-16 place-items-center rounded-2xl border border-white/20 bg-white/12 text-3xl font-black text-champagne shadow-lg transition active:scale-95 active:bg-roseglow/30"
          onContextMenu={(event) => event.preventDefault()}
          onPointerDown={(event) => {
            event.preventDefault();
            event.currentTarget.setPointerCapture(event.pointerId);
            onChange(direction, true);
          }}
          onPointerUp={(event) => {
            event.preventDefault();
            onChange(direction, false);
          }}
          onPointerCancel={() => onChange(direction, false)}
          onPointerLeave={() => onChange(direction, false)}
          onLostPointerCapture={() => onChange(direction, false)}
        >
          {icons[direction]}
        </button>
      ))}
    </div>
  );
}
