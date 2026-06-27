import React from 'react';
import { motion } from 'framer-motion';

const FOOTER_LINKS = {
  'THE HOUSE': ['Our Story', 'The Atelier', 'Sustainability', 'Careers'],
  'COLLECTIONS': ['Autumn/Winter 2026', 'Spring/Summer 2026', 'The Archives', 'Made to Order'],
  'CLIENT CARE': ['Contact', 'Shipping', 'Returns', 'Size Guide'],
};

export default function Footer() {
  return (
    <footer className="relative pt-20 pb-10 px-6 md:px-[10vw]" style={{ borderTop: '1px solid rgba(212,175,55,0.1)' }}>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
        {/* Brand */}
        <div>
          <span className="heading-display text-2xl block mb-6" style={{ color: 'var(--gold)' }}>
            WEGOTTADO
          </span>
          <p className="text-xs leading-relaxed" style={{ color: 'rgba(245,245,247,0.35)', lineHeight: 1.8 }}>
            The Kinetic Atelier. Hand-sculpted luxury for those who refuse to follow.
          </p>
        </div>

        {/* Link columns */}
        {Object.entries(FOOTER_LINKS).map(([title, links]) => (
          <div key={title}>
            <span className="meta-text text-[10px] block mb-6" style={{ color: 'var(--gold)' }}>{title}</span>
            <ul className="space-y-3">
              {links.map(link => (
                <li key={link}>
                  <a
                    href={`#${link.toLowerCase().replace(/\s+/g, '-')}`}
                    className="text-xs gold-underline cursor-hover transition-colors duration-500 hover:text-[var(--gold)]"
                    style={{ color: 'rgba(245,245,247,0.4)' }}
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Bottom bar */}
      <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4"
        style={{ borderTop: '1px solid rgba(212,175,55,0.08)' }}>
        <span className="meta-text text-[10px]" style={{ color: 'rgba(245,245,247,0.2)' }}>
          © 2026 WEGOTTADO. ALL RIGHTS RESERVED.
        </span>
        <div className="flex items-center gap-8">
          {['PRIVACY', 'TERMS', 'COOKIES'].map(item => (
            <a
              key={item}
              href={`#${item.toLowerCase()}`}
              className="meta-text text-[10px] gold-underline cursor-hover transition-colors duration-500 hover:text-[var(--gold)]"
              style={{ color: 'rgba(245,245,247,0.2)' }}
            >
              {item}
            </a>
          ))}
        </div>
      </div>

      {/* Large background text */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 pointer-events-none select-none overflow-hidden w-full text-center">
        <motion.span
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 0.03 }}
          transition={{ duration: 2 }}
          className="heading-display text-[15vw] whitespace-nowrap"
          style={{ color: 'var(--carrara)' }}
        >
          WEGOTTADO
        </motion.span>
      </div>
    </footer>
  );
}