import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Upload, X, Save, ImageIcon, RefreshCw, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const SECTIONS = [
  { key: 'featured', label: 'FEATURED COLLECTION', description: '1 hero image shown in the Featured Collection section', max: 1 },
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
  const [generatingText, setGeneratingText] = useState(false);
  const [generatedText, setGeneratedText] = useState(null);
  const replaceInputRef = useRef(null);
  const replaceIdxRef = useRef(null);

  useEffect(() => {
    base44.entities.SiteContent.filter({ section: section.key }).then(results => {
      if (results[0]) {
        setImages(results[0].images || []);
        setRecordId(results[0].id);
        if (results[0].labels?.[0]) {
          try { setGeneratedText(JSON.parse(results[0].labels[0])); } catch {}
        }
      }
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

  const handleGenerateText = async () => {
    if (!images[0]) return;
    setGeneratingText(true);
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a luxury fashion copywriter for WEGOTTADO, an ultra-high-end fashion house. Analyze this fashion image and generate editorial copy for the "Featured Collection" section. Return JSON with exactly these fields:
- subtitle: a short all-caps collection label like "FEATURED COLLECTION — AW26" (keep the AW26 or infer season)
- titleLine1: 2-3 words (the first part of the headline, plain)
- titleLine2: 1-2 words (the second part, shown in italic gold — make it poetic/evocative)
- description: 2-3 sentences of luxury editorial prose about the garment/collection
- bullets: array of exactly 3 short material/craft highlights (e.g. "Hand-woven silk", "24k gold thread")
- floatingLabel: a short vertical side label like "LIMITED EDITION — 001/050"

Be poetic, minimal, and ultra-luxurious. Base everything on what you see in the image.`,
      file_urls: [images[0]],
      response_json_schema: {
        type: 'object',
        properties: {
          subtitle: { type: 'string' },
          titleLine1: { type: 'string' },
          titleLine2: { type: 'string' },
          description: { type: 'string' },
          bullets: { type: 'array', items: { type: 'string' } },
          floatingLabel: { type: 'string' },
        }
      }
    });
    setGeneratedText(result);
    setGeneratingText(false);
  };

  const handleSave = async () => {
    setSaving(true);
    const labels = generatedText ? [JSON.stringify(generatedText)] : [];
    if (recordId) {
      await base44.entities.SiteContent.update(recordId, { images, labels });
    } else {
      const created = await base44.entities.SiteContent.create({ section: section.key, images, labels });
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

      <div className="flex flex-wrap gap-4">
        {images.map((url, idx) => (
          <div key={idx} className="flex flex-col gap-1.5 flex-shrink-0" style={{ width: 120 }}>
            <div className="relative" style={{ width: 120, height: 120 }}>
              <img src={url} alt={`img-${idx}`} className="w-full h-full object-cover" style={{ border: '1px solid rgba(0,245,255,0.2)', display: 'block' }} />
              {replacingIdx === idx && (
                <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'rgba(8,8,8,0.75)' }}>
                  <span className="meta-text text-[9px]" style={{ color: 'var(--neon-cyan)' }}>UPLOADING...</span>
                </div>
              )}
            </div>
            <div className="flex gap-1">
              <button onClick={() => handleReplace(idx)} title="Replace"
                className="flex-1 flex items-center justify-center gap-1 py-1.5 cursor-hover meta-text text-[9px]"
                style={{ background: 'rgba(0,245,255,0.08)', border: '1px solid rgba(0,245,255,0.25)', color: 'var(--neon-cyan)' }}>
                <RefreshCw size={10} /> REPLACE
              </button>
              <button onClick={() => removeImage(idx)} title="Delete"
                className="flex items-center justify-center px-2 cursor-hover"
                style={{ background: 'rgba(255,68,68,0.08)', border: '1px solid rgba(255,68,68,0.25)', color: '#FF4444' }}>
                <X size={11} />
              </button>
            </div>
          </div>
        ))}
        {images.length < section.max && (
          <label className="flex flex-col items-center justify-center flex-shrink-0 cursor-hover"
            style={{ width: 120, height: 120, border: '1px dashed rgba(0,245,255,0.2)', color: 'rgba(0,245,255,0.35)', background: 'rgba(0,245,255,0.02)' }}>
            {uploading ? <span className="meta-text text-[9px]">UPLOADING...</span> : <><Upload size={20} /><span className="meta-text text-[9px] mt-2">ADD IMAGE</span></>}
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

      {/* AI text generation — featured section only */}
      {section.key === 'featured' && images.length > 0 && (
        <div className="space-y-3 pt-2" style={{ borderTop: '1px solid rgba(0,245,255,0.08)' }}>
          <div className="flex items-center justify-between">
            <span className="meta-text text-[10px]" style={{ color: 'rgba(245,245,247,0.3)' }}>AI COPY GENERATION</span>
            <button
              onClick={handleGenerateText}
              disabled={generatingText}
              className="flex items-center gap-2 px-4 py-2 cursor-hover meta-text text-[10px] transition-all"
              style={{
                border: '1px solid rgba(212,175,55,0.4)',
                color: generatingText ? 'rgba(212,175,55,0.4)' : 'var(--gold)',
                background: 'rgba(212,175,55,0.06)',
              }}>
              <Sparkles size={11} />
              {generatingText ? 'GENERATING...' : generatedText ? 'REGENERATE TEXT' : 'GENERATE TEXT FROM IMAGE'}
            </button>
          </div>
          {generatedText && (
            <div className="p-4 space-y-2" style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(212,175,55,0.12)' }}>
              <p className="meta-text text-[9px]" style={{ color: 'var(--neon-cyan)' }}>{generatedText.subtitle}</p>
              <p className="heading-display text-lg" style={{ color: 'var(--carrara)' }}>
                {generatedText.titleLine1} <span className="italic" style={{ color: 'var(--gold)' }}>{generatedText.titleLine2}</span>
              </p>
              <p className="text-xs" style={{ color: 'rgba(245,245,247,0.45)', lineHeight: 1.7 }}>{generatedText.description}</p>
              <ul className="space-y-1 mt-2">
                {generatedText.bullets?.map((b, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <div className="w-4 h-px flex-shrink-0" style={{ background: 'var(--gold)' }} />
                    <span className="text-xs" style={{ color: 'rgba(245,245,247,0.5)' }}>{b}</span>
                  </li>
                ))}
              </ul>
              <p className="meta-text text-[9px] mt-1" style={{ color: 'rgba(212,175,55,0.5)' }}>{generatedText.floatingLabel}</p>
              <p className="meta-text text-[9px] mt-3" style={{ color: 'rgba(0,245,255,0.4)' }}>↑ Hit SAVE above to apply this text to the site</p>
            </div>
          )}
        </div>
      )}
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