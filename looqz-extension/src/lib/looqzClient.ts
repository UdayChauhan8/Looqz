
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
    const apiKey = useTryOnStore.getState().apiKey;
    if (!apiKey) {
      throw new LooqzError(401, "API Key is missing. Please authorize again.");
    }

    // Convert Blob to Base64 to send to the background service worker
    const userImageBase64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(userImageBlob);
    });

    // Send the proxy request to the background script to bypass CORS
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(
        {
          type: "PROXY_API_CALL",
          apiKey,
          productImageUrl,
          userImageBase64,
          imageCount,
        },
        (response) => {
          if (chrome.runtime.lastError) {
            return reject(new LooqzError(500, "Background script error. Please reload the extension."));
          }
          if (!response) {
            return reject(new LooqzError(500, "No response from background script."));
          }

          if (response.error) {
            if (response.error.status === 401 || response.error.status === 403) {
              const store = useTryOnStore.getState();
              store.setApiKey(null);
              store.setStep("apiKeySetup");
            }
            return reject(new LooqzError(response.error.status, response.error.message));
          }

          resolve(response.data);
        }
      );
    });
  }
}
