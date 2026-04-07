"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Music, Library, Compass, Coins, Settings, PanelLeftClose, PanelLeft } from "lucide-react";
import { useStore } from "@/stores/useStore";
import { useState } from "react";

const navItems = [
  { href: "/create", label: "Create", icon: Music },
  { href: "/explore", label: "Explore", icon: Compass },
  { href: "/library", label: "Library", icon: Library },
];

const bottomItems = [
  { href: "/coins", label: "Coins", icon: Coins },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const coins = useStore((s) => s.coins);
  const [open, setOpen] = useState(false);

  return (
    <aside className={`hidden lg:flex flex-col h-screen fixed left-0 top-0 z-40 bg-white border-r border-[#EAEAEA] transition-[width] duration-300 ease-in-out ${open ? "w-[200px]" : "w-[60px]"}`}>
      <div className={`h-14 flex items-center border-b border-[#EAEAEA] ${open ? "px-4 justify-between" : "justify-center"}`}>
        {open && <Link href="/" className="flex items-center gap-2"><span className="text-base font-extrabold text-[#111]">damrooh</span></Link>}
        <button onClick={() => setOpen(!open)} className="w-8 h-8 rounded-lg flex items-center justify-center text-[#999] hover:text-[#111] hover:bg-[#F5F5F5] transition-colors cursor-pointer">
          {open ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeft className="w-4 h-4" />}
        </button>
      </div>
      <nav className="flex-1 py-3 space-y-0.5 px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link key={item.href} href={item.href}>
              <div className={`flex items-center gap-3 rounded-lg transition-colors h-9 ${open ? "px-3" : "justify-center"} ${isActive ? "bg-[#F5F5F5] text-[#111] font-semibold" : "text-[#888] hover:text-[#111] hover:bg-[#FAFAFA]"}`}>
                <item.icon className="w-[18px] h-[18px] shrink-0" />
                {open && <span className="text-sm">{item.label}</span>}
              </div>
            </Link>
          );
        })}
      </nav>
      <div className="py-3 border-t border-[#EAEAEA] space-y-0.5 px-2">
        {bottomItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <div className={`flex items-center gap-3 rounded-lg transition-colors h-9 ${open ? "px-3" : "justify-center"} ${isActive ? "bg-[#F5F5F5] text-[#111] font-semibold" : "text-[#888] hover:text-[#111] hover:bg-[#FAFAFA]"}`}>
                <item.icon className="w-[18px] h-[18px] shrink-0" />
                {open && <span className="text-sm">{item.label}</span>}
              </div>
            </Link>
          );
        })}
        <div className={`mt-2 rounded-lg bg-[#FAFAFA] border border-[#EAEAEA] ${open ? "px-3 py-2.5" : "py-2.5 flex flex-col items-center"}`}>
          <div className={`flex items-center ${open ? "gap-2" : "flex-col gap-0.5"}`}>
            <span className="text-sm">🪙</span>
            <span className="text-xs font-bold text-[#111]">{coins}</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
