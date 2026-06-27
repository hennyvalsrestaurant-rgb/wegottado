import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';

const FABRIC_IMG = "https://media.base44.com/images/public/6a401981c451758a55e9b4f5/ecf85b5d2_generated_f889f1cf.png";

export default function ManifestoSection() {
  const sectionRef = useRef(null);
  const textRef = useRef(null);
  const isInView = useInView(textRef, { once: true, margin: '-100px' });
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start end", "end start"] });

  const bgY = useTransform(scrollYProgress, [0, 1], ['-10%', '10%']);
  const lineWidth = useTransform(scrollYProgress, [0.2, 0.6], ['0%', '100%']);

  return (
    <section ref={sectionRef} className="relative py-32 md:py-48 overflow-hidden">
      {/* Parallax marble background */}
      <motion.div className="absolute inset-0" style={{ y: bgY }}>
        <div className="absolute inset-0 marble-bg opacity-30" />
        <img
          src={FABRIC_IMG}
          alt="Luxurious black silk fabric with golden thread detailing"
          className="absolute inset-0 w-full h-full object-cover opacity-10"
        />
      </motion.div>

      {/* Gold line separator */}
      <motion.div
        className="absolute top-0 left-1/2 -translate-x-1/2 h-px"
        style={{ width: lineWidth, background: 'var(--gold)', opacity: 0.3 }}
      />

      <div className="relative z-10 max-w-4xl mx-auto px-8 md:px-16 text-center" ref={textRef}>
        <motion.span
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 1 }}
          className="meta-text block mb-12"
        >
          OUR MANIFESTO
        </motion.span>

        <motion.h2
          initial={{ opacity: 0, y: 60 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1.2, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
          className="heading-display text-4xl md:text-6xl lg:text-7xl mb-10"
          style={{ color: 'var(--carrara)' }}
        >
          We don't follow trends.{' '}
          <span style={{ color: 'var(--gold)' }}>We sculpt them.</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1, delay: 0.5 }}
          className="text-base md:text-lg leading-relaxed max-w-2xl mx-auto"
          style={{ color: 'rgba(245,245,247,0.6)', lineHeight: 1.8 }}
        >
          Born from the belief that clothing is architecture for the body, WEGOTTADO exists at the intersection
          of raw geological texture and refined sartorial precision. Each piece is a monument — hand-sculpted,
          deliberately imperfect, and unapologetically bold.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1, delay: 0.8 }}
          className="mt-14 flex items-center justify-center gap-6"
        >
          <div className="h-px w-12" style={{ background: 'var(--gold)', opacity: 0.4 }} />
          <span className="meta-text text-[10px]" style={{ color: 'var(--gold)' }}>EST. MMXXIV</span>
          <div className="h-px w-12" style={{ background: 'var(--gold)', opacity: 0.4 }} />
        </motion.div>
      </div>

      {/* Bottom gold line */}
      <motion.div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 h-px"
        style={{ width: lineWidth, background: 'var(--gold)', opacity: 0.3 }}
      />
    </section>
  );
}