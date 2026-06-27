import React, { useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';

export default function MaisonSection() {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [focused, setFocused] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email.trim()) setSubmitted(true);
  };

  return (
    <section id="maison" ref={sectionRef} className="relative py-32 md:py-48 overflow-hidden">
      {/* Marble background */}
      <div className="absolute inset-0 marble-bg opacity-15" />

      <div className="relative z-10 max-w-3xl mx-auto px-8 md:px-16 text-center">
        <motion.span
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 1 }}
          className="meta-text block mb-8"
        >
          JOIN THE MAISON
        </motion.span>

        <motion.h2
          initial={{ opacity: 0, y: 60 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1.2, delay: 0.2 }}
          className="heading-display text-4xl md:text-6xl lg:text-7xl mb-6"
          style={{ color: 'var(--carrara)' }}
        >
          Become an{' '}
          <span className="italic" style={{ color: 'var(--gold)' }}>insider</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1, delay: 0.4 }}
          className="text-base leading-relaxed mb-16"
          style={{ color: 'rgba(245,245,247,0.5)', lineHeight: 1.8 }}
        >
          First access to new collections. Private showings. Invitations to the atelier.
          We share these only with those who understand that luxury isn't loud — it's deliberate.
        </motion.p>

        <motion.form
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1, delay: 0.6 }}
          onSubmit={handleSubmit}
          className="max-w-lg mx-auto"
        >
          {!submitted ? (
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                placeholder="YOUR EMAIL ADDRESS"
                required
                className="w-full bg-transparent border-b-0 pb-4 pt-2 text-center font-mono text-xs tracking-widest uppercase outline-none"
                style={{ color: 'var(--carrara)', letterSpacing: '0.2em' }}
              />
              {/* Animated underline */}
              <div className="absolute bottom-0 left-0 right-0 h-px" style={{ background: 'var(--vein)' }} />
              <motion.div
                animate={{ scaleX: focused ? 1 : 0 }}
                transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
                className="absolute bottom-0 left-0 right-0 h-px origin-center"
                style={{ background: 'var(--gold)' }}
              />

              <motion.button
                type="submit"
                className="mt-10 px-12 py-4 border cursor-hover group relative overflow-hidden mx-auto block"
                style={{ borderColor: 'var(--gold)' }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span
                  className="relative z-10 meta-text text-xs transition-colors duration-500 group-hover:text-[var(--obsidian)]"
                  style={{ color: 'var(--gold)' }}
                >
                  REQUEST ACCESS
                </span>
                <div
                  className="absolute inset-0 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-700"
                  style={{ background: 'var(--gold)' }}
                />
              </motion.button>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center"
            >
              <div className="w-12 h-px mx-auto mb-6" style={{ background: 'var(--gold)' }} />
              <p className="heading-display text-2xl" style={{ color: 'var(--gold)' }}>
                Welcome to the Maison.
              </p>
              <p className="meta-text text-[10px] mt-4" style={{ color: 'rgba(245,245,247,0.4)' }}>
                WE WILL BE IN TOUCH
              </p>
            </motion.div>
          )}
        </motion.form>
      </div>
    </section>
  );
}