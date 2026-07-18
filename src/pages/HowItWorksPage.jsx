import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sun, Zap, AlertTriangle, ArrowRight } from 'lucide-react';
import Header from '../components/Header';

export default function HowItWorksPage() {
  const navigate = useNavigate();

  // Handle clicking a prompt example to direct user straight to the dashboard
  const handlePromptClick = (promptText) => {
    navigate('/dashboard', { state: { initialPrompt: promptText } });
  };

  return (
    <div className="h-screen bg-zinc-950 text-zinc-100 flex flex-col relative overflow-hidden font-sans select-none">
      {/* Background neutral grey glows */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-zinc-800/10 rounded-full blur-3xl pointer-events-none" />
      
      <Header active="how-it-works" />

      {/* Main Content (ChatGPT Introduction Grid Theme) */}
      <main className="max-w-5xl w-full mx-auto px-6 py-4 flex-grow flex flex-col justify-center gap-6 overflow-hidden h-[calc(100vh-140px)] relative z-10">
        
        {/* Header Title */}
        <div className="text-center flex flex-col items-center gap-2">
          <h2 className="text-2xl md:text-3.5xl font-extrabold tracking-tight bg-gradient-to-r from-white via-zinc-100 to-zinc-400 bg-clip-text text-transparent">
            How BuildVision AI Works
          </h2>
          <p className="text-xs text-zinc-500 max-w-md">
            Adapted from generative LLM interfaces, the BuildVision system processes design briefs in 3 columns.
          </p>
        </div>

        {/* ChatGPT Style 3-Column Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-1">
          
          {/* Column 1: Examples */}
          <div className="flex flex-col gap-4">
            <div className="flex flex-col items-center gap-2 text-center pb-2">
              <Sun className="w-6 h-6 text-zinc-400" />
              <h3 className="font-bold text-sm tracking-wide text-zinc-200">Examples</h3>
            </div>
            
            <div className="flex flex-col gap-3">
              <button 
                onClick={() => handlePromptClick('1200 sq ft, 3 BHK, width 30 ft, budget 45 Lakhs')}
                className="w-full bg-zinc-900 border-none p-4 rounded-2xl text-center text-xs font-semibold cursor-pointer transition-all duration-300 ease-out text-zinc-350 font-mono leading-relaxed shadow-lg shadow-black/20 hover:bg-zinc-850 hover:scale-[1.03] hover:shadow-2xl hover:text-zinc-100"
              >
                "1200 sq ft, 3 BHK, width 30 ft, budget 45 Lakhs" →
              </button>
              
              <button 
                onClick={() => handlePromptClick('Modern duplex with high ceilings & front porch')}
                className="w-full bg-zinc-900 border-none p-4 rounded-2xl text-center text-xs font-semibold cursor-pointer transition-all duration-300 ease-out text-zinc-350 font-mono leading-relaxed shadow-lg shadow-black/20 hover:bg-zinc-850 hover:scale-[1.03] hover:shadow-2xl hover:text-zinc-100"
              >
                "Modern duplex with high ceilings & front porch" →
              </button>
              
              <button 
                onClick={() => handlePromptClick('Vastu compliant east facing plot, 2 rooms, 2 baths')}
                className="w-full bg-zinc-900 border-none p-4 rounded-2xl text-center text-xs font-semibold cursor-pointer transition-all duration-300 ease-out text-zinc-350 font-mono leading-relaxed shadow-lg shadow-black/20 hover:bg-zinc-850 hover:scale-[1.03] hover:shadow-2xl hover:text-zinc-100"
              >
                "Vastu compliant east facing plot, 2 rooms, 2 baths" →
              </button>
            </div>
          </div>

          {/* Column 2: Capabilities */}
          <div className="flex flex-col gap-4">
            <div className="flex flex-col items-center gap-2 text-center pb-2">
              <Zap className="w-6 h-6 text-zinc-450" />
              <h3 className="font-bold text-sm tracking-wide text-zinc-200">Capabilities</h3>
            </div>
            
            <div className="flex flex-col gap-3">
              <div className="bg-zinc-900 border-none p-4 rounded-2xl text-center text-xs font-medium text-zinc-400 leading-relaxed min-h-[60px] flex items-center justify-center shadow-lg shadow-black/20 hover:bg-zinc-850 hover:scale-[1.03] hover:shadow-2xl hover:text-zinc-200 transition-all duration-300 ease-out select-text">
                Generates 3 customizable 2D drafts immediately in real-time
              </div>
              
              <div className="bg-zinc-900 border-none p-4 rounded-2xl text-center text-xs font-medium text-zinc-400 leading-relaxed min-h-[60px] flex items-center justify-center shadow-lg shadow-black/20 hover:bg-zinc-850 hover:scale-[1.03] hover:shadow-2xl hover:text-zinc-200 transition-all duration-300 ease-out select-text">
                Extrudes structure into a fully interactive 3D model automatically
              </div>
              
              <div className="bg-zinc-900 border-none p-4 rounded-2xl text-center text-xs font-medium text-zinc-400 leading-relaxed min-h-[60px] flex items-center justify-center shadow-lg shadow-black/20 hover:bg-zinc-850 hover:scale-[1.03] hover:shadow-2xl hover:text-zinc-200 transition-all duration-300 ease-out select-text">
                Calculates local civil material volumes (cement, steel, sand)
              </div>
            </div>
          </div>

          {/* Column 3: Limitations */}
          <div className="flex flex-col gap-4">
            <div className="flex flex-col items-center gap-2 text-center pb-2">
              <AlertTriangle className="w-6 h-6 text-zinc-500" />
              <h3 className="font-bold text-sm tracking-wide text-zinc-200">Limitations</h3>
            </div>
            
            <div className="flex flex-col gap-3">
              <div className="bg-zinc-900 border-none p-4 rounded-2xl text-center text-xs font-medium text-zinc-400 leading-relaxed min-h-[60px] flex items-center justify-center shadow-lg shadow-black/20 hover:bg-zinc-850 hover:scale-[1.03] hover:shadow-2xl hover:text-zinc-200 transition-all duration-300 ease-out select-text">
                Requires minimum valid width/length ratios to generate layouts
              </div>
              
              <div className="bg-zinc-900 border-none p-4 rounded-2xl text-center text-xs font-medium text-zinc-400 leading-relaxed min-h-[60px] flex items-center justify-center shadow-lg shadow-black/20 hover:bg-zinc-850 hover:scale-[1.03] hover:shadow-2xl hover:text-zinc-200 transition-all duration-300 ease-out select-text">
                AR plot scanner requires device camera permission & orientation API
              </div>
              
              <div className="bg-zinc-900 border-none p-4 rounded-2xl text-center text-xs font-medium text-zinc-400 leading-relaxed min-h-[60px] flex items-center justify-center shadow-lg shadow-black/20 hover:bg-zinc-850 hover:scale-[1.03] hover:shadow-2xl hover:text-zinc-200 transition-all duration-300 ease-out select-text">
                Does not replace structural civil engineering approvals or maps
              </div>
            </div>
          </div>

        </div>

        {/* CTA Launch Co-Pilot */}
        <div className="flex justify-center mt-2">
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-zinc-100 hover:bg-white text-zinc-950 font-black py-2.5 px-8 rounded-xl shadow-xl shadow-black/30 cursor-pointer text-xs transition flex items-center gap-1.5 duration-300 hover:scale-[1.03]"
          >
            Launch Co-Pilot Now
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-900 bg-zinc-950 py-4 text-center text-[10px] text-zinc-500 font-mono">
        <p>BuildVision AI System • Developed with Three.js & Tailwind CSS v4 • Copyright © 2026</p>
      </footer>
    </div>
  );
}
