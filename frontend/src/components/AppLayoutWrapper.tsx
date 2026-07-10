"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";

export default function AppLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Pages that should be 100% full-screen without desktop Sidebar/Navbar
  const isFullScreenPage =
    pathname?.startsWith("/mock-upi-pay") ||
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/";

  if (isFullScreenPage) {
    return (
      <main className="w-full min-h-screen bg-slate-50 dark:bg-[#07090e] text-slate-900 dark:text-slate-100 transition-colors duration-300">
        {children}
      </main>
    );
  }

  return (
    <>
      <Navbar onMenuToggle={() => setIsMobileOpen(!isMobileOpen)} />
      <div className="flex">
        <Sidebar isOpen={isMobileOpen} onClose={() => setIsMobileOpen(false)} />
        <main className="ml-0 lg:ml-64 w-full lg:w-[calc(100vw-16rem)] p-4 lg:p-8">
          {children}
        </main>
      </div>
    </>
  );
}
