"use client";

export default function BreathingLights() {
  return (
    <div className="fixed inset-0 pointer-events-none z-[1] overflow-hidden">
      {/* Top Left Corner */}
      <div className="absolute top-0 left-0 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl animate-breathe-1"></div>
      <div className="absolute top-8 left-8 w-24 h-24 bg-pink-500/5 rounded-full blur-xl animate-breathe-2"></div>
      
      {/* Top Right Corner */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/5 rounded-full blur-3xl animate-breathe-3"></div>
      <div className="absolute top-12 right-12 w-20 h-20 bg-cyan-500/5 rounded-full blur-xl animate-breathe-1"></div>
      
      {/* Bottom Left Corner */}
      <div className="absolute bottom-0 left-0 w-36 h-36 bg-teal-500/5 rounded-full blur-3xl animate-breathe-2"></div>
      <div className="absolute bottom-8 left-8 w-28 h-28 bg-emerald-500/5 rounded-full blur-2xl animate-breathe-3"></div>
      
      {/* Bottom Right Corner */}
      <div className="absolute bottom-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl animate-breathe-1"></div>
      <div className="absolute bottom-12 right-12 w-24 h-24 bg-pink-500/5 rounded-full blur-xl animate-breathe-2"></div>
      
      {/* Top Center */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-purple-500/4 rounded-full blur-3xl animate-breathe-3"></div>
      
      {/* Bottom Center */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-44 h-44 bg-pink-500/4 rounded-full blur-3xl animate-breathe-1"></div>
      
      {/* Left Center */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-40 h-40 bg-blue-500/4 rounded-full blur-3xl animate-breathe-2"></div>
      
      {/* Right Center */}
      <div className="absolute top-1/2 right-0 -translate-y-1/2 w-40 h-40 bg-cyan-500/4 rounded-full blur-3xl animate-breathe-3"></div>
      
      {/* Additional subtle lights scattered around */}
      <div className="absolute top-1/4 left-1/4 w-20 h-20 bg-purple-500/3 rounded-full blur-2xl animate-breathe-1"></div>
      <div className="absolute top-3/4 right-1/4 w-24 h-24 bg-pink-500/3 rounded-full blur-2xl animate-breathe-2"></div>
      <div className="absolute bottom-1/4 left-3/4 w-22 h-22 bg-teal-500/3 rounded-full blur-2xl animate-breathe-3"></div>
    </div>
  );
}
