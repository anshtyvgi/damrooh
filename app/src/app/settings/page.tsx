"use client";

import { useStore } from "@/stores/useStore";
import { User, Bell, Lock, Palette, Globe, LogOut, ChevronRight, Moon, Sun } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function SettingsPage() {
  const { coins } = useStore();
  const [notifications, setNotifications] = useState(true);
  const [emailUpdates, setEmailUpdates] = useState(false);
  const [publicProfile, setPublicProfile] = useState(true);
  const [language, setLanguage] = useState("en");

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto pb-24 space-y-6">
      <h1 className="text-xl font-bold text-[#111]">Settings</h1>

      {/* Profile */}
      <div className="bg-white rounded-2xl border border-[#EAEAEA] divide-y divide-[#F5F5F5]">
        <div className="px-5 py-4">
          <p className="text-xs font-semibold text-[#999] uppercase tracking-wider mb-3">Profile</p>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#7B61FF] to-[#FF4D8D] flex items-center justify-center text-xl shrink-0">🎧</div>
            <div className="flex-1">
              <p className="text-sm font-bold text-[#111]">You</p>
              <p className="text-xs text-[#999]">Edit your profile</p>
            </div>
            <Link href="/profile">
              <div className="w-8 h-8 rounded-lg bg-[#FAFAFA] border border-[#EAEAEA] flex items-center justify-center text-[#999] hover:text-[#111] hover:border-[#CCC] transition-colors cursor-pointer">
                <ChevronRight className="w-4 h-4" />
              </div>
            </Link>
          </div>
        </div>

        <div className="px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Globe className="w-4 h-4 text-[#999]" />
            <span className="text-sm text-[#111]">Public profile</span>
          </div>
          <Toggle checked={publicProfile} onChange={setPublicProfile} />
        </div>
      </div>

      {/* Account */}
      <div className="bg-white rounded-2xl border border-[#EAEAEA] divide-y divide-[#F5F5F5]">
        <div className="px-5 py-3">
          <p className="text-xs font-semibold text-[#999] uppercase tracking-wider">Account</p>
        </div>

        <div className="px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <User className="w-4 h-4 text-[#999]" />
            <div>
              <p className="text-sm text-[#111]">Email</p>
              <p className="text-xs text-[#999]">you@example.com</p>
            </div>
          </div>
          <button className="text-xs text-[#7B61FF] font-semibold cursor-pointer hover:underline">Change</button>
        </div>

        <div className="px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Lock className="w-4 h-4 text-[#999]" />
            <span className="text-sm text-[#111]">Password</span>
          </div>
          <button className="text-xs text-[#7B61FF] font-semibold cursor-pointer hover:underline">Update</button>
        </div>

        <div className="px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm">🪙</span>
            <div>
              <p className="text-sm text-[#111]">Coins</p>
              <p className="text-xs text-[#999]">{coins} coins remaining</p>
            </div>
          </div>
          <Link href="/coins">
            <button className="px-3 py-1.5 rounded-lg bg-[#FAFAFA] border border-[#EAEAEA] text-xs font-semibold text-[#111] hover:border-[#CCC] transition-colors cursor-pointer">Buy more</button>
          </Link>
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-white rounded-2xl border border-[#EAEAEA] divide-y divide-[#F5F5F5]">
        <div className="px-5 py-3">
          <p className="text-xs font-semibold text-[#999] uppercase tracking-wider">Notifications</p>
        </div>

        <div className="px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bell className="w-4 h-4 text-[#999]" />
            <span className="text-sm text-[#111]">Push notifications</span>
          </div>
          <Toggle checked={notifications} onChange={setNotifications} />
        </div>

        <div className="px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bell className="w-4 h-4 text-[#999]" />
            <span className="text-sm text-[#111]">Email updates</span>
          </div>
          <Toggle checked={emailUpdates} onChange={setEmailUpdates} />
        </div>
      </div>

      {/* Preferences */}
      <div className="bg-white rounded-2xl border border-[#EAEAEA] divide-y divide-[#F5F5F5]">
        <div className="px-5 py-3">
          <p className="text-xs font-semibold text-[#999] uppercase tracking-wider">Preferences</p>
        </div>

        <div className="px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Globe className="w-4 h-4 text-[#999]" />
            <span className="text-sm text-[#111]">Language</span>
          </div>
          <select value={language} onChange={(e) => setLanguage(e.target.value)}
            className="text-xs text-[#111] bg-[#FAFAFA] border border-[#EAEAEA] rounded-lg px-3 py-1.5 cursor-pointer focus:outline-none">
            <option value="en">English</option>
            <option value="hi">Hindi</option>
            <option value="pa">Punjabi</option>
          </select>
        </div>

        <div className="px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Palette className="w-4 h-4 text-[#999]" />
            <span className="text-sm text-[#111]">Default genre</span>
          </div>
          <span className="text-xs text-[#999]">Bollywood</span>
        </div>

        <div className="px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Sun className="w-4 h-4 text-[#999]" />
            <span className="text-sm text-[#111]">Theme</span>
          </div>
          <span className="text-xs text-[#999]">Light</span>
        </div>
      </div>

      {/* Danger zone */}
      <div className="bg-white rounded-2xl border border-[#EAEAEA] divide-y divide-[#F5F5F5]">
        <button className="w-full px-5 py-3 flex items-center gap-3 text-left cursor-pointer hover:bg-[#FAFAFA] transition-colors">
          <LogOut className="w-4 h-4 text-red-500" />
          <span className="text-sm text-red-500 font-medium">Sign out</span>
        </button>
      </div>

      <p className="text-center text-[10px] text-[#CCC]">Damrooh v1.0 · Made with feeling</p>
    </div>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!checked)}
      className={`w-10 h-6 rounded-full transition-colors cursor-pointer relative ${checked ? "bg-[#111]" : "bg-[#DDD]"}`}>
      <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all shadow-sm ${checked ? "left-5" : "left-1"}`} />
    </button>
  );
}
