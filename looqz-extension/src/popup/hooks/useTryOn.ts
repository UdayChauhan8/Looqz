import { useMutation } from "@tanstack/react-query";
import { useTryOnStore } from "../store/useTryOnStore";
import { LooqzClient, LooqzError } from "../../lib/looqzClient";
import { resizeImage } from "../../lib/imageUtils";

function toUserMessage(error: unknown): string {
  if (error instanceof LooqzError) {
    if (error.isRateLimit) return "Too many requests. Please wait a moment and try again.";
    if (error.isCredits) return "Looqz credits exhausted. Please top up your account.";
    if (error.statusCode === 401) return "API key invalid — contact support.";
    if (error.statusCode === 403) return "Domain not authorized — check backend config.";
    if (error.isValidation) return "Image validation failed. Make sure both images are clear photos.";
    if (error.isServerError) return "Generation service is busy. Please try again.";
  }
  
  if (error instanceof TypeError) {
    return "No internet connection. Please check your network.";
  }

  return "Something went wrong. Please try again.";
}

export function useTryOn() {
  const {
    productImageUrl,
    userImageBlob,
    setStep,
    setLoading,
    setResult,
    setError,
  } = useTryOnStore();

  return useMutation({
    mutationFn: async (imageCount: 1 | 2 | 3 | 4 = 1) => {
      if (!productImageUrl || !userImageBlob) {
        throw new Error("Missing images");
      }

      // Resize input image to max 1024px before uploading
      const optimizedBlob = await resizeImage(userImageBlob, 1024);

      return LooqzClient.generateTryOn(productImageUrl, optimizedBlob, imageCount);
    },
    onMutate: () => {
      setStep("generating");
      setLoading(true);

      // Tell background worker to update badge (pulsing animation handled in pop-up or intervals)
      if (chrome?.runtime) {
        chrome.runtime.sendMessage({ type: "SET_BADGE", text: "·", color: "#7C6FFF" });
      }
    },
    onSuccess: (data) => {
      setResult(data.image_url, data.images);
      setStep("result");
      setLoading(false);

      if (chrome?.runtime) {
        chrome.runtime.sendMessage({ type: "SET_BADGE", text: "✓", color: "#4ADE80" });
        setTimeout(() => {
          chrome.runtime.sendMessage({ type: "SET_BADGE", text: "", color: "" });
        }, 3000);
      }
    },
    onError: (error) => {
      setError(toUserMessage(error));
      setStep("error");
      setLoading(false);

      if (chrome?.runtime) {
        chrome.runtime.sendMessage({ type: "SET_BADGE", text: "!", color: "#F87171" });
        setTimeout(() => {
          chrome.runtime.sendMessage({ type: "SET_BADGE", text: "", color: "" });
        }, 3000);
      }
    },
  });
}
