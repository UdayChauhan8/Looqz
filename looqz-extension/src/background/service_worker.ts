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

chrome.action.onClicked.addListener((tab) => {
  if (tab.id) {
    chrome.tabs.create({ url: `src/popup/index.html?tabId=${tab.id}` });
  } else {
    chrome.tabs.create({ url: `src/popup/index.html` });
  }
});
