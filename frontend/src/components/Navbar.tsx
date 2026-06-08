"use client";

import Link from "next/link";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 flex h-16 w-full items-center justify-between border-b border-slate-800 bg-slate-900 px-6 text-white">
      <Link href="/" className="text-xl font-bold tracking-wider text-teal-400">
        FinAI
      </Link>
      <div className="flex items-center gap-4">
        <span className="text-sm text-slate-400">merchant@finai.com</span>
        <button className="rounded-lg bg-teal-500 px-4 py-2 text-sm font-medium text-slate-950 transition-all hover:bg-teal-400">
          Logout
        </button>
      </div>
    </header>
  );
}
