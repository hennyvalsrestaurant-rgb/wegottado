import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { User, Package, Bell, LogOut, Edit2, Save, X, ChevronRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import HoloGrid from '@/components/wegottado/HoloGrid';

const TABS = [
  { id: 'profile', label: 'PROFILE', icon: User },
  { id: 'orders', label: 'ORDERS', icon: Package },
  { id: 'notifications', label: 'ALERTS', icon: Bell },
];

export default function Profile() {
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [tab, setTab] = useState('profile');
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
              <div className="space-y-4">
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
                ) : orders.map((order, i) => (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="holo-card p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 cursor-hover"
                  >
                    <div>
                      <span className="meta-text text-[10px] block mb-1" style={{ color: 'rgba(0,245,255,0.5)' }}>
                        ORDER #{order.id.slice(-8).toUpperCase()}
                      </span>
                      <p className="text-sm" style={{ color: 'var(--carrara)' }}>
                        {order.items?.length || 0} items — ${order.total?.toLocaleString()}
                      </p>
                      <p className="meta-text text-[10px] mt-1" style={{ color: 'rgba(245,245,247,0.3)' }}>
                        {new Date(order.created_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="meta-text text-[10px] px-3 py-1"
                        style={{
                          border: `1px solid ${STATUS_COLORS[order.status] || '#fff'}40`,
                          color: STATUS_COLORS[order.status] || '#fff',
                          background: `${STATUS_COLORS[order.status] || '#fff'}10`,
                        }}>
                        {(order.status || 'pending').toUpperCase()}
                      </span>
                      <ChevronRight size={14} style={{ color: 'rgba(245,245,247,0.3)' }} />
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

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