import React from 'react';
import HoloCursor from '@/components/wegottado/HoloCursor';
import HoloGrid from '@/components/wegottado/HoloGrid';
import GoldenParticles from '@/components/wegottado/GoldenParticles';
import GoldenSeam from '@/components/wegottado/GoldenSeam';
import Navbar from '@/components/wegottado/Navbar';
import HeroSection from '@/components/wegottado/HeroSection';
import ManifestoSection from '@/components/wegottado/ManifestoSection';
import HoloShowroom from '@/components/wegottado/HoloShowroom';
import FeaturedCollection from '@/components/wegottado/FeaturedCollection';
import CraftSection from '@/components/wegottado/CraftSection';
import LookbookSection from '@/components/wegottado/LookbookSection';
import MaisonSection from '@/components/wegottado/MaisonSection';
import PreOrdersPreview from '@/components/wegottado/PreOrdersPreview';
import Footer from '@/components/wegottado/Footer';
import SideNav from '@/components/wegottado/SideNav';

export default function Home() {
  return (
    <div className="film-grain relative" style={{ background: 'var(--metal-dark)' }}>
      <HoloCursor />
      <HoloGrid />
      <GoldenParticles />
      <GoldenSeam />
      <SideNav />
      <Navbar />
      <div id="hero"><HeroSection /></div>
      <div id="manifesto"><ManifestoSection /></div>
      <div id="collections"><HoloShowroom /></div>
      <div id="featured"><FeaturedCollection /></div>
      <div id="pre-orders-preview"><PreOrdersPreview /></div>
      <div id="craft"><CraftSection /></div>
      <div id="lookbook"><LookbookSection /></div>
      <div id="maison"><MaisonSection /></div>
      <Footer />
    </div>
  );
}