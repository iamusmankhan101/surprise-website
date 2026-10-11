import React from 'react';
import { ConfigProvider } from './config/ConfigContext';
import Navbar from './components/Navbar';
import RibbonSpiralHero from './components/RibbonSpiralHero';
import PolaroidGallery from './components/PolaroidGallery';
import PhoneChatSection from './components/PhoneChatSection';
import BirthdayBookSection from './components/BirthdayBookSection';
import CinemaCountdownSection from './components/CinemaCountdownSection';
import Footer from './components/Footer';
import ClientStudioModal from './components/ClientStudioModal';

function BirthdayApp() {
  return (
    <div className="min-h-screen bg-[#f7f5f0] text-stone-900 selection:bg-amber-400 selection:text-stone-900 relative">
      <Navbar />
      
      <main>
        {/* Section 1: Screenshot 1 - Looped Filmstrip Ribbon Spiral Hero */}
        <RibbonSpiralHero />

        {/* Section 2: Screenshot 2 - Scattered Polaroid Memories Wall */}
        <PolaroidGallery />

        {/* Section 3: Screenshot 3 - Interactive iPhone iMessage Experience */}
        <PhoneChatSection />

        {/* Section 4: Flippable 3D birthday book */}
        <BirthdayBookSection />

        {/* Section 5: Screenshot 4 - Retro Vintage Cinema "NOW SHOWING" Countdown */}
        <CinemaCountdownSection />
      </main>

      <Footer />
      
      {/* Client Customizer Studio Modal (for selling to different clients) */}
      <ClientStudioModal />
    </div>
  );
}

export default function App() {
  return (
    <ConfigProvider>
      <BirthdayApp />
    </ConfigProvider>
  );
}
