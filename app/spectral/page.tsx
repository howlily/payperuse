"use client";

import { useState } from "react";
import AnimatedBackground from "./components/AnimatedBackground";
import { WalletContextProvider } from "./components/WalletProvider";
import WalletButton from "./components/WalletButton";
import { useWalletBalance } from "./hooks/useWalletBalance";

function SpectralAgentContent() {
  const [message, setMessage] = useState("");
  const [activeTab, setActiveTab] = useState("deepthink");
  const { balance, tokens, loading } = useWalletBalance();

  return (
    <div className="min-h-screen bg-gray-50 relative overflow-hidden">
      <AnimatedBackground />
      {/* Full Width Header */}
      <header className="bg-white/90 backdrop-blur-md border-b border-gray-200 px-6 py-4 shadow-sm relative z-10">
        <div className="max-w-[1500px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Spectral</h1>
              <p className="text-sm text-gray-500">Interactive WebApp</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 font-mono bg-orange-50 px-4 py-2 rounded-lg border border-orange-200">
              3wfYscRpEGAkoGCxgyaXTDb0byPZCXxXheLxeX2ypuep
            </span>
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Below Header */}
      <div className="p-6 relative z-10">
        <div className="flex gap-4 max-w-[1500px] mx-auto">
          {/* Main Windowed Container */}
          <div className="flex-1">
            {/* Main Content Area */}
            <div className="flex gap-4 bg-gray-100/80 backdrop-blur-sm border border-gray-200 rounded-t-2xl p-6 shadow-lg" style={{ height: "650px" }}>
            {/* Left Sidebar */}
            <aside className="w-80 bg-white/95 backdrop-blur-sm rounded-xl shadow-md border border-gray-200 p-6 overflow-y-auto flex flex-col">
              <div className="flex-1">
                {/* SOL Balance */}
                <div className="mb-4 pb-4 border-b border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4" viewBox="0 0 646 96" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M108.53 75.6899L90.81 94.6899C90.4267 95.1026 89.9626 95.432 89.4464 95.6573C88.9303 95.8827 88.3732 95.9994 87.81 95.9994C87.2469 95.9994 86.6898 95.8827 86.1736 95.6573C85.6575 95.432 85.1934 95.1026 84.81 94.6899L1.81002 5.68994C1.42668 5.27721 1.13103 4.78575 0.942416 4.24703C0.753798 3.70831 0.675781 3.13424 0.713706 2.56178C0.751631 1.98932 0.904794 1.43073 1.16393 0.920741C1.42307 0.410748 1.7833 -0.0764674 2.22165 -0.539936L19.9417 -19.5399C20.325 -19.9526 20.7891 -20.282 21.3053 -20.5074C21.8214 -20.7327 22.3785 -20.8494 22.9417 -20.8494C23.5048 -20.8494 24.0619 -20.7327 24.5781 -20.5074C25.0942 -20.282 25.5583 -19.9526 25.9417 -19.5399L108.53 69.3099C108.914 69.7226 109.209 70.2141 109.398 70.7528C109.587 71.2915 109.665 71.8656 109.627 72.438C109.589 73.0105 109.436 73.5691 109.177 74.0791C108.918 74.589 108.558 75.0363 108.12 75.4999L108.53 75.6899Z" fill="url(#paint0_linear)"/>
                        <path d="M108.53 20.59L90.81 1.59003C90.4267 1.17729 89.9626 0.847922 89.4464 0.622547C88.9303 0.397173 88.3732 0.280518 87.81 0.280518C87.2469 0.280518 86.6898 0.397173 86.1736 0.622547C85.6575 0.847922 85.1934 1.17729 84.81 1.59003L1.81002 90.59C1.42668 91.0028 1.13103 91.4942 0.942416 92.033C0.753798 92.5717 0.675781 93.1458 0.713706 93.7182C0.751631 94.2907 0.904794 94.8493 1.16393 95.3593C1.42307 95.8693 1.7833 96.3165 2.22165 96.78L19.9417 115.78C20.325 116.193 20.7891 116.522 21.3053 116.747C21.8214 116.973 22.3785 117.089 22.9417 117.089C23.5048 117.089 24.0619 116.973 24.5781 116.747C25.0942 116.522 25.5583 116.193 25.9417 115.78L108.53 26.93C108.914 26.5173 109.209 26.0258 109.398 25.4871C109.587 24.9484 109.665 24.3743 109.627 23.8019C109.589 23.2294 109.436 22.6708 109.177 22.1608C108.918 21.6509 108.558 21.2036 108.12 20.74L108.53 20.59Z" fill="url(#paint1_linear)"/>
                        <path d="M90.81 37.8401L1.81002 48.1501C1.23328 48.2199 0.675841 48.4068 0.169863 48.7C-0.336116 48.9932 -0.883598 49.3872 -1.34521 49.8606C-1.80682 50.334 -2.17282 50.8784 -2.42577 51.4674C-2.67872 52.0563 -2.81425 52.68 -2.82617 53.3101V64.0701C-2.82617 65.3401 -2.32617 66.5501 -1.42617 67.4501C-0.526172 68.3501 0.673828 68.8501 1.94383 68.8501L90.9438 58.5401C91.5206 58.4703 92.078 58.2834 92.584 57.9902C93.09 57.697 93.6375 57.303 94.0991 56.8296C94.5607 56.3562 94.9267 55.8118 95.1797 55.2228C95.4326 54.6339 95.5681 54.0102 95.5801 53.3801V42.6201C95.5801 41.3501 95.0801 40.1401 94.1801 39.2401C93.2801 38.3401 92.0801 37.8401 90.8101 37.8401H90.81Z" fill="url(#paint2_linear)"/>
                        <defs>
                          <linearGradient id="paint0_linear" x1="94.4099" y1="-8.14014" x2="14.5299" y2="83.8299" gradientUnits="userSpaceOnUse">
                            <stop offset="0" stopColor="#00FFA3"/>
                            <stop offset="1" stopColor="#DC1FFF"/>
                          </linearGradient>
                          <linearGradient id="paint1_linear" x1="15.3699" y1="104.48" x2="95.2599" y2="12.6201" gradientUnits="userSpaceOnUse">
                            <stop offset="0" stopColor="#00FFA3"/>
                            <stop offset="1" stopColor="#DC1FFF"/>
                          </linearGradient>
                          <linearGradient id="paint2_linear" x1="5.34009" y1="53.1101" x2="88.0601" y2="53.1101" gradientUnits="userSpaceOnUse">
                            <stop offset="0" stopColor="#00FFA3"/>
                            <stop offset="1" stopColor="#DC1FFF"/>
                          </linearGradient>
                        </defs>
                      </svg>
                      <h2 className="text-sm font-semibold text-gray-900">SOL Balance</h2>
                    </div>
                    <button className="p-1 hover:bg-gray-100 rounded">
                      <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    </button>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <p className="text-xs text-gray-600 mb-0.5">Balance</p>
                    <p className="text-lg font-bold text-gray-900">
                      {loading ? "..." : balance.toFixed(4)} SOL
                    </p>
                  </div>
                </div>

                {/* Tokens */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-purple-500" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
                        <circle cx="12" cy="12" r="3"/>
                        <path d="M12 1c.55 0 1 .45 1 1v2c0 .55-.45 1-1 1s-1-.45-1-1V2c0-.55.45-1 1-1zm0 16c.55 0 1 .45 1 1v2c0 .55-.45 1-1 1s-1-.45-1-1v-2c0-.55.45-1 1-1zm9-5c.55 0 1 .45 1 1s-.45 1-1 1h-2c-.55 0-1-.45-1-1s.45-1 1-1h2zM5 12c0-.55-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1h2c.55 0 1-.45 1-1z" opacity="0.3"/>
                      </svg>
                      <h2 className="text-sm font-semibold text-gray-900">Tokens</h2>
                    </div>
                    <button className="p-1 hover:bg-gray-100 rounded">
                      <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    </button>
                  </div>
                  <div className="space-y-2">
                    {loading ? (
                      <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                        <p className="text-xs text-gray-500">Loading tokens...</p>
                      </div>
                    ) : tokens.length === 0 ? (
                      <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                        <p className="text-xs text-gray-500">No tokens found</p>
                      </div>
                    ) : (
                      tokens.slice(0, 5).map((token, index) => (
                        <div key={token.mint} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-semibold text-gray-900">
                                {token.mint.slice(0, 4)}...{token.mint.slice(-4)}
                              </p>
                              <p className="text-xs text-gray-500">
                                {token.uiAmount.toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Wallet Connection at Bottom */}
              <div className="mt-auto pt-4 border-t border-gray-200">
                <WalletButton />
              </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 bg-white/95 backdrop-blur-sm rounded-xl shadow-md border border-gray-200 p-6 overflow-y-auto">
              <div className="space-y-4">
                {/* Transaction History */}
                <div className="pb-4 border-b border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-3">Transaction History:</h3>
                  <p className="text-gray-700 leading-relaxed">
                    There have been 6,410 buys and 2,766 sells of EKpQGSJrJMFqK29KQanSqYXRcFBfBopzLHYwdM65zqm in the last 24 hours.
                  </p>
                </div>

                {/* Price Prediction */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Price Prediction:</h3>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    The token's price has been relatively stable with a high confidence level in the quoted prices.
                  </p>
                  <p className="text-gray-700 leading-relaxed">
                    In conclusion, considering the positive price changes, liquidity, market capitalization, and active trading volume, buying EKpQGSJrJMFqK29KQanSqYXRcFBfBopzLHYwdM65zqm could be a good option. However, as with any investment, it is important to conduct further research, analyze market trends, and consider your risk tolerance before making a decision.
                  </p>
                </div>
              </div>
            </main>
          </div>

            {/* Bottom Chat Interface */}
            <div className="bg-white/95 backdrop-blur-sm rounded-b-2xl border border-t-0 border-gray-200 p-4 shadow-lg">
              <div className="flex items-end gap-4">
                {/* Chat Interface */}
                <div className="flex-1">
                  {/* Tabs */}
                  <div className="flex gap-2 mb-3">
                    <button
                      onClick={() => setActiveTab("base")}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        activeTab === "base"
                          ? "bg-gray-200 text-gray-900"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-150"
                      }`}
                    >
                      ❄️ Base v2
                    </button>
                    <button
                      onClick={() => setActiveTab("deepthink")}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        activeTab === "deepthink"
                          ? "bg-blue-500 text-white"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-150"
                      }`}
                    >
                      🧠 Deepthink R1
                    </button>
                    <button
                      onClick={() => setActiveTab("internet")}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        activeTab === "internet"
                          ? "bg-gray-200 text-gray-900"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-150"
                      }`}
                    >
                      🌐 Internet Agent
                    </button>
                  </div>

                  {/* Input */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Type your message in deepthink mode..."
                      className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar - Outside Main Window */}
          <aside className="w-80 flex flex-col gap-4">
            {/* Suggestions */}
            <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-md border border-gray-200 p-5">
              <h2 className="font-semibold text-gray-900 mb-4">Suggestions</h2>
              <div className="space-y-2">
                {[
                  "Ask about market analysis and trends",
                  "Get technical indicators and insights",
                  "Request price predictions and charts",
                  "Learn about new tokens and projects",
                  "Get help with trading strategies",
                  "Discover new opportunities",
                  "Analyze token performance",
                  "Get market sentiment analysis"
                ].map((suggestion, index) => (
                  <button
                    key={index}
                    className="w-full text-left text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-lg transition-colors"
                  >
                    · {suggestion}
                  </button>
                ))}
              </div>
            </div>

            {/* Integrations */}
            <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-md border border-gray-200 p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M13 7H7v6h6V7z" />
                    <path fillRule="evenodd" d="M7 2a1 1 0 012 0v1h2V2a1 1 0 112 0v1h2a2 2 0 012 2v2h1a1 1 0 110 2h-1v2h1a1 1 0 110 2h-1v2a2 2 0 01-2 2h-2v1a1 1 0 11-2 0v-1H9v1a1 1 0 11-2 0v-1H5a2 2 0 01-2-2v-2H2a1 1 0 110-2h1V9H2a1 1 0 010-2h1V5a2 2 0 012-2h2V2zM5 5h10v10H5V5z" clipRule="evenodd" />
                  </svg>
                </div>
                <h2 className="font-semibold text-gray-900">Integrations</h2>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { name: "Solana", color: "purple", icon: "🟣" },
                  { name: "Brave", color: "orange", icon: "🦁" },
                  { name: "DeepSeek", color: "blue", icon: "🔍" },
                  { name: "Jupiter", color: "teal", icon: "🪐" },
                  { name: "Pumpfun", color: "green", icon: "🎈" },
                  { name: "DEX", color: "gray", icon: "💱" }
                ].map((integration) => (
                  <button
                    key={integration.name}
                    className="bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg p-3 transition-colors flex items-center gap-2"
                  >
                    <span className="text-xl">{integration.icon}</span>
                    <span className="text-sm font-medium text-gray-700">{integration.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

export default function SpectralAgent() {
  return (
    <WalletContextProvider>
      <SpectralAgentContent />
    </WalletContextProvider>
  );
}

