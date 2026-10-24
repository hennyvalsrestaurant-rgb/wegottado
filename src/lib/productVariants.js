/** Normalize product family names so punctuation and spacing do not split genuine colorways. */
export function productFamilyKey(product) {
  const name = String(product?.name || '');
  const family = name.split(/\s*[-–—]\s*/)[0];
  return family.normalize('NFKD')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

export function productColorLabel(product) {
  const explicit = String(product?.color_label || '').trim();
  if (explicit) return explicit;
  const parts = String(product?.name || '').split(/\s*[-–—]\s*/);
  const suffix = parts.slice(1).join(' - ').trim();
  // A product descriptor (e.g. "Sleeveless T-shirt") is not a color.
  const colorWords = suffix.match(/\b(?:black|white|green|blue|pink|yellow|red|cream|gray|grey|orange|purple|brown)\b/gi);
  return colorWords?.length ? [...new Set(colorWords.map(x => x.toLowerCase()))].map(x => x.charAt(0).toUpperCase() + x.slice(1)).join(' & ') : 'Original';
}

export function getAvailableColorways(products, selected) {
  if (!selected) return [];
  const key = productFamilyKey(selected);
  return products.filter(item => item?.in_stock !== false && productFamilyKey(item) === key);
}
