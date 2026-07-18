import React from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import { LogoIcon } from './Logo';

export default function Header({ active = 'home' }) {
  const navigate = useNavigate();

  const handleAction = () => {
    navigate('/login');
  };

  return (
    <div className="w-full px-4 pt-4 shrink-0 relative z-50 pointer-events-none">
      <header className="pointer-events-auto border border-white/10 bg-zinc-900/15 backdrop-blur-2xl rounded-2xl px-6 py-4 flex justify-between items-center max-w-7xl w-full mx-auto select-none shadow-[0_20px_50px_rgba(0,0,0,0.4)] shadow-black/80">
        {/* Left - Sleek Slate-Grey Logo */}
        <div 
          onClick={() => navigate('/')} 
          className="flex items-center gap-2.5 cursor-pointer hover:scale-102 transition duration-300"
        >
          <div className="relative">
            {/* Subtle silver glow background under logo */}
            <div className="absolute inset-0 bg-zinc-700/20 blur-md rounded-full" />
            <LogoIcon className="w-9 h-9 relative z-10 text-zinc-300" />
          </div>
          <span className="text-lg font-extrabold tracking-wider text-slate-100 font-sans">
            BUILDVISION <span className="text-zinc-450 font-light">AI</span>
          </span>
        </div>

        {/* Center - Bold Sora Menu Links */}
        <nav className="hidden lg:flex items-center gap-5 text-sm font-black tracking-wide">
          <button 
            onClick={() => navigate('/')} 
            className={`transition cursor-pointer ${active === 'home' ? 'text-zinc-100 font-black' : 'text-zinc-450 hover:text-zinc-205'}`}
          >
            Home
          </button>
          
          <span className="text-zinc-800 text-[11px] font-light">|</span>
          
          <button 
            onClick={() => navigate('/how-it-works')} 
            className={`transition cursor-pointer ${active === 'how-it-works' ? 'text-zinc-100 font-black' : 'text-zinc-450 hover:text-zinc-205'}`}
          >
            How It Works
          </button>
          
          <span className="text-zinc-800 text-[11px] font-light">|</span>
          
          <button 
            onClick={() => navigate('/pricing')} 
            className={`transition cursor-pointer ${active === 'pricing' ? 'text-zinc-100 font-black' : 'text-zinc-450 hover:text-zinc-205'}`}
          >
            Pricing
          </button>
          
          <span className="text-zinc-800 text-[11px] font-light">|</span>
          
          <button 
            onClick={() => navigate('/about')} 
            className={`transition cursor-pointer ${active === 'about' ? 'text-zinc-100 font-black' : 'text-zinc-450 hover:text-zinc-205'}`}
          >
            About Us
          </button>
          
          <span className="text-zinc-800 text-[11px] font-light">|</span>
          
          <button 
            onClick={() => navigate('/contact')} 
            className={`transition cursor-pointer ${active === 'contact' ? 'text-zinc-100 font-black' : 'text-zinc-450 hover:text-zinc-205'}`}
          >
            Contact
          </button>
        </nav>

        {/* Right - Premium silver/white pill button */}
        <button 
          onClick={handleAction}
          className="bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-bold py-2.5 px-6 rounded-full shadow-lg shadow-black/30 transition cursor-pointer flex items-center gap-1.5 duration-300"
        >
          <UserPlus className="w-3.5 h-3.5" />
          Login / Sign Up
        </button>
      </header>
    </div>
  );
}
