import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useCurrency } from '@/components/wegottado/CurrencySelector';
import { Clock, ChevronRight } from 'lucide-react';
import HoloGrid from '@/components/wegottado/HoloGrid';
import HoloCursor from '@/components/wegottado/HoloCursor';
import Navbar from '@/components/wegottado/Navbar';
import Footer from '@/components/wegottado/Footer';
import SideNav from '@/components/wegottado/SideNav';

function ProductCard({ item, onSelect }) {
  const [imgIndex, setImgIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const cardRef = useRef(null);
  const { format } = useCurrency();
  const allImages = [item.image_url, ...(item.images || [])].filter(Boolean);

  const handleDragEnd = (e, info) => {
    if (allImages.length < 2) return;
    if (info.offset.x < -40) { setDirection(1); setImgIndex(i => (i + 1) % allImages.length); }
    else if (info.offset.x > 40) { setDirection(-1); setImgIndex(i => (i - 1 + allImages.length) % allImages.length); }
  };

  const handleMouseMove = (e) => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: -y * 10, y: x * 10 });
  };

  return (
    <div ref={cardRef} onMouseMove={handleMouseMove} onMouseLeave={() => setTilt({ x: 0, y: 0 })} style={{ perspective: '900px', height: 380 }}>
      <motion.div
        animate={{ rotateX: tilt.x, rotateY: tilt.y }}
        transition={{ type: 'spring', stiffness: 100, damping: 20 }}
        className="holo-card overflow-hidden cursor-hover w-full h-full"
        style={{ transformStyle: 'preserve-3d' }}
        onClick={() => onSelect(item)}
      >
        <div className="relative h-full">
          {/* Swipeable image */}
          <AnimatePresence initial={false} custom={direction}>
            <motion.div
              key={imgIndex}
              custom={direction}
              variants={{
                enter: (d) => ({ x: d * 60, opacity: 0 }),
                center: { x: 0, opacity: 1 },
                exit: (d) => ({ x: d * -60, opacity: 0 }),
              }}
              initial="enter" animate="center" exit="exit"
              transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
              drag={allImages.length > 1 ? "x" : false}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.15}
              onDragEnd={handleDragEnd}
              onClick={e => allImages.length > 1 && e.stopPropagation()}
              className="absolute inset-0"
            >
              {allImages.length > 0 ? (
                <img src={allImages[imgIndex]} alt={item.name} className="w-full h-full object-cover" draggable={false} />
              ) : (
                <div className="w-full h-full flex items-center justify-center" style={{ background: 'var(--metal-mid)' }}>
                  <Clock size={48} style={{ color: 'rgba(0,245,255,0.15)' }} />
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Gradient overlay */}
          <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(to top, rgba(13,13,20,0.95) 0%, transparent 55%)' }} />

          {/* Dot indicators */}
          {allImages.length > 1 && (
            <div className="absolute bottom-[76px] left-0 right-0 flex justify-center gap-1.5 z-10 pointer-events-none">
              {allImages.map((_, i) => (
                <div key={i} className="rounded-full transition-all duration-300"
                  style={{ width: i === imgIndex ? 14 : 4, height: 4, background: i === imgIndex ? 'var(--neon-cyan)' : 'rgba(0,245,255,0.3)', boxShadow: i === imgIndex ? '0 0 6px var(--neon-cyan)' : 'none' }} />
              ))}
            </div>
          )}

          {/* Tags */}
          <div className="absolute top-4 left-4 px-3 py-1 pointer-events-none"
            style={{ background: 'rgba(212,175,55,0.12)', border: '1px solid rgba(212,175,55,0.4)', backdropFilter: 'blur(8px)' }}>
            <span className="meta-text text-[9px]" style={{ color: 'var(--gold)' }}>COMING SOON</span>
          </div>
          {item.tag && (
            <div className="absolute top-4 right-4 px-3 py-1 pointer-events-none"
              style={{ background: 'rgba(0,245,255,0.1)', border: '1px solid rgba(0,245,255,0.3)', backdropFilter: 'blur(8px)' }}>
              <span className="meta-text text-[9px]" style={{ color: 'var(--neon-cyan)' }}>{item.tag}</span>
            </div>
          )}

          {/* Info */}
          <div className="absolute bottom-0 left-0 right-0 p-5 pointer-events-none">
            <span className="meta-text text-[10px] block mb-1" style={{ color: 'rgba(0,245,255,0.5)' }}>{item.category || 'COLLECTION'}</span>
            <h3 className="heading-display text-xl mb-2" style={{ color: 'var(--carrara)' }}>{item.name}</h3>
            <div className="flex items-center justify-between">
              {item.price ? (
                <span className="meta-text text-xs metallic-text">{format(item.price)}</span>
              ) : (
                <span className="meta-text text-[10px]" style={{ color: 'rgba(245,245,247,0.3)' }}>PRICE TBA</span>
              )}
              {item.release_date && (
                <span className="meta-text text-[9px] flex items-center gap-1" style={{ color: 'rgba(212,175,55,0.6)' }}>
                  <Clock size={10} /> {new Date(item.release_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                </span>
              )}
            </div>
          </div>

          {/* Corner accents */}
          <div className="absolute top-0 left-0 w-4 h-4 pointer-events-none" style={{ borderTop: '1px solid var(--neon-cyan)', borderLeft: '1px solid var(--neon-cyan)' }} />
          <div className="absolute top-0 right-0 w-4 h-4 pointer-events-none" style={{ borderTop: '1px solid var(--neon-cyan)', borderRight: '1px solid var(--neon-cyan)' }} />
          <div className="absolute bottom-0 left-0 w-4 h-4 pointer-events-none" style={{ borderBottom: '1px solid var(--neon-cyan)', borderLeft: '1px solid var(--neon-cyan)' }} />
          <div className="absolute bottom-0 right-0 w-4 h-4 pointer-events-none" style={{ borderBottom: '1px solid var(--neon-cyan)', borderRight: '1px solid var(--neon-cyan)' }} />
        </div>
      </motion.div>
    </div>
  );
}

function ModalImageSwiper({ item }) {
  const allImages = [item.image_url, ...(item.images || [])].filter(Boolean);
  const [imgIndex, setImgIndex] = useState(0);
  const [direction, setDirection] = useState(1);

  const handleDragEnd = (e, info) => {
    if (allImages.length < 2) return;
    if (info.offset.x < -40) { setDirection(1); setImgIndex(i => (i + 1) % allImages.length); }
    else if (info.offset.x > 40) { setDirection(-1); setImgIndex(i => (i - 1 + allImages.length) % allImages.length); }
  };

  if (allImages.length === 0) return null;

  return (
    <div className="relative overflow-hidden" style={{ height: 256 }}>
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={imgIndex}
          custom={direction}
          variants={{
            enter: (d) => ({ x: d * 60, opacity: 0 }),
            center: { x: 0, opacity: 1 },
            exit: (d) => ({ x: d * -60, opacity: 0 }),
          }}
          initial="enter" animate="center" exit="exit"
          transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
          drag={allImages.length > 1 ? "x" : false}
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.15}
          onDragEnd={handleDragEnd}
          className="absolute inset-0"
        >
          <img src={allImages[imgIndex]} alt={item.name} className="w-full h-full object-cover" draggable={false} />
        </motion.div>
      </AnimatePresence>
      {allImages.length > 1 && (
        <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 z-10 pointer-events-none">
          {allImages.map((_, i) => (
            <div key={i} className="rounded-full transition-all duration-300"
              style={{ width: i === imgIndex ? 14 : 4, height: 4, background: i === imgIndex ? 'var(--neon-cyan)' : 'rgba(0,245,255,0.3)', boxShadow: i === imgIndex ? '0 0 6px var(--neon-cyan)' : 'none' }} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function PreOrders() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    base44.entities.PreOrder.list('-created_date', 100)
      .then(data => { setItems(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen relative" style={{ background: 'var(--metal-dark)' }}>
      <HoloCursor />
      <HoloGrid />
      <SideNav />
      <Navbar />

      <div className="relative z-10 pt-32 pb-24 px-6 md:px-[8vw]">
        {/* Header */}
        <div className="mb-16 text-center">
          <motion.span
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="meta-text block mb-4" style={{ color: 'var(--neon-cyan)' }}
          >
            — COMING SOON —
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 1 }}
            className="heading-display text-5xl md:text-7xl"
          >
            <span className="metallic-text">Pre-Order</span>{' '}
            <span style={{ color: 'var(--carrara)' }}>Collection</span>
          </motion.h1>
          <div className="flex items-center justify-center mt-6 gap-4">
            <div className="h-px w-20" style={{ background: 'linear-gradient(to right, transparent, var(--neon-cyan))' }} />
            <div className="w-2 h-2 rotate-45" style={{ background: 'var(--neon-cyan)', boxShadow: '0 0 8px var(--neon-cyan)' }} />
            <div className="h-px w-20" style={{ background: 'linear-gradient(to left, transparent, var(--neon-cyan))' }} />
          </div>
          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
            className="mt-6 text-sm max-w-lg mx-auto" style={{ color: 'rgba(245,245,247,0.4)', lineHeight: 1.8 }}
          >
            Reserve your piece before it drops. These exclusive items are arriving soon and quantities will be strictly limited.
          </motion.p>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="w-10 h-10 border border-[var(--neon-cyan)] rounded-full animate-spin" style={{ borderTopColor: 'transparent' }} />
          </div>
        ) : items.length === 0 ? (
          <div className="holo-card p-20 text-center max-w-md mx-auto">
            <Clock size={48} className="mx-auto mb-4 opacity-20" style={{ color: 'var(--neon-cyan)' }} />
            <p className="heading-display text-2xl mb-2" style={{ color: 'rgba(245,245,247,0.4)' }}>Nothing yet</p>
            <p className="meta-text text-[10px]" style={{ color: 'rgba(245,245,247,0.2)' }}>Check back soon for upcoming drops.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {items.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07, duration: 0.6 }}
              >
                <ProductCard item={item} onSelect={setSelected} />
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Detail modal */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-6"
            style={{ background: 'rgba(8,8,8,0.92)', backdropFilter: 'blur(20px)' }}
            onClick={() => setSelected(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 30 }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
              className="holo-card relative max-w-lg w-full overflow-hidden"
              style={{ maxHeight: '85vh', overflowY: 'auto' }}
              onClick={e => e.stopPropagation()}
            >
              <button
                onClick={() => setSelected(null)}
                className="absolute top-4 right-4 z-10 cursor-hover w-8 h-8 flex items-center justify-center"
                style={{ background: 'rgba(8,8,8,0.75)', border: '1px solid rgba(0,245,255,0.3)', color: 'var(--neon-cyan)' }}
              >
                ✕
              </button>
              <ModalImageSwiper item={selected} />
              <div className="p-8">
                <div className="flex items-center gap-3 mb-3">
                  <span className="meta-text text-[9px] px-3 py-1" style={{ background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.3)', color: 'var(--gold)' }}>
                    COMING SOON
                  </span>
                  {selected.category && (
                    <span className="meta-text text-[10px]" style={{ color: 'var(--neon-cyan)' }}>{selected.category}</span>
                  )}
                </div>
                <h3 className="heading-display text-4xl mb-4" style={{ color: 'var(--carrara)' }}>{selected.name}</h3>
                {selected.description && (
                  <p className="text-sm mb-6" style={{ color: 'rgba(245,245,247,0.5)', lineHeight: 1.8 }}>{selected.description}</p>
                )}
                <div className="flex items-center justify-between py-4" style={{ borderTop: '1px solid rgba(0,245,255,0.08)', borderBottom: '1px solid rgba(0,245,255,0.08)' }}>
                  {selected.price ? (
                    <span className="heading-display text-3xl metallic-text">${selected.price.toLocaleString()}</span>
                  ) : (
                    <span className="meta-text text-sm" style={{ color: 'rgba(245,245,247,0.3)' }}>PRICE TBA</span>
                  )}
                  {selected.release_date && (
                    <span className="meta-text text-[10px] flex items-center gap-1.5" style={{ color: 'rgba(212,175,55,0.7)' }}>
                      <Clock size={11} /> DROP: {new Date(selected.release_date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}