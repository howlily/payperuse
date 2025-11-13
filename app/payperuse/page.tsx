"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { WalletContextProvider } from "./components/WalletProvider";
import WalletButton from "./components/WalletButton";
import LoadingScreen from "./components/LoadingScreen";
import { useWalletBalance } from "./hooks/useWalletBalance";
import { useX402API } from "./hooks/useX402API";
import { usePriceEstimate } from "./hooks/usePriceEstimate";
import { useWallet } from "@solana/wallet-adapter-react";

function PayPerUseAgentContent() {
  const [message, setMessage] = useState("");
  const [activeTab, setActiveTab] = useState("claude-opus-4.1");
  const [chatHistory, setChatHistory] = useState<Array<{ role: "user" | "assistant"; content: string; timestamp?: string }>>([]);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [clickedTab, setClickedTab] = useState<string | null>(null);
  const [caCopied, setCaCopied] = useState(false);
  const [caCentered, setCaCentered] = useState(false);
  const { balance, tokens, loading } = useWalletBalance();
  const { callAPI, isProcessing: isProcessingPayment } = useX402API();
  const { connected, publicKey } = useWallet();
  const priceEstimate = usePriceEstimate(message, activeTab);
  const chatEndRef = useRef<HTMLDivElement>(null);
  
  // Auto-scroll to bottom when chat history changes
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatHistory, isLoadingAI]);
  
  // Get USDC balance (already in USDC from useWalletBalance hook)
  const usdcBalance = balance; // balance is already in USDC
  const isFreeModel = priceEstimate.totalCostWithBuffer === 0;
  const hasEnoughUSDC = isFreeModel || usdcBalance >= priceEstimate.totalCostWithBuffer;

  const handleTabClick = (tab: string) => {
    setClickedTab(tab);
    setActiveTab(tab);
    setTimeout(() => setClickedTab(null), 300);
  };

  const handleCAClick = async () => {
    const address = "6z4aGvKAuqbdXoUaHw4VEUq6mU8WpmgPG3sC4dkspump";
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
    setMessage(e.target.value);
  };

  const handleSendMessage = async () => {
    if (!message.trim()) return;
    
    // Check wallet connection (only required for paid models)
    if (!isFreeModel && (!connected || !publicKey)) {
      setChatHistory(prev => [...prev, {
        role: "user",
        content: message,
        timestamp: new Date().toISOString()
      }, {
        role: "assistant",
        content: "Error: Please connect your wallet first"
      }]);
      setMessage("");
      return;
    }
    
    // Check USDC balance (only required for paid models)
    if (!isFreeModel && !hasEnoughUSDC) {
      setChatHistory(prev => [...prev, {
        role: "user",
        content: message,
        timestamp: new Date().toISOString()
      }, {
        role: "assistant",
        content: `Error: Insufficient USDC balance. You have ${usdcBalance.toFixed(2)} USDC, but need ${priceEstimate.totalCostWithBuffer.toFixed(2)} USDC`
      }]);
      setMessage("");
      return;
    }

    const userMessage = message.trim();
    // Add user message to chat
    setChatHistory(prev => [...prev, {
      role: "user",
      content: userMessage,
      timestamp: new Date().toISOString()
    }]);
    
    // Clear input
    setMessage("");
    setIsLoadingAI(true);

    try {
      const result = await callAPI("/api/ai", {
        method: "POST",
        body: JSON.stringify({
          message: userMessage,
          model: activeTab,
        }),
      });

      if (result.error) {
        setChatHistory(prev => [...prev, {
          role: "assistant",
          content: `Error: ${result.error}`,
          timestamp: new Date().toISOString()
        }]);
      } else if (result.data) {
        // Handle both direct data and nested data.data structure
        const data = result.data.data || result.data;
        const responseText = data.response || data.content || "";
        
        console.log("[Frontend] API Response:", { result, data, responseText });
        
        // Use the raw response text without adding usage/cost info
        setChatHistory(prev => [...prev, {
          role: "assistant",
          content: responseText,
          timestamp: new Date().toISOString()
        }]);
      }
    } catch (error) {
      setChatHistory(prev => [...prev, {
        role: "assistant",
        content: `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
        timestamp: new Date().toISOString()
      }]);
    } finally {
      setIsLoadingAI(false);
    }
  };


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
            url="https://prod.spline.design/Re-0bj0XGmLDi8JG/scene.splinecode"
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
      
      {/* Header Navigation */}
      <header className="fixed top-0 left-0 right-0 bg-transparent backdrop-blur-sm px-6 py-6 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center hover:opacity-80 transition-opacity">
            <img 
              src="/integrations/payperuse.png" 
              alt="PayPerUse Logo" 
              className="h-8 w-8 object-contain"
            />
          </Link>
          <nav className="flex items-center gap-6">
            <a href="https://github.com/howlily/spectral402" target="_blank" rel="noopener noreferrer" className="text-white/90 hover:text-purple-400 transition-colors font-manrope">
              GitHub
            </a>
            <Link href="/docs" className="text-white/90 hover:text-purple-400 transition-colors font-manrope">
              Documentation
            </Link>
          </nav>
        </div>
      </header>
      
      {/* CA Badge */}
      <div 
        className={`floating-ca ${caCentered ? 'ca-centered' : ''}`}
        onClick={handleCAClick}
      >
        <span className="text-xs font-medium text-white/80 font-manrope tracking-wider">
          {caCopied ? 'Copied!' : '6z4aGvKAuqbdXoUaHw4VEUq6mU8WpmgPG3sC4dkspump'}
        </span>
      </div>

      {/* Scrollable Content */}
      <div className="relative z-10">
        {/* Pricing Section - Model pricing */}
        <section className="flex items-center justify-center px-6 pt-20 pb-10">
          <div className="max-w-7xl mx-auto w-full">
            <h2 className="text-3xl font-medium text-white text-center mb-8 font-manrope">Pricing</h2>
            <div className="grid grid-cols-4 gap-3">
              {/* Claude Opus 4.1 */}
              <div 
                className="transparent-container rounded-xl p-4 transition-all duration-300 relative"
                style={{
                  background: 'rgba(168, 85, 247, 0.04)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(236, 72, 153, 0.1)',
                  boxShadow: '0 0 30px rgba(99, 102, 241, 0.3), 0 0 60px rgba(79, 70, 229, 0.2)'
                }}
              >
                <img src="/integrations/claudelogo.png" alt="Claude" className="absolute top-3 right-3 w-6 h-6 object-contain opacity-80" />
                <h3 className="text-2xl font-semibold text-white mb-2 font-manrope">Claude Opus 4.1</h3>
                <div className="text-xl font-bold text-white mb-1 font-manrope">$45</div>
                <p className="text-white/70 text-xs font-manrope mb-1 leading-tight">per 1M tokens</p>
                <p className="text-white/60 text-xs font-manrope mb-2 leading-tight">$0.000045 per token</p>
                <div className="border-t border-white/10 pt-2 mb-2">
                  <p className="text-white/80 text-xs font-manrope leading-tight mb-1"><span className="font-semibold">Best for:</span> Long-form writing, analysis, reasoning, and complex problem-solving</p>
                  <p className="text-white/70 text-xs font-manrope leading-tight mt-1">• Extended context window for comprehensive analysis</p>
                  <p className="text-white/70 text-xs font-manrope leading-tight">• Superior writing quality and coherence</p>
                  <p className="text-white/70 text-xs font-manrope leading-tight">• Advanced reasoning capabilities</p>
                </div>
              </div>

              {/* GPT-5 */}
              <div 
                className="transparent-container rounded-xl p-4 transition-all duration-300 relative"
                style={{
                  background: 'rgba(168, 85, 247, 0.04)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(236, 72, 153, 0.1)',
                  boxShadow: '0 0 30px rgba(99, 102, 241, 0.3), 0 0 60px rgba(79, 70, 229, 0.2)'
                }}
              >
                <img src="/integrations/openailogo.png" alt="OpenAI" className="absolute top-3 right-3 w-6 h-6 object-contain opacity-80" />
                <h3 className="text-2xl font-semibold text-white mb-2 font-manrope">GPT-5</h3>
                <div className="text-xl font-bold text-white mb-1 font-manrope">$11.25</div>
                <p className="text-white/70 text-xs font-manrope mb-1 leading-tight">per 1M tokens</p>
                <p className="text-white/60 text-xs font-manrope mb-2 leading-tight">$0.00001125 per token</p>
                <div className="border-t border-white/10 pt-2 mb-2">
                  <p className="text-white/80 text-xs font-manrope leading-tight mb-1"><span className="font-semibold">Best for:</span> Advanced reasoning, improved accuracy, and complex analysis</p>
                  <p className="text-white/70 text-xs font-manrope leading-tight mt-1">• Latest GPT model with enhanced capabilities</p>
                  <p className="text-white/70 text-xs font-manrope leading-tight">• Improved accuracy and reduced hallucinations</p>
                  <p className="text-white/70 text-xs font-manrope leading-tight">• Better handling of nuanced instructions</p>
                </div>
              </div>

              {/* o4-mini */}
              <div 
                className="transparent-container rounded-xl p-4 transition-all duration-300 relative"
                style={{
                  background: 'rgba(168, 85, 247, 0.04)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(236, 72, 153, 0.1)',
                  boxShadow: '0 0 30px rgba(99, 102, 241, 0.3), 0 0 60px rgba(79, 70, 229, 0.2)'
                }}
              >
                <img src="/integrations/openailogo.png" alt="OpenAI" className="absolute top-3 right-3 w-6 h-6 object-contain opacity-80" />
                <h3 className="text-2xl font-semibold text-white mb-2 font-manrope">o4-mini</h3>
                <div className="text-xl font-bold text-white mb-1 font-manrope">$5.50</div>
                <p className="text-white/70 text-xs font-manrope mb-1 leading-tight">per 1M tokens</p>
                <p className="text-white/60 text-xs font-manrope mb-2 leading-tight">$0.0000055 per token</p>
                <div className="border-t border-white/10 pt-2 mb-2">
                  <p className="text-white/80 text-xs font-manrope leading-tight mb-1"><span className="font-semibold">Best for:</span> Advanced reasoning, mathematics, logic, and complex problem-solving</p>
                  <p className="text-white/70 text-xs font-manrope leading-tight mt-1">• State-of-the-art reasoning architecture</p>
                  <p className="text-white/70 text-xs font-manrope leading-tight">• Exceptional math and logic performance</p>
                  <p className="text-white/70 text-xs font-manrope leading-tight">• Deep problem-solving capabilities</p>
                </div>
              </div>

              {/* Gemini 2.5 Flash */}
              <div 
                className="transparent-container rounded-xl p-4 transition-all duration-300 relative"
                style={{
                  background: 'rgba(168, 85, 247, 0.04)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(236, 72, 153, 0.1)',
                  boxShadow: '0 0 30px rgba(99, 102, 241, 0.3), 0 0 60px rgba(79, 70, 229, 0.2)'
                }}
              >
                <img src="/integrations/geminilogo.png" alt="Gemini" className="absolute top-3 right-3 w-6 h-6 object-contain opacity-80" />
                <h3 className="text-2xl font-semibold text-white mb-2 font-manrope">Gemini 2.5 Flash</h3>
                <div className="mb-3">
                  <div className="text-2xl font-bold text-white mb-1 font-manrope">FREE</div>
                  <p className="text-white/70 text-xs font-manrope leading-tight">No payment required</p>
                  <p className="text-white/70 text-xs font-manrope leading-tight mt-1">✓ Free tier available</p>
                </div>
                <div className="border-t border-white/10 pt-2 mb-2">
                  <p className="text-white/80 text-xs font-manrope leading-tight mb-2"><span className="font-semibold">Best for:</span> Fast responses, multimodal tasks, and cost-effective solutions</p>
                  <p className="text-white/70 text-xs font-manrope leading-tight mb-1">• Ultra-fast response times</p>
                  <p className="text-white/70 text-xs font-manrope leading-tight mb-1">• Multimodal capabilities (text, images)</p>
                  <p className="text-white/70 text-xs font-manrope leading-tight mb-1">• Optimized for efficiency</p>
                  <p className="text-white/70 text-xs font-manrope leading-tight mb-1">• Great for quick queries</p>
                  <p className="text-white/70 text-xs font-manrope leading-tight">• No wallet connection needed</p>
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* Chat Interface Section - At Bottom */}
        <section id="chat-section" className="min-h-screen flex items-start justify-center px-6 pt-10 pb-20 relative">
          <div className="w-full max-w-[1500px] mx-auto relative z-30">
            <div className="flex gap-4">
          {/* Main Windowed Container */}
          <div className="flex-1">
            {/* Main Content Area */}
            <div className="flex gap-4 transparent-container rounded-2xl p-6" style={{ height: "650px" }}>
            {/* Left Sidebar */}
            <aside className="w-80 transparent-container rounded-xl p-6 overflow-y-auto flex flex-col">
              <div className="flex-1">
                {/* USDC Balance */}
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
                      <h2 className="text-sm font-semibold text-white font-manrope">USDC Balance</h2>
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
                      {loading ? "..." : balance.toFixed(2)} USDC
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
                {isProcessingPayment && !isFreeModel && (
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

                {chatHistory.length > 0 ? (
                  <div className="space-y-4">
                    {chatHistory.map((msg, index) => (
                      <div
                        key={index}
                        className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-lg p-4 ${
                            msg.role === "user"
                              ? "transparent-container border border-purple-500/30"
                              : "transparent-container border border-blue-500/30"
                          }`}
                        >
                          <div className="flex items-start gap-2 mb-1">
                            {msg.role === "assistant" && (
                              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500/30 to-pink-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                </svg>
                              </div>
                            )}
                            <div className="flex-1">
                              <div className="text-xs text-white/50 font-manrope mb-1">
                                {msg.role === "user" ? "You" : "PayPerUse AI"}
                              </div>
                              <p className={`leading-relaxed whitespace-pre-wrap font-manrope ${
                                msg.role === "user" ? "text-white" : "text-white"
                              }`}>
                                {msg.content}
                              </p>
                            </div>
                            {msg.role === "user" && (
                              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500/30 to-cyan-500/30 flex items-center justify-center flex-shrink-0 mt-0.5 ml-2">
                                <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    {isLoadingAI && (
                      <div className="flex justify-start">
                        <div className="transparent-container border border-blue-500/30 rounded-lg p-4 max-w-[80%]">
                          <div className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-blue-400 animate-spin" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span className="text-sm text-white/70 font-manrope">AI is thinking...</span>
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={chatEndRef} />
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center px-8 py-12">
                    <div className="mb-6">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                        <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                        </svg>
                      </div>
                      <h3 className="text-2xl font-semibold text-white mb-3 font-manrope">Welcome to PayPerUse</h3>
                      <p className="text-white/70 leading-relaxed font-manrope max-w-md mx-auto">
                        Ask me anything about Solana tokens, market analysis, trading strategies, or blockchain insights. I&apos;m here to help!
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
                      onClick={() => handleTabClick("gpt-5")}
                      className={`px-4 py-2 rounded-full text-sm font-medium font-manrope transition-all duration-300 flex items-center gap-2 ${
                        activeTab === "gpt-5"
                          ? "text-white border border-purple-500/50"
                          : "chatbox-clean text-gray-300 hover:text-white border border-purple-500/20"
                      } ${clickedTab === "gpt-5" ? "ai-tab-click" : ""}`}
                      style={activeTab === "gpt-5" ? {
                        background: 'rgba(168, 85, 247, 0.25)',
                        backdropFilter: 'blur(20px)',
                      } : {}}
                    >
                      <img src="/integrations/openailogo.png" alt="OpenAI" className="w-4 h-4 object-contain" />
                      GPT-5
                    </button>
                    <button
                      onClick={() => handleTabClick("o4-mini")}
                      className={`px-4 py-2 rounded-full text-sm font-medium font-manrope transition-all duration-300 flex items-center gap-2 ${
                        activeTab === "o4-mini"
                          ? "text-white border border-purple-500/50"
                          : "chatbox-clean text-gray-300 hover:text-white border border-purple-500/20"
                      } ${clickedTab === "o4-mini" ? "ai-tab-click" : ""}`}
                      style={activeTab === "o4-mini" ? {
                        background: 'rgba(168, 85, 247, 0.25)',
                        backdropFilter: 'blur(20px)',
                      } : {}}
                    >
                      <img src="/integrations/openailogo.png" alt="OpenAI" className="w-4 h-4 object-contain" />
                      o4-mini
                    </button>
                    <button
                      onClick={() => handleTabClick("gemini-2.5-flash")}
                      className={`px-4 py-2 rounded-full text-sm font-medium font-manrope transition-all duration-300 flex items-center gap-2 ${
                        activeTab === "gemini-2.5-flash"
                          ? "text-white border border-purple-500/50"
                          : "chatbox-clean text-gray-300 hover:text-white border border-purple-500/20"
                      } ${clickedTab === "gemini-2.5-flash" ? "ai-tab-click" : ""}`}
                      style={activeTab === "gemini-2.5-flash" ? {
                        background: 'rgba(168, 85, 247, 0.25)',
                        backdropFilter: 'blur(20px)',
                      } : {}}
                    >
                      <img src="/integrations/geminilogo.png" alt="Gemini" className="w-4 h-4 object-contain" />
                      Gemini 2.5 Flash
                    </button>
                    </div>
                    {/* Price Estimate */}
                    {message.trim() && (
                      <div className="mb-3 px-2">
                        <div className="transparent-container rounded-lg p-3 border border-purple-500/20">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span className="text-xs text-white/70 font-manrope">Estimated Cost</span>
                            </div>
                            <div className="flex items-center gap-2">
                              {isFreeModel ? (
                                <span className="text-sm font-bold font-manrope text-green-400">
                                  FREE
                                </span>
                              ) : (
                                <>
                                  <span className={`text-sm font-bold font-manrope ${hasEnoughUSDC ? 'text-green-400' : 'text-red-400'}`}>
                                    {priceEstimate.totalCostWithBuffer.toFixed(2)} USDC
                                  </span>
                                  {!hasEnoughUSDC && connected && (
                                    <span className="text-xs text-red-400 font-manrope">Insufficient</span>
                                  )}
                                </>
                              )}
                            </div>
                          </div>
                          {!isFreeModel && (
                            <>
                              <div className="flex items-center justify-between text-xs text-white/60 font-manrope">
                                <span>Input: ~{priceEstimate.inputTokens.toLocaleString()} tokens (${priceEstimate.inputCost.toFixed(2)} USDC)</span>
                                <span>Output: ~{priceEstimate.outputTokens.toLocaleString()} tokens (${priceEstimate.outputCost.toFixed(2)} USDC)</span>
                              </div>
                              {connected && (
                                <div className="mt-2 pt-2 border-t border-white/10 text-xs text-white/50 font-manrope">
                                  USDC Balance: {usdcBalance.toFixed(2)} USDC
                                </div>
                              )}
                            </>
                          )}
                          {isFreeModel && (
                            <div className="text-xs text-green-400/80 font-manrope mt-2">
                              This model is free to use - no payment required!
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    {/* Input */}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={message}
                        onChange={handleMessageChange}
                        placeholder={isFreeModel ? `Type your message for ${activeTab}...` : (connected ? `Type your message for ${activeTab}...` : "Connect wallet to start...")}
                        className="flex-1 px-6 py-4 chatbox-clean border border-purple-500/20 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/40 text-white placeholder-gray-400 font-manrope"
                        disabled={!isFreeModel && !connected}
                      />
                      <button
                        onClick={handleSendMessage}
                        disabled={!message || (!isFreeModel && !connected) || isLoadingAI || (!isFreeModel && isProcessingPayment) || !hasEnoughUSDC}
                        className="px-5 py-4 rounded-lg font-manrope transition-all duration-500 disabled:cursor-not-allowed flex items-center justify-center"
                        style={{
                          background: !message || (!isFreeModel && !connected) || isLoadingAI || (!isFreeModel && isProcessingPayment) || !hasEnoughUSDC
                            ? 'rgba(255, 255, 255, 0.03)' 
                            : 'rgba(255, 255, 255, 0.06)',
                          backdropFilter: 'blur(12px)',
                          border: !message || (!isFreeModel && !connected) || isLoadingAI || (!isFreeModel && isProcessingPayment) || !hasEnoughUSDC
                            ? '1px solid rgba(255, 255, 255, 0.08)'
                            : '1px solid rgba(255, 255, 255, 0.15)',
                          color: !message || (!isFreeModel && !connected) || isLoadingAI || (!isFreeModel && isProcessingPayment) || !hasEnoughUSDC
                            ? 'rgba(255, 255, 255, 0.3)'
                            : 'rgba(255, 255, 255, 0.9)',
                          minWidth: '48px'
                        }}
                        onMouseEnter={(e) => {
                          if (!message || (!isFreeModel && !connected) || isLoadingAI || (!isFreeModel && isProcessingPayment) || !hasEnoughUSDC) return;
                          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.25)';
                          e.currentTarget.style.transform = 'scale(1.02)';
                        }}
                        onMouseLeave={(e) => {
                          if (!message || (!isFreeModel && !connected) || isLoadingAI || (!isFreeModel && isProcessingPayment) || !hasEnoughUSDC) return;
                          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
                          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                          e.currentTarget.style.transform = 'scale(1)';
                        }}
                        title={isFreeModel ? "Send message (Free)" : (!connected ? "Connect wallet to send" : !hasEnoughUSDC ? `Need ${priceEstimate.totalCostWithBuffer.toFixed(2)} USDC` : "Send message")}
                      >
                        {(isLoadingAI || (isProcessingPayment && !isFreeModel)) ? (
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

export default function PayPerUseAgent() {
  return (
    <WalletContextProvider>
      <PayPerUseAgentContent />
    </WalletContextProvider>
  );
}