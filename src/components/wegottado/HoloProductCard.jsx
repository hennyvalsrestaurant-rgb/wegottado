import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Eye } from 'lucide-react';
import { useCurrency } from '@/components/wegottado/CurrencySelector';

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

export default function HoloProductCard({ product, onAddToCart, onView }) {
  const [hovered, setHovered] = useState(false);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [selectedSize, setSelectedSize] = useState(null);
  const [imgIndex, setImgIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const cardRef = useRef(null);

  const allImages = [product.image_url || product.image, ...(product.images || [])].filter(Boolean);

  const goNext = (e) => {
    e.stopPropagation();
    if (imgIndex >= allImages.length - 1) return;
    setDirection(1);
    setImgIndex(i => i + 1);
  };
  const goPrev = (e) => {
    e.stopPropagation();
    if (imgIndex <= 0) return;
    setDirection(-1);
    setImgIndex(i => i - 1);
  };

  const handleDragEnd = (e, info) => {
    if (info.offset.x < -40 && imgIndex < allImages.length - 1) { setDirection(1); setImgIndex(i => i + 1); }
    else if (info.offset.x > 40 && imgIndex > 0) { setDirection(-1); setImgIndex(i => i - 1); }
  };

  const availableSizes = product.sizes?.length ? product.sizes : SIZES;
  const { format } = useCurrency();

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
        {/* Image Gallery */}
        <div className="relative overflow-hidden" style={{ height: 340 }}>
          <AnimatePresence initial={false} custom={direction}>
            <motion.div
              key={imgIndex}
              custom={direction}
              variants={{
                enter: (d) => ({ x: d * 60, rotateY: d * 25, opacity: 0, scale: 0.92, zIndex: 1 }),
                center: { x: 0, rotateY: 0, opacity: 1, scale: 1, zIndex: 1 },
                exit: (d) => ({ x: d * -60, rotateY: d * -25, opacity: 0, scale: 0.92, zIndex: 0 }),
              }}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.45, ease: [0.25, 0.1, 0.25, 1] }}
              drag={allImages.length > 1 ? "x" : false}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.15}
              onDragEnd={allImages.length > 1 ? handleDragEnd : undefined}
              className="absolute inset-0"
              style={{ transformStyle: 'preserve-3d', perspective: 800 }}
            >
              <img
                src={allImages[imgIndex]}
                alt={product.name}
                className="w-full h-full object-contain"
                style={{ transform: hovered ? 'scale(1.06)' : 'scale(1)', transition: 'transform 1s ease', pointerEvents: 'none' }}
                draggable={false}
              />
            </motion.div>
          </AnimatePresence>

          {/* Holographic shimmer overlay */}
          <div className="absolute inset-0 pointer-events-none" style={{ opacity: hovered ? 1 : 0, transition: 'opacity 0.6s' }}>
            <div className="holo-shimmer absolute inset-0" />
          </div>
          {hovered && <div className="absolute inset-0 scan-line pointer-events-none" />}

          {/* Gradient */}
          <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(to top, rgba(13,13,20,0.95) 0%, transparent 55%)' }} />

          {/* Image dots / nav — only when multiple images */}
          {allImages.length > 1 && (
            <>
              {/* Prev / Next arrows */}
              <button
                onClick={goPrev}
                className="cursor-hover absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center z-10"
                style={{ background: 'rgba(8,8,8,0.6)', border: '1px solid rgba(0,245,255,0.25)', color: 'var(--neon-cyan)', opacity: hovered ? 1 : 0, transition: 'opacity 0.3s' }}
              >‹</button>
              <button
                onClick={goNext}
                className="cursor-hover absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center z-10"
                style={{ background: 'rgba(8,8,8,0.6)', border: '1px solid rgba(0,245,255,0.25)', color: 'var(--neon-cyan)', opacity: hovered ? 1 : 0, transition: 'opacity 0.3s' }}
              >›</button>
              {/* Dot indicators */}
              <div className="absolute bottom-14 left-0 right-0 flex justify-center gap-1.5 z-10 pointer-events-none">
                {allImages.map((_, i) => (
                  <div key={i} className="rounded-full transition-all duration-300"
                    style={{ width: i === imgIndex ? 16 : 5, height: 5, background: i === imgIndex ? 'var(--neon-cyan)' : 'rgba(0,245,255,0.3)', boxShadow: i === imgIndex ? '0 0 6px var(--neon-cyan)' : 'none' }} />
                ))}
              </div>
            </>
          )}

          {/* Tag */}
          {product.tag && (
            <div className="absolute top-4 left-4 px-3 py-1 z-10"
              style={{ background: 'rgba(0,245,255,0.1)', border: '1px solid rgba(0,245,255,0.3)', backdropFilter: 'blur(8px)' }}>
              <span className="meta-text text-[10px]" style={{ color: 'var(--neon-cyan)' }}>{product.tag}</span>
            </div>
          )}

          {/* Action buttons */}
          <motion.div
            animate={{ opacity: hovered ? 1 : 0, y: hovered ? 0 : 12 }}
            transition={{ duration: 0.4 }}
            className="absolute bottom-4 left-4 right-4 flex gap-3 z-10"
          >
            <button
              onClick={() => onAddToCart(product, selectedSize || availableSizes[0])}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 cursor-hover"
              style={{ background: 'var(--gold)', color: 'var(--obsidian)' }}
            >
              <ShoppingBag size={14} />
              <span className="meta-text text-[10px]">{selectedSize ? `ADD — ${selectedSize}` : 'ADD TO BAG'}</span>
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
            {format(product.price)}
          </span>

          {/* Size selector */}
          <div className="mt-4">
            <span className="meta-text text-[9px] block mb-2" style={{ color: 'rgba(245,245,247,0.3)', letterSpacing: '0.2em' }}>SIZE</span>
            <div className="flex flex-wrap gap-1.5">
              {availableSizes.map(sz => (
                <button
                  key={sz}
                  onClick={(e) => { e.stopPropagation(); setSelectedSize(sz === selectedSize ? null : sz); }}
                  className="cursor-hover w-9 h-9 meta-text text-[9px] flex items-center justify-center transition-all duration-200"
                  style={{
                    border: `1px solid ${selectedSize === sz ? 'var(--neon-cyan)' : 'rgba(0,245,255,0.12)'}`,
                    color: selectedSize === sz ? 'var(--neon-cyan)' : 'rgba(245,245,247,0.35)',
                    background: selectedSize === sz ? 'rgba(0,245,255,0.08)' : 'transparent',
                    boxShadow: selectedSize === sz ? '0 0 8px rgba(0,245,255,0.2)' : 'none',
                  }}
                >
                  {sz}
                </button>
              ))}
            </div>
          </div>
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