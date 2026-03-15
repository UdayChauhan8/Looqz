chrome.runtime.onMessage.addListener(e=>{e.type==="SET_BADGE"&&(e.text!==void 0&&chrome.action.setBadgeText({text:e.text}),e.color!==void 0&&chrome.action.setBadgeBackgroundColor({color:e.color}))});
