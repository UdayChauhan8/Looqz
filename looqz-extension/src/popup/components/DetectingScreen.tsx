export default function DetectingScreen() {
  return (
    <div className="flex-1 w-full h-full flex flex-col items-center justify-center space-y-4">
      <div className="relative flex items-center justify-center w-16 h-16">
        <div className="absolute inset-0 rounded-full border-2 border-primary/40 animate-ping opacity-40"></div>
        <div className="absolute inset-2 rounded-full border-2 border-primary"></div>
        <svg
          className="w-6 h-6 text-primary z-10"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
          />
        </svg>
      </div>
      <p className="text-sm text-text-secondary animate-pulse">Scanning page...</p>
    </div>
  );
}
