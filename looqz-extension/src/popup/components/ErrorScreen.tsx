import { useState, useEffect } from "react";
import { useTryOnStore } from "../store/useTryOnStore";

export default function ErrorScreen() {
  const errorMsg = useTryOnStore((s) => s.error);
  const setStep = useTryOnStore((s) => s.setStep);
  const reset = useTryOnStore((s) => s.reset);
  
  const [countdown, setCountdown] = useState<number | null>(null);

  useEffect(() => {
    // If rate limit error, show a countdown
    if (errorMsg?.includes("Too many requests") || errorMsg?.includes("retry in")) {
      // Default retry to 15s if it doesn't parse
      let seconds = 15;
      const match = errorMsg.match(/in (\d+)s/);
      if (match && match[1]) {
        seconds = parseInt(match[1], 10);
      }
      
      setCountdown(seconds);
      
      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev === null || prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      return () => clearInterval(interval);
    }
  }, [errorMsg]);

  useEffect(() => {
    // Auto-retry when countdown hits zero
    if (countdown === 0) {
      setStep("upload"); 
      // User can click retry from the upload step naturally
      // Alternatively we could call tryOn.mutate(1) here directly
    }
  }, [countdown, setStep]);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center">
      
      {/* Animated Shake Icon on mount */}
      <div className="w-16 h-16 rounded-full bg-error/10 flex items-center justify-center mb-6 text-error animate-[shake_400ms_ease-in-out]">
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-8 h-8 stroke-2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </div>
      
      <h2 className="font-display text-xl text-text-primary mb-2">Oops!</h2>
      
      <p className="text-sm text-text-secondary mb-8">
        {errorMsg || "Something went wrong. Please try again."}
      </p>

      {/* Rate limit countdown info */}
      {countdown !== null && countdown > 0 && (
        <div className="text-sm font-medium text-text-primary mb-6 bg-elevated px-4 py-2 rounded-full border border-border">
          Retrying in <span className="text-primary">{countdown}s</span>
        </div>
      )}

      <div className="w-full flex justify-center space-x-3 mt-auto mb-4">
        <button
          onClick={() => setStep("upload")}
          disabled={countdown !== null && countdown > 0}
          className="flex-1 bg-primary hover:bg-primary-hover disabled:bg-border disabled:text-text-secondary text-white py-2.5 rounded-btn text-sm font-medium transition-colors"
        >
          Try Again
        </button>
        <button
          onClick={() => {
            reset();
            setStep("upload");
          }}
          className="flex-1 bg-transparent border border-border hover:border-primary text-text-primary py-2.5 rounded-btn text-sm font-medium transition-colors"
        >
          Go Back
        </button>
      </div>

      <style>{`
        @keyframes shake {
          0% { transform: translateX(-4px); }
          25% { transform: translateX(4px); }
          50% { transform: translateX(-2px); }
          75% { transform: translateX(2px); }
          100% { transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}
