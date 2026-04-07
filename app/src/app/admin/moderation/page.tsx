"use client";

import { useEffect, useState } from "react";

interface Report {
  id: string;
  songTitle: string;
  reportedBy: string;
  reason: string;
  status: "pending" | "dismissed" | "removed";
  createdAt: string;
}

const statusStyles: Record<string, string> = {
  pending: "bg-amber-50 text-amber-600 border border-amber-200",
  dismissed: "bg-gray-50 text-gray-600 border border-gray-200",
  removed: "bg-red-50 text-red-600 border border-red-200",
};

export default function AdminModerationPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<string | null>(null);

  const fetchReports = () => {
    setLoading(true);
    fetch("/api/admin?module=reports")
      .then((r) => r.json())
      .then((d) => setReports(d.reports ?? d))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchReports(); }, []);

  const resolve = async (reportId: string, resolution: "dismiss" | "remove") => {
    setActing(reportId);
    try {
      await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "resolve_report", reportId, resolution }),
      });
      fetchReports();
    } finally {
      setActing(null);
    }
  };

  if (loading) return <div className="p-8 text-sm text-[#999]">Loading...</div>;

  const pending = reports.filter((r) => r.status === "pending").length;

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-bold text-[#111]">Moderation</h1>
          {pending > 0 && (
            <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-amber-50 text-amber-600 border border-amber-200">
              {pending} pending
            </span>
          )}
        </div>
        <span className="text-xs text-[#999]">{reports.length} reports</span>
      </div>

      <div className="bg-white rounded-xl border border-[#EAEAEA] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#F0F0F0] text-left">
                <th className="px-4 py-3 text-[11px] font-semibold text-[#999] uppercase tracking-wide">Song Title</th>
                <th className="px-4 py-3 text-[11px] font-semibold text-[#999] uppercase tracking-wide">Reported By</th>
                <th className="px-4 py-3 text-[11px] font-semibold text-[#999] uppercase tracking-wide">Reason</th>
                <th className="px-4 py-3 text-[11px] font-semibold text-[#999] uppercase tracking-wide">Status</th>
                <th className="px-4 py-3 text-[11px] font-semibold text-[#999] uppercase tracking-wide">Date</th>
                <th className="px-4 py-3 text-[11px] font-semibold text-[#999] uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F5F5F5]">
              {reports.map((r) => (
                <tr key={r.id} className="hover:bg-[#FAFAFA] transition-colors">
                  <td className="px-4 py-3 font-medium text-[#111] max-w-[200px] truncate">{r.songTitle}</td>
                  <td className="px-4 py-3 text-[#666]">{r.reportedBy}</td>
                  <td className="px-4 py-3 text-[#666] max-w-[250px] truncate">{r.reason}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold capitalize ${statusStyles[r.status]}`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[#999] text-xs">{new Date(r.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    {r.status === "pending" && (
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => resolve(r.id, "dismiss")}
                          disabled={acting === r.id}
                          className="px-2.5 py-1 text-[11px] font-medium rounded-lg bg-[#F5F5F5] text-[#555] hover:bg-[#EAEAEA] transition-colors disabled:opacity-50"
                        >
                          Dismiss
                        </button>
                        <button
                          onClick={() => resolve(r.id, "remove")}
                          disabled={acting === r.id}
                          className="px-2.5 py-1 text-[11px] font-medium rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors disabled:opacity-50"
                        >
                          Remove song
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {reports.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-sm text-[#999]">No reports found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
