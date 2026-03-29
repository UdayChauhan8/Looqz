// Listen for messages from content scripts/popup
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "SET_BADGE") {
    if (msg.text !== undefined) {
      chrome.action.setBadgeText({ text: msg.text });
    }
    if (msg.color) {
      chrome.action.setBadgeBackgroundColor({ color: msg.color });
    }
  }

  if (msg.type === "PROXY_API_CALL") {
    // Handle the Looqz generation process in the background script to bypass CORS
    (async () => {
      try {
        const { apiKey, productImageUrl, userImageBase64, imageCount } = msg;

        // 1. Convert base64 back to Blob
        const fetchRes = await fetch(userImageBase64);
        const userImageBlob = await fetchRes.blob();

        // 2. Upload to Catbox
        const uploadForm = new FormData();
        uploadForm.append("reqtype", "fileupload");
        uploadForm.append("time", "1h");
        uploadForm.append("fileToUpload", userImageBlob, "user-photo.jpg");

        const uploadResponse = await fetch("https://litterbox.catbox.moe/resources/internals/api.php", {
          method: "POST",
          body: uploadForm,
        });

        if (!uploadResponse.ok) {
          throw { status: 500, message: `Image upload failed: ${uploadResponse.status}` };
        }
        const userImageUrl = (await uploadResponse.text()).trim();

        // 3. Call Looqz API
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
          return sendResponse({ error: { status: response.status, message: "API Key is invalid or expired." } });
        }

        if (!response.ok) {
          let errorMessage = "Request failed";
          try {
            const errJson = await response.json();
            errorMessage = errJson.detail || errJson.message || errorMessage;
            if (typeof errorMessage !== "string") errorMessage = JSON.stringify(errorMessage);
          } catch (e) {}
          return sendResponse({ error: { status: response.status, message: errorMessage } });
        }

        const data = await response.json();
        sendResponse({ success: true, data });
      } catch (err: any) {
        sendResponse({ error: { status: err.status || 500, message: err.message || "Unknown proxy error" } });
      }
    })();
    return true; // Keep message channel open for async response
  }
});

chrome.action.onClicked.addListener(async (tab) => {
  if (!tab.id) return;

  // Try sending message to existing content script first
  try {
    await chrome.tabs.sendMessage(tab.id, { type: "TOGGLE_POPUP" });
    return; // Content script responded, we're done
  } catch (_) {
    // Content script not loaded yet — inject it
  }

  // Programmatically inject content scripts into the tab
  try {
    // Read manifest to get the actual built filenames (they contain hashes)
    const manifest = chrome.runtime.getManifest();
    const contentScriptFiles = manifest.content_scripts?.[0]?.js || [];

    for (const file of contentScriptFiles) {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: [file],
      });
    }

    // Wait briefly for scripts to initialize, then toggle
    setTimeout(async () => {
      try {
        await chrome.tabs.sendMessage(tab.id!, { type: "TOGGLE_POPUP" });
      } catch (e) {
        console.error("Content script failed after injection:", e);
      }
    }, 300);
  } catch (error) {
    console.error("Cannot inject content scripts:", error);
    // True fallback for restricted pages (chrome://, edge://, etc.)
    chrome.tabs.create({ url: `src/popup/index.html?tabId=${tab.id}` });
  }
});
