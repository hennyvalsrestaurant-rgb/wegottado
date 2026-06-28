import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

const HERO_IMG = "https://media.base44.com/images/public/6a401981c451758a55e9b4f5/b4cbae21f_generated_image.png";

export default function HeroSection() {
  const sectionRef = useRef(null);
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end start"] });

  const imgScale = useTransform(scrollYProgress, [0, 1], [1.05, 1.2]);
  const imgY = useTransform(scrollYProgress, [0, 1], [0, 100]);
  const textLeftX = useTransform(scrollYProgress, [0, 0.5], [0, -200]);
  const textRightX = useTransform(scrollYProgress, [0, 0.5], [0, 200]);
  const overlayOpacity = useTransform(scrollYProgress, [0, 0.6], [0.45, 0.85]);

  useEffect(() => {
    const onMove = (e) => {
      setMousePos({
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      });
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  const imgTranslateX = (mousePos.x - 0.5) * -20;
  const imgTranslateY = (mousePos.y - 0.5) * -15;

  return (
    <section id="hero" ref={sectionRef} className="relative h-screen overflow-hidden">
      {/* Background image with parallax + mouse tracking */}
      <motion.div
        className="absolute inset-0"
        style={{ scale: imgScale, y: imgY }}
      >
        <img
          src={HERO_IMG}
          alt="WEGOTTADO hero editorial fashion photograph"
          className="w-full h-full object-cover"
          style={{
            transform: `translate(${imgTranslateX}px, ${imgTranslateY}px) rotateZ(90deg)`,
            transition: 'transform 0.8s cubic-bezier(0.25, 0.1, 0.25, 1)',
            transformOrigin: 'center center',
          }}
        />
      </motion.div>

      {/* Dark overlay */}
      <motion.div className="absolute inset-0" style={{ background: '#080808', opacity: overlayOpacity }} />

      {/* Vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 40%, rgba(8,8,8,0.8) 100%)',
        }}
      />

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center">
        {/* Meta label */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 1 }}
          className="meta-text mb-8"
        >
          AUTUMN / WINTER 2026
        </motion.p>

        {/* Split wordmark */}
        <div className="flex items-center overflow-hidden">
          <motion.span
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 1.2, ease: [0.25, 0.1, 0.25, 1] }}
            style={{ x: textLeftX, color: 'var(--carrara)' }}
            className="heading-display text-6xl sm:text-7xl md:text-8xl lg:text-[10vw]"
          >
            WEGOTTA
          </motion.span>
          <motion.span
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 1.2, ease: [0.25, 0.1, 0.25, 1] }}
            style={{ x: textRightX, color: 'var(--gold)' }}
            className="heading-display text-6xl sm:text-7xl md:text-8xl lg:text-[10vw]"
          >
            DO
          </motion.span>
        </div>

        {/* Subheading */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, duration: 1 }}
          className="mt-8 text-sm md:text-base font-light tracking-widest"
          style={{ color: 'rgba(245,245,247,0.6)', fontFamily: 'var(--font-body)' }}
        >
          THE KINETIC ATELIER
        </motion.p>

        {/* Floating info panel */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 2, duration: 0.8 }}
          className="absolute top-1/2 right-8 -translate-y-1/2 z-20 p-5 max-w-[220px]"
          style={{
            background: 'rgba(13,13,20,0.85)',
            border: '1px solid rgba(0,245,255,0.2)',
            backdropFilter: 'blur(12px)',
            boxShadow: '0 0 30px rgba(0,245,255,0.08)',
          }}
        >
          <p className="meta-text text-[9px] mb-3" style={{ color: 'var(--neon-cyan)' }}>TRANSFORM PARAMETERS</p>
          {[
            { label: 'Axis', value: 'X, Y, or Z (camera / world / local)' },
            { label: 'Angle', value: 'Degrees — positive = CCW (right‑hand rule)' },
            { label: 'Pivot', value: 'Object center, world origin, custom point, or bbox corner' },
            { label: 'Space', value: 'Local / object · World / global · Camera' },
            { label: 'Interpolation', value: 'Instant or animated keyframes (duration, easing)' },
            { label: 'Output', value: 'Overwrite, new layer / object, or export PNG / OBJ' },
          ].map(({ label, value }) => (
            <div key={label} className="mb-3 last:mb-0">
              <span className="meta-text text-[9px] block mb-0.5" style={{ color: 'var(--gold)' }}>{label}</span>
              <span className="text-[10px] leading-relaxed" style={{ color: 'rgba(245,245,247,0.55)', fontFamily: 'var(--font-mono)' }}>{value}</span>
            </div>
          ))}
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.5, duration: 1 }}
          className="absolute bottom-12 flex flex-col items-center gap-3"
        >
          <span className="meta-text text-[10px]">SCROLL TO DISCOVER</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
            className="w-px h-10"
            style={{ background: 'linear-gradient(to bottom, var(--gold), transparent)' }}
          />
        </motion.div>
      </div>
    </section>
  );
}