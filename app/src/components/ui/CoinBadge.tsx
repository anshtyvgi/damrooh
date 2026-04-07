"use client";

import { useStore } from "@/stores/useStore";

interface CoinBadgeProps {
  className?: string;
}

export function CoinBadge({ className = "" }: CoinBadgeProps) {
  const coins = useStore((s) => s.coins);

  return (
    <div
      className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface border border-border hover:scale-105 transition-transform ${className}`}
    >
      <div className="w-4 h-4 rounded-full bg-accent flex items-center justify-center">
        <span className="text-[8px] font-bold text-white">$</span>
      </div>
      <span className="font-medium text-text text-sm">{coins}</span>
    </div>
  );
}
