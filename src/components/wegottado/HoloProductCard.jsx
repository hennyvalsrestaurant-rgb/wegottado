import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, Eye } from 'lucide-react';

export default function HoloProductCard({ product, onAddToCart, onView }) {
  const [hovered, setHovered] = useState(false);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const cardRef = useRef(null);

  const onMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const rx = ((e.clientY - cy) / (rect.height / 2)) * -10;
    const ry = ((e.clientX - cx) / (rect.width / 2)) * 10;
    setRotateX(rx);
    setRotateY(ry);
  };

  const onMouseLeave = () => {
    setHovered(false);
    setRotateX(0);
    setRotateY(0);
  };

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
      onMouseEnter={() => setHovered(true)}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      className="cursor-hover group relative"
      style={{ perspective: 1000 }}
    >
      <motion.div
        animate={{ rotateX, rotateY, scale: hovered ? 1.02 : 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        className="holo-card relative overflow-hidden"
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Image */}
        <div className="relative overflow-hidden" style={{ height: 340 }}>
          <img
            src={product.image_url || product.image}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-1000"
            style={{ transform: hovered ? 'scale(1.08)' : 'scale(1)' }}
          />
          {/* Holographic shimmer overlay */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ opacity: hovered ? 1 : 0, transition: 'opacity 0.6s' }}
          >
            <div className="holo-shimmer absolute inset-0" />
          </div>
          {/* Scan line */}
          {hovered && <div className="absolute inset-0 scan-line" />}

          {/* Gradient */}
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(to top, rgba(13,13,20,0.95) 0%, transparent 55%)',
            }}
          />

          {/* Tag */}
          {product.tag && (
            <div
              className="absolute top-4 left-4 px-3 py-1"
              style={{
                background: 'rgba(0,245,255,0.1)',
                border: '1px solid rgba(0,245,255,0.3)',
                backdropFilter: 'blur(8px)',
              }}
            >
              <span className="meta-text text-[10px]" style={{ color: 'var(--neon-cyan)' }}>
                {product.tag}
              </span>
            </div>
          )}

          {/* Action buttons */}
          <motion.div
            animate={{ opacity: hovered ? 1 : 0, y: hovered ? 0 : 12 }}
            transition={{ duration: 0.4 }}
            className="absolute bottom-4 left-4 right-4 flex gap-3"
          >
            <button
              onClick={() => onAddToCart(product)}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 cursor-hover"
              style={{
                background: 'var(--gold)',
                color: 'var(--obsidian)',
              }}
            >
              <ShoppingBag size={14} />
              <span className="meta-text text-[10px]">ADD TO BAG</span>
            </button>
            <button
              onClick={() => onView(product)}
              className="px-4 py-2.5 cursor-hover"
              style={{ border: '1px solid rgba(0,245,255,0.4)', color: 'var(--neon-cyan)' }}
            >
              <Eye size={14} />
            </button>
          </motion.div>
        </div>

        {/* Info */}
        <div className="p-5">
          <span className="meta-text text-[10px] block mb-2" style={{ color: 'rgba(0,245,255,0.5)' }}>
            {product.category || 'COLLECTION'}
          </span>
          <h3 className="heading-display text-xl mb-1" style={{ color: 'var(--carrara)' }}>
            {product.name}
          </h3>
          <span className="meta-text text-xs metallic-text">
            ${typeof product.price === 'number' ? product.price.toLocaleString() : product.price}
          </span>
        </div>

        {/* Holo border */}
        <div
          className="absolute inset-0 pointer-events-none holo-border-animate"
          style={{ border: '1px solid', opacity: hovered ? 1 : 0, transition: 'opacity 0.4s' }}
        />

        {/* Corner accents */}
        <div className="absolute top-0 left-0 w-4 h-4 pointer-events-none" style={{ borderTop: '1px solid var(--neon-cyan)', borderLeft: '1px solid var(--neon-cyan)' }} />
        <div className="absolute top-0 right-0 w-4 h-4 pointer-events-none" style={{ borderTop: '1px solid var(--neon-cyan)', borderRight: '1px solid var(--neon-cyan)' }} />
        <div className="absolute bottom-0 left-0 w-4 h-4 pointer-events-none" style={{ borderBottom: '1px solid var(--neon-cyan)', borderLeft: '1px solid var(--neon-cyan)' }} />
        <div className="absolute bottom-0 right-0 w-4 h-4 pointer-events-none" style={{ borderBottom: '1px solid var(--neon-cyan)', borderRight: '1px solid var(--neon-cyan)' }} />
      </motion.div>
    </motion.div>
  );
}