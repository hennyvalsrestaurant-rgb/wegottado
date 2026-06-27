import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

export default function CustomCursor() {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [hovering, setHovering] = useState(false);
  const [visible, setVisible] = useState(false);
  const rafRef = useRef(null);
  const targetRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const onMove = (e) => {
      targetRef.current = { x: e.clientX, y: e.clientY };
      if (!visible) setVisible(true);
    };
    const onLeave = () => setVisible(false);
    const onEnter = () => setVisible(true);

    window.addEventListener('mousemove', onMove);
    document.addEventListener('mouseleave', onLeave);
    document.addEventListener('mouseenter', onEnter);

    const animate = () => {
      setPos(prev => ({
        x: prev.x + (targetRef.current.x - prev.x) * 0.15,
        y: prev.y + (targetRef.current.y - prev.y) * 0.15
      }));
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);

    const addHoverListeners = () => {
      document.querySelectorAll('a, button, [role="button"], .cursor-hover').forEach(el => {
        el.addEventListener('mouseenter', () => setHovering(true));
        el.addEventListener('mouseleave', () => setHovering(false));
      });
    };
    addHoverListeners();
    const observer = new MutationObserver(addHoverListeners);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseleave', onLeave);
      document.removeEventListener('mouseenter', onEnter);
      cancelAnimationFrame(rafRef.current);
      observer.disconnect();
    };
  }, [visible]);

  if (!visible) return null;

  return (
    <motion.div
      className="fixed pointer-events-none z-[9999]"
      style={{ left: pos.x, top: pos.y, transform: 'translate(-50%, -50%)' }}
    >
      <motion.div
        animate={{
          width: hovering ? 48 : 20,
          height: hovering ? 48 : 20,
          borderColor: hovering ? 'rgba(212,175,55,0.8)' : 'rgba(212,175,55,0.5)',
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="rounded-full border-2 flex items-center justify-center"
        style={{ borderColor: 'rgba(212,175,55,0.5)' }}
      >
        {hovering && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.3 }}
            className="w-2 h-2 rounded-full"
            style={{ background: '#D4AF37' }}
          />
        )}
      </motion.div>
    </motion.div>
  );
}