import { useEffect } from "react";
import { useTryOnStore, rehydrateUserImage } from "../store/useTryOnStore";

export function useProductImage() {
  const setStep = useTryOnStore(s => s.setStep);
  const setProductImageUrl = useTryOnStore(s => s.setProductImageUrl);
  const setUserImage = useTryOnStore(s => s.setUserImage);
  const setError = useTryOnStore(s => s.setError);

  useEffect(() => {
    let mounted = true;

    async function init() {
      try {
        // Step 1: Rehydrate user image from storage
        const { blob, previewUrl } = await rehydrateUserImage();
        if (mounted && blob && previewUrl) {
          setUserImage(blob, previewUrl);
        }

        // Step 2: Get product image from original tab
        if (chrome?.tabs) {
          const urlParams = new URLSearchParams(window.location.search);
          const tabIdParam = urlParams.get("tabId");
          let targetTabId: number | undefined;

          if (tabIdParam) {
            targetTabId = parseInt(tabIdParam, 10);
          } else {
            const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
            if (tabs && tabs.length > 0) {
              targetTabId = tabs[0].id;
            }
          }
          
          if (targetTabId) {
            try {
              const response = await chrome.tabs.sendMessage(targetTabId, { type: "GET_PRODUCT_IMAGE" });
              if (mounted && response?.url) {
                setProductImageUrl(response.url);
              } else if (mounted) {
                setProductImageUrl(null);
                setError("No clothing product found on this page");
              }
            } catch (err) {
              // Could not communicate with content script (e.g., chrome:// pages)
              if (mounted) {
                setProductImageUrl(null);
                setError("No clothing product found on this page");
              }
            }
          }
        }
      } catch (err) {
        console.error("Initialization error:", err);
      } finally {
        if (mounted) {
          setStep("upload");
        }
      }
    }

    init();

    return () => {
      mounted = false;
    };
  }, [setProductImageUrl, setStep, setUserImage, setError]);
}
