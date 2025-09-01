import React, { useEffect, useState } from 'react';

interface Star {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
  animationDelay: number;
}

export function SimpleVideoBackground() {
  const [stars, setStars] = useState<Star[]>([]);

  useEffect(() => {
    // Generate random stars for animated starfield
    const generateStars = () => {
      const newStars: Star[] = [];
      for (let i = 0; i < 150; i++) {
        newStars.push({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: Math.random() * 2.5 + 0.5,
          opacity: Math.random() * 0.8 + 0.2,
          animationDelay: Math.random() * 4
        });
      }
      setStars(newStars);
    };

    generateStars();
  }, []);

  return (
    <div className="fixed inset-0 w-full h-full -z-10 overflow-hidden">
      {/* Base deep space gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-800" />
      
      {/* Animated color overlays */}
      <div className="absolute inset-0 opacity-60">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/30 via-transparent to-blue-900/30 animate-pulse" />
        <div 
          className="absolute inset-0 bg-gradient-to-t from-pink-900/20 via-transparent to-yellow-900/20 animate-pulse" 
          style={{ animationDelay: '2s', animationDuration: '4s' }} 
        />
      </div>

      {/* Animated starfield */}
      <div className="absolute inset-0">
        {stars.map((star) => (
          <div
            key={star.id}
            className="absolute rounded-full bg-white animate-pulse"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              opacity: star.opacity,
              animationDelay: `${star.animationDelay}s`,
              animationDuration: `${2 + Math.random() * 3}s`
            }}
          />
        ))}
      </div>

      {/* Floating space particles */}
      <div className="absolute inset-0">
        {[...Array(30)].map((_, i) => (
          <div
            key={`particle-${i}`}
            className="absolute w-0.5 h-0.5 bg-cyan-300 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 8}s`,
              animationDuration: `${3 + Math.random() * 4}s`
            }}
          />
        ))}
      </div>

      {/* Nebula-like cloud effects */}
      <div className="absolute inset-0 opacity-20">
        <div 
          className="absolute top-1/4 left-1/4 w-80 h-80 bg-gradient-radial from-purple-600/40 to-transparent rounded-full blur-3xl animate-pulse" 
          style={{ animationDuration: '6s' }}
        />
        <div 
          className="absolute top-3/4 right-1/4 w-64 h-64 bg-gradient-radial from-pink-600/40 to-transparent rounded-full blur-3xl animate-pulse" 
          style={{ animationDelay: '2s', animationDuration: '8s' }}
        />
        <div 
          className="absolute top-1/2 left-1/2 w-96 h-96 bg-gradient-radial from-blue-600/30 to-transparent rounded-full blur-3xl animate-pulse" 
          style={{ animationDelay: '4s', animationDuration: '10s' }}
        />
      </div>

      {/* Shooting stars effect */}
      <div className="absolute inset-0">
        {[...Array(3)].map((_, i) => (
          <div
            key={`shooting-${i}`}
            className="absolute w-1 h-1 bg-white rounded-full opacity-80"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `shooting-star 4s linear infinite`,
              animationDelay: `${i * 5}s`
            }}
          />
        ))}
      </div>

      {/* Central galaxy glow */}
      <div className="absolute inset-0 flex items-center justify-center opacity-30">
        <div className="w-80 h-80 bg-gradient-radial from-yellow-500/20 via-orange-500/10 to-transparent rounded-full blur-3xl animate-pulse" />
      </div>

      {/* Dark overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-900/10 to-slate-900/40 pointer-events-none" />
    </div>
  );
}
