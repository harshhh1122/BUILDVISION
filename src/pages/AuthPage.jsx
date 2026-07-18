import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { KeyRound, Mail, User, AlertCircle } from 'lucide-react';
import { LogoIcon } from '../components/Logo';

export default function AuthPage() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const url = isLogin 
      ? 'http://localhost:5000/api/auth/login'
      : 'http://localhost:5000/api/auth/register';

    const payload = isLogin 
      ? { email, password }
      : { email, password, name };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      // Store auth details
      localStorage.setItem('token', data.token);
      localStorage.setItem('userName', data.name);
      localStorage.setItem('userEmail', data.email);

      // Redirect to main workspace
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen bg-zinc-950 text-zinc-100 flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans select-none">
      
      {/* Glows */}
      <div className="absolute top-1/4 left-1/4 w-[350px] h-[350px] bg-zinc-800/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-zinc-900/10 rounded-full blur-3xl pointer-events-none" />

      {/* Auth Card */}
      <div className="w-full max-w-sm glass-panel p-6 rounded-2xl shadow-2xl relative z-10 flex flex-col gap-6 border-zinc-850">
        
        {/* Header Logo */}
        <div className="flex flex-col items-center gap-2">
          <div 
            onClick={() => navigate('/')}
            className="cursor-pointer hover:scale-105 transition duration-300 select-none mb-1"
          >
            <LogoIcon className="w-12 h-12 text-zinc-300" />
          </div>
          <h2 className="text-lg font-extrabold tracking-tight bg-gradient-to-r from-white via-zinc-100 to-zinc-400 bg-clip-text text-transparent">
            BuildVision AI
          </h2>
          <span className="text-[10px] uppercase font-mono tracking-widest text-zinc-400 font-semibold bg-zinc-800/40 px-2 py-0.5 rounded border border-zinc-700/30">
            Secure Portal
          </span>
        </div>

        {/* Login / Register Toggle Tabs */}
        <div className="grid grid-cols-2 bg-zinc-950 p-1 rounded-xl border border-zinc-800 text-xs font-semibold">
          <button
            onClick={() => { setIsLogin(true); setError(''); }}
            className={`py-1.5 rounded-lg transition cursor-pointer ${
              isLogin ? 'bg-zinc-900 border border-zinc-800 text-zinc-100 font-bold' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            Log In
          </button>
          <button
            onClick={() => { setIsLogin(false); setError(''); }}
            className={`py-1.5 rounded-lg transition cursor-pointer ${
              !isLogin ? 'bg-zinc-900 border border-zinc-800 text-zinc-100 font-bold' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            Register
          </button>
        </div>

        {/* Error box */}
        {error && (
          <div className="flex items-start gap-2 bg-rose-950/20 border border-rose-500/25 p-3 rounded-lg text-rose-300 text-[11px] font-mono leading-relaxed">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Form fields */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-xs">
          
          {!isLogin && (
            <div className="flex flex-col gap-1.5">
              <label className="font-bold text-zinc-400 uppercase tracking-wider">Full Name</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500">
                  <User className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  required
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 focus:border-zinc-500/50 outline-none rounded-xl pl-9 pr-3.5 py-2.5 text-white placeholder-zinc-600 font-mono transition"
                />
              </div>
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="font-bold text-zinc-400 uppercase tracking-wider">Email Address</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500">
                <Mail className="w-4 h-4" />
              </span>
              <input
                type="email"
                required
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 focus:border-zinc-500/50 outline-none rounded-xl pl-9 pr-3.5 py-2.5 text-white placeholder-zinc-600 font-mono transition"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-bold text-zinc-400 uppercase tracking-wider">Password</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500">
                <KeyRound className="w-4 h-4" />
              </span>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 focus:border-zinc-500/50 outline-none rounded-xl pl-9 pr-3.5 py-2.5 text-white placeholder-zinc-600 font-mono transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-zinc-100 hover:bg-white text-zinc-950 font-bold py-2.5 rounded-xl mt-2 cursor-pointer shadow-lg shadow-black/25 transition flex items-center justify-center disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : isLogin ? 'Access Account' : 'Create Credentials'}
          </button>
        </form>

        <p className="text-[10px] text-zinc-500 text-center font-mono select-none">
          Clicking submit establishes encrypted JWT sessions linked to local SQLite stores.
        </p>

      </div>
    </div>
  );
}
