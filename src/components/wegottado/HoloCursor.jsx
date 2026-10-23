import { useEffect, useRef } from 'react';

/**
 * Decorative hover halo that supplements (never replaces) the system cursor.
 * Event delegation avoids duplicated listeners and MutationObserver work.
 */
export default function HoloCursor() {
  const haloRef = useRef(null);

  useEffect(() => {
    const halo = haloRef.current;
    if (!halo || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return undefined;

    const hide = () => { halo.style.opacity = '0'; };
    const onMove = (event) => {
      if (event.pointerType !== 'mouse') { hide(); return; }
      const target = event.target;
      const interactive = target instanceof Element &&
        target.closest('a[href], button:not(:disabled), [role="button"], .cursor-hover, input, select, textarea');
      if (!interactive) { hide(); return; }

      const onLight = Boolean(target.closest('.rack-experience, .bg-white'));
      halo.style.left = event.clientX + 'px';
      halo.style.top = event.clientY + 'px';
      halo.style.borderColor = onLight ? 'rgba(25,25,25,.76)' : 'rgba(212,175,55,.85)';
      halo.style.boxShadow = onLight ? '0 0 0 2px rgba(255,255,255,.55)' : '0 0 12px rgba(212,175,55,.26)';
      halo.style.opacity = '1';
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('blur', hide);
    document.addEventListener('pointerleave', hide);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('blur', hide);
      document.removeEventListener('pointerleave', hide);
    };
  }, []);

  return (
    <div
      ref={haloRef}
      aria-hidden="true"
      className="pointer-events-none fixed z-[9999] h-9 w-9 rounded-full border-2"
      style={{
        left: -100, top: -100, opacity: 0, transform: 'translate(-50%, -50%)',
        transition: 'opacity 120ms ease, border-color 120ms ease, box-shadow 120ms ease',
      }}
    />
  );
}
