import { useState } from "react";
import { useTryOnStore } from "../store/useTryOnStore";

export default function ProductImageCard() {
  const productImageUrl = useTryOnStore((s) => s.productImageUrl);
  const setProductImageUrl = useTryOnStore((s) => s.setProductImageUrl);
  const [imageFailed, setImageFailed] = useState(false);
  const [manualUrl, setManualUrl] = useState("");

  const hasImage = productImageUrl && !imageFailed;

  if (hasImage) {
    return (
      <div className="relative w-full aspect-[4/3] rounded-card overflow-hidden border border-border group transition-all duration-300 hover:scale-[1.005]">
        <div className="absolute inset-0 border border-transparent group-hover:border-primary/50 rounded-card z-10 pointer-events-none transition-colors duration-300" />
        <img
          src={productImageUrl}
          alt="Detected product"
          className="w-full h-full object-cover"
          onError={() => setImageFailed(true)}
        />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3 flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
          <span className="text-xs font-medium text-white shadow-sm">
            Detected product
          </span>
        </div>
      </div>
    );
  }

  // Fallback state if no image URL detected, or image failed to load
  return (
    <div className="w-full p-4 border border-dashed border-border rounded-card bg-surface flex flex-col items-center justify-center space-y-3">
      <p className="text-sm text-text-secondary text-center">
        No product image detected
      </p>
      <div className="flex w-full space-x-2">
        <input
          type="url"
          placeholder="Paste product image URL"
          className="flex-1 bg-elevated border border-border rounded-btn px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-primary transition-colors"
          value={manualUrl}
          onChange={(e) => setManualUrl(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && manualUrl) {
              setProductImageUrl(manualUrl);
              setImageFailed(false);
            }
          }}
        />
        <button
          onClick={() => {
            if (manualUrl) {
              setProductImageUrl(manualUrl);
              setImageFailed(false);
            }
          }}
          disabled={!manualUrl}
          className="bg-primary hover:bg-primary-hover disabled:bg-border disabled:text-text-secondary text-white px-3 py-2 rounded-btn text-sm font-medium transition-colors"
        >
          Use
        </button>
      </div>
    </div>
  );
}
