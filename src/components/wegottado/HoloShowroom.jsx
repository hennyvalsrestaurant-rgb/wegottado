import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import HoloProductCard from './HoloProductCard';
import { useToast } from '@/components/ui/use-toast';
import { Link } from 'react-router-dom';
import { X, Star } from 'lucide-react';

const STATIC_PRODUCTS = [
  {
    id: 's1', name: 'The Sovereign Coat', category: 'OUTERWEAR', price: 4800, tag: 'LIMITED',
    image_url: 'https://media.base44.com/images/public/6a401981c451758a55e9b4f5/2da261c99_generated_abc73311.png',
    description: 'A structural masterpiece in heavy black wool. Architectural lapels, gold-clasp closure.',
  },
  {
    id: 's2', name: 'The Obsidian Bag', category: 'ACCESSORIES', price: 2200, tag: 'NEW',
    image_url: 'https://media.base44.com/images/public/6a401981c451758a55e9b4f5/af94bce3e_generated_402b5792.png',
    description: 'Hand-stitched leather with 18k gold hardware. Lined in black satin.',
  },
  {
    id: 's3', name: 'The Monolith Suit', category: 'SUITING', price: 6500, tag: 'EXCLUSIVE',
    image_url: 'https://media.base44.com/images/public/6a401981c451758a55e9b4f5/9367500c8_generated_ca3d562c.png',
    description: 'Double-breasted midnight black with gold-thread pinstripe. Florence tailored.',
  },
  {
    id: 's4', name: 'The Atelier Set', category: 'ACCESSORIES', price: 1800, tag: null,
    image_url: 'https://media.base44.com/images/public/6a401981c451758a55e9b4f5/af06bafc8_generated_b9f51f06.png',
    description: 'Curated silk pocket square, gold cufflinks, and black leather gloves.',
  },
  {
    id: 's5', name: 'The Ivory Gown', category: 'EVENING WEAR', price: 8900, tag: 'COUTURE',
    image_url: 'https://media.base44.com/images/public/6a401981c451758a55e9b4f5/0f2fef579_generated_d7ac6c34.png',
    description: 'Kyoto silk. Fifty pieces total. Gold-leaf detailing. Numbered.',
  },
  {
    id: 's6', name: 'The Gold Chain Portrait', category: 'JEWELRY', price: 3400, tag: null,
    image_url: 'https://media.base44.com/images/public/6a401981c451758a55e9b4f5/4aa583f5f_generated_b919dd87.png',
    description: 'Heavy 18k yellow gold chain. 72cm length. Handcrafted in Florence.',
  },
];

export default function HoloShowroom() {
  const { toast } = useToast();
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [cartLoading, setCartLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [filter, setFilter] = useState('ALL');

  const CATEGORIES = ['ALL', 'OUTERWEAR', 'SUITING', 'ACCESSORIES', 'EVENING WEAR', 'JEWELRY'];

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const handleAddToCart = async (product) => {
    if (!user) {
      toast({ title: 'Sign in required', description: 'Please sign in to add items to your bag.' });
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
        size: 'M',
      });
      toast({ title: 'Added to bag', description: `${product.name} has been added to your shopping bag.` });
      await base44.entities.Notification.create({
        user_id: user.id,
        title: 'Item Added to Bag',
        message: `${product.name} was added to your shopping bag.`,
        type: 'system',
        read: false,
      });
    } catch {
      toast({ title: 'Error', description: 'Could not add to bag. Please try again.' });
    }
    setCartLoading(false);
  };

  const filtered = STATIC_PRODUCTS.filter(p => filter === 'ALL' || p.category === filter);

  return (
    <section id="showroom" className="relative py-24 md:py-36 px-6 md:px-[8vw]">
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

        {/* Category filter */}
        <div className="flex flex-wrap justify-center gap-3 mt-10">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className="cursor-hover px-4 py-2 meta-text text-[10px] transition-all duration-300"
              style={{
                border: `1px solid ${filter === cat ? 'var(--neon-cyan)' : 'rgba(0,245,255,0.15)'}`,
                color: filter === cat ? 'var(--neon-cyan)' : 'rgba(245,245,247,0.4)',
                background: filter === cat ? 'rgba(0,245,255,0.08)' : 'transparent',
                boxShadow: filter === cat ? '0 0 15px rgba(0,245,255,0.2)' : 'none',
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Product grid */}
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
            onClick={() => setSelectedProduct(null)}
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
                className="absolute top-4 right-4 z-10 cursor-hover"
                style={{ color: 'var(--neon-cyan)' }}
              >
                <X size={20} />
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
                  <span className="meta-text text-[10px]" style={{ color: 'rgba(0,245,255,0.5)' }}>IN STOCK</span>
                </div>
                <button
                  onClick={() => { handleAddToCart(selectedProduct); setSelectedProduct(null); }}
                  disabled={cartLoading}
                  className="w-full py-4 cursor-hover meta-text text-xs transition-all duration-300"
                  style={{ background: 'var(--gold)', color: 'var(--obsidian)' }}
                >
                  {cartLoading ? 'ADDING...' : 'ADD TO SHOPPING BAG'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}