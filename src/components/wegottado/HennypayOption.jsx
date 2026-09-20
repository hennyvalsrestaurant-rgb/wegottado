import React from 'react';
import { CreditCard } from 'lucide-react';

export default function HennypayOption({ onPay, disabled }) {
  return (
    <button
      type="button"
      onClick={onPay}
      disabled={disabled}
      className="w-full py-5 px-6 cursor-hover flex items-center justify-between transition-all duration-300 holo-card"
      style={{ border: '1px solid rgba(212,175,55,0.4)', opacity: disabled ? 0.6 : 1 }}
    >
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 flex items-center justify-center"
          style={{ background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.3)' }}>
          <CreditCard size={18} style={{ color: 'var(--gold)' }} />
        </div>
        <div className="text-left">
          <p className="meta-text text-[11px]" style={{ color: 'var(--gold)' }}>HENNYPAY</p>
          <p className="text-xs mt-0.5" style={{ color: 'rgba(245,245,247,0.4)' }}>Secure hosted card checkout</p>
        </div>
      </div>
      <span className="meta-text text-[10px]" style={{ color: 'rgba(245,245,247,0.3)' }}>
        {disabled ? 'REDIRECTING...' : '→'}
      </span>
    </button>
  );
}