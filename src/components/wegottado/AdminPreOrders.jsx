import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Plus, Trash2, Edit2, Save, X, Clock, Upload, ImageIcon } from 'lucide-react';

const EMPTY = { name: '', category: '', price: '', description: '', image_url: '', images: [], tag: '', release_date: '', notify_enabled: true };
const CATEGORIES = ['OUTERWEAR', 'SUITING', 'EVENING WEAR', 'ACCESSORIES', 'JEWELRY', 'TOPS', 'BOTTOMS'];
const TAGS = ['', 'NEW', 'LIMITED', 'EXCLUSIVE', 'COUTURE', 'RARE'];
const MAX_IMAGES = 5;

export default function AdminPreOrders() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    const data = await base44.entities.PreOrder.list('-created_date', 100);
    setItems(data);
    setLoading(false);
  };

  const openNew = () => { setForm(EMPTY); setEditId(null); setShowForm(true); };
  const openEdit = (item) => { setForm({ ...item, price: item.price != null ? String(item.price) : '', images: item.images || [], tag: item.tag || '', release_date: item.release_date || '' }); setEditId(item.id); setShowForm(true); };
  const closeForm = () => { setShowForm(false); setEditId(null); setForm(EMPTY); };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setForm(prev => ({ ...prev, image_url: file_url }));
    setUploading(false);
  };

  const handleAdditionalImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if ((form.images || []).length >= MAX_IMAGES) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setForm(prev => ({ ...prev, images: [...(prev.images || []), file_url] }));
    setUploading(false);
    e.target.value = '';
  };

  const removeAdditionalImage = (idx) => setForm(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }));

  const handleSave = async () => {
    if (!form.name) return;
    setSaving(true);
    const data = { ...form, price: form.price ? parseFloat(form.price) : null, tag: form.tag || null, release_date: form.release_date || null };
    if (editId) {
      const updated = await base44.entities.PreOrder.update(editId, data);
      setItems(prev => prev.map(p => p.id === editId ? updated : p));
    } else {
      const created = await base44.entities.PreOrder.create(data);
      setItems(prev => [created, ...prev]);
    }
    setSaving(false);
    closeForm();
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this pre-order item?')) return;
    await base44.entities.PreOrder.delete(id);
    setItems(prev => prev.filter(p => p.id !== id));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-10">
        <div>
          <span className="meta-text text-[10px] block mb-2" style={{ color: 'var(--gold)' }}>COMING SOON</span>
          <h1 className="heading-display text-4xl" style={{ color: 'var(--carrara)' }}>
            Pre-Order <span className="metallic-text">Drops</span>
          </h1>
        </div>
        <button onClick={openNew} className="flex items-center gap-2 px-6 py-3 cursor-hover meta-text text-[10px]"
          style={{ background: 'var(--gold)', color: 'var(--obsidian)' }}>
          <Plus size={14} /> ADD PRE-ORDER
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 border border-[var(--neon-cyan)] rounded-full animate-spin" style={{ borderTopColor: 'transparent' }} />
        </div>
      ) : items.length === 0 ? (
        <div className="holo-card p-16 text-center">
          <Clock size={48} className="mx-auto mb-4 opacity-20" style={{ color: 'var(--gold)' }} />
          <p className="heading-display text-2xl" style={{ color: 'rgba(245,245,247,0.4)' }}>No pre-orders yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item, i) => (
            <motion.div key={item.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
              className="holo-card p-5 flex items-center gap-5">
              {item.image_url ? (
                <img src={item.image_url} alt={item.name} className="w-16 h-16 object-cover flex-shrink-0" />
              ) : (
                <div className="w-16 h-16 flex-shrink-0 flex items-center justify-center" style={{ border: '1px solid rgba(0,245,255,0.1)', background: 'var(--metal-mid)' }}>
                  <Clock size={20} style={{ color: 'rgba(0,245,255,0.2)' }} />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <span className="heading-display text-lg truncate" style={{ color: 'var(--carrara)' }}>{item.name}</span>
                  {item.tag && (
                    <span className="meta-text text-[9px] px-2 py-0.5" style={{ border: '1px solid rgba(212,175,55,0.3)', color: 'var(--gold)' }}>{item.tag}</span>
                  )}
                </div>
                <span className="meta-text text-[10px]" style={{ color: 'rgba(0,245,255,0.5)' }}>{item.category}</span>
              </div>
              <div className="text-right mr-6">
                {item.price ? (
                  <span className="heading-display text-2xl metallic-text">${item.price.toLocaleString()}</span>
                ) : (
                  <span className="meta-text text-[10px]" style={{ color: 'rgba(245,245,247,0.3)' }}>PRICE TBA</span>
                )}
                {item.release_date && (
                  <span className="meta-text text-[9px] block mt-1 flex items-center justify-end gap-1" style={{ color: 'rgba(212,175,55,0.6)' }}>
                    <Clock size={9} /> {new Date(item.release_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => openEdit(item)} className="cursor-hover p-2 opacity-50 hover:opacity-100"
                  style={{ border: '1px solid rgba(0,245,255,0.2)', color: 'var(--neon-cyan)' }}>
                  <Edit2 size={13} />
                </button>
                <button onClick={() => handleDelete(item.id)} className="cursor-hover p-2 opacity-50 hover:opacity-100"
                  style={{ border: '1px solid rgba(255,68,68,0.2)', color: '#FF4444' }}>
                  <Trash2 size={13} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6"
            style={{ background: 'rgba(0,0,0,0.85)' }}>
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
              className="holo-card w-full max-w-lg relative flex flex-col"
              style={{ maxHeight: '90vh' }}>
              <div className="p-8 overflow-y-auto flex-1">
                <div className="flex items-center justify-between mb-8">
                  <span className="meta-text text-[10px]" style={{ color: 'var(--gold)' }}>
                    {editId ? 'EDIT PRE-ORDER' : 'NEW PRE-ORDER'}
                  </span>
                  <button onClick={closeForm} className="cursor-hover opacity-50 hover:opacity-100"><X size={18} style={{ color: 'var(--carrara)' }} /></button>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="meta-text text-[10px] block mb-2" style={{ color: 'rgba(0,245,255,0.5)' }}>PRODUCT NAME *</label>
                    <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                      placeholder="e.g. The Eclipse Jacket" className="holo-input w-full px-4 py-3" />
                  </div>

                  {/* Primary image */}
                  <div>
                    <label className="meta-text text-[10px] block mb-2" style={{ color: 'rgba(0,245,255,0.5)' }}>PRODUCT IMAGE</label>
                    <div className="flex gap-3 items-start">
                      <div className="w-20 h-20 flex-shrink-0 flex items-center justify-center"
                        style={{ border: '1px solid rgba(0,245,255,0.15)', background: 'rgba(0,245,255,0.03)' }}>
                        {form.image_url ? <img src={form.image_url} alt="preview" className="w-full h-full object-cover" /> : <ImageIcon size={24} style={{ color: 'rgba(0,245,255,0.2)' }} />}
                      </div>
                      <div className="flex-1 space-y-2">
                        <label className="flex items-center gap-2 px-4 py-2 cursor-hover meta-text text-[10px] w-full justify-center"
                          style={{ border: '1px solid rgba(0,245,255,0.2)', color: uploading ? 'rgba(0,245,255,0.4)' : 'var(--neon-cyan)' }}>
                          <Upload size={13} />{uploading ? 'UPLOADING...' : 'UPLOAD FILE'}
                          <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
                        </label>
                        <input value={form.image_url} onChange={e => setForm(p => ({ ...p, image_url: e.target.value }))}
                          placeholder="…or paste URL" className="holo-input w-full px-3 py-2 text-[11px]" />
                      </div>
                    </div>
                  </div>

                  {/* Additional images */}
                  <div>
                    <label className="meta-text text-[10px] block mb-2" style={{ color: 'rgba(0,245,255,0.5)' }}>
                      ADDITIONAL IMAGES <span style={{ color: 'rgba(245,245,247,0.25)' }}>({(form.images || []).length}/{MAX_IMAGES})</span>
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {(form.images || []).map((url, idx) => (
                        <div key={idx} className="relative w-16 h-16 flex-shrink-0">
                          <img src={url} alt={`img-${idx}`} className="w-full h-full object-cover" style={{ border: '1px solid rgba(0,245,255,0.15)' }} />
                          <button type="button" onClick={() => removeAdditionalImage(idx)}
                            className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full flex items-center justify-center cursor-hover"
                            style={{ background: '#FF4444', color: '#fff' }}>
                            <X size={9} />
                          </button>
                        </div>
                      ))}
                      {(form.images || []).length < MAX_IMAGES && (
                        <label className="w-16 h-16 flex flex-col items-center justify-center flex-shrink-0 cursor-hover"
                          style={{ border: '1px dashed rgba(0,245,255,0.2)', color: 'rgba(0,245,255,0.35)', background: 'rgba(0,245,255,0.02)' }}>
                          <Plus size={16} />
                          <span className="meta-text text-[8px] mt-1">{uploading ? '...' : 'ADD'}</span>
                          <input type="file" accept="image/*" className="hidden" onChange={handleAdditionalImageUpload} disabled={uploading} />
                        </label>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="meta-text text-[10px] block mb-2" style={{ color: 'rgba(0,245,255,0.5)' }}>DESCRIPTION</label>
                    <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                      placeholder="Short description" rows={3} className="holo-input w-full px-4 py-3 resize-none" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="meta-text text-[10px] block mb-2" style={{ color: 'rgba(0,245,255,0.5)' }}>PRICE (USD)</label>
                      <input type="number" value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))}
                        placeholder="Leave blank if TBA" className="holo-input w-full px-4 py-3" />
                    </div>
                    <div>
                      <label className="meta-text text-[10px] block mb-2" style={{ color: 'rgba(0,245,255,0.5)' }}>RELEASE DATE</label>
                      <input type="date" value={form.release_date} onChange={e => setForm(p => ({ ...p, release_date: e.target.value }))}
                        className="holo-input w-full px-4 py-3" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="meta-text text-[10px] block mb-2" style={{ color: 'rgba(0,245,255,0.5)' }}>CATEGORY</label>
                      <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} className="holo-input w-full px-4 py-3">
                        <option value="">Select...</option>
                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="meta-text text-[10px] block mb-2" style={{ color: 'rgba(0,245,255,0.5)' }}>TAG</label>
                      <select value={form.tag} onChange={e => setForm(p => ({ ...p, tag: e.target.value }))} className="holo-input w-full px-4 py-3">
                        {TAGS.map(t => <option key={t} value={t}>{t || 'None'}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 p-6 flex-shrink-0" style={{ borderTop: '1px solid rgba(0,245,255,0.1)' }}>
                <button onClick={closeForm} className="px-6 py-3 cursor-hover meta-text text-[10px]"
                  style={{ border: '1px solid rgba(0,245,255,0.2)', color: 'rgba(245,245,247,0.5)' }}>
                  CANCEL
                </button>
                <button onClick={handleSave} disabled={saving || !form.name}
                  className="flex-1 py-3 cursor-hover meta-text text-[10px] flex items-center justify-center gap-2"
                  style={{ background: saving ? 'rgba(212,175,55,0.5)' : 'var(--gold)', color: 'var(--obsidian)', opacity: !form.name ? 0.5 : 1 }}>
                  <Save size={13} /> {saving ? 'SAVING...' : editId ? 'UPDATE' : 'CREATE PRE-ORDER'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}