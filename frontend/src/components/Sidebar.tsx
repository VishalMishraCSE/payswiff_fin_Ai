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
  ShieldAlert,
  Headphones,
  Sparkles,
  Bot
} from "lucide-react";

import React, { useEffect, useState } from "react";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          if (data.role) {
            setUserRole(data.role);
          }
        }
      } catch (e) {
        // Fallback to path-based
      }
    };
    fetchUserRole();
  }, []);

  // Determine active role
  let role = userRole || "merchant";
  if (!userRole) {
    if (pathname.startsWith("/admin")) role = "admin";
    else if (pathname.startsWith("/customer-care")) role = "customer care";
    else if (pathname.startsWith("/analyst")) role = "analyst";
    else role = "merchant";
  }

  // Normalize role string
  if (role === "customer_care") role = "customer care";

  // Define dynamic menu items based on role
  let menuItems = [];

  if (role === "admin") {
    menuItems = [
      { name: "System Dashboard", href: `/admin/dashboard`, icon: LayoutDashboard },
      { name: "Live Transactions", href: `/merchant/transactions`, icon: Receipt },
      { name: "Customer Care Queue", href: `/customer-care/dashboard`, icon: MessageSquare },
      { name: "KYC Compliance Queue", href: `/analyst/dashboard`, icon: FileCheck },
      { name: "Customer Care Bot", href: `/merchant/customer-care`, icon: Headphones },
      { name: "AI Copilot", href: `/merchant/copilot`, icon: Sparkles },
    ];
  } else if (role === "merchant") {
    menuItems = [
      { name: "Overview", href: `/merchant/dashboard`, icon: LayoutDashboard },
      { name: "Transactions", href: `/merchant/transactions`, icon: Receipt },
      { name: "Customer Care", href: `/merchant/customer-care`, icon: Headphones },
      { name: "AI Copilot", href: `/merchant/copilot`, icon: Sparkles },
      { name: "KYC Upload", href: `/merchant/kyc`, icon: FileCheck },
      { name: "ML Forecasting", href: `/merchant/forecast`, icon: TrendingUp },
    ];
  } else if (role === "customer care") {
    menuItems = [
      { name: "Support Ticket Queue", href: `/customer-care/dashboard`, icon: MessageSquare },
      { name: "Customer Care Bot", href: `/merchant/customer-care`, icon: Headphones },
      { name: "Merchant Transactions", href: `/merchant/transactions`, icon: Receipt },
    ];
  } else if (role === "analyst") {
    menuItems = [
      { name: "KYC Review Queue", href: `/analyst/dashboard`, icon: FileCheck },
      { name: "Transactions Log", href: `/merchant/transactions`, icon: Receipt },
    ];
  } else {
    menuItems = [
      { name: "System Dashboard", href: `/admin/dashboard`, icon: LayoutDashboard },
      { name: "Live Transactions", href: `/merchant/transactions`, icon: Receipt },
      { name: "Customer Care Queue", href: `/customer-care/dashboard`, icon: MessageSquare },
      { name: "KYC Compliance Queue", href: `/analyst/dashboard`, icon: FileCheck },
      { name: "Customer Care Bot", href: `/merchant/customer-care`, icon: Headphones },
    ];
  }


  return (
    <>
      {/* Backdrop overlay on mobile */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 top-16 bg-slate-900/40 dark:bg-black/40 backdrop-blur-sm z-30 lg:hidden"
        />
      )}

      <aside className={`fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 glass-sidebar text-slate-600 dark:text-slate-300 transition-all duration-300 z-40 transform ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      } lg:translate-x-0`}>
        <nav className="flex flex-col gap-1.5 p-4" onClick={onClose}>
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
    </>
  );
}
