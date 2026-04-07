"use client";

import { useStore } from "@/stores/useStore";
import { COIN_PACKAGES } from "@/types";
import { Check } from "lucide-react";
import { useState } from "react";

const ledger = [
  { label: "Free signup bonus", amount: 20, type: "credit" as const },
];

export default function CoinsPage() {
  const { coins, addCoins } = useStore();
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [purchased, setPurchased] = useState<string | null>(null);

  const handlePurchase = async (pkg: (typeof COIN_PACKAGES)[number]) => {
    setPurchasing(pkg.id);
    try {
      const orderRes = await fetch("/api/coins", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ packageId: pkg.id }) });
      const order = await orderRes.json();
      const verifyRes = await fetch("/api/coins", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ orderId: order.id, paymentId: `pay_${crypto.randomUUID()}`, signature: "mock", packageId: pkg.id }) });
      const result = await verifyRes.json();
      if (result.success) {
        addCoins(result.coinsAdded);
        setPurchased(pkg.id);
        setTimeout(() => setPurchased(null), 2000);
      }
    } catch { /* */ } finally { setPurchasing(null); }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto space-y-6">
      {/* Balance */}
      <div className="bg-white rounded-2xl border border-[#EAEAEA] p-6">
        <p className="text-xs font-semibold text-[#999] uppercase tracking-wider mb-1">Balance</p>
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-bold text-[#111]">{coins}</span>
          <span className="text-sm text-[#999]">coins</span>
        </div>
      </div>

      {/* Purchase */}
      <div>
        <p className="text-xs font-semibold text-[#999] uppercase tracking-wider mb-3">Buy coins</p>
        <div className="space-y-2">
          {COIN_PACKAGES.map((pkg) => (
            <div key={pkg.id} className={`bg-white rounded-xl border px-5 py-4 flex items-center justify-between transition-all ${pkg.popular ? "border-[#111] shadow-sm" : "border-[#EAEAEA]"}`}>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-[#111]">{pkg.coins} coins</span>
                  {pkg.popular && <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#111] text-white font-semibold">Popular</span>}
                  {pkg.bestValue && <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#7B61FF] text-white font-semibold">Best value</span>}
                </div>
                <p className="text-xs text-[#999] mt-0.5">&#8377;{(pkg.priceINR / pkg.coins).toFixed(1)}/coin</p>
              </div>
              <button
                onClick={() => handlePurchase(pkg)}
                disabled={purchasing === pkg.id}
                className={`px-5 py-2 rounded-lg text-sm font-semibold cursor-pointer transition-all disabled:opacity-50 ${
                  purchased === pkg.id
                    ? "bg-green-50 text-green-600 border border-green-200"
                    : pkg.popular
                    ? "bg-[#111] text-white hover:bg-[#333]"
                    : "bg-[#FAFAFA] text-[#111] border border-[#EAEAEA] hover:border-[#CCC]"
                }`}
              >
                {purchased === pkg.id ? <><Check className="w-3 h-3 inline" /> Added</> : purchasing === pkg.id ? "..." : `₹${pkg.priceINR}`}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Ledger */}
      <div>
        <p className="text-xs font-semibold text-[#999] uppercase tracking-wider mb-3">History</p>
        <div className="bg-white rounded-2xl border border-[#EAEAEA] divide-y divide-[#F5F5F5]">
          {ledger.map((entry, i) => (
            <div key={i} className="px-5 py-3 flex items-center justify-between">
              <span className="text-sm text-[#555]">{entry.label}</span>
              <span className={`text-sm font-semibold ${entry.type === "credit" ? "text-green-600" : "text-red-500"}`}>
                {entry.type === "credit" ? "+" : "-"}{entry.amount}
              </span>
            </div>
          ))}
          {ledger.length === 0 && (
            <div className="px-5 py-8 text-center text-sm text-[#CCC]">No transactions yet</div>
          )}
        </div>
      </div>

      {/* What coins buy */}
      <div className="bg-white rounded-2xl border border-[#EAEAEA] p-5">
        <p className="text-xs font-semibold text-[#999] uppercase tracking-wider mb-3">Pricing</p>
        <div className="space-y-2.5">
          {[
            { action: "Generate 3 tracks", cost: 6 },
            { action: "Share full link", cost: 10 },
            { action: "Download HD audio", cost: 19 },
            { action: "Full pack (share + download)", cost: 29 },
          ].map((item) => (
            <div key={item.action} className="flex items-center justify-between text-sm">
              <span className="text-[#555]">{item.action}</span>
              <span className="font-semibold text-[#111]">{item.cost} coins</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
