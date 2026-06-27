import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Trash2, Plus, Minus, ArrowLeft, Check } from 'lucide-react';
import HoloGrid from '@/components/wegottado/HoloGrid';

const STEPS = ['BAG', 'SHIPPING', 'PAYMENT', 'CONFIRMED'];

export default function Checkout() {
  const [user, setUser] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const navigate = useNavigate();

  const [shipping, setShipping] = useState({ name: '', address: '', city: '', country: 'US', zip: '' });
  const [payment, setPayment] = useState({ card: '', expiry: '', cvv: '', name: '' });

  useEffect(() => {
    const load = async () => {
      try {
        const me = await base44.auth.me();
        setUser(me);
        const items = await base44.entities.CartItem.filter({ user_id: me.id });
        setCartItems(items);
      } catch {
        navigate('/login');
      }
      setLoading(false);
    };
    load();
  }, [navigate]);

  const removeItem = async (item) => {
    await base44.entities.CartItem.delete(item.id);
    setCartItems(prev => prev.filter(i => i.id !== item.id));
  };

  const updateQty = async (item, delta) => {
    const newQty = Math.max(1, item.quantity + delta);
    await base44.entities.CartItem.update(item.id, { quantity: newQty });
    setCartItems(prev => prev.map(i => i.id === item.id ? { ...i, quantity: newQty } : i));
  };

  const subtotal = cartItems.reduce((s, i) => s + i.price * i.quantity, 0);
  const tax = subtotal * 0.1;
  const total = subtotal + tax;

  const placeOrder = async () => {
    setPlacing(true);
    try {
      const order = await base44.entities.Order.create({
        user_id: user.id,
        items: cartItems.map(i => ({ name: i.product_name, price: i.price, qty: i.quantity })),
        total: Math.round(total * 100) / 100,
        status: 'confirmed',
        shipping_address: shipping,
        payment_method: 'card',
      });
      setOrderId(order.id);
      // Clear cart
      await Promise.all(cartItems.map(i => base44.entities.CartItem.delete(i.id)));
      setCartItems([]);
      // Notification
      await base44.entities.Notification.create({
        user_id: user.id,
        title: 'Order Confirmed',
        message: `Your order #${order.id.slice(-8).toUpperCase()} has been confirmed. Total: $${total.toFixed(2)}`,
        type: 'order',
        order_id: order.id,
        read: false,
      });
      setStep(3);
    } catch (err) {
      console.error(err);
    }
    setPlacing(false);
  };

  const progress = ((step + 1) / STEPS.length) * 100;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--metal-dark)' }}>
        <div className="w-12 h-12 border border-[var(--neon-cyan)] rounded-full animate-spin"
          style={{ borderTopColor: 'transparent' }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen page-enter relative" style={{ background: 'var(--metal-dark)' }}>
      <HoloGrid />
      <div className="relative z-10">
        {/* Progress bar */}
        <div className="fixed top-0 left-0 right-0 h-0.5 z-50" style={{ background: 'rgba(0,245,255,0.1)' }}>
          <motion.div
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
            className="h-full"
            style={{ background: 'linear-gradient(to right, var(--neon-cyan), var(--gold))', boxShadow: '0 0 10px var(--neon-cyan)' }}
          />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 md:px-12 py-5"
          style={{ borderBottom: '1px solid rgba(0,245,255,0.1)' }}>
          <Link to="/" className="flex items-center gap-3 cursor-hover" style={{ color: 'rgba(245,245,247,0.4)' }}>
            <ArrowLeft size={16} />
            <span className="meta-text text-[10px]">BACK TO SHOWROOM</span>
          </Link>
          <span className="heading-display text-xl" style={{ color: 'var(--gold)' }}>WEGOTTADO</span>
          <Link to="/profile" className="flex items-center gap-2 cursor-hover" style={{ color: 'rgba(245,245,247,0.4)' }}>
            <span className="meta-text text-[10px]">MY PROFILE</span>
          </Link>
        </div>

        {/* Step indicators */}
        <div className="flex items-center justify-center gap-6 py-8">
          {STEPS.map((s, i) => (
            <React.Fragment key={s}>
              <div className="flex items-center gap-2">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] transition-all duration-500"
                  style={{
                    background: i <= step ? 'var(--neon-cyan)' : 'rgba(0,245,255,0.08)',
                    border: `1px solid ${i <= step ? 'var(--neon-cyan)' : 'rgba(0,245,255,0.2)'}`,
                    color: i <= step ? 'var(--obsidian)' : 'rgba(245,245,247,0.3)',
                    boxShadow: i <= step ? '0 0 10px rgba(0,245,255,0.4)' : 'none',
                  }}
                >
                  {i < step ? <Check size={12} /> : i + 1}
                </div>
                <span className="meta-text text-[9px] hidden sm:block"
                  style={{ color: i <= step ? 'var(--neon-cyan)' : 'rgba(245,245,247,0.3)' }}>
                  {s}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className="h-px w-8 sm:w-16 transition-all duration-700"
                  style={{ background: i < step ? 'var(--neon-cyan)' : 'rgba(0,245,255,0.1)' }} />
              )}
            </React.Fragment>
          ))}
        </div>

        <div className="max-w-4xl mx-auto px-6 md:px-12 pb-20">
          <AnimatePresence mode="wait">
            {/* STEP 0: BAG */}
            {step === 0 && (
              <motion.div key="bag" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
                <h2 className="heading-display text-4xl mb-8" style={{ color: 'var(--carrara)' }}>
                  Your <span className="metallic-text">Bag</span>
                </h2>
                {cartItems.length === 0 ? (
                  <div className="holo-card p-16 text-center">
                    <ShoppingBag size={48} className="mx-auto mb-4 opacity-20" />
                    <p className="heading-display text-2xl mb-4" style={{ color: 'rgba(245,245,247,0.4)' }}>Your bag is empty</p>
                    <Link to="/" className="meta-text text-[10px] cursor-hover py-3 px-8 inline-block"
                      style={{ border: '1px solid var(--gold)', color: 'var(--gold)' }}>
                      EXPLORE SHOWROOM
                    </Link>
                  </div>
                ) : (
                  <>
                    <div className="space-y-4 mb-8">
                      {cartItems.map(item => (
                        <div key={item.id} className="holo-card p-5 flex items-center gap-5">
                          <img src={item.product_image} alt={item.product_name}
                            className="w-20 h-20 object-cover flex-shrink-0" />
                          <div className="flex-1">
                            <h4 className="heading-display text-xl" style={{ color: 'var(--carrara)' }}>{item.product_name}</h4>
                            <span className="meta-text text-[10px]" style={{ color: 'var(--gold)' }}>
                              ${item.price.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <button onClick={() => updateQty(item, -1)} className="cursor-hover w-7 h-7 flex items-center justify-center"
                              style={{ border: '1px solid rgba(0,245,255,0.2)', color: 'var(--neon-cyan)' }}>
                              <Minus size={12} />
                            </button>
                            <span className="meta-text text-xs w-4 text-center" style={{ color: 'var(--carrara)' }}>
                              {item.quantity}
                            </span>
                            <button onClick={() => updateQty(item, 1)} className="cursor-hover w-7 h-7 flex items-center justify-center"
                              style={{ border: '1px solid rgba(0,245,255,0.2)', color: 'var(--neon-cyan)' }}>
                              <Plus size={12} />
                            </button>
                          </div>
                          <span className="meta-text text-xs w-20 text-right metallic-text">
                            ${(item.price * item.quantity).toLocaleString()}
                          </span>
                          <button onClick={() => removeItem(item)} className="cursor-hover opacity-40 hover:opacity-100 transition-opacity">
                            <Trash2 size={14} style={{ color: '#FF4444' }} />
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Summary */}
                    <div className="holo-card p-6 mb-6">
                      <div className="space-y-3 mb-4">
                        {[['SUBTOTAL', subtotal], ['TAX (10%)', tax]].map(([l, v]) => (
                          <div key={l} className="flex justify-between">
                            <span className="meta-text text-[10px]">{l}</span>
                            <span className="meta-text text-xs" style={{ color: 'rgba(245,245,247,0.7)' }}>
                              ${v.toFixed(2)}
                            </span>
                          </div>
                        ))}
                        <div className="flex justify-between pt-3" style={{ borderTop: '1px solid rgba(0,245,255,0.1)' }}>
                          <span className="meta-text text-[10px]" style={{ color: 'var(--neon-cyan)' }}>TOTAL</span>
                          <span className="heading-display text-2xl metallic-text">${total.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>

                    <button onClick={() => setStep(1)}
                      className="w-full py-4 cursor-hover meta-text text-xs transition-all duration-300"
                      style={{ background: 'var(--gold)', color: 'var(--obsidian)' }}>
                      PROCEED TO SHIPPING →
                    </button>
                  </>
                )}
              </motion.div>
            )}

            {/* STEP 1: SHIPPING */}
            {step === 1 && (
              <motion.div key="ship" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
                <h2 className="heading-display text-4xl mb-8" style={{ color: 'var(--carrara)' }}>
                  <span className="metallic-text">Shipping</span> Details
                </h2>
                <div className="holo-card p-8 space-y-6">
                  {[
                    { label: 'FULL NAME', key: 'name', placeholder: 'Your name' },
                    { label: 'STREET ADDRESS', key: 'address', placeholder: 'Street address' },
                    { label: 'CITY', key: 'city', placeholder: 'City' },
                    { label: 'ZIP CODE', key: 'zip', placeholder: 'Postal code' },
                  ].map(f => (
                    <div key={f.key}>
                      <label className="meta-text text-[10px] block mb-2" style={{ color: 'rgba(0,245,255,0.5)' }}>{f.label}</label>
                      <input
                        value={shipping[f.key]}
                        onChange={e => setShipping(prev => ({ ...prev, [f.key]: e.target.value }))}
                        placeholder={f.placeholder}
                        className="holo-input w-full px-4 py-3"
                        style={{ '::placeholder': { color: 'rgba(245,245,247,0.2)' } }}
                      />
                    </div>
                  ))}
                </div>
                <div className="flex gap-4 mt-6">
                  <button onClick={() => setStep(0)} className="px-8 py-4 cursor-hover meta-text text-xs"
                    style={{ border: '1px solid rgba(0,245,255,0.2)', color: 'rgba(245,245,247,0.5)' }}>
                    ← BACK
                  </button>
                  <button
                    onClick={() => setStep(2)}
                    disabled={!shipping.name || !shipping.address}
                    className="flex-1 py-4 cursor-hover meta-text text-xs transition-all duration-300"
                    style={{ background: 'var(--gold)', color: 'var(--obsidian)', opacity: (!shipping.name || !shipping.address) ? 0.5 : 1 }}>
                    PROCEED TO PAYMENT →
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 2: PAYMENT */}
            {step === 2 && (
              <motion.div key="pay" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
                <h2 className="heading-display text-4xl mb-8" style={{ color: 'var(--carrara)' }}>
                  <span className="metallic-text">Payment</span> Details
                </h2>
                <div className="holo-card p-8 space-y-6 mb-6">
                  {/* Holographic card preview */}
                  <div className="relative h-40 overflow-hidden mb-4"
                    style={{ background: 'linear-gradient(135deg, var(--metal-mid), var(--metal-light))', border: '1px solid rgba(0,245,255,0.2)' }}>
                    <div className="holo-shimmer absolute inset-0" />
                    <div className="absolute inset-6">
                      <div className="flex justify-between items-start mb-8">
                        <span className="meta-text text-[9px]" style={{ color: 'rgba(0,245,255,0.5)' }}>WEGOTTADO PAY</span>
                        <div className="flex gap-1">
                          <div className="w-6 h-6 rounded-full opacity-70" style={{ background: 'var(--gold)' }} />
                          <div className="w-6 h-6 rounded-full opacity-50 -ml-3" style={{ background: '#FF6B6B' }} />
                        </div>
                      </div>
                      <p className="meta-text text-sm tracking-widest" style={{ color: 'rgba(245,245,247,0.6)' }}>
                        {payment.card ? payment.card.replace(/(\d{4})/g, '$1 ').trim() : '•••• •••• •••• ••••'}
                      </p>
                      <div className="flex justify-between mt-3">
                        <span className="meta-text text-[10px]" style={{ color: 'rgba(245,245,247,0.4)' }}>
                          {payment.name || 'CARDHOLDER NAME'}
                        </span>
                        <span className="meta-text text-[10px]" style={{ color: 'rgba(245,245,247,0.4)' }}>
                          {payment.expiry || 'MM/YY'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {[
                    { label: 'CARD NUMBER', key: 'card', placeholder: '1234 5678 9012 3456', maxLength: 16 },
                    { label: 'CARDHOLDER NAME', key: 'name', placeholder: 'Name on card' },
                    { label: 'EXPIRY DATE', key: 'expiry', placeholder: 'MM/YY' },
                    { label: 'CVV', key: 'cvv', placeholder: '•••', maxLength: 3 },
                  ].map(f => (
                    <div key={f.key}>
                      <label className="meta-text text-[10px] block mb-2" style={{ color: 'rgba(0,245,255,0.5)' }}>{f.label}</label>
                      <input
                        value={payment[f.key]}
                        onChange={e => setPayment(prev => ({ ...prev, [f.key]: e.target.value }))}
                        placeholder={f.placeholder}
                        maxLength={f.maxLength}
                        className="holo-input w-full px-4 py-3"
                      />
                    </div>
                  ))}

                  <div className="pt-4" style={{ borderTop: '1px solid rgba(0,245,255,0.08)' }}>
                    <div className="flex justify-between mb-2">
                      <span className="meta-text text-[10px]">ORDER TOTAL</span>
                      <span className="heading-display text-2xl metallic-text">${total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-4">
                  <button onClick={() => setStep(1)} className="px-8 py-4 cursor-hover meta-text text-xs"
                    style={{ border: '1px solid rgba(0,245,255,0.2)', color: 'rgba(245,245,247,0.5)' }}>
                    ← BACK
                  </button>
                  <button
                    onClick={placeOrder}
                    disabled={placing || !payment.card || !payment.name}
                    className="flex-1 py-4 cursor-hover meta-text text-xs transition-all duration-300"
                    style={{ background: placing ? 'rgba(212,175,55,0.5)' : 'var(--gold)', color: 'var(--obsidian)' }}>
                    {placing ? 'PROCESSING...' : `PLACE ORDER — $${total.toFixed(2)}`}
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 3: CONFIRMED */}
            {step === 3 && (
              <motion.div key="done" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className="text-center py-16">
                <motion.div
                  initial={{ scale: 0 }} animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300, delay: 0.2 }}
                  className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-8"
                  style={{ background: 'rgba(0,245,255,0.1)', border: '2px solid var(--neon-cyan)', boxShadow: '0 0 30px rgba(0,245,255,0.3)' }}>
                  <Check size={36} style={{ color: 'var(--neon-cyan)' }} />
                </motion.div>
                <span className="meta-text text-[10px] block mb-4" style={{ color: 'var(--neon-cyan)' }}>ORDER CONFIRMED</span>
                <h2 className="heading-display text-5xl mb-4" style={{ color: 'var(--carrara)' }}>
                  Thank you for your <span className="metallic-text">order</span>
                </h2>
                {orderId && (
                  <p className="meta-text text-xs mb-2" style={{ color: 'rgba(245,245,247,0.4)' }}>
                    ORDER #{orderId.slice(-8).toUpperCase()}
                  </p>
                )}
                <p className="text-sm mb-12" style={{ color: 'rgba(245,245,247,0.4)', lineHeight: 1.8 }}>
                  Your garments will be hand-wrapped and dispatched within 3–5 business days.
                  A confirmation has been sent to your profile.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link to="/profile" className="px-10 py-4 cursor-hover meta-text text-xs"
                    style={{ border: '1px solid var(--neon-cyan)', color: 'var(--neon-cyan)' }}>
                    VIEW ORDERS
                  </Link>
                  <Link to="/" className="px-10 py-4 cursor-hover meta-text text-xs"
                    style={{ background: 'var(--gold)', color: 'var(--obsidian)' }}>
                    CONTINUE SHOPPING
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}