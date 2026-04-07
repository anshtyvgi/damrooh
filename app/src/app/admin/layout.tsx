"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, Music, Cpu, Coins, Shield, BarChart3, Settings, ChevronLeft } from "lucide-react";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/content", label: "Content", icon: Music },
  { href: "/admin/generation", label: "Generation", icon: Cpu },
  { href: "/admin/economy", label: "Economy", icon: Coins },
  { href: "/admin/moderation", label: "Moderation", icon: Shield },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[#F7F7F8] flex">
      {/* Sidebar */}
      <aside className="w-[220px] shrink-0 bg-white border-r border-[#EAEAEA] h-screen sticky top-0 flex flex-col">
        <div className="h-14 flex items-center justify-between px-4 border-b border-[#EAEAEA]">
          <span className="text-sm font-extrabold text-[#111]">damrooh admin</span>
          <Link href="/create" className="w-7 h-7 rounded-lg bg-[#FAFAFA] border border-[#EAEAEA] flex items-center justify-center text-[#999] hover:text-[#111] hover:border-[#CCC] transition-colors cursor-pointer">
            <ChevronLeft className="w-3.5 h-3.5" />
          </Link>
        </div>
        <nav className="flex-1 py-3 px-2 space-y-0.5">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
            return (
              <Link key={item.href} href={item.href}>
                <div className={`flex items-center gap-3 px-3 h-9 rounded-lg text-sm transition-colors ${isActive ? "bg-[#F5F5F5] text-[#111] font-semibold" : "text-[#888] hover:text-[#111] hover:bg-[#FAFAFA]"}`}>
                  <item.icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </div>
              </Link>
            );
          })}
        </nav>
        <div className="px-4 py-3 border-t border-[#EAEAEA]">
          <p className="text-[10px] text-[#CCC]">Damrooh Admin v1.0</p>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
