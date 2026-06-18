import { useEffect, useMemo, useRef, useState } from 'react';
import { createAvatarImage, drawAvatar } from './avatar';

type GameProps = {
  onComplete: () => void;
  onLivesChange: (lives: number) => void;
};

export default function GiftFlightGame({ onComplete, onLivesChange }: GameProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const boost = useRef(false);
  const completed = useRef(false);
  const avatar = useMemo(createAvatarImage, []);
  const [gameOver, setGameOver] = useState(false);
  const [runId, setRunId] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !context) return undefined;

    let raf = 0;
    let width = 360;
    let height = 420;
    const livesRef = { current: 3 };
    const player = { x: 78, y: 210, vy: 0, r: 18 };
    let distance = 0;
    const gates = Array.from({ length: 58 }, (_, index) => {
      const calm = index % 9 === 0;
      return {
        x: 420 + index * 310 + (index % 4) * 18,
        gap: [150, 226, 178, 246, 190, 132, 218, 166][index % 8] + (calm ? 18 : 0),
        calm,
      };
    });
    const gift = { x: 19050, y: 210, r: 27 };
    onLivesChange(3);

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const ratio = window.devicePixelRatio || 1;
      width = rect.width;
      height = rect.height;
      canvas.width = Math.floor(width * ratio);
      canvas.height = Math.floor(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    };

    const reset = () => {
      livesRef.current -= 1;
      onLivesChange(livesRef.current);
      if (livesRef.current <= 0) {
        setGameOver(true);
        return;
      }
      player.y = height / 2;
      player.vy = 0;
      distance = Math.max(0, distance - 220);
    };

    const complete = () => {
      if (completed.current) return;
      completed.current = true;
      onComplete();
    };

    const drawGift = (x: number, y: number) => {
      context.fillStyle = '#ff8fb8';
      context.fillRect(x - 23, y - 15, 46, 34);
      context.fillStyle = '#ffe0c7';
      context.fillRect(x - 4, y - 15, 8, 34);
      context.fillRect(x - 23, y - 2, 46, 7);
      context.strokeStyle = '#ffe0c7';
      context.lineWidth = 4;
      context.beginPath();
      context.ellipse(x - 9, y - 20, 10, 7, -0.5, 0, Math.PI * 2);
      context.ellipse(x + 9, y - 20, 10, 7, 0.5, 0, Math.PI * 2);
      context.stroke();
    };

    const tick = () => {
      distance += 1.25;
      if (boost.current) player.vy -= 0.24;
      player.vy += 0.16;
      player.vy = Math.max(-4.1, Math.min(4.1, player.vy));
      player.y += player.vy;

      if ((player.y < player.r || player.y > height - player.r) && livesRef.current > 0) reset();

      context.clearRect(0, 0, width, height);
      const gradient = context.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, '#0a0d2e');
      gradient.addColorStop(1, '#331747');
      context.fillStyle = gradient;
      context.fillRect(0, 0, width, height);

      for (let i = 0; i < 34; i += 1) {
        context.fillStyle = 'rgba(255,255,255,0.2)';
        context.beginPath();
        context.arc(((i * 89 - distance * 0.25) % width + width) % width, (i * 47) % height, 1, 0, Math.PI * 2);
        context.fill();
      }

      gates.forEach((gate, index) => {
        const x = gate.x - distance + player.x;
        if (x < -50 || x > width + 50) return;
        const gapHeight = gate.calm ? 156 : index > 34 ? 118 : index > 15 ? 128 : 146;
        const topEnd = gate.gap - gapHeight / 2;
        const bottomStart = gate.gap + gapHeight / 2;

        context.strokeStyle = 'rgba(255,143,184,0.76)';
        context.lineWidth = 16;
        context.lineCap = 'round';
        context.beginPath();
        context.moveTo(x, 24);
        context.lineTo(x, topEnd);
        context.moveTo(x, bottomStart);
        context.lineTo(x, height - 24);
        context.stroke();

        context.fillStyle = '#ffe0c7';
        context.font = '22px serif';
        context.textAlign = 'center';
        context.fillText('♥', x, gate.gap - gapHeight / 2 - 15);
        context.fillText('♥', x, gate.gap + gapHeight / 2 + 30);

        const touchingX = Math.abs(x - player.x) < player.r + 10;
        const outsideGap = player.y - player.r < topEnd || player.y + player.r > bottomStart;
        if (touchingX && outsideGap && livesRef.current > 0) reset();
      });

      const giftX = gift.x - distance + player.x;
      drawGift(giftX, gift.y);
      if (Math.hypot(player.x - giftX, player.y - gift.y) < player.r + gift.r) complete();

      drawAvatar(context, avatar, player.x, player.y, player.r);
      if (!completed.current && livesRef.current > 0) raf = requestAnimationFrame(tick);
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === ' ' || event.key === 'ArrowUp') {
        event.preventDefault();
        boost.current = true;
      }
    };
    const onKeyUp = (event: KeyboardEvent) => {
      if (event.key === ' ' || event.key === 'ArrowUp') boost.current = false;
    };

    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [avatar, onComplete, onLivesChange, runId]);

  return (
    <div className="relative flex h-full flex-col">
      <canvas
        ref={canvasRef}
        className="min-h-0 flex-1 touch-none rounded-2xl border border-white/12 bg-midnight"
        onPointerDown={(event) => {
          event.preventDefault();
          boost.current = true;
        }}
        onPointerUp={() => (boost.current = false)}
        onPointerCancel={() => (boost.current = false)}
        onPointerLeave={() => (boost.current = false)}
      />
      {gameOver ? (
        <div className="absolute inset-x-4 bottom-8 rounded-3xl border border-roseglow/30 bg-ink/88 p-4 text-center shadow-glass backdrop-blur">
          <p className="font-display text-2xl text-champagne">Tekrar deneyelim</p>
          <button
            type="button"
            className="mt-4 min-h-12 rounded-full bg-gradient-to-r from-roseglow to-champagne px-6 font-bold text-[#321337]"
            onClick={() => {
              setGameOver(false);
              setRunId((value) => value + 1);
            }}
          >
            Tekrar Dene
          </button>
        </div>
      ) : null}
    </div>
  );
}
