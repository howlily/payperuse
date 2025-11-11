"use client";

import { useEffect, useState } from "react";

export default function LoadingScreen() {
  const [isVisible, setIsVisible] = useState(true);
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);

  useEffect(() => {
    // Show loading screen for at least 1.5 seconds, then fade out
    const timer = setTimeout(() => {
      setIsAnimatingOut(true);
      setTimeout(() => {
        setIsVisible(false);
      }, 500); // Fade out duration
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 bg-black z-[9999] flex items-center justify-center transition-opacity duration-500 ${
        isAnimatingOut ? "opacity-0" : "opacity-100"
      }`}
    >
      {/* Loading Content - Centered */}
      <div className="text-center">
        <div className="flex items-center gap-3 justify-center mb-6">
          <div className="w-6 h-6 bg-purple-400 rounded-full animate-bounce"></div>
          <div
            className="w-6 h-6 bg-pink-400 rounded-full animate-bounce"
            style={{ animationDelay: "0.2s" }}
          ></div>
          <div
            className="w-6 h-6 bg-purple-400 rounded-full animate-bounce"
            style={{ animationDelay: "0.4s" }}
          ></div>
        </div>
        <p className="text-white/60 font-manrope text-sm">Loading...</p>
      </div>
    </div>
  );
}
