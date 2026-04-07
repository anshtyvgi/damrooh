"use client";

import { useEffect, useState } from "react";

interface Song {
  id: string;
  title: string;
  userName: string;
  category: string;
  status: "preview" | "unlocked" | "featured" | "deleted";
  plays: number;
  shares: number;
  completionRate: number;
  createdAt: string;
}

const statusStyles: Record<string, string> = {
  preview: "bg-gray-50 text-gray-600 border border-gray-200",
  unlocked: "bg-green-50 text-green-600 border border-green-200",
  featured: "bg-violet-50 text-violet-600 border border-violet-200",
  deleted: "bg-red-50 text-red-600 border border-red-200",
};

export default function AdminContentPage() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<string | null>(null);

  const fetchSongs = () => {
    setLoading(true);
    fetch("/api/admin?module=songs")
      .then((r) => r.json())
      .then((d) => setSongs(d.songs ?? d))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchSongs(); }, []);

  const postAction = async (action: string, songId: string) => {
    setActing(songId);
    try {
      await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, songId }),
      });
      fetchSongs();
    } finally {
      setActing(null);
    }
  };

  if (loading) return <div className="p-8 text-sm text-[#999]">Loading...</div>;

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-[#111]">Content</h1>
        <span className="text-xs text-[#999]">{songs.length} songs</span>
      </div>

      <div className="bg-white rounded-xl border border-[#EAEAEA] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#F0F0F0] text-left">
                <th className="px-4 py-3 text-[11px] font-semibold text-[#999] uppercase tracking-wide">Title</th>
                <th className="px-4 py-3 text-[11px] font-semibold text-[#999] uppercase tracking-wide">User</th>
                <th className="px-4 py-3 text-[11px] font-semibold text-[#999] uppercase tracking-wide">Category</th>
                <th className="px-4 py-3 text-[11px] font-semibold text-[#999] uppercase tracking-wide">Status</th>
                <th className="px-4 py-3 text-[11px] font-semibold text-[#999] uppercase tracking-wide text-right">Plays</th>
                <th className="px-4 py-3 text-[11px] font-semibold text-[#999] uppercase tracking-wide text-right">Shares</th>
                <th className="px-4 py-3 text-[11px] font-semibold text-[#999] uppercase tracking-wide text-right">Completion</th>
                <th className="px-4 py-3 text-[11px] font-semibold text-[#999] uppercase tracking-wide">Created</th>
                <th className="px-4 py-3 text-[11px] font-semibold text-[#999] uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F5F5F5]">
              {songs.map((s) => (
                <tr key={s.id} className="hover:bg-[#FAFAFA] transition-colors">
                  <td className="px-4 py-3 font-medium text-[#111] max-w-[200px] truncate">{s.title}</td>
                  <td className="px-4 py-3 text-[#666]">{s.userName}</td>
                  <td className="px-4 py-3 text-[#666] capitalize">{s.category}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold capitalize ${statusStyles[s.status]}`}>
                      {s.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-[#666]">{s.plays}</td>
                  <td className="px-4 py-3 text-right text-[#666]">{s.shares}</td>
                  <td className="px-4 py-3 text-right text-[#666]">{s.completionRate}%</td>
                  <td className="px-4 py-3 text-[#999] text-xs">{new Date(s.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      {s.status !== "featured" && s.status !== "deleted" && (
                        <button
                          onClick={() => postAction("feature_song", s.id)}
                          disabled={acting === s.id}
                          className="px-2.5 py-1 text-[11px] font-medium rounded-lg bg-violet-50 text-violet-600 hover:bg-violet-100 transition-colors disabled:opacity-50"
                        >
                          Feature
                        </button>
                      )}
                      {s.status !== "deleted" && (
                        <button
                          onClick={() => postAction("remove_song", s.id)}
                          disabled={acting === s.id}
                          className="px-2.5 py-1 text-[11px] font-medium rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors disabled:opacity-50"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {songs.length === 0 && (
                <tr><td colSpan={9} className="px-4 py-12 text-center text-sm text-[#999]">No songs found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
