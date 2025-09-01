import React from 'react';

export function SimpleVideoBackground() {
  return (
    <div className="fixed inset-0 w-full h-full z-0">
      {/* Animated gradient background as fallback */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 animate-pulse" />
      
      {/* Cosmic overlay effects */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-slate-900/60" />
      
      {/* Subtle star field effect */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-blue-300 rounded-full animate-pulse" />
        <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-cyan-300 rounded-full animate-pulse delay-150" />
        <div className="absolute bottom-1/4 left-1/3 w-1.5 h-1.5 bg-blue-200 rounded-full animate-pulse delay-300" />
        <div className="absolute top-2/3 right-1/4 w-1 h-1 bg-cyan-200 rounded-full animate-pulse delay-500" />
        <div className="absolute bottom-1/3 right-2/3 w-2 h-2 bg-blue-400 rounded-full animate-pulse delay-700" />
      </div>
      
      {/* Subtle animated glow */}
      <div className="absolute inset-0 bg-gradient-radial from-blue-600/10 via-transparent to-transparent animate-pulse" />
    </div>
  );
}
