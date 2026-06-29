import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import HoloGrid from '@/components/wegottado/HoloGrid';
import HoloCursor from '@/components/wegottado/HoloCursor';

const SECTIONS = [
  {
    title: 'Acceptance of Terms',
    body: `By accessing or using the WEGOTTADO website and services, you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree to these terms, please do not use our services. We reserve the right to update these terms at any time, and your continued use of our services constitutes acceptance of any changes.`,
  },
  {
    title: 'Use of Our Services',
    body: `You may use our services only for lawful purposes and in accordance with these Terms. You agree not to use our services in any way that violates applicable laws or regulations, to transmit any unsolicited advertising or spam, to impersonate any person or entity, or to engage in any conduct that restricts or inhibits anyone's use or enjoyment of our services.`,
  },
  {
    title: 'Products and Pricing',
    body: `All products are subject to availability. We reserve the right to discontinue any product at any time. Prices are listed in USD and are subject to change without notice. We make every effort to display accurate product information, but we do not warrant that product descriptions or other content on our site are accurate, complete, or error-free.`,
  },
  {
    title: 'Orders and Payment',
    body: `By placing an order, you represent that you are authorized to use the payment method provided. All payments are processed securely. We reserve the right to refuse or cancel any order for any reason, including but not limited to product availability, errors in pricing, or suspected fraud. You will be notified if your order is cancelled and any charges will be refunded.`,
  },
  {
    title: 'Shipping and Delivery',
    body: `We ship to most countries worldwide. Delivery times and costs vary by destination. Risk of loss and title for items pass to you upon delivery. WEGOTTADO is not responsible for delays caused by customs clearance processes or other factors outside our control.`,
  },
  {
    title: 'Returns and Exchanges',
    body: `We accept returns of unworn, unwashed, unaltered items in their original condition with tags attached within 14 days of delivery. Bespoke and made-to-order items are final sale. To initiate a return, please contact our client care team. Refunds will be processed to the original payment method within 10 business days of receiving the returned item.`,
  },
  {
    title: 'Intellectual Property',
    body: `All content on this site — including text, graphics, images, logos, and software — is the property of WEGOTTADO and is protected by intellectual property laws. You may not reproduce, distribute, or create derivative works without our prior written consent.`,
  },
  {
    title: 'Limitation of Liability',
    body: `To the maximum extent permitted by law, WEGOTTADO shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of our services or products. Our total liability for any claims related to our services shall not exceed the amount you paid for the specific product or service giving rise to the claim.`,
  },
  {
    title: 'Governing Law',
    body: `These Terms shall be governed by and construed in accordance with the laws of the State of New York, without regard to its conflict of law provisions. Any disputes arising under these Terms shall be subject to the exclusive jurisdiction of the courts located in New York, New York.`,
  },
  {
    title: 'Contact',
    body: `For questions about these Terms of Service, please contact us at: WEGOTTADO — The Kinetic Atelier. Email: legal@wegottado.com`,
  },
];

export default function Terms() {
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
            Terms of <span className="metallic-text">Service</span>
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
            <Link to="/privacy" className="meta-text text-[10px] cursor-hover gold-underline" style={{ color: 'rgba(245,245,247,0.3)' }}>
              VIEW PRIVACY POLICY →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}