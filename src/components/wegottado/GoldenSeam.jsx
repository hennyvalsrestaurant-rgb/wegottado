import React, { useState, useEffect } from 'react';

export default function GoldenSeam() {
  const [height, setHeight] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const scrolled = window.scrollY;
      const total = document.documentElement.scrollHeight - window.innerHeight;
      setHeight(total > 0 ? (scrolled / total) * 100 : 0);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="golden-seam" style={{ height: '100vh' }}>
      <div
        className="absolute top-0 left-0 w-full"
        style={{
          height: `${height}%`,
          background: 'linear-gradient(to bottom, var(--gold), transparent)',
          opacity: 0.4,
          transition: 'height 0.1s linear',
        }}
      />
    </div>
  );
}