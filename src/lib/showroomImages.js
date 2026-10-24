// Lightweight showroom previews for the verified current product imagery.
// If a merchant updates a product photo, fall back to its new original URL
// instead of accidentally showing a stale optimized image.
const imageMap = {
  '6a4390acecc43f5f44239531': 'deacd934f_5bdb0d4f-ab44-495c-80e7-235d4777d66d.JPG',
  '6a438eeafc9091fb132573a7': '256c99221_b0c575e3-27c2-420e-9107-c8479206807a.JPG',
  '6a438d17d2f9b1e6f24ff7eb': '108818044_12890633-7081-4520-ae14-8479052ad5e6.JPG',
  '6a40873cc5df50e4d330f6a3': 'e4328f29a_IMG_1124.JPG',
  '6a40307cada7252e2eeae719': '6369cfec8_IMG_1126.JPG',
};

export function showroomImage(product) {
  if (!product?.image_url) return product?.image_url;
  const original = imageMap[product.id];
  return original && product.image_url.endsWith(original)
    ? `/images/showroom/${product.id}.webp`
    : product.image_url;
}
