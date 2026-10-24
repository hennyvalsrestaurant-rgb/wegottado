import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, Minus, Plus, ShoppingBag } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';
import { getAvailableColorways, productColorLabel } from '@/lib/productVariants';
import { useCurrency } from '@/components/wegottado/CurrencySelector';

const sizesDefault = ['XS','S','M','L','XL','XXL'];
const productImages = p => [...new Set([p?.front_image_url,p?.image_url,...(Array.isArray(p?.images) ? p.images : []),p?.back_image_url].filter(Boolean))];
const colorLabel = productColorLabel;

export default function ProductDetail() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { format } = useCurrency();
  const queryClient = useQueryClient();
  const [product,setProduct] = useState(null);
  const [family,setFamily] = useState([]);
  const [loading,setLoading] = useState(true);
  const [error,setError] = useState('');
  const [imageIndex,setImageIndex] = useState(0);
  const [size,setSize] = useState('');
  const [quantity,setQuantity] = useState(1);
  const [busy,setBusy] = useState(false);
  const [added,setAdded] = useState(false);
  const guard = useRef(false);
  useEffect(() => {
    let current = true;
    setLoading(true);setError('');setProduct(null);setSize('');setQuantity(1);setImageIndex(0);setAdded(false);
    Promise.all([base44.entities.Product.get(productId),queryClient.fetchQuery({
      queryKey: ['wegottado', 'available-products'],
      queryFn: async () => {
        const result = await base44.entities.Product.filter({ in_stock: true });
        const rows = Array.isArray(result) ? result : result?.items || [];
        return rows.filter(p => p.id && p.name && p.image_url).slice(0, 12);
      },
      staleTime: 5 * 60_000,
      gcTime: 15 * 60_000,
    })])
      .then(([item, rows]) => {
        if (!current) return;
        if (!item) { setError('Product not found.'); return; }
        setProduct(item);
        setFamily(getAvailableColorways(rows, item));
      }).catch(()=>{if(current)setError('Unable to load this product.');})
      .finally(()=>{if(current)setLoading(false);});
    return ()=>{current=false;};
  },[productId, queryClient]);
  const images = useMemo(()=>productImages(product),[product]);
  const sizes = product?.sizes?.length ? product.sizes : sizesDefault;
  const soldOut = product?.sold_out_sizes || [];
  const canBuy = product?.in_stock && sizes.some(s=>!soldOut.includes(s));
  async function add(goCheckout) {
    if(guard.current) return;
    if(!size || soldOut.includes(size)) {setError('Select an available size first.');return;}
    guard.current=true;setBusy(true);setError('');setAdded(false);
    try {
      let user;
      try {user=await base44.auth.me();} catch {navigate('/login');return;}
      if (!user?.id) {navigate('/login');return;}
      await base44.entities.CartItem.create({
        user_id:user.id,product_id:product.id,product_name:product.name,
        product_image:product.image_url,price:product.price,quantity,size
      });
      setAdded(true);
      if(goCheckout) navigate('/checkout');
    } catch(e) {setError(e?.response?.data?.message || e?.message || 'Could not add to your bag. Please try again.');}
    finally {guard.current=false;setBusy(false);}
  }
  return <div className="min-h-screen bg-[#f8f8f6] text-[#1a1a1a]">
    <header className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-6">
      <Link to="/" className="flex min-h-11 items-center gap-2 text-xs font-bold uppercase tracking-[.14em]"><ArrowLeft size={16}/> Back to collection</Link>
      <Link to="/checkout" aria-label="Shopping bag" className="rounded-full border border-gray-300 p-3"><ShoppingBag size={18}/></Link>
    </header>
    {loading ? <div role="status" className="mx-auto max-w-5xl animate-pulse p-12 text-center">Loading product…</div>:
      !product ? <div className="mx-auto max-w-4xl p-12 text-center" role="alert"><p>{error}</p><Link to="/" className="mt-5 inline-block underline">Back to store</Link></div>:
      <main className="mx-auto grid max-w-7xl gap-8 px-5 pb-24 pt-3 md:grid-cols-[minmax(0,1.2fr)_minmax(320px,.8fr)] md:gap-12">
        <div className="min-w-0">
          <div className="relative flex min-h-[340px] items-center justify-center bg-[#ededeb] p-6 sm:min-h-[560px]">
            {images.length>0 && <img key={images[imageIndex]} src={images[imageIndex]} alt={product.name+' image '+(imageIndex+1)} className="max-h-[570px] w-full object-contain mix-blend-multiply" decoding="async"/>}
            {images.length>1 && <>
              <button className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-3" type="button" aria-label="Previous image" onClick={()=>setImageIndex(i=>(i-1+images.length)%images.length)}><ArrowLeft size={18}/></button>
              <button className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-3" type="button" aria-label="Next image" onClick={()=>setImageIndex(i=>(i+1)%images.length)}><ArrowRight size={18}/></button>
            </>}
          </div>
          {images.length>1 && <div className="mt-3 flex flex-wrap gap-2">{images.map((img,i)=>
            <button key={img} aria-label={'View product image '+(i+1)} onClick={()=>setImageIndex(i)}
              className={'h-20 w-16 border bg-[#ececea] p-1 '+(i===imageIndex?'border-black':'border-transparent')}>
              <img src={img} alt="" loading="lazy" className="h-full w-full object-contain mix-blend-multiply"/>
            </button>)}</div>}
        </div>
        <div className="flex flex-col pt-2 md:pt-12">
          <p className="text-xs font-semibold uppercase tracking-[.25em] text-neutral-500">WEGOTTADO / NEW DROP</p>
          <h1 className="mt-5 text-3xl font-bold leading-tight tracking-tight md:text-5xl">{product.name}</h1>
          <p className="mt-4 text-xl font-medium">{format(Number(product.price) || 0)}</p>
          {product.description && <p className="mt-6 text-sm leading-7 text-neutral-600">{product.description}</p>}
          {family.length>1 && <div className="mt-8">
            <p className="text-xs font-semibold uppercase tracking-widest">Color — {colorLabel(product)}</p>
            <div className="mt-3 flex flex-wrap gap-2">{family.map(item=>
              <Link key={item.id} to={'/product/'+item.id} title={colorLabel(item)}
                className={'flex h-20 w-16 items-center justify-center border p-1 '+(item.id===product.id?'border-black':'border-neutral-200')}>
                <img src={item.image_url} alt={colorLabel(item)} className="h-full w-full object-contain mix-blend-multiply"/>
              </Link>)}</div>
          </div>}
          <div className="mt-8">
            <div className="flex items-center justify-between"><p className="text-xs font-semibold uppercase tracking-widest">Select your size</p><span className="text-xs text-neutral-500">{canBuy?'In stock':'Sold out'}</span></div>
            <div className="mt-3 flex flex-wrap gap-2">
              {sizes.map(s=><button key={s} type="button" onClick={()=>{setSize(s);setError('');}} disabled={!product.in_stock || soldOut.includes(s)}
                className={'min-h-12 min-w-12 border px-3 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-30 '+(size===s?'border-black bg-black text-white':'border-neutral-300 bg-white')}>{s}</button>)}
            </div>
          </div>
          <div className="mt-8"><p className="mb-3 text-xs font-semibold uppercase tracking-widest">Quantity</p>
            <div className="flex w-fit items-center border border-neutral-300 bg-white">
              <button type="button" className="flex h-12 w-12 items-center justify-center" disabled={quantity===1} onClick={()=>setQuantity(q=>Math.max(1,q-1))} aria-label="Decrease quantity"><Minus size={16}/></button>
              <span className="min-w-9 text-center text-sm">{quantity}</span>
              <button type="button" className="flex h-12 w-12 items-center justify-center" disabled={quantity===10} onClick={()=>setQuantity(q=>Math.min(10,q+1))} aria-label="Increase quantity"><Plus size={16}/></button>
            </div>
          </div>
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <button type="button" disabled={!canBuy||busy} onClick={()=>add(false)} className="min-h-14 border border-neutral-900 bg-white px-5 text-sm font-semibold uppercase tracking-wider disabled:opacity-50">{busy?'Adding…':'Add to cart'}</button>
            <button type="button" disabled={!canBuy||busy} onClick={()=>add(true)} className="min-h-14 bg-[#161616] px-5 text-sm font-semibold uppercase tracking-wider text-white disabled:opacity-50">Buy now</button>
          </div>
          {added && <p role="status" className="mt-4 flex items-center gap-2 text-sm text-green-800"><Check size={16}/> Added to your bag. <Link className="underline" to="/checkout">View bag</Link></p>}
          {error && <p role="alert" className="mt-4 text-sm text-red-700">{error}</p>}
          <p className="mt-8 text-xs leading-6 text-neutral-500">Availability is checked from the current WEGOTTADO product listing. Payment is completed through the existing secure checkout.</p>
        </div>
      </main>}
  </div>;
}
