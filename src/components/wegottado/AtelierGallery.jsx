import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

const PRODUCTS = [
  {
    id: 1,
    name: 'The Sovereign Coat',
    category: 'OUTERWEAR',
    price: '$4,800',
    image: 'https://media.base44.com/images/public/6a401981c451758a55e9b4f5/2da261c99_generated_abc73311.png',
    span: 'col-span-2 row-span-2',
  },
  {
    id: 2,
    name: 'The Obsidian Bag',
    category: 'ACCESSORIES',
    price: '$2,200',
    image: 'https://media.base44.com/images/public/6a401981c451758a55e9b4f5/af94bce3e_generated_402b5792.png',
    span: 'col-span-1 row-span-1',
  },
  {
    id: 3,
    name: 'The Monolith Suit',
    category: 'SUITING',
    price: '$6,500',
    image: 'https://media.base44.com/images/public/6a401981c451758a55e9b4f5/9367500c8_generated_ca3d562c.png',
    span: 'col-span-1 row-span-2',
  },
  {
    id: 4,
    name: 'The Atelier Set',
    category: 'ACCESSORIES',
    price: '$1,800',
    image: 'https://media.base44.com/images/public/6a401981c451758a55e9b4f5/af06bafc8_generated_b9f51f06.png',
    span: 'col-span-1 row-span-1',
  },
  {
    id: 5,
    name: 'The Ivory Gown',
    category: 'EVENING WEAR',
    price: '$8,900',
    image: 'https://media.base44.com/images/public/6a401981c451758a55e9b4f5/0f2fef579_generated_d7ac6c34.png',
    span: 'col-span-1 row-span-2',
  },
  {
    id: 6,
    name: 'The Gold Chain Portrait',
    category: 'JEWELRY',
    price: '$3,400',
    image: 'https://media.base44.com/images/public/6a401981c451758a55e9b4f5/4aa583f5f_generated_b919dd87.png',
    span: 'col-span-1 row-span-1',
  },
];

function ProductCard({ product, index }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 80 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 1, delay: index * 0.1, ease: [0.25, 0.1, 0.25, 1] }}
      className={`${product.span} group cursor-hover relative`}
    >
      <div className="relative overflow-hidden h-full glossy-reflection" style={{ background: 'var(--vein)' }}>
        {/* Image with 3D hover rotation */}
        <motion.div
          className="w-full h-full"
          whileHover={{
            rotateY: 5,
            rotateX: -3,
            scale: 1.03,
            transition: { duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }
          }}
          style={{ perspective: 1000, transformStyle: 'preserve-3d' }}
        >
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
          />
        </motion.div>

        {/* Gradient overlay */}
        <div
          className="absolute inset-0 transition-opacity duration-700 opacity-0 group-hover:opacity-100"
          style={{
            background: 'linear-gradient(to top, rgba(8,8,8,0.9) 0%, transparent 60%)',
          }}
        />

        {/* Glossy reflection on hover */}
        <div
          className="absolute inset-0 transition-opacity duration-700 opacity-0 group-hover:opacity-100 pointer-events-none"
          style={{
            background: 'linear-gradient(135deg, transparent 30%, rgba(212,175,55,0.05) 50%, transparent 70%)',
          }}
        />

        {/* Product info */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 p-6 md:p-8 transition-all duration-700 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100"
        >
          <span className="meta-text text-[10px] block mb-2">{product.category}</span>
          <h3 className="heading-display text-xl md:text-2xl mb-1" style={{ color: 'var(--carrara)' }}>
            {product.name}
          </h3>
          <span className="meta-text text-xs" style={{ color: 'var(--gold)' }}>{product.price}</span>
        </motion.div>

        {/* Gold border on hover */}
        <div
          className="absolute inset-0 border transition-all duration-700 opacity-0 group-hover:opacity-100 pointer-events-none"
          style={{ borderColor: 'rgba(212,175,55,0.2)' }}
        />
      </div>
    </motion.div>
  );
}

export default function AtelierGallery() {
  const titleRef = useRef(null);
  const titleInView = useInView(titleRef, { once: true, margin: '-100px' });

  return (
    <section id="atelier" className="relative py-24 md:py-40 px-6 md:px-[10vw]">
      <div ref={titleRef} className="mb-16 md:mb-24">
        <motion.span
          initial={{ opacity: 0 }}
          animate={titleInView ? { opacity: 1 } : {}}
          transition={{ duration: 1 }}
          className="meta-text block mb-6"
        >
          THE ATELIER GALLERY
        </motion.span>
        <motion.h2
          initial={{ opacity: 0, x: -60 }}
          animate={titleInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 1.2, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
          className="heading-display text-5xl md:text-7xl lg:text-8xl"
          style={{ color: 'var(--carrara)' }}
        >
          Curated <span style={{ color: 'var(--gold)' }}>Pieces</span>
        </motion.h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 auto-rows-[300px] md:auto-rows-[350px]">
        {PRODUCTS.map((product, i) => (
          <ProductCard key={product.id} product={product} index={i} />
        ))}
      </div>
    </section>
  );
}