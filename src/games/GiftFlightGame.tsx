import { useEffect, useMemo, useRef, useState } from 'react';
import { createAvatarSprite, drawAvatarSprite } from './avatarSprite';

type GameProps = {
  onComplete: () => void;
  onLivesChange: (lives: number) => void;
};

const GRAVITY = 980;
const FLAP_VELOCITY = -355;
const MAX_FALL_SPEED = 560;
const OBSTACLE_SPEED = 102;
const OBSTACLE_PAIRS = 12;
const INITIAL_GAP_RATIO = 0.46;
const FINAL_GAP_RATIO = 0.34;
const RESPAWN_INVULNERABILITY_MS = 1000;
const IMPACT_PAUSE_MS = 260;

const gapCenterPattern = [0.5, 0.42, 0.58, 0.47, 0.61, 0.4, 0.54, 0.44, 0.6, 0.48, 0.56, 0.43];

type FlapParticle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
};

export default function GiftFlightGame({ onComplete, onLivesChange }: GameProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const flapRequested = useRef(false);
  const activePointer = useRef<number | null>(null);
  const keyboardHeld = useRef(false);
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
    let height = 620;
    let previousTime = 0;
    let distance = 0;
    let lives = 3;
    let invulnerableUntil = 0;
    let impactUntil = 0;
    let impactFlash = 0;
    const player = { x: 78, y: 310, vy: 0, radius: 20 };
    const particles: FlapParticle[] = [];
    completed.current = false;
    flapRequested.current = false;
    activePointer.current = null;
    keyboardHeld.current = false;
    onLivesChange(3);

    const obstacleSpacing = () => Math.max(620, width * 1.8);
    const firstObstacleX = () => width + 240;
    const obstacleWorldX = (index: number) => firstObstacleX() + index * obstacleSpacing();
    const giftWorldX = () => obstacleWorldX(OBSTACLE_PAIRS - 1) + 500;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const ratio = window.devicePixelRatio || 1;
      width = rect.width;
      height = rect.height;
      canvas.width = Math.floor(width * ratio);
      canvas.height = Math.floor(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      player.x = Math.max(72, width * 0.22);
      if (!previousTime) player.y = height / 2;
    };

    const gapFor = (index: number) => {
      const progress = index / (OBSTACLE_PAIRS - 1);
      const ratio = INITIAL_GAP_RATIO + (FINAL_GAP_RATIO - INITIAL_GAP_RATIO) * progress;
      const gapHeight = height * ratio;
      const safeMargin = Math.max(70, height * 0.13);
      const minimumCenter = safeMargin + gapHeight / 2;
      const maximumCenter = height - safeMargin - gapHeight / 2;
      const desiredCenter = height * gapCenterPattern[index];
      return {
        center: Math.max(minimumCenter, Math.min(maximumCenter, desiredCenter)),
        height: gapHeight,
      };
    };

    const complete = () => {
      if (completed.current) return;
      completed.current = true;
      onComplete();
    };

    const loseLife = (time: number) => {
      if (time < invulnerableUntil || time < impactUntil || lives <= 0) return;
      lives -= 1;
      onLivesChange(lives);
      impactFlash = 1;
      flapRequested.current = false;
      player.y = height / 2;
      player.vy = 0;
      distance = Math.max(0, distance - 150);
      if (lives <= 0) {
        setGameOver(true);
        return;
      }
      impactUntil = time + IMPACT_PAUSE_MS;
      invulnerableUntil = time + RESPAWN_INVULNERABILITY_MS;
    };

    const flap = () => {
      player.vy = FLAP_VELOCITY;
      for (let index = 0; index < 5; index += 1) {
        particles.push({
          x: player.x - player.radius * 0.7,
          y: player.y + (index - 2) * 3,
          vx: -34 - index * 7,
          vy: 18 + (index - 2) * 10,
          life: 0.42,
        });
      }
    };

    const drawGift = (x: number, y: number) => {
      context.save();
      context.shadowColor = 'rgba(255,143,184,0.65)';
      context.shadowBlur = 20;
      context.fillStyle = '#ff8fb8';
      context.fillRect(x - 25, y - 16, 50, 36);
      context.fillStyle = '#ffe0c7';
      context.fillRect(x - 4, y - 16, 8, 36);
      context.fillRect(x - 25, y - 3, 50, 7);
      context.strokeStyle = '#ffe0c7';
      context.lineWidth = 4;
      context.beginPath();
      context.ellipse(x - 9, y - 21, 10, 7, -0.5, 0, Math.PI * 2);
      context.ellipse(x + 9, y - 21, 10, 7, 0.5, 0, Math.PI * 2);
      context.stroke();
      context.restore();
    };

    const drawObstacle = (x: number, topEnd: number, bottomStart: number) => {
      const obstacleWidth = 28;
      const gradient = context.createLinearGradient(x - obstacleWidth / 2, 0, x + obstacleWidth / 2, 0);
      gradient.addColorStop(0, '#7b315f');
      gradient.addColorStop(0.5, '#ff74a9');
      gradient.addColorStop(1, '#7b315f');
      context.save();
      context.fillStyle = gradient;
      context.shadowColor = 'rgba(255,79,145,0.35)';
      context.shadowBlur = 10;
      context.beginPath();
      context.roundRect(x - obstacleWidth / 2, 0, obstacleWidth, topEnd, [0, 0, 12, 12]);
      context.roundRect(x - obstacleWidth / 2, bottomStart, obstacleWidth, height - bottomStart, [12, 12, 0, 0]);
      context.fill();
      context.shadowBlur = 0;
      context.fillStyle = '#ffe0c7';
      context.font = '22px serif';
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.fillText('♥', x, Math.max(14, topEnd - 18));
      context.fillText('♥', x, Math.min(height - 14, bottomStart + 18));
      context.restore();
    };

    const draw = (time: number) => {
      context.clearRect(0, 0, width, height);
      const gradient = context.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, '#090c2d');
      gradient.addColorStop(1, '#351747');
      context.fillStyle = gradient;
      context.fillRect(0, 0, width, height);

      for (let index = 0; index < 36; index += 1) {
        const starX = ((index * 89 - distance * 0.18) % width + width) % width;
        context.fillStyle = `rgba(255,255,255,${0.16 + (index % 3) * 0.09})`;
        context.beginPath();
        context.arc(starX, (index * 61) % height, 1 + (index % 2) * 0.35, 0, Math.PI * 2);
        context.fill();
      }

      let passed = 0;
      for (let index = 0; index < OBSTACLE_PAIRS; index += 1) {
        const x = obstacleWorldX(index) - distance;
        if (x < player.x) passed = index + 1;
        if (x < -40 || x > width + 40) continue;
        const gap = gapFor(index);
        drawObstacle(x, gap.center - gap.height / 2, gap.center + gap.height / 2);
      }

      const giftX = giftWorldX() - distance;
      if (giftX < width + 70) drawGift(giftX, height / 2);

      particles.forEach((particle) => {
        context.fillStyle = `rgba(255,167,198,${Math.max(0, particle.life / 0.42)})`;
        context.beginPath();
        context.arc(particle.x, particle.y, 2.4, 0, Math.PI * 2);
        context.fill();
      });

      context.save();
      context.translate(player.x, player.y);
      context.rotate(Math.max(-0.24, Math.min(0.32, player.vy / MAX_FALL_SPEED * 0.42)));
      if (time < invulnerableUntil && Math.floor(time / 90) % 2 === 0) context.globalAlpha = 0.48;
      drawAvatarSprite(context, avatar, 0, 0, player.radius);
      context.restore();

      context.fillStyle = 'rgba(255,255,255,0.78)';
      context.font = '700 12px sans-serif';
      context.textAlign = 'left';
      context.textBaseline = 'alphabetic';
      context.fillText(`${Math.min(passed, OBSTACLE_PAIRS)} / ${OBSTACLE_PAIRS}`, 14, 24);

      if (impactFlash > 0) {
        context.fillStyle = `rgba(255,92,139,${impactFlash * 0.2})`;
        context.fillRect(0, 0, width, height);
      }
    };

    const tick = (time: number) => {
      if (!previousTime) previousTime = time;
      const dt = Math.min((time - previousTime) / 1000, 0.033);
      previousTime = time;

      if (time >= impactUntil && lives > 0) {
        if (flapRequested.current) {
          flapRequested.current = false;
          flap();
        }
        player.vy = Math.min(MAX_FALL_SPEED, player.vy + GRAVITY * dt);
        player.y += player.vy * dt;
        distance += OBSTACLE_SPEED * dt;

        const hitboxHalfWidth = player.radius * 0.78;
        const hitboxHalfHeight = player.radius * 0.82;
        if (player.y - hitboxHalfHeight <= 0 || player.y + hitboxHalfHeight >= height) {
          loseLife(time);
        }

        for (let index = 0; index < OBSTACLE_PAIRS; index += 1) {
          const x = obstacleWorldX(index) - distance;
          if (x < player.x - 50 || x > player.x + 50) continue;
          const gap = gapFor(index);
          const topEnd = gap.center - gap.height / 2;
          const bottomStart = gap.center + gap.height / 2;
          const collisionHalfWidth = 10;
          const touchingX = player.x + hitboxHalfWidth > x - collisionHalfWidth && player.x - hitboxHalfWidth < x + collisionHalfWidth;
          const outsideGap = player.y - hitboxHalfHeight < topEnd || player.y + hitboxHalfHeight > bottomStart;
          if (touchingX && outsideGap) {
            loseLife(time);
            break;
          }
        }

        const giftX = giftWorldX() - distance;
        if (Math.hypot(player.x - giftX, player.y - height / 2) < player.radius + 25) complete();
      }

      particles.forEach((particle) => {
        particle.x += particle.vx * dt;
        particle.y += particle.vy * dt;
        particle.life -= dt;
      });
      for (let index = particles.length - 1; index >= 0; index -= 1) {
        if (particles[index].life <= 0) particles.splice(index, 1);
      }
      impactFlash = Math.max(0, impactFlash - dt * 4.5);
      draw(time);
      if (!completed.current && lives > 0) raf = requestAnimationFrame(tick);
    };

    const requestKeyboardFlap = (event: KeyboardEvent) => {
      if (event.key !== ' ' && event.key !== 'ArrowUp') return;
      event.preventDefault();
      if (event.repeat || keyboardHeld.current) return;
      keyboardHeld.current = true;
      flapRequested.current = true;
    };
    const releaseKeyboardFlap = (event: KeyboardEvent) => {
      if (event.key === ' ' || event.key === 'ArrowUp') keyboardHeld.current = false;
    };
    const releaseAllInput = () => {
      keyboardHeld.current = false;
      activePointer.current = null;
    };

    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('keydown', requestKeyboardFlap);
    window.addEventListener('keyup', releaseKeyboardFlap);
    window.addEventListener('blur', releaseAllInput);
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      flapRequested.current = false;
      activePointer.current = null;
      keyboardHeld.current = false;
      window.removeEventListener('resize', resize);
      window.removeEventListener('keydown', requestKeyboardFlap);
      window.removeEventListener('keyup', releaseKeyboardFlap);
      window.removeEventListener('blur', releaseAllInput);
    };
  }, [avatar, onComplete, onLivesChange, runId]);

  const releasePointer = (pointerId: number) => {
    if (activePointer.current === pointerId) activePointer.current = null;
  };

  return (
    <div className="game-interaction relative flex h-full flex-col" onContextMenu={(event) => event.preventDefault()}>
      <canvas
        ref={canvasRef}
        className="min-h-0 flex-1 touch-none rounded-2xl border border-white/12 bg-midnight"
        aria-label="Hediye Uçuşu oyun alanı"
        onPointerDown={(event) => {
          event.preventDefault();
          if (activePointer.current !== null || gameOver) return;
          activePointer.current = event.pointerId;
          event.currentTarget.setPointerCapture(event.pointerId);
          flapRequested.current = true;
        }}
        onPointerUp={(event) => releasePointer(event.pointerId)}
        onPointerCancel={(event) => releasePointer(event.pointerId)}
        onLostPointerCapture={(event) => releasePointer(event.pointerId)}
      />
      {gameOver ? (
        <div className="absolute inset-x-4 bottom-8 rounded-3xl border border-roseglow/30 bg-ink/88 p-4 text-center shadow-glass backdrop-blur">
          <p className="font-display text-2xl text-champagne">Tekrar deneyelim</p>
          <button
            type="button"
            className="mt-4 min-h-14 rounded-full bg-gradient-to-r from-roseglow to-champagne px-7 font-bold text-[#321337]"
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
