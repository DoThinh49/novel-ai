'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface Particle {
  id: number;
  left: string;
  bottom: string;
  size: number;
  duration: string;
  delay: string;
  moveX: string;
  moveY: string;
  maxOpacity: number;
}

export default function VNLandingPage() {
  const router = useRouter();
  const [isEntering, setIsEntering] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);

  // Pre-load audio context and create particles on mount
  useEffect(() => {
    const generatedParticles: Particle[] = Array.from({ length: 36 }, (_, i) => ({
      id: i,
      left: `${(i * 2.7 + Math.random() * 3.5) % 96 + 2}%`,
      bottom: `${Math.random() * 50 - 10}%`,
      size: Math.random() * 4 + 2,
      duration: `${6 + Math.random() * 7}s`,
      delay: `${Math.random() * 6}s`,
      moveX: `${(Math.random() - 0.5) * 90}px`,
      moveY: `-${130 + Math.random() * 160}px`,
      maxOpacity: 0.35 + Math.random() * 0.5,
    }));
    setParticles(generatedParticles);
  }, []);

  // Soft crystalline visual novel start chime using Web Audio API
  const playStartSound = useCallback(() => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      
      const now = ctx.currentTime;
      
      // High chime bell frequencies (E6, G#6, B6, E7) for a fantasy Title Screen sound
      const freqs = [1318.51, 1661.22, 1975.53, 2637.02];
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);
        
        gain.gain.setValueAtTime(0, now + idx * 0.08);
        gain.gain.linearRampToValueAtTime(0.12, now + idx * 0.08 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.08 + 1.8);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 2.0);
      });
    } catch {
      // Graceful fallback if audio context is blocked
    }
  }, []);

  const handleStart = useCallback(() => {
    if (isEntering) return;
    setIsEntering(true);
    playStartSound();

    // Smooth transition delay before pushing route
    setTimeout(() => {
      router.push('/login');
    }, 900);
  }, [isEntering, playStartSound, router]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        handleStart();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleStart]);

  return (
    <main className="vn-landing-container" tabIndex={0}>
      {/* Background Image Layer (Independent asset: /bg-anime.jpg) */}
      <img
        src="/bg-anime.jpg"
        alt="Novel AI Studio Fantasy Anime Landscape Background"
        className={`vn-background ${isEntering ? 'entering' : ''}`}
      />

      {/* Ambient Vignette Overlay */}
      <div className="vn-vignette" />
      
      {/* Dynamic Lens Bloom behind Logo */}
      <div className="vn-glow-bloom" />

      {/* Floating Particles / Sparkles / Petals */}
      {particles.map((p) => (
        <div
          key={p.id}
          className="vn-particle"
          style={
            {
              left: p.left,
              bottom: p.bottom,
              width: `${p.size}px`,
              height: `${p.size}px`,
              '--duration': p.duration,
              '--delay': p.delay,
              '--move-x': p.moveX,
              '--move-y': p.moveY,
              '--max-opacity': isHovered ? p.maxOpacity * 1.3 : p.maxOpacity,
            } as React.CSSProperties
          }
        />
      ))}

      {/* Interactive Central Logo Layer (Independent asset: /logo-novel.png) */}
      <button
        type="button"
        onClick={handleStart}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`vn-logo-wrapper ${isHovered ? 'hovered' : ''} ${isEntering ? 'entering' : ''}`}
        aria-label="Click to Enter Novel AI Studio"
      >
        <img
          src="/logo-novel.png"
          alt="Novel AI Studio Title Screen Logo"
          className="vn-logo-img"
        />

        {/* Visual Novel Title Callout */}
        <div className="vn-start-prompt">
          <span>— PRESS START TO ENTER —</span>
        </div>
      </button>

      {/* White/Ethereal Flash overlay during transition */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: '#ffffff',
          pointerEvents: 'none',
          zIndex: 90,
          opacity: isEntering ? 0.85 : 0,
          transition: 'opacity 0.9s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      />
    </main>
  );
}
