import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import HoloGrid from '@/components/wegottado/HoloGrid';
import HoloCursor from '@/components/wegottado/HoloCursor';
import SizeGuideTable from '@/components/wegottado/SizeGuideTable';
import { Mail, Clock, MessageCircle, Phone } from 'lucide-react';

const TABS = [
  { key: 'contact', label: 'Contact' },
  { key: 'shipping', label: 'Shipping' },
  { key: 'returns', label: 'Returns' },
  { key: 'size-guide', label: 'Size Guide' },
];

export default function ClientCare() {
  const [activeTab, setActiveTab] = useState('contact');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const section = params.get('section');
    if (section && TABS.some(t => t.key === section)) {
      setActiveTab(section);
    }
  }, []);

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
            SUPPORT
          </motion.span>
          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}
            className="heading-display text-5xl md:text-7xl mb-12" style={{ color: 'var(--carrara)' }}>
            Client <span className="metallic-text">Care</span>
          </motion.h1>

          {/* Tabs */}
          <div className="flex flex-wrap gap-2 mb-16">
            {TABS.map(t => (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                className="cursor-hover meta-text text-[10px] px-5 py-2.5 transition-all"
                style={{
                  border: `1px solid ${activeTab === t.key ? 'var(--neon-cyan)' : 'rgba(212,175,55,0.2)'}`,
                  color: activeTab === t.key ? 'var(--neon-cyan)' : 'rgba(245,245,247,0.5)',
                  background: activeTab === t.key ? 'rgba(0,245,255,0.06)' : 'transparent',
                }}
              >
                {t.label.toUpperCase()}
              </button>
            ))}
          </div>

          {activeTab === 'contact' && (
            <motion.div key="contact" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="space-y-10">
              <div className="flex items-start gap-4">
                <Mail size={18} style={{ color: 'var(--gold)' }} className="mt-1" />
                <div>
                  <h3 className="heading-display text-xl mb-2" style={{ color: 'var(--carrara)' }}>Email</h3>
                  <p className="text-sm" style={{ color: 'rgba(245,245,247,0.55)' }}>care@wegottado.com</p>
                  <p className="text-xs mt-1" style={{ color: 'rgba(245,245,247,0.35)' }}>We respond within 24 hours.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Phone size={18} style={{ color: 'var(--gold)' }} className="mt-1" />
                <div>
                  <h3 className="heading-display text-xl mb-2" style={{ color: 'var(--carrara)' }}>Phone</h3>
                  <p className="text-sm" style={{ color: 'rgba(245,245,247,0.55)' }}>+1 (929) 353-0741</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <MessageCircle size={18} style={{ color: 'var(--gold)' }} className="mt-1" />
                <div>
                  <h3 className="heading-display text-xl mb-2" style={{ color: 'var(--carrara)' }}>WhatsApp</h3>
                  <a
                    href="https://wa.me/19293530741"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm gold-underline cursor-hover"
                    style={{ color: 'rgba(245,245,247,0.55)' }}
                  >
                    +1 (929) 353-0741
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Clock size={18} style={{ color: 'var(--gold)' }} className="mt-1" />
                <div>
                  <h3 className="heading-display text-xl mb-2" style={{ color: 'var(--carrara)' }}>Hours</h3>
                  <p className="text-sm" style={{ color: 'rgba(245,245,247,0.55)' }}>Monday – Friday, 9:00 AM – 6:00 PM EST</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <MessageCircle size={18} style={{ color: 'var(--gold)' }} className="mt-1" />
                <div>
                  <h3 className="heading-display text-xl mb-2" style={{ color: 'var(--carrara)' }}>General Inquiries</h3>
                  <p className="text-sm leading-relaxed" style={{ color: 'rgba(245,245,247,0.55)', lineHeight: 1.9 }}>
                    For product questions, bespoke requests, or press inquiries, reach out to our client care team directly at the email above and a member of the Maison will assist you personally.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'shipping' && (
            <motion.div key="shipping" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="space-y-10">
              <div>
                <h2 className="heading-display text-2xl mb-4" style={{ color: 'var(--gold)' }}>Delivery Times</h2>
                <div className="h-px w-12 mb-5" style={{ background: 'rgba(212,175,55,0.3)' }} />
                <p className="text-sm leading-relaxed" style={{ color: 'rgba(245,245,247,0.55)', lineHeight: 1.9 }}>
                  In-stock pieces ship within 3–5 business days. Made-to-order and bespoke garments are hand-crafted and typically take 3–6 weeks before dispatch. You will receive a tracking number by email as soon as your order leaves our atelier.
                </p>
              </div>
              <div>
                <h2 className="heading-display text-2xl mb-4" style={{ color: 'var(--gold)' }}>Shipping Rates</h2>
                <div className="h-px w-12 mb-5" style={{ background: 'rgba(212,175,55,0.3)' }} />
                <p className="text-sm leading-relaxed" style={{ color: 'rgba(245,245,247,0.55)', lineHeight: 1.9 }}>
                  We ship worldwide. Domestic shipping is complimentary on all orders. International rates are calculated at checkout based on destination and are shown before payment is confirmed.
                </p>
              </div>
              <div>
                <h2 className="heading-display text-2xl mb-4" style={{ color: 'var(--gold)' }}>Customs & Duties</h2>
                <div className="h-px w-12 mb-5" style={{ background: 'rgba(212,175,55,0.3)' }} />
                <p className="text-sm leading-relaxed" style={{ color: 'rgba(245,245,247,0.55)', lineHeight: 1.9 }}>
                  International orders may be subject to customs duties and import taxes levied by the destination country. These charges are the responsibility of the recipient and are not included in the item price or shipping cost.
                </p>
              </div>
            </motion.div>
          )}

          {activeTab === 'returns' && (
            <motion.div key="returns" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="space-y-10">
              <div>
                <h2 className="heading-display text-2xl mb-4" style={{ color: 'var(--gold)' }}>Return Window</h2>
                <div className="h-px w-12 mb-5" style={{ background: 'rgba(212,175,55,0.3)' }} />
                <p className="text-sm leading-relaxed" style={{ color: 'rgba(245,245,247,0.55)', lineHeight: 1.9 }}>
                  We accept returns of unworn, unwashed, unaltered items in their original condition with tags attached within 14 days of delivery. Bespoke and made-to-order items are final sale.
                </p>
              </div>
              <div>
                <h2 className="heading-display text-2xl mb-4" style={{ color: 'var(--gold)' }}>How to Return</h2>
                <div className="h-px w-12 mb-5" style={{ background: 'rgba(212,175,55,0.3)' }} />
                <p className="text-sm leading-relaxed" style={{ color: 'rgba(245,245,247,0.55)', lineHeight: 1.9 }}>
                  To initiate a return, email our client care team with your order number. We will provide a prepaid return label and instructions for packaging your item securely.
                </p>
              </div>
              <div>
                <h2 className="heading-display text-2xl mb-4" style={{ color: 'var(--gold)' }}>Refunds</h2>
                <div className="h-px w-12 mb-5" style={{ background: 'rgba(212,175,55,0.3)' }} />
                <p className="text-sm leading-relaxed" style={{ color: 'rgba(245,245,247,0.55)', lineHeight: 1.9 }}>
                  Once your return is received and inspected, refunds are processed to the original payment method within 10 business days.
                </p>
              </div>
            </motion.div>
          )}

          {activeTab === 'size-guide' && (
            <motion.div key="size-guide" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <h2 className="heading-display text-2xl mb-4" style={{ color: 'var(--gold)' }}>Measurements</h2>
              <div className="h-px w-12 mb-8" style={{ background: 'rgba(212,175,55,0.3)' }} />
              <SizeGuideTable />
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}