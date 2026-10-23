import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from 'framer-motion';
import { ArrowLeft, ArrowRight, ArrowUpRight, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useCurrency } from './CurrencySelector';
import './ProductSpotlight.css';


const faceImages = (product) => {
  const images = [product?.front_image_url, product?.image_url, ...(Array.isArray(product?.images) ? product.images : [])].filter(Boolean);
  const unique = [...new Set(images)];
  return { front: unique[0], back: product?.back_image_url || unique[1] || null, side: product?.side_image_url || null };
};
const familyName = name => String(name || '').split(/\s*[-–]\s*/)[0].trim().toLowerCase();
const colorName = product => product.color_label || (product.name?.split(/\s*[-–]\s*/).slice(1).join(' - ').trim()) || product.category || 'Original';
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
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [hover, setHover] = useState(null);
  const [selected, setSelected] = useState(null);
  const [face, setFace] = useState('front');
  const [direction, setDirection] = useState(1);

  const reducedMotion = useReducedMotion();
  const sectionRef = useRef(null);
  const touchRef = useRef(null);
  const navigate = useNavigate();
  const { format } = useCurrency();
  useEffect(() => {
    let active = true;
    base44.entities.Product.filter({ in_stock: true })
      .then(result => {
        if (!active) return;
        const rows = Array.isArray(result) ? result : result?.items || [];
        setProducts(rows.filter(p => p.id && p.name && p.image_url).slice(0, 12));
      })
      .catch(() => { if (active) setError('Collection could not be loaded right now.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);
  const activeIndex = useMemo(() => products.findIndex(p => p.id === selected), [products, selected]);
  const chosen = activeIndex < 0 ? null : products[activeIndex];
  const chosenFaces = faceImages(chosen);
  const visibleImage = face === 'back' && chosenFaces.back ? chosenFaces.back : chosenFaces.front;
  const variants = useMemo(() => chosen ? products.filter(p => familyName(p.name) === familyName(chosen.name)) : [], [chosen, products]);
  const open = useCallback((id) => { setSelected(id); setFace('front'); }, []);
  const close = useCallback(() => { setSelected(null); setFace('front'); setHover(null); }, []);
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

  const eased = reducedMotion ? { duration: 0.01 } : spring;
  const productActive = chosen != null;
  const preview = hover != null ? products[hover] : null;
  return <section id="interactive-rack" ref={sectionRef} className="rack-experience" aria-label="WEGOTTADO interactive fashion rack">
    <header className="rack-topbar">
      <a href="#manifesto" className="rack-toplink">ABOUT</a>
      <button type="button" onClick={close} className="rack-wordmark" aria-label="Return to WEGOTTADO rack">WEGOTTADO<span aria-hidden="true">®</span></button>
      <a href="#maison" className="rack-toplink">CONTACT</a>
    </header>
    <LayoutGroup><AnimatePresence initial={false} mode="sync">
      {!productActive ? (
        <motion.div key="rack-scene" className="rack-scene"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          exit={{ opacity: 0, filter: reducedMotion ? 'none' : 'blur(7px)', scale: 1.03 }}
          transition={{ duration: reducedMotion ? 0 : .36 }}>
          {loading ? <div role="status" className="rack-loading">Preparing the collection…</div> :
           error ? <div role="alert" className="rack-loading">{error}</div> : products.length === 0 ?
            <div className="rack-loading">New pieces coming soon.</div> :
            <>
              <div className="rack-display" onMouseLeave={() => setHover(null)}>
                <div className="rack-rail" aria-hidden="true"/>
                <div className="rack-garments">
                  {products.map((product, index) => {
                    const hovered = hover === index;
                    const hasHover = hover != null;
                    const distance = hasHover ? Math.abs(index - hover) : 9;
                    const shift = hasHover && !hovered ? (index < hover ? -14 : 14) : 0;
                    const faces = faceImages(product);
                    return <motion.button type="button" key={product.id}
                      aria-label={'Inspect ' + product.name}
                      className={'rack-item' + (hovered ? ' is-expanded' : '')}
                      onMouseEnter={() => setHover(index)} onFocus={() => setHover(index)}
                      onClick={() => open(product.id)}
                      layout transition={eased}
                      animate={{ zIndex: hovered ? 20 : 10 - distance,
                        x: shift, y: hovered ? -3 : 0,
                        flexGrow: hovered ? 1.65 : 1, opacity: hasHover && distance > 2 ? .75 : 1 }}
                    >
                      <Hanger/>
                      <motion.div className="rack-garment-art" layoutId={'rack-product-' + product.id}
                        transition={eased} style={{ transformOrigin: '50% 0', transformStyle: 'preserve-3d' }}
                        animate={{ rotateY: hovered ? 0 : (index % 2 === 0 ? 73 : -72),
                          scale: hovered ? 1.18 : 1 }}
                      >
                        <img src={faces.side && !hovered ? faces.side : faces.front} alt="" loading={index < 6 ? 'eager' : 'lazy'} decoding="async" draggable="false"/>
                      </motion.div>
                    </motion.button>;
                  })}
                </div>
              </div>
              <div className="rack-caption" aria-live="polite">
                <AnimatePresence mode="wait">
                  <motion.p key={preview?.id || 'prompt'} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: reducedMotion ? 0 : .22 }}>
                    {preview ? preview.name : 'MOVE THROUGH THE RACK · SELECT A PIECE'}
                  </motion.p>
                </AnimatePresence>
              </div>
              <button className="rack-availability" type="button" onClick={() => open(products[hover ?? 0].id)}>SEE AVAILABILITY <ArrowUpRight size={13}/></button>
            </>
          }
        </motion.div>
      ) : (
        <motion.div key="focus-scene" className="rack-focus" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: reducedMotion ? 0 : .35 }}
          onTouchStart={e => { touchRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }; }}
          onTouchEnd={e => { if (!touchRef.current) return; const dx = e.changedTouches[0].clientX - touchRef.current.x; const dy = e.changedTouches[0].clientY - touchRef.current.y; touchRef.current = null; if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.2) step(dx < 0 ? 1 : -1); }}>
          <button type="button" onClick={close} className="rack-close">CLOSE <X size={15}/></button>
          <div className="rack-ghost rack-ghost--left" aria-hidden="true"><img src={products[(activeIndex - 1 + products.length) % products.length]?.image_url} alt=""/></div>
          <div className="rack-ghost rack-ghost--right" aria-hidden="true"><img src={products[(activeIndex + 1) % products.length]?.image_url} alt=""/></div>
          <button type="button" className="rack-arrow rack-arrow--left" onClick={() => step(-1)} aria-label="Previous garment"><ArrowLeft size={24}/></button>
          <button type="button" className="rack-arrow rack-arrow--right" onClick={() => step(1)} aria-label="Next garment"><ArrowRight size={24}/></button>
          <div className="rack-focus-center">
            <Hanger large/>
            <AnimatePresence initial={false} custom={direction} mode="wait">
              <motion.div key={chosen.id + '-' + face} className="rack-focus-image" layoutId={face === 'front' ? 'rack-product-' + chosen.id : undefined}
                initial={reducedMotion ? false : { opacity: 0, x: direction * 38, rotateY: face === 'back' ? 35 : -20, scale: .96 }}
                animate={{ opacity: 1, x: 0, rotateY: 0, scale: 1 }}
                exit={reducedMotion ? { opacity: 0 } : { opacity: 0, x: -direction * 38, rotateY: face === 'back' ? -35 : 20, scale: .97 }}
                transition={{ duration: reducedMotion ? 0 : .42, ease: [.22, 1, .36, 1] }}
              >
                <img src={visibleImage} alt={chosen.name + (face === 'back' ? ' alternate view' : ' front view')} draggable="false" decoding="async"/>
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
            {variants.length > 1 && <div className="rack-variants" aria-label="Color variants">
              {variants.map(item => <button type="button" key={item.id}
                className={'rack-variant' + (item.id === chosen.id ? ' selected' : '')}
                onClick={() => { setDirection(item.id === chosen.id ? direction : 1); open(item.id); }}
                aria-label={'See color ' + colorName(item)} title={colorName(item)}>
                <img src={item.image_url} alt=""/><span>{colorName(item)}</span>
              </button>)}
            </div>}
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
