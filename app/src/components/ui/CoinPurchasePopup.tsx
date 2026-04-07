"use client";

import { useStore } from "@/stores/useStore";
import { X } from "lucide-react";
import { useState } from "react";

const options = [
  { coins: 60, price: 50, label: "₹50" },
  { coins: 130, price: 100, label: "₹100", popular: true },
  { coins: 300, price: 200, label: "₹200", best: true },
];

interface Props {
  onClose: () => void;
  onSuccess?: () => void;
  neededCoins?: number;
}

export function CoinPurchasePopup({ onClose, onSuccess, neededCoins }: Props) {
  const { addCoins } = useStore();
  const [buying, setBuying] = useState<number | null>(null);

  const handleBuy = async (opt: typeof options[0]) => {
    setBuying(opt.price);
    // Mock purchase — in production: Razorpay checkout
    await new Promise((r) => setTimeout(r, 800));
    addCoins(opt.coins);
    setBuying(null);
    onSuccess?.();
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-[70]" onClick={onClose} />
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[70] w-full max-w-sm">
        <div className="bg-white rounded-2xl border border-[#EAEAEA] shadow-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#F0F0F0]">
            <div>
              <p className="text-sm font-bold text-[#111]">Not enough coins</p>
              {neededCoins && <p className="text-xs text-[#999] mt-0.5">You need {neededCoins} more coins</p>}
            </div>
            <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center text-[#CCC] hover:text-[#111] hover:bg-[#F5F5F5] transition-colors cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-5 space-y-2">
            {options.map((opt) => (
              <button
                key={opt.price}
                onClick={() => handleBuy(opt)}
                disabled={buying !== null}
                className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl border transition-all cursor-pointer disabled:opacity-50 ${
                  opt.popular ? "border-[#111] bg-[#FAFAFA]" : "border-[#EAEAEA] hover:border-[#CCC]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">🪙</span>
                  <div className="text-left">
                    <p className="text-sm font-bold text-[#111]">{opt.coins} coins</p>
                    <p className="text-[10px] text-[#999]">{opt.coins > opt.price ? `+${opt.coins - opt.price} bonus` : ""}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {opt.popular && <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#111] text-white font-semibold">Popular</span>}
                  {opt.best && <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#7B61FF] text-white font-semibold">Best</span>}
                  <span className="text-sm font-bold text-[#111]">
                    {buying === opt.price ? "..." : opt.label}
                  </span>
                </div>
              </button>
            ))}
          </div>

          <div className="px-5 pb-5">
            <p className="text-[10px] text-[#CCC] text-center">Secure payment via Razorpay. No subscription needed.</p>
          </div>
        </div>
      </div>
    </>
  );
}
