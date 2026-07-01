import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import HoloGrid from '@/components/wegottado/HoloGrid';
import HoloCursor from '@/components/wegottado/HoloCursor';

export default function OrderConfirmed() {
  const [orderId, setOrderId] = useState(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const oid = params.get('order_id');
    if (oid) {
      setOrderId(oid);
      // Mark order confirmed & clear cart via backend (service role required)
      (async () => {
        try {
          await base44.functions.invoke('confirm-order', { order_id: oid });
        } catch (e) {
          console.error('OrderConfirmed cleanup error:', e);
        }
        setDone(true);
      })();
    } else {
      setDone(true);
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center page-enter relative" style={{ background: 'var(--metal-dark)' }}>
      <HoloCursor />
      <HoloGrid />
      <div className="relative z-10 text-center px-6 py-16 max-w-lg mx-auto">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, delay: 0.2 }}
          className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-8"
          style={{ background: 'rgba(0,245,255,0.1)', border: '2px solid var(--neon-cyan)', boxShadow: '0 0 30px rgba(0,245,255,0.3)' }}
        >
          <Check size={36} style={{ color: 'var(--neon-cyan)' }} />
        </motion.div>

        <span className="meta-text text-[10px] block mb-4" style={{ color: 'var(--neon-cyan)' }}>ORDER CONFIRMED</span>

        <h2 className="heading-display text-5xl mb-4" style={{ color: 'var(--carrara)' }}>
          Thank you for your <span className="metallic-text">order</span>
        </h2>

        {orderId && (
          <p className="meta-text text-xs mb-4" style={{ color: 'rgba(245,245,247,0.4)' }}>
            ORDER #{orderId.slice(-8).toUpperCase()}
          </p>
        )}

        <p className="text-sm mb-12" style={{ color: 'rgba(245,245,247,0.4)', lineHeight: 1.8 }}>
          Your garments will be hand-wrapped and dispatched within 3–5 business days.
          A confirmation has been sent to your profile.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/profile" className="px-10 py-4 cursor-hover meta-text text-xs"
            style={{ border: '1px solid var(--neon-cyan)', color: 'var(--neon-cyan)' }}>
            VIEW ORDERS
          </Link>
          <Link to="/" className="px-10 py-4 cursor-hover meta-text text-xs"
            style={{ background: 'var(--gold)', color: 'var(--obsidian)' }}>
            CONTINUE SHOPPING
          </Link>
        </div>
      </div>
    </div>
  );
}