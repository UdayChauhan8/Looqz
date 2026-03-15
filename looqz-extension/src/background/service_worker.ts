chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === "SET_BADGE") {
    if (msg.text !== undefined) {
      chrome.action.setBadgeText({ text: msg.text });
    }
    if (msg.color !== undefined) {
      chrome.action.setBadgeBackgroundColor({ color: msg.color });
    }
  }
});
