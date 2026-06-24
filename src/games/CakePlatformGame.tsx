import { useEffect, useMemo, useRef, useState } from 'react';
import GameControls from './GameControls';
import { createAvatarSprite, drawAvatarSprite } from './avatarSprite';

type GameProps = {
  onComplete: () => void;
  onLivesChange: (lives: number) => void;
};

export default function CakePlatformGame({ onComplete, onLivesChange }: GameProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const keys = useRef({ left: false, right: false, jump: false });
  const completed = useRef(false);
  const avatar = useMemo(() => createAvatarSprite(), []);
  const [gameOver, setGameOver] = useState(false);
  const [runId, setRunId] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !context) return undefined;

    let raf = 0;
    let width = 360;
    let height = 420;
    const worldWidth = 28000;
    const livesRef = { current: 3 };
    const player = { x: 45, y: 260, vx: 0, vy: 0, r: 19, grounded: false };
    let checkpoint = { x: 45, y: 230 };
    let invulnerableUntil = 0;
    const platforms = [
      { x: 0, y: 330, w: 260, h: 18 },
      ...Array.from({ length: 116 }, (_, index) => {
        const section = Math.floor(index / 39);
        const x = 310 + index * 235 + (index % 5) * 18;
        const yPattern = [318, 292, 252, 304, 268, 326, 236, 286];
        return {
          x,
          y: yPattern[(index + section) % yPattern.length],
          w: Math.max(104, 184 - section * 12 - (index % 4) * 7),
          h: 18,
        };
      }),
    ];
    const obstacles = platforms
      .filter((_platform, index) => index > 5 && index % 3 === 0)
      .map((platform, index) => {
        const section = Math.floor(index / 13);
        const w = 22 + (index % 3) * 4;
        return {
          x: platform.x + Math.min(platform.w - w - 16, Math.max(18, platform.w * (0.52 + (index % 2) * 0.14))) - w / 2,
          y: platform.y,
          w,
          h: 22 + section * 2 + (index % 3) * 3,
        };
      });
    const cake = { x: worldWidth - 120, y: 190, r: 26 };
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

    const reset = () => {
      if (performance.now() < invulnerableUntil || livesRef.current <= 0) return;
      livesRef.current -= 1;
      onLivesChange(livesRef.current);
      if (livesRef.current <= 0) {
        setGameOver(true);
        return;
      }
      player.x = checkpoint.x;
      player.y = checkpoint.y;
      player.vx = 0;
      player.vy = 0;
      invulnerableUntil = performance.now() + 1000;
    };

    const drawCake = (x: number, y: number) => {
      context.fillStyle = '#ffe0c7';
      context.fillRect(x - 24, y - 5, 48, 30);
      context.fillStyle = '#ff8fb8';
      context.fillRect(x - 26, y - 12, 52, 12);
      context.fillStyle = '#fff4a8';
      context.fillRect(x - 3, y - 30, 6, 18);
      context.beginPath();
      context.fillStyle = '#ffd86f';
      context.arc(x, y - 34, 5, 0, Math.PI * 2);
      context.fill();
    };

    const drawPlatform = (x: number, y: number, w: number, h: number) => {
      const gradient = context.createLinearGradient(x, y, x, y + h);
      gradient.addColorStop(0, '#fff0d8');
      gradient.addColorStop(1, '#f3a7c6');
      context.fillStyle = gradient;
      context.shadowColor = 'rgba(255,143,184,0.28)';
      context.shadowBlur = 10;
      context.beginPath();
      context.roundRect(x, y, w, h, 8);
      context.fill();
      context.shadowBlur = 0;
      context.fillStyle = 'rgba(255,255,255,0.35)';
      context.fillRect(x + 8, y + 4, Math.max(0, w - 16), 2);
    };

    const drawCrystalHazard = (x: number, baseY: number, w: number, h: number) => {
      const cx = x + w / 2;
      const gradient = context.createLinearGradient(cx, baseY - h, cx, baseY);
      gradient.addColorStop(0, '#ffd6e5');
      gradient.addColorStop(0.45, '#ff4f91');
      gradient.addColorStop(1, '#6c245c');
      context.fillStyle = gradient;
      context.shadowColor = 'rgba(255,79,145,0.48)';
      context.shadowBlur = 12;
      context.beginPath();
      context.moveTo(cx, baseY - h);
      context.lineTo(x + w, baseY);
      context.lineTo(x, baseY);
      context.closePath();
      context.fill();
      context.beginPath();
      context.moveTo(x + w * 0.72, baseY - h * 0.72);
      context.lineTo(x + w * 1.2, baseY);
      context.lineTo(x + w * 0.48, baseY);
      context.closePath();
      context.fill();
      context.shadowBlur = 0;
      context.strokeStyle = 'rgba(255,255,255,0.45)';
      context.lineWidth = 1;
      context.beginPath();
      context.moveTo(cx, baseY - h + 5);
      context.lineTo(cx - w * 0.12, baseY - 6);
      context.stroke();
    };

    const tick = () => {
      if (keys.current.left) player.vx -= 0.45;
      if (keys.current.right) player.vx += 0.45;
      player.vx *= 0.86;
      player.vx = Math.max(-4.5, Math.min(4.5, player.vx));
      if (keys.current.jump && player.grounded) {
        player.vy = -9.7;
        player.grounded = false;
      }
      player.vy += 0.42;
      player.x += player.vx;
      player.y += player.vy;
      player.x = Math.max(player.r, Math.min(worldWidth - player.r, player.x));
      player.grounded = false;

      platforms.forEach((platform, platformIndex) => {
        if (
          player.vy >= 0 &&
          player.x + player.r > platform.x &&
          player.x - player.r < platform.x + platform.w &&
          player.y + player.r > platform.y &&
          player.y + player.r < platform.y + platform.h + 16
        ) {
          player.y = platform.y - player.r;
          player.vy = 0;
          player.grounded = true;
          const hasHazard = platformIndex > 5 && platformIndex % 3 === 0;
          if (!hasHazard && player.x > checkpoint.x + 170) {
            checkpoint = { x: platform.x + Math.min(32, platform.w / 3), y: platform.y - player.r - 2 };
          }
        }
      });

      obstacles.forEach((obstacle) => {
        const collisionInset = Math.max(3, obstacle.w * 0.18);
        if (
          performance.now() >= invulnerableUntil &&
          player.x + player.r > obstacle.x + collisionInset &&
          player.x - player.r < obstacle.x + obstacle.w - collisionInset &&
          player.y + player.r > obstacle.y - obstacle.h + 4 &&
          player.y - player.r < obstacle.y
        ) {
          reset();
        }
      });

      if (player.y > 470 && livesRef.current > 0) reset();
      if (Math.hypot(player.x - cake.x, player.y - cake.y) < player.r + cake.r) complete();

      const cameraX = Math.max(0, Math.min(worldWidth - width, player.x - width * 0.35));
      context.clearRect(0, 0, width, height);
      const gradient = context.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, '#120e35');
      gradient.addColorStop(1, '#35184b');
      context.fillStyle = gradient;
      context.fillRect(0, 0, width, height);

      context.fillStyle = 'rgba(255,143,184,0.11)';
      context.beginPath();
      context.ellipse(width * 0.65, height * 0.22, 140, 58, -0.2, 0, Math.PI * 2);
      context.fill();

      platforms.forEach((platform) => {
        const screenX = platform.x - cameraX;
        if (screenX + platform.w < -20 || screenX > width + 20) return;
        drawPlatform(screenX, platform.y, platform.w, platform.h);
      });

      obstacles.forEach((obstacle) => {
        const screenX = obstacle.x - cameraX;
        if (screenX + obstacle.w < -20 || screenX > width + 20) return;
        drawCrystalHazard(screenX, obstacle.y, obstacle.w, obstacle.h);
      });

      drawCake(cake.x - cameraX, cake.y);
      if (performance.now() >= invulnerableUntil || Math.floor(performance.now() / 100) % 2 === 0) {
        drawAvatarSprite(context, avatar, player.x - cameraX, player.y, player.r);
      }

      if (!completed.current && livesRef.current > 0) raf = requestAnimationFrame(tick);
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft' || event.key.toLowerCase() === 'a') keys.current.left = true;
      if (event.key === 'ArrowRight' || event.key.toLowerCase() === 'd') keys.current.right = true;
      if (event.key === ' ' || event.key === 'ArrowUp' || event.key.toLowerCase() === 'w') {
        event.preventDefault();
        keys.current.jump = true;
      }
    };
    const onKeyUp = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft' || event.key.toLowerCase() === 'a') keys.current.left = false;
      if (event.key === 'ArrowRight' || event.key.toLowerCase() === 'd') keys.current.right = false;
      if (event.key === ' ' || event.key === 'ArrowUp' || event.key.toLowerCase() === 'w') keys.current.jump = false;
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
    <div className="game-interaction relative flex h-full flex-col" onContextMenu={(event) => event.preventDefault()}>
      <canvas
        ref={canvasRef}
        className="min-h-0 flex-1 touch-none rounded-2xl border border-white/12 bg-midnight"
      />
      <GameControls
        directions={['left', 'jump', 'right']}
        onChange={(direction, pressed) => {
          keys.current[direction] = pressed;
        }}
      />
      {gameOver ? (
        <div className="absolute inset-x-4 bottom-24 rounded-3xl border border-roseglow/30 bg-ink/88 p-4 text-center shadow-glass backdrop-blur sm:bottom-8">
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
