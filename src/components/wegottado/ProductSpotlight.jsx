import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useCurrency } from './CurrencySelector';

export default function ProductSpotlight() {
 const [products,setProducts]=useState([]), [active,setActive]=useState(0), [view,setView]=useState('rack'), [detail,setDetail]=useState(false), [size,setSize]=useState(''), [busy,setBusy]=useState(false), [message,setMessage]=useState(''), [loading,setLoading]=useState(true);
 const {format}=useCurrency();
 useEffect(()=>{let live=true; base44.entities.Product.filter({in_stock:true}).then(data=>{if(live)setProducts((Array.isArray(data)?data:data?.items||[]).filter(p=>p.name&&p.image_url).slice(0,12))}).catch(()=>{}).finally(()=>{if(live)setLoading(false)});return()=>{live=false}},[]);
 const select=i=>{setActive(i);setView('single');setDetail(false);setSize('');setMessage('')};
 const move=d=>select((active+d+products.length)%products.length);
 const p=products[active];
 async function add(){if(!size){setMessage('Choose a size.');return} if(busy)return;setBusy(true);setMessage('');try{const user=await base44.auth.me();if(!user?.id)throw Error('Please sign in first.');await base44.entities.CartItem.create({user_id:user.id,product_id:p.id,product_name:p.name,product_image:p.image_url,price:p.price,quantity:1,size});setMessage('Added to bag!')}catch(e){setMessage(e?.message||'Could not add to bag.')}finally{setBusy(false)}}
 if(!loading&&!products.length)return null;
 return <section className="bg-[#fafaf8] px-4 py-12 text-[#151515] sm:px-8" aria-label="WEGOTTADO interactive clothing collection">
  <div className="mx-auto max-w-7xl">
   <div className="flex items-center justify-between border-b border-black/10 pb-4 text-xs uppercase tracking-[.2em]"><span>WEGOTTADO — The Collection</span>{view==='single'&&<button onClick={()=>setView('rack')} className="flex min-h-11 items-center gap-2"><X size={16}/> Back to rack</button>}</div>
   {loading?<div className="h-[410px] animate-pulse bg-gray-100" role="status"/>:<AnimatePresence mode="wait">
    {view==='rack'?<motion.div key="rack" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0,scale:1.1}} transition={{duration:.45}} className="flex min-h-[390px] flex-col items-center justify-center py-12 sm:min-h-[580px]">
     <div className="relative flex w-full max-w-5xl items-end justify-center overflow-x-auto pt-10 pb-6"><div className="pointer-events-none absolute left-0 right-0 top-10 h-[3px] bg-gray-500"/>{products.map((item,i)=><button key={item.id} type="button" onClick={()=>select(i)} aria-label={`Select ${item.name}`} className="-mx-1 flex min-w-[75px] max-w-40 flex-1 flex-col items-center transition-transform duration-300 hover:-translate-y-4 focus-visible:-translate-y-4"><span className="mb-1 text-2xl text-gray-500">⌃</span><img src={item.image_url} loading="lazy" decoding="async" alt={item.name} className="h-40 w-full object-contain drop-shadow-lg sm:h-72"/></button>)}</div>
     <p className="mt-5 text-center text-xs uppercase tracking-widest">Select a garment to see it up close</p>
    </motion.div>:<motion.div key="single" initial={{opacity:0,scale:.9}} animate={{opacity:1,scale:1}} exit={{opacity:0}} transition={{duration:.45}} className="relative flex min-h-[450px] flex-col justify-center py-8 sm:min-h-[620px]">
      <div className="relative flex items-center justify-between gap-1">
       <button onClick={()=>move(-1)} aria-label="Previous garment" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-gray-300"><ArrowLeft/></button>
       <div className="flex min-w-0 flex-1 flex-col items-center">
        <AnimatePresence mode="wait"><motion.img key={p.id} src={p.image_url} alt={p.name} initial={{x:50,opacity:0}} animate={{x:0,opacity:1}} exit={{x:-50,opacity:0}} transition={{duration:.3}} className="h-[270px] w-full object-contain sm:h-[440px]"/></AnimatePresence>
        <h2 className="mt-5 text-center text-lg font-semibold uppercase tracking-wider">{p.name}</h2>
        <p className="mt-2 text-sm">{format(p.price||0)}</p>
        <button type="button" onClick={()=>setDetail(true)} className="mt-4 min-h-11 rounded-full bg-black px-7 text-xs font-semibold uppercase tracking-widest text-white">View details / Shop</button>
       </div>
       <button onClick={()=>move(1)} aria-label="Next garment" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-gray-300"><ArrowRight/></button>
      </div>
      <div className="mt-5 flex justify-center gap-2">{products.slice(0,7).map((item,i)=><button key={item.id} onClick={()=>select(i)} aria-label={`Select ${item.name}`} className={`h-14 w-12 border p-1 ${active===i?'border-black':'border-transparent'}`}><img src={item.image_url} alt="" className="h-full w-full object-contain"/></button>)}</div>
      <p className="mt-3 text-center text-xs tracking-widest">{active+1} / {products.length}</p>
     </motion.div>}
   </AnimatePresence>}
  </div>
  {detail&&p&&<div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 px-4" onMouseDown={e=>{if(e.target===e.currentTarget)setDetail(false)}}>
   <div role="dialog" aria-modal="true" aria-labelledby="spotlight-title" className="relative grid max-h-[90dvh] w-full max-w-4xl overflow-y-auto bg-white p-5 sm:grid-cols-2 sm:p-9">
    <button onClick={()=>setDetail(false)} aria-label="Close details" className="absolute right-3 top-3 p-2"><X/></button>
    <img src={p.image_url} alt={p.name} className="h-64 w-full object-contain sm:h-[440px]"/>
    <div className="flex flex-col justify-center gap-4 p-4"><h3 id="spotlight-title" className="text-2xl font-semibold uppercase">{p.name}</h3><p>{format(p.price||0)}</p><p className="text-sm text-gray-600">{p.description}</p><p className="text-xs font-semibold uppercase">Select size</p>
     <div className="flex flex-wrap gap-2">{(Array.isArray(p.sizes)&&p.sizes.length?p.sizes:['XS','S','M','L','XL']).map(s=><button key={s} type="button" onClick={()=>setSize(s)} className={`min-h-11 min-w-11 border px-2 ${size===s?'bg-black text-white':'border-gray-300'}`}>{s}</button>)}</div>
     <button onClick={add} disabled={busy} className="min-h-12 bg-black px-5 text-white disabled:opacity-50">{busy?'Adding…':'Add to bag'}</button>{message&&<p role="status" className="text-sm">{message}</p>}<a className="text-sm underline" href="/checkout">View bag</a>
    </div>
   </div>
  </div>}
 </section>
}
