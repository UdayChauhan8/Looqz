const BACKEND_URL = import.meta.env.VITE_BACKEND_URL ?? "http://localhost:8000";

import { useTryOnStore } from "../popup/store/useTryOnStore";

export interface TryOnResult {
  image_url: string;
  images: string[];
  message: string;
}

export class LooqzError extends Error {
  constructor(
    public statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = "LooqzError";
  }

  get isRateLimit() {
    return this.statusCode === 429;
  }
  get isCredits() {
    return this.statusCode === 402;
  }
  get isValidation() {
    return this.statusCode === 422;
  }
  get isServerError() {
    return this.statusCode >= 500;
  }
  get isUnauthorized() {
    return this.statusCode === 401;
  }
}

export class LooqzClient {
  static async generateTryOn(
    productImageUrl: string,
    userImageBlob: Blob,
    imageCount: 1 | 2 | 3 | 4 = 1,
  ): Promise<TryOnResult> {
    const form = new FormData();
    form.append("product_image_url", productImageUrl);
    form.append("user_image", userImageBlob, "user-photo.jpg");
    form.append("image_count", String(imageCount));

    const apiKey = useTryOnStore.getState().apiKey;
    const headers: Record<string, string> = {};
    if (apiKey) {
      headers["Authorization"] = `Bearer ${apiKey}`;
    }

    const response = await fetch(`${BACKEND_URL}/try-on`, {
      method: "POST",
      headers,
      body: form,
      // Do NOT set Content-Type header; browser will handle it automatically
    });

    if (response.status === 401) {
      const store = useTryOnStore.getState();
      store.setApiKey(null);
      store.setStep("apiKeySetup");
      throw new LooqzError(401, "API Key is invalid or expired. Please authorize again.");
    }

    if (!response.ok) {
      let errorMessage = "Request failed";
      try {
        const errJson = await response.json();
        if (errJson.detail) {
          errorMessage = typeof errJson.detail === "string" 
            ? errJson.detail 
            : JSON.stringify(errJson.detail);
        }
      } catch (e) {
        // Fallback if not JSON
      }
      throw new LooqzError(response.status, errorMessage);
    }

    return response.json();
  }
}
