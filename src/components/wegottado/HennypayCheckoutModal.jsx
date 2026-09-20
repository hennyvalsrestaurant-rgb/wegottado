import React from 'react';
import { ExternalLink, X } from 'lucide-react';

export default function HennypayCheckoutModal({ checkoutUrl, onClose }) {
  if (!checkoutUrl) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-3 sm:p-6" style={{ background: 'rgba(0,0,0,0.88)' }}>
      <div className="w-full max-w-5xl h-[92vh] flex flex-col" style={{ background: 'var(--metal-dark)', border: '1px solid rgba(212,175,55,0.45)', boxShadow: '0 0 60px rgba(0,0,0,0.8)' }}>
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
        <div className="flex items-center justify-between gap-4 px-4 sm:px-6 py-3" style={{ borderTop: '1px solid rgba(212,175,55,0.2)' }}>
          <span className="text-[11px]" style={{ color: 'rgba(245,245,247,0.4)' }}>If checkout does not load, open it securely in a new tab.</span>
          <a href={checkoutUrl} target="_blank" rel="noopener noreferrer" className="meta-text text-[9px] flex items-center gap-2 whitespace-nowrap cursor-hover" style={{ color: 'var(--gold)' }}>
            OPEN CHECKOUT <ExternalLink size={12} />
          </a>
        </div>
      </div>
    </div>
  );
}