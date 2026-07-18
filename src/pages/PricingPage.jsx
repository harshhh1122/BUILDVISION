import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Check } from 'lucide-react';
import Header from '../components/Header';

export default function PricingPage() {
  const navigate = useNavigate();

  const handleLaunchApp = () => {
    navigate('/dashboard');
  };

  return (
    <div className="h-screen bg-zinc-950 text-zinc-100 flex flex-col relative overflow-hidden font-sans select-none">
      {/* Background neutral grey glows */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-zinc-800/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-zinc-900/10 rounded-full blur-3xl pointer-events-none" />

      <Header active="pricing" />

      {/* Main Content */}
      <main className="max-w-5xl w-full mx-auto px-6 py-4 flex-grow flex flex-col justify-center gap-6 overflow-hidden h-[calc(100vh-140px)] relative z-10">
        
        {/* Header Title */}
        <div className="text-center flex flex-col items-center gap-2">
          <h2 className="text-2xl md:text-3.5xl font-extrabold tracking-tight bg-gradient-to-r from-white via-zinc-100 to-zinc-400 bg-clip-text text-transparent">
            Flexible Tiers for Every Project
          </h2>
          <p className="text-xs text-zinc-500 max-w-md">
            Whether you are conceptualizing a single layout or managing active builder projects, we have a plan for you.
          </p>
        </div>

        {/* Pricing Cards Grid (3 Columns) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mx-auto mt-2">
          
          {/* Free Sandbox */}
          <div className="glass-panel p-5 rounded-xl flex flex-col justify-between border-zinc-800/50 hover:border-zinc-700 transition">
            <div>
              <span className="text-[9px] uppercase font-mono tracking-widest text-zinc-500">Starter</span>
              <h4 className="text-base font-bold text-slate-100 mt-1">Free Sandbox</h4>
              <p className="text-[10px] text-zinc-400 mt-1">Perfect for conceptualizing standard layouts.</p>
              <div className="my-4 font-mono">
                <span className="text-xl font-extrabold text-white">₹0</span>
                <span className="text-xs text-zinc-500">/ forever</span>
              </div>
              <ul className="text-[10px] text-zinc-400 flex flex-col gap-2 border-t border-zinc-850 pt-3">
                <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-zinc-400 shrink-0" /> Standard 2D & 3D visualization</li>
                <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-zinc-400 shrink-0" /> Limit 1 layout option per query</li>
                <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-zinc-400 shrink-0" /> Table-top AR mode</li>
              </ul>
            </div>
            <button 
              onClick={handleLaunchApp}
              className="w-full mt-6 py-2 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 rounded-lg text-xs font-bold text-zinc-200 transition cursor-pointer"
            >
              Access Free Sandbox
            </button>
          </div>

          {/* Pro Builder */}
          <div className="glass-panel p-5 rounded-xl flex flex-col justify-between border-zinc-750 bg-zinc-900/10 hover:border-zinc-650 shadow-2xl relative overflow-hidden group transition">
            <div className="absolute top-3 right-3 bg-zinc-800 border border-zinc-700 text-zinc-200 text-[9px] font-bold py-0.5 px-2.5 rounded-full uppercase tracking-wider">
              Popular
            </div>
            <div>
              <span className="text-[9px] uppercase font-mono tracking-widest text-zinc-400 font-bold">Recommended</span>
              <h4 className="text-base font-bold text-slate-100 mt-1">Pro Builder</h4>
              <p className="text-[10px] text-zinc-400 mt-1">For self-builders and architectural designers.</p>
              <div className="my-4 font-mono">
                <span className="text-xl font-extrabold text-white">₹4,999</span>
                <span className="text-xs text-zinc-500">/ single project</span>
              </div>
              <ul className="text-[10px] text-zinc-400 flex flex-col gap-2 text-left border-t border-zinc-850 pt-3">
                <li className="flex items-center gap-1.5 text-zinc-200"><Check className="w-3 h-3 text-zinc-400 shrink-0" /> Dynamic 3 layout alternatives</li>
                <li className="flex items-center gap-1.5 text-zinc-200"><Check className="w-3 h-3 text-zinc-400 shrink-0" /> Real-scale 1:1 camera AR Scanner</li>
                <li className="flex items-center gap-1.5 text-zinc-200"><Check className="w-3 h-3 text-zinc-400 shrink-0" /> Speech mic controls & PDF cost exports</li>
              </ul>
            </div>
            <button 
              onClick={handleLaunchApp}
              className="w-full mt-6 py-2 bg-zinc-100 hover:bg-white text-zinc-950 rounded-lg text-xs font-bold shadow-lg shadow-black/20 transition cursor-pointer"
            >
              Buy Pro Pack
            </button>
          </div>

          {/* Developer Plan (New Tier) */}
          <div className="glass-panel p-5 rounded-xl flex flex-col justify-between border-zinc-800/50 hover:border-zinc-700 transition">
            <div>
              <span className="text-[9px] uppercase font-mono tracking-widest text-zinc-500">Enterprise</span>
              <h4 className="text-base font-bold text-slate-100 mt-1">Developer Plan</h4>
              <p className="text-[10px] text-zinc-400 mt-1">For professional builders & architectural studios.</p>
              <div className="my-4 font-mono">
                <span className="text-xl font-extrabold text-white">₹14,999</span>
                <span className="text-xs text-zinc-500">/ multi-project</span>
              </div>
              <ul className="text-[10px] text-zinc-400 flex flex-col gap-2 border-t border-zinc-850 pt-3">
                <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-zinc-400 shrink-0" /> Unlimited generated blueprint designs</li>
                <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-zinc-400 shrink-0" /> Multi-user team workspace collaboration</li>
                <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-zinc-400 shrink-0" /> White-labeled client PDF cost reports</li>
              </ul>
            </div>
            <button 
              onClick={handleLaunchApp}
              className="w-full mt-6 py-2 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 rounded-lg text-xs font-bold text-zinc-200 transition cursor-pointer"
            >
              Subscribe Developer
            </button>
          </div>

        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-900 bg-zinc-950 py-4 text-center text-[10px] text-zinc-500 font-mono">
        <p>BuildVision AI System • Developed with Three.js & Tailwind CSS v4 • Copyright © 2026</p>
      </footer>
    </div>
  );
}
