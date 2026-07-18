import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Send, AlertCircle, Bot, Sparkles } from 'lucide-react';

export default function VoiceCommander({
  onExecuteCommand, // Callback which takes { type, value }
  onGenerateOptions, // Callback which takes array of 3 options
  isGenerating = false
}) {
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [recognitionError, setRecognitionError] = useState(null);
  const [aiResponse, setAiResponse] = useState('');
  const [transcript, setTranscript] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  
  const recognitionRef = useRef(null);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'en-US';

      rec.onstart = () => {
        setIsListening(true);
        setRecognitionError(null);
        setTranscript('');
      };

      rec.onerror = (event) => {
        console.error("Speech Recognition Error:", event.error);
        setRecognitionError(event.error === 'not-allowed' ? 'Microphone permission blocked.' : 'Failed to hear clearly.');
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      rec.onresult = (event) => {
        const text = event.results[0][0].transcript;
        setTranscript(text);
        setInputText(text);
        processCommandText(text);
      };

      recognitionRef.current = rec;
    } else {
      setRecognitionError('Speech recognition is not supported in this browser.');
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Logic to parse natural language commands
  const processCommandText = (text) => {
    const clean = text.toLowerCase().trim();
    setTranscript(text);

    let parsedAction = null;
    let reply = "";

    const isBlueprintGenerationQuery = 
      clean.includes('bhk') || 
      clean.includes('sq ft') || 
      clean.includes('sqft') || 
      clean.includes('area') || 
      clean.includes('depth') || 
      clean.includes('width') || 
      clean.includes('lenghth') || 
      clean.includes('length') ||
      ((clean.includes('l') || clean.includes('d') || clean.includes('w')) && /\d+/.test(clean));

    if (isBlueprintGenerationQuery) {
      let parsedArea = 1200;
      const areaMatch = clean.match(/(\d+)\s*(?:sq\s*ft|sqft|square\s*feet|area)/);
      if (areaMatch) {
        parsedArea = parseInt(areaMatch[1]);
      } else {
        const areaOfMatch = clean.match(/(?:area\s*of|area\s*is|area\s*og)\s*(\d+)/);
        if (areaOfMatch) {
          parsedArea = parseInt(areaOfMatch[1]);
        }
      }

      let parsedWidth = 30;
      const depthMatch = clean.match(/(?:depth|width|depth\s*is|width\s*is)\s*(?:is\s*|of\s*|og\s*)?(\d+)/);
      if (depthMatch) {
        let val = parseInt(depthMatch[1]);
        parsedWidth = val > 150 ? Math.round(val / 10) : val;
      }

      let parsedLength = 40;
      const lengthMatch = clean.match(/(?:length|height|lenghth|length\s*is|lenghth\s*is)\s*(?:is\s*|of\s*|og\s*)?(\d+)/);
      if (lengthMatch) {
        let val = parseInt(lengthMatch[1]);
        parsedLength = val > 200 ? Math.round(val / 10) : val;
      }

      let parsedBhk = 2;
      const bhkMatch = clean.match(/(\d+)\s*(?:bhk|bedroom|bedrooms|room|rooms)/);
      if (bhkMatch) {
        parsedBhk = parseInt(bhkMatch[1]);
      }

      if (depthMatch && lengthMatch && !areaMatch) {
        parsedArea = parsedWidth * parsedLength;
      }

      const options = [
        {
          id: 'option-a',
          title: 'Modern Open-Concept',
          tag: 'Spacious & Glazed',
          area: parsedArea,
          width: parsedWidth,
          length: parsedLength,
          bedrooms: parsedBhk,
          bathrooms: Math.max(1, parsedBhk - 1),
          style: 'Modern Villa',
          layoutVariation: 'A',
          description: `Features an integrated kitchen-lounge zone (approx. ${Math.round(parsedArea * 0.45)} sq ft) with zero vertical partitions. Extends master bed with a glass balcony.`,
          specs: `Lounge: ${Math.round(parsedWidth*0.5)}x${Math.round(parsedLength*0.4)}ft, Master Bed: ${Math.round(parsedWidth*0.45)}x${Math.round(parsedLength*0.3)}ft.`
        },
        {
          id: 'option-b',
          title: 'Smart Space-Saver',
          tag: 'Max Utility',
          area: parsedArea,
          width: parsedWidth,
          length: parsedLength,
          bedrooms: parsedBhk,
          bathrooms: Math.max(1, parsedBhk),
          style: 'Minimalist',
          layoutVariation: 'B',
          description: `Corridors minimized to below 3% footprint. Back-to-back bathroom layouts to save ₹1,30,000 on plumbing installations. Standard room sizes.`,
          specs: `Lounge: ${Math.round(parsedWidth*0.45)}x${Math.round(parsedLength*0.35)}ft, Bedroom 1: ${Math.round(parsedWidth*0.4)}x${Math.round(parsedLength*0.3)}ft.`
        },
        {
          id: 'option-c',
          title: 'Vastu-Compliant Courtyard',
          tag: 'Airflow & Courtyard',
          area: parsedArea,
          width: parsedWidth,
          length: parsedLength,
          bedrooms: parsedBhk,
          bathrooms: Math.max(1, parsedBhk),
          style: 'Traditional',
          layoutVariation: 'C',
          description: `Vastu-aligned layout with kitchen in South-East. Features a central open-sky ventilation courtyard that boosts sunlight and breeze by 30%.`,
          specs: `Lounge: ${Math.round(parsedWidth*0.4)}x${Math.round(parsedLength*0.4)}ft, Courtyard: ${Math.round(parsedWidth*0.2)}x${Math.round(parsedLength*0.15)}ft.`
        }
      ];

      reply = `I have generated 3 dynamic layouts for a ${parsedArea} sq ft (${parsedWidth}x${parsedLength} ft) plot with ${parsedBhk} BHK. Please select your preferred alternative in the sidebar.`;
      setAiResponse(reply);

      if (onGenerateOptions) {
        onGenerateOptions(options, text);
      }
      return;
    }

    if (clean.includes('add') && (clean.includes('bedroom') || clean.includes('room'))) {
      parsedAction = { type: 'BEDROOMS_INC' };
      reply = "Adding one additional bedroom to the layout.";
    } else if (clean.includes('remove') && (clean.includes('bedroom') || clean.includes('room'))) {
      parsedAction = { type: 'BEDROOMS_DEC' };
      reply = "Decreasing bedroom count to free up common area.";
    } else if (clean.includes('add') && clean.includes('floor')) {
      parsedAction = { type: 'FLOORS_INC' };
      reply = "Elevating structure. Adding a floor.";
    } else if (clean.includes('first floor') || clean.includes('floor 2') || clean.includes('show first')) {
      parsedAction = { type: 'SHOW_FLOOR', value: 1 };
      reply = "Switching viewer camera focus to the first floor.";
    } else if (clean.includes('ground floor') || clean.includes('floor 1') || clean.includes('show ground')) {
      parsedAction = { type: 'SHOW_FLOOR', value: 0 };
      reply = "Switching viewer camera focus to the ground floor.";
    } else if (clean.includes('remove roof') || clean.includes('hide roof') || clean.includes('take off roof')) {
      parsedAction = { type: 'ROOF_TOGGLE', value: false };
      reply = "Roof meshes hidden. Interior layout is fully visible.";
    } else if (clean.includes('show roof') || clean.includes('add roof') || clean.includes('put roof')) {
      parsedAction = { type: 'ROOF_TOGGLE', value: true };
      reply = "Roof meshes visible. Structural shell is complete.";
    } else if (clean.includes('minimalist')) {
      parsedAction = { type: 'STYLE_CHANGE', value: 'Minimalist' };
      reply = "Redesigning house style to Minimalist lines.";
    } else if (clean.includes('traditional')) {
      parsedAction = { type: 'STYLE_CHANGE', value: 'Traditional' };
      reply = "Shifting to pitched gables and brick tones.";
    } else if (clean.includes('industrial')) {
      parsedAction = { type: 'STYLE_CHANGE', value: 'Industrial' };
      reply = "Implementing concrete slabs and dark metal frames.";
    } else if (clean.includes('modern villa') || clean.includes('modern style')) {
      parsedAction = { type: 'STYLE_CHANGE', value: 'Modern Villa' };
      reply = "Resetting blueprint styles to Modern Villa.";
    } else if (clean.includes('explode') || clean.includes('split floors')) {
      parsedAction = { type: 'EXPLODE_TOGGLE', value: true };
      reply = "Activating CAD Explode View. Separating levels vertically.";
    } else if (clean.includes('collapse') || clean.includes('reset view') || clean.includes('merge floors')) {
      parsedAction = { type: 'EXPLODE_TOGGLE', value: false };
      reply = "Collapsing levels. Reassembling building structures.";
    } else {
      reply = `Parsed query: "${text}". Try: "1200 sq ft, 30x40 plot, 2 BHK" to generate options.`;
    }

    setAiResponse(reply);
    
    if (parsedAction && onExecuteCommand) {
      onExecuteCommand(parsedAction);
    }
  };

  const handleSubmitText = (e) => {
    e.preventDefault();
    if (!inputText) return;
    processCommandText(inputText);
    setInputText('');
  };

  const shortcuts = [
    { label: "Hide Roof", phrase: "Hide the roof" },
    { label: "Show 1st Floor", phrase: "Show first floor" },
    { label: "Add Bedroom", phrase: "Add a bedroom" },
    { label: "Style: Traditional", phrase: "Change style to Traditional" },
    { label: "Explode Model", phrase: "Explode view" }
  ];

  return (
    <div className="flex flex-col gap-2 relative">
      
      {/* 1. Interactive Shortcuts Popover (Triggers on Focus) */}
      {isFocused && (
        <div className="absolute bottom-full left-0 right-0 mb-3 bg-zinc-950/95 border border-zinc-800 p-3 rounded-2xl shadow-2xl backdrop-blur-md flex flex-col gap-2 z-50 animate-slideUp">
          <div className="text-[9px] text-zinc-500 uppercase font-mono tracking-widest font-bold flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-indigo-400 fill-indigo-400" />
            Quick Shortcuts
          </div>
          <div className="flex flex-wrap gap-1">
            {shortcuts.map((shortcut, idx) => (
              <button
                key={idx}
                type="button"
                onMouseDown={(e) => {
                  // Prevent input blur before click registers
                  e.preventDefault();
                  processCommandText(shortcut.phrase);
                }}
                className="text-[10px] font-sans bg-zinc-900 hover:bg-zinc-800 border border-zinc-800/80 py-1 px-2.5 rounded-full text-zinc-350 hover:text-white cursor-pointer transition duration-200"
              >
                {shortcut.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 2. Voice listening visualizer */}
      {isListening && (
        <div className="flex justify-center items-center gap-1.5 py-1.5 bg-zinc-950/60 rounded-xl border border-zinc-850 mb-1">
          <span className="w-1 h-3 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
          <span className="w-1 h-5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
          <span className="w-1 h-2 bg-emerald-300 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
          <span className="w-1 h-4 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
          <span className="text-[10px] font-mono text-emerald-400 ml-1.5 font-bold">Listening...</span>
        </div>
      )}

      {/* 3. Delicate AI Response notification */}
      {isGenerating && (
        <div className="text-[11px] text-zinc-400 font-medium leading-relaxed px-1 flex items-start gap-2 mb-1 bg-zinc-900/30 p-2.5 rounded-xl border border-zinc-900/60 animate-pulse">
          <Bot className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5 animate-bounce" />
          <span className="flex-grow font-sans text-zinc-350 flex items-center gap-1.5">
            Architect AI is designing custom layouts...
            <span className="inline-flex gap-1 align-middle items-center mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce delay-0"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.2s]"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.4s]"></span>
            </span>
          </span>
        </div>
      )}

      {!isGenerating && aiResponse && (
        <div className="text-[11px] text-zinc-400 font-medium leading-relaxed px-1 flex items-start gap-2 mb-1 bg-zinc-900/30 p-2.5 rounded-xl border border-zinc-900/60">
          <Bot className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
          <span className="flex-grow font-sans text-zinc-350">{aiResponse}</span>
        </div>
      )}

      {transcript && !aiResponse && !isGenerating && (
        <div className="text-[10px] text-zinc-500 font-mono px-1.5 mb-1">
          🎙️ Spoken: "{transcript}"
        </div>
      )}

      {/* 4. ChatGPT Style Input Capsule */}
      <form onSubmit={handleSubmitText} className={`bg-zinc-800 border border-zinc-700/40 rounded-2xl p-1.5 flex items-center gap-2 focus-within:border-zinc-600 transition shadow-inner ${isGenerating ? 'opacity-50 pointer-events-none' : ''}`}>
        {/* Toggle Listening Mic Button */}
        <button
          type="button"
          onClick={toggleListening}
          disabled={isGenerating}
          className={`p-2 rounded-xl cursor-pointer transition shrink-0 flex items-center justify-center ${
            isListening 
              ? 'bg-rose-500/20 text-rose-400 hover:bg-rose-500/30' 
              : 'text-zinc-450 hover:text-zinc-200 hover:bg-zinc-750'
          }`}
          title="Toggle speech mic"
        >
          {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
        </button>

        {/* Text Input Field */}
        <input
          type="text"
          placeholder="Message BuildVision..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          disabled={isGenerating}
          className="flex-grow bg-transparent border-none outline-none text-xs text-white placeholder-zinc-500 py-1.5 font-sans"
        />

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isGenerating || !inputText}
          className="bg-zinc-950 hover:bg-zinc-900 text-zinc-400 hover:text-white p-2 rounded-xl cursor-pointer transition disabled:opacity-20 shrink-0"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>

      {recognitionError && (
        <div className="flex items-center gap-1.5 text-yellow-500 text-[10px] font-mono leading-none px-1.5 mt-0.5">
          <AlertCircle className="w-3 h-3" />
          {recognitionError}
        </div>
      )}
    </div>
  );
}
