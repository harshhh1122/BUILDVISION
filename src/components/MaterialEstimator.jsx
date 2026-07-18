import React, { useState } from 'react';
import { DollarSign, Landmark, TrendingDown, Sun, HelpCircle, CheckCircle, AlertTriangle, FileText, Lock, Globe } from 'lucide-react';

export default function MaterialEstimator({
  plotWidth = 40,
  plotLength = 60,
  floors = 2,
  style = 'Modern Villa',
  budgetLakhs = 80,
  isPro = false,
  onUpgradeRequired = null,
  onApplySuggestion = null
}) {
  // Region Selection for Localized construction costs
  const [region, setRegion] = useState('custom'); // mumbai, bangalore, delhi, custom

  // Regional multipliers
  const regionMultipliers = {
    mumbai: 1.25,      // Higher labour, material transport & land overheads
    bangalore: 1.10,   // Standard IT hub rates
    delhi: 1.15,       // Capital region moderate margins
    custom: 1.00       // Base structural engineering approximation rates
  };

  const mult = regionMultipliers[region] || 1.00;

  // 1. Calculate build area
  const plotArea = plotWidth * plotLength;
  const buildFactor = 0.75;
  const groundFloorArea = plotArea * buildFactor;
  const totalBuiltArea = groundFloorArea * floors;

  // Estimate material quantities and costs (scaled to INR Lakhs, multiplied by region multiplier)
  const cementBags = Math.round(totalBuiltArea * 0.4);
  const cementCostLakhs = ((cementBags * 450) / 100000) * mult;

  const steelKg = Math.round(totalBuiltArea * 4);
  const steelCostLakhs = ((steelKg * 75) / 100000) * mult;

  const bricksCount = Math.round(totalBuiltArea * 22);
  const bricksCostLakhs = ((bricksCount * 9) / 100000) * mult;

  const sandCft = Math.round(totalBuiltArea * 1.8);
  const sandCostLakhs = ((sandCft * 65) / 100000) * mult;

  const electricalCostLakhs = ((totalBuiltArea * 100) / 100000) * mult;
  const plumbingCostLakhs = ((totalBuiltArea * 120) / 100000) * mult;

  let finishingRate = 400;
  if (style.toLowerCase().includes('minimalist')) finishingRate = 350;
  if (style.toLowerCase().includes('traditional')) finishingRate = 450;
  if (style.toLowerCase().includes('industrial')) finishingRate = 500;
  const finishesCostLakhs = ((totalBuiltArea * finishingRate) / 100000) * mult;

  const laborCostLakhs = ((totalBuiltArea * 350) / 100000) * mult;

  // Total Construction Cost
  const totalCostLakhs = 
    cementCostLakhs + 
    steelCostLakhs + 
    bricksCostLakhs + 
    sandCostLakhs + 
    electricalCostLakhs + 
    plumbingCostLakhs + 
    finishesCostLakhs + 
    laborCostLakhs;

  const finalCost = parseFloat(totalCostLakhs.toFixed(2));
  const budgetDifference = budgetLakhs - finalCost;
  const isOverBudget = budgetDifference < 0;

  // Dynamic AI Suggestions list
  const suggestions = [
    {
      id: 'reduce-corridor',
      type: 'cost',
      text: 'Optimize space: Reducing corridor width saves approx. ₹1,50,000.',
      actionLabel: 'Apply Saving',
      actionValue: { change: 'budgetIncrease', amount: 1.5 }
    },
    {
      id: 'sunlight-efficiency',
      type: 'energy',
      text: 'Solar gain: Align living room facing North-East to improve ventilation.',
      actionLabel: 'Rotate North-East',
      actionValue: { change: 'rotateHouse', amount: 45 }
    }
  ];

  const handlePrintPDF = () => {
    if (!isPro) {
      if (onUpgradeRequired) onUpgradeRequired();
      return;
    }
    // Premium feature: prints layout detail
    window.print();
  };

  return (
    <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-5 print:block">
      
      {/* Cost BoQ column */}
      <div className="flex flex-col gap-4">
        
        {/* Region Selector */}
        <div className="bg-zinc-900/60 p-4 rounded-2xl flex justify-between items-center gap-3 shadow-[0_4px_12px_rgba(0,0,0,0.1)] border-none">
          <span className="text-xs uppercase font-mono tracking-wider text-indigo-400 font-bold flex items-center gap-1.5 select-none">
            <Globe className="w-4 h-4" /> Localized Price Index
          </span>
          <select
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            className="bg-slate-950 border border-white/5 outline-none rounded-lg py-1 px-3 text-xs text-white font-mono cursor-pointer transition focus:border-indigo-500/30"
          >
            <option value="custom">Standard Index (1.0x)</option>
            <option value="mumbai">Mumbai Region (1.25x)</option>
            <option value="bangalore">Bangalore Region (1.10x)</option>
            <option value="delhi">Delhi NCR Region (1.15x)</option>
          </select>
        </div>

        {/* Budget Status Card */}
        <div className={`p-4 rounded-xl border flex justify-between items-center ${
          isOverBudget 
            ? 'bg-rose-950/20 border-rose-500/20 text-rose-300' 
            : 'bg-emerald-950/20 border-emerald-500/20 text-emerald-300'
        }`}>
          <div className="flex gap-2.5 items-center">
            {isOverBudget ? (
              <AlertTriangle className="w-5 h-5 text-rose-400 animate-pulse shrink-0" />
            ) : (
              <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
            )}
            <div>
              <h4 className="text-[10px] uppercase font-mono tracking-wider text-gray-500">Budget status</h4>
              <p className="text-xs font-bold">
                {isOverBudget ? `Over Budget by ₹${Math.abs(budgetDifference).toFixed(1)} L` : 'Within Budget Limit'}
              </p>
            </div>
          </div>
          <div className="flex gap-3 font-mono text-xs text-right">
            <div className="flex flex-col">
              <span className="text-gray-500 text-[9px]">CAP</span>
              <span className="text-white font-bold">₹{budgetLakhs}L</span>
            </div>
            <div className="flex flex-col">
              <span className="text-gray-500 text-[9px]">ESTIMATE</span>
              <span className={`font-bold ${isOverBudget ? 'text-rose-400' : 'text-emerald-400'}`}>₹{finalCost}L</span>
            </div>
          </div>
        </div>

        {/* Material Bill of Quantities (BoQ) */}
        <div className="bg-zinc-900/65 p-5 rounded-2xl flex flex-col gap-3 relative overflow-hidden print:border-none shadow-[0_4px_12px_rgba(0,0,0,0.1)] border-none">
          <div className="flex justify-between items-center">
            <h4 className="text-xs uppercase font-mono tracking-wider text-indigo-400 font-bold">
              Structural Estimation (BoQ)
            </h4>
            
            {/* Export PDF Button */}
            <button
              onClick={handlePrintPDF}
              className="flex items-center gap-1 py-1 px-2.5 bg-slate-900 border border-white/5 hover:border-indigo-500/30 text-slate-300 hover:text-indigo-400 rounded text-[10px] font-mono cursor-pointer transition select-none"
            >
              {!isPro && <Lock className="w-2.5 h-2.5 text-gray-500 mr-0.5" />}
              <FileText className="w-3 h-3" />
              Export PDF
            </button>
          </div>
          
          <div className="flex flex-col gap-2 text-xs text-slate-300 font-mono">
            <div className="flex justify-between py-1 border-b border-white/5">
              <span>Cement (~0.4 bags/sqft)</span>
              <span className="text-white">₹{cementCostLakhs.toFixed(2)} L</span>
            </div>
            <div className="flex justify-between py-1 border-b border-white/5">
              <span>Steel (~4 kg/sqft)</span>
              <span className="text-white">₹{steelCostLakhs.toFixed(2)} L</span>
            </div>
            <div className="flex justify-between py-1 border-b border-white/5">
              <span>Bricks & Blocks</span>
              <span className="text-white">₹{bricksCostLakhs.toFixed(2)} L</span>
            </div>
            <div className="flex justify-between py-1 border-b border-white/5">
              <span>Wiring & Plumbing</span>
              <span className="text-white">₹{(electricalCostLakhs + plumbingCostLakhs).toFixed(2)} L</span>
            </div>
            <div className="flex justify-between py-1">
              <span>Labor & Finishing</span>
              <span className="text-white">₹{(finishesCostLakhs + laborCostLakhs).toFixed(2)} L</span>
            </div>
          </div>

          <div className="flex justify-between items-center mt-2 pt-2 border-t border-indigo-500/20 text-indigo-300 font-bold">
            <span className="text-xs">Total Estimate:</span>
            <span className="font-mono text-base text-indigo-400">₹{finalCost} Lakhs</span>
          </div>
        </div>
      </div>

      {/* AI Suggestions Column */}
      <div className="bg-zinc-900/65 p-5 rounded-2xl flex flex-col gap-3 shadow-[0_4px_12px_rgba(0,0,0,0.1)] border-none">
        <h4 className="text-xs uppercase font-mono tracking-wider text-indigo-400 font-bold">
          Design Optimization
        </h4>
        <div className="flex flex-col gap-3">
          {suggestions.map((sug) => (
            <div key={sug.id} className="flex gap-2.5 items-start p-2.5 rounded-lg bg-slate-900/60 border border-white/5">
              <div className="flex-grow flex flex-col gap-1.5">
                <p className="text-[11px] text-gray-300 leading-normal">{sug.text}</p>
                {onApplySuggestion && (
                  <button
                    onClick={() => onApplySuggestion(sug.actionValue)}
                    className="self-start text-[9px] font-bold text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 py-0.5 px-2 rounded cursor-pointer transition"
                  >
                    {sug.actionLabel}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
