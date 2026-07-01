import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { X, Zap } from 'lucide-react';

const PRESET_AMOUNTS = [25, 50, 100, 250];

export default function WalletTopUpModal({ onClose }) {
  const [amount, setAmount] = useState(50);
  const [custom, setCustom] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const finalAmount = custom ? parseFloat(custom) : amount;

  const handleTopUp = async () => {
    setError(null);
    if (!finalAmount || finalAmount < 0.5) {
      setError('Minimum top-up amount is $0.50');
      return;
    }
    setLoading(true);
    try {
      const res = await base44.functions.invoke('wallet-topup', { amount: finalAmount });
      if (res.data.redirectUrl) {
        window.location.href = res.data.redirectUrl;
      } else {
        setError(res.data.error || 'Could not start checkout. Please try again.');
        setLoading(false);
      }
    } catch (err) {
      setError(err?.response?.data?.error || 'Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-6" style={{ background: 'rgba(0,0,0,0.85)' }}>
        <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
          className="holo-card w-full max-w-md p-8">
          <div className="flex items-center justify-between mb-6">
            <span className="meta-text text-[10px]" style={{ color: 'var(--neon-cyan)' }}>ADD FUNDS</span>
            <button onClick={onClose} className="cursor-hover opacity-50 hover:opacity-100">
              <X size={18} style={{ color: 'var(--carrara)' }} />
            </button>
          </div>

          <div className="grid grid-cols-4 gap-2 mb-4">
            {PRESET_AMOUNTS.map(a => (
              <button key={a} onClick={() => { setAmount(a); setCustom(''); }}
                className="py-3 cursor-hover meta-text text-xs transition-all"
                style={{
                  border: `1px solid ${!custom && amount === a ? 'var(--gold)' : 'rgba(0,245,255,0.15)'}`,
                  color: !custom && amount === a ? 'var(--gold)' : 'rgba(245,245,247,0.6)',
                  background: !custom && amount === a ? 'rgba(212,175,55,0.08)' : 'transparent',
                }}>
                ${a}
              </button>
            ))}
          </div>

          <label className="meta-text text-[10px] block mb-2" style={{ color: 'rgba(0,245,255,0.5)' }}>OR ENTER CUSTOM AMOUNT</label>
          <input type="number" value={custom} onChange={e => setCustom(e.target.value)}
            placeholder="0.00" className="holo-input w-full px-4 py-3 mb-6" />

          {error && <p className="text-xs mb-4" style={{ color: '#FF6B6B' }}>{error}</p>}

          <button onClick={handleTopUp} disabled={loading}
            className="w-full py-4 cursor-hover meta-text text-xs flex items-center justify-center gap-2"
            style={{ background: 'var(--gold)', color: 'var(--obsidian)', opacity: loading ? 0.6 : 1 }}>
            <Zap size={14} /> {loading ? 'REDIRECTING...' : `ADD $${finalAmount ? finalAmount.toLocaleString() : '0'} TO WALLET`}
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}