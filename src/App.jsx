import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import { 
  MapPin, 
  Layers, 
  BedDouble, 
  Bath, 
  Coins, 
  Compass, 
  Sparkles, 
  Layout, 
  Eye, 
  Camera,
  Rotate3d,
  Check,
  Bot,
  User as UserIcon,
  Zap,
  FolderHeart,
  Trash2,
  Lock
} from 'lucide-react';

import FloorPlan2D from './components/FloorPlan2D';
import Building3D from './components/Building3D';
import ARSimulator from './components/ARSimulator';
import MaterialEstimator from './components/MaterialEstimator';
import VoiceCommander from './components/VoiceCommander';
import PaymentModal from './components/PaymentModal';
import AwaitingBlueprint3D from './components/AwaitingBlueprint3D';

import LandingPage from './pages/LandingPage';
import HowItWorksPage from './pages/HowItWorksPage';
import PricingPage from './pages/PricingPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import AuthPage from './pages/AuthPage';
import { LogoIcon } from './components/Logo';

// Helper to decode JWT payload locally on client
const decodeToken = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
};

// --- Dashboard Workspace Component ---
function Dashboard() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState('');
  const [isPro, setIsPro] = useState(false);
  const [isGuest, setIsGuest] = useState(false);
  const [showAuthLockModal, setShowAuthLockModal] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  
  // Shared Requirements State
  const [plotWidth, setPlotWidth] = useState(40);
  const [plotLength, setPlotLength] = useState(60);
  const [floors, setFloors] = useState(2);
  const [bedrooms, setBedrooms] = useState(3);
  const [bathrooms, setBathrooms] = useState(2);
  const [budget, setBudget] = useState(80); // in Lakhs
  const [style, setStyle] = useState('Modern Villa');

  // Active Layout Option Variation ('A', 'B', 'C')
  const [layoutOption, setLayoutOption] = useState('A');

  // designOptions state (null at startup)
  const [designOptions, setDesignOptions] = useState(null);
  const [activeLayoutData, setActiveLayoutData] = useState(null); // Dynamic Gemini blueprint coordinates
  const [isGenerating, setIsGenerating] = useState(false); // Tracks backend AI loading state
  
  // Collaborative recommendations & saved projects states
  const [recommendations, setRecommendations] = useState([]);
  const [savedProjects, setSavedProjects] = useState([]);

  // Viewport Control States
  const [activeTab, setActiveTab] = useState('3d'); // 2d, 3d, ar
  const [showRoof, setShowRoof] = useState(true);
  const [explodedView, setExplodedView] = useState(false);
  const [currentFloor, setCurrentFloor] = useState(-1); // -1 for All Floors, 0 for Ground, 1 for First, etc.

  // 1. Authentication Check & Data Initialization
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setUserName('Guest');
        setIsPro(false);
        setIsGuest(true);
        return;
      }
      
      const decoded = decodeToken(token);
      if (decoded) {
        setUserName(decoded.name || 'Builder');
        setIsPro(decoded.isPro || false);
        setIsGuest(false);
      } else {
        setUserName(localStorage.getItem('userName') || 'Builder');
        setIsPro(false);
        setIsGuest(false);
      }
      
      // Fetch recommendations & saved blueprints using existing token
      fetchRecommendations(token);
      fetchSavedProjects(token);
    };

    checkAuth();
  }, [navigate]);

  // 2. Fetch recommendations from sqlite
  const fetchRecommendations = async (explicitToken) => {
    const token = explicitToken || localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch('http://localhost:5000/api/recommendations', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setRecommendations(data);
      }
    } catch (err) {
      console.warn('Failed to load community recommendations:', err);
    }
  };

  // 3. Fetch user's saved projects from sqlite
  const fetchSavedProjects = async (explicitToken) => {
    const token = explicitToken || localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch('http://localhost:5000/api/projects', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setSavedProjects(data);
      }
    } catch (err) {
      console.warn('Failed to load personal saved projects:', err);
    }
  };

  // 4. Log search queries to DB
  const logSearchToDb = async (opt) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      await fetch('http://localhost:5000/api/searches', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          plotWidth: opt.width,
          plotLength: opt.length,
          bedrooms: opt.bedrooms,
          bathrooms: opt.bathrooms,
          style: opt.style,
          area: opt.area,
          layoutVariation: opt.layoutVariation
        })
      });
      fetchRecommendations();
    } catch (err) {
      console.warn('Search logger failed:', err);
    }
  };

  // 5. Save current layout as a project in SQLite DB
  const handleSaveCurrentProject = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      if (isGuest) {
        setShowAuthLockModal(true);
      }
      return;
    }

    const name = prompt("Enter a name for this layout draft:", `My ${style} Layout`);
    if (!name) return;

    try {
      const response = await fetch('http://localhost:5000/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name,
          plotWidth,
          plotLength,
          floors,
          bedrooms,
          bathrooms,
          style,
          budget,
          layoutOption
        })
      });

      if (response.ok) {
        alert('Blueprint saved successfully!');
        fetchSavedProjects();
      } else {
        const errData = await response.json();
        alert(`Failed to save: ${errData.error}`);
      }
    } catch (err) {
      console.error(err);
      alert('Network error saving blueprint.');
    }
  };

  // 6. Delete project from SQLite DB
  const handleDeleteProject = async (id, event) => {
    event.stopPropagation(); // Avoid loading the project when clicking delete
    const token = localStorage.getItem('token');
    if (!token) return;

    if (!confirm('Are you sure you want to delete this saved blueprint?')) return;

    try {
      const response = await fetch(`http://localhost:5000/api/projects/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        fetchSavedProjects();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Callback when AI Voice Commander executes a command
  const handleExecuteVoiceCommand = (action) => {
    switch (action.type) {
      case 'BEDROOMS_INC':
        setBedrooms(prev => Math.min(5, prev + 1));
        break;
      case 'BEDROOMS_DEC':
        setBedrooms(prev => Math.max(1, prev - 1));
        break;
      case 'FLOORS_INC':
        setFloors(prev => Math.min(3, prev + 1));
        break;
      case 'SHOW_FLOOR':
        if (action.value < floors) {
          setCurrentFloor(action.value);
        }
        break;
      case 'ROOF_TOGGLE':
        setShowRoof(action.value);
        break;
      case 'STYLE_CHANGE':
        setStyle(action.value);
        break;
      case 'EXPLODE_TOGGLE':
        setExplodedView(action.value);
        break;
      default:
        break;
    }
  };

  // Called when AI parsed command returns new layout choices
  const handleGenerateOptions = async (newOptions, rawQuery = '') => {
    setIsGenerating(true);
    try {
      if (rawQuery) {
        try {
          const primaryOpt = newOptions[0];
          const response = await fetch('http://localhost:5000/api/ai/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              prompt: rawQuery,
              width: primaryOpt.width,
              length: primaryOpt.length,
              bhk: primaryOpt.bedrooms,
              style: primaryOpt.style
            })
          });

          if (response.ok) {
            const data = await response.json();
            if (data.options && data.options.length === 3) {
              const geminiOptions = data.options.map((opt, idx) => {
                const layoutData = JSON.parse(JSON.stringify(opt.layoutData || {}));
                
                let minFloor = 99;
                layoutData.rooms?.forEach(r => {
                  const fNum = Number(r.floor);
                  if (!isNaN(fNum) && fNum < minFloor) minFloor = fNum;
                });
                layoutData.walls?.forEach(w => {
                  const fNum = Number(w.floor);
                  if (!isNaN(fNum) && fNum < minFloor) minFloor = fNum;
                });
                
                if (minFloor > 0 && minFloor !== 99) {
                  const shift = minFloor;
                  layoutData.rooms?.forEach(r => { r.floor = Number(r.floor) - shift; });
                  layoutData.walls?.forEach(w => { w.floor = Number(w.floor) - shift; });
                  layoutData.doors?.forEach(d => { d.floor = Number(d.floor) - shift; });
                  layoutData.windows?.forEach(w => { w.floor = Number(w.floor) - shift; });
                  layoutData.furniture?.forEach(f => { f.floor = Number(f.floor) - shift; });
                } else {
                  layoutData.rooms?.forEach(r => { r.floor = Number(r.floor); });
                  layoutData.walls?.forEach(w => { w.floor = Number(w.floor); });
                  layoutData.doors?.forEach(d => { d.floor = Number(d.floor); });
                  layoutData.windows?.forEach(w => { w.floor = Number(w.floor); });
                  layoutData.furniture?.forEach(f => { f.floor = Number(f.floor); });
                }

                return {
                  id: `gemini-opt-${idx}`,
                  title: opt.title,
                  tag: opt.tag,
                  description: opt.description,
                  width: opt.width,
                  length: opt.length,
                  bedrooms: opt.bedrooms,
                  bathrooms: opt.bathrooms,
                  style: opt.style,
                  layoutVariation: opt.layoutVariation,
                  layoutData: layoutData,
                  area: Math.round(opt.width * opt.length * 0.75)
                };
              });
              
              setDesignOptions(geminiOptions);
              applyOption(geminiOptions[0]);
              logSearchToDb(geminiOptions[0]);
              return;
            }
          }
        } catch (err) {
          console.error('Failed to generate Gemini layouts, falling back to procedural engine:', err);
        }
      }

      setDesignOptions(newOptions);
      if (newOptions && newOptions.length > 0) {
        applyOption(newOptions[0]);
        logSearchToDb(newOptions[0]);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  // Selects and applies a design option structure to states
  const applyOption = (opt) => {
    setPlotWidth(opt.width);
    setPlotLength(opt.length);
    setBedrooms(opt.bedrooms);
    setBathrooms(opt.bathrooms);
    setStyle(opt.style);
    setLayoutOption(opt.layoutVariation);
    setActiveLayoutData(opt.layoutData || null);
  };

  // Callback from AI suggestion click
  const handleApplySuggestion = (val) => {
    if (val.change === 'rotateHouse') {
      setActiveTab('ar');
    } else if (val.change === 'budgetIncrease') {
      setBudget(prev => Math.max(40, prev - 10));
    } else if (val.change === 'materialSave') {
      setStyle('Minimalist');
      setLayoutOption('B');
    }
  };

  // Reset guest session to default layout
  const handleResetSession = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    window.location.reload();
  };

  // Callback when payment is successfully upgraded
  const handlePaymentSuccess = () => {
    setIsPro(true);
    const token = localStorage.getItem('token');
    if (token) {
      const decoded = decodeToken(token);
      if (decoded) setIsPro(decoded.isPro || false);
    }
  };

  return (
    <div className="h-screen bg-zinc-950 text-zinc-100 flex flex-col selection:bg-zinc-500/30 selection:text-white overflow-hidden">
      {/* 1. Header Navigation */}
      <header className="border-b border-zinc-900 bg-zinc-950/70 backdrop-blur-md sticky top-0 z-50 px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-3">
        <div className="flex items-center gap-3">
          <div 
            onClick={() => navigate('/')}
            className="cursor-pointer hover:scale-105 transition duration-300 select-none"
          >
            <LogoIcon className="w-10 h-10" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-zinc-100 to-zinc-400 bg-clip-text text-transparent flex items-center gap-2 select-none">
              BuildVision AI
              {isPro ? (
                <span className="text-[10px] uppercase font-mono tracking-widest bg-gradient-to-r from-zinc-300 to-zinc-500 text-zinc-950 px-2 py-0.5 rounded-full font-bold shadow-[0_0_12px_rgba(255,255,255,0.05)]">
                  PRO MEMBER
                </span>
              ) : (
                <span className="text-[10px] uppercase font-mono tracking-widest bg-zinc-900 text-zinc-400 border border-zinc-800 px-2 py-0.5 rounded-full font-semibold animate-pulse">
                  AR Co-Pilot
                </span>
              )}
            </h1>
            <p className="text-[11px] text-gray-400 font-medium">Next-Generation Construction Planning & Material Analysis</p>
          </div>
        </div>

        {/* User Profile & Session Controls */}
        <div className="flex items-center gap-3">
          {/* Upgrade to Pro CTA */}
          {!isPro && (
            <button
              onClick={() => setPaymentModalOpen(true)}
              className="bg-gradient-to-r from-zinc-300 to-zinc-500 hover:from-zinc-200 hover:to-zinc-400 text-zinc-950 text-[13px] font-extrabold py-2.5 px-4.5 rounded-2xl shadow-lg shadow-black/25 cursor-pointer transition flex items-center gap-1.5 hover:scale-[1.03] transition-all duration-300 ease-out"
            >
              <Zap className="w-4 h-4 fill-zinc-950 text-zinc-950" />
              Upgrade to Pro
            </button>
          )}

          {designOptions && designOptions.length > 0 && (
            <div className="hidden lg:flex items-center gap-2.5 text-[11px] text-zinc-300 font-mono mr-2">
              <div className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 px-3.5 py-1.5 rounded-full shadow-[inset_0_1px_1px_rgba(255,255,255,0.02)]">
                <MapPin className="w-3.5 h-3.5 text-zinc-450" />
                <span>Plot: <span className="text-zinc-100 font-bold">{plotWidth}x{plotLength} ft</span></span>
              </div>
              <div className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 px-3.5 py-1.5 rounded-full shadow-[inset_0_1px_1px_rgba(255,255,255,0.02)]">
                <Compass className="w-3.5 h-3.5 text-zinc-450" />
                <span>Style: <span className="text-zinc-100 font-bold">{style}</span></span>
              </div>
            </div>
          )}

          {/* User Profile Pill */}
          <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-850 py-2.5 px-5 rounded-2xl text-[13px] font-extrabold text-zinc-350 shadow-[0_4px_12px_rgba(0,0,0,0.2)]">
            <UserIcon className="w-3.5 h-3.5 text-zinc-450" />
            <span>{userName}</span>
          </div>

          {!isGuest && (
            <button
              onClick={handleResetSession}
              className="bg-slate-900 hover:bg-rose-950/20 hover:text-rose-400 border border-white/5 hover:border-rose-500/20 py-2.5 px-4.5 rounded-2xl cursor-pointer transition text-zinc-400 hover:scale-[1.03] transition-all duration-300 ease-out text-[13px] font-black shadow-[0_4px_12px_rgba(0,0,0,0.15)]"
              title="Log Out Session"
            >
              Log Out
            </button>
          )}
        </div>
      </header>

      {/* 2. Main Dashboard Layout */}
      <main className="flex-grow grid grid-cols-1 lg:grid-cols-12 overflow-hidden h-[calc(100vh-80px)] bg-zinc-950">
        
        {/* Left Column - Voice Control & Design Selector Options (3 cols) */}
        <section className="lg:col-span-3 bg-black border-r border-white/15 flex flex-col justify-between h-full overflow-hidden p-5">
          
          {/* Scrollable middle list container */}
          <div className="flex-grow overflow-y-auto flex flex-col gap-6 pr-1 pb-4">
            
            {/* Dynamic Design Option List */}
            {designOptions && designOptions.length > 0 && (
              <div className="flex flex-col gap-4 relative">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-bold text-slate-200 uppercase tracking-widest font-mono flex items-center gap-2">
                    <Bot className="w-4 h-4 text-blue-400" />
                    AI Generated Layouts
                  </h3>
                  {/* Save Current Layout Button */}
                  <button
                    onClick={handleSaveCurrentProject}
                    className="text-[10px] font-bold text-blue-400 hover:text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/25 py-1 px-3 rounded-lg cursor-pointer transition"
                  >
                    Save Blueprint
                  </button>
                </div>
                <p className="text-[11px] text-gray-400 font-medium">
                  Compare and select between the 3 layout design drafts generated by the blueprint engine:
                </p>

                <hr className="border-white/5" />

                <div className="flex flex-col gap-3">
                  {designOptions.map((opt) => {
                    const isSelected = layoutOption === opt.layoutVariation;
                    return (
                      <button
                        key={opt.id}
                        onClick={() => {
                          applyOption(opt);
                          logSearchToDb(opt);
                        }}
                        className={`text-left p-3.5 rounded-xl border flex flex-col gap-1.5 transition-all duration-300 relative overflow-hidden cursor-pointer ${
                          isSelected 
                            ? 'bg-blue-950/20 border-blue-500/60 shadow-[0_0_15px_rgba(37,99,235,0.15)] selected-design-card' 
                            : 'bg-slate-900/60 border-white/5 hover:border-white/10 hover:bg-slate-800/60'
                        }`}
                      >
                        {/* Active indicator */}
                        {isSelected && (
                          <div className="absolute top-2 right-2 bg-blue-600 text-white p-0.5 rounded-full shadow border border-blue-400/40">
                            <Check className="w-3 h-3" />
                          </div>
                        )}

                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-slate-200">{opt.title}</span>
                          <span className="text-[9px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/10 py-0.5 px-1.5 rounded-full">
                            {opt.tag}
                          </span>
                        </div>

                        <p className="text-[10px] text-gray-400 leading-relaxed font-medium">
                          {opt.description}
                        </p>

                        <div className="border-t border-white/5 pt-1.5 mt-0.5 flex justify-between text-[9px] font-mono text-gray-500">
                          <span>Plot: {opt.width}x{opt.length}ft</span>
                          <span>Bedrooms: {opt.bedrooms} BHK</span>
                          <span>Area: {opt.area} sqft</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Personal Saved Projects Grid (Loaded from database) */}
            {savedProjects && savedProjects.length > 0 && (
              <div className="flex flex-col gap-4 max-h-[300px] overflow-y-auto">
                <h3 className="text-sm font-bold text-slate-200 uppercase tracking-widest font-mono flex items-center gap-2">
                  <FolderHeart className="w-4 h-4 text-blue-400" />
                  My Saved Blueprints
                </h3>
                <div className="flex flex-col gap-2.5">
                  {savedProjects.map((proj) => (
                    <div
                      key={proj.id}
                      onClick={() => {
                        setPlotWidth(proj.plotWidth);
                        setPlotLength(proj.plotLength);
                        setFloors(proj.floors);
                        setBedrooms(proj.bedrooms);
                        setBathrooms(proj.bathrooms);
                        setStyle(proj.style);
                        setBudget(proj.budget);
                        setLayoutOption(proj.layoutOption);
                        
                        if (!designOptions) {
                          setDesignOptions([{
                            id: `proj-opt-${proj.id}`,
                            title: proj.name,
                            tag: 'Saved',
                            area: proj.plotWidth * proj.plotLength * 0.75,
                            width: proj.plotWidth,
                            length: proj.plotLength,
                            bedrooms: proj.bedrooms,
                            bathrooms: proj.bathrooms,
                            style: proj.style,
                            layoutVariation: proj.layoutOption,
                            description: `Reloaded saved configuration: "${proj.name}"`,
                            specs: `Plot: ${proj.plotWidth}x${proj.plotLength}ft`
                          }]);
                        }
                      }}
                      className="p-3 rounded-xl bg-slate-900/40 border border-white/5 hover:border-blue-500/20 hover:bg-slate-800/40 transition cursor-pointer flex justify-between items-center group/item"
                    >
                      <div className="flex flex-col gap-0.5">
                        <span className="font-semibold text-xs text-slate-200">{proj.name}</span>
                        <span className="text-[9px] font-mono text-gray-500">
                          {proj.plotWidth}x{proj.plotLength}ft • {proj.bedrooms} BHK • {proj.style}
                        </span>
                      </div>
                      <button
                        onClick={(e) => handleDeleteProject(proj.id, e)}
                        className="opacity-0 group-hover/item:opacity-100 p-1.5 hover:bg-rose-950/30 rounded text-gray-500 hover:text-rose-400 cursor-pointer transition shrink-0"
                        title="Delete Saved Blueprint"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Collaborative Recommendations Widget */}
            {recommendations && recommendations.length > 0 && (
              <div className="flex flex-col gap-4">
                <h3 className="text-sm font-bold text-slate-200 uppercase tracking-widest font-mono flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  Community Trending Designs
                </h3>
                <p className="text-[11px] text-gray-400 font-medium">
                  Popular layouts based on global user search logs. Click to load instantly:
                </p>

                <hr className="border-white/5" />

                <div className="flex flex-col gap-2.5">
                  {recommendations.map((rec) => (
                    <button
                      key={rec.id}
                      onClick={() => {
                        setPlotWidth(rec.width);
                        setPlotLength(rec.length);
                        setBedrooms(rec.bedrooms);
                        setBathrooms(rec.bathrooms);
                        setStyle(rec.style);
                        setLayoutOption(rec.layoutVariation);
                        
                        if (!designOptions) {
                          setDesignOptions(recommendations);
                        }
                      }}
                      className="text-left p-3 rounded-xl bg-slate-900/40 border border-white/5 hover:border-emerald-500/20 hover:bg-slate-800/40 transition cursor-pointer flex flex-col gap-1"
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-xs text-slate-200">{rec.title}</span>
                        <span className="text-[8px] font-mono text-emerald-400 bg-emerald-500/10 py-0.5 px-2 rounded-full font-bold">
                          {rec.tag}
                        </span>
                      </div>
                      <p className="text-[10px] text-gray-400 leading-normal line-clamp-1">{rec.description}</p>
                      <div className="flex gap-3 text-[9px] font-mono text-gray-500 mt-0.5">
                        <span>Grid: {rec.width}x{rec.length}ft</span>
                        <span>Config: {rec.bedrooms} BHK ({rec.style})</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* Bottom Fixed AI Co-Pilot Input Area */}
          <div className="shrink-0 pt-4 border-t border-zinc-850 mt-auto">
            <VoiceCommander 
              onExecuteCommand={handleExecuteVoiceCommand} 
              onGenerateOptions={handleGenerateOptions}
              isGenerating={isGenerating}
            />
          </div>

        </section>

        {/* Right Column - Tabs Viewports & Estimations (9 cols) */}
        <section className="lg:col-span-9 bg-zinc-950 flex flex-col gap-6 overflow-y-auto h-full p-6">
          
          {/* Main Visualizer Panel Container */}
          <div className="flex flex-col gap-4">
            {/* Viewport Header Controls & Tab Switcher (Only shown after generation) */}
            {designOptions && designOptions.length > 0 && (
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-white/5 pb-4">
                
                {/* Tab Selector Buttons */}
                <div className="flex bg-zinc-950 p-1 rounded-xl border border-zinc-900 text-xs font-semibold">
                  <button
                    onClick={() => setActiveTab('2d')}
                    className={`py-2 px-3.5 rounded-lg flex items-center gap-1.5 transition cursor-pointer ${
                      activeTab === '2d'
                        ? 'bg-zinc-900 border border-zinc-800 text-zinc-100 shadow-md'
                        : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    <Layout className="w-4 h-4" />
                    2D Floor Plan
                  </button>
                  <button
                    onClick={() => setActiveTab('3d')}
                    className={`py-2 px-3.5 rounded-lg flex items-center gap-1.5 transition cursor-pointer ${
                      activeTab === '3d'
                        ? 'bg-zinc-900 border border-zinc-800 text-zinc-100 shadow-md'
                        : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    <Rotate3d className="w-4 h-4" />
                    3D Building
                  </button>
                  <button
                    onClick={() => {
                      if (isGuest) {
                        setShowAuthLockModal(true);
                      } else {
                        setActiveTab('ar');
                      }
                    }}
                    className={`py-2 px-3.5 rounded-lg flex items-center gap-1.5 transition cursor-pointer ${
                      activeTab === 'ar'
                        ? 'bg-zinc-900 border border-zinc-800 text-zinc-100 shadow-md'
                        : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    <Camera className="w-4 h-4 animate-pulse" />
                    <span>AR Plot Scanner</span>
                    {isGuest && <Lock className="w-3.5 h-3.5 text-zinc-500 ml-0.5" />}
                  </button>
                </div>

                {/* Viewport Auxiliary Action Controls (only shown on 3D tab) */}
                {activeTab === '3d' && (
                  <div className="flex flex-wrap gap-2 text-xs">
                    {/* Floor Level Selector */}
                    {floors > 1 && (
                      <div className="flex items-center gap-1 bg-slate-950 border border-white/5 rounded-lg p-0.5 font-mono">
                        <button
                          onClick={() => setCurrentFloor(-1)}
                          className={`px-2 py-1 rounded text-[10px] font-bold cursor-pointer transition ${
                            currentFloor === -1 
                              ? 'bg-blue-600 text-white shadow' 
                              : 'text-gray-400 hover:text-slate-200'
                          }`}
                        >
                          All Floors
                        </button>
                        {Array.from({ length: floors }).map((_, idx) => {
                          let label = 'Ground';
                          if (idx === 1) label = '1st Floor';
                          if (idx === 2) label = '2nd Floor';
                          if (idx > 2) label = `${idx}th Floor`;
                          
                          return (
                            <button
                              key={idx}
                              onClick={() => setCurrentFloor(idx)}
                              className={`px-2 py-1 rounded text-[10px] font-bold cursor-pointer transition ${
                                currentFloor === idx 
                                  ? 'bg-blue-600 text-white' 
                                  : 'text-gray-400 hover:text-slate-200'
                              }`}
                            >
                              {label}
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {/* Toggle Roof */}
                    <button
                      onClick={() => setShowRoof(prev => !prev)}
                      className={`py-1.5 px-3 rounded-lg border font-semibold flex items-center gap-1 cursor-pointer transition ${
                        showRoof 
                          ? 'bg-slate-900 border-white/10 text-slate-200'
                          : 'bg-blue-950/20 border-blue-500/20 text-blue-400'
                      }`}
                    >
                      <Eye className="w-3.5 h-3.5" />
                      {showRoof ? 'Remove Roof' : 'Show Roof'}
                    </button>

                    {/* Toggle Exploded View */}
                    {floors > 1 && (
                      <button
                        onClick={() => setExplodedView(prev => !prev)}
                        className={`py-1.5 px-3 rounded-lg border font-semibold flex items-center gap-1 cursor-pointer transition ${
                          explodedView 
                            ? 'bg-blue-600 border-blue-500 text-white shadow-md shadow-blue-500/10'
                            : 'bg-slate-900 border-white/10 text-slate-300'
                        }`}
                      >
                        <Layers className="w-3.5 h-3.5" />
                        {explodedView ? 'Collapse View' : 'Explode View'}
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Viewport rendering area */}
            <div className="w-full relative min-h-[420px] bg-zinc-950 rounded-2xl overflow-hidden flex flex-col items-center justify-center border border-zinc-900/50">
              {/* Glassmorphic Loading Overlay */}
              {isGenerating && (
                <div className="absolute inset-0 bg-zinc-950/80 backdrop-blur-md z-40 flex flex-col items-center justify-center gap-4 animate-fadeIn">
                  <div className="relative flex items-center justify-center w-16 h-16">
                    <div className="absolute inset-0 border-4 border-indigo-550/20 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                    <Sparkles className="w-6 h-6 text-indigo-400 animate-pulse" />
                  </div>
                  <div className="flex flex-col items-center gap-1 text-center">
                    <h3 className="text-sm font-black text-slate-100 font-sans tracking-tight">Architect AI Co-Pilot</h3>
                    <p className="text-[11px] text-zinc-400 font-medium">Drafting 3 dynamic layout variants to your specifications...</p>
                  </div>
                </div>
              )}

              {!designOptions ? (
                <div className="flex flex-col items-center justify-center text-center w-full h-full p-6 z-10">
                  {/* Floating 3D House Preview */}
                  <div className="w-full max-w-md h-[280px]">
                    <AwaitingBlueprint3D />
                  </div>
                </div>
              ) : (
                <>
                  {activeTab === '2d' && (
                    <FloorPlan2D
                      plotWidth={plotWidth}
                      plotLength={plotLength}
                      floors={floors}
                      bedrooms={bedrooms}
                      bathrooms={bathrooms}
                      currentFloor={currentFloor}
                      style={style}
                      layoutOption={layoutOption}
                      layoutData={activeLayoutData}
                    />
                  )}

                  {activeTab === '3d' && (
                    <Building3D
                      plotWidth={plotWidth}
                      plotLength={plotLength}
                      floors={floors}
                      bedrooms={bedrooms}
                      bathrooms={bathrooms}
                      style={style}
                      showRoof={showRoof}
                      explodedView={explodedView}
                      currentFloor={currentFloor}
                      layoutOption={layoutOption}
                      isPro={isPro}
                      onUpgradeRequired={() => setPaymentModalOpen(true)}
                      layoutData={activeLayoutData}
                    />
                  )}

                  {activeTab === 'ar' && (
                    <ARSimulator
                      plotWidth={plotWidth}
                      plotLength={plotLength}
                      floors={floors}
                      style={style}
                      isPro={isPro}
                      onUpgradeRequired={() => setPaymentModalOpen(true)}
                    />
                  )}
                </>
              )}
            </div>
          </div>

          {/* Cost Estimation and AI Suggestions (Only shown after generation) */}
          {designOptions && designOptions.length > 0 && (
            <MaterialEstimator
              plotWidth={plotWidth}
              plotLength={plotLength}
              floors={floors}
              style={style}
              budgetLakhs={budget}
              isPro={isPro}
              onUpgradeRequired={() => setPaymentModalOpen(true)}
              onApplySuggestion={handleApplySuggestion}
            />
          )}

        </section>

      </main>

      {/* Authentication Required Lock Modal */}
      {showAuthLockModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel p-6 rounded-2xl max-w-sm w-full text-center flex flex-col gap-4 shadow-2xl border-white/5 bg-zinc-950">
            <div className="mx-auto w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400">
              <Lock className="w-6 h-6" />
            </div>
            <div className="flex flex-col gap-1">
              <h3 className="font-bold text-sm text-slate-100 font-sans">Unlock AR Plot Scanner</h3>
              <p className="text-xs text-zinc-450 leading-relaxed font-light">
                AR plot scanning, spatial simulation, and persistent saving features require a registered profile. Join BuildVision AI for free to unlock.
              </p>
            </div>
            <div className="flex gap-3 mt-1 text-xs">
              <button
                onClick={() => setShowAuthLockModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-850 cursor-pointer text-zinc-300 font-bold transition duration-300"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setShowAuthLockModal(false);
                  navigate('/login');
                }}
                className="flex-1 py-2.5 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 font-black cursor-pointer transition shadow duration-300"
              >
                Sign Up / Login
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stripe Payment Checkout Modal */}
      <PaymentModal
        isOpen={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        onPaymentSuccess={handlePaymentSuccess}
      />

      {/* 3. Footer */}
      <footer className="border-t border-white/5 bg-gray-950 mt-auto py-5 text-center text-[10px] text-gray-500 font-mono">
        <p>BuildVision AI System • Developed with Three.js & Tailwind CSS v4 • Copyright © 2026</p>
      </footer>
    </div>
  );
}

// --- Main App Entry Point Router Configuration ---
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/how-it-works" element={<HowItWorksPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/login" element={<AuthPage />} />
        <Route path="/register" element={<AuthPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
