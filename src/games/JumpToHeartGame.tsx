import { useEffect, useMemo, useRef, useState } from 'react';
import { createAvatarImage, drawAvatar } from './avatar';

type GameProps = {
  onComplete: () => void;
  onLivesChange: (lives: number) => void;
};

export default function JumpToHeartGame({ onComplete, onLivesChange }: GameProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const keys = useRef({ left: false, right: false });
  const completed = useRef(false);
  const avatar = useMemo(createAvatarImage, []);
  const [gameOver, setGameOver] = useState(false);
  const [runId, setRunId] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !context) return undefined;

    let raf = 0;
    let frame = 0;
    let width = 360;
    let height = 460;
    const worldHeight = 9100;
    const livesRef = { current: 3 };
    const player = { x: 70, y: worldHeight - 90, vx: 0, vy: -10.9, r: 20 };
    const platforms = Array.from({ length: 104 }, (_, index) => ({
      x: [34, 202, 78, 158, 28, 224, 112, 188, 54][index % 9],
      y: worldHeight - 42 - index * 86,
      w: Math.max(46, 164 - index * 1.2 - Math.floor(index / 18) * 8),
      h: 13,
      drift: index > 16 && index % 6 === 0 ? 16 + Math.min(30, index * 0.18) : 0,
      phase: index * 0.7,
    }));
    const heart = { x: 180, y: 92, r: 28 };
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

    const complete = () => {
      if (completed.current) return;
      completed.current = true;
      onComplete();
    };

    const respawn = () => {
      livesRef.current -= 1;
      onLivesChange(livesRef.current);
      if (livesRef.current <= 0) {
        setGameOver(true);
        return;
      }
      player.x = width * 0.25;
      player.y = worldHeight - 120;
      player.vx = 0;
      player.vy = -10.8;
    };

    const drawHeart = (x: number, y: number, size: number) => {
      context.save();
      context.translate(x, y);
      context.rotate(Math.PI / 4);
      context.fillStyle = '#ff8fb8';
      context.shadowColor = 'rgba(255,143,184,0.75)';
      context.shadowBlur = 18;
      context.fillRect(-size / 2, -size / 2, size, size);
      context.beginPath();
      context.arc(0, -size / 2, size / 2, 0, Math.PI * 2);
      context.arc(-size / 2, 0, size / 2, 0, Math.PI * 2);
      context.fill();
      context.restore();
    };

    const tick = () => {
      frame += 1;
      if (keys.current.left) player.vx -= 0.34;
      if (keys.current.right) player.vx += 0.34;
      player.vx *= 0.88;
      player.vx = Math.max(-3.35, Math.min(3.35, player.vx));
      player.vy += 0.34;
      player.x += player.vx;
      player.y += player.vy;

      if (player.x < -player.r) player.x = width + player.r;
      if (player.x > width + player.r) player.x = -player.r;

      platforms.forEach((platform) => {
        const drift = platform.drift ? Math.sin(frame * 0.026 + platform.phase) * platform.drift : 0;
        const px = ((platform.x + drift) / 360) * width;
        const pw = (platform.w / 360) * width;
        if (
          player.vy > 0 &&
          player.x + player.r > px &&
          player.x - player.r < px + pw &&
          player.y + player.r > platform.y &&
          player.y + player.r < platform.y + platform.h + 16
        ) {
          player.y = platform.y - player.r;
          player.vy = -11.8;
        }
      });

      if (player.y > worldHeight + 80) {
        respawn();
      }

      const cameraY = Math.min(worldHeight - height, Math.max(0, player.y - height * 0.58));
      const targetX = (heart.x / 360) * width;
      const dx = player.x - targetX;
      const dy = player.y - heart.y;
      if (Math.hypot(dx, dy) < heart.r + player.r) {
        complete();
      }

      context.clearRect(0, 0, width, height);
      const gradient = context.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, '#100b2c');
      gradient.addColorStop(1, '#29144b');
      context.fillStyle = gradient;
      context.fillRect(0, 0, width, height);

      for (let i = 0; i < 45; i += 1) {
        context.fillStyle = `rgba(255,255,255,${0.22 + (i % 4) * 0.08})`;
        context.beginPath();
        context.arc((i * 73) % width, ((i * 101 - cameraY * 0.35) % height + height) % height, 1.1, 0, Math.PI * 2);
        context.fill();
      }

      platforms.forEach((platform) => {
        const y = platform.y - cameraY;
        if (y < -30 || y > height + 30) return;
        const drift = platform.drift ? Math.sin(frame * 0.026 + platform.phase) * platform.drift : 0;
        const x = ((platform.x + drift) / 360) * width;
        const w = (platform.w / 360) * width;
        context.fillStyle = 'rgba(255,224,199,0.9)';
        context.shadowColor = 'rgba(255,143,184,0.45)';
        context.shadowBlur = 12;
        context.fillRect(x, y, w, platform.h);
        context.shadowBlur = 0;
      });

      drawHeart(targetX, heart.y - cameraY, 32);
      drawAvatar(context, avatar, player.x, player.y - cameraY, player.r);

      if (!completed.current && livesRef.current > 0) raf = requestAnimationFrame(tick);
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft' || event.key.toLowerCase() === 'a') keys.current.left = true;
      if (event.key === 'ArrowRight' || event.key.toLowerCase() === 'd') keys.current.right = true;
    };
    const onKeyUp = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft' || event.key.toLowerCase() === 'a') keys.current.left = false;
      if (event.key === 'ArrowRight' || event.key.toLowerCase() === 'd') keys.current.right = false;
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
          const rect = event.currentTarget.getBoundingClientRect();
          keys.current.left = event.clientX - rect.left < rect.width / 2;
          keys.current.right = !keys.current.left;
        }}
        onPointerUp={() => {
          keys.current.left = false;
          keys.current.right = false;
        }}
        onPointerCancel={() => {
          keys.current.left = false;
          keys.current.right = false;
        }}
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
