import { ArrowLeftRight } from "lucide-react";

interface SwapButtonProps {
  onClick: () => void;
}

export function SwapButton({ onClick }: SwapButtonProps) {
  return (
    <button
      onClick={onClick}
      type="button"
      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 group"
      aria-label="Swap locations"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-primary shadow-premium-lg transition-all duration-300 group-hover:shadow-premium-xl group-hover:scale-110 group-active:scale-95">
        <ArrowLeftRight className="h-5 w-5 text-white transition-transform duration-500 group-hover:rotate-180" />
      </div>
    </button>
  );
}
