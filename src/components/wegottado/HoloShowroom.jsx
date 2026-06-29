import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import HoloProductCard from './HoloProductCard';
import { Link } from 'react-router-dom';
import { X, Star, ShoppingBag, Check } from 'lucide-react';



export default function HoloShowroom() {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [modalSize, setModalSize] = useState(null);
  const MODAL_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  const [cartLoading, setCartLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [filter, setFilter] = useState('ALL');
  const [sizeFilter, setSizeFilter] = useState('ALL');
  const [cartNotif, setCartNotif] = useState(null);
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [filtersVisible, setFiltersVisible] = useState(true);
  const scrollTimerRef = useRef(null);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      setFiltersVisible(false);
      clearTimeout(scrollTimerRef.current);
      scrollTimerRef.current = setTimeout(() => setFiltersVisible(true), 600);
      lastScrollY.current = window.scrollY;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => { window.removeEventListener('scroll', onScroll); clearTimeout(scrollTimerRef.current); };
  }, []);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
    base44.entities.Product.filter({ in_stock: true }).then(data => {
      setProducts(data);
      setLoadingProducts(false);
    }).catch(() => setLoadingProducts(false));
  }, []);

  const CATEGORIES = ['ALL', ...Array.from(new Set(products.map(p => p.category).filter(Boolean)))];
  const SIZES = ['ALL', 'XS', 'S', 'M', 'L', 'XL', 'XXL'];

  const handleAddToCart = async (product, size) => {
    if (!user) {
      setCartNotif({ type: 'error', name: 'Please sign in to add items to your bag.' });
      setTimeout(() => setCartNotif(null), 4000);
      return;
    }
    setCartLoading(true);
    try {
      await base44.entities.CartItem.create({
        user_id: user.id,
        product_id: product.id,
        product_name: product.name,
        product_image: product.image_url,
        price: product.price,
        quantity: 1,
        size: size || 'M',
      });
      setCartNotif({ type: 'success', name: product.name });
      setTimeout(() => setCartNotif(null), 4000);
      await base44.entities.Notification.create({
        user_id: user.id,
        title: 'Item Added to Bag',
        message: `${product.name} was added to your shopping bag.`,
        type: 'system',
        read: false,
      });
    } catch {
      setCartNotif({ type: 'error', name: 'Could not add to bag. Please try again.' });
      setTimeout(() => setCartNotif(null), 4000);
    }
    setCartLoading(false);
  };

  const filtered = products.filter(p =>
    (filter === 'ALL' || p.category === filter) &&
    (sizeFilter === 'ALL' || !p.sizes || p.sizes?.includes(sizeFilter))
  );

  return (
    <section id="showroom" className="relative py-24 md:py-36 px-6 md:px-[8vw]">

      {/* Custom cart notification */}
      <AnimatePresence>
        {cartNotif && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
            className="fixed top-6 left-1/2 z-[9999] flex items-start gap-4 px-5 py-4 min-w-[300px] max-w-sm"
            style={{
              background: 'var(--metal-mid)',
              border: `1px solid ${cartNotif.type === 'success' ? 'rgba(0,245,255,0.3)' : 'rgba(255,100,100,0.3)'}`,
              boxShadow: `0 8px 32px rgba(0,0,0,0.6)`,
            }}
          >
            <div className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center mt-0.5"
              style={{ background: cartNotif.type === 'success' ? 'rgba(0,245,255,0.15)' : 'rgba(255,100,100,0.15)' }}>
              {cartNotif.type === 'success'
                ? <Check size={13} style={{ color: 'var(--neon-cyan)' }} />
                : <X size={13} style={{ color: '#FF6B6B' }} />}
            </div>
            <div className="flex-1">
              <p className="meta-text text-[10px] mb-1" style={{ color: cartNotif.type === 'success' ? 'var(--neon-cyan)' : '#FF6B6B' }}>
                {cartNotif.type === 'success' ? 'ADDED TO BAG' : 'ERROR'}
              </p>
              <p className="text-xs" style={{ color: 'rgba(245,245,247,0.7)' }}>
                {cartNotif.type === 'success' ? `${cartNotif.name} has been added to your bag.` : cartNotif.name}
              </p>
              {cartNotif.type === 'success' && (
                <Link to="/checkout" className="meta-text text-[10px] mt-2 inline-block cursor-hover"
                  style={{ color: 'var(--gold)', textDecoration: 'underline' }}>
                  VIEW BAG →
                </Link>
              )}
            </div>
            <button
              onClick={() => setCartNotif(null)}
              className="flex-shrink-0 w-6 h-6 flex items-center justify-center cursor-hover"
              style={{ color: 'rgba(245,245,247,0.4)' }}
            >
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Header */}
      <div className="mb-16 text-center">
        <motion.span
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          className="meta-text block mb-4" style={{ color: 'var(--neon-cyan)' }}
        >
          — DIGITAL SHOWROOM —
        </motion.span>
        <motion.h2
          initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 1 }}
          className="heading-display text-5xl md:text-7xl"
        >
          <span className="metallic-text">The Atelier</span>{' '}
          <span style={{ color: 'var(--carrara)' }}>Collection</span>
        </motion.h2>
        {/* Holo divider */}
        <div className="flex items-center justify-center mt-6 gap-4">
          <div className="h-px w-20" style={{ background: 'linear-gradient(to right, transparent, var(--neon-cyan))' }} />
          <div className="w-2 h-2 rotate-45" style={{ background: 'var(--neon-cyan)', boxShadow: '0 0 8px var(--neon-cyan)' }} />
          <div className="h-px w-20" style={{ background: 'linear-gradient(to left, transparent, var(--neon-cyan))' }} />
        </div>

        {/* Filters — fade on scroll */}
        <motion.div
          animate={{ opacity: filtersVisible ? 1 : 0, y: filtersVisible ? 0 : -6 }}
          transition={{ duration: 0.35, ease: 'easeInOut' }}
          className="mt-10 space-y-4"
        >
          {/* Category row */}
          <div className="flex flex-wrap justify-center gap-2">
            <span className="meta-text text-[9px] self-center mr-2" style={{ color: 'rgba(245,245,247,0.25)', letterSpacing: '0.2em' }}>CATEGORY</span>
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className="cursor-hover px-5 py-1.5 meta-text text-[9px] transition-all duration-400"
                style={{
                  border: `1px solid ${filter === cat ? 'var(--gold)' : 'rgba(245,245,247,0.1)'}`,
                  color: filter === cat ? 'var(--gold)' : 'rgba(245,245,247,0.35)',
                  background: filter === cat ? 'rgba(212,175,55,0.07)' : 'transparent',
                  letterSpacing: '0.18em',
                  boxShadow: filter === cat ? '0 0 12px rgba(212,175,55,0.18)' : 'none',
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Thin separator */}
          <div className="flex justify-center">
            <div className="h-px w-32" style={{ background: 'linear-gradient(to right, transparent, rgba(245,245,247,0.08), transparent)' }} />
          </div>

          {/* Size row */}
          <div className="flex flex-wrap justify-center gap-2">
            <span className="meta-text text-[9px] self-center mr-2" style={{ color: 'rgba(245,245,247,0.25)', letterSpacing: '0.2em' }}>SIZE</span>
            {SIZES.map(sz => (
              <button
                key={sz}
                onClick={() => setSizeFilter(sz)}
                className="cursor-hover w-10 h-10 meta-text text-[9px] transition-all duration-400 flex items-center justify-center"
                style={{
                  border: `1px solid ${sizeFilter === sz ? 'var(--neon-cyan)' : 'rgba(0,245,255,0.1)'}`,
                  color: sizeFilter === sz ? 'var(--neon-cyan)' : 'rgba(245,245,247,0.3)',
                  background: sizeFilter === sz ? 'rgba(0,245,255,0.07)' : 'transparent',
                  boxShadow: sizeFilter === sz ? '0 0 10px rgba(0,245,255,0.15)' : 'none',
                  letterSpacing: '0.1em',
                }}
              >
                {sz}
              </button>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Product grid */}
      {loadingProducts ? (
        <div className="flex items-center justify-center py-24">
          <div className="w-10 h-10 border border-[var(--neon-cyan)] rounded-full animate-spin"
            style={{ borderTopColor: 'transparent' }} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-24">
          <p className="heading-display text-3xl" style={{ color: 'rgba(245,245,247,0.3)' }}>No items in this category</p>
        </div>
      ) : (
      <motion.div
        layout
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
      >
        <AnimatePresence>
          {filtered.map((product, i) => (
            <motion.div
              key={product.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: i * 0.05, duration: 0.5 }}
            >
              <HoloProductCard
                product={product}
                onAddToCart={handleAddToCart}
                onView={setSelectedProduct}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
      )}

      {/* View all CTA */}
      <div className="text-center mt-16">
        <Link to="/checkout" className="cursor-hover inline-flex items-center gap-3 px-10 py-4 group relative overflow-hidden"
          style={{ border: '1px solid var(--gold)' }}>
          <span className="relative z-10 meta-text text-xs transition-colors duration-500 group-hover:text-[var(--obsidian)]"
            style={{ color: 'var(--gold)' }}>
            PROCEED TO CHECKOUT
          </span>
          <div className="absolute inset-0 -translate-x-full group-hover:translate-x-0 transition-transform duration-700"
            style={{ background: 'var(--gold)' }} />
        </Link>
      </div>

      {/* Product detail modal */}
      <AnimatePresence>
        {selectedProduct && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-6"
            style={{ background: 'rgba(8,8,8,0.92)', backdropFilter: 'blur(20px)' }}
            onClick={() => { setSelectedProduct(null); setModalSize(null); }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 30 }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
              className="holo-card relative max-w-2xl w-full overflow-hidden"
              style={{ maxHeight: '85vh', overflowY: 'auto' }}
              onClick={e => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedProduct(null)}
                className="absolute top-4 right-4 z-10 cursor-hover w-8 h-8 flex items-center justify-center"
                style={{ background: 'rgba(8,8,8,0.75)', border: '1px solid rgba(0,245,255,0.3)', color: 'var(--neon-cyan)' }}
              >
                <X size={16} />
              </button>
              <img
                src={selectedProduct.image_url}
                alt={selectedProduct.name}
                className="w-full h-64 object-cover"
              />
              <div className="p-8">
                <span className="meta-text text-[10px] block mb-3" style={{ color: 'var(--neon-cyan)' }}>
                  {selectedProduct.category}
                </span>
                <h3 className="heading-display text-4xl mb-4" style={{ color: 'var(--carrara)' }}>
                  {selectedProduct.name}
                </h3>
                <p className="text-sm mb-6" style={{ color: 'rgba(245,245,247,0.5)', lineHeight: 1.8 }}>
                  {selectedProduct.description}
                </p>
                <div className="flex items-center gap-2 mb-8">
                  {[1,2,3,4,5].map(s => <Star key={s} size={12} fill="var(--gold)" color="var(--gold)" />)}
                  <span className="meta-text text-[10px] ml-2">MASTER CRAFTED</span>
                </div>
                <div className="flex items-center justify-between mb-6">
                  <span className="heading-display text-3xl metallic-text">
                    ${selectedProduct.price.toLocaleString()}
                  </span>
                  <span className="meta-text text-[10px]" style={{ color: selectedProduct.in_stock ? 'rgba(0,245,255,0.5)' : 'rgba(255,100,100,0.5)' }}>
                    {selectedProduct.in_stock !== false ? 'IN STOCK' : 'OUT OF STOCK'}
                  </span>
                </div>

                {/* Size selector */}
                <div className="mb-6">
                  <span className="meta-text text-[9px] block mb-3" style={{ color: 'rgba(245,245,247,0.3)', letterSpacing: '0.2em' }}>SELECT SIZE</span>
                  <div className="flex flex-wrap gap-2">
                    {(selectedProduct.sizes?.length ? selectedProduct.sizes : MODAL_SIZES).map(sz => (
                      <button
                        key={sz}
                        onClick={() => setModalSize(sz === modalSize ? null : sz)}
                        className="cursor-hover w-12 h-12 meta-text text-[10px] flex items-center justify-center transition-all duration-200"
                        style={{
                          border: `1px solid ${modalSize === sz ? 'var(--neon-cyan)' : 'rgba(0,245,255,0.15)'}`,
                          color: modalSize === sz ? 'var(--neon-cyan)' : 'rgba(245,245,247,0.4)',
                          background: modalSize === sz ? 'rgba(0,245,255,0.08)' : 'transparent',
                          boxShadow: modalSize === sz ? '0 0 10px rgba(0,245,255,0.2)' : 'none',
                        }}
                      >
                        {sz}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => { handleAddToCart(selectedProduct, modalSize || (selectedProduct.sizes?.[0] || 'M')); setSelectedProduct(null); setModalSize(null); }}
                  disabled={cartLoading}
                  className="w-full py-4 cursor-hover meta-text text-xs transition-all duration-300 flex items-center justify-center gap-2"
                  style={{ background: 'var(--gold)', color: 'var(--obsidian)' }}
                >
                  <ShoppingBag size={14} />
                  {cartLoading ? 'ADDING...' : 'ADD TO BAG & CHECKOUT'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}