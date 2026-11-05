'use client';
import { useEffect, useRef } from 'react';
export function Starfield() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const draw = () => {
      const w = window.innerWidth,
        h = Math.min(window.innerHeight, 1200);
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, w, h);
      let seed = 618;
      const random = () => {
        seed = (seed * 16807) % 2147483647;
        return seed / 2147483647;
      };
      const count = w < 600 ? 65 : 170;
      for (let i = 0; i < count; i++) {
        const x = random() * w,
          y = random() * h,
          r = random() * 1.1 + 0.25;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(213,221,241,${random() * 0.55 + 0.12})`;
        ctx.fill();
        if (i % 21 === 0) {
          ctx.strokeStyle = 'rgba(224,208,173,.25)';
          ctx.beginPath();
          ctx.moveTo(x - 4, y);
          ctx.lineTo(x + 4, y);
          ctx.moveTo(x, y - 4);
          ctx.lineTo(x, y + 4);
          ctx.stroke();
        }
      }
    };
    draw();
    window.addEventListener('resize', draw);
    return () => window.removeEventListener('resize', draw);
  }, []);
  return <canvas ref={ref} className="starfield" aria-hidden="true" />;
}
