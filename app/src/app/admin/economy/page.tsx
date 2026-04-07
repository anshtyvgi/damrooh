"use client";

import { useEffect, useState } from "react";

interface Transaction {
  id: string;
  userName: string;
  coins: number;
  amount: number;
  type: "purchase" | "spend" | "refund" | "bonus";
  source: string;
  status: string;
  createdAt: string;
}

interface Pricing {
  generateCost: number;
  unlockCost: number;
  downloadCost: number;
  bundleCost: number;
  freeCoins: number;
}

const typeStyles: Record<string, string> = {
  purchase: "bg-green-50 text-green-600 border border-green-200",
  spend: "bg-red-50 text-red-600 border border-red-200",
  refund: "bg-blue-50 text-blue-600 border border-blue-200",
  bonus: "bg-amber-50 text-amber-600 border border-amber-200",
};

export default function AdminEconomyPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [pricing, setPricing] = useState<Pricing>({ generateCost: 0, unlockCost: 0, downloadCost: 0, bundleCost: 0, freeCoins: 0 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/admin?module=transactions").then((r) => r.json()),
      fetch("/api/admin?module=pricing").then((r) => r.json()),
    ]).then(([txData, prData]) => {
      setTransactions(txData.transactions ?? txData);
      setPricing(prData.pricing ?? prData);
    }).finally(() => setLoading(false));
  }, []);

  const savePricing = async () => {
    setSaving(true);
    setSaved(false);
    try {
      await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update_pricing", pricing }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-sm text-[#999]">Loading...</div>;

  const pricingFields: { key: keyof Pricing; label: string }[] = [
    { key: "generateCost", label: "Generate Cost" },
    { key: "unlockCost", label: "Unlock Cost" },
    { key: "downloadCost", label: "Download Cost" },
    { key: "bundleCost", label: "Bundle Cost" },
    { key: "freeCoins", label: "Free Coins (signup)" },
  ];

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-lg font-bold text-[#111]">Economy</h1>

      {/* Pricing config */}
      <div className="bg-white rounded-xl border border-[#EAEAEA] p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-[#111]">Pricing Configuration</h2>
          <div className="flex items-center gap-2">
            {saved && <span className="text-xs text-green-600 font-medium">Saved</span>}
            <button
              onClick={savePricing}
              disabled={saving}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#111] text-white hover:bg-[#333] transition-colors disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save changes"}
            </button>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          {pricingFields.map((f) => (
            <div key={f.key}>
              <label className="block text-[11px] font-medium text-[#999] mb-1.5">{f.label}</label>
              <input
                type="number"
                value={pricing[f.key]}
                onChange={(e) => setPricing((p) => ({ ...p, [f.key]: Number(e.target.value) }))}
                className="w-full px-3 py-2 text-sm border border-[#EAEAEA] rounded-lg bg-[#FAFAFA] text-[#111] focus:outline-none focus:border-[#CCC] transition-colors"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Transactions */}
      <div className="bg-white rounded-xl border border-[#EAEAEA] overflow-hidden">
        <div className="px-4 py-3 border-b border-[#F0F0F0] flex items-center justify-between">
          <h2 className="text-sm font-semibold text-[#111]">Transactions</h2>
          <span className="text-xs text-[#999]">{transactions.length} total</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#F0F0F0] text-left">
                <th className="px-4 py-3 text-[11px] font-semibold text-[#999] uppercase tracking-wide">User</th>
                <th className="px-4 py-3 text-[11px] font-semibold text-[#999] uppercase tracking-wide text-right">Coins</th>
                <th className="px-4 py-3 text-[11px] font-semibold text-[#999] uppercase tracking-wide text-right">Amount</th>
                <th className="px-4 py-3 text-[11px] font-semibold text-[#999] uppercase tracking-wide">Type</th>
                <th className="px-4 py-3 text-[11px] font-semibold text-[#999] uppercase tracking-wide">Source</th>
                <th className="px-4 py-3 text-[11px] font-semibold text-[#999] uppercase tracking-wide">Status</th>
                <th className="px-4 py-3 text-[11px] font-semibold text-[#999] uppercase tracking-wide">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F5F5F5]">
              {transactions.map((t) => (
                <tr key={t.id} className="hover:bg-[#FAFAFA] transition-colors">
                  <td className="px-4 py-3 text-[#111] font-medium">{t.userName}</td>
                  <td className={`px-4 py-3 text-right font-semibold ${t.coins > 0 ? "text-green-600" : "text-red-500"}`}>
                    {t.coins > 0 ? "+" : ""}{t.coins}
                  </td>
                  <td className="px-4 py-3 text-right text-[#666]">{t.amount > 0 ? `₹${t.amount}` : "-"}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold capitalize ${typeStyles[t.type] ?? "bg-gray-50 text-gray-600 border border-gray-200"}`}>
                      {t.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[#666] capitalize">{t.source}</td>
                  <td className="px-4 py-3 text-[#666] capitalize">{t.status}</td>
                  <td className="px-4 py-3 text-[#999] text-xs">{new Date(t.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
              {transactions.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-sm text-[#999]">No transactions found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
