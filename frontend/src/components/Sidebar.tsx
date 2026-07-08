"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Receipt,
  Settings,
  MessageSquare,
  TrendingUp,
  FileCheck,
  ShieldAlert
} from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();

  // Determine role prefix dynamically from current path
  let rolePrefix = "";
  let role = "merchant";

  if (pathname.startsWith("/merchant")) {
    rolePrefix = "/merchant";
    role = "merchant";
  } else if (pathname.startsWith("/admin")) {
    rolePrefix = "/admin";
    role = "admin";
  } else if (pathname.startsWith("/analyst")) {
    rolePrefix = "/analyst";
    role = "analyst";
  }

  // Define dynamic menu items based on role
  let menuItems = [];

  if (role === "merchant") {
    menuItems = [
      { name: "Overview", href: `${rolePrefix}/dashboard`, icon: LayoutDashboard },
      { name: "Transactions", href: `${rolePrefix}/transactions`, icon: Receipt },
      { name: "KYC Upload", href: `${rolePrefix}/kyc`, icon: FileCheck },
      { name: "AI Copilot", href: `${rolePrefix}/copilot`, icon: MessageSquare },
      { name: "ML Forecasting", href: `${rolePrefix}/forecast`, icon: TrendingUp },
    ];
  } else if (role === "analyst") {
    menuItems = [
      { name: "KYC Review Queue", href: `${rolePrefix}/dashboard`, icon: FileCheck },
      { name: "Transactions Log", href: `${rolePrefix}/transactions`, icon: Receipt },
    ];
  } else {
    menuItems = [
      { name: "System Dashboard", href: `${rolePrefix}/dashboard`, icon: LayoutDashboard },
    ];
  }

  return (
    <aside className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 glass-sidebar text-slate-600 dark:text-slate-300 transition-all duration-300 z-30">
      <nav className="flex flex-col gap-1.5 p-4">
        <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-4 mb-2">
          {role.charAt(0).toUpperCase() + role.slice(1)} Workspace
        </div>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 hover:bg-slate-50 dark:hover:bg-slate-900/60 hover:text-slate-900 dark:hover:text-white group ${
                isActive
                  ? "bg-indigo-50/50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400 border-l-2 border-indigo-500"
                  : ""
              }`}
            >
              <Icon className={`h-4.5 w-4.5 transition-transform duration-200 group-hover:scale-110 ${
                isActive ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400 dark:text-slate-500"
              }`} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
