import React, { useState } from 'react';
import { X, Plus } from 'lucide-react';

const STANDARD_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

export default function ProductSizesEditor({ sizes = [], onChange }) {
  const [customInput, setCustomInput] = useState('');

  const toggleStandard = (sz) => {
    if (sizes.includes(sz)) onChange(sizes.filter(s => s !== sz));
    else onChange([...sizes, sz]);
  };

  const addCustom = () => {
    const val = customInput.trim();
    if (!val || sizes.includes(val)) return;
    onChange([...sizes, val]);
    setCustomInput('');
  };

  const removeSize = (sz) => onChange(sizes.filter(s => s !== sz));

  const customSizes = sizes.filter(s => !STANDARD_SIZES.includes(s));

  return (
    <div>
      <label className="meta-text text-[10px] block mb-2" style={{ color: 'rgba(0,245,255,0.5)' }}>SIZES</label>

      <div className="flex flex-wrap gap-2 mb-3">
        {STANDARD_SIZES.map(sz => (
          <button
            key={sz}
            type="button"
            onClick={() => toggleStandard(sz)}
            className="cursor-hover w-10 h-10 meta-text text-[9px] flex items-center justify-center transition-all duration-200"
            style={{
              border: `1px solid ${sizes.includes(sz) ? 'var(--neon-cyan)' : 'rgba(0,245,255,0.15)'}`,
              color: sizes.includes(sz) ? 'var(--neon-cyan)' : 'rgba(245,245,247,0.35)',
              background: sizes.includes(sz) ? 'rgba(0,245,255,0.08)' : 'transparent',
            }}
          >
            {sz}
          </button>
        ))}
      </div>

      {customSizes.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {customSizes.map(sz => (
            <div key={sz} className="flex items-center gap-2 px-3 py-1.5"
              style={{ border: '1px solid rgba(212,175,55,0.3)', color: 'var(--gold)' }}>
              <span className="meta-text text-[9px]">{sz}</span>
              <button type="button" onClick={() => removeSize(sz)} className="cursor-hover">
                <X size={11} />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <input
          value={customInput}
          onChange={e => setCustomInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCustom(); } }}
          placeholder="Add custom size (e.g. 42, One Size)"
          className="holo-input flex-1 px-3 py-2 text-[11px]"
        />
        <button type="button" onClick={addCustom} className="cursor-hover px-3 py-2"
          style={{ border: '1px solid rgba(0,245,255,0.2)', color: 'var(--neon-cyan)' }}>
          <Plus size={14} />
        </button>
      </div>

      {sizes.length === 0 && (
        <p className="text-[10px] mt-2" style={{ color: 'rgba(245,245,247,0.3)' }}>
          No sizes selected — all standard sizes (XS–XXL) will be shown by default.
        </p>
      )}
    </div>
  );
}