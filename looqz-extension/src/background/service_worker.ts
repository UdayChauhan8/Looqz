chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === "SET_BADGE") {
    if (msg.text !== undefined) {
      chrome.action.setBadgeText({ text: msg.text });
    }
    if (msg.color) {
      chrome.action.setBadgeBackgroundColor({ color: msg.color });
    }
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
