import { useState, useEffect } from "react";
import { useTryOnStore } from "../store/useTryOnStore";
import { useTryOn } from "../hooks/useTryOn";

const MESSAGES = [
  "Analyzing your photo...",
  "Fitting the garment...",
  "Rendering the result...",
  "Almost done..."
];

export default function GeneratingScreen() {
  const productImageUrl = useTryOnStore((s) => s.productImageUrl);
  const userImagePreviewUrl = useTryOnStore((s) => s.userImagePreviewUrl);
  const setStep = useTryOnStore((s) => s.setStep);
  const tryOn = useTryOn();
  
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % MESSAGES.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-6 space-y-12">
      
      {/* Split image view */}
      <div className="relative w-full max-w-[280px] aspect-[4/3] flex items-center justify-center">
        
        {/* Left: Product */}
        <div className="absolute left-0 w-[48%] h-full rounded-card overflow-hidden shadow-lg transform -rotate-6 translate-x-2 border border-border/50">
          <img 
            src={productImageUrl || ""} 
            alt="Product" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-primary/10 mix-blend-overlay"></div>
        </div>
        
        {/* Right: User */}
        <div className="absolute right-0 w-[48%] h-full rounded-card overflow-hidden shadow-lg transform rotate-6 -translate-x-2 border border-border/50">
          <img 
            src={userImagePreviewUrl || ""} 
            alt="User" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-primary/10 mix-blend-overlay"></div>
        </div>
        
        {/* Center: Glowing orb & lines */}
        <div className="absolute z-10 w-full h-full flex items-center justify-center pointer-events-none">
          {/* Animated converging lines simulation via simple CSS */}
          <div className="absolute w-[120%] h-px bg-gradient-to-r from-transparent via-primary to-transparent animate-pulse glow-line" />
          <div className="absolute w-[120%] h-px bg-gradient-to-r from-transparent via-primary to-transparent animate-pulse glow-line rotate-90" />
          
          <div className="w-12 h-12 bg-bg rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(124,111,255,0.6)] mix-blend-screen z-20">
            <div className="w-4 h-4 bg-primary rounded-full animate-ping glow"></div>
          </div>
        </div>
      </div>

      {/* Progress & Status */}
      <div className="w-full flex flex-col items-center space-y-4">
        {/* Indeterminate loader */}
        <div className="w-full h-1 bg-elevated rounded-full overflow-hidden shrink-0">
          <div className="h-full bg-primary rounded-full w-1/3 animate-[progress_1.5s_ease-in-out_infinite]" />
        </div>
        
        {/* Rotating message */}
        <p className="text-sm font-medium text-text-primary animate-pulse transition-opacity duration-300">
          {MESSAGES[msgIndex]}
        </p>
      </div>

      <button
        onClick={() => {
          // Doesn't natively cancel the fetch request in basic setup unless passing abortController,
          // but visually resets the app so user can proceed
          tryOn.reset();
          setStep("upload");
        }}
        className="text-sm text-text-secondary hover:text-white transition-colors"
      >
        Cancel
      </button>

      <style>{`
        @keyframes progress {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(300%); }
        }
      `}</style>
    </div>
  );
}
