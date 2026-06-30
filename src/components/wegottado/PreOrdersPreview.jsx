import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useCurrency } from '@/components/wegottado/CurrencySelector';
import { Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function PreOrdersPreview() {
  const [items, setItems] = useState([]);
  const { format } = useCurrency();

  useEffect(() => {
    base44.entities.PreOrder.list('-created_date', 6)
      .then(setItems)
      .catch(() => {});
  }, []);

  if (items.length === 0) return null;

  return (
    <section id="pre-orders" className="relative py-24 md:py-36 px-6 md:px-[8vw]">
      {/* Header */}
      <div className="mb-16 text-center">
        <motion.span
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          className="meta-text block mb-4" style={{ color: 'var(--gold)' }}
        >
          — UPCOMING DROPS —
        </motion.span>
        <motion.h2
          initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 1 }}
          className="heading-display text-5xl md:text-7xl"
        >
          <span className="metallic-text">Pre-Order</span>{' '}
          <span style={{ color: 'var(--carrara)' }}>Collection</span>
        </motion.h2>
        <div className="flex items-center justify-center mt-6 gap-4">
          <div className="h-px w-20" style={{ background: 'linear-gradient(to right, transparent, var(--gold))' }} />
          <div className="w-2 h-2 rotate-45" style={{ background: 'var(--gold)', boxShadow: '0 0 8px var(--gold)' }} />
          <div className="h-px w-20" style={{ background: 'linear-gradient(to left, transparent, var(--gold))' }} />
        </div>
      </div>

      {/* Flip Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {items.map((item, i) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.07, duration: 0.6 }}
          >
            <FlipCard item={item} format={format} />
          </motion.div>
        ))}
      </div>

      {/* CTA */}
      <div className="text-center mt-14">
        <Link
          to="/pre-orders"
          className="cursor-hover inline-flex items-center gap-3 px-10 py-4 group relative overflow-hidden"
          style={{ border: '1px solid var(--gold)' }}
        >
          <span className="relative z-10 meta-text text-xs transition-colors duration-500 group-hover:text-[var(--obsidian)]"
            style={{ color: 'var(--gold)' }}>
            SEE ALL PRE-ORDERS
          </span>
          <div className="absolute inset-0 -translate-x-full group-hover:translate-x-0 transition-transform duration-700"
            style={{ background: 'var(--gold)' }} />
        </Link>
      </div>
    </section>
  );
}

function FlipCard({ item, format }) {
  const [flipped, setFlipped] = useState(false);
  const backImage = item.images?.[0] || item.image_url;

  return (
    <div
      className="cursor-hover"
      style={{ perspective: '1000px', height: 380 }}
      onMouseEnter={() => setFlipped(true)}
      onMouseLeave={() => setFlipped(false)}
    >
      <motion.div
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
        style={{ transformStyle: 'preserve-3d', width: '100%', height: '100%', position: 'relative' }}
      >
        {/* Front */}
        <div
          className="absolute inset-0 holo-card overflow-hidden"
          style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
        >
          <div className="relative h-full">
            {item.image_url ? (
              <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center" style={{ background: 'var(--metal-mid)' }}>
                <Clock size={48} style={{ color: 'rgba(212,175,55,0.2)' }} />
              </div>
            )}
            <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(to top, rgba(13,13,20,0.95) 0%, transparent 55%)' }} />
            {/* COMING SOON badge */}
            <div className="absolute top-4 left-4 px-3 py-1"
              style={{ background: 'rgba(212,175,55,0.12)', border: '1px solid rgba(212,175,55,0.4)', backdropFilter: 'blur(8px)' }}>
              <span className="meta-text text-[9px]" style={{ color: 'var(--gold)' }}>COMING SOON</span>
            </div>
            {item.tag && (
              <div className="absolute top-4 right-4 px-3 py-1"
                style={{ background: 'rgba(0,245,255,0.1)', border: '1px solid rgba(0,245,255,0.3)', backdropFilter: 'blur(8px)' }}>
                <span className="meta-text text-[9px]" style={{ color: 'var(--neon-cyan)' }}>{item.tag}</span>
              </div>
            )}
            {/* Info at bottom */}
            <div className="absolute bottom-0 left-0 right-0 p-5">
              <span className="meta-text text-[10px] block mb-1" style={{ color: 'rgba(0,245,255,0.5)' }}>
                {item.category || 'COLLECTION'}
              </span>
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
            <div className="absolute top-0 left-0 w-4 h-4 pointer-events-none" style={{ borderTop: '1px solid var(--gold)', borderLeft: '1px solid var(--gold)' }} />
            <div className="absolute top-0 right-0 w-4 h-4 pointer-events-none" style={{ borderTop: '1px solid var(--gold)', borderRight: '1px solid var(--gold)' }} />
            <div className="absolute bottom-0 left-0 w-4 h-4 pointer-events-none" style={{ borderBottom: '1px solid var(--gold)', borderLeft: '1px solid var(--gold)' }} />
            <div className="absolute bottom-0 right-0 w-4 h-4 pointer-events-none" style={{ borderBottom: '1px solid var(--gold)', borderRight: '1px solid var(--gold)' }} />
          </div>
        </div>

        {/* Back */}
        <div
          className="absolute inset-0 holo-card overflow-hidden flex flex-col"
          style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          {backImage ? (
            <div className="flex-1 overflow-hidden">
              <img src={backImage} alt={`${item.name} back`} className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="flex-1" style={{ background: 'var(--metal-mid)' }} />
          )}
          <div className="p-5" style={{ background: 'var(--metal-dark)', borderTop: '1px solid rgba(212,175,55,0.15)' }}>
            {item.description ? (
              <p className="text-xs mb-3 line-clamp-3" style={{ color: 'rgba(245,245,247,0.6)', lineHeight: 1.7 }}>{item.description}</p>
            ) : (
              <p className="text-xs mb-3" style={{ color: 'rgba(245,245,247,0.3)' }}>Limited edition. Strictly allocated.</p>
            )}
            <Link to="/pre-orders" className="meta-text text-[10px] cursor-hover" style={{ color: 'var(--gold)' }}>
              VIEW DETAILS →
            </Link>
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