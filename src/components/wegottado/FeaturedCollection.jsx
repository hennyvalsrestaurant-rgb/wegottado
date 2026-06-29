import React, { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { base44 } from '@/api/base44Client';

const DEFAULT_IMG = "https://media.base44.com/images/public/6a401981c451758a55e9b4f5/0f2fef579_generated_d7ac6c34.png";

const DEFAULT_TEXT = {
  subtitle: 'FEATURED COLLECTION — AW26',
  titleLine1: 'The Ivory',
  titleLine2: 'Doctrine',
  description: "Fifty pieces. No more. Each garment in The Ivory Doctrine is cut from a single bolt of hand-woven silk, sourced from the last atelier in Kyoto that still operates a century-old loom. When it's gone, it's gone.",
  bullets: ['Hand-woven Kyoto silk', 'Gold-leaf detailing', 'Numbered certificate of authenticity'],
  floatingLabel: 'LIMITED EDITION — 001/050',
};

export default function FeaturedCollection() {
  const [imgSrc, setImgSrc] = useState(DEFAULT_IMG);
  const [text, setText] = useState(DEFAULT_TEXT);

  useEffect(() => {
    base44.entities.SiteContent.filter({ section: 'featured' }).then(records => {
      const record = records?.[0];
      if (record?.images?.[0]) setImgSrc(record.images[0]);
      if (record?.labels?.[0]) {
        try { setText(JSON.parse(record.labels[0])); } catch {}
      }
    }).catch(() => {});
  }, []);

  const sectionRef = useRef(null);
  const textRef = useRef(null);
  const isInView = useInView(textRef, { once: true, margin: '-100px' });
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start end", "end start"] });

  const imgY = useTransform(scrollYProgress, [0, 1], [80, -80]);
  const textY = useTransform(scrollYProgress, [0, 1], [40, -40]);

  return (
    <section id="collections" ref={sectionRef} className="relative py-24 md:py-40 overflow-hidden">
      <div className="px-6 md:px-[10vw]">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-center">
          {/* Image side */}
          <motion.div className="relative" style={{ y: imgY }}>
            <div className="relative overflow-hidden glossy-reflection">
              <img
                src={imgSrc}
                alt={text.titleLine1 + ' ' + text.titleLine2}
                className="w-full h-[500px] md:h-[700px] object-cover"
              />
              {/* Gold frame */}
              <div
                className="absolute inset-4 border pointer-events-none"
                style={{ borderColor: 'rgba(212,175,55,0.15)' }}
              />
            </div>
            {/* Floating label */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 1, delay: 0.5 }}
              className="absolute -right-4 md:-right-8 top-1/2 -translate-y-1/2 -rotate-90"
            >
              <span className="meta-text text-[10px]" style={{ color: 'var(--gold)' }}>
                {text.floatingLabel}
              </span>
            </motion.div>
          </motion.div>

          {/* Text side */}
          <motion.div ref={textRef} className="relative" style={{ y: textY }}>
            <motion.span
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ duration: 1 }}
              className="meta-text block mb-8"
            >
              {text.subtitle}
            </motion.span>

            <motion.h2
              initial={{ opacity: 0, y: 60 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 1.2, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
              className="heading-display text-5xl md:text-6xl lg:text-7xl mb-8"
              style={{ color: 'var(--carrara)' }}
            >
              {text.titleLine1}{' '}
              <span className="italic" style={{ color: 'var(--gold)' }}>{text.titleLine2}</span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 1, delay: 0.4 }}
              className="text-base leading-relaxed mb-8"
              style={{ color: 'rgba(245,245,247,0.5)', lineHeight: 1.8 }}
            >
              {text.description}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 1, delay: 0.6 }}
              className="space-y-4"
            >
              {text.bullets.map((item, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-6 h-px" style={{ background: 'var(--gold)' }} />
                  <span className="text-sm" style={{ color: 'rgba(245,245,247,0.7)' }}>{item}</span>
                </div>
              ))}
            </motion.div>

            <motion.button
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 1, delay: 0.8 }}
              className="mt-12 px-10 py-4 border cursor-hover group relative overflow-hidden"
              style={{ borderColor: 'var(--gold)' }}
            >
              <span className="relative z-10 meta-text text-xs transition-colors duration-500 group-hover:text-[var(--obsidian)]"
                style={{ color: 'var(--gold)' }}>
                EXPLORE THE COLLECTION
              </span>
              <div className="absolute inset-0 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-700"
                style={{ background: 'var(--gold)' }} />
            </motion.button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}