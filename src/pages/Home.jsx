import { lazy, Suspense, useEffect, useState } from 'react';
import Navbar from '@/components/wegottado/Navbar';
import HoloCursor from '@/components/wegottado/HoloCursor';
import HeroSection from '@/components/wegottado/HeroSection';
import DeferredSection from '@/components/wegottado/DeferredSection';

const HoloGrid = lazy(() => import('@/components/wegottado/HoloGrid'));
const GoldenParticles = lazy(() => import('@/components/wegottado/GoldenParticles'));
const GoldenSeam = lazy(() => import('@/components/wegottado/GoldenSeam'));
const SideNav = lazy(() => import('@/components/wegottado/SideNav'));
const ProductSpotlight = lazy(() => import('@/components/wegottado/ProductSpotlight'));
const ManifestoSection = lazy(() => import('@/components/wegottado/ManifestoSection'));
const HoloShowroom = lazy(() => import('@/components/wegottado/HoloShowroom'));
const FeaturedCollection = lazy(() => import('@/components/wegottado/FeaturedCollection'));
const CraftSection = lazy(() => import('@/components/wegottado/CraftSection'));
const LookbookSection = lazy(() => import('@/components/wegottado/LookbookSection'));
const MaisonSection = lazy(() => import('@/components/wegottado/MaisonSection'));
const PreOrdersPreview = lazy(() => import('@/components/wegottado/PreOrdersPreview'));
const Footer = lazy(() => import('@/components/wegottado/Footer'));

export default function Home() {
  const [showDecor, setShowDecor] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px) and (prefers-reduced-motion: no-preference)');
    const hero = document.getElementById('hero');
    if (!hero) return undefined;
    let heroVisible = true;
    const sync = () => setShowDecor(mq.matches && heroVisible && !document.hidden);
    const observer = new IntersectionObserver(([entry]) => {
      heroVisible = entry.isIntersecting;
      sync();
    }, { threshold: 0 });
    observer.observe(hero);
    sync();
    mq.addEventListener?.('change', sync);
    document.addEventListener('visibilitychange', sync);
    return () => {
      observer.disconnect();
      mq.removeEventListener?.('change', sync);
      document.removeEventListener('visibilitychange', sync);
    };
  }, []);

  return (
    <div className="film-grain relative" style={{ background: 'var(--metal-dark)' }}>
      <Navbar />
      <HoloCursor />
      <Suspense fallback={null}>
        {showDecor && <><HoloGrid /><GoldenParticles /><GoldenSeam /></>}
        <div className="hidden lg:block"><SideNav /></div>
      </Suspense>
      <HeroSection />
      <DeferredSection id="interactive-rack" minHeight="100svh"><ProductSpotlight /></DeferredSection>
      <DeferredSection id="manifesto"><ManifestoSection /></DeferredSection>
      <DeferredSection id="collections"><HoloShowroom /></DeferredSection>
      <DeferredSection id="featured"><FeaturedCollection /></DeferredSection>
      <DeferredSection id="pre-orders-preview"><PreOrdersPreview /></DeferredSection>
      <DeferredSection id="craft"><CraftSection /></DeferredSection>
      <DeferredSection id="lookbook"><LookbookSection /></DeferredSection>
      <DeferredSection id="maison"><MaisonSection /></DeferredSection>
      <DeferredSection id="footer" minHeight="20vh"><Footer /></DeferredSection>
    </div>
  );
}
