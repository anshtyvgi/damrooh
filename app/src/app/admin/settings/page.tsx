"use client";

import { useState } from "react";

export default function AdminSettingsPage() {
  const [maxParallelJobs, setMaxParallelJobs] = useState(3);
  const [priorityQueue, setPriorityQueue] = useState(false);
  const [fallbackModel, setFallbackModel] = useState("suno-v3-fallback");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-[#111]">Settings</h1>
        <div className="flex items-center gap-2">
          {saved && <span className="text-xs text-green-600 font-medium">Settings saved</span>}
          <button
            onClick={handleSave}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#111] text-white hover:bg-[#333] transition-colors"
          >
            Save changes
          </button>
        </div>
      </div>

      {/* Generation Limits */}
      <div className="bg-white rounded-xl border border-[#EAEAEA] p-5 space-y-5">
        <h2 className="text-sm font-semibold text-[#111]">Generation Limits</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-[11px] font-medium text-[#999] mb-1.5">Max Parallel Jobs</label>
            <input
              type="number"
              min={1}
              max={50}
              value={maxParallelJobs}
              onChange={(e) => setMaxParallelJobs(Number(e.target.value))}
              className="w-full px-3 py-2 text-sm border border-[#EAEAEA] rounded-lg bg-[#FAFAFA] text-[#111] focus:outline-none focus:border-[#CCC] transition-colors"
            />
            <p className="text-[11px] text-[#BBB] mt-1">Number of generation jobs that can run simultaneously.</p>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-[#999] mb-1.5">Priority Queue</label>
            <button
              onClick={() => setPriorityQueue((v) => !v)}
              className={`relative w-11 h-6 rounded-full transition-colors ${priorityQueue ? "bg-[#111]" : "bg-[#DDD]"}`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${priorityQueue ? "translate-x-5" : "translate-x-0"}`}
              />
            </button>
            <p className="text-[11px] text-[#BBB] mt-1">
              {priorityQueue ? "Enabled" : "Disabled"} — prioritize paid users in the generation queue.
            </p>
          </div>
        </div>
      </div>

      {/* Fallback Settings */}
      <div className="bg-white rounded-xl border border-[#EAEAEA] p-5 space-y-5">
        <h2 className="text-sm font-semibold text-[#111]">Fallback Settings</h2>

        <div className="max-w-md">
          <label className="block text-[11px] font-medium text-[#999] mb-1.5">Fallback Model</label>
          <input
            type="text"
            value={fallbackModel}
            onChange={(e) => setFallbackModel(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-[#EAEAEA] rounded-lg bg-[#FAFAFA] text-[#111] focus:outline-none focus:border-[#CCC] transition-colors"
          />
          <p className="text-[11px] text-[#BBB] mt-1">Model to use when the primary generation model is unavailable.</p>
        </div>
      </div>
    </div>
  );
}
