"use client";

import Link from "next/link";
import { CoinBadge } from "@/components/ui/CoinBadge";

export function Navbar() {
  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 px-6 py-4"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-accent flex items-center justify-center">
            <span className="text-black font-bold text-sm">D</span>
          </div>
          <span className="text-lg font-medium text-text font-[family-name:Poppins]">
            damrooh
          </span>
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-5">
          <Link href="/library">
            <span
              className="text-text-secondary hover:text-text hover:scale-105 transition-all text-sm cursor-pointer hidden sm:block"
            >
              Library
            </span>
          </Link>
          <Link href="/coins">
            <CoinBadge />
          </Link>
        </div>
      </div>
    </nav>
  );
}
