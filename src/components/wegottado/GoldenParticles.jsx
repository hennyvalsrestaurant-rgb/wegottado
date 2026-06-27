import React, { useEffect, useRef } from 'react';

export default function GoldenParticles() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;
    let particles = [];
    let scrollSpeed = 0;
    let lastScroll = window.scrollY;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    for (let i = 0; i < 40; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2 + 0.5,
        speedX: (Math.random() - 0.5) * 0.3,
        speedY: (Math.random() - 0.5) * 0.2 - 0.1,
        opacity: Math.random() * 0.4 + 0.1,
        pulse: Math.random() * Math.PI * 2,
      });
    }

    const onScroll = () => {
      scrollSpeed = Math.abs(window.scrollY - lastScroll);
      lastScroll = window.scrollY;
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      scrollSpeed *= 0.95;

      particles.forEach(p => {
        p.pulse += 0.01;
        p.x += p.speedX + (scrollSpeed * 0.02 * (Math.random() - 0.5));
        p.y += p.speedY - (scrollSpeed * 0.01);

        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        const currentOpacity = p.opacity * (0.5 + Math.sin(p.pulse) * 0.5);
        const stretch = scrollSpeed > 5 ? Math.min(scrollSpeed * 0.3, 8) : 0;

        ctx.beginPath();
        if (stretch > 1) {
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x + stretch, p.y - stretch * 0.5);
          ctx.strokeStyle = `rgba(212, 175, 55, ${currentOpacity})`;
          ctx.lineWidth = p.size * 0.5;
          ctx.stroke();
        } else {
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(212, 175, 55, ${currentOpacity})`;
          ctx.fill();
        }
      });
      animId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 1 }}
    />
  );
}