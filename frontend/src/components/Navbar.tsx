"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function Navbar() {
  const [userEmail, setUserEmail] = useState("Loading...");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          if (data.email) {
            setUserEmail(data.email);
            return;
          }
        }
        setUserEmail("Guest");
      } catch (err) {
        setUserEmail("Guest");
      }
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <header className="sticky top-0 z-50 flex h-16 w-full items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 text-slate-900 dark:text-white transition-colors duration-300">
      <Link href="/" className="text-xl font-bold tracking-wider text-teal-600 dark:text-teal-400">
        FinAI
      </Link>
      <div className="flex items-center gap-4">
        {/* Theme Toggle Button */}
        <ThemeToggle />

        <span className="text-sm font-semibold text-slate-600 dark:text-slate-350">{userEmail}</span>
        {userEmail !== "Guest" && (
          <button
            onClick={handleLogout}
            className="rounded-lg bg-teal-500 px-4 py-2 text-sm font-medium text-white dark:text-slate-950 transition-all hover:bg-teal-600 dark:hover:bg-teal-400 cursor-pointer"
          >
            Logout
          </button>
        )}
      </div>
    </header>
  );
}
