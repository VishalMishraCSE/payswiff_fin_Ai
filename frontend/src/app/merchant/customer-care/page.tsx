import React from "react";
import FinAIChatbot from "@/components/FinAIChatbot";
import { Headphones, ShieldCheck, Clock, PhoneCall } from "lucide-react";

export default function CustomerCarePage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 animate-fade-in max-w-5xl mx-auto space-y-6">

      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 text-red-600 dark:text-red-400 font-bold text-xs uppercase tracking-widest mb-1">
            <Headphones size={13} />
            <span>Merchant Support Desk</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            FinAI Customer Care Chatbot
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time automated hardware diagnostics, POS terminal troubleshooting, and 24/7 priority customer care escalation.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 px-3 py-1.5 rounded-xl text-xs font-semibold text-emerald-700 dark:text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            <span>Live Help Desk Online</span>
          </div>
        </div>
      </div>

      {/* FinAI Chatbot Container */}
      <div className="flex justify-center">
        <FinAIChatbot />
      </div>

      {/* Support Hotlines & Guarantee Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 flex items-center gap-3.5 shadow-sm">
          <div className="p-2.5 rounded-lg bg-red-500/10 text-red-600 dark:text-red-400">
            <PhoneCall size={18} />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">Toll-Free Merchant Line</h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">1800-419-7443 (Payswiff Care)</p>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 flex items-center gap-3.5 shadow-sm">
          <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <Clock size={18} />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">SLA Guarantee</h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">&lt; 15 min on-call response time</p>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 flex items-center gap-3.5 shadow-sm">
          <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <ShieldCheck size={18} />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">Hardware Replacement</h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Same-day dispatch for verified faults</p>
          </div>
        </div>
      </div>

    </div>
  );
}
