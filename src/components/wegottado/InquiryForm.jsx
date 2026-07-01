import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Send, Check } from 'lucide-react';

export default function InquiryForm({ product }) {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;
    setSubmitting(true);
    setError('');
    try {
      await base44.functions.invoke('submitInquiry', {
        product_id: product.id,
        product_name: product.name,
        name: form.name,
        email: form.email,
        message: form.message,
      });
      setSent(true);
    } catch {
      setError('Could not send your inquiry. Please try again.');
    }
    setSubmitting(false);
  };

  if (sent) {
    return (
      <div className="flex items-center gap-3 py-4">
        <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(0,245,255,0.15)' }}>
          <Check size={13} style={{ color: 'var(--neon-cyan)' }} />
        </div>
        <p className="text-xs" style={{ color: 'rgba(245,245,247,0.6)' }}>
          Your inquiry has been sent. We'll be in touch soon.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <span className="meta-text text-[9px] block" style={{ color: 'rgba(245,245,247,0.3)', letterSpacing: '0.2em' }}>
        INQUIRE ABOUT THIS ITEM
      </span>
      <input
        type="text"
        placeholder="Your name"
        value={form.name}
        onChange={e => setForm({ ...form, name: e.target.value })}
        className="holo-input w-full px-3 py-2.5"
        required
      />
      <input
        type="email"
        placeholder="Your email"
        value={form.email}
        onChange={e => setForm({ ...form, email: e.target.value })}
        className="holo-input w-full px-3 py-2.5"
        required
      />
      <textarea
        placeholder="Your question about this piece..."
        value={form.message}
        onChange={e => setForm({ ...form, message: e.target.value })}
        rows={3}
        className="holo-input w-full px-3 py-2.5 resize-none"
        required
      />
      {error && <p className="text-xs" style={{ color: '#FF6B6B' }}>{error}</p>}
      <button
        type="submit"
        disabled={submitting}
        className="w-full py-3 cursor-hover meta-text text-[10px] flex items-center justify-center gap-2 transition-all"
        style={{ border: '1px solid var(--gold)', color: 'var(--gold)' }}
      >
        <Send size={12} />
        {submitting ? 'SENDING...' : 'SEND INQUIRY'}
      </button>
    </form>
  );
}