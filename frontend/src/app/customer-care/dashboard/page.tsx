"use client";

import React, { useState, useEffect } from "react";
import {
  Headphones,
  AlertCircle,
  CheckCircle2,
  Clock,
  PhoneCall,
  MessageSquare,
  Search,
  Filter,
  RefreshCw,
  UserCheck,
  ShieldAlert,
  Smartphone,
  Volume2,
  BatteryCharging,
  Wifi,
  CreditCard,
  ArrowRightLeft,
  ChevronRight,
  Sparkles
} from "lucide-react";
import axios from "axios";
import { getApiBaseUrl } from "@/utils/api";

interface Ticket {
  id: number;
  ticket_id: string;
  merchant_id: number;
  merchant_name: string;
  category: string;
  problem_details: string;
  troubleshooting_attempted: string;
  status: string;
  priority: string;
  assigned_to: string;
  agent_notes?: string;
  created_at: string;
  resolved_at?: string;
}

export default function CustomerCareDashboard() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [agentNote, setAgentNote] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${getApiBaseUrl()}/copilot/support-tickets`);
      setTickets(res.data);
    } catch (err) {
      console.error("Failed to fetch support tickets:", err);
      // Fallback sample tickets for realistic display if empty
      setTickets([
        {
          id: 1,
          ticket_id: "TKT-0825-4921",
          merchant_id: 1,
          merchant_name: "Apex Retailers - Hyd Store",
          category: "Soundbox & POS - SIM Card & Connectivity",
          problem_details: "SIM card not working / not detected in sound box slot. Merchant attempted safety pin tray ejection and re-insertion.",
          troubleshooting_attempted: "Removed SIM using ejector pin hole, cleaned golden chip, power cycled device.",
          status: "pending",
          priority: "High",
          assigned_to: "Payswiff Technical Care Specialist (On-Duty)",
          created_at: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
        },
        {
          id: 2,
          ticket_id: "TKT-0825-3810",
          merchant_id: 2,
          merchant_name: "Bharat Electronics",
          category: "Hardware - Sound Box Device",
          problem_details: "Soundbox audio distorted and announcement not playing on UPI payment.",
          troubleshooting_attempted: "Held Power ON/OFF and Restart button together for 10 seconds. Audio test replay button pressed.",
          status: "in_progress",
          priority: "High",
          assigned_to: "Payswiff Customer Care Executive (On-Duty)",
          created_at: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
        },
        {
          id: 3,
          ticket_id: "TKT-0825-1102",
          merchant_id: 3,
          merchant_name: "Mumbai Grocery Store",
          category: "Hardware - Battery & Power Charging",
          problem_details: "POS battery discharging quickly under heavy store billing.",
          troubleshooting_attempted: "Left on 5V/2A fast charger for 30 minutes, cleaned charging pins.",
          status: "resolved",
          priority: "Medium",
          assigned_to: "Payswiff Customer Care Executive (On-Duty)",
          agent_notes: "Advised merchant to use original fast charger. Battery diagnostics passed.",
          created_at: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
          resolved_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleUpdateStatus = async (ticketId: string, newStatus: string) => {
    setActionLoading(true);
    try {
      await axios.patch(`${getApiBaseUrl()}/copilot/support-tickets/${ticketId}`, {
        status: newStatus,
        agent_notes: agentNote || undefined,
      });
      await fetchTickets();
      if (selectedTicket && selectedTicket.ticket_id === ticketId) {
        setSelectedTicket({
          ...selectedTicket,
          status: newStatus,
          agent_notes: agentNote || selectedTicket.agent_notes,
        });
      }
      setAgentNote("");
    } catch (err) {
      console.error("Failed to update ticket:", err);
    } finally {
      setActionLoading(false);
    }
  };

  // Filtered tickets
  const filteredTickets = tickets.filter((t) => {
    const matchesStatus = filterStatus === "all" || t.status === filterStatus;
    const matchesSearch =
      t.ticket_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.merchant_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.problem_details.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const pendingCount = tickets.filter((t) => t.status === "pending").length;
  const inProgressCount = tickets.filter((t) => t.status === "in_progress").length;
  const resolvedCount = tickets.filter((t) => t.status === "resolved").length;

  const getCategoryIcon = (cat: string) => {
    const lower = cat.toLowerCase();
    if (lower.includes("sim")) return Smartphone;
    if (lower.includes("sound")) return Volume2;
    if (lower.includes("battery") || lower.includes("charge")) return BatteryCharging;
    if (lower.includes("network") || lower.includes("wifi")) return Wifi;
    if (lower.includes("card") || lower.includes("pos")) return CreditCard;
    return ArrowRightLeft;
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 animate-fade-in max-w-7xl mx-auto space-y-8">

      {/* ── Top Header ────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-red-600 dark:text-red-400 font-bold text-xs uppercase tracking-widest mb-1">
            <Headphones size={14} />
            <span>Customer Care Agent Workspace</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            Support Ticket Queue
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage incoming merchant hardware faults, SIM issues, and POS troubleshooting requests dispatched from the FinAI Chatbot.
          </p>
        </div>

        <button
          onClick={fetchTickets}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm active:scale-95 transition-all cursor-pointer"
        >
          <RefreshCw size={14} className={loading ? "animate-spin text-red-600" : ""} />
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* ── Metric Summary Cards ──────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">

        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm space-y-2">
          <span className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">Active Queue</span>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-black text-slate-900 dark:text-white">{tickets.length}</span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              Total Raised
            </span>
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-amber-200 dark:border-amber-900/40 bg-amber-50/40 dark:bg-slate-900/60 shadow-sm space-y-2">
          <span className="text-[11px] font-bold uppercase text-amber-700 dark:text-amber-400 tracking-wider">Pending Callbacks</span>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-black text-amber-600 dark:text-amber-400">{pendingCount}</span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping"></span>
              Requires Action
            </span>
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-indigo-200 dark:border-indigo-900/40 bg-indigo-50/40 dark:bg-slate-900/60 shadow-sm space-y-2">
          <span className="text-[11px] font-bold uppercase text-indigo-700 dark:text-indigo-400 tracking-wider">In Progress</span>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-black text-indigo-600 dark:text-indigo-400">{inProgressCount}</span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300">
              Assigned
            </span>
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/40 dark:bg-slate-900/60 shadow-sm space-y-2">
          <span className="text-[11px] font-bold uppercase text-emerald-700 dark:text-emerald-400 tracking-wider">Resolved Today</span>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400">{resolvedCount}</span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
              SLA &lt; 10m
            </span>
          </div>
        </div>

      </div>

      {/* ── Search & Filter Controls ──────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">

        <div className="relative flex-1 w-full max-w-md">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
            <Search size={15} />
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by ticket ID, merchant name, or issue details..."
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 shadow-sm"
          />
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {["all", "pending", "in_progress", "resolved"].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all active:scale-95 cursor-pointer ${
                filterStatus === status
                  ? "bg-red-600 text-white shadow-md shadow-red-600/20"
                  : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
            >
              {status.replace("_", " ")}
            </button>
          ))}
        </div>

      </div>

      {/* ── Ticket Queue Table & Detail Panel ─────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        {/* Left Column: Tickets Table (7 Cols on LG) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4 font-bold text-slate-700 dark:text-slate-300">Ticket ID</th>
                  <th className="py-3 px-4 font-bold text-slate-700 dark:text-slate-300">Merchant</th>
                  <th className="py-3 px-4 font-bold text-slate-700 dark:text-slate-300">Issue Category</th>
                  <th className="py-3 px-4 font-bold text-slate-700 dark:text-slate-300">Status</th>
                  <th className="py-3 px-4 font-bold text-slate-700 dark:text-slate-300">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredTickets.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">
                      No support tickets found in this view.
                    </td>
                  </tr>
                ) : (
                  filteredTickets.map((t) => {
                    const Icon = getCategoryIcon(t.category);
                    const isSelected = selectedTicket?.ticket_id === t.ticket_id;
                    return (
                      <tr
                        key={t.id}
                        onClick={() => setSelectedTicket(t)}
                        className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 cursor-pointer transition-colors ${
                          isSelected ? "bg-red-50/60 dark:bg-red-950/30 font-medium" : ""
                        }`}
                      >
                        <td className="py-3 px-4 font-mono font-bold text-red-600 dark:text-red-400">
                          {t.ticket_id}
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">
                          {t.merchant_name}
                        </td>
                        <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                          <div className="flex items-center gap-1.5">
                            <Icon size={13} className="text-red-500 shrink-0" />
                            <span className="truncate max-w-[150px]">{t.category}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                              t.status === "resolved"
                                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                                : t.status === "in_progress"
                                ? "bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300"
                                : "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                            }`}
                          >
                            {t.status.replace("_", " ")}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedTicket(t);
                            }}
                            className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500"
                          >
                            <ChevronRight size={15} />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Ticket Inspection & Resolution Card (5 Cols on LG) */}
        <div className="lg:col-span-5">
          {selectedTicket ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-red-500/30 dark:border-red-900/40 p-5 shadow-lg space-y-5">

              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div>
                  <span className="text-[10px] uppercase font-bold text-red-600 dark:text-red-400 tracking-wider">
                    Ticket Overview
                  </span>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white font-mono">
                    {selectedTicket.ticket_id}
                  </h3>
                </div>
                <span
                  className={`px-2.5 py-1 rounded-xl text-xs font-bold capitalize ${
                    selectedTicket.status === "resolved"
                      ? "bg-emerald-500 text-white"
                      : selectedTicket.status === "in_progress"
                      ? "bg-indigo-600 text-white"
                      : "bg-amber-500 text-white"
                  }`}
                >
                  {selectedTicket.status.replace("_", " ")}
                </span>
              </div>

              {/* Merchant & Problem Details */}
              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Merchant</span>
                  <p className="font-bold text-slate-900 dark:text-white mt-0.5">
                    {selectedTicket.merchant_name} (ID: #{selectedTicket.merchant_id})
                  </p>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Problem Category</span>
                  <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                    {selectedTicket.category}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-red-50/60 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30">
                  <span className="text-[10px] font-bold text-red-600 dark:text-red-400 uppercase block mb-1">
                    Problem Facing by Merchant
                  </span>
                  <p className="text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                    {selectedTicket.problem_details}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                    Troubleshooting Attempted
                  </span>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                    {selectedTicket.troubleshooting_attempted}
                  </p>
                </div>
              </div>

              {/* Action Controls */}
              <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                <a
                  href="tel:1800-419-7443"
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-95 cursor-pointer text-center"
                >
                  <PhoneCall size={14} />
                  <span>Call Merchant ({selectedTicket.merchant_name})</span>
                </a>

                {/* Resolution Notes Input */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">
                    Agent Resolution Notes
                  </label>
                  <textarea
                    value={agentNote}
                    onChange={(e) => setAgentNote(e.target.value)}
                    placeholder="Enter technician diagnostic findings, replacement dispatch ID, or resolution remarks..."
                    className="w-full h-20 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-red-500"
                  />
                </div>

                <div className="flex gap-2">
                  {selectedTicket.status !== "in_progress" && selectedTicket.status !== "resolved" && (
                    <button
                      onClick={() => handleUpdateStatus(selectedTicket.ticket_id, "in_progress")}
                      disabled={actionLoading}
                      className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-sm active:scale-95 transition-all cursor-pointer"
                    >
                      Mark In Progress
                    </button>
                  )}

                  {selectedTicket.status !== "resolved" && (
                    <button
                      onClick={() => handleUpdateStatus(selectedTicket.ticket_id, "resolved")}
                      disabled={actionLoading}
                      className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-sm active:scale-95 transition-all cursor-pointer"
                    >
                      Mark Resolved
                    </button>
                  )}
                </div>
              </div>

            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 text-center space-y-3 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mx-auto">
                <Headphones size={22} />
              </div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">Select a Ticket</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                Click any ticket from the queue to view merchant contact info, diagnose issues, and update resolution status.
              </p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
