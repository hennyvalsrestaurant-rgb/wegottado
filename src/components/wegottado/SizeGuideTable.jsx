import React from 'react';

const ROWS = [
  { size: 'XS', chest: '32-33"', waist: '25-26"', hip: '34-35"' },
  { size: 'S', chest: '34-35"', waist: '27-28"', hip: '36-37"' },
  { size: 'M', chest: '36-37"', waist: '29-30"', hip: '38-39"' },
  { size: 'L', chest: '38-40"', waist: '31-33"', hip: '40-42"' },
  { size: 'XL', chest: '41-43"', waist: '34-36"', hip: '43-45"' },
  { size: 'XXL', chest: '44-46"', waist: '37-39"', hip: '46-48"' },
];

export default function SizeGuideTable() {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr style={{ borderBottom: '1px solid rgba(212,175,55,0.2)' }}>
            {['SIZE', 'CHEST', 'WAIST', 'HIP'].map(h => (
              <th key={h} className="meta-text text-[10px] py-3 pr-6" style={{ color: 'var(--gold)' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {ROWS.map(r => (
            <tr key={r.size} style={{ borderBottom: '1px solid rgba(245,245,247,0.06)' }}>
              <td className="py-3 pr-6 text-sm" style={{ color: 'var(--carrara)' }}>{r.size}</td>
              <td className="py-3 pr-6 text-sm" style={{ color: 'rgba(245,245,247,0.55)' }}>{r.chest}</td>
              <td className="py-3 pr-6 text-sm" style={{ color: 'rgba(245,245,247,0.55)' }}>{r.waist}</td>
              <td className="py-3 pr-6 text-sm" style={{ color: 'rgba(245,245,247,0.55)' }}>{r.hip}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="text-xs mt-6" style={{ color: 'rgba(245,245,247,0.35)', lineHeight: 1.8 }}>
        Measurements are approximate. For a bespoke fit, contact our client care team for personalized sizing guidance.
      </p>
    </div>
  );
}