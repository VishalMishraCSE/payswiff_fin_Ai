"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";

export default function AppLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Pages that should be 100% full-screen without desktop Sidebar/Navbar
  const isFullScreenPage =
    pathname?.startsWith("/mock-upi-pay") ||
    pathname === "/login" ||
    pathname === "/register";

  if (isFullScreenPage) {
    return (
      <main className="w-full min-h-screen bg-slate-50 dark:bg-[#07090e] text-slate-900 dark:text-slate-100 transition-colors duration-300">
        {children}
      </main>
    );
  }

  return (
    <>
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="ml-64 w-[calc(100vw-16rem)] p-8">
          {children}
        </main>
      </div>
    </>
  );
}
