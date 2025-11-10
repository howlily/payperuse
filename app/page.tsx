"use client";

import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 relative overflow-hidden">
      {/* Subtle gradient glows */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-purple-200/30 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl"></div>

      {/* Header */}
      <header className="bg-white/90 backdrop-blur-md border-b border-gray-200 px-6 py-6 shadow-sm relative z-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg flex items-center justify-center">
              <div className="grid grid-cols-2 gap-0.5">
                <div className="w-2 h-2 bg-white"></div>
                <div className="w-2 h-2 bg-white"></div>
                <div className="w-2 h-2 bg-white"></div>
                <div className="w-2 h-2 bg-white"></div>
              </div>
            </div>
            <div>
              <span className="text-xl font-bold text-gray-900">x402app</span>
            </div>
          </div>
          <nav className="flex items-center gap-6">
            <a href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">
              Documentation
            </a>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-gray-900 transition-colors">
              GitHub
            </a>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 px-6 py-16">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[80vh]">
            {/* Left Side - Content */}
            <div>
              <h1 className="text-6xl md:text-7xl font-bold mb-6 leading-tight text-gray-900">
                Pay As You Go.{" "}
                <span className="bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">Not Monthly.</span>
              </h1>
              <p className="text-xl text-gray-700 mb-4 max-w-xl">
                Replace expensive LLM subscriptions with autonomous, pay-per-use x402 payments.
              </p>
              <p className="text-lg text-gray-600 mb-8 max-w-xl">
                Only pay for what you use. No monthly fees. No API keys. Just instant, private payments for every API call.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/spectral"
                  className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl text-center"
                >
                  Get Started
                </Link>
                <Link
                  href="#features"
                  className="px-8 py-4 bg-white text-gray-900 border-2 border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-colors text-center"
                >
                  Learn More
                </Link>
              </div>
            </div>

            {/* Right Side - Visual Element */}
            <div className="relative flex items-center justify-center">
              <div className="relative w-full max-w-lg h-96">
                {/* Shield-like 3D graphic representation */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-200/40 via-blue-300/40 to-purple-400/40 rounded-3xl transform rotate-12 blur-2xl"></div>
                <div className="relative bg-gradient-to-br from-purple-100/60 via-blue-100/60 to-purple-200/60 backdrop-blur-sm rounded-3xl border border-purple-300/50 p-12 transform -rotate-6 shadow-2xl">
                  <div className="bg-gradient-to-br from-purple-200/70 to-blue-200/70 rounded-2xl p-8 h-full flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
                        <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
                      <p className="text-purple-700 font-semibold">Pay Per Use</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Features Section */}
      <section id="features" className="relative z-10 px-6 py-24">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-5xl md:text-6xl font-bold text-center mb-16 text-gray-900">
            No Subscriptions.{" "}
            <span className="bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">Just Pay Per Use.</span>
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Feature Card 1 */}
            <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl p-6 hover:border-purple-300 hover:shadow-lg transition-all">
              <div className="text-sm font-semibold text-gray-600 mb-2">NO MONTHLY</div>
              <div className="text-sm font-semibold text-gray-600 mb-2">SUBSCRIPTIONS</div>
              <div className="text-sm font-semibold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">PAY PER API CALL</div>
            </div>

            {/* Feature Card 2 */}
            <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl p-6 hover:border-purple-300 hover:shadow-lg transition-all">
              <div className="text-sm font-semibold text-gray-600 mb-2">200MS</div>
              <div className="text-sm font-semibold text-gray-600 mb-2">INSTANT</div>
              <div className="text-sm font-semibold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">PAYMENTS</div>
            </div>

            {/* Feature Card 3 */}
            <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl p-6 hover:border-purple-300 hover:shadow-lg transition-all">
              <div className="text-sm font-semibold text-gray-600 mb-2">NO API KEYS</div>
              <div className="text-sm font-semibold text-gray-600 mb-2">NEEDED</div>
              <div className="text-sm font-semibold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">AUTONOMOUS AGENTS</div>
            </div>

            {/* Feature Card 4 */}
            <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl p-6 hover:border-purple-300 hover:shadow-lg transition-all">
              <div className="text-sm font-semibold text-gray-600 mb-2">PRIVACY-FIRST</div>
              <div className="text-sm font-semibold text-gray-600 mb-2">ENCRYPTED</div>
              <div className="text-sm font-semibold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">X402 PROTOCOL</div>
            </div>
          </div>
        </div>
      </section>

      {/* Ecosystem & Partners Section */}
      <section className="relative z-10 px-6 py-24">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12 text-gray-900">Ecosystem & Partners</h2>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
            {[
              { name: "Solana", icon: "🟣" },
              { name: "Polygon", icon: "🔷" },
              { name: "Base", icon: "🔵" },
              { name: "Avalanche", icon: "🔺" },
              { name: "Coinbase", icon: "⚪" },
            ].map((partner, index) => (
              <div key={index} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">
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
          <h2 className="text-5xl font-bold mb-4 bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">Follow Our Progress</h2>
          <p className="text-lg text-gray-600 mb-8">Building for the Solana x402 Hackathon</p>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 px-8 py-4 bg-white text-gray-900 border-2 border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-colors shadow-md hover:shadow-lg"
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
      <footer className="relative z-10 px-6 py-8 border-t border-gray-200 bg-white/50">
        <div className="max-w-7xl mx-auto text-center text-gray-600">
          <p>Built with ❤️ for the Solana x402 Hackathon</p>
        </div>
      </footer>
    </div>
  );
}
