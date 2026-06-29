import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import HoloGrid from '@/components/wegottado/HoloGrid';
import HoloCursor from '@/components/wegottado/HoloCursor';

const SECTIONS = [
  {
    title: 'Information We Collect',
    body: `We collect information you provide directly to us, such as when you create an account, make a purchase, or contact us for support. This includes your name, email address, shipping address, payment information, and any communications you send us. We also automatically collect certain information when you use our services, including your IP address, browser type, operating system, referring URLs, and information about your interactions with our site.`,
  },
  {
    title: 'How We Use Your Information',
    body: `We use the information we collect to process your orders and payments, communicate with you about your purchases, send you marketing communications (with your consent), improve and personalize your experience on our platform, comply with legal obligations, and prevent fraud and abuse. We never sell your personal data to third parties.`,
  },
  {
    title: 'Sharing of Information',
    body: `We may share your information with trusted service providers who assist us in operating our website and conducting our business — such as payment processors, shipping carriers, and analytics providers — subject to confidentiality agreements. We may also disclose information when required by law or to protect the rights, property, or safety of WEGOTTADO, our customers, or others.`,
  },
  {
    title: 'Cookies',
    body: `We use cookies and similar tracking technologies to enhance your experience, analyze site traffic, and for marketing purposes. You can control the use of cookies through your browser settings. Disabling cookies may affect the functionality of certain features on our site.`,
  },
  {
    title: 'Data Retention',
    body: `We retain your personal data for as long as necessary to provide our services, comply with legal obligations, resolve disputes, and enforce our agreements. When your data is no longer needed, we delete or anonymize it in a secure manner.`,
  },
  {
    title: 'Your Rights',
    body: `Depending on your location, you may have the right to access, correct, delete, or restrict the processing of your personal data. You may also have the right to data portability and to withdraw consent at any time. To exercise these rights, please contact us at privacy@wegottado.com.`,
  },
  {
    title: 'Security',
    body: `We implement industry-standard security measures to protect your personal information from unauthorized access, disclosure, alteration, or destruction. However, no method of transmission over the internet or electronic storage is 100% secure, and we cannot guarantee absolute security.`,
  },
  {
    title: 'Contact Us',
    body: `If you have any questions or concerns about this Privacy Policy, please contact us at: WEGOTTADO — The Kinetic Atelier. Email: privacy@wegottado.com`,
  },
];

export default function Privacy() {
  return (
    <div className="min-h-screen relative" style={{ background: 'var(--metal-dark)' }}>
      <HoloCursor />
      <HoloGrid />
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between px-6 md:px-12 py-5" style={{ borderBottom: '1px solid rgba(212,175,55,0.1)' }}>
          <Link to="/" className="heading-display text-xl cursor-hover" style={{ color: 'var(--gold)' }}>WEGOTTADO</Link>
          <Link to="/" className="meta-text text-[10px] cursor-hover" style={{ color: 'rgba(245,245,247,0.4)' }}>← BACK TO SITE</Link>
        </div>

        <div className="max-w-3xl mx-auto px-6 md:px-12 py-20">
          <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="meta-text text-[10px] block mb-4" style={{ color: 'var(--neon-cyan)' }}>
            LEGAL
          </motion.span>
          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}
            className="heading-display text-5xl md:text-7xl mb-4" style={{ color: 'var(--carrara)' }}>
            Privacy <span className="metallic-text">Policy</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            className="meta-text text-[10px] mb-16" style={{ color: 'rgba(245,245,247,0.3)' }}>
            LAST UPDATED: JUNE 2026
          </motion.p>

          <div className="space-y-12">
            {SECTIONS.map((s, i) => (
              <motion.div key={s.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * i, duration: 0.6 }}>
                <h2 className="heading-display text-2xl mb-4" style={{ color: 'var(--gold)' }}>{s.title}</h2>
                <div className="h-px w-12 mb-5" style={{ background: 'rgba(212,175,55,0.3)' }} />
                <p className="text-sm leading-relaxed" style={{ color: 'rgba(245,245,247,0.55)', lineHeight: 1.9 }}>{s.body}</p>
              </motion.div>
            ))}
          </div>

          <div className="mt-20 pt-8" style={{ borderTop: '1px solid rgba(212,175,55,0.1)' }}>
            <Link to="/terms" className="meta-text text-[10px] cursor-hover gold-underline" style={{ color: 'rgba(245,245,247,0.3)' }}>
              VIEW TERMS OF SERVICE →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}