import { useEffect, useState } from 'react';

const QUERY = '(max-width: 1023px), (pointer: coarse), (prefers-reduced-motion: reduce)';

/** True on phones/tablets (or reduced motion) — used to disable scroll-linked parallax that jitters on touch scrolling. */
export default function useCompactMotion() {
  const [compact, setCompact] = useState(() => typeof window !== 'undefined' && window.matchMedia(QUERY).matches);
  useEffect(() => {
    const mq = window.matchMedia(QUERY);
    const sync = () => setCompact(mq.matches);
    mq.addEventListener?.('change', sync);
    return () => mq.removeEventListener?.('change', sync);
  }, []);
  return compact;
}