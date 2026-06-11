"use client";

import React, { useState } from "react";
import { 
  ShieldAlert, 
  Activity, 
  TrendingUp, 
  CheckCircle2, 
  Search, 
  FileSpreadsheet, 
  AlertOctagon, 
  ShieldCheck, 
  Clock 
} from "lucide-react";

// Mock analyst records
const initialAlerts = [
  { id: "ALR-8092", merchant: "DealKing Pvt Ltd", amount: "₹85,000.00", score: 94, status: "flagged", time: "10 mins ago" },
  { id: "ALR-8091", merchant: "Acme Wholesale", amount: "₹1,200.00", score: 81, status: "flagged", time: "15 mins ago" },
  { id: "ALR-8090", merchant: "DealKing Pvt Ltd", amount: "₹62,000.00", score: 32, status: "resolved", time: "1 hour ago" },
  { id: "ALR-8089", merchant: "Cloud Bazaar", amount: "₹120,000.00", score: 99, status: "escalated", time: "3 hours ago" }
];

export default function AnalystDashboard() {
  const [alerts, setAlerts] = useState(initialAlerts);
  const [filter, setFilter] = useState<"all" | "flagged" | "resolved" | "escalated">("all");

  const resolveAlert = (id: string, newStatus: "resolved" | "escalated") => {
    setAlerts(alerts.map(a => a.id === id ? { ...a, status: newStatus } : a));
  };

  const filteredAlerts = filter === "all" ? alerts : alerts.filter(a => a.status === filter);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
          Fraud Analyst Queue
        </h1>
        <p className="text-sm text-slate-400 mt-1">Review flagged high-risk transactions and audit merchant operations.</p>
      </div>

      {/* Overview stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card hover:border-slate-700 transition-all">
          <p className="text-xs text-indigo-400 font-semibold uppercase tracking-wider">Total Alerts Queue</p>
          <h3 className="text-2xl font-bold mt-2">1,482</h3>
          <p className="text-[10px] text-slate-400 mt-1">Last 90 days aggregated</p>
        </div>

        <div className="card hover:border-slate-700 transition-all">
          <p className="text-xs text-rose-400 font-semibold uppercase tracking-wider">Critical Flagged</p>
          <h3 className="text-2xl font-bold mt-2">14</h3>
          <p className="text-[10px] text-slate-400 mt-1">Score above 90% threshold</p>
        </div>

        <div className="card hover:border-slate-700 transition-all">
          <p className="text-xs text-teal-400 font-semibold uppercase tracking-wider">Resolved Today</p>
          <h3 className="text-2xl font-bold mt-2">184</h3>
          <p className="text-[10px] text-slate-400 mt-1">Average handling time 8 mins</p>
        </div>

        <div className="card hover:border-slate-700 transition-all">
          <p className="text-xs text-amber-400 font-semibold uppercase tracking-wider">Threat Level</p>
          <h3 className="text-2xl font-bold mt-2">Low</h3>
          <p className="text-[10px] text-slate-400 mt-1">No active botnet spikes</p>
        </div>
      </div>

      {/* Alert Feed Table */}
      <div className="card space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-lg text-slate-100">Live Fraud Incidents</h3>
            <p className="text-xs text-slate-400">Manage real-time risks alerts and audit logs.</p>
          </div>

          {/* Filtering tabs */}
          <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-xl text-xs text-slate-400 self-start">
            {(["all", "flagged", "resolved", "escalated"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all capitalize ${
                  filter === tab ? "bg-indigo-600 text-white" : "hover:text-slate-150"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-[10px] text-slate-450 font-bold uppercase tracking-wider">
                <th className="pb-3 pl-2">Alert ID</th>
                <th className="pb-3">Merchant</th>
                <th className="pb-3">Amount</th>
                <th className="pb-3">Risk Score</th>
                <th className="pb-3">Timestamp</th>
                <th className="pb-3 pr-2 text-right">Review Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40">
              {filteredAlerts.map((alert) => (
                <tr key={alert.id} className="group hover:bg-slate-900/20 transition-all">
                  <td className="py-4 pl-2 font-mono text-xs text-indigo-400">{alert.id}</td>
                  <td className="py-4">
                    <span className="text-xs font-semibold text-slate-200">{alert.merchant}</span>
                  </td>
                  <td className="py-4 text-xs text-slate-300 font-medium">{alert.amount}</td>
                  <td className="py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      alert.score > 80 ? "bg-red-500/10 text-red-400 border border-red-500/20" : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                    }`}>
                      {alert.score}%
                    </span>
                  </td>
                  <td className="py-4 text-xs text-slate-400">{alert.time}</td>
                  <td className="py-4 pr-2 text-right">
                    {alert.status === "flagged" ? (
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => resolveAlert(alert.id, "resolved")}
                          className="px-2 py-1 rounded bg-emerald-500/20 text-emerald-400 text-xs font-semibold hover:bg-emerald-500/30 transition-all"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => resolveAlert(alert.id, "escalated")}
                          className="px-2 py-1 rounded bg-rose-500/20 text-rose-400 text-xs font-semibold hover:bg-rose-500/30 transition-all"
                        >
                          Escalate
                        </button>
                      </div>
                    ) : (
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold uppercase ${
                        alert.status === "resolved" ? "text-emerald-400" : "text-rose-400"
                      }`}>
                        {alert.status}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
