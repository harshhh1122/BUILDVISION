import React from 'react';
import { Sparkles, Users, Award, Code2 } from 'lucide-react';
import Header from '../components/Header';

export default function AboutPage() {
  return (
    <div className="h-screen bg-zinc-950 text-zinc-100 flex flex-col relative overflow-hidden font-sans select-none">
      {/* Background neutral grey glows */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-zinc-800/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-zinc-900/10 rounded-full blur-3xl pointer-events-none" />

      <Header active="about" />

      {/* Main Content */}
      <main className="max-w-3xl w-full mx-auto px-6 py-4 flex-grow flex flex-col justify-center gap-5 overflow-hidden h-[calc(100vh-140px)] relative z-10">
        
        <div className="text-center flex flex-col items-center gap-2">
          <h2 className="text-2xl md:text-3.5xl font-extrabold tracking-tight bg-gradient-to-r from-white to-zinc-300 bg-clip-text text-transparent">
            About BuildVision AI
          </h2>
          <p className="text-[10px] text-zinc-500 max-w-md">
            Eliminating physical waste and architectural errors through immersive spatial simulation.
          </p>
        </div>

        {/* Story Text */}
        <div className="glass-panel p-5 rounded-xl flex flex-col gap-3 border-zinc-800/50 mt-2">
          <h3 className="font-extrabold text-xs text-zinc-300 font-mono uppercase tracking-wider flex items-center gap-1.5">
            <Award className="w-4 h-4" /> The Mission
          </h3>
          <p className="text-[11px] text-zinc-300 leading-relaxed font-medium">
            BuildVision AI was founded by structural architects and AI researchers in 2026 to bridge the costly gap between 2D paper blueprints and real-world construction.
          </p>
          <p className="text-[10px] text-zinc-400 leading-relaxed font-medium">
            Traditionally, home builders receive static layouts and only realize spatial mismatches or design clashes after construction has already begun. Making changes after this point is extremely expensive and generates structural waste. BuildVision AI lets you walk inside, open doors, and project your virtual house onto your actual physical plot at 1:1 real-world scale before laying a single brick.
          </p>
        </div>

        {/* Stack Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="glass-panel p-4 rounded-xl flex flex-col gap-2 border-zinc-800/50">
            <h4 className="font-bold text-xs text-zinc-200 flex items-center gap-1">
              <Code2 className="w-3.5 h-3.5 text-zinc-400" /> Technology Stack
            </h4>
            <p className="text-[10px] text-zinc-400 leading-relaxed">
              We leverage browser-based Three.js WebGL rendering for detailed CAD simulations, Web Speech APIs for natural voice controls, and Express/SQLite systems.
            </p>
          </div>
          <div className="glass-panel p-4 rounded-xl flex flex-col gap-2 border-zinc-800/50">
            <h4 className="font-bold text-xs text-zinc-200 flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-zinc-400" /> Recommendations
            </h4>
            <p className="text-[10px] text-zinc-400 leading-relaxed">
              Our backend calculates popular layouts based on real-time community search parameters to recommend trending designs dynamically.
            </p>
          </div>
        </div>

      </main>

      <footer className="border-t border-zinc-900 bg-zinc-950 py-4 text-center text-[10px] text-zinc-500 font-mono">
        <p>BuildVision AI System • Developed with Three.js & Tailwind CSS v4 • Copyright © 2026</p>
      </footer>
    </div>
  );
}
