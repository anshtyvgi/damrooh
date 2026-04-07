"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { BottomNav } from "./BottomNav";
import { GlobalPlayer } from "@/components/player/GlobalPlayer";

const APP_ROUTES = ["/create", "/explore", "/library", "/community", "/coins", "/settings", "/profile"];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAppRoute = APP_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );

  if (!isAppRoute) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-[#F7F7F8]">
      <Sidebar />
      <main className="lg:ml-[60px] min-h-screen pb-32 lg:pb-16">
        <div className="max-w-[1200px] mx-auto">
          {children}
        </div>
      </main>
      <BottomNav />
      <GlobalPlayer />
    </div>
  );
}
