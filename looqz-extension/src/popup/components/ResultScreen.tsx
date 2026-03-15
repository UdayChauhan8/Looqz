import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import StepIndicator from "./StepIndicator";
import { useTryOnStore } from "../store/useTryOnStore";
import { useTryOn } from "../hooks/useTryOn";

export default function ResultScreen() {
  const productImageUrl = useTryOnStore((s) => s.productImageUrl);
  const resultImageUrl = useTryOnStore((s) => s.resultImageUrl);
  const resultImages = useTryOnStore((s) => s.resultImages);
  const tryOn = useTryOn();
  
  const [sliderPos, setSliderPos] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Multiple variants tracking
  const [variantIndex, setVariantIndex] = useState(0);
  
  const imagesToMap = resultImages && resultImages.length > 0 ? resultImages : (resultImageUrl ? [resultImageUrl] : []);
  const activeImageUrl = imagesToMap[variantIndex] || "";

  // Pointer event handlers for slider
  const handlePointerMove = (e: PointerEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const width = rect.width;
    
    // Clamp to 5-95%
    let percentage = (x / width) * 100;
    percentage = Math.max(5, Math.min(95, percentage));
    
    setSliderPos(percentage);
  };

  const handlePointerUp = () => {
    document.removeEventListener("pointermove", handlePointerMove);
    document.removeEventListener("pointerup", handlePointerUp);
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    document.addEventListener("pointermove", handlePointerMove);
    document.addEventListener("pointerup", handlePointerUp);
    
    // Initial jump to click position 
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const width = rect.width;
      let percentage = (x / width) * 100;
      percentage = Math.max(5, Math.min(95, percentage));
      setSliderPos(percentage);
    }
  };

  useEffect(() => {
    return () => {
      document.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("pointerup", handlePointerUp);
    };
  }, []);

  const handleDownload = async () => {
    if (!activeImageUrl) return;
    try {
      const res = await fetch(activeImageUrl);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "looqz-tryon.jpg";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch(e) {
      console.error("Download failed", e);
    }
  };

  const handleShare = async () => {
    if (!activeImageUrl) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Looqz Virtual Try-On",
          text: "Check out this virtual try-on from Looqz!",
          url: activeImageUrl
        });
      } catch (err) {
        // Fallback to clipboard copied catch block
      }
    } else {
      await navigator.clipboard.writeText(activeImageUrl);
      // Would normally show toast here
    }
  };

  const handleTryAnother = () => {
    tryOn.reset();
  };

  return (
    <div className="flex flex-col h-full w-full p-4 overflow-y-auto">
      <StepIndicator currentStep={2} />
      
      <div className="text-center mb-4 mt-2 flex flex-col items-center">
        <h1 className="font-display text-[22px] text-text-primary m-0">Your Look</h1>
        <div className="mt-2 bg-success/20 text-success text-xs px-2 py-0.5 rounded-full flex items-center mb-1">
          <span className="mr-1">✓</span> Generated
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.96 }} 
        animate={{ opacity: 1, scale: 1 }} 
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full aspect-[4/3] rounded-card overflow-hidden group touch-none mb-2"
        ref={containerRef}
        onPointerDown={handlePointerDown}
        style={{ cursor: "ew-resize" }}
      >
        {/* Polarized reveal layer simulated via saturate animation */}
        <div className="absolute inset-0 w-full h-full animate-[saturate-in_600ms_forwards]">
          
          {/* Base: Try-on result */}
          <img 
            src={activeImageUrl} 
            alt="Try-on Result" 
            className="absolute inset-0 w-full h-full object-cover pointer-events-none"
            style={{ clipPath: `inset(0 0 0 ${sliderPos}%)` }}
          />
          
          {/* Overlay: Original Product */}
          <img 
            src={productImageUrl || ""} 
            alt="Original Product" 
            className="absolute inset-0 w-full h-full object-cover pointer-events-none"
            style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
          />
        
        </div>

        {/* Divider line & Handle */}
        <div 
          className="absolute top-0 bottom-0 bg-white/40 w-[2px] cursor-ew-resize drop-shadow-md pointer-events-none"
          style={{ left: `${sliderPos}%`, transform: "translateX(-50%)" }}
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-primary rounded-full shadow-lg flex items-center justify-center pointer-events-auto">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8L22 12L18 16M6 8L2 12L6 16M2 12H22"/>
            </svg>
          </div>
        </div>
      </motion.div>

      <p className="text-[12px] text-text-secondary text-center mb-4 mt-1">Before / After</p>

      {/* Variant dots if multiple images exist */}
      {imagesToMap.length > 1 && (
        <div className="flex justify-center space-x-2 mb-4">
          {imagesToMap.map((_, i) => (
            <button 
              key={i}
              onClick={() => setVariantIndex(i)}
              className={`w-2 h-2 rounded-full transition-all ${i === variantIndex ? "bg-primary scale-125" : "bg-border hover:bg-text-secondary"}`}
            />
          ))}
        </div>
      )}

      {/* Primary Actions */}
      <div className="grid grid-cols-2 gap-3 mb-4 mt-auto">
        <button 
          onClick={handleDownload}
          className="bg-transparent border border-border hover:border-primary text-text-primary px-3 py-2.5 rounded-btn text-sm font-medium transition-colors"
        >
          Download
        </button>
        <button 
          onClick={handleShare}
          className="bg-transparent border border-border hover:border-primary text-text-primary px-3 py-2.5 rounded-btn text-sm font-medium transition-colors"
        >
          Share
        </button>
      </div>

      <button 
        onClick={handleTryAnother}
        className="w-full bg-elevated hover:bg-primary hover:text-white text-text-primary px-3 py-3 rounded-btn text-sm font-medium transition-colors mb-3"
      >
        Try Another Photo
      </button>

      {/* Generate More */}
      <button 
        onClick={() => tryOn.mutate(4)}
        disabled={tryOn.isPending}
        className="w-full text-center text-[13px] text-text-secondary underline hover:text-text-primary transition-colors disabled:opacity-50"
      >
        {tryOn.isPending ? "Generating..." : "Generate more variants"}
      </button>

      <style>{`
        @keyframes saturate-in {
          0% { filter: saturate(0) blur(2px) contrast(0.8); opacity: 0.8; }
          100% { filter: saturate(1) blur(0) contrast(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
