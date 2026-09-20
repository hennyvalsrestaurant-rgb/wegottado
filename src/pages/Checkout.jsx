import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Trash2, Plus, Minus, ArrowLeft, Check, MapPin, CreditCard, Wallet } from 'lucide-react';
import HoloGrid from '@/components/wegottado/HoloGrid';
import HoloCursor from '@/components/wegottado/HoloCursor';
import CurrencySelector, { useCurrency } from '@/components/wegottado/CurrencySelector';
import HennypayOption from '@/components/wegottado/HennypayOption';

const STEPS = ['BAG', 'SHIPPING', 'PAYMENT', 'CONFIRMED'];

export default function Checkout() {
  const [user, setUser] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [orderError, setOrderError] = useState(null);
  const navigate = useNavigate();

  const [shipping, setShipping] = useState({ name: '', address: '', city: '', country: 'US', zip: '' });
  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const addressDebounceRef = useRef(null);

  const fetchAddressSuggestions = useCallback((query) => {
    if (addressDebounceRef.current) clearTimeout(addressDebounceRef.current);
    if (query.length < 4) { setAddressSuggestions([]); return; }
    addressDebounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=5&q=${encodeURIComponent(query)}`,
          { headers: { 'Accept-Language': 'en' } }
        );
        const data = await res.json();
        setAddressSuggestions(data);
        setShowSuggestions(true);
      } catch { setAddressSuggestions([]); }
    }, 350);
  }, []);

  const selectAddress = (place) => {
    const a = place.address || {};
    const street = [a.house_number, a.road].filter(Boolean).join(' ') || place.display_name.split(',')[0];
    const city = a.city || a.town || a.village || a.county || '';
    const zip = a.postcode || '';
    setShipping(prev => ({ ...prev, address: street, city, zip }));
    setAddressSuggestions([]);
    setShowSuggestions(false);
  };

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

  const { currency, rate, format } = useCurrency();

  const subtotalUSD = cartItems.reduce((s, i) => s + i.price * i.quantity, 0);
  const taxUSD = subtotalUSD * 0.1;
  const totalUSD = subtotalUSD + taxUSD;

  // Display values in selected currency
  const subtotal = subtotalUSD * rate;
  const tax = taxUSD * rate;
  const total = totalUSD * rate;

  const handlePayWithStripe = async () => {
    setOrderError(null);
    setPlacing(true);
    try {
      const res = await base44.functions.invoke('create-stripe-checkout', {
        items: cartItems,
        userId: user?.id,
      });
      if (res.data.redirectUrl) {
        window.location.href = res.data.redirectUrl;
      } else {
        setOrderError(res.data.error || 'Checkout failed. Please try again.');
      }
    } catch (err) {
      console.error(err);
      setOrderError('Something went wrong. Please try again.');
    }
    setPlacing(false);
  };

  const handlePayWithWallet = async () => {
    setOrderError(null);
    setPlacing(true);
    try {
      const res = await base44.functions.invoke('pay-with-wallet', { items: cartItems });
      if (res.data.orderId) {
        setOrderId(res.data.orderId);
        setCartItems([]);
        setStep(3);
      } else {
        setOrderError(res.data.error || 'Payment failed. Please try again.');
      }
    } catch (err) {
      console.error(err);
      setOrderError(err?.response?.data?.error || 'Something went wrong. Please try again.');
    }
    setPlacing(false);
  };

  const handlePayWithHennypay = async () => {
    setOrderError(null);
    setPlacing(true);
    try {
      const res = await base44.functions.invoke('createHennypayCheckout', { items: cartItems, shipping });
      if (res.data.checkoutUrl) {
        window.location.href = res.data.checkoutUrl;
        return;
      }
      setOrderError(res.data.error || 'Hennypay checkout failed. Please try again.');
    } catch (err) {
      console.error(err);
      setOrderError(err?.response?.data?.error || 'Hennypay checkout failed. Please try again.');
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
      <HoloCursor />
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
          <img
            src="https://media.base44.com/images/public/6a401981c451758a55e9b4f5/b4cbae21f_generated_image.png"
            alt="WEGOTTADO"
            className="h-9 w-auto object-contain"
          />
          <div className="flex items-center gap-3">
            <CurrencySelector />
            <Link to="/profile" className="flex items-center gap-2 cursor-hover" style={{ color: 'rgba(245,245,247,0.4)' }}>
              <span className="meta-text text-[10px] hidden sm:block">MY PROFILE</span>
            </Link>
          </div>
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

        <div className="max-w-4xl mx-auto px-6 md:px-12 pb-20 relative z-20">
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
                        <div key={item.id} className="holo-card p-4 flex flex-col sm:flex-row sm:items-center gap-4">
                          {/* Top row on mobile: image + name + delete */}
                          <div className="flex items-start gap-4 flex-1 min-w-0">
                            <img src={item.product_image} alt={item.product_name}
                              className="w-16 h-16 sm:w-20 sm:h-20 object-cover flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <h4 className="heading-display text-lg sm:text-xl" style={{ color: 'var(--carrara)' }}>{item.product_name}</h4>
                              <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                                <span className="meta-text text-[10px]" style={{ color: 'var(--gold)' }}>
                                  {format(item.price)}
                                </span>
                                {item.size && (
                                  <span className="meta-text text-[9px] px-2 py-0.5" style={{ border: '1px solid rgba(0,245,255,0.2)', color: 'var(--neon-cyan)' }}>
                                    SIZE {item.size}
                                  </span>
                                )}
                              </div>
                            </div>
                            {/* Delete — always visible, top-right on mobile */}
                            <button onClick={() => removeItem(item)} className="cursor-hover p-2 flex items-center justify-center flex-shrink-0 sm:hidden"
                              style={{ border: '1px solid rgba(255,68,68,0.3)', color: '#FF4444', background: 'rgba(255,68,68,0.06)' }}>
                              <Trash2 size={14} />
                            </button>
                          </div>
                          {/* Bottom row on mobile: qty + total + delete (desktop) */}
                          <div className="flex items-center gap-3 justify-between sm:justify-end">
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
                              {format(item.price * item.quantity)}
                            </span>
                            {/* Delete — desktop only */}
                            <button onClick={() => removeItem(item)} className="cursor-hover p-2 flex items-center justify-center flex-shrink-0 hidden sm:flex"
                              style={{ border: '1px solid rgba(255,68,68,0.3)', color: '#FF4444', background: 'rgba(255,68,68,0.06)' }}>
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Summary */}
                    <div className="holo-card p-6 mb-6">
                      <div className="space-y-3 mb-4">
                        {[['SUBTOTAL', subtotalUSD], ['TAX (10%)', taxUSD]].map(([l, v]) => (
                          <div key={l} className="flex justify-between">
                            <span className="meta-text text-[10px]">{l}</span>
                            <span className="meta-text text-xs" style={{ color: 'rgba(245,245,247,0.7)' }}>
                              {format(v)}
                            </span>
                          </div>
                        ))}
                        <div className="flex justify-between pt-3" style={{ borderTop: '1px solid rgba(0,245,255,0.1)' }}>
                          <span className="meta-text text-[10px]" style={{ color: 'var(--neon-cyan)' }}>TOTAL</span>
                          <span className="heading-display text-2xl metallic-text">{format(totalUSD)}</span>
                        </div>
                      </div>
                    </div>

                    <button onClick={() => setStep(1)}
                      className="w-full py-4 cursor-hover meta-text text-xs transition-all duration-300 relative z-20"
                      style={{ background: 'var(--gold)', color: 'var(--obsidian)' }}>
                      PROCEED TO CHECKOUT →
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
                  {/* Full Name */}
                  <div>
                    <label className="meta-text text-[10px] block mb-2" style={{ color: 'rgba(0,245,255,0.5)' }}>FULL NAME</label>
                    <input
                      value={shipping.name}
                      onChange={e => setShipping(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Your name"
                      className="holo-input w-full px-4 py-3"
                    />
                  </div>

                  {/* Address with autocomplete */}
                  <div className="relative">
                    <label className="meta-text text-[10px] block mb-2" style={{ color: 'rgba(0,245,255,0.5)' }}>STREET ADDRESS</label>
                    <div className="relative">
                      <input
                        value={shipping.address}
                        onChange={e => {
                          setShipping(prev => ({ ...prev, address: e.target.value }));
                          fetchAddressSuggestions(e.target.value);
                        }}
                        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                        onFocus={() => addressSuggestions.length > 0 && setShowSuggestions(true)}
                        placeholder="Start typing your address…"
                        className="holo-input w-full px-4 py-3 pr-10"
                      />
                      <MapPin size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                        style={{ color: 'rgba(0,245,255,0.35)' }} />
                    </div>
                    {showSuggestions && addressSuggestions.length > 0 && (
                      <div className="absolute left-0 right-0 top-full mt-1 z-50 overflow-hidden"
                        style={{ background: 'var(--metal-mid)', border: '1px solid rgba(0,245,255,0.2)', boxShadow: '0 8px 32px rgba(0,0,0,0.6)' }}>
                        {addressSuggestions.map((place, idx) => (
                          <button
                            key={place.place_id}
                            type="button"
                            onMouseDown={() => selectAddress(place)}
                            className="w-full text-left px-4 py-3 cursor-hover transition-colors"
                            style={{
                              borderBottom: idx < addressSuggestions.length - 1 ? '1px solid rgba(0,245,255,0.06)' : 'none',
                              background: 'transparent',
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,245,255,0.06)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                          >
                            <p className="text-xs truncate" style={{ color: 'var(--carrara)' }}>{place.display_name.split(',').slice(0, 3).join(',')}</p>
                            <p className="meta-text mt-0.5 truncate" style={{ fontSize: '9px', color: 'rgba(0,245,255,0.4)' }}>
                              {place.display_name.split(',').slice(3).join(',').trim()}
                            </p>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Apartment / Suite (optional) */}
                  <div>
                    <label className="meta-text text-[10px] block mb-2" style={{ color: 'rgba(0,245,255,0.5)' }}>
                      APT / SUITE / FLOOR <span style={{ color: 'rgba(245,245,247,0.25)' }}>(OPTIONAL)</span>
                    </label>
                    <input
                      value={shipping.apt || ''}
                      onChange={e => setShipping(prev => ({ ...prev, apt: e.target.value }))}
                      placeholder="Apt 4B, Suite 200, Floor 3…"
                      className="holo-input w-full px-4 py-3"
                    />
                  </div>

                  {/* City & Zip */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="meta-text text-[10px] block mb-2" style={{ color: 'rgba(0,245,255,0.5)' }}>CITY</label>
                      <input
                        value={shipping.city}
                        onChange={e => setShipping(prev => ({ ...prev, city: e.target.value }))}
                        placeholder="City"
                        className="holo-input w-full px-4 py-3"
                      />
                    </div>
                    <div>
                      <label className="meta-text text-[10px] block mb-2" style={{ color: 'rgba(0,245,255,0.5)' }}>ZIP CODE</label>
                      <input
                        value={shipping.zip}
                        onChange={e => setShipping(prev => ({ ...prev, zip: e.target.value }))}
                        placeholder="Postal code"
                        className="holo-input w-full px-4 py-3"
                      />
                    </div>
                  </div>
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
                  <span className="metallic-text">Payment</span> Method
                </h2>

                {/* Order summary */}
                <div className="holo-card p-6 mb-6">
                  <div className="space-y-3">
                    {[['SUBTOTAL', subtotalUSD], ['TAX (10%)', taxUSD]].map(([l, v]) => (
                      <div key={l} className="flex justify-between">
                        <span className="meta-text text-[10px]">{l}</span>
                        <span className="meta-text text-xs" style={{ color: 'rgba(245,245,247,0.7)' }}>{format(v)}</span>
                      </div>
                    ))}
                    <div className="flex justify-between pt-3" style={{ borderTop: '1px solid rgba(0,245,255,0.1)' }}>
                      <span className="meta-text text-[10px]" style={{ color: 'var(--neon-cyan)' }}>TOTAL</span>
                      <span className="heading-display text-2xl metallic-text">{format(totalUSD)}</span>
                    </div>
                  </div>
                </div>

                <p className="meta-text text-[10px] mb-4" style={{ color: 'rgba(245,245,247,0.4)' }}>
                  SELECT PAYMENT PROVIDER — YOU WILL BE REDIRECTED TO A SECURE CHECKOUT PAGE
                </p>

                <div className="space-y-4 mb-6">
                  {/* Wallet */}
                  {(user?.wallet_balance || 0) >= totalUSD && (
                    <button
                      type="button"
                      onClick={handlePayWithWallet}
                      disabled={placing}
                      className="w-full py-5 px-6 cursor-hover flex items-center justify-between transition-all duration-300 holo-card"
                      style={{ border: '1px solid rgba(212,175,55,0.4)', opacity: placing ? 0.6 : 1 }}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 flex items-center justify-center"
                          style={{ background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.3)' }}>
                          <Wallet size={18} style={{ color: 'var(--gold)' }} />
                        </div>
                        <div className="text-left">
                          <p className="meta-text text-[11px]" style={{ color: 'var(--gold)' }}>PAY WITH WALLET</p>
                          <p className="text-xs mt-0.5" style={{ color: 'rgba(245,245,247,0.4)' }}>
                            Balance: ${(user?.wallet_balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </p>
                        </div>
                      </div>
                      <span className="meta-text text-[10px]" style={{ color: 'rgba(245,245,247,0.3)' }}>
                        {placing ? 'PROCESSING...' : '→'}
                      </span>
                    </button>
                  )}

                  <HennypayOption onPay={handlePayWithHennypay} disabled={placing} />

                  {/* Stripe */}
                  <button
                    type="button"
                    onClick={handlePayWithStripe}
                    disabled={placing}
                    className="w-full py-5 px-6 cursor-hover flex items-center justify-between transition-all duration-300 holo-card"
                    style={{ border: '1px solid rgba(0,245,255,0.2)', opacity: placing ? 0.6 : 1 }}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 flex items-center justify-center"
                        style={{ background: 'rgba(0,245,255,0.08)', border: '1px solid rgba(0,245,255,0.2)' }}>
                        <CreditCard size={18} style={{ color: 'var(--neon-cyan)' }} />
                      </div>
                      <div className="text-left">
                        <p className="meta-text text-[11px]" style={{ color: 'var(--neon-cyan)' }}>STRIPE</p>
                        <p className="text-xs mt-0.5" style={{ color: 'rgba(245,245,247,0.4)' }}>Credit / Debit card via Stripe</p>
                      </div>
                    </div>
                    <span className="meta-text text-[10px]" style={{ color: 'rgba(245,245,247,0.3)' }}>
                      {placing ? 'REDIRECTING...' : '→'}
                    </span>
                  </button>
                </div>

                {orderError && (
                  <p className="mb-4 text-xs px-1" style={{ color: '#FF6B6B' }}>{orderError}</p>
                )}
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-8 py-4 cursor-hover meta-text text-xs"
                  style={{ border: '1px solid rgba(0,245,255,0.2)', color: 'rgba(245,245,247,0.5)' }}>
                  ← BACK
                </button>
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