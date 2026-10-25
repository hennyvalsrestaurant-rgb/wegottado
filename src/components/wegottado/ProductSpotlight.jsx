import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from 'framer-motion';
import { ArrowLeft, ArrowRight, ArrowUpRight, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getAvailableColorways, productColorLabel } from '@/lib/productVariants';
import { showroomImage } from '@/lib/showroomImages';
import { base44 } from '@/api/base44Client';
import { useCurrency } from './CurrencySelector';
import './ProductSpotlight.css';


const faceImages = (product) => {
  const images = [product?.front_image_url, showroomImage(product), ...(Array.isArray(product?.images) ? product.images : [])].filter(Boolean);
  const unique = [...new Set(images)];
  return { front: unique[0], back: product?.back_image_url || unique[1] || null, side: product?.side_image_url || null };
};
const colorName = productColorLabel;
// Hanging tags use real product color names. Never offer a color without a catalog variant.
const COLOR_INKS = { black: '#202123', white: '#f3f1ed', green: '#43bd61', blue: '#48a8e4', pink: '#eaa5c4', yellow: '#f4db3b', red: '#cd3a45', cream: '#eadbbf', gray: '#92959b', grey: '#92959b', orange: '#d9813d', purple: '#8461b7', brown: '#76513f' };
const colorTagFill = (label) => {
  const colors = (String(label).toLowerCase().match(/black|white|green|blue|pink|yellow|red|cream|gray|grey|orange|purple|brown/g) || []).slice(0, 2);
  if (!colors.length) return '#55585e';
  if (colors.length === 1) return COLOR_INKS[colors[0]];
  return `linear-gradient(115deg, ${COLOR_INKS[colors[0]]} 0%, ${COLOR_INKS[colors[0]]} 48%, ${COLOR_INKS[colors[1]]} 52%, ${COLOR_INKS[colors[1]]} 100%)`;
};
const formatMoney = (format, amount) => format(Number(amount) || 0);
const spring = { type: 'spring', stiffness: 170, damping: 28, mass: 1.05 };


function Hanger({ large = false }) {
  return <svg aria-hidden="true" className={large ? 'rack-hanger rack-hanger--large' : 'rack-hanger'} viewBox="0 0 144 58" fill="none">
    <path d="M69 16c-4-3-4-10 2-13 8-4 17 3 12 11-2 4-6 6-8 9" stroke="#484039" strokeWidth="2" strokeLinecap="round"/>
    <path d="M75 23 6 51q-7 5 3 5h126q10 0 3-5L75 23Z" fill="#3e2920" stroke="#322118" strokeWidth="2" strokeLinejoin="round"/>
    <path d="M23 48h104" stroke="#765143" strokeWidth="2" strokeLinecap="round"/>
  </svg>;
}

export default function ProductSpotlight() {
  const { data: products = [], isPending: loading, isError } = useQuery({
    queryKey: ['wegottado', 'available-products'],
    queryFn: async () => {
      const result = await base44.entities.Product.filter({ in_stock: true });
      const rows = Array.isArray(result) ? result : result?.items || [];
      return rows.filter(p => p.id && p.name && p.image_url).slice(0, 12);
    },
    staleTime: 5 * 60_000,
    gcTime: 15 * 60_000,
    refetchOnWindowFocus: false,
    retry: 1,
  });
  const [hover, setHover] = useState(null);
  const [selected, setSelected] = useState(null);
  const [face, setFace] = useState('front');
  const [colorSwitching, setColorSwitching] = useState(false);
  const [direction, setDirection] = useState(1);
  const [centerIndex, setCenterIndex] = useState(0);
  const rackScrollRef = useRef(null);
  const settleTimerRef = useRef(null);
  const [compact, setCompact] = useState(() => typeof window !== 'undefined' && window.matchMedia('(max-width: 1023px), (hover: none)').matches);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 1023px), (hover: none)');
    const update = () => setCompact(mq.matches);
    mq.addEventListener?.('change', update);
    return () => mq.removeEventListener?.('change', update);
  }, []);
  const reducedMotion = useReducedMotion();
  const sectionRef = useRef(null);
  const touchRef = useRef(null);
  const navigate = useNavigate();
  const updateRackCenter = useCallback(() => {
    const rail = rackScrollRef.current;
    if (!rail || !compact) return;
    // Commit the focused garment only when momentum scrolling has settled.
    // Updating 3D rotation during every scroll frame caused visible oscillation
    // around the midpoint on iOS and Android touchscreens.
    if (settleTimerRef.current != null) clearTimeout(settleTimerRef.current);
    settleTimerRef.current = setTimeout(() => {
      settleTimerRef.current = null;
      if (rackScrollRef.current !== rail) return;
      const midpoint = rail.scrollLeft + rail.clientWidth / 2;
      const items = rail.querySelectorAll('.rack-item');
      let best = 0;
      let closest = Infinity;
      items.forEach((item, index) => {
        const x = item.offsetLeft + item.offsetWidth / 2;
        const distance = Math.abs(x - midpoint);
        if (distance < closest) { closest = distance; best = index; }
      });
      setCenterIndex(previous => previous === best ? previous : best);
    }, 150);
  }, [compact]);
  const browseRack = useCallback(delta => {
    if (!products.length) return;
    const next = Math.max(0, Math.min(products.length - 1, centerIndex + delta));
    setCenterIndex(next);
    const rail = rackScrollRef.current;
    const item = rail?.querySelectorAll('.rack-item')[next];
    if (rail && item) rail.scrollTo({ left: item.offsetLeft + item.offsetWidth / 2 - rail.clientWidth / 2, behavior: reducedMotion ? 'auto' : 'smooth' });
  }, [centerIndex, products.length, reducedMotion]);
  useEffect(() => () => { if (settleTimerRef.current != null) clearTimeout(settleTimerRef.current); }, []);
  const { format } = useCurrency();
  const activeIndex = useMemo(() => products.findIndex(p => p.id === selected), [products, selected]);
  const chosen = activeIndex < 0 ? null : products[activeIndex];
  const chosenFaces = faceImages(chosen);
  const visibleImage = face === 'back' && chosenFaces.back ? chosenFaces.back : chosenFaces.front;
  const variants = useMemo(() => getAvailableColorways(products, chosen), [chosen, products]);
  const open = useCallback((id, fromColor = false) => {
    setColorSwitching(fromColor);
    if (settleTimerRef.current != null) clearTimeout(settleTimerRef.current);
    settleTimerRef.current = null;
    const index = products.findIndex(product => product.id === id);
    if (index >= 0) setCenterIndex(index);
    setSelected(id);
    setFace('front');
  }, [products]);
  const close = useCallback(() => { setColorSwitching(false); setSelected(null); setFace('front'); setHover(null); }, []);
  useEffect(() => {
    if (selected || !compact || !products.length || !rackScrollRef.current) return;
    const rail = rackScrollRef.current;
    const item = rail.querySelectorAll('.rack-item')[centerIndex];
    if (item) rail.scrollTo({ left: item.offsetLeft + item.offsetWidth / 2 - rail.clientWidth / 2, behavior: 'auto' });
  // Only restore the last viewed rack position when returning from a product.
  }, [selected, compact, products.length]);
  const step = useCallback(delta => {
    if (!products.length || activeIndex === -1) return;
    setDirection(delta >= 0 ? 1 : -1);
    open(products[(activeIndex + delta + products.length) % products.length].id);
  }, [activeIndex, open, products]);
  useEffect(() => {
    if (!selected) return undefined;
    const keydown = e => {
      if (e.key === 'Escape') { e.preventDefault(); close(); }
      if (e.key === 'ArrowRight') { e.preventDefault(); step(1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1); }
    };
    window.addEventListener('keydown', keydown);
    return () => window.removeEventListener('keydown', keydown);
  }, [selected, step, close]);

  // One choreography on every device. Only the rack's scrolling layout differs on touch.
  const eased = reducedMotion ? { duration: 0.01 } : spring;
  const productActive = chosen != null;
  const highlightedIndex = compact ? centerIndex : hover;
  const preview = highlightedIndex != null ? products[highlightedIndex] : null;
  return <section ref={sectionRef} className="rack-experience" aria-label="WEGOTTADO interactive fashion rack">
    <header className="rack-topbar">
      <a href="#manifesto" className="rack-toplink">ABOUT</a>
      <button type="button" onClick={close} className="rack-wordmark" aria-label="Return to WEGOTTADO rack">WEGOTTADO<span aria-hidden="true">®</span></button>
      <a href="#maison" className="rack-toplink">CONTACT</a>
    </header>
    <LayoutGroup><AnimatePresence initial={false} mode="popLayout">
      {!productActive ? (
        <motion.div key="rack-scene" className="rack-scene"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          exit={{ opacity: 0, filter: (reducedMotion || compact) ? 'none' : 'blur(7px)', scale: compact ? 1 : 1.03 }}
          transition={{ duration: reducedMotion ? 0 : .36 }}>
          {loading ? <div role="status" className="rack-loading">Preparing the collection…</div> :
           isError ? <div role="alert" className="rack-loading">Collection could not be loaded right now.</div> : products.length === 0 ?
            <div className="rack-loading">New pieces coming soon.</div> :
            <>
              <div className="rack-display-wrap">
                <div className="rack-mobile-stationary-rail" aria-hidden="true"/>
              <div ref={rackScrollRef} className="rack-display" role="region" aria-label="Browse hanging garments. Swipe sideways to explore on touch devices." tabIndex={compact ? 0 : undefined} onScroll={updateRackCenter} onMouseLeave={() => { if (!compact) setHover(null); }}>
                <div className="rack-rail" aria-hidden="true"/>
                <div className="rack-garments">
                  {products.map((product, index) => {
                    const hovered = highlightedIndex === index;
                    const hasHover = highlightedIndex != null;
                    const distance = hasHover ? Math.abs(index - highlightedIndex) : 9;
                    const shift = hasHover && !hovered ? (index < highlightedIndex ? -14 : 14) : 0;
                    const faces = faceImages(product);
                    return <motion.button type="button" key={product.id}
                      aria-label={'Inspect ' + product.name}
                      className={'rack-item' + (hovered ? ' is-expanded' : '')}
                      onMouseEnter={() => { if (!compact) setHover(index); }} onFocus={() => { if (!compact) setHover(index); }}
                      onClick={() => open(product.id)}
                      layout={!compact} transition={eased}
                      animate={{ zIndex: hovered ? 20 : 10 - distance,
                        x: shift, y: 0,
                        flexGrow: compact ? 0 : hovered ? 1.65 : 1,
                        opacity: hasHover && distance > 2 ? .75 : 1 }}
                    >
                      <motion.div className="rack-hanger-motion" aria-hidden="true" animate={{ rotateZ: compact && hovered ? -2 : 0 }} transition={eased}><Hanger/></motion.div>
                      <motion.div className="rack-garment-art" layoutId={!reducedMotion ? 'rack-product-' + product.id : undefined} transition={eased}>
                        <motion.div className="rack-garment-inner" style={{ transformOrigin: '50% 0', transformStyle: 'preserve-3d' }}
                          animate={{ rotateY: hovered ? 0 : (index % 2 === 0 ? 73 : -72), scale: hovered ? 1.18 : 1 }}
                          transition={eased}>
                          <img src={faces.side && !hovered ? faces.side : faces.front} alt="" loading={index < 2 ? 'eager' : 'lazy'} decoding="async" draggable="false"/>
                        </motion.div>
                      </motion.div>
                    </motion.button>;
                  })}
                </div>
              </div>
              </div>
              {compact && <div className="rack-mobile-controls" aria-label="Browse the clothes rack">
                <button type="button" className="rack-browse-arrow" aria-label="Previous hanging garment" disabled={centerIndex === 0} onClick={() => browseRack(-1)}><ArrowLeft size={18}/></button>
                <span className="rack-mobile-counter" aria-live="polite">{String(centerIndex + 1).padStart(2,'0')} / {String(products.length).padStart(2,'0')}</span>
                <button type="button" className="rack-browse-arrow" aria-label="Next hanging garment" disabled={centerIndex === products.length - 1} onClick={() => browseRack(1)}><ArrowRight size={18}/></button>
              </div>}
              <div className="rack-caption" aria-live="polite">
                <AnimatePresence mode="wait">
                  <motion.p key={preview?.id || 'prompt'} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: reducedMotion ? 0 : .22 }}>
                    {preview ? preview.name : compact ? 'SWIPE TO BROWSE · TAP A GARMENT' : 'MOVE THROUGH THE RACK · SELECT A PIECE'}
                  </motion.p>
                </AnimatePresence>
              </div>
              <button className="rack-availability" type="button" onClick={() => navigate('/product/' + products[highlightedIndex ?? 0].id)}>SEE AVAILABILITY <ArrowUpRight size={13}/></button>
            </>
          }
        </motion.div>
      ) : (
        <motion.div key="focus-scene" className="rack-focus" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: reducedMotion ? 0 : .35 }}
          onTouchStart={e => { touchRef.current = null; if (e.target.closest('button, a')) return; touchRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }; }}
          onTouchEnd={e => { if (!touchRef.current) return; const dx = e.changedTouches[0].clientX - touchRef.current.x; const dy = e.changedTouches[0].clientY - touchRef.current.y; touchRef.current = null; if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.2) step(dx < 0 ? 1 : -1); }}>
          <button type="button" onClick={close} className="rack-close">CLOSE <X size={15}/></button>
          <div className="rack-ghost rack-ghost--left" aria-hidden="true"><img src={showroomImage(products[(activeIndex - 1 + products.length) % products.length])} alt="" loading="lazy" decoding="async"/></div>
          <div className="rack-ghost rack-ghost--right" aria-hidden="true"><img src={showroomImage(products[(activeIndex + 1) % products.length])} alt="" loading="lazy" decoding="async"/></div>
          <button type="button" className="rack-arrow rack-arrow--left" onClick={() => step(-1)} aria-label="Previous garment"><ArrowLeft size={24}/></button>
          <button type="button" className="rack-arrow rack-arrow--right" onClick={() => step(1)} aria-label="Next garment"><ArrowRight size={24}/></button>
          <div className="rack-focus-center">
            <Hanger large/>
            <AnimatePresence initial={false} custom={direction} mode="wait">
              <motion.div key={chosen.id + '-' + face} className="rack-focus-image"
                layoutId={!reducedMotion && !colorSwitching && face === 'front' ? 'rack-product-' + chosen.id : undefined}
                transition={eased}>
                <motion.div className="rack-focus-inner"
                  initial={reducedMotion ? false : { opacity: 0, x: direction * 38, rotateY: face === 'back' ? -88 : 88, scale: .96 }}
                  animate={{ opacity: 1, x: 0, rotateY: 0, scale: 1 }}
                  exit={reducedMotion ? { opacity: 0 } : { opacity: 0, x: -direction * 38, rotateY: face === 'back' ? 88 : -88, scale: .97 }}
                  transition={{ duration: reducedMotion ? 0 : .52, ease: [.22, 1, .36, 1] }}>
                  <img src={visibleImage} alt={chosen.name + (face === 'back' ? ' alternate view' : ' front view')} draggable="false" decoding="async"/>
                </motion.div>
              </motion.div>
            </AnimatePresence>
            <motion.h2 key={chosen.id} className="rack-product-name"
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reducedMotion ? 0 : .3 }}>{chosen.name}</motion.h2>
            <p className="rack-product-price">{formatMoney(format, chosen.price)}</p>
            <div className="rack-face-switch" role="group" aria-label="Product views">
              <button type="button" className={face === 'front' ? 'is-current' : ''} onClick={() => setFace('front')}>FRONT</button>
              <button type="button" className={face === 'back' ? 'is-current' : ''} disabled={!chosenFaces.back}
                title={!chosenFaces.back ? 'Second product view not available' : undefined}
                onClick={() => { if (chosenFaces.back) setFace('back'); }}>BACK</button>
            </div>
            {variants.length > 1 && (
              <div className="rack-color-tags" role="group" aria-label="Available garment colors">
                {variants.map((item, index) => {
                  const label = colorName(item);
                  const current = item.id === chosen.id;
                  return (
                    <motion.button type="button" key={item.id}
                      className={'rack-color-choice' + (current ? ' is-selected' : '') + (/^(white|cream|yellow)$/i.test(label.trim()) ? ' is-light' : '')}
                      style={{ '--tag-fill': colorTagFill(label) }}
                      aria-label={'Select ' + label + ' color'} aria-pressed={current}
                      title={label}
                      onClick={() => { if (!current) { setDirection(index > variants.findIndex(v => v.id === chosen.id) ? 1 : -1); open(item.id, true); } }}
                      initial={reducedMotion ? false : { opacity: 0, y: -15, rotate: -7 }}
                      animate={{ opacity: 1, y: current ? 6 : 0, rotate: current ? 0 : index % 2 ? 3 : -3 }}
                      whileTap={reducedMotion ? undefined : { scale: .94 }}
                      transition={reducedMotion ? { duration: 0 } : { type: 'spring', stiffness: 230, damping: 20, delay: index * .07 }}>
                      <span className="rack-tag-cord" aria-hidden="true" />
                      <span className="rack-tag-card"><span className="rack-tag-text">{label}</span></span>
                    </motion.button>
                  );
                })}
              </div>
            )}
            <button type="button" className="rack-availability rack-availability--focus" onClick={() => navigate('/product/' + chosen.id)}>SEE AVAILABILITY <ArrowUpRight size={13}/></button>
            <p className="rack-count">{String(activeIndex + 1).padStart(2, '0')} / {String(products.length).padStart(2, '0')}</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence></LayoutGroup>
    <div className="rack-ticker" aria-label="New drops. WEGOTTADO. It's us, never them.">
      <div className="rack-ticker-track">
        {Array.from({ length: 8 }, (_, i) => <span key={i}>NEW DROPS&nbsp; • &nbsp;WEGOTTADO&nbsp; • &nbsp;IT’S US, NEVER THEM&nbsp; • &nbsp;</span>)}
      </div>
    </div>
  </section>;
}
