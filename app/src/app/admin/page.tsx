"use client";

import { useEffect, useState } from "react";
import { Users, Music, Coins, AlertTriangle, TrendingUp, Clock } from "lucide-react";

interface DashboardData {
  totalUsers: number; activeUsers: number; totalSongs: number; totalRevenue: number;
  totalCoinsSpent: number; failedJobs: number; queuedJobs: number; pendingReports: number;
  conversionRate: number; avgCoinsPerUser: number;
  recentTransactions: { id: string; userName: string; coins: number; type: string; source: string; createdAt: string }[];
  recentJobs: { id: string; userName: string; prompt: string; status: string; createdAt: string }[];
}

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    fetch("/api/admin?module=dashboard").then((r) => r.json()).then(setData);
  }, []);

  if (!data) return <div className="p-8 text-sm text-[#999]">Loading...</div>;

  const stats = [
    { label: "Total Users", value: data.totalUsers, icon: Users, color: "text-blue-600 bg-blue-50" },
    { label: "Active Users", value: data.activeUsers, icon: Users, color: "text-green-600 bg-green-50" },
    { label: "Total Songs", value: data.totalSongs, icon: Music, color: "text-violet-600 bg-violet-50" },
    { label: "Revenue (INR)", value: `₹${data.totalRevenue}`, icon: Coins, color: "text-amber-600 bg-amber-50" },
    { label: "Conversion Rate", value: `${data.conversionRate}%`, icon: TrendingUp, color: "text-emerald-600 bg-emerald-50" },
    { label: "Avg Coins/User", value: data.avgCoinsPerUser, icon: Coins, color: "text-indigo-600 bg-indigo-50" },
    { label: "Queue", value: data.queuedJobs, icon: Clock, color: "text-sky-600 bg-sky-50" },
    { label: "Failed Jobs", value: data.failedJobs, icon: AlertTriangle, color: data.failedJobs > 0 ? "text-red-600 bg-red-50" : "text-gray-600 bg-gray-50" },
  ];

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-lg font-bold text-[#111]">Dashboard</h1>

      {/* Alerts */}
      {(data.failedJobs > 0 || data.pendingReports > 0) && (
        <div className="flex gap-3">
          {data.failedJobs > 0 && (
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
              <AlertTriangle className="w-4 h-4" /> {data.failedJobs} failed generation job{data.failedJobs > 1 ? "s" : ""}
            </div>
          )}
          {data.pendingReports > 0 && (
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-50 border border-amber-200 text-sm text-amber-700">
              <AlertTriangle className="w-4 h-4" /> {data.pendingReports} pending report{data.pendingReports > 1 ? "s" : ""}
            </div>
          )}
        </div>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-[#EAEAEA] p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-[#999] font-medium">{s.label}</span>
              <div className={`w-7 h-7 rounded-lg ${s.color} flex items-center justify-center`}>
                <s.icon className="w-3.5 h-3.5" />
              </div>
            </div>
            <p className="text-xl font-bold text-[#111]">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent transactions */}
        <div className="bg-white rounded-xl border border-[#EAEAEA]">
          <div className="px-4 py-3 border-b border-[#F0F0F0]">
            <p className="text-sm font-semibold text-[#111]">Recent Transactions</p>
          </div>
          <div className="divide-y divide-[#F5F5F5]">
            {data.recentTransactions.map((t) => (
              <div key={t.id} className="px-4 py-2.5 flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#111]">{t.userName}</p>
                  <p className="text-[11px] text-[#999] capitalize">{t.type} · {t.source}</p>
                </div>
                <span className={`text-sm font-semibold ${t.coins > 0 ? "text-green-600" : "text-red-500"}`}>
                  {t.coins > 0 ? "+" : ""}{t.coins}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent jobs */}
        <div className="bg-white rounded-xl border border-[#EAEAEA]">
          <div className="px-4 py-3 border-b border-[#F0F0F0]">
            <p className="text-sm font-semibold text-[#111]">Recent Jobs</p>
          </div>
          <div className="divide-y divide-[#F5F5F5]">
            {data.recentJobs.map((j) => (
              <div key={j.id} className="px-4 py-2.5 flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#111] truncate max-w-[200px]">{j.prompt}</p>
                  <p className="text-[11px] text-[#999]">{j.userName}</p>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                  j.status === "completed" ? "bg-green-50 text-green-600 border border-green-200" :
                  j.status === "failed" ? "bg-red-50 text-red-600 border border-red-200" :
                  j.status === "running" ? "bg-blue-50 text-blue-600 border border-blue-200" :
                  "bg-gray-50 text-gray-600 border border-gray-200"
                }`}>{j.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
