import { useState } from "react";
import { useTryOnStore } from "../store/useTryOnStore";

export default function ApiKeyScreen() {
  const [keyInput, setKeyInput] = useState("");
  const [error, setError] = useState("");
  const setApiKey = useTryOnStore(s => s.setApiKey);
  const setStep = useTryOnStore(s => s.setStep);

  const handleSave = () => {
    const trimmed = keyInput.trim();
    if (!trimmed.startsWith("sk_live_")) {
      setError("Invalid key format. Key should start with 'sk_live_'");
      return;
    }
    setApiKey(trimmed);
    setStep("detecting");
  };

  const handleGetKey = () => {
    if (chrome?.tabs?.create) {
      chrome.tabs.create({ url: "https://www.looqz.in/dashboard" });
    } else {
      window.open("https://www.looqz.in/dashboard", "_blank");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 h-full text-center">
      <h2 className="text-xl font-bold mb-4 text-white">Connect Looqz</h2>
      <p className="text-sm text-gray-400 mb-6">
        Please provide your Looqz API key to enable AI virtual try-on extensions.
      </p>
      
      <button 
        onClick={handleGetKey}
        className="w-full bg-[#1A1A24] border border-white/10 text-white rounded-lg py-3 px-4 mb-6 hover:bg-[#2A2A35] transition-colors"
      >
        Get your API Key
      </button>

      <div className="w-full space-y-3">
        <label className="text-sm font-medium text-gray-400 block text-left">
          Your API Key
        </label>
        <input 
          type="password"
          value={keyInput}
          onChange={(e) => { setKeyInput(e.target.value); setError(""); }}
          placeholder="sk_live_..."
          className="w-full bg-[#1A1A24] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-white/20"
        />
        {error && <p className="text-xs text-red-500 text-left">{error}</p>}
        
        <button 
          onClick={handleSave}
          disabled={!keyInput}
          className="w-full bg-white text-black font-medium rounded-lg py-3 px-4 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 transition-colors mt-2"
        >
          Save & Continue
        </button>
      </div>
    </div>
  );
}
