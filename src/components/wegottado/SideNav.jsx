import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';

const SECTIONS = [
  { label: 'HERO', id: 'hero' },
  { label: 'MANIFESTO', id: 'manifesto' },
  { label: 'COLLECTIONS', id: 'collections' },
  { label: 'FEATURED', id: 'featured' },
  { label: 'CRAFT', id: 'craft' },
  { label: 'LOOKBOOK', id: 'lookbook' },
  { label: 'PRE-ORDERS', id: 'pre-orders-preview' },
  { label: 'MAISON', id: 'maison' },
];

const PAGES = [
  { label: 'HOME', path: '/' },
  { label: 'PRE-ORDERS', path: '/pre-orders' },
  { label: 'CHECKOUT', path: '/checkout' },
  { label: 'PROFILE', path: '/profile' },
];

export default function SideNav() {
  const [activeSection, setActiveSection] = useState('hero');
  const [hovered, setHovered] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === '/';

  useEffect(() => {
    if (!isHome) return;
    const observers = [];
    SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveSection(id); },
        { threshold: 0.4 }
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach(o => o.disconnect());
  }, [isHome]);

  const scrollTo = (id) => {
    if (!isHome) { navigate('/'); setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }), 400); return; }
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const items = isHome ? SECTIONS : PAGES;

  return (
    <div
      className="fixed right-6 top-1/2 -translate-y-1/2 z-[100] flex flex-col items-end gap-3"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {items.map((item) => {
        const isActive = isHome
          ? activeSection === item.id
          : location.pathname === item.path;

        return (
          <button
            key={item.label}
            onClick={() => isHome ? scrollTo(item.id) : navigate(item.path)}
            className="flex items-center gap-2.5 cursor-hover group"
          >
            <AnimatePresence>
              {hovered && (
                <motion.span
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 8 }}
                  transition={{ duration: 0.2 }}
                  className="meta-text text-[9px] whitespace-nowrap"
                  style={{ color: isActive ? 'var(--neon-cyan)' : 'rgba(245,245,247,0.35)' }}
                >
                  {item.label}
                </motion.span>
              )}
            </AnimatePresence>

            <motion.div
              animate={{
                width: isActive ? 20 : 6,
                background: isActive ? 'var(--neon-cyan)' : 'rgba(245,245,247,0.25)',
                boxShadow: isActive ? '0 0 8px var(--neon-cyan)' : 'none',
              }}
              transition={{ duration: 0.3 }}
              style={{ height: 4 }}
            />
          </button>
        );
      })}
    </div>
  );
}