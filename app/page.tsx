"use client";

import Link from "next/link";
import { useEffect } from "react";
import Spline from '@splinetool/react-spline/next';

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
      {/* Subtle gradient glows */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-purple-900/30 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl"></div>

      {/* Hero Section - Full Screen Spline */}
      <main className="relative w-full h-screen overflow-hidden">
        <div className="absolute inset-0" style={{ pointerEvents: 'none' }}>
          <Spline
            scene="https://prod.spline.design/6uqMJyPgvxXlgk2U/scene.splinecode"
          />
        </div>
        
        {/* Header - Overlay on Spline */}
        <header className="fixed top-0 left-0 right-0 bg-transparent backdrop-blur-sm px-6 py-6 z-50">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center">
              {/* Logo removed */}
            </div>
            <nav className="flex items-center gap-6">
              <a href="#features" className="text-white/90 hover:text-purple-400 transition-colors">
                Documentation
              </a>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-white/90 hover:text-purple-400 transition-colors">
                GitHub
              </a>
            </nav>
          </div>
        </header>

        {/* Get Started Button - Overlay on Spline */}
        <div className="absolute inset-0 flex items-end justify-center pb-12 z-40">
          <div className="text-center">
            <Link
              href="/spectral"
              className="relative px-8 py-4 flex items-center justify-center bg-gray-900/90 backdrop-blur-sm text-white rounded-lg font-semibold text-lg overflow-hidden group border border-gray-800"
            >
              <span className="relative z-10">Get Started</span>
              {/* Glowing border outline */}
              <div className="absolute inset-0 rounded-lg">
                {/* Bottom edge glow */}
                <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-pink-500 to-purple-500 opacity-80"></div>
                {/* Left edge glow (bottom portion) */}
                <div className="absolute bottom-0 left-0 w-[2px] h-1/3 bg-gradient-to-b from-pink-500 via-purple-500 to-transparent opacity-80"></div>
                {/* Top and right edges (subtle) */}
                <div className="absolute top-0 right-0 w-full h-[1px] bg-gradient-to-l from-purple-500/30 to-transparent"></div>
                <div className="absolute top-0 right-0 w-[1px] h-full bg-gradient-to-b from-purple-500/30 to-transparent"></div>
              </div>
            </Link>
          </div>
        </div>
      </main>

      {/* Features Section */}
      <section id="features" className="relative z-10 px-6 py-24">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-5xl md:text-6xl font-bold text-center mb-16 text-white">
            No Subscriptions.{" "}
            <span className="bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">Just Pay Per Use.</span>
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Feature Card 1 */}
            <div className="bg-gray-900/80 backdrop-blur-sm border border-purple-900/50 rounded-xl p-6 hover:border-pink-500/50 hover:shadow-lg transition-all">
              <div className="text-sm font-semibold text-gray-400 mb-2">NO MONTHLY</div>
              <div className="text-sm font-semibold text-gray-400 mb-2">SUBSCRIPTIONS</div>
              <div className="text-sm font-semibold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">PAY PER API CALL</div>
            </div>

            {/* Feature Card 2 */}
            <div className="bg-gray-900/80 backdrop-blur-sm border border-purple-900/50 rounded-xl p-6 hover:border-pink-500/50 hover:shadow-lg transition-all">
              <div className="text-sm font-semibold text-gray-400 mb-2">200MS</div>
              <div className="text-sm font-semibold text-gray-400 mb-2">INSTANT</div>
              <div className="text-sm font-semibold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">PAYMENTS</div>
            </div>

            {/* Feature Card 3 */}
            <div className="bg-gray-900/80 backdrop-blur-sm border border-purple-900/50 rounded-xl p-6 hover:border-pink-500/50 hover:shadow-lg transition-all">
              <div className="text-sm font-semibold text-gray-400 mb-2">NO API KEYS</div>
              <div className="text-sm font-semibold text-gray-400 mb-2">NEEDED</div>
              <div className="text-sm font-semibold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">AUTONOMOUS AGENTS</div>
            </div>

            {/* Feature Card 4 */}
            <div className="bg-gray-900/80 backdrop-blur-sm border border-purple-900/50 rounded-xl p-6 hover:border-pink-500/50 hover:shadow-lg transition-all">
              <div className="text-sm font-semibold text-gray-400 mb-2">PRIVACY-FIRST</div>
              <div className="text-sm font-semibold text-gray-400 mb-2">ENCRYPTED</div>
              <div className="text-sm font-semibold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">X402 PROTOCOL</div>
            </div>
          </div>
        </div>
      </section>

      {/* Ecosystem & Partners Section */}
      <section className="relative z-10 px-6 py-24">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12 text-white">Ecosystem & Partners</h2>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
            {[
              { name: "Solana", icon: "🟣" },
              { name: "Polygon", icon: "🔷" },
              { name: "Base", icon: "🔵" },
              { name: "Avalanche", icon: "🔺" },
              { name: "Coinbase", icon: "⚪" },
            ].map((partner, index) => (
              <div key={index} className="flex items-center gap-2 text-gray-400 hover:text-pink-400 transition-colors">
                <span className="text-2xl">{partner.icon}</span>
                <span className="text-lg font-medium">{partner.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Follow Our Progress Section */}
      <section className="relative z-10 px-6 py-24">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl font-bold mb-4 bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">Follow Our Progress</h2>
          <p className="text-lg text-gray-400 mb-8">Building for the Solana x402 Hackathon</p>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 px-8 py-4 bg-gray-900 text-white border-2 border-purple-500/50 rounded-lg font-semibold hover:border-pink-400 hover:bg-purple-500/10 transition-colors shadow-md hover:shadow-lg"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
            </svg>
            <span>View on GitHub</span>
            <span>&gt;</span>
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-8 border-t border-purple-900/50 bg-black/50">
        <div className="max-w-7xl mx-auto text-center text-gray-400">
          <p>Built with ❤️ for the Solana x402 Hackathon</p>
        </div>
      </footer>
    </div>
  );
}
