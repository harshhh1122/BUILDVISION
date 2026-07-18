import React, { useState } from 'react';
import { Sparkles, Send, CheckCircle2 } from 'lucide-react';
import Header from '../components/Header';

export default function ContactPage() {
  const [email, setEmail] = useState('');
  const [msgName, setMsgName] = useState('');
  const [msgText, setMsgText] = useState('');
  const [contactSuccess, setContactSuccess] = useState(false);

  const handleContactSubmit = (e) => {
    e.preventDefault();
    setContactSuccess(true);
    setTimeout(() => {
      setContactSuccess(false);
      setEmail('');
      setMsgName('');
      setMsgText('');
    }, 2000);
  };

  return (
    <div className="h-screen bg-zinc-950 text-zinc-100 flex flex-col relative overflow-hidden font-sans select-none">
      {/* Background neutral grey glows */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-zinc-800/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-zinc-900/10 rounded-full blur-3xl pointer-events-none" />

      <Header active="contact" />

      {/* Main Content */}
      <main className="max-w-md w-full mx-auto px-6 py-4 flex-grow flex flex-col justify-center gap-4 overflow-hidden h-[calc(100vh-140px)] relative z-10">
        
        <div className="text-center flex flex-col items-center gap-2">
          <h2 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-white to-zinc-300 bg-clip-text text-transparent">
            Get in Touch
          </h2>
          <p className="text-[10px] text-zinc-500 max-w-xs leading-relaxed">
            Inquire about team licensing, Meta Smart Glasses CAD integrations, or project configurations.
          </p>
        </div>

        {/* Form Sheet Card */}
        <div className="glass-panel p-5 rounded-xl shadow-2xl relative border-zinc-800 flex flex-col gap-3">
          {contactSuccess ? (
            <div className="flex flex-col items-center justify-center text-center py-8 gap-2">
              <CheckCircle2 className="w-12 h-12 text-zinc-400 animate-bounce" />
              <h3 className="text-sm font-bold text-slate-100">Message Transmitted!</h3>
              <p className="text-[10px] text-zinc-400">Our engineering support team will respond within 24 hours.</p>
            </div>
          ) : (
            <form onSubmit={handleContactSubmit} className="flex flex-col gap-3 text-xs">
              <div className="flex flex-col gap-1">
                <label className="font-bold text-zinc-400 uppercase tracking-wider text-[9px]">Your Name</label>
                <input
                  type="text"
                  required
                  placeholder="John Doe"
                  value={msgName}
                  onChange={(e) => setMsgName(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 focus:border-zinc-500/50 outline-none rounded-lg px-3 py-2 text-white font-mono transition"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-bold text-zinc-400 uppercase tracking-wider text-[9px]">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="john@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 focus:border-zinc-500/50 outline-none rounded-lg px-3 py-2 text-white font-mono transition"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-bold text-zinc-400 uppercase tracking-wider text-[9px]">Message Inquiry</label>
                <textarea
                  required
                  rows="3"
                  placeholder="How can we help your building project?"
                  value={msgText}
                  onChange={(e) => setMsgText(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 focus:border-zinc-500/50 outline-none rounded-lg px-3 py-2 text-white font-mono transition resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-zinc-100 hover:bg-white text-zinc-950 font-bold py-2 rounded-lg mt-1.5 cursor-pointer shadow-lg shadow-black/20 transition flex items-center justify-center gap-1.5 font-sans"
              >
                <Send className="w-3.5 h-3.5" />
                Transmit Secure Inquiry
              </button>
            </form>
          )}
        </div>

      </main>

      <footer className="border-t border-zinc-900 bg-zinc-950 py-4 text-center text-[10px] text-zinc-500 font-mono">
        <p>BuildVision AI System • Developed with Three.js & Tailwind CSS v4 • Copyright © 2026</p>
      </footer>
    </div>
  );
}
