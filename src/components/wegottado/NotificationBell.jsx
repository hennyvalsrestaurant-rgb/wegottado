import React, { useState, useEffect, useRef } from 'react';
import { Bell } from 'lucide-react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';

const NOTIF_ICONS = { order: '📦', promo: '✨', system: '⚙️', delivery: '🚚' };

export default function NotificationBell({ user }) {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!user) return;
    base44.entities.Notification.filter({ user_id: user.id }, '-created_date', 20)
      .then(setNotifications).catch(() => {});
  }, [user]);

  useEffect(() => {
    const onClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const markRead = async (n) => {
    if (n.read) return;
    await base44.entities.Notification.update(n.id, { read: true });
    setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, read: true } : x));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(o => !o)} className="relative cursor-hover" style={{ color: 'rgba(245,245,247,0.5)' }}>
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full text-[8px] flex items-center justify-center"
            style={{ background: 'var(--neon-cyan)', color: 'var(--obsidian)' }}>
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 max-h-96 overflow-y-auto z-50"
          style={{ background: 'var(--metal-mid)', border: '1px solid rgba(0,245,255,0.2)', boxShadow: '0 8px 32px rgba(0,0,0,0.6)' }}>
          <div className="px-4 py-3" style={{ borderBottom: '1px solid rgba(0,245,255,0.1)' }}>
            <span className="meta-text text-[10px]" style={{ color: 'var(--neon-cyan)' }}>NOTIFICATIONS</span>
          </div>
          {notifications.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-sm" style={{ color: 'rgba(245,245,247,0.3)' }}>No notifications</p>
            </div>
          ) : notifications.map(n => (
            <button
              key={n.id}
              onClick={() => markRead(n)}
              className="w-full text-left flex items-start gap-3 px-4 py-3 cursor-hover transition-colors"
              style={{ borderBottom: '1px solid rgba(0,245,255,0.06)', opacity: n.read ? 0.55 : 1 }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,245,255,0.04)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <span className="text-lg flex-shrink-0">{NOTIF_ICONS[n.type] || '🔔'}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="meta-text text-[9px] truncate" style={{ color: n.read ? 'rgba(245,245,247,0.4)' : 'var(--neon-cyan)' }}>
                    {n.title}
                  </span>
                  {!n.read && <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: 'var(--neon-cyan)' }} />}
                </div>
                <p className="text-xs mt-1 line-clamp-2" style={{ color: 'rgba(245,245,247,0.6)' }}>{n.message}</p>
                <p className="meta-text text-[8px] mt-1" style={{ color: 'rgba(245,245,247,0.25)' }}>
                  {new Date(n.created_date).toLocaleString()}
                </p>
              </div>
            </button>
          ))}
          <Link
            to="/profile?tab=notifications"
            onClick={() => setOpen(false)}
            className="block text-center py-3 meta-text text-[10px] cursor-hover"
            style={{ color: 'var(--gold)', borderTop: '1px solid rgba(212,175,55,0.15)' }}
          >
            VIEW ALL
          </Link>
        </div>
      )}
    </div>
  );
}