import React from 'react';
import { X } from 'lucide-react';

export default function HennypayCheckoutModal({ checkoutUrl, onClose }) {
  if (!checkoutUrl) return null;

  return (
    <div className="fixed inset-0 z-[10000]" style={{ background: 'var(--metal-dark)' }}>
      <div className="w-full h-full flex flex-col" style={{ background: 'var(--metal-dark)' }}>
        <div className="flex items-center justify-between px-4 sm:px-6 py-4" style={{ borderBottom: '1px solid rgba(212,175,55,0.2)' }}>
          <div>
            <p className="meta-text text-[10px]" style={{ color: 'var(--gold)' }}>SECURE HENNYPAY CHECKOUT</p>
            <p className="text-xs mt-1" style={{ color: 'rgba(245,245,247,0.45)' }}>Complete payment without leaving WEGOTTADO</p>
          </div>
          <button type="button" onClick={onClose} className="cursor-hover p-2" aria-label="Close Hennypay checkout" style={{ color: 'var(--carrara)' }}>
            <X size={20} />
          </button>
        </div>
        <iframe src={checkoutUrl} title="Hennypay secure checkout" className="w-full flex-1 bg-background" allow="payment" />
      </div>
    </div>
  );
}