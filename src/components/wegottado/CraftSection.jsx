import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';

const CRAFT_IMG = "https://media.base44.com/images/public/6a401981c451758a55e9b4f5/a9b25a488_generated_09c8cd49.png";

const CRAFT_STATS = [
  { number: '147', label: 'HOURS PER GARMENT' },
  { number: '12', label: 'MASTER ARTISANS' },
  { number: '1', label: 'ATELIER IN FLORENCE' },
  { number: '∞', label: 'DEVOTION TO CRAFT' },
];

export default function CraftSection() {
  const sectionRef = useRef(null);
  const textRef = useRef(null);
  const isInView = useInView(textRef, { once: true, margin: '-100px' });
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start end", "end start"] });

  const imgY = useTransform(scrollYProgress, [0, 1], [60, -60]);

  return (
    <section id="craft" ref={sectionRef} className="relative py-24 md:py-40 overflow-hidden">
      {/* Marble texture background */}
      <div className="absolute inset-0 marble-bg opacity-20" />

      <div className="relative z-10 px-6 md:px-[10vw]">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-center">
          {/* Text side */}
          <div ref={textRef}>
            <motion.span
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ duration: 1 }}
              className="meta-text block mb-8"
            >
              THE CRAFT
            </motion.span>

            <motion.h2
              initial={{ opacity: 0, y: 60 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 1.2, delay: 0.2 }}
              className="heading-display text-5xl md:text-6xl lg:text-7xl mb-10"
              style={{ color: 'var(--carrara)' }}
            >
              Built by{' '}
              <span style={{ color: 'var(--gold)' }}>hands</span>,{' '}
              not machines
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 1, delay: 0.4 }}
              className="text-base leading-relaxed mb-12"
              style={{ color: 'rgba(245,245,247,0.5)', lineHeight: 1.8 }}
            >
              In our Florence atelier, twelve master artisans carry forward
              three centuries of tailoring tradition. Every stitch is intentional.
              Every seam tells a story. We reject speed in favor of permanence.
            </motion.p>

            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-8">
              {CRAFT_STATS.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 30 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.8, delay: 0.6 + i * 0.1 }}
                >
                  <span className="heading-display text-4xl md:text-5xl block mb-2" style={{ color: 'var(--gold)' }}>
                    {stat.number}
                  </span>
                  <span className="meta-text text-[10px]">{stat.label}</span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Image side */}
          <motion.div className="relative" style={{ y: imgY }}>
            <div className="relative overflow-hidden">
              <img
                src={CRAFT_IMG}
                alt="Master craftsman stitching leather by hand"
                className="w-full h-[400px] md:h-[600px] object-cover"
              />
              <div
                className="absolute inset-0"
                style={{
                  background: 'linear-gradient(to right, rgba(8,8,8,0.4), transparent 40%)',
                }}
              />
            </div>
            {/* Decorative gold corner */}
            <div className="absolute top-6 right-6 w-16 h-16">
              <div className="absolute top-0 right-0 w-full h-px" style={{ background: 'var(--gold)', opacity: 0.4 }} />
              <div className="absolute top-0 right-0 w-px h-full" style={{ background: 'var(--gold)', opacity: 0.4 }} />
            </div>
            <div className="absolute bottom-6 left-6 w-16 h-16">
              <div className="absolute bottom-0 left-0 w-full h-px" style={{ background: 'var(--gold)', opacity: 0.4 }} />
              <div className="absolute bottom-0 left-0 w-px h-full" style={{ background: 'var(--gold)', opacity: 0.4 }} />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}