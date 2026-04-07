"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Music, Library, Compass, Coins, Settings } from "lucide-react";

const navItems = [
  { href: "/create", label: "Create", icon: Music },
  { href: "/explore", label: "Explore", icon: Compass },
  { href: "/library", label: "Library", icon: Library },
  { href: "/coins", label: "Coins", icon: Coins },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function BottomNav() {
  const pathname = usePathname();
  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#EAEAEA]">
      <div className="flex items-center justify-around px-1 pb-[env(safe-area-inset-bottom)] h-14">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link key={item.href} href={item.href} className="flex-1">
              <div className="flex flex-col items-center gap-0.5 py-1">
                <item.icon className={`w-5 h-5 ${isActive ? "text-[#111]" : "text-[#BBB]"}`} />
                <span className={`text-[10px] ${isActive ? "text-[#111] font-semibold" : "text-[#BBB]"}`}>{item.label}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
