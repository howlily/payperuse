"use client";

import Link from "next/link";
import { useEffect } from "react";
import Spline from '@splinetool/react-spline/next';
import LoadingScreen from './spectral/components/LoadingScreen';

export default function Home() {
  useEffect(() => {
    // Hide Spline watermark after component loads
    const hideWatermark = () => {
      const watermark = document.querySelector('[class*="spline-watermark"], [class*="watermark"], a[href*="spline.design"]');
      if (watermark) {
        (watermark as HTMLElement).style.display = 'none';
      }
      
      // Also hide any divs in bottom right corner that might be the watermark
      const allDivs = document.querySelectorAll('div');
      allDivs.forEach((div) => {
        const style = window.getComputedStyle(div);
        if (style.position === 'absolute' && 
            (style.bottom === '0px' || style.bottom.includes('px')) &&
            (style.right === '0px' || style.right.includes('px')) &&
            div.querySelector('a[href*="spline"]')) {
          div.style.display = 'none';
        }
      });
    };

    // Run immediately and also after a delay to catch dynamically injected elements
    hideWatermark();
    const timer = setInterval(hideWatermark, 100);
    
    return () => clearInterval(timer);
  }, []);
  return (
    <div className="min-h-screen bg-black relative overflow-hidden" style={{ fontFamily: 'var(--font-manrope)' }}>
      <LoadingScreen />
      {/* Subtle gradient glows */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-purple-900/30 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl"></div>

      {/* Hero Section - Full Screen Spline */}
      <main className="relative w-full h-screen overflow-hidden">
        <div className="absolute inset-0" style={{ pointerEvents: 'none' }}>
          <Spline
            scene="https://prod.spline.design/pZDzapvpDSEgc8VP/scene.splinecode"
          />
        </div>
        
        {/* Header - Overlay on Spline */}
        <header className="fixed top-0 left-0 right-0 bg-transparent backdrop-blur-sm px-6 py-6 z-50">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center">
              {/* Logo removed */}
            </div>
            <nav className="flex items-center gap-6">
              <a href="https://github.com/howlily/spectral402" target="_blank" rel="noopener noreferrer" className="text-white/90 hover:text-purple-400 transition-colors">
                GitHub
              </a>
            <Link href="/docs" className="text-white/90 hover:text-purple-400 transition-colors">
              Documentation
            </Link>
            </nav>
          </div>
        </header>

        {/* Get Started Button - Overlay on Spline */}
        <div className="absolute inset-0 flex items-end justify-center pb-16 z-40">
          <div className="text-center">
            <p className="font-manrope text-white/80 text-sm mb-4">Made in Stockholm, Sweden</p>
            <Link
              href="/spectral"
              className="relative px-12 py-5 flex items-center justify-center backdrop-blur-sm text-white rounded-full font-manrope font-semibold text-xl overflow-hidden group animate-breathe-button btn-rainbow-hover"
            >
              <span className="relative z-10">Get Started</span>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}