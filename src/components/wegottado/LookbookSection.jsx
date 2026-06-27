import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';

const LOOKBOOK_WIDE = "https://media.base44.com/images/public/6a401981c451758a55e9b4f5/dff2ee002_generated_168a973b.png";
const LOOKBOOK_PORTRAIT = "https://media.base44.com/images/public/6a401981c451758a55e9b4f5/4aa583f5f_generated_b919dd87.png";
const LOOKBOOK_SUIT = "https://media.base44.com/images/public/6a401981c451758a55e9b4f5/9367500c8_generated_ca3d562c.png";

export default function LookbookSection() {
  const sectionRef = useRef(null);
  const titleRef = useRef(null);
  const titleInView = useInView(titleRef, { once: true, margin: '-100px' });
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start end", "end start"] });

  const wideY = useTransform(scrollYProgress, [0, 1], [40, -40]);
  const leftY = useTransform(scrollYProgress, [0, 1], [80, -30]);
  const rightY = useTransform(scrollYProgress, [0, 1], [20, -60]);

  return (
    <section id="lookbook" ref={sectionRef} className="relative py-24 md:py-40 px-6 md:px-[10vw]">
      <div ref={titleRef} className="mb-16 md:mb-24 text-center">
        <motion.span
          initial={{ opacity: 0 }}
          animate={titleInView ? { opacity: 1 } : {}}
          transition={{ duration: 1 }}
          className="meta-text block mb-6"
        >
          EDITORIAL LOOKBOOK
        </motion.span>
        <motion.h2
          initial={{ opacity: 0, y: 60 }}
          animate={titleInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1.2, delay: 0.2 }}
          className="heading-display text-5xl md:text-7xl lg:text-8xl"
          style={{ color: 'var(--carrara)' }}
        >
          The <span className="italic" style={{ color: 'var(--gold)' }}>Sculpted</span> Void
        </motion.h2>
      </div>

      {/* Wide cinematic image */}
      <motion.div className="relative mb-8 overflow-hidden" style={{ y: wideY }}>
        <div className="relative" style={{ paddingTop: '42%' }}>
          <img
            src={LOOKBOOK_WIDE}
            alt="Model wearing dramatic velvet cape in desert landscape"
            className="absolute inset-0 w-full h-full object-cover"
          />
          {/* Letterbox bars */}
          <div className="absolute top-0 left-0 right-0 h-8 md:h-12" style={{ background: 'var(--obsidian)' }} />
          <div className="absolute bottom-0 left-0 right-0 h-8 md:h-12" style={{ background: 'var(--obsidian)' }} />
          {/* Center text */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="heading-display text-3xl md:text-5xl lg:text-6xl" style={{ color: 'rgba(245,245,247,0.15)' }}>
              WEGOTTADO
            </span>
          </div>
        </div>
      </motion.div>

      {/* Two column layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <motion.div className="relative overflow-hidden group cursor-hover" style={{ y: leftY }}>
          <img
            src={LOOKBOOK_PORTRAIT}
            alt="Fashion editorial portrait with gold chain"
            className="w-full h-[500px] md:h-[650px] object-cover transition-transform duration-1000 group-hover:scale-105"
          />
          <div className="absolute inset-0 transition-opacity duration-700"
            style={{ background: 'linear-gradient(to top, rgba(8,8,8,0.8) 0%, transparent 50%)' }} />
          <div className="absolute bottom-8 left-8">
            <span className="meta-text text-[10px] block mb-2">LOOK 01</span>
            <span className="heading-display text-2xl" style={{ color: 'var(--carrara)' }}>The Golden Thread</span>
          </div>
        </motion.div>

        <motion.div className="relative overflow-hidden group cursor-hover" style={{ y: rightY }}>
          <img
            src={LOOKBOOK_SUIT}
            alt="Tailored black suit editorial fashion"
            className="w-full h-[500px] md:h-[650px] object-cover transition-transform duration-1000 group-hover:scale-105"
          />
          <div className="absolute inset-0 transition-opacity duration-700"
            style={{ background: 'linear-gradient(to top, rgba(8,8,8,0.8) 0%, transparent 50%)' }} />
          <div className="absolute bottom-8 left-8">
            <span className="meta-text text-[10px] block mb-2">LOOK 02</span>
            <span className="heading-display text-2xl" style={{ color: 'var(--carrara)' }}>The Monolith</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}