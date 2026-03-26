
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

    // 1. Upload the user image to Catbox to get a public URL
    const uploadForm = new FormData();
    uploadForm.append("reqtype", "fileupload");
    uploadForm.append("time", "1h");
    uploadForm.append("fileToUpload", userImageBlob, "user-photo.jpg");

    let userImageUrl: string;
    try {
      const uploadRes = await fetch("https://litterbox.catbox.moe/resources/internals/api.php", {
        method: "POST",
        body: uploadForm,
      });

      if (!uploadRes.ok) {
        throw new Error(`Image upload failed: ${uploadRes.status}`);
      }
      userImageUrl = (await uploadRes.text()).trim();
    } catch (e) {
      throw new LooqzError(500, "Failed to upload image securely for processing.");
    }

    // 2. Call the Looqz Generation API directly using the new user-provided API key
    const headers: Record<string, string> = {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "Accept": "application/json, text/plain, */*"
    };

    const looqzPayload = {
      product_image_url: productImageUrl,
      user_image_url: userImageUrl,
      image_count: imageCount,
    };

    const response = await fetch("https://looqz.in/api/v1/public/generate-image", {
      method: "POST",
      headers,
      body: JSON.stringify(looqzPayload),
    });

    if (response.status === 401 || response.status === 403) {
      const store = useTryOnStore.getState();
      store.setApiKey(null);
      store.setStep("apiKeySetup");
      throw new LooqzError(response.status, "API Key is invalid or expired. Please authorize again.");
    }

    if (!response.ok) {
      let errorMessage = "Request failed";
      try {
        const errJson = await response.json();
        if (errJson.detail) {
          errorMessage = typeof errJson.detail === "string" 
            ? errJson.detail 
            : JSON.stringify(errJson.detail);
        } else if (errJson.message) {
          errorMessage = errJson.message;
        }
      } catch (e) {
        // Fallback if not JSON
      }
      throw new LooqzError(response.status, errorMessage);
    }

    return response.json();
  }
}
