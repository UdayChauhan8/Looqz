import StepIndicator from "./StepIndicator";
import ProductImageCard from "./ProductImageCard";
import PhotoUploader from "./PhotoUploader";
import { useTryOnStore } from "../store/useTryOnStore";
import { useTryOn } from "../hooks/useTryOn";

export default function UploadScreen() {
  const tryOn = useTryOn();
  const productImageUrl = useTryOnStore((s) => s.productImageUrl);
  const userImageBlob = useTryOnStore((s) => s.userImageBlob);
  
  const isReady = !!productImageUrl && !!userImageBlob;

  return (
    <div className="flex flex-col h-full w-full p-4">
      <StepIndicator currentStep={1} />
      
      <div className="text-center mb-6 mt-2">
        <h1 className="font-display text-[22px] text-text-primary m-0">Virtual Try-On</h1>
        <p className="text-[13px] text-text-secondary mt-1">Try this on yourself in seconds</p>
      </div>

      <div className="flex-1 flex flex-col space-y-6">
        <ProductImageCard />
        <PhotoUploader />
      </div>

      <button
        disabled={!isReady || tryOn.isPending}
        onClick={() => tryOn.mutate(1)}
        className={`w-full h-12 rounded-btn text-white font-semibold transition-all duration-300 mt-6 shrink-0 relative overflow-hidden ${
          isReady && !tryOn.isPending
            ? "bg-primary hover:bg-primary-hover hover:scale-[1.01] shadow-lg shadow-primary/20"
            : "bg-elevated text-text-secondary border border-border cursor-not-allowed"
        }`}
      >
        {isReady && !tryOn.isPending && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
        )}
        <span className="relative z-10 flex items-center justify-center space-x-2">
          <span>{tryOn.isPending ? "Starting..." : "Try It On"}</span>
          {!tryOn.isPending && (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          )}
        </span>
      </button>

      <style>{`
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}
