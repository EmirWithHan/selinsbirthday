import { useEffect, useMemo, useRef, useState } from 'react';
import { projectBirthSky, constellationLines, type ProjectedStar } from '../data/realSky';
import { siteContent } from '../data/siteContent';

export default function StarMapHero() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const offsetRef = useRef(168);
  const dragRef = useRef({ active: false, lastX: 0 });
  const [dragging, setDragging] = useState(false);
  const skyStars = useMemo(projectBirthSky, []);
  const skyDust = useMemo(
    () =>
      Array.from({ length: 150 }, (_, index) => {
        const seed = Math.sin(index * 781.43) * 10000;
        const fraction = Math.abs(seed - Math.floor(seed));
        return {
          az: (index * 47 + fraction * 140) % 360,
          alt: 5 + ((index * 37 + fraction * 80) % 78),
          size: 0.8 + (index % 4) * 0.28,
          opacity: 0.25 + (index % 5) * 0.08,
        };
      }),
    [],
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const context = canvas.getContext('2d');
    if (!context) return undefined;

    let frame = 0;
    let animation = 0;
    let stopped = false;
    let width = 0;
    let height = 0;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const ratio = window.devicePixelRatio || 1;
      width = rect.width;
      height = rect.height;
      canvas.width = Math.max(1, Math.floor(width * ratio));
      canvas.height = Math.max(1, Math.floor(height * ratio));
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    };

    const project = (star: ProjectedStar) => {
      const shiftedAz = ((star.az - offsetRef.current + 540) % 360) - 180;
      return {
        x: width / 2 + (shiftedAz / 132) * width,
        y: height * (0.86 - (star.alt + 8) / 112),
      };
    };

    const projectPoint = (az: number, alt: number) => {
      const shiftedAz = ((az - offsetRef.current + 540) % 360) - 180;
      return {
        x: width / 2 + (shiftedAz / 132) * width,
        y: height * (0.86 - (alt + 8) / 112),
      };
    };

    const drawStar = (star: ProjectedStar, pulse: number) => {
      const point = project(star);
      if (point.x < -36 || point.x > width + 36 || point.y < -30 || point.y > height + 30) {
        return;
      }

      const radius = Math.max(1.4, (3.8 - star.mag) * 0.86);
      context.beginPath();
      context.fillStyle = `rgba(255, 246, 222, ${Math.min(1, star.intensity + 0.2 + pulse)})`;
      context.shadowColor = 'rgba(255, 171, 209, 0.95)';
      context.shadowBlur = radius * 9;
      context.arc(point.x, point.y, radius, 0, Math.PI * 2);
      context.fill();
      context.shadowBlur = 0;
    };

    const render = () => {
      if (stopped) return;
      frame += 1;
      if (!dragRef.current.active) {
        offsetRef.current = (offsetRef.current + 0.022) % 360;
      }

      const gradient = context.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, '#030612');
      gradient.addColorStop(0.44, '#0c1240');
      gradient.addColorStop(1, '#28134a');
      context.fillStyle = gradient;
      context.fillRect(0, 0, width, height);

      context.fillStyle = 'rgba(255, 143, 184, 0.12)';
      context.beginPath();
      context.ellipse(width * 0.7, height * 0.24, width * 0.5, height * 0.2, -0.25, 0, Math.PI * 2);
      context.fill();

      context.strokeStyle = 'rgba(255, 224, 199, 0.44)';
      context.lineWidth = 1.35;
      context.shadowColor = 'rgba(255, 143, 184, 0.34)';
      context.shadowBlur = 9;
      for (const [from, to] of constellationLines) {
        const a = skyStars.find((star) => star.name === from);
        const b = skyStars.find((star) => star.name === to);
        if (!a || !b) continue;
        const pa = project(a);
        const pb = project(b);
        if (Math.abs(pa.x - pb.x) > width * 0.55) continue;
        context.beginPath();
        context.moveTo(pa.x, pa.y);
        context.lineTo(pb.x, pb.y);
        context.stroke();
      }
      context.shadowBlur = 0;

      skyDust.forEach((dust, index) => {
        const point = projectPoint(dust.az, dust.alt);
        if (point.x < -20 || point.x > width + 20 || point.y < -20 || point.y > height + 20) return;
        const pulse = Math.sin(frame * 0.018 + index) * 0.05;
        context.beginPath();
        context.fillStyle = `rgba(255,255,255,${dust.opacity + pulse})`;
        context.shadowColor = 'rgba(255,255,255,0.45)';
        context.shadowBlur = dust.size * 4;
        context.arc(point.x, point.y, dust.size, 0, Math.PI * 2);
        context.fill();
      });
      context.shadowBlur = 0;

      skyStars.forEach((star, index) => {
        const pulse = Math.sin(frame * 0.02 + index) * 0.08;
        drawStar(star, pulse);
      });

      const horizon = context.createLinearGradient(0, height * 0.68, 0, height);
      horizon.addColorStop(0, 'rgba(255, 224, 199, 0)');
      horizon.addColorStop(0.65, 'rgba(255, 143, 184, 0.18)');
      horizon.addColorStop(1, 'rgba(255, 224, 199, 0.08)');
      context.strokeStyle = horizon;
      context.lineWidth = 2;
      context.beginPath();
      context.ellipse(width / 2, height * 0.95, width * 0.72, height * 0.24, 0, Math.PI, Math.PI * 2);
      context.stroke();

      animation = requestAnimationFrame(render);
    };

    resize();
    window.addEventListener('resize', resize);
    animation = requestAnimationFrame(render);

    return () => {
      stopped = true;
      cancelAnimationFrame(animation);
      window.removeEventListener('resize', resize);
    };
  }, [skyStars]);

  const startDrag = (clientX: number) => {
    dragRef.current = { active: true, lastX: clientX };
    setDragging(true);
  };

  const moveDrag = (clientX: number) => {
    if (!dragRef.current.active) return;
    const delta = clientX - dragRef.current.lastX;
    dragRef.current.lastX = clientX;
    offsetRef.current = (offsetRef.current - delta * 0.18 + 360) % 360;
  };

  const endDrag = () => {
    dragRef.current.active = false;
    setDragging(false);
  };

  return (
    <section
      id="star-map"
      className="relative flex min-h-screen items-center overflow-hidden bg-[radial-gradient(circle_at_50%_20%,rgba(255,143,184,0.15),transparent_18rem),linear-gradient(180deg,#05071a,#111039_58%,#24133f)] px-4 pb-12 pt-24"
    >
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,rgba(255,224,199,0.05),transparent_36%,rgba(255,143,184,0.07))]" />
      <div className="relative z-10 mx-auto grid w-full max-w-6xl items-center gap-7 lg:grid-cols-[minmax(0,1.08fr)_minmax(20rem,0.92fr)]">
        <div className="relative mx-auto w-full max-w-[34rem] lg:order-2 lg:max-w-[38rem]">
          <div className="absolute inset-[-0.75rem] rounded-full bg-[conic-gradient(from_120deg,rgba(255,224,199,0.2),rgba(255,143,184,0.42),rgba(166,139,255,0.24),rgba(255,224,199,0.2))] blur-md" />
          <div className="relative aspect-square overflow-hidden rounded-full border border-champagne/40 bg-ink shadow-[0_0_0_10px_rgba(255,255,255,0.035),0_0_80px_rgba(255,143,184,0.34),inset_0_0_45px_rgba(255,255,255,0.08)]">
            <canvas
              ref={canvasRef}
              className={`absolute inset-0 h-full w-full touch-none ${dragging ? 'cursor-grabbing' : 'cursor-grab'}`}
              onPointerDown={(event) => {
                event.currentTarget.setPointerCapture(event.pointerId);
                startDrag(event.clientX);
              }}
              onPointerMove={(event) => moveDrag(event.clientX)}
              onPointerUp={endDrag}
              onPointerCancel={endDrag}
            />
            <div className="pointer-events-none absolute inset-0 rounded-full bg-[radial-gradient(circle_at_38%_28%,rgba(255,255,255,0.16),transparent_18%),radial-gradient(circle,transparent_54%,rgba(3,6,18,0.32)_77%,rgba(3,6,18,0.78)_100%)]" />
            <div className="pointer-events-none absolute inset-4 rounded-full border border-white/10" />
          </div>
          <p className="mx-auto mt-5 w-fit rounded-full border border-white/14 bg-white/8 px-4 py-2 text-xs text-white/72 backdrop-blur">
            Gökyüzüne biraz daha yakından bak
          </p>
        </div>

        <div className="glass-panel max-w-lg rounded-[2rem] border-white/12 bg-white/10 p-5 sm:p-8 lg:order-1">
          <h1 className="font-display text-5xl leading-tight text-champagne sm:text-7xl">
            {siteContent.hero.title}
          </h1>
          <p className="mt-4 text-sm font-semibold text-white/78">{siteContent.hero.subtitle}</p>
          <p className="mt-5 text-base leading-8 text-white/76">{siteContent.hero.paragraph}</p>
          <button
            type="button"
            onClick={() => document.querySelector('#memory-book')?.scrollIntoView({ behavior: 'smooth' })}
            className="mt-7 min-h-12 rounded-full bg-gradient-to-r from-roseglow to-champagne px-6 font-bold text-[#321337] shadow-glow"
          >
            {siteContent.hero.cta}
          </button>
        </div>
      </div>
    </section>
  );
}
