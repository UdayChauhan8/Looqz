import { useRef, useState, useEffect } from "react";
import { useTryOnStore } from "../store/useTryOnStore";
import {
  ACCEPTED_IMAGE_TYPES,
  isValidImageSize,
  isValidImageType,
  createPreviewUrl,
  formatFileSize,
} from "../../lib/imageUtils";

export default function PhotoUploader() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const setUserImage = useTryOnStore((s) => s.setUserImage);
  const clearUserImage = useTryOnStore((s) => s.clearUserImage);
  const userImagePreviewUrl = useTryOnStore((s) => s.userImagePreviewUrl);
  const userImageBlob = useTryOnStore((s) => s.userImageBlob);

  // Re-used helper to process the dropped/selected file
  const handleFile = (file: File) => {
    setErrorMsg(null);

    if (!isValidImageType(file)) {
      setErrorMsg("Use JPEG, PNG, WEBP, AVIF, or GIF");
      return;
    }

    if (!isValidImageSize(file, 10)) {
      setErrorMsg("Photo must be under 10MB");
      return;
    }

    const previewUrl = createPreviewUrl(file);
    setUserImage(file as Blob, previewUrl);
  };

  // Drag events attached to window to highlight zone when dragging anywhere
  useEffect(() => {
    let dragCounter = 0;

    const handleDragEnter = (e: DragEvent) => {
      e.preventDefault();
      dragCounter++;
      if (e.dataTransfer?.types.includes("Files")) {
        setIsDragging(true);
      }
    };

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      dragCounter--;
      if (dragCounter === 0) {
        setIsDragging(false);
      }
    };

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      dragCounter = 0;

      if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
        handleFile(e.dataTransfer.files[0]);
      }
    };

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
    };

    window.addEventListener("dragenter", handleDragEnter);
    window.addEventListener("dragleave", handleDragLeave);
    window.addEventListener("dragover", handleDragOver);
    window.addEventListener("drop", handleDrop);

    return () => {
      window.removeEventListener("dragenter", handleDragEnter);
      window.removeEventListener("dragleave", handleDragLeave);
      window.removeEventListener("dragover", handleDragOver);
      window.removeEventListener("drop", handleDrop);
    };
  }, []);

  return (
    <div className="flex flex-col space-y-2 w-full">
      <div className="flex justify-between items-end">
        <label className="text-sm font-medium text-text-primary">
          Your photo
        </label>
        {errorMsg && (
          <span className="text-xs text-error font-medium">{errorMsg}</span>
        )}
      </div>

      <div
        onClick={() => {
          // Chrome popups automatically close when a file browser dialog opens.
          // Workaround: if we are in the popup (width < 600px), open the extension in a new tab.
          if (chrome?.runtime?.getURL && window.innerWidth < 600) {
            window.open(chrome.runtime.getURL("src/popup/index.html"), "_blank");
          } else {
            fileInputRef.current?.click();
          }
        }}
        className={`relative h-[120px] rounded-card border-2 flex flex-col items-center justify-center cursor-pointer transition-all duration-200 overflow-hidden ${
          isDragging
            ? "border-primary bg-elevated"
            : "border-dashed border-border bg-surface hover:border-primary hover:bg-elevated"
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept={ACCEPTED_IMAGE_TYPES.join(",")}
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              handleFile(e.target.files[0]);
            }
          }}
        />

        {userImagePreviewUrl ? (
          <div className="flex items-center space-x-4 w-full px-4" onClick={(e) => e.stopPropagation()}>
            <img
              src={userImagePreviewUrl}
              alt="User photo"
              className="w-[60px] h-[60px] rounded-full object-cover border border-border"
            />
            <div className="flex flex-col flex-1 overflow-hidden">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-text-primary truncate">
                  Photo ready
                </span>
                {/* Shows pill if we just rehydrated. Hard to know locally if it's rehydrated vs fresh,
                    but we show it if blob isn't a File instance (meaning it came from indexeddb/storage)
                    or we just keep it simple logic: if userImagePreviewUrl is set but file input is empty. */}
                {!fileInputRef.current?.value && (
                  <span className="bg-elevated text-text-secondary text-[10px] px-2 py-0.5 rounded-full whitespace-nowrap">
                    ↩ using last photo
                  </span>
                )}
              </div>
              {userImageBlob && (
                <span className="text-xs text-text-secondary">
                  {formatFileSize(userImageBlob.size)}
                </span>
              )}
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (fileInputRef.current) fileInputRef.current.value = "";
                clearUserImage();
              }}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-elevated text-text-secondary hover:text-white transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        ) : (
          <>
            <svg
              className="w-6 h-6 text-text-secondary mb-2 pointer-events-none"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <span className="text-[13px] text-text-secondary pointer-events-none">
              Drop photo here or click to upload
            </span>
          </>
        )}
        
        {/* Overlay effect for drag */}
        {isDragging && !userImagePreviewUrl && (
          <div className="absolute inset-0 bg-primary/5 pointer-events-none" />
        )}
      </div>

      <div className="text-[12px] text-text-secondary font-medium">
        JPEG, PNG, WEBP, AVIF, GIF · Max 10MB
      </div>
    </div>
  );
}
