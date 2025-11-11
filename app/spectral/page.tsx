"use client";

import { useState, useEffect, useRef } from "react";
import { WalletContextProvider } from "./components/WalletProvider";
import WalletButton from "./components/WalletButton";
import LoadingScreen from "./components/LoadingScreen";
import { useWalletBalance } from "./hooks/useWalletBalance";
import { useX402API } from "./hooks/useX402API";

function SpectralAgentContent() {
  const [message, setMessage] = useState("");
  const [activeTab, setActiveTab] = useState("claude-opus-4.1");
  const [aiResponse, setAiResponse] = useState<string>("");
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [clickedTab, setClickedTab] = useState<string | null>(null);
  const [caCopied, setCaCopied] = useState(false);
  const [caCentered, setCaCentered] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { balance, tokens, loading } = useWalletBalance();
  const { callAPI, isProcessing: isProcessingPayment } = useX402API();

  const handleTabClick = (tab: string) => {
    setClickedTab(tab);
    setActiveTab(tab);
    setTimeout(() => setClickedTab(null), 300);
  };

  const handleCAClick = async () => {
    const address = "3wfYscRpEGAkoGCxgyaXTDb0byPZCXxXheLxeX2ypuep";
    try {
      await navigator.clipboard.writeText(address);
      setCaCopied(true);
      setCaCentered(true);
      setTimeout(() => setCaCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleMessageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setMessage(value);
    
    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Start typing animation if there's text
    if (value.length > 0) {
      if (!isTyping) {
        setIsTyping(true);
      }
      // Set timeout to reset after 5 seconds of no typing
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
      }, 5000);
    } else {
      // If message is cleared, immediately reset typing state
      setIsTyping(false);
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    setIsTyping(false);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    setIsLoadingAI(true);
    setAiResponse("");

    try {
      const result = await callAPI("/api/ai", {
        method: "POST",
        body: JSON.stringify({
          message,
          model: activeTab,
        }),
      });

      if (result.error) {
        setAiResponse(`Error: ${result.error}`);
      } else if (result.data) {
        setAiResponse(result.data.response || JSON.stringify(result.data, null, 2));
      }
    } catch (error) {
      setAiResponse(`Error: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setIsLoadingAI(false);
    }
  };

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  const [splineLoaded, setSplineLoaded] = useState(false);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/@splinetool/viewer@1.10.99/build/spline-viewer.js';
    script.type = 'module';
    script.onload = () => setSplineLoaded(true);
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  const scrollToChat = () => {
    const chatSection = document.getElementById('chat-section');
    if (chatSection) {
      chatSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-black relative overflow-x-hidden font-manrope">
      <LoadingScreen />
      {splineLoaded && (
        <>
          {/* @ts-ignore - spline-viewer is a custom element */}
          <spline-viewer
            url="https://prod.spline.design/2eYe3ADwe-ruRfl6/scene.splinecode"
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              zIndex: 0,
              pointerEvents: 'none'
            }}
          />
        </>
      )}
      
      {/* CA Badge */}
      <div 
        className={`floating-ca ${caCentered ? 'ca-centered' : ''}`}
        onClick={handleCAClick}
      >
        <span className="text-xs font-medium text-white/80 font-manrope tracking-wider">
          {caCopied ? 'Copied!' : '3wfYscRpEGAkoGCxgyaXTDb0byPZCXxXheLxeX2ypuep'}
        </span>
      </div>

      {/* Scrollable Content */}
      <div className="relative z-10">
        {/* Pricing Section - Smaller, positioned above chat */}
        <section className="flex items-end justify-center px-6 pt-32 pb-8">
          <div className="max-w-5xl mx-auto w-full">
            <h2 className="text-3xl font-medium text-white text-center mb-8 font-manrope">Pricing</h2>
            <div className="grid md:grid-cols-3 gap-4">
              {/* Free Plan */}
              <div 
                className="transparent-container rounded-xl p-5 transition-all duration-300"
                style={{
                  background: 'rgba(168, 85, 247, 0.04)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(236, 72, 153, 0.1)'
                }}
              >
                <h3 className="text-lg font-semibold text-white mb-1 font-manrope">Free</h3>
                <div className="text-2xl font-bold text-white mb-3 font-manrope">$0<span className="text-sm text-white/60">/month</span></div>
                <ul className="space-y-2 mb-6">
                  <li className="text-white/80 text-sm font-manrope flex items-center gap-2">
                    <span>✓</span> 10 API calls/day
                  </li>
                  <li className="text-white/80 text-sm font-manrope flex items-center gap-2">
                    <span>✓</span> Basic AI models
                  </li>
                  <li className="text-white/80 text-sm font-manrope flex items-center gap-2">
                    <span>✓</span> Community support
                  </li>
                </ul>
                <button
                  onClick={scrollToChat}
                  className="w-full px-4 py-2 transparent-container border border-emerald-500/30 rounded-lg text-white text-sm font-manrope font-medium hover:border-emerald-500/50 transition-all"
                >
                  Get Started
                </button>
              </div>
              {/* Basic Plan - Coming Soon */}
              <div 
                className="transparent-container rounded-xl p-5 opacity-50"
                style={{
                  background: 'rgba(168, 85, 247, 0.02)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(236, 72, 153, 0.05)'
                }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-lg font-semibold text-white/60 font-manrope">Basic</h3>
                  <span className="text-xs text-white/40 bg-white/5 px-2 py-0.5 rounded font-manrope">Coming Soon</span>
                </div>
                <div className="text-2xl font-bold text-white/60 mb-3 font-manrope">$29<span className="text-sm text-white/40">/month</span></div>
                <ul className="space-y-2 mb-6">
                  <li className="text-white/50 text-sm font-manrope flex items-center gap-2">
                    <span>✓</span> 1,000 API calls/month
                  </li>
                  <li className="text-white/50 text-sm font-manrope flex items-center gap-2">
                    <span>✓</span> All AI models
                  </li>
                  <li className="text-white/50 text-sm font-manrope flex items-center gap-2">
                    <span>✓</span> Priority support
                  </li>
                </ul>
                <button 
                  disabled
                  className="w-full px-4 py-2 transparent-container border border-white/10 rounded-lg text-white/40 text-sm font-manrope font-medium cursor-not-allowed"
                >
                  Coming Soon
                </button>
              </div>

              {/* Pro Plan - Coming Soon */}
              <div 
                className="transparent-container rounded-xl p-5 opacity-50"
                style={{
                  background: 'rgba(168, 85, 247, 0.02)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(236, 72, 153, 0.05)'
                }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-lg font-semibold text-white/60 font-manrope">Pro</h3>
                  <span className="text-xs text-white/40 bg-white/5 px-2 py-0.5 rounded font-manrope">Coming Soon</span>
                </div>
                <div className="text-2xl font-bold text-white/60 mb-3 font-manrope">$99<span className="text-sm text-white/40">/month</span></div>
                <ul className="space-y-2 mb-6">
                  <li className="text-white/50 text-sm font-manrope flex items-center gap-2">
                    <span>✓</span> Unlimited API calls
                  </li>
                  <li className="text-white/50 text-sm font-manrope flex items-center gap-2">
                    <span>✓</span> All AI models + custom
                  </li>
                  <li className="text-white/50 text-sm font-manrope flex items-center gap-2">
                    <span>✓</span> 24/7 support
                  </li>
                </ul>
                <button 
                  disabled
                  className="w-full px-4 py-2 transparent-container border border-white/10 rounded-lg text-white/40 text-sm font-manrope font-medium cursor-not-allowed"
                >
                  Coming Soon
                </button>
              </div>
            </div>
          </div>
        </section>
        {/* Chat Interface Section - At Bottom */}
        <section id="chat-section" className="min-h-screen flex items-start justify-center px-6 pt-0 pb-20 relative">
          <div className="w-full max-w-[1500px] mx-auto relative z-30">
            <div className="flex gap-4">
          {/* Main Windowed Container */}
          <div className="flex-1">
            {/* Main Content Area */}
            <div className="flex gap-4 transparent-container rounded-2xl p-6" style={{ height: "650px" }}>
            {/* Left Sidebar */}
            <aside className="w-80 transparent-container rounded-xl p-6 overflow-y-auto flex flex-col">
              <div className="flex-1">
                {/* SOL Balance */}
                <div className="mb-4 pb-4 border-b border-purple-500/30">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4" viewBox="0 0 20 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                        {/* Top parallelogram - cyan to green */}
                        <path d="M1 1.5 L6 0.5 L19 0.5 L14 1.5 Z" fill="url(#solana-gradient-1)"/>
                        {/* Middle parallelogram - purple-blue to azure */}
                        <path d="M1 6.5 L6 5.5 L19 5.5 L14 6.5 Z" fill="url(#solana-gradient-2)"/>
                        {/* Bottom parallelogram - deep purple to medium purple-blue */}
                        <path d="M1 11.5 L6 10.5 L19 10.5 L14 11.5 Z" fill="url(#solana-gradient-3)"/>
                        <defs>
                          <linearGradient id="solana-gradient-1" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#00D9FF"/>
                            <stop offset="100%" stopColor="#14F195"/>
                          </linearGradient>
                          <linearGradient id="solana-gradient-2" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#9945FF"/>
                            <stop offset="100%" stopColor="#00D9FF"/>
                          </linearGradient>
                          <linearGradient id="solana-gradient-3" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#6A00FF"/>
                            <stop offset="100%" stopColor="#9945FF"/>
                          </linearGradient>
                        </defs>
                      </svg>
                      <h2 className="text-sm font-semibold text-white font-manrope">SOL Balance</h2>
                    </div>
                    <button className="p-1 hover:bg-gray-800 rounded">
                      <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    </button>
                  </div>
                  <div className="transparent-container rounded-lg p-3 border border-purple-500/20">
                    <p className="text-xs text-gray-200 mb-0.5 font-manrope">Balance</p>
                    <p className="text-lg font-bold text-white font-manrope">
                      {loading ? "..." : balance.toFixed(4)} SOL
                    </p>
                  </div>
                </div>
                {/* Tokens */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-teal-400" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
                        <circle cx="12" cy="12" r="3"/>
                        <path d="M12 1c.55 0 1 .45 1 1v2c0 .55-.45 1-1 1s-1-.45-1-1V2c0-.55.45-1 1-1zm0 16c.55 0 1 .45 1 1v2c0 .55-.45 1-1 1s-1-.45-1-1v-2c0-.55.45-1 1-1zm9-5c.55 0 1 .45 1 1s-.45 1-1 1h-2c-.55 0-1-.45-1-1s.45-1 1-1h2zM5 12c0-.55-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1h2c.55 0 1-.45 1-1z" opacity="0.3"/>
                      </svg>
                      <h2 className="text-sm font-semibold text-white font-manrope">Tokens</h2>
                    </div>
                    <button className="p-1 hover:bg-gray-800 rounded">
                      <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    </button>
                  </div>
                  <div className="space-y-2">
                    {loading ? (
                      <div className="transparent-container rounded-lg p-3 border border-purple-500/20">
                        <p className="text-xs text-gray-200 font-manrope">Loading tokens...</p>
                      </div>
                    ) : tokens.length === 0 ? (
                      <div className="transparent-container rounded-lg p-3 border border-purple-500/20">
                        <p className="text-xs text-gray-200 font-manrope">No tokens found</p>
                      </div>
                    ) : (
                      tokens.slice(0, 5).map((token, index) => (
                        <div key={token.mint} className="transparent-container rounded-lg p-3 border border-purple-500/20">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-semibold text-white font-manrope">
                                {token.mint.slice(0, 4)}...{token.mint.slice(-4)}
                              </p>
                              <p className="text-xs text-gray-200 font-manrope">
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
              <div className="mt-auto pt-4 border-t border-purple-500/30">
                <WalletButton />
              </div>
            </aside>
            {/* Main Content */}
            <main className="flex-1 transparent-container rounded-xl p-6 overflow-y-auto">
              <div className="space-y-4">
                {isProcessingPayment && (
                  <div className="transparent-container border border-pink-500/30 rounded-lg p-4 mb-4">
                    <div className="flex items-center gap-3">
                      <svg className="w-5 h-5 text-pink-400 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <p className="text-sm text-pink-400 font-medium font-manrope">Processing x402 payment...</p>
                    </div>
                  </div>
                )}

                {aiResponse ? (
                  <div className="pb-4 border-b border-purple-500/20">
                    <h3 className="font-semibold text-white mb-3 font-manrope">AI Response:</h3>
                    <div className="transparent-container rounded-lg p-4">
                      <p className="text-white leading-relaxed whitespace-pre-wrap font-manrope">{aiResponse}</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center px-8 py-12">
                    <div className="mb-6">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                        <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                        </svg>
                      </div>
                      <h3 className="text-2xl font-semibold text-white mb-3 font-manrope">Welcome to Spectral</h3>
                      <p className="text-white/70 leading-relaxed font-manrope max-w-md mx-auto">
                        Ask me anything about Solana tokens, market analysis, trading strategies, or blockchain insights. I'm here to help!
                      </p>
                    </div>
                    <div className="mt-4 space-y-2">
                      <p className="text-sm text-white/50 font-manrope">Try asking:</p>
                      <div className="flex flex-wrap gap-2 justify-center">
                        <span className="px-3 py-1.5 text-xs text-white/60 bg-white/5 rounded-full border border-white/10 font-manrope">
                          Market trends
                        </span>
                        <span className="px-3 py-1.5 text-xs text-white/60 bg-white/5 rounded-full border border-white/10 font-manrope">
                          Token analysis
                        </span>
                        <span className="px-3 py-1.5 text-xs text-white/60 bg-white/5 rounded-full border border-white/10 font-manrope">
                          Price predictions
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </main>
          </div>
          {/* Bottom Chat Interface */}
          <div className="chatbox-clean rounded-2xl border border-purple-500/20 p-4">
              <div className="flex items-end gap-4">
                {/* Chat Interface */}
                <div className="flex-1">
                  {/* Tabs */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    <button
                      onClick={() => handleTabClick("claude-opus-4.1")}
                      className={`px-4 py-2 rounded-full text-sm font-medium font-manrope transition-all duration-300 flex items-center gap-2 ${
                        activeTab === "claude-opus-4.1"
                          ? "text-white border border-purple-500/50"
                          : "chatbox-clean text-gray-300 hover:text-white border border-purple-500/20"
                      } ${clickedTab === "claude-opus-4.1" ? "ai-tab-click" : ""}`}
                      style={activeTab === "claude-opus-4.1" ? {
                        background: 'rgba(168, 85, 247, 0.25)',
                        backdropFilter: 'blur(20px)',
                      } : {}}
                    >
                      <img src="/integrations/claudelogo.png" alt="Claude" className="w-4 h-4 object-contain" />
                      Claude Opus 4.1
                    </button>
                    <button
                      onClick={() => handleTabClick("gpt-4-32k")}
                      className={`px-4 py-2 rounded-full text-sm font-medium font-manrope transition-all duration-300 flex items-center gap-2 ${
                        activeTab === "gpt-4-32k"
                          ? "text-white border border-purple-500/50"
                          : "chatbox-clean text-gray-300 hover:text-white border border-purple-500/20"
                      } ${clickedTab === "gpt-4-32k" ? "ai-tab-click" : ""}`}
                      style={activeTab === "gpt-4-32k" ? {
                        background: 'rgba(168, 85, 247, 0.25)',
                        backdropFilter: 'blur(20px)',
                      } : {}}
                    >
                      <img src="/integrations/openailogo.png" alt="OpenAI" className="w-4 h-4 object-contain" />
                      GPT-4 32K
                    </button>
                    <button
                      onClick={() => handleTabClick("gpt-4.5")}
                      className={`px-4 py-2 rounded-full text-sm font-medium font-manrope transition-all duration-300 flex items-center gap-2 ${
                        activeTab === "gpt-4.5"
                          ? "text-white border border-purple-500/50"
                          : "chatbox-clean text-gray-300 hover:text-white border border-purple-500/20"
                      } ${clickedTab === "gpt-4.5" ? "ai-tab-click" : ""}`}
                      style={activeTab === "gpt-4.5" ? {
                        background: 'rgba(168, 85, 247, 0.25)',
                        backdropFilter: 'blur(20px)',
                      } : {}}
                    >
                      <img src="/integrations/openailogo.png" alt="OpenAI" className="w-4 h-4 object-contain" />
                      GPT-4.5
                    </button>
                    <button
                      onClick={() => handleTabClick("o1-pro")}
                      className={`px-4 py-2 rounded-full text-sm font-medium font-manrope transition-all duration-300 flex items-center gap-2 ${
                        activeTab === "o1-pro"
                          ? "text-white border border-purple-500/50"
                          : "chatbox-clean text-gray-300 hover:text-white border border-purple-500/20"
                      } ${clickedTab === "o1-pro" ? "ai-tab-click" : ""}`}
                      style={activeTab === "o1-pro" ? {
                        background: 'rgba(168, 85, 247, 0.25)',
                        backdropFilter: 'blur(20px)',
                      } : {}}
                    >
                      <img src="/integrations/openailogo.png" alt="OpenAI" className="w-4 h-4 object-contain" />
                      o1-pro
                    </button>
                    <button
                      onClick={() => handleTabClick("gemini-2.5-pro")}
                      className={`px-4 py-2 rounded-full text-sm font-medium font-manrope transition-all duration-300 flex items-center gap-2 ${
                        activeTab === "gemini-2.5-pro"
                          ? "text-white border border-purple-500/50"
                          : "chatbox-clean text-gray-300 hover:text-white border border-purple-500/20"
                      } ${clickedTab === "gemini-2.5-pro" ? "ai-tab-click" : ""}`}
                      style={activeTab === "gemini-2.5-pro" ? {
                        background: 'rgba(168, 85, 247, 0.25)',
                        backdropFilter: 'blur(20px)',
                      } : {}}
                    >
                      <img src="/integrations/geminilogo.png" alt="Gemini" className="w-4 h-4 object-contain" />
                      Gemini 2.5 Pro
                    </button>
                    </div>
                    {/* Input - Fullscreen word-doc style when typing */}
                  {isTyping ? (
                    <div className="fixed inset-0 flex items-center justify-center p-8 bg-black/50 z-50">
                      <div className="w-full max-w-4xl">
                        <input
                          type="text"
                          value={message}
                          onChange={handleMessageChange}
                          placeholder="Start typing..."
                          className="w-full px-8 py-8 text-xl rounded-2xl shadow-2xl font-manrope focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-white placeholder-gray-400"
                          style={{
                            background: 'rgba(0, 0, 0, 0.6)',
                            backdropFilter: 'blur(24px)',
                            border: '1px solid rgba(236, 72, 153, 0.5)',
                            boxShadow: '0 0 60px rgba(168, 85, 247, 0.4), 0 0 120px rgba(236, 72, 153, 0.3), inset 0 0 40px rgba(168, 85, 247, 0.1)'
                          }}
                          autoFocus
                        />
                      </div>
                      <button
                        onClick={handleSendMessage}
                        disabled={!message || isLoadingAI || isProcessingPayment}
                        className="fixed bottom-8 right-8 px-6 py-4 rounded-xl font-manrope transition-all duration-500 disabled:cursor-not-allowed flex items-center justify-center"
                        style={{
                          background: !message || isLoadingAI || isProcessingPayment 
                            ? 'rgba(255, 255, 255, 0.1)' 
                            : 'rgba(16, 185, 129, 0.2)',
                          backdropFilter: 'blur(16px)',
                          border: !message || isLoadingAI || isProcessingPayment
                            ? '1px solid rgba(255, 255, 255, 0.2)'
                            : '1px solid rgba(16, 185, 129, 0.4)',
                          color: !message || isLoadingAI || isProcessingPayment
                            ? 'rgba(255, 255, 255, 0.4)'
                            : 'rgba(255, 255, 255, 0.95)',
                          boxShadow: '0 0 30px rgba(16, 185, 129, 0.3)'
                        }}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={message}
                        onChange={handleMessageChange}
                        placeholder={`Type your message for ${activeTab}...`}
                        className="flex-1 px-6 py-4 chatbox-clean border border-purple-500/20 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/40 text-white placeholder-gray-400 font-manrope"
                      />
                      <button
                        onClick={handleSendMessage}
                        disabled={!message || isLoadingAI || isProcessingPayment}
                        className="px-5 py-4 rounded-lg font-manrope transition-all duration-500 disabled:cursor-not-allowed flex items-center justify-center"
                        style={{
                          background: !message || isLoadingAI || isProcessingPayment 
                            ? 'rgba(255, 255, 255, 0.03)' 
                            : 'rgba(255, 255, 255, 0.06)',
                          backdropFilter: 'blur(12px)',
                          border: !message || isLoadingAI || isProcessingPayment
                            ? '1px solid rgba(255, 255, 255, 0.08)'
                            : '1px solid rgba(255, 255, 255, 0.15)',
                          color: !message || isLoadingAI || isProcessingPayment
                            ? 'rgba(255, 255, 255, 0.3)'
                            : 'rgba(255, 255, 255, 0.9)',
                          minWidth: '48px'
                        }}
                        onMouseEnter={(e) => {
                          if (!message || isLoadingAI || isProcessingPayment) return;
                          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.25)';
                          e.currentTarget.style.transform = 'scale(1.02)';
                        }}
                        onMouseLeave={(e) => {
                          if (!message || isLoadingAI || isProcessingPayment) return;
                          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
                          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                          e.currentTarget.style.transform = 'scale(1)';
                        }}
                      >
                        {isLoadingAI || isProcessingPayment ? (
                          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <circle className="opacity-25" cx="12" cy="12" r="10" strokeWidth="2"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                          </svg>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar - Outside Main Window */}
          <aside className="w-80 flex flex-col gap-4">
            {/* Suggestions */}
            <div className="transparent-container rounded-xl p-5">
              <h2 className="font-semibold text-white mb-4 font-manrope">Suggestions</h2>
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
                    className="w-full text-left text-sm text-white hover:text-pink-400 px-3 py-2 rounded-lg transition-colors font-manrope"
                  >
                    · {suggestion}
                  </button>
                ))}
              </div>
            </div>
            {/* Integrations */}
            <div className="transparent-container rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-5 h-5 bg-purple-500/30 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-purple-300" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M13 7H7v6h6V7z" />
                    <path fillRule="evenodd" d="M7 2a1 1 0 012 0v1h2V2a1 1 0 112 0v1h2a2 2 0 012 2v2h1a1 1 0 110 2h-1v2h1a1 1 0 110 2h-1v2a2 2 0 01-2 2h-2v1a1 1 0 11-2 0v-1H9v1a1 1 0 11-2 0v-1H5a2 2 0 01-2-2v-2H2a1 1 0 110-2h1V9H2a1 1 0 010-2h1V5a2 2 0 012-2h2V2zM5 5h10v10H5V5z" clipRule="evenodd" />
                  </svg>
                </div>
                <h2 className="font-semibold text-white font-manrope">Integrations</h2>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { name: "Solana", image: "/integrations/solanalogo.png" },
                  { name: "Phantom", image: "/integrations/phantomlogo.png" },
                  { name: "Claude", image: "/integrations/claudelogo.png" },
                  { name: "OpenAI", image: "/integrations/openailogo.png" },
                  { name: "Gemini", image: "/integrations/geminilogo.png" },
                  { name: "x402", image: "/integrations/x402logo.png" }
                ].map((integration) => (
                  <button
                    key={integration.name}
                    className="transparent-container hover:bg-purple-500/10 border border-purple-500/20 rounded-lg p-3 transition-colors flex items-center gap-2"
                  >
                    <img 
                      src={integration.image} 
                      alt={integration.name} 
                      className="w-5 h-5 object-contain"
                    />
                    <span className="text-sm font-medium text-white font-manrope">{integration.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </aside>
            </div>
          </div>
        </section>
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