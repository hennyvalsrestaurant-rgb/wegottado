import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ShoppingBag, User, Bell } from 'lucide-react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';

const NAV_LINKS = [
  { label: 'COLLECTIONS', href: '#collections' },
  { label: 'SHOWROOM', href: '#showroom' },
  { label: 'CRAFT', href: '#craft' },
  { label: 'LOOKBOOK', href: '#lookbook' },
  { label: 'MAISON', href: '#maison' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [notifCount, setNotifCount] = useState(0);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener('scroll', onScroll, { passive: true });
    base44.auth.me().then(me => {
      setUser(me);
      base44.entities.CartItem.filter({ user_id: me.id }).then(items => setCartCount(items.length)).catch(() => {});
      base44.entities.Notification.filter({ user_id: me.id, read: false }).then(n => setNotifCount(n.length)).catch(() => {});
    }).catch(() => {});
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTo = (href) => {
    setMobileOpen(false);
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1, delay: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-700"
        style={{
          background: scrolled ? 'rgba(8,8,8,0.9)' : 'transparent',
          backdropFilter: scrolled ? 'blur(20px)' : 'none',
          borderBottom: scrolled ? '1px solid rgba(212,175,55,0.1)' : 'none',
        }}
      >
        <div className="flex items-center justify-between px-6 md:px-12 py-5">
          <button onClick={() => scrollTo('#hero')} className="cursor-hover">
            <span className="heading-display text-xl md:text-2xl tracking-wider" style={{ color: 'var(--gold)' }}>
              WEGOTTADO
            </span>
          </button>

          <div className="hidden md:flex items-center gap-10">
            {NAV_LINKS.map(link => (
              <button
                key={link.label}
                onClick={() => scrollTo(link.href)}
                className="meta-text gold-underline cursor-hover hover:text-[var(--gold)] transition-colors duration-500"
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* Action icons */}
          <div className="flex items-center gap-4">
            {user && (
              <>
                <Link to="/profile" className="relative cursor-hover" style={{ color: 'rgba(245,245,247,0.5)' }}>
                  <Bell size={18} />
                  {notifCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full text-[8px] flex items-center justify-center"
                      style={{ background: 'var(--neon-cyan)', color: 'var(--obsidian)' }}>
                      {notifCount}
                    </span>
                  )}
                </Link>
                <Link to="/checkout" className="relative cursor-hover" style={{ color: 'rgba(245,245,247,0.5)' }}>
                  <ShoppingBag size={18} />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full text-[8px] flex items-center justify-center"
                      style={{ background: 'var(--gold)', color: 'var(--obsidian)' }}>
                      {cartCount}
                    </span>
                  )}
                </Link>
                <Link to="/profile" className="cursor-hover" style={{ color: 'rgba(245,245,247,0.5)' }}>
                  <User size={18} />
                </Link>
              </>
            )}
            {!user && (
              <Link to="/login" className="meta-text text-[10px] cursor-hover hidden md:block"
                style={{ color: 'var(--gold)', border: '1px solid rgba(212,175,55,0.3)', padding: '6px 14px' }}>
                SIGN IN
              </Link>
            )}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden cursor-hover"
              style={{ color: 'var(--gold)' }}
            >
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </motion.nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 z-40 flex flex-col items-center justify-center gap-10"
            style={{ background: 'rgba(8,8,8,0.97)', backdropFilter: 'blur(30px)' }}
          >
            {NAV_LINKS.map((link, i) => (
              <motion.button
                key={link.label}
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
                onClick={() => scrollTo(link.href)}
                className="heading-display text-4xl cursor-hover"
                style={{ color: 'var(--carrara)' }}
              >
                {link.label}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}