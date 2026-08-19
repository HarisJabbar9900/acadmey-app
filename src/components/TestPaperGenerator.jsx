import React from 'react';
import { Sparkles, Clock, Construction, Rocket, Code2, Cpu } from 'lucide-react';

export default function TestPaperGenerator() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center space-y-6 animate-in fade-in duration-300">
      
      {/* Animated Glow Icon */}
      <div className="relative">
        <div className="w-24 h-24 bg-gradient-to-tr from-amber-500/20 via-indigo-500/20 to-purple-500/20 rounded-3xl border border-indigo-500/30 flex items-center justify-center shadow-2xl backdrop-blur-md">
          <Sparkles className="w-12 h-12 text-amber-400 animate-pulse" />
        </div>
        <div className="absolute -bottom-2 -right-2 bg-indigo-600 text-white p-2 rounded-xl shadow-lg border border-slate-800">
          <Construction className="w-5 h-5" />
        </div>
      </div>

      {/* Main Title & Description */}
      <div className="space-y-3 max-w-xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-full text-xs font-bold uppercase tracking-wider">
          <Clock className="w-3.5 h-3.5" />
          <span>Feature Under Active Development</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          AI Exam & Test Paper Generator
        </h1>

        <p className="text-sm sm:text-base text-slate-400 leading-relaxed font-medium">
          We are currently crafting a state-of-the-art AI Examination Generator for Al-Zia Science Academy. Soon, you will be able to upload custom chapter PDFs or paste syllabus text to auto-generate board-level A4 test papers!
        </p>
      </div>

      {/* Status Progress Badges */}
      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
        <div className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-800 rounded-2xl text-xs font-mono text-slate-300 shadow-sm">
          <Rocket className="w-4 h-4 text-indigo-400" />
          <span>Status: <strong className="text-amber-400">Working on this...</strong></span>
        </div>

        <div className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-800 rounded-2xl text-xs font-mono text-emerald-400 shadow-sm">
          <Cpu className="w-4 h-4 text-emerald-400" />
          <span>Module: <strong>AI Document Engine v2.0</strong></span>
        </div>
      </div>

    </div>
  );
}
