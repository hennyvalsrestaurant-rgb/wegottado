import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, ArrowUpRight } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useCurrency } from './CurrencySelector';

export default function ProductSpotlight() {
  const [products, setProducts] = useState([]);
  const [active, setActive] = useState(0);
  const [loading, setLoading] = useState(true);
  const { format } = useCurrency();

  useEffect(() => {
    let mounted = true;
    base44.entities.Product.filter({ in_stock: true })
      .then((items) => { if (mounted) setProducts((Array.isArray(items) ? items : items?.items || []).filter((p) => p.image_url && p.name).slice(0, 12)); })
      .catch(() => {})
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  const change = (delta) => setActive((index) => (index + delta + products.length) % products.length);
  if (!loading && products.length === 0) return null;
  const product = products[active];
  const previous = products.length > 1 ? products[(active - 1 + products.length) % products.length] : null;
  const next = products.length > 1 ? products[(active + 1) % products.length] : null;

  return (
    <section aria-label="Featured fashion spotlight" className="relative overflow-hidden bg-[#f6f5f1] px-4 py-16 text-[#151515] sm:px-8 md:py-24">
      <div className="mx-auto max-w-7xl">
        <div className="mb-9 flex items-end justify-between gap-4">
          <div><p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.3em] text-[#626262]">WEGOTTADO / THE EDIT</p><h2 className="text-3xl font-light tracking-[-.045em] sm:text-5xl">In the spotlight.</h2></div>
          <Link to="/#showroom" className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[.12em] underline underline-offset-4">Shop collection <ArrowUpRight size={15}/></Link>
        </div>
        {loading ? <div role="status" className="h-[420px] animate-pulse rounded-xl bg-[#e8e8e5]"/> : (
          <div className="relative">
            <div className="grid min-h-[350px] grid-cols-[.45fr_1fr_.45fr] items-center gap-2 sm:min-h-[540px] sm:gap-8">
              <button disabled={!previous} onClick={() => change(-1)} className="group min-w-0 opacity-55 transition hover:opacity-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-black" aria-label="Previous product">
                {previous && <img src={previous.image_url} loading="lazy" decoding="async" alt="" className="mx-auto h-36 w-full object-contain sm:h-64"/>}
                <span className="mt-3 hidden text-xs uppercase tracking-widest sm:block">{previous?.name}</span>
              </button>
              <div className="min-w-0 text-center" aria-live="polite">
                <div className="mx-auto flex h-[260px] items-center justify-center sm:h-[440px]">
                  <img key={product?.id} src={product?.image_url} alt={product?.name} decoding="async" className="h-full w-full animate-[fadeIn_.35s_ease-out] object-contain" />
                </div>
                <h3 className="mt-5 text-base font-semibold uppercase tracking-[.075em] sm:text-xl">{product?.name}</h3>
                {product?.price != null && <p className="mt-2 text-xs text-[#666]">{format(product.price)}</p>}
                <Link to="/#showroom" className="mt-4 inline-flex min-h-10 items-center justify-center rounded-full border border-black px-6 text-[11px] font-semibold uppercase tracking-[.1em] transition hover:bg-black hover:text-white">Explore &amp; shop <ArrowUpRight size={13} className="ml-2"/></Link>
              </div>
              <button disabled={!next} onClick={() => change(1)} className="group min-w-0 opacity-55 transition hover:opacity-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-black" aria-label="Next product">
                {next && <img src={next.image_url} loading="lazy" decoding="async" alt="" className="mx-auto h-36 w-full object-contain sm:h-64"/>}
                <span className="mt-3 hidden text-xs uppercase tracking-widest sm:block">{next?.name}</span>
              </button>
            </div>
            <div className="mt-6 flex items-center justify-center gap-5">
              <button type="button" onClick={() => change(-1)} aria-label="Previous item" className="flex h-11 w-11 items-center justify-center rounded-full border border-black/25 hover:bg-black hover:text-white"><ArrowLeft size={18}/></button>
              <span className="min-w-16 text-center text-xs tabular-nums tracking-widest">{String(active + 1).padStart(2,'0')} / {String(products.length).padStart(2,'0')}</span>
              <button type="button" onClick={() => change(1)} aria-label="Next item" className="flex h-11 w-11 items-center justify-center rounded-full border border-black/25 hover:bg-black hover:text-white"><ArrowRight size={18}/></button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
