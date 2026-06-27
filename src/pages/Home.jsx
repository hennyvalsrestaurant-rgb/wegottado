import React from 'react';
import CustomCursor from '@/components/wegottado/CustomCursor';
import GoldenParticles from '@/components/wegottado/GoldenParticles';
import GoldenSeam from '@/components/wegottado/GoldenSeam';
import Navbar from '@/components/wegottado/Navbar';
import HeroSection from '@/components/wegottado/HeroSection';
import ManifestoSection from '@/components/wegottado/ManifestoSection';
import AtelierGallery from '@/components/wegottado/AtelierGallery';
import FeaturedCollection from '@/components/wegottado/FeaturedCollection';
import CraftSection from '@/components/wegottado/CraftSection';
import LookbookSection from '@/components/wegottado/LookbookSection';
import MaisonSection from '@/components/wegottado/MaisonSection';
import Footer from '@/components/wegottado/Footer';

export default function Home() {
  return (
    <div className="film-grain relative" style={{ background: 'var(--obsidian)' }}>
      <CustomCursor />
      <GoldenParticles />
      <GoldenSeam />
      <Navbar />
      <HeroSection />
      <ManifestoSection />
      <AtelierGallery />
      <FeaturedCollection />
      <CraftSection />
      <LookbookSection />
      <MaisonSection />
      <Footer />
    </div>
  );
}