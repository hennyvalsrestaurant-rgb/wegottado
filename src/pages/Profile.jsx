import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { User, Package, Bell, LogOut, Edit2, Save, X, ChevronRight, Truck, CheckCircle2, Clock, RotateCcw, XCircle, Wallet, TrendingUp, CreditCard, ShoppingBag } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import HoloGrid from '@/components/wegottado/HoloGrid';
import HoloCursor from '@/components/wegottado/HoloCursor';

const TABS = [
  { id: 'profile', label: 'PROFILE', icon: User },
  { id: 'orders', label: 'ORDERS', icon: Package },
  { id: 'wallet', label: 'WALLET', icon: Wallet },
  { id: 'notifications', label: 'ALERTS', icon: Bell },
];

export default function Profile() {
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const initialTab = new URLSearchParams(window.location.search).get('tab');
  const [tab, setTab] = useState(TABS.some(t => t.id === initialTab) ? initialTab : 'profile');
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const me = await base44.auth.me();
        setUser(me);
        setEditData({ full_name: me.full_name || '', email: me.email || '' });
        const [ords, notifs] = await Promise.all([
          base44.entities.Order.filter({ user_id: me.id }, '-created_date', 20),
          base44.entities.Notification.filter({ user_id: me.id }, '-created_date', 30),
        ]);
        setOrders(ords);
        setNotifications(notifs);
      } catch {
        navigate('/login');
      }
      setLoading(false);
    };
    load();
  }, [navigate]);

  const saveProfile = async () => {
    await base44.auth.updateMe({ full_name: editData.full_name });
    setUser(prev => ({ ...prev, full_name: editData.full_name }));
    setEditing(false);
  };

  const markRead = async (notif) => {
    await base44.entities.Notification.update(notif.id, { read: true });
    setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, read: true } : n));
  };

  const handleLogout = () => base44.auth.logout('/');

  const unread = notifications.filter(n => !n.read).length;

  const STATUS_COLORS = {
    pending: '#D4AF37',
    confirmed: '#00F5FF',
    processing: '#7B2FFF',
    shipped: '#30D5C8',
    delivered: '#00FF88',
    cancelled: '#FF4444',
  };

  const STATUS_STEPS = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];

  const STATUS_META = {
    pending:    { icon: Clock,        label: 'Order Pending',     desc: 'Awaiting confirmation' },
    confirmed:  { icon: CheckCircle2, label: 'Order Confirmed',   desc: 'Payment verified' },
    processing: { icon: RotateCcw,    label: 'Being Prepared',    desc: 'Hand-wrapping your pieces' },
    shipped:    { icon: Truck,        label: 'Dispatched',        desc: 'On its way to you' },
    delivered:  { icon: CheckCircle2, label: 'Delivered',         desc: 'Enjoy your purchase' },
    cancelled:  { icon: XCircle,      label: 'Cancelled',         desc: 'Order was cancelled' },
  };

  const NOTIF_ICONS = { order: '📦', promo: '✨', system: '⚙️', delivery: '🚚' };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--metal-dark)' }}>
        <div className="text-center">
          <div className="w-12 h-12 border border-[var(--neon-cyan)] rounded-full animate-spin mx-auto mb-4"
            style={{ borderTopColor: 'transparent' }} />
          <span className="meta-text text-[10px]" style={{ color: 'var(--neon-cyan)' }}>LOADING PROFILE</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen page-enter relative" style={{ background: 'var(--metal-dark)' }}>
      <HoloCursor />
      <HoloGrid />
      <div className="relative z-10">
        {/* Top bar */}
        <div className="flex items-center justify-between px-6 md:px-12 py-5"
          style={{ borderBottom: '1px solid rgba(0,245,255,0.1)' }}>
          <Link to="/" className="heading-display text-xl cursor-hover" style={{ color: 'var(--gold)' }}>
            WEGOTTADO
          </Link>
          <div className="flex items-center gap-6">
            <Link to="/checkout" className="meta-text text-[10px] cursor-hover" style={{ color: 'rgba(245,245,247,0.5)' }}>
              CHECKOUT
            </Link>
            <button onClick={handleLogout} className="flex items-center gap-2 cursor-hover"
              style={{ color: 'rgba(245,245,247,0.4)' }}>
              <LogOut size={14} />
              <span className="meta-text text-[10px]">SIGN OUT</span>
            </button>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-6 md:px-12 py-12">
          {/* Hero profile header */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
            <div className="holo-card p-8 relative overflow-hidden">
              <div className="holo-shimmer absolute inset-0 pointer-events-none opacity-30" />
              <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-6">
                {/* Avatar */}
                <div className="w-20 h-20 rounded-full flex items-center justify-center relative"
                  style={{ background: 'linear-gradient(135deg, rgba(212,175,55,0.2), rgba(0,245,255,0.1))', border: '2px solid var(--neon-cyan)', boxShadow: '0 0 20px rgba(0,245,255,0.3)' }}>
                  <span className="heading-display text-3xl" style={{ color: 'var(--gold)' }}>
                    {(user?.full_name || user?.email || 'U')[0].toUpperCase()}
                  </span>
                </div>
                <div className="flex-1">
                  <span className="meta-text text-[10px] block mb-2" style={{ color: 'var(--neon-cyan)' }}>MAISON MEMBER</span>
                  <h1 className="heading-display text-3xl md:text-4xl" style={{ color: 'var(--carrara)' }}>
                    {user?.full_name || 'Valued Client'}
                  </h1>
                  <p className="text-sm mt-1" style={{ color: 'rgba(245,245,247,0.4)' }}>{user?.email}</p>
                </div>
                <div className="text-right hidden sm:block">
                  <span className="meta-text text-[10px] block mb-1">TOTAL ORDERS</span>
                  <span className="heading-display text-4xl" style={{ color: 'var(--gold)' }}>{orders.length}</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Tabs */}
          <div className="flex gap-1 mb-8">
            {TABS.map(t => {
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className="flex items-center gap-2 px-5 py-3 cursor-hover transition-all duration-300"
                  style={{
                    borderBottom: `2px solid ${tab === t.id ? 'var(--neon-cyan)' : 'transparent'}`,
                    color: tab === t.id ? 'var(--neon-cyan)' : 'rgba(245,245,247,0.4)',
                  }}
                >
                  <Icon size={14} />
                  <span className="meta-text text-[10px]">{t.label}</span>
                  {t.id === 'notifications' && unread > 0 && (
                    <span className="w-4 h-4 rounded-full text-[9px] flex items-center justify-center"
                      style={{ background: 'var(--neon-cyan)', color: 'var(--obsidian)' }}>
                      {unread}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Tab content */}
          <motion.div key={tab} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>

            {/* PROFILE TAB */}
            {tab === 'profile' && (
              <div className="holo-card p-8">
                <div className="flex items-center justify-between mb-8">
                  <span className="meta-text text-[10px]" style={{ color: 'var(--neon-cyan)' }}>PERSONAL DETAILS</span>
                  {!editing ? (
                    <button onClick={() => setEditing(true)} className="flex items-center gap-2 cursor-hover"
                      style={{ color: 'var(--gold)' }}>
                      <Edit2 size={14} />
                      <span className="meta-text text-[10px]">EDIT</span>
                    </button>
                  ) : (
                    <div className="flex gap-3">
                      <button onClick={saveProfile} className="flex items-center gap-2 cursor-hover" style={{ color: 'var(--neon-cyan)' }}>
                        <Save size={14} /><span className="meta-text text-[10px]">SAVE</span>
                      </button>
                      <button onClick={() => setEditing(false)} className="cursor-hover" style={{ color: 'rgba(245,245,247,0.4)' }}>
                        <X size={14} />
                      </button>
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {[
                    { label: 'FULL NAME', key: 'full_name', editable: true },
                    { label: 'EMAIL ADDRESS', key: 'email', editable: false },
                  ].map(f => (
                    <div key={f.key}>
                      <label className="meta-text text-[10px] block mb-3" style={{ color: 'rgba(0,245,255,0.5)' }}>
                        {f.label}
                      </label>
                      {editing && f.editable ? (
                        <input
                          value={editData[f.key] || ''}
                          onChange={e => setEditData(prev => ({ ...prev, [f.key]: e.target.value }))}
                          className="holo-input w-full px-4 py-3"
                        />
                      ) : (
                        <p className="text-sm py-3" style={{ color: 'var(--carrara)', borderBottom: '1px solid rgba(0,245,255,0.1)' }}>
                          {user?.[f.key] || '—'}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
                <div className="mt-8 pt-8" style={{ borderTop: '1px solid rgba(0,245,255,0.08)' }}>
                  <span className="meta-text text-[10px] block mb-4" style={{ color: 'rgba(0,245,255,0.5)' }}>MEMBERSHIP STATUS</span>
                  <div className="flex items-center gap-4">
                    <div className="px-4 py-2 flex items-center gap-2"
                      style={{ background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.2)' }}>
                      <div className="w-2 h-2 rounded-full pulse-neon" style={{ background: 'var(--gold)' }} />
                      <span className="meta-text text-[10px]" style={{ color: 'var(--gold)' }}>MAISON GOLD MEMBER</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ORDERS TAB */}
            {tab === 'orders' && (
              <div className="space-y-6">
                {orders.length === 0 ? (
                  <div className="holo-card p-12 text-center">
                    <Package size={40} className="mx-auto mb-4 opacity-20" />
                    <p className="heading-display text-2xl mb-2" style={{ color: 'rgba(245,245,247,0.4)' }}>No orders yet</p>
                    <p className="text-sm mb-6" style={{ color: 'rgba(245,245,247,0.3)' }}>Your purchase history will appear here</p>
                    <Link to="/" className="meta-text text-[10px] cursor-hover py-3 px-8 inline-block"
                      style={{ border: '1px solid var(--gold)', color: 'var(--gold)' }}>
                      EXPLORE COLLECTION
                    </Link>
                  </div>
                ) : orders.map((order, i) => {
                  const status = order.status || 'pending';
                  const isCancelled = status === 'cancelled';
                  const currentStep = STATUS_STEPS.indexOf(status);
                  const meta = STATUS_META[status] || STATUS_META.pending;
                  const StatusIcon = meta.icon;

                  return (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="holo-card p-6"
                    >
                      {/* Order header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
                        <div>
                          <span className="meta-text text-[10px] block mb-1" style={{ color: 'rgba(0,245,255,0.5)' }}>
                            ORDER #{order.id.slice(-8).toUpperCase()}
                          </span>
                          <p className="text-sm" style={{ color: 'var(--carrara)' }}>
                            {order.items?.length || 0} item{order.items?.length !== 1 ? 's' : ''} · <span className="metallic-text">${order.total?.toLocaleString()}</span>
                          </p>
                          <p className="meta-text text-[10px] mt-1" style={{ color: 'rgba(245,245,247,0.3)' }}>
                            {new Date(order.created_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 self-start sm:self-center px-3 py-2"
                          style={{
                            border: `1px solid ${STATUS_COLORS[status] || '#fff'}40`,
                            background: `${STATUS_COLORS[status] || '#fff'}0d`,
                          }}>
                          <StatusIcon size={13} style={{ color: STATUS_COLORS[status] }} />
                          <span className="meta-text text-[10px]" style={{ color: STATUS_COLORS[status] }}>
                            {meta.label.toUpperCase()}
                          </span>
                        </div>
                      </div>

                      {/* Tracking timeline */}
                      {!isCancelled ? (
                        <div className="relative">
                          {/* Progress bar track */}
                          <div className="absolute top-3 left-3 right-3 h-px" style={{ background: 'rgba(0,245,255,0.1)' }} />
                          <div
                            className="absolute top-3 left-3 h-px transition-all duration-700"
                            style={{
                              background: `linear-gradient(to right, var(--neon-cyan), var(--gold))`,
                              width: currentStep < 0 ? '0%' : `calc(${(currentStep / (STATUS_STEPS.length - 1)) * 100}% - 24px)`,
                              boxShadow: '0 0 8px rgba(0,245,255,0.4)',
                            }}
                          />
                          <div className="flex justify-between relative z-10">
                            {STATUS_STEPS.map((step, idx) => {
                              const done = currentStep >= idx;
                              const active = currentStep === idx;
                              const StepMeta = STATUS_META[step];
                              const StepIcon = StepMeta.icon;
                              return (
                                <div key={step} className="flex flex-col items-center gap-2" style={{ flex: 1 }}>
                                  <div className="w-6 h-6 rounded-full flex items-center justify-center transition-all duration-500"
                                    style={{
                                      background: done ? (active ? 'var(--neon-cyan)' : 'rgba(0,245,255,0.2)') : 'rgba(0,245,255,0.06)',
                                      border: `1px solid ${done ? 'var(--neon-cyan)' : 'rgba(0,245,255,0.15)'}`,
                                      boxShadow: active ? '0 0 12px rgba(0,245,255,0.5)' : 'none',
                                    }}>
                                    <StepIcon size={11} style={{ color: done ? (active ? 'var(--obsidian)' : 'var(--neon-cyan)') : 'rgba(0,245,255,0.3)' }} />
                                  </div>
                                  <span className="meta-text text-center hidden sm:block"
                                    style={{ fontSize: '8px', color: done ? 'var(--neon-cyan)' : 'rgba(245,245,247,0.25)', lineHeight: 1.3 }}>
                                    {StepMeta.label.toUpperCase()}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                          {/* Current status description */}
                          <p className="meta-text mt-4 text-center" style={{ fontSize: '10px', color: 'rgba(245,245,247,0.4)' }}>
                            {meta.desc}
                          </p>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 py-2" style={{ borderTop: '1px solid rgba(255,68,68,0.1)' }}>
                          <XCircle size={14} style={{ color: '#FF4444' }} />
                          <span className="meta-text text-[10px]" style={{ color: 'rgba(255,68,68,0.7)' }}>This order was cancelled</span>
                        </div>
                      )}

                      {/* Items preview */}
                      {order.items?.length > 0 && (
                        <div className="mt-4 pt-4 flex flex-wrap gap-2" style={{ borderTop: '1px solid rgba(0,245,255,0.06)' }}>
                          {order.items.map((item, idx) => (
                            <span key={idx} className="meta-text text-[9px] px-2 py-1"
                              style={{ background: 'rgba(0,245,255,0.04)', border: '1px solid rgba(0,245,255,0.1)', color: 'rgba(245,245,247,0.5)' }}>
                              {item.name} ×{item.qty || 1}
                            </span>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            )}

            {/* WALLET TAB */}
            {tab === 'wallet' && (() => {
              const totalSpent = orders.filter(o => o.status !== 'cancelled').reduce((s, o) => s + (o.total || 0), 0);
              const confirmedOrders = orders.filter(o => o.status === 'confirmed' || o.status === 'delivered' || o.status === 'shipped' || o.status === 'processing');
              const avgOrder = confirmedOrders.length ? totalSpent / confirmedOrders.length : 0;
              return (
                <div className="space-y-6">
                  {/* Balance cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                      { label: 'TOTAL SPENT', value: `$${totalSpent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, icon: TrendingUp, color: 'var(--gold)' },
                      { label: 'TOTAL ORDERS', value: confirmedOrders.length, icon: ShoppingBag, color: 'var(--neon-cyan)' },
                      { label: 'AVG ORDER VALUE', value: `$${avgOrder.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, icon: CreditCard, color: '#7B2FFF' },
                    ].map(({ label, value, icon: Icon, color }) => (
                      <div key={label} className="holo-card p-6">
                        <div className="flex items-center justify-between mb-4">
                          <span className="meta-text text-[10px]" style={{ color: 'rgba(0,245,255,0.5)' }}>{label}</span>
                          <Icon size={16} style={{ color }} />
                        </div>
                        <p className="heading-display text-3xl" style={{ color }}>{value}</p>
                      </div>
                    ))}
                  </div>

                  {/* Holographic wallet card visual */}
                  <div className="relative h-44 overflow-hidden"
                    style={{ background: 'linear-gradient(135deg, #0D0D14, #1A1A2E)', border: '1px solid rgba(212,175,55,0.25)' }}>
                    <div className="holo-shimmer absolute inset-0 opacity-60 pointer-events-none" />
                    <div className="absolute inset-6 pointer-events-none">
                      <div className="flex justify-between items-start mb-6">
                        <div>
                          <span className="meta-text text-[9px] block mb-1" style={{ color: 'rgba(212,175,55,0.6)' }}>WEGOTTADO MAISON</span>
                          <span className="heading-display text-lg" style={{ color: 'var(--gold)' }}>Digital Wallet</span>
                        </div>
                        <Wallet size={24} style={{ color: 'var(--gold)', opacity: 0.7 }} />
                      </div>
                      <div className="flex items-end justify-between">
                        <div>
                          <span className="meta-text text-[9px] block mb-1" style={{ color: 'rgba(245,245,247,0.3)' }}>CARDHOLDER</span>
                          <span className="meta-text text-xs" style={{ color: 'rgba(245,245,247,0.7)' }}>{user?.full_name || user?.email || 'VALUED CLIENT'}</span>
                        </div>
                        <div className="text-right">
                          <span className="meta-text text-[9px] block mb-1" style={{ color: 'rgba(245,245,247,0.3)' }}>MEMBER SINCE</span>
                          <span className="meta-text text-xs" style={{ color: 'rgba(245,245,247,0.7)' }}>
                            {user?.created_date ? new Date(user.created_date).getFullYear() : '2024'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Spending history */}
                  <div className="holo-card p-6">
                    <span className="meta-text text-[10px] block mb-5" style={{ color: 'var(--neon-cyan)' }}>SPENDING HISTORY</span>
                    {orders.length === 0 ? (
                      <div className="text-center py-8">
                        <ShoppingBag size={32} className="mx-auto mb-3 opacity-20" />
                        <p className="text-sm" style={{ color: 'rgba(245,245,247,0.3)' }}>No transactions yet</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {orders.slice(0, 8).map((order) => (
                          <div key={order.id} className="flex items-center justify-between py-3"
                            style={{ borderBottom: '1px solid rgba(0,245,255,0.06)' }}>
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 flex items-center justify-center"
                                style={{ background: order.status === 'cancelled' ? 'rgba(255,68,68,0.1)' : 'rgba(0,245,255,0.08)', border: `1px solid ${order.status === 'cancelled' ? 'rgba(255,68,68,0.2)' : 'rgba(0,245,255,0.15)'}` }}>
                                <Package size={13} style={{ color: order.status === 'cancelled' ? '#FF4444' : 'var(--neon-cyan)' }} />
                              </div>
                              <div>
                                <p className="meta-text text-[10px]" style={{ color: 'var(--carrara)' }}>ORDER #{order.id.slice(-6).toUpperCase()}</p>
                                <p className="meta-text text-[9px] mt-0.5" style={{ color: 'rgba(245,245,247,0.3)' }}>
                                  {new Date(order.created_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="meta-text text-xs" style={{ color: order.status === 'cancelled' ? '#FF4444' : 'var(--gold)' }}>
                                {order.status === 'cancelled' ? '—' : `$${(order.total || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
                              </p>
                              <p className="meta-text text-[9px] mt-0.5" style={{ color: 'rgba(245,245,247,0.3)' }}>{order.status?.toUpperCase()}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* NOTIFICATIONS TAB */}
            {tab === 'notifications' && (
              <div className="space-y-3">
                {notifications.length === 0 ? (
                  <div className="holo-card p-12 text-center">
                    <Bell size={40} className="mx-auto mb-4 opacity-20" />
                    <p className="heading-display text-2xl" style={{ color: 'rgba(245,245,247,0.4)' }}>No notifications</p>
                  </div>
                ) : notifications.map((n, i) => (
                  <motion.div
                    key={n.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    onClick={() => markRead(n)}
                    className="holo-card p-5 flex items-start gap-4 cursor-hover transition-all duration-300"
                    style={{ opacity: n.read ? 0.55 : 1 }}
                  >
                    <span className="text-2xl flex-shrink-0">{NOTIF_ICONS[n.type] || '🔔'}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="meta-text text-[10px]" style={{ color: n.read ? 'rgba(245,245,247,0.4)' : 'var(--neon-cyan)' }}>
                          {n.title}
                        </span>
                        {!n.read && <div className="w-2 h-2 rounded-full pulse-neon" style={{ background: 'var(--neon-cyan)' }} />}
                      </div>
                      <p className="text-sm" style={{ color: 'rgba(245,245,247,0.6)' }}>{n.message}</p>
                      <p className="meta-text text-[9px] mt-2" style={{ color: 'rgba(245,245,247,0.25)' }}>
                        {new Date(n.created_date).toLocaleString()}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}