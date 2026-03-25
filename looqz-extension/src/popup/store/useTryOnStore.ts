import { create } from "zustand";

export type Step = "apiKeySetup" | "detecting" | "upload" | "generating" | "result" | "error";

interface TryOnStore {
  // State
  step: Step;
  apiKey: string | null;
  productImageUrl: string | null;
  userImageBlob: Blob | null;
  userImagePreviewUrl: string | null;
  resultImageUrl: string | null;
  resultImages: string[];
  error: string | null;
  isLoading: boolean;

  // Actions
  setStep: (step: Step) => void;
  setApiKey: (key: string | null) => void;
  setProductImageUrl: (url: string | null) => void;
  setUserImage: (blob: Blob, previewUrl: string) => void;
  clearUserImage: () => void;
  setResult: (imageUrl: string, images: string[]) => void;
  setError: (message: string) => void;
  setLoading: (isLoading: boolean) => void;
  reset: () => void;
}

export const useTryOnStore = create<TryOnStore>((set) => ({
  step: "apiKeySetup", // Default to setup, will change to detecting if key exists
  apiKey: null,
  productImageUrl: null,
  userImageBlob: null,
  userImagePreviewUrl: null,
  resultImageUrl: null,
  resultImages: [],
  error: null,
  isLoading: false,

  setStep: (step) => set({ step }),
  setApiKey: (key) => {
    set({ apiKey: key });
    if (key) {
      chrome.storage.local.set({ looqz_api_key: key });
    } else {
      chrome.storage.local.remove(["looqz_api_key"]);
    }
  },
  setProductImageUrl: (url) => set({ productImageUrl: url }),
  
  setUserImage: (blob, previewUrl) => {
    set({ userImageBlob: blob, userImagePreviewUrl: previewUrl });
    
    // Persist to chrome.storage.local
    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64data = reader.result as string;
        chrome.storage.local.set({
          looqz_user_image_b64: base64data,
          looqz_user_image_type: blob.type,
          looqz_user_preview_url: previewUrl
        });
      };
      reader.readAsDataURL(blob);
    } catch (e) {
      // Ignore extension storage errors
    }
  },

  clearUserImage: () => {
    set({ userImageBlob: null, userImagePreviewUrl: null });
    
    try {
      chrome.storage.local.remove([
        "looqz_user_image_b64",
        "looqz_user_image_type",
        "looqz_user_preview_url"
      ]);
    } catch (e) {
      // Ignore extension storage errors
    }
  },

  setResult: (imageUrl, images) => set({ resultImageUrl: imageUrl, resultImages: images }),
  setError: (error) => set({ error }),
  setLoading: (isLoading) => set({ isLoading }),
  
  reset: () => set({ 
    step: "upload", 
    error: null, 
    isLoading: false,
    resultImageUrl: null,
    resultImages: []
  }),
}));

export async function initStoreAuth() {
  try {
    const data = await chrome.storage.local.get(["looqz_api_key"]);
    const store = useTryOnStore.getState();
    if (data.looqz_api_key) {
      store.setApiKey(data.looqz_api_key);
      store.setStep("detecting"); // Move to normal flow
    } else {
      store.setStep("apiKeySetup");
    }
  } catch (e) {
    console.error("Failed to load API key", e);
  }
}

export async function rehydrateUserImage(): Promise<{ blob: Blob | null, previewUrl: string | null }> {
  try {
    const data = await chrome.storage.local.get([
      "looqz_user_image_b64",
      "looqz_user_image_type",
      "looqz_user_preview_url"
    ]);

    if (data.looqz_user_image_b64 && data.looqz_user_image_type) {
      // Convert base64 DataURL block to blob
      const res = await fetch(data.looqz_user_image_b64);
      const blob = await res.blob();
      
      return {
        blob,
        previewUrl: data.looqz_user_preview_url || null
      };
    }
  } catch (e) {
    // Ignore errors for chrome environment not available
  }
  return { blob: null, previewUrl: null };
}
