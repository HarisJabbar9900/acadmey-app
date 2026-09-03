import React, { useState, useEffect } from 'react';
import { GraduationCap, Sparkles, Award, ShieldCheck, Zap } from 'lucide-react';

export default function MobileSplashScreen({ onFinish }) {
  const [isVisible, setIsVisible] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth < 768;
  });
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('Initializing Secure Portal...');

  useEffect(() => {
    // Only activate on mobile devices (width < 768px)
    if (typeof window === 'undefined') return;
    const isMobile = window.innerWidth < 768;

    // Clean up pre-React instant splash element from HTML
    const preSplash = document.getElementById('mobile-instant-splash');
    if (preSplash) {
      preSplash.remove();
    }

    if (!isMobile) {
      setIsVisible(false);
      if (onFinish) onFinish();
      return;
    }

    setIsVisible(true);

    const startTime = Date.now();
    const duration = 1800; // 1.8s for a crisp, punchy, luxury experience

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(Math.round((elapsed / duration) * 100), 100);
      setProgress(pct);

      if (pct < 35) {
        setStatusText('⚡ Initializing Secure Portal...');
      } else if (pct < 70) {
        setStatusText('☁️ Connecting Cloud Database...');
      } else if (pct < 95) {
        setStatusText('📊 Preparing Student Records...');
      } else {
        setStatusText('✨ Welcome to Al-Zia Science Academy!');
      }

      if (pct >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          setIsFadingOut(true);
          setTimeout(() => {
            setIsVisible(false);
            if (onFinish) onFinish();
          }, 600); // Wait for fade out animation
        }, 200);
      }
    }, 30);

    return () => clearInterval(interval);
  }, [onFinish]);

  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999999] bg-[#050814] flex flex-col items-center justify-between p-8 text-white select-none transition-all duration-700 ease-out ${
        isFadingOut ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'
      }`}
      style={{
        backgroundImage: 'radial-gradient(circle at 50% 35%, rgba(99, 102, 241, 0.15), transparent 60%), radial-gradient(circle at 50% 75%, rgba(245, 158, 11, 0.1), transparent 50%)'
      }}
    >
      {/* Top Subtle Pill */}
      <div className="w-full flex items-center justify-center pt-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/80 border border-indigo-500/30 text-[11px] font-semibold text-indigo-300 shadow-lg backdrop-blur-md animate-fade-in">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Official Academy Portal</span>
        </div>
      </div>

      {/* Center Hero Visual */}
      <div className="flex flex-col items-center justify-center space-y-6 text-center my-auto">
        
        {/* Glowing Emblem & Pulsing Aura */}
        <div className="relative flex items-center justify-center">
          {/* Animated Glow Rings */}
          <div className="absolute w-36 h-36 rounded-full bg-indigo-500/20 blur-xl animate-pulse" />
          <div className="absolute w-28 h-28 rounded-full bg-amber-500/15 blur-lg animate-pulse" style={{ animationDelay: '0.5s' }} />
          
          {/* Outer Rotating Dashed Ring */}
          <div className="w-32 h-32 rounded-full border-2 border-dashed border-amber-400/40 flex items-center justify-center animate-spin" style={{ animationDuration: '10s' }} />

          {/* Inner Glass Emblem Shield */}
          <div className="absolute w-24 h-24 rounded-3xl bg-gradient-to-tr from-slate-900 via-indigo-950 to-slate-900 border-2 border-amber-400/80 shadow-2xl flex items-center justify-center shadow-indigo-500/30 backdrop-blur-xl">
            <GraduationCap className="w-12 h-12 text-amber-400 filter drop-shadow-[0_0_12px_rgba(245,158,11,0.6)] animate-bounce" style={{ animationDuration: '2.5s' }} />
            
            {/* Sparkle Badge */}
            <div className="absolute -top-1.5 -right-1.5 p-1 rounded-full bg-amber-400 text-slate-950 shadow-md">
              <Sparkles className="w-3 h-3 animate-spin" style={{ animationDuration: '6s' }} />
            </div>
          </div>
        </div>

        {/* Academy Title & Brand */}
        <div className="space-y-2 max-w-xs">
          <h1 className="text-2xl font-black tracking-wider uppercase font-serif bg-gradient-to-r from-amber-200 via-amber-400 to-indigo-200 bg-clip-text text-transparent drop-shadow-sm">
            Al-Zia Science Academy
          </h1>
          <p className="text-xs text-slate-400 font-medium tracking-wide">
            Center for Science, Computer & Modern Academic Learning
          </p>
        </div>

        {/* Badges Row */}
        <div className="flex items-center gap-2 pt-1">
          <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-bold font-mono bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            9th - 12th
          </span>
          <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-bold font-mono bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1">
            <Award className="w-3 h-3 text-amber-400" /> Merit Portal
          </span>
        </div>

      </div>

      {/* Bottom Loading Progress Bar & Status */}
      <div className="w-full max-w-xs space-y-3 pb-6">
        
        {/* Progress Tracker Bar */}
        <div className="relative w-full h-2 bg-slate-900/90 rounded-full overflow-hidden border border-slate-800 shadow-inner">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-amber-400 rounded-full transition-all duration-150 ease-out shadow-[0_0_12px_rgba(99,102,241,0.8)]"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Status Line & Percentage */}
        <div className="flex items-center justify-between text-[11px] font-mono px-1">
          <span className="text-slate-400 animate-pulse flex items-center gap-1.5 truncate max-w-[210px]">
            <Zap className="w-3 h-3 text-amber-400 shrink-0" />
            {statusText}
          </span>
          <span className="text-amber-400 font-bold font-mono">
            {progress}%
          </span>
        </div>

      </div>
    </div>
  );
}
