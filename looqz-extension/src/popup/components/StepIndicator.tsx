
import { twMerge } from "tailwind-merge";

interface StepIndicatorProps {
  currentStep: 1 | 2;
}

export default function StepIndicator({ currentStep }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-center space-x-2 pt-4 pb-2">
      <div
        className={twMerge(
          "w-2 h-2 rounded-full transition-all duration-300",
          currentStep === 1 ? "bg-primary scale-125" : "bg-primary opacity-50"
        )}
      />
      <div className="w-6 h-px bg-border" />
      <div
        className={twMerge(
          "w-2 h-2 rounded-full transition-all duration-300",
          currentStep === 2 ? "bg-primary scale-125" : "bg-border"
        )}
      />
    </div>
  );
}
