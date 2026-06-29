import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Upload, X, Save, ImageIcon, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

const SECTIONS = [
  { key: 'atelier', label: 'COLLECTION GALLERY', hint: 'Up to 6 images shown in the Atelier Gallery grid', max: 6 },
  { key: 'lookbook', label: 'LOOKBOOK', hint: '3 images: wide cinematic + 2 portrait side by side', max: 3 },
  { key: 'craft', label: 'CRAFT', hint: '1 image shown in the Craft section', max: 1 },
  { key: 'maison', label: 'MAISON BACKGROUND', hint: '1 background image for the Maison newsletter section', max: 1 },
];

function SectionEditor({ section }) {
  const [images, setImages] = useState([]);
  const [recordId, setRecordId] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [replacingIdx, setReplacingIdx] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const replaceInputRef = useRef(null);
  const replaceIdxRef = useRef(null);

  useEffect(() => {
    base44.entities.SiteContent.filter({ section: section.key }).then(results => {
      if (results[0]) { setImages(results[0].images || []); setRecordId(results[0].id); }
    }).catch(() => {});
  }, [section.key]);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || images.length >= section.max) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setImages(prev => [...prev, file_url]);
    setUploading(false);
    e.target.value = '';
  };

  const handleReplace = (idx) => {
    replaceIdxRef.current = idx;
    replaceInputRef.current.click();
  };

  const handleReplaceFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const idx = replaceIdxRef.current;
    setReplacingIdx(idx);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setImages(prev => prev.map((img, i) => i === idx ? file_url : img));
    setReplacingIdx(null);
    e.target.value = '';
  };

  const removeImage = (idx) => setImages(prev => prev.filter((_, i) => i !== idx));

  const handleSave = async () => {
    setSaving(true);
    if (recordId) {
      await base44.entities.SiteContent.update(recordId, { images });
    } else {
      const created = await base44.entities.SiteContent.create({ section: section.key, images });
      setRecordId(created.id);
    }
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="holo-card p-6 space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <span className="meta-text text-[10px] block mb-1" style={{ color: 'var(--neon-cyan)' }}>{section.label}</span>
          <p className="text-xs" style={{ color: 'rgba(245,245,247,0.3)' }}>{section.hint}</p>
        </div>
        <button onClick={handleSave} disabled={saving}
          className="flex items-center gap-2 px-4 py-2 cursor-hover meta-text text-[10px] flex-shrink-0 transition-all"
          style={{ background: saved ? 'rgba(0,255,136,0.15)' : 'var(--gold)', color: saved ? '#00FF88' : 'var(--obsidian)', border: saved ? '1px solid #00FF88' : 'none' }}>
          <Save size={12} /> {saving ? 'SAVING...' : saved ? 'SAVED ✓' : 'SAVE'}
        </button>
      </div>

      {/* Hidden input for replace */}
      <input ref={replaceInputRef} type="file" accept="image/*" className="hidden" onChange={handleReplaceFile} />

      <div className="flex flex-wrap gap-3">
        {images.map((url, idx) => (
          <div key={idx} className="relative w-24 h-24 flex-shrink-0 group">
            <img src={url} alt={`img-${idx}`} className="w-full h-full object-cover" style={{ border: '1px solid rgba(0,245,255,0.15)' }} />
            {replacingIdx === idx && (
              <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'rgba(8,8,8,0.7)' }}>
                <span className="meta-text text-[8px]" style={{ color: 'var(--neon-cyan)' }}>...</span>
              </div>
            )}
            {/* Action overlay on hover */}
            <div className="absolute inset-0 flex items-end justify-center gap-1 pb-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              style={{ background: 'linear-gradient(to top, rgba(8,8,8,0.85), transparent 60%)' }}>
              <button onClick={() => handleReplace(idx)} title="Replace image"
                className="w-7 h-7 flex items-center justify-center cursor-hover"
                style={{ background: 'rgba(0,245,255,0.15)', border: '1px solid rgba(0,245,255,0.4)', color: 'var(--neon-cyan)' }}>
                <RefreshCw size={11} />
              </button>
              <button onClick={() => removeImage(idx)} title="Remove image"
                className="w-7 h-7 flex items-center justify-center cursor-hover"
                style={{ background: 'rgba(255,68,68,0.15)', border: '1px solid rgba(255,68,68,0.4)', color: '#FF4444' }}>
                <X size={11} />
              </button>
            </div>
          </div>
        ))}
        {images.length < section.max && (
          <label className="w-20 h-20 flex flex-col items-center justify-center flex-shrink-0 cursor-hover"
            style={{ border: '1px dashed rgba(0,245,255,0.2)', color: 'rgba(0,245,255,0.35)', background: 'rgba(0,245,255,0.02)' }}>
            {uploading ? <span className="meta-text text-[8px]">...</span> : <><Upload size={16} /><span className="meta-text text-[8px] mt-1">ADD</span></>}
            <input type="file" accept="image/*" className="hidden" onChange={handleUpload} disabled={uploading} />
          </label>
        )}
        {images.length === 0 && (
          <div className="flex items-center gap-2" style={{ color: 'rgba(245,245,247,0.2)' }}>
            <ImageIcon size={16} />
            <span className="meta-text text-[10px]">NO IMAGES — DEFAULTS WILL BE USED</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminSiteContent() {
  return (
    <div className="space-y-6">
      <div className="mb-8">
        <span className="meta-text text-[10px] block mb-2" style={{ color: 'var(--neon-cyan)' }}>CONTENT MANAGER</span>
        <h2 className="heading-display text-3xl" style={{ color: 'var(--carrara)' }}>
          Site <span className="metallic-text">Images</span>
        </h2>
        <p className="text-xs mt-2" style={{ color: 'rgba(245,245,247,0.35)' }}>
          Upload custom images for each section. If a section is left empty, the default images are used.
        </p>
      </div>
      {SECTIONS.map(s => (
        <motion.div key={s.key} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <SectionEditor section={s} />
        </motion.div>
      ))}
    </div>
  );
}