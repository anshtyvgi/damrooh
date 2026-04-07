"use client";

import { useEffect, useState } from "react";

interface User {
  id: string;
  name: string;
  email: string;
  coinsBalance: number;
  totalSpent: number;
  totalGenerated: number;
  status: "active" | "banned" | "shadow_banned";
  lastActive: string;
}

const statusStyles: Record<string, string> = {
  active: "bg-green-50 text-green-600 border border-green-200",
  banned: "bg-red-50 text-red-600 border border-red-200",
  shadow_banned: "bg-amber-50 text-amber-600 border border-amber-200",
};

const statusLabels: Record<string, string> = {
  active: "Active",
  banned: "Banned",
  shadow_banned: "Shadow Banned",
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<string | null>(null);

  const fetchUsers = () => {
    setLoading(true);
    fetch("/api/admin?module=users")
      .then((r) => r.json())
      .then((d) => setUsers(d.users ?? d))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, []);

  const postAction = async (action: string, userId: string, extra?: Record<string, unknown>) => {
    setActing(userId);
    try {
      await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, userId, ...extra }),
      });
      fetchUsers();
    } finally {
      setActing(null);
    }
  };

  const handleAddCoins = (user: User) => {
    const amount = prompt(`Add coins to ${user.name}.\nEnter amount:`);
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) return;
    postAction("add_coins", user.id, { amount: Number(amount) });
  };

  if (loading) return <div className="p-8 text-sm text-[#999]">Loading...</div>;

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-[#111]">Users</h1>
        <span className="text-xs text-[#999]">{users.length} total</span>
      </div>

      <div className="bg-white rounded-xl border border-[#EAEAEA] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#F0F0F0] text-left">
                <th className="px-4 py-3 text-[11px] font-semibold text-[#999] uppercase tracking-wide">Name</th>
                <th className="px-4 py-3 text-[11px] font-semibold text-[#999] uppercase tracking-wide">Email</th>
                <th className="px-4 py-3 text-[11px] font-semibold text-[#999] uppercase tracking-wide text-right">Coins</th>
                <th className="px-4 py-3 text-[11px] font-semibold text-[#999] uppercase tracking-wide text-right">Spent</th>
                <th className="px-4 py-3 text-[11px] font-semibold text-[#999] uppercase tracking-wide text-right">Generated</th>
                <th className="px-4 py-3 text-[11px] font-semibold text-[#999] uppercase tracking-wide">Status</th>
                <th className="px-4 py-3 text-[11px] font-semibold text-[#999] uppercase tracking-wide">Last Active</th>
                <th className="px-4 py-3 text-[11px] font-semibold text-[#999] uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F5F5F5]">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-[#FAFAFA] transition-colors">
                  <td className="px-4 py-3 font-medium text-[#111]">{u.name}</td>
                  <td className="px-4 py-3 text-[#666]">{u.email}</td>
                  <td className="px-4 py-3 text-right font-semibold text-[#111]">{u.coinsBalance}</td>
                  <td className="px-4 py-3 text-right text-[#666]">{u.totalSpent}</td>
                  <td className="px-4 py-3 text-right text-[#666]">{u.totalGenerated}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${statusStyles[u.status]}`}>
                      {statusLabels[u.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[#999] text-xs">{new Date(u.lastActive).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleAddCoins(u)}
                        disabled={acting === u.id}
                        className="px-2.5 py-1 text-[11px] font-medium rounded-lg bg-[#F5F5F5] text-[#555] hover:bg-[#EAEAEA] transition-colors disabled:opacity-50"
                      >
                        Add coins
                      </button>
                      {u.status === "banned" ? (
                        <button
                          onClick={() => postAction("unban_user", u.id)}
                          disabled={acting === u.id}
                          className="px-2.5 py-1 text-[11px] font-medium rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors disabled:opacity-50"
                        >
                          Unban
                        </button>
                      ) : (
                        <button
                          onClick={() => postAction("ban_user", u.id)}
                          disabled={acting === u.id}
                          className="px-2.5 py-1 text-[11px] font-medium rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors disabled:opacity-50"
                        >
                          Ban
                        </button>
                      )}
                      {u.status !== "shadow_banned" && (
                        <button
                          onClick={() => postAction("shadow_ban", u.id)}
                          disabled={acting === u.id}
                          className="px-2.5 py-1 text-[11px] font-medium rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-100 transition-colors disabled:opacity-50"
                        >
                          Shadow ban
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr><td colSpan={8} className="px-4 py-12 text-center text-sm text-[#999]">No users found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
