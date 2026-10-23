import { Suspense, useEffect, useRef, useState } from 'react';

/** Load visually heavy homepage sections only as they approach the viewport. */
export default function DeferredSection({ id, children, minHeight = '60vh' }) {
  const ref = useRef(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (enabled) return undefined;
    if (!('IntersectionObserver' in window)) { setEnabled(true); return undefined; }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setEnabled(true);
        observer.disconnect();
      }
    }, { rootMargin: '1000px 0px', threshold: 0 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [enabled]);

  return (
    <section id={id} ref={ref} style={enabled ? undefined : { minHeight }}>
      {enabled && (
        <Suspense fallback={<div role="status" aria-label="Loading content" style={{ minHeight, background: 'var(--metal-dark)' }} />}>
          {children}
        </Suspense>
      )}
    </section>
  );
}
