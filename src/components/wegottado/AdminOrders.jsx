import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { ShoppingBag, Save } from 'lucide-react';

const STATUSES = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

export default function AdminOrders() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [drafts, setDrafts] = useState({});
  const [savingId, setSavingId] = useState(null);

  useEffect(() => {
    base44.entities.Order.list('-created_date', 100).then(data => { setItems(data); setLoading(false); });
  }, []);

  const setDraft = (id, field, value) => setDrafts(prev => ({ ...prev, [id]: { ...prev[id], [field]: value } }));

  const handleSave = async (item) => {
    const draft = drafts[item.id] || {};
    const data = {
      status: draft.status ?? item.status,
      tracking_number: draft.tracking_number ?? item.tracking_number ?? '',
    };
    setSavingId(item.id);
    const updated = await base44.entities.Order.update(item.id, data);
    setItems(prev => prev.map(i => i.id === item.id ? updated : i));
    setSavingId(null);
  };

  return (
    <div>
      <div className="mb-10">
        <span className="meta-text text-[10px] block mb-2" style={{ color: 'var(--neon-cyan)' }}>FULFILLMENT</span>
        <h1 className="heading-display text-4xl" style={{ color: 'var(--carrara)' }}>
          Customer <span className="metallic-text">Orders</span>
        </h1>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 border border-[var(--neon-cyan)] rounded-full animate-spin" style={{ borderTopColor: 'transparent' }} />
        </div>
      ) : items.length === 0 ? (
        <div className="holo-card p-16 text-center">
          <ShoppingBag size={48} className="mx-auto mb-4 opacity-20" />
          <p className="heading-display text-2xl" style={{ color: 'rgba(245,245,247,0.4)' }}>No orders yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item, i) => {
            const draft = drafts[item.id] || {};
            const status = draft.status ?? item.status ?? 'pending';
            const tracking = draft.tracking_number ?? item.tracking_number ?? '';
            return (
              <motion.div key={item.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                className="holo-card p-5">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <span className="heading-display text-lg" style={{ color: 'var(--carrara)' }}>Order #{item.id.slice(-8).toUpperCase()}</span>
                    <p className="meta-text text-[10px] mt-1" style={{ color: 'rgba(0,245,255,0.5)' }}>
                      {(item.items || []).length} item(s) · ${item.total?.toFixed(2)}
                    </p>
                  </div>
                  <span className="meta-text text-[9px]" style={{ color: 'rgba(245,245,247,0.3)' }}>
                    {new Date(item.created_date).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-end">
                  <div className="flex-1">
                    <label className="meta-text text-[9px] block mb-1" style={{ color: 'rgba(0,245,255,0.5)' }}>STATUS</label>
                    <select value={status} onChange={e => setDraft(item.id, 'status', e.target.value)} className="holo-input w-full px-3 py-2">
                      {STATUSES.map(s => <option key={s} value={s}>{s.toUpperCase()}</option>)}
                    </select>
                  </div>
                  <div className="flex-1">
                    <label className="meta-text text-[9px] block mb-1" style={{ color: 'rgba(0,245,255,0.5)' }}>TRACKING NUMBER</label>
                    <input value={tracking} onChange={e => setDraft(item.id, 'tracking_number', e.target.value)}
                      placeholder="Optional" className="holo-input w-full px-3 py-2" />
                  </div>
                  <button onClick={() => handleSave(item)} disabled={savingId === item.id}
                    className="flex items-center justify-center gap-2 px-5 py-2 cursor-hover meta-text text-[10px]"
                    style={{ background: 'var(--gold)', color: 'var(--obsidian)', opacity: savingId === item.id ? 0.6 : 1 }}>
                    <Save size={13} /> {savingId === item.id ? 'SAVING...' : 'SAVE'}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}