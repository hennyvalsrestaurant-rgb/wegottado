import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, useSpring, animate } from 'framer-motion';

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
        y: e.clientY / window.innerHeight
      });
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  const rotateX = (mousePos.y - 0.5) * -18;
  const rotateY = (mousePos.x - 0.5) * 22;

  // Autonomous looping animation variants for the background
  const bgVariants = {
    animate: {
      scale: [1.05, 1.18, 1.08, 1.22, 1.05],
      rotate: [0, 2, -1.5, 3, 0],
      x: [0, 18, -12, 8, 0],
      y: [0, -10, 14, -6, 0],
      transition: {
        duration: 18,
        ease: 'easeInOut',
        repeat: Infinity,
        repeatType: 'loop'
      }
    }
  };
  const imgTranslateX = (mousePos.x - 0.5) * -20;
  const imgTranslateY = (mousePos.y - 0.5) * -15;

  return (
    <section id="hero" ref={sectionRef} className="relative h-screen overflow-hidden" style={{ perspective: '1200px' }}>
      {/* 3D Magical background image — outer wrapper for scroll parallax + mouse 3D tilt */}
      <motion.div
        className="absolute inset-0"
        style={{
          scale: imgScale,
          y: imgY,
          transformStyle: 'preserve-3d',
          transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
          transition: 'transform 1.2s cubic-bezier(0.25, 0.1, 0.25, 1)'
        }}>
        
        {/* Inner wrapper drives the autonomous pop/rotate/drift loop */}
        <motion.div
          className="absolute inset-0"
          variants={bgVariants}
          animate="animate"
          style={{ transformOrigin: 'center center', willChange: 'transform' }}>
          
          <img
            src={HERO_IMG}
            alt="WEGOTTADO hero"
            className="w-full h-full object-cover"
            style={{
              transform: `translate(${imgTranslateX}px, ${imgTranslateY}px) scale(1.12)`,
              transition: 'transform 1s cubic-bezier(0.25, 0.1, 0.25, 1)',
              transformOrigin: 'center center',
              filter: 'brightness(0.85) saturate(1.4)'
            }} />
          
        </motion.div>

        {/* Holographic rainbow sheen — shifts hue as image rotates */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          animate={{
            background: [
            `linear-gradient(135deg, rgba(0,245,255,0.09) 0%, rgba(123,47,255,0.12) 33%, rgba(255,0,255,0.09) 66%, rgba(212,175,55,0.11) 100%)`,
            `linear-gradient(225deg, rgba(212,175,55,0.11) 0%, rgba(0,245,255,0.09) 33%, rgba(123,47,255,0.12) 66%, rgba(255,0,255,0.09) 100%)`,
            `linear-gradient(315deg, rgba(255,0,255,0.09) 0%, rgba(212,175,55,0.11) 33%, rgba(0,245,255,0.09) 66%, rgba(123,47,255,0.12) 100%)`,
            `linear-gradient(135deg, rgba(0,245,255,0.09) 0%, rgba(123,47,255,0.12) 33%, rgba(255,0,255,0.09) 66%, rgba(212,175,55,0.11) 100%)`]

          }}
          transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
          style={{ mixBlendMode: 'screen' }} />
        

        {/* Specular highlight follows mouse */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse 60% 50% at ${mousePos.x * 100}% ${mousePos.y * 100}%, rgba(255,255,255,0.08) 0%, transparent 70%)`,
            transition: 'background 0.3s ease'
          }} />
        

        {/* Pulsing vignette pop */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          animate={{ opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          style={{ background: 'radial-gradient(ellipse 80% 80% at 50% 50%, transparent 30%, rgba(8,8,8,0.6) 100%)' }} />
        
      </motion.div>

      {/* Dark overlay */}
      <motion.div className="absolute inset-0" style={{ background: '#080808', opacity: overlayOpacity }} />

      {/* Vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 40%, rgba(8,8,8,0.8) 100%)'
        }} />
      

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center">
        {/* Meta label */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 1 }}
          className="meta-text mb-8">
          
          AUTUMN / WINTER 2026
        </motion.p>

        {/* Neon Shatter wordmark */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 1.2, ease: [0.25, 0.1, 0.25, 1] }}
          className="relative px-8 py-4 md:px-12 md:py-6"
          style={{
            background: 'rgba(3,3,12,0.92)',
            borderRadius: '32px',
            border: '1.5px solid rgba(0,245,255,0.25)',
            boxShadow: '0 0 40px rgba(0,245,255,0.35), 0 0 80px rgba(255,0,255,0.2), 0 0 140px rgba(0,245,255,0.1), inset 0 0 30px rgba(0,0,0,0.7)'
          }}>
          
          {/* Glitch layer 1 — cyan offset */}
          <motion.span
            animate={{ x: [-2, 2, -1, 3, -2], opacity: [0.6, 0.8, 0.5, 0.7, 0.6] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
            style={{
              fontFamily: 'var(--font-heading)',
              fontWeight: 700,
              fontSize: 'clamp(2.5rem, 8vw, 7rem)',
              letterSpacing: '-0.02em',
              color: 'transparent',
              WebkitTextStroke: '2px rgba(0,245,255,0.7)',
              filter: 'blur(0.5px)',
              clipPath: 'inset(0 0 50% 0)'
            }}>
            
            WEGOTTADO
          </motion.span>

          {/* Glitch layer 2 — magenta offset */}
          <motion.span
            animate={{ x: [2, -3, 1, -2, 2], opacity: [0.5, 0.7, 0.4, 0.6, 0.5] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
            style={{
              fontFamily: 'var(--font-heading)',
              fontWeight: 700,
              fontSize: 'clamp(2.5rem, 8vw, 7rem)',
              letterSpacing: '-0.02em',
              color: 'transparent',
              WebkitTextStroke: '2px rgba(255,0,255,0.6)',
              filter: 'blur(0.5px)',
              clipPath: 'inset(50% 0 0 0)'
            }}>
            
            WEGOTTADO
          </motion.span>

          {/* Main neon text */}
          <motion.span
            animate={{
              textShadow: [
              '0 0 10px #00F5FF, 0 0 30px #00F5FF, 0 0 60px rgba(0,245,255,0.5), 4px 0 0 rgba(255,0,255,0.4)',
              '0 0 14px #FF00FF, 0 0 40px #FF00FF, 0 0 80px rgba(255,0,255,0.5), -4px 0 0 rgba(0,245,255,0.4)',
              '0 0 10px #00F5FF, 0 0 30px #00F5FF, 0 0 60px rgba(0,245,255,0.5), 4px 0 0 rgba(255,0,255,0.4)']

            }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              fontFamily: 'var(--font-heading)',
              fontWeight: 700,
              fontSize: 'clamp(2.5rem, 8vw, 7rem)',
              letterSpacing: '-0.02em',
              color: 'rgba(200,235,255,0.98)',
              WebkitTextStroke: '1.5px rgba(0,245,255,0.8)',
              position: 'relative',
              zIndex: 1,
              display: 'block'
            }} className="text-3xl">
            
            WEGOTTADO
          </motion.span>

          {/* Electric arc sparks */}
          {[
          { left: '12%', top: '20%' },
          { left: '38%', top: '30%' },
          { left: '62%', top: '25%' },
          { left: '82%', top: '20%' }].
          map((pos, i) =>
          <motion.div
            key={i}
            className="absolute pointer-events-none"
            style={{ left: pos.left, top: pos.top, width: 2, height: 2 }}
            animate={{
              opacity: [0, 1, 0, 0.8, 0],
              scale: [0.5, 2, 0.3, 1.5, 0],
              boxShadow: [
              '0 0 0px transparent',
              '0 0 12px 4px rgba(0,245,255,0.9)',
              '0 0 0px transparent',
              '0 0 8px 2px rgba(255,255,255,0.8)',
              '0 0 0px transparent']

            }}
            transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.6, ease: 'easeOut' }} />

          )}

          {/* Scanline overlay */}
          <div
            className="absolute inset-0 pointer-events-none rounded-[28px] overflow-hidden"
            style={{
              backgroundImage: 'repeating-linear-gradient(0deg, rgba(0,245,255,0.03) 0px, rgba(0,245,255,0.03) 1px, transparent 1px, transparent 3px)',
              zIndex: 2
            }} />
          
        </motion.div>

        {/* Subheading */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, duration: 1 }}
          className="mt-8 text-sm md:text-base font-light tracking-widest"
          style={{ color: 'rgba(245,245,247,0.6)', fontFamily: 'var(--font-body)' }}>
          
          THE KINETIC ATELIER
        </motion.p>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.5, duration: 1 }}
          className="absolute bottom-12 flex flex-col items-center gap-3">
          
          <span className="meta-text text-[10px]">SCROLL TO DISCOVER</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
            className="w-px h-10"
            style={{ background: 'linear-gradient(to bottom, var(--gold), transparent)' }} />
          
        </motion.div>
      </div>
    </section>);

}