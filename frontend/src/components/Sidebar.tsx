"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Receipt, AlertTriangle, Settings, Users } from "lucide-react";



export default function Sidebar() {
  const pathname = usePathname();

  // Determine role prefix dynamically from current path
  let rolePrefix = "";
  if (pathname.startsWith("/merchant")) {
    rolePrefix = "/merchant";
  } else if (pathname.startsWith("/admin")) {
    rolePrefix = "/admin";
  } else if (pathname.startsWith("/analyst")) {
    rolePrefix = "/analyst";
  }

  const menuItems = [
    { name: "Dashboard", href: `${rolePrefix}/dashboard`, icon: LayoutDashboard },
    { name: "Transactions", href: `${rolePrefix}/transactions`, icon: Receipt },
    { name: "Fraud Alerts", href: `${rolePrefix}/alerts`, icon: AlertTriangle },
    { name: "Team Settings", href: `${rolePrefix}/settings`, icon: Settings },
  ];

  return (
    <aside className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 transition-colors duration-300">
      <nav className="flex flex-col gap-2 p-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white ${
                isActive ? "bg-slate-100 text-teal-600 dark:bg-slate-800 dark:text-teal-400" : ""
              }`}
            >
              <Icon className="h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
