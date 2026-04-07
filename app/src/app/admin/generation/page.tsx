"use client";

import { useEffect, useState } from "react";

interface Job {
  id: string;
  prompt: string;
  userName: string;
  status: "queued" | "running" | "completed" | "failed";
  cost: number;
  createdAt: string;
  completedAt: string | null;
}

const statusStyles: Record<string, string> = {
  queued: "bg-gray-50 text-gray-600 border border-gray-200",
  running: "bg-blue-50 text-blue-600 border border-blue-200",
  completed: "bg-green-50 text-green-600 border border-green-200",
  failed: "bg-red-50 text-red-600 border border-red-200",
};

export default function AdminGenerationPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<string | null>(null);

  const fetchJobs = () => {
    setLoading(true);
    fetch("/api/admin?module=jobs")
      .then((r) => r.json())
      .then((d) => setJobs(d.jobs ?? d))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchJobs(); }, []);

  const postAction = async (action: string, jobId: string) => {
    setActing(jobId);
    try {
      await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, jobId }),
      });
      fetchJobs();
    } finally {
      setActing(null);
    }
  };

  if (loading) return <div className="p-8 text-sm text-[#999]">Loading...</div>;

  const counts = {
    queued: jobs.filter((j) => j.status === "queued").length,
    running: jobs.filter((j) => j.status === "running").length,
    completed: jobs.filter((j) => j.status === "completed").length,
    failed: jobs.filter((j) => j.status === "failed").length,
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-[#111]">Generation Jobs</h1>
        <span className="text-xs text-[#999]">{jobs.length} total</span>
      </div>

      <div className="flex gap-3">
        {(["queued", "running", "completed", "failed"] as const).map((s) => (
          <div key={s} className="bg-white rounded-xl border border-[#EAEAEA] px-4 py-3 flex-1">
            <p className="text-[11px] text-[#999] font-medium capitalize mb-1">{s}</p>
            <p className="text-xl font-bold text-[#111]">{counts[s]}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-[#EAEAEA] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#F0F0F0] text-left">
                <th className="px-4 py-3 text-[11px] font-semibold text-[#999] uppercase tracking-wide">Prompt</th>
                <th className="px-4 py-3 text-[11px] font-semibold text-[#999] uppercase tracking-wide">User</th>
                <th className="px-4 py-3 text-[11px] font-semibold text-[#999] uppercase tracking-wide">Status</th>
                <th className="px-4 py-3 text-[11px] font-semibold text-[#999] uppercase tracking-wide text-right">Cost</th>
                <th className="px-4 py-3 text-[11px] font-semibold text-[#999] uppercase tracking-wide">Created</th>
                <th className="px-4 py-3 text-[11px] font-semibold text-[#999] uppercase tracking-wide">Completed</th>
                <th className="px-4 py-3 text-[11px] font-semibold text-[#999] uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F5F5F5]">
              {jobs.map((j) => (
                <tr key={j.id} className="hover:bg-[#FAFAFA] transition-colors">
                  <td className="px-4 py-3 font-medium text-[#111] max-w-[250px] truncate">{j.prompt}</td>
                  <td className="px-4 py-3 text-[#666]">{j.userName}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold capitalize ${statusStyles[j.status]}`}>
                      {j.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-[#666]">{j.cost} coins</td>
                  <td className="px-4 py-3 text-[#999] text-xs">{new Date(j.createdAt).toLocaleString()}</td>
                  <td className="px-4 py-3 text-[#999] text-xs">{j.completedAt ? new Date(j.completedAt).toLocaleString() : "-"}</td>
                  <td className="px-4 py-3">
                    {j.status === "failed" && (
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => postAction("retry_job", j.id)}
                          disabled={acting === j.id}
                          className="px-2.5 py-1 text-[11px] font-medium rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors disabled:opacity-50"
                        >
                          Retry
                        </button>
                        <button
                          onClick={() => postAction("refund_job", j.id)}
                          disabled={acting === j.id}
                          className="px-2.5 py-1 text-[11px] font-medium rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-100 transition-colors disabled:opacity-50"
                        >
                          Refund
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {jobs.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-sm text-[#999]">No jobs found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
