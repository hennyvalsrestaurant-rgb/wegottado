import React, { useEffect, useRef } from 'react';

export default function HoloGrid() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;
    let t = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      t += 0.005;
      const spacing = 60;

      // Vertical lines with pulse
      for (let x = 0; x < canvas.width; x += spacing) {
        const pulse = Math.sin(t + x * 0.01) * 0.5 + 0.5;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.strokeStyle = `rgba(0,245,255,${0.03 + pulse * 0.02})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }

      // Horizontal lines
      for (let y = 0; y < canvas.height; y += spacing) {
        const pulse = Math.sin(t * 1.3 + y * 0.01) * 0.5 + 0.5;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.strokeStyle = `rgba(0,245,255,${0.02 + pulse * 0.015})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }

      // Intersection dots
      for (let x = 0; x < canvas.width; x += spacing) {
        for (let y = 0; y < canvas.height; y += spacing) {
          const dist = Math.sin(t * 0.8 + x * 0.005 + y * 0.005);
          if (dist > 0.7) {
            ctx.beginPath();
            ctx.arc(x, y, 1, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(0,245,255,${(dist - 0.7) * 0.5})`;
            ctx.fill();
          }
        }
      }

      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0, opacity: 0.6 }}
    />
  );
}