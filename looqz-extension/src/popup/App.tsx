import { AnimatePresence, motion } from "framer-motion";

import { useTryOnStore } from "./store/useTryOnStore";
import { useProductImage } from "./hooks/useProductImage";

import DetectingScreen from "./components/DetectingScreen";
import UploadScreen from "./components/UploadScreen";
import GeneratingScreen from "./components/GeneratingScreen";
import ResultScreen from "./components/ResultScreen";
import ErrorScreen from "./components/ErrorScreen";

export default function App() {
  const step = useTryOnStore(s => s.step);
  useProductImage();

  return (
    <div className="w-[380px] h-[560px] bg-bg text-text-primary font-sans overflow-hidden flex flex-col relative shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] sm:rounded-2xl sm:border sm:border-border sm:my-8 bg-[#0A0A0F]">
      <AnimatePresence mode="wait">
        {step === "detecting"  && <motion.div key="detecting" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }} className="flex-1 overflow-hidden"><DetectingScreen /></motion.div>}
        {step === "upload"     && <motion.div key="upload" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }} className="flex-1 overflow-hidden flex flex-col"><UploadScreen /></motion.div>}
        {step === "generating" && <motion.div key="generating" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }} className="flex-1 overflow-hidden"><GeneratingScreen /></motion.div>}
        {step === "result"     && <motion.div key="result" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }} className="flex-1 overflow-hidden flex flex-col"><ResultScreen /></motion.div>}
        {step === "error"      && <motion.div key="error" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }} className="flex-1 overflow-hidden"><ErrorScreen /></motion.div>}
      </AnimatePresence>
    </div>
  );
}
