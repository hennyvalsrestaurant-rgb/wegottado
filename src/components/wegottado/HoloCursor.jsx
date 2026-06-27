import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

export default function HoloCursor() {
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [trail, setTrail] = useState([]);
  const [hovering, setHovering] = useState(false);
  const [clicking, setClicking] = useState(false);
  const targetRef = useRef({ x: -100, y: -100 });
  const rafRef = useRef(null);

  useEffect(() => {
    const onMove = (e) => {
      targetRef.current = { x: e.clientX, y: e.clientY };
      setTrail(prev => [...prev.slice(-6), { x: e.clientX, y: e.clientY, id: Date.now() }]);
    };
    const onDown = () => setClicking(true);
    const onUp = () => setClicking(false);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mousedown', onDown);
    window.addEventListener('mouseup', onUp);

    const animate = () => {
      setPos(prev => ({
        x: prev.x + (targetRef.current.x - prev.x) * 0.12,
        y: prev.y + (targetRef.current.y - prev.y) * 0.12,
      }));
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);

    const addHoverListeners = () => {
      document.querySelectorAll('a,button,[role="button"],.cursor-hover').forEach(el => {
        el.addEventListener('mouseenter', () => setHovering(true));
        el.addEventListener('mouseleave', () => setHovering(false));
      });
    };
    addHoverListeners();
    const obs = new MutationObserver(addHoverListeners);
    obs.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mousedown', onDown);
      window.removeEventListener('mouseup', onUp);
      cancelAnimationFrame(rafRef.current);
      obs.disconnect();
    };
  }, []);

  return (
    <>
      {/* Trail dots */}
      {trail.map((t, i) => (
        <div
          key={t.id}
          className="fixed pointer-events-none rounded-full"
          style={{
            left: t.x,
            top: t.y,
            width: 4,
            height: 4,
            transform: 'translate(-50%,-50%)',
            background: 'var(--neon-cyan)',
            opacity: (i / trail.length) * 0.3,
            zIndex: 9997,
            transition: 'opacity 0.5s',
          }}
        />
      ))}

      {/* Main ring */}
      <motion.div
        className="fixed pointer-events-none"
        style={{ left: pos.x, top: pos.y, transform: 'translate(-50%,-50%)', zIndex: 9999 }}
        animate={{
          width: clicking ? 14 : hovering ? 52 : 24,
          height: clicking ? 14 : hovering ? 52 : 24,
        }}
        transition={{ type: 'spring', stiffness: 400, damping: 28 }}
      >
        <div
          className="w-full h-full rounded-full border"
          style={{
            borderColor: hovering ? 'rgba(0,245,255,0.9)' : 'rgba(212,175,55,0.6)',
            boxShadow: hovering
              ? '0 0 12px rgba(0,245,255,0.6), inset 0 0 8px rgba(0,245,255,0.1)'
              : '0 0 8px rgba(212,175,55,0.3)',
            transition: 'border-color 0.3s, box-shadow 0.3s',
          }}
        />
        {hovering && (
          <div
            className="absolute inset-2 rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(0,245,255,0.15), transparent)' }}
          />
        )}
      </motion.div>

      {/* Dot center */}
      <div
        className="fixed pointer-events-none rounded-full"
        style={{
          left: targetRef.current.x,
          top: targetRef.current.y,
          width: 4,
          height: 4,
          transform: 'translate(-50%,-50%)',
          background: 'var(--neon-cyan)',
          zIndex: 9999,
          boxShadow: '0 0 6px var(--neon-cyan)',
        }}
      />
    </>
  );
}