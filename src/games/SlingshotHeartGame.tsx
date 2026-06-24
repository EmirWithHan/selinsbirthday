import { useEffect, useMemo, useRef, useState } from 'react';
import { createAvatarSprite, drawAvatarSprite } from './avatarSprite';

type GameProps = {
  onComplete: () => void;
  onLivesChange: (lives: number) => void;
};

type Point = { x: number; y: number };
type SlingshotState = 'ready' | 'dragging' | 'flying' | 'hit' | 'missed' | 'resetting';

type InteractionApi = {
  pointerDown: (pointerId: number, clientX: number, clientY: number) => boolean;
  pointerMove: (pointerId: number, clientX: number, clientY: number) => boolean;
  pointerUp: (pointerId: number) => boolean;
  pointerCancel: (pointerId: number) => boolean;
};

const MAX_DRAG_DISTANCE = 112;
const MIN_DRAG_DISTANCE = 12;
const GRAB_RADIUS = 48;
const LAUNCH_POWER = 6.48;
const GRAVITY = 403.2;
const MAX_FRAME_TIME = 0.033;
const BOUNDS_PADDING = 100;
const STAGE_POWER_MULTIPLIERS = [1, 1, 1.04, 1.1, 1.2] as const;

function launchVelocity(dx: number, dy: number, stage: number) {
  const stageMultiplier = STAGE_POWER_MULTIPLIERS[Math.min(stage, STAGE_POWER_MULTIPLIERS.length - 1)];
  return {
    vx: dx * LAUNCH_POWER * stageMultiplier,
    vy: dy * LAUNCH_POWER * stageMultiplier,
  };
}

const idleInteraction: InteractionApi = {
  pointerDown: () => false,
  pointerMove: () => false,
  pointerUp: () => false,
  pointerCancel: () => false,
};

export default function SlingshotHeartGame({ onComplete, onLivesChange }: GameProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const interaction = useRef<InteractionApi>(idleInteraction);
  const girlfriend = useMemo(() => createAvatarSprite(), []);
  const boyfriend = useMemo(
    () => createAvatarSprite(
      [
        'avatar/bf.png',
        'avatar/bf.jpg',
        'avatar/bf.jpeg',
        'avatar/bf.webp',
        'avatar/bf-pixel.png',
        'avatar/bf-pixel.jpg',
      ],
      'Kalp Atışı için boyfriend avatarı yüklenemedi.',
    ),
    [],
  );
  const [gameOver, setGameOver] = useState(false);
  const [runId, setRunId] = useState(0);
  const [hits, setHits] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !context) return undefined;

    let raf = 0;
    let previousTime = 0;
    let finishedAt = 0;
    const particles: Array<Point & { vx: number; vy: number; life: number }> = [];
    const model = {
      state: 'ready' as SlingshotState,
      activePointerId: null as number | null,
      width: 360,
      height: 420,
      lives: 3,
      successfulHits: 0,
      transitionAt: 0,
      launchAge: 0,
      projectile: { x: 68, y: 290, vx: 0, vy: 0, radius: 19 },
    };

    onLivesChange(3);
    setHits(0);

    const slingOrigin = () => ({
      x: Math.max(62, model.width * 0.19),
      y: model.height * 0.7,
    });

    const targetForStage = (stage: number, time: number) => {
      const positions = [
        { x: 0.68, y: 0.61, radius: 34 },
        { x: 0.78, y: 0.48, radius: 31 },
        { x: 0.82, y: 0.31, radius: 29 },
        { x: 0.76, y: 0.48 + Math.sin(time * 0.0015) * 0.18, radius: 27 },
        { x: 0.84, y: 0.38, radius: 25 },
      ];
      const target = positions[Math.min(stage, positions.length - 1)];
      return {
        x: model.width * target.x,
        y: model.height * target.y,
        radius: target.radius,
      };
    };

    const placeAtSling = (nextState: SlingshotState = 'ready') => {
      model.state = 'resetting';
      const origin = slingOrigin();
      model.projectile.x = origin.x;
      model.projectile.y = origin.y;
      model.projectile.vx = 0;
      model.projectile.vy = 0;
      model.launchAge = 0;
      model.activePointerId = null;
      model.state = nextState;
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const ratio = window.devicePixelRatio || 1;
      model.width = rect.width;
      model.height = rect.height;
      canvas.width = Math.floor(rect.width * ratio);
      canvas.height = Math.floor(rect.height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      if (model.state === 'ready' || model.state === 'resetting') placeAtSling();
    };

    const canvasPoint = (clientX: number, clientY: number) => {
      const rect = canvas.getBoundingClientRect();
      const backingX = (clientX - rect.left) * (canvas.width / rect.width);
      const backingY = (clientY - rect.top) * (canvas.height / rect.height);
      const backingPerLogicalX = canvas.width / model.width;
      const backingPerLogicalY = canvas.height / model.height;
      return {
        x: backingX / backingPerLogicalX,
        y: backingY / backingPerLogicalY,
      };
    };

    const clampDragPoint = (point: Point) => {
      const origin = slingOrigin();
      let dx = Math.min(8, point.x - origin.x);
      let dy = point.y - origin.y;
      const distance = Math.hypot(dx, dy);
      if (distance > MAX_DRAG_DISTANCE) {
        const ratio = MAX_DRAG_DISTANCE / distance;
        dx *= ratio;
        dy *= ratio;
      }
      return { x: origin.x + dx, y: origin.y + dy };
    };

    interaction.current = {
      pointerDown: (pointerId, clientX, clientY) => {
        canvas.dataset.slingshotPointer = `${clientX},${clientY}`;
        if (model.state !== 'ready' || model.lives <= 0) return false;
        const point = canvasPoint(clientX, clientY);
        const distance = Math.hypot(point.x - model.projectile.x, point.y - model.projectile.y);
        if (distance > Math.max(model.projectile.radius * 1.8, GRAB_RADIUS)) return false;
        model.activePointerId = pointerId;
        model.state = 'dragging';
        canvas.dataset.slingshotState = model.state;
        model.projectile.x = point.x;
        model.projectile.y = point.y;
        return true;
      },
      pointerMove: (pointerId, clientX, clientY) => {
        if (model.state !== 'dragging' || model.activePointerId !== pointerId) return false;
        const point = clampDragPoint(canvasPoint(clientX, clientY));
        model.projectile.x = point.x;
        model.projectile.y = point.y;
        canvas.dataset.slingshotDrag = `${point.x},${point.y}`;
        return true;
      },
      pointerUp: (pointerId) => {
        if (model.state !== 'dragging' || model.activePointerId !== pointerId) return false;
        model.activePointerId = null;
        const origin = slingOrigin();
        const dragX = origin.x - model.projectile.x;
        const dragY = origin.y - model.projectile.y;
        if (Math.hypot(dragX, dragY) < MIN_DRAG_DISTANCE) {
          placeAtSling();
          return true;
        }
        const velocity = launchVelocity(dragX, dragY, model.successfulHits);
        model.projectile.vx = velocity.vx;
        model.projectile.vy = velocity.vy;
        model.launchAge = 0;
        model.state = 'flying';
        canvas.dataset.slingshotState = model.state;
        canvas.dataset.slingshotVelocity = `${velocity.vx},${velocity.vy}`;
        return true;
      },
      pointerCancel: (pointerId) => {
        if (model.state !== 'dragging' || model.activePointerId !== pointerId) return false;
        placeAtSling();
        canvas.dataset.slingshotState = model.state;
        return true;
      },
    };

    const markMissed = (time: number) => {
      if (model.state !== 'flying') return;
      model.state = 'missed';
      canvas.dataset.slingshotState = model.state;
      model.projectile.vx = 0;
      model.projectile.vy = 0;
      model.lives -= 1;
      onLivesChange(model.lives);
      if (model.lives <= 0) {
        setGameOver(true);
        return;
      }
      model.transitionAt = time + 650;
    };

    const burst = (x: number, y: number, count = 18) => {
      for (let index = 0; index < count; index += 1) {
        const angle = (index / count) * Math.PI * 2;
        particles.push({
          x,
          y,
          vx: Math.cos(angle) * (72 + (index % 4) * 27),
          vy: Math.sin(angle) * 132 - 48,
          life: 1,
        });
      }
    };

    const drawHeart = (x: number, y: number, size: number, alpha = 1) => {
      context.save();
      context.globalAlpha = alpha;
      context.fillStyle = '#ff79ad';
      context.translate(x, y);
      context.rotate(Math.PI / 4);
      context.fillRect(-size / 2, -size / 2, size, size);
      context.beginPath();
      context.arc(0, -size / 2, size / 2, 0, Math.PI * 2);
      context.arc(-size / 2, 0, size / 2, 0, Math.PI * 2);
      context.fill();
      context.restore();
    };

    const drawTrajectory = () => {
      const origin = slingOrigin();
      const dragX = origin.x - model.projectile.x;
      const dragY = origin.y - model.projectile.y;
      const velocity = launchVelocity(dragX, dragY, model.successfulHits);
      let px = model.projectile.x;
      let py = model.projectile.y;
      let vy = velocity.vy;
      const previewDt = 1 / 60;
      for (let dot = 1; dot <= 14; dot += 1) {
        for (let frame = 0; frame < 4; frame += 1) {
          vy += GRAVITY * previewDt;
          px += velocity.vx * previewDt;
          py += vy * previewDt;
        }
        context.fillStyle = `rgba(255,224,199,${0.72 - dot * 0.045})`;
        context.beginPath();
        context.arc(px, py, Math.max(1.5, 4 - dot * 0.18), 0, Math.PI * 2);
        context.fill();
      }
    };

    const drawScene = (time: number) => {
      const gradient = context.createLinearGradient(0, 0, 0, model.height);
      gradient.addColorStop(0, '#0a0c2b');
      gradient.addColorStop(1, '#3a174e');
      context.fillStyle = gradient;
      context.fillRect(0, 0, model.width, model.height);
      for (let index = 0; index < 30; index += 1) {
        context.fillStyle = `rgba(255,255,255,${0.18 + (index % 3) * 0.12})`;
        context.beginPath();
        context.arc((index * 83) % model.width, (index * 47) % Math.max(80, model.height - 50), 1.1, 0, Math.PI * 2);
        context.fill();
      }

      context.fillStyle = 'rgba(255,143,184,0.14)';
      context.fillRect(0, model.height - 24, model.width, 24);
      const origin = slingOrigin();
      context.strokeStyle = '#d79ac0';
      context.lineWidth = 7;
      context.lineCap = 'round';
      context.beginPath();
      context.moveTo(origin.x - 15, origin.y + 48);
      context.lineTo(origin.x - 10, origin.y - 18);
      context.moveTo(origin.x + 15, origin.y + 48);
      context.lineTo(origin.x + 10, origin.y - 18);
      context.stroke();

      context.strokeStyle = '#7a315e';
      context.lineWidth = 3;
      const bandPoint = model.state === 'dragging' ? model.projectile : origin;
      context.beginPath();
      context.moveTo(origin.x - 10, origin.y - 15);
      context.lineTo(bandPoint.x, bandPoint.y);
      context.lineTo(origin.x + 10, origin.y - 15);
      context.stroke();

      if (model.successfulHits === 2) {
        const barrier = { x: model.width * 0.57, y: model.height * 0.48, width: 22, height: model.height * 0.52 - 24 };
        context.fillStyle = 'rgba(255,224,199,0.72)';
        context.fillRect(barrier.x, barrier.y, barrier.width, barrier.height);
        context.fillStyle = 'rgba(255,143,184,0.65)';
        context.fillRect(barrier.x - 4, barrier.y, barrier.width + 8, 8);
      }

      if (model.state === 'dragging') drawTrajectory();
      const target = targetForStage(model.successfulHits, time);
      context.save();
      context.shadowColor = 'rgba(255,143,184,0.8)';
      context.shadowBlur = 20;
      drawAvatarSprite(context, boyfriend, target.x, target.y, target.radius, 'BF');
      context.restore();
      drawAvatarSprite(context, girlfriend, model.projectile.x, model.projectile.y, model.projectile.radius);

      particles.forEach((particle) => drawHeart(particle.x, particle.y, 7, particle.life));
      context.fillStyle = 'rgba(255,255,255,0.82)';
      context.font = '700 13px sans-serif';
      context.textAlign = 'left';
      context.fillText(`${model.successfulHits} / 5`, 14, 24);

      if (finishedAt) {
        context.fillStyle = 'rgba(8,10,31,0.66)';
        context.fillRect(0, 0, model.width, model.height);
        context.fillStyle = '#ffe0c7';
        context.font = '700 22px serif';
        context.textAlign = 'center';
        context.fillText('Kalbini tam hedefe gönderdin.', model.width / 2, model.height / 2);
      }
    };

    const tick = (time: number) => {
      if (!previousTime) previousTime = time;
      const dt = Math.min((time - previousTime) / 1000, MAX_FRAME_TIME);
      previousTime = time;

      if ((model.state === 'hit' || model.state === 'missed') && model.lives > 0 && time >= model.transitionAt) {
        placeAtSling();
      }

      if (model.state === 'flying') {
        model.launchAge += dt;
        model.projectile.vy += GRAVITY * dt;
        model.projectile.x += model.projectile.vx * dt;
        model.projectile.y += model.projectile.vy * dt;

        const ground = model.height - model.projectile.radius - 24;
        if (model.projectile.y > ground) {
          model.projectile.y = ground;
          model.projectile.vy *= -0.28;
          model.projectile.vx *= 0.82;
        }

        const target = targetForStage(model.successfulHits, time);
        const hitDistance = Math.hypot(model.projectile.x - target.x, model.projectile.y - target.y);
        if (hitDistance <= model.projectile.radius + target.radius * 0.9) {
          model.state = 'hit';
          burst(target.x, target.y, model.successfulHits === 4 ? 34 : 18);
          model.successfulHits += 1;
          setHits(model.successfulHits);
          model.projectile.vx = 0;
          model.projectile.vy = 0;
          if (model.successfulHits >= 5) {
            finishedAt = time + 1200;
            onComplete();
          } else {
            model.transitionAt = time + 520;
          }
        } else if (model.successfulHits === 2) {
          const barrierX = model.width * 0.57;
          const barrierY = model.height * 0.48;
          const touchesBarrier =
            model.projectile.x + model.projectile.radius > barrierX &&
            model.projectile.x - model.projectile.radius < barrierX + 22 &&
            model.projectile.y + model.projectile.radius > barrierY;
          if (touchesBarrier) markMissed(time);
        }

        if (model.state === 'flying' && model.launchAge > 0.22) {
          const outsideBounds =
            model.projectile.x > model.width + BOUNDS_PADDING ||
            model.projectile.x < -BOUNDS_PADDING ||
            model.projectile.y > model.height + BOUNDS_PADDING ||
            model.projectile.y < -BOUNDS_PADDING;
          const resting = model.launchAge > 1.3 && Math.hypot(model.projectile.vx, model.projectile.vy) < 28;
          if (outsideBounds || resting) markMissed(time);
        }
      }

      particles.forEach((particle) => {
        particle.x += particle.vx * dt;
        particle.y += particle.vy * dt;
        particle.vy += 144 * dt;
        particle.life -= dt;
      });
      for (let index = particles.length - 1; index >= 0; index -= 1) {
        if (particles[index].life <= 0) particles.splice(index, 1);
      }

      drawScene(time);
      if ((model.lives > 0 && !finishedAt) || (finishedAt && time < finishedAt)) raf = requestAnimationFrame(tick);
    };

    resize();
    placeAtSling();
    window.addEventListener('resize', resize);
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      interaction.current = idleInteraction;
      window.removeEventListener('resize', resize);
    };
  }, [boyfriend, girlfriend, onComplete, onLivesChange, runId]);

  const safelyReleasePointer = (element: HTMLCanvasElement, pointerId: number) => {
    if (element.hasPointerCapture(pointerId)) element.releasePointerCapture(pointerId);
  };

  return (
    <div
      className="game-interaction relative flex h-full select-none flex-col [overscroll-behavior:contain] [-webkit-touch-callout:none]"
      onContextMenu={(event) => event.preventDefault()}
    >
      <canvas
        ref={canvasRef}
        className="min-h-0 flex-1 touch-none select-none rounded-2xl border border-white/12 bg-midnight [overscroll-behavior:contain] [-webkit-touch-callout:none]"
        aria-label={`Kalp Atışı, ${hits}/5 hedef`}
        onPointerDown={(event) => {
          event.preventDefault();
          if (gameOver) return;
          const started = interaction.current.pointerDown(event.pointerId, event.clientX, event.clientY);
          if (started) event.currentTarget.setPointerCapture(event.pointerId);
        }}
        onPointerMove={(event) => {
          const handled = interaction.current.pointerMove(event.pointerId, event.clientX, event.clientY);
          if (handled) event.preventDefault();
        }}
        onPointerUp={(event) => {
          const handled = interaction.current.pointerUp(event.pointerId);
          if (!handled) return;
          event.preventDefault();
          safelyReleasePointer(event.currentTarget, event.pointerId);
        }}
        onPointerCancel={(event) => {
          const handled = interaction.current.pointerCancel(event.pointerId);
          if (handled) event.preventDefault();
          safelyReleasePointer(event.currentTarget, event.pointerId);
        }}
        onLostPointerCapture={(event) => {
          interaction.current.pointerCancel(event.pointerId);
        }}
      />
      {gameOver ? (
        <div className="absolute inset-x-4 bottom-8 rounded-3xl border border-roseglow/30 bg-ink/90 p-4 text-center shadow-glass backdrop-blur">
          <p className="font-display text-2xl text-champagne">Kalpler yeniden hazır</p>
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
