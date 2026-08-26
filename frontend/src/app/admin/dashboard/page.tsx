"use client";

import React, { useState, useEffect } from "react";
import {
  Users,
  Building2,
  Receipt,
  ShieldAlert,
  Activity,
  Server,
  FileCheck,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Clock,
  Shield,
  Search,
  Sparkles,
  Database,
  Cpu,
  Lock,
  ArrowUpRight,
  UserCheck,
  Eye,
  Sliders
} from "lucide-react";
import axios from "axios";
import { getApiBaseUrl } from "@/utils/api";

interface AdminOverview {
  total_users: number;
  total_merchants: number;
  total_transactions: number;
  total_revenue: number;
  active_fraud_alerts: number;
  total_audit_logs: number;
  total_support_tickets: number;
  pending_kyc_count: number;
  verified_kyc_count: number;
  roles_breakdown: {
    merchant: number;
    customer_care: number;
    analyst: number;
    admin: number;
  };
  system_health: {
    database: string;
    ai_engine: string;
    api_uptime: string;
    system_status: string;
  };
}

interface AdminUser {
  id: number;
  email: string;
  role: string;
  is_active: boolean;
  business_name: string;
  created_at: string | null;
}

interface AdminMerchant {
  id: number;
  business_name: string;
  user_email: string;
  kyc_status: string;
  total_transactions: number;
  created_at: string | null;
}

interface AuditLogItem {
  id: number;
  method: string;
  path: string;
  user_email: string;
  status_code: number;
  created_at: string | null;
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<"overview" | "users" | "merchants" | "audit">("overview");
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [merchants, setMerchants] = useState<AdminMerchant[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const fetchAllData = async () => {
    try {
      setRefreshing(true);
      const apiBase = getApiBaseUrl();
      const [ovRes, uRes, mRes, aRes] = await Promise.all([
        axios.get(`${apiBase}/admin/overview`),
        axios.get(`${apiBase}/admin/users`),
        axios.get(`${apiBase}/admin/merchants`),
        axios.get(`${apiBase}/admin/audit-logs?limit=50`),
      ]);
      setOverview(ovRes.data);
      setUsers(uRes.data);
      setMerchants(mRes.data);
      setAuditLogs(aRes.data);
    } catch (err) {
      console.error("Error loading admin data:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const handleUpdateRole = async (userId: number, newRole: string) => {
    try {
      const apiBase = getApiBaseUrl();
      await axios.patch(`${apiBase}/admin/users/${userId}`, { role: newRole });
      setStatusMessage(`User role updated to ${newRole}`);
      setTimeout(() => setStatusMessage(null), 3000);
      fetchAllData();
    } catch (err) {
      console.error("Failed to update user role:", err);
    }
  };

  const handleUpdateKyc = async (merchantId: number, newKyc: string) => {
    try {
      const apiBase = getApiBaseUrl();
      await axios.patch(`${apiBase}/admin/merchants/${merchantId}/kyc`, { kyc_status: newKyc });
      setStatusMessage(`Merchant KYC status changed to ${newKyc}`);
      setTimeout(() => setStatusMessage(null), 3000);
      fetchAllData();
    } catch (err) {
      console.error("Failed to update KYC status:", err);
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.business_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredMerchants = merchants.filter(
    (m) =>
      m.business_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.user_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.kyc_status.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#07090e] text-slate-900 dark:text-slate-100 p-4 sm:p-6 lg:p-8 space-y-6 font-sans transition-colors duration-300">
      
      {/* Toast Notification */}
      {statusMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-3 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-bold">
          <CheckCircle2 size={16} />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-xs uppercase tracking-widest mb-1">
            <Shield size={13} />
            <span>Enterprise Admin Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            System Administration Console
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Platform-wide governance, merchant compliance verification, RBAC management, and immutable audit trails.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 px-3 py-1.5 rounded-xl text-xs font-bold text-emerald-700 dark:text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            <span>All Systems Live</span>
          </div>
          <button
            onClick={fetchAllData}
            disabled={refreshing}
            className="flex items-center gap-2 px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/80 rounded-xl text-xs font-semibold shadow-sm transition-all active:scale-95 cursor-pointer text-slate-700 dark:text-slate-200"
          >
            <RefreshCw size={13} className={refreshing ? "animate-spin text-indigo-600" : ""} />
            <span>{refreshing ? "Refreshing..." : "Refresh"}</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Users */}
        <div className="bg-white dark:bg-[#0c1017] border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-2 relative overflow-hidden group hover:border-indigo-400/50 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Total Users
            </span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <Users size={18} />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            {overview?.total_users ?? 0}
          </p>
          <div className="flex flex-wrap gap-1.5 pt-1 text-[10px] font-bold">
            <span className="px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300">
              {overview?.roles_breakdown.merchant ?? 0} Merchants
            </span>
            <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
              {overview?.roles_breakdown.customer_care ?? 0} Care
            </span>
            <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
              {overview?.roles_breakdown.analyst ?? 0} Analysts
            </span>
          </div>
        </div>

        {/* Total Merchants & KYC */}
        <div className="bg-white dark:bg-[#0c1017] border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-2 relative overflow-hidden group hover:border-emerald-400/50 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Registered Merchants
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Building2 size={18} />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            {overview?.total_merchants ?? 0}
          </p>
          <div className="flex items-center gap-2 pt-1 text-[10px] font-bold">
            <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <CheckCircle2 size={11} /> {overview?.verified_kyc_count ?? 0} Verified
            </span>
            <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1">
              <Clock size={11} /> {overview?.pending_kyc_count ?? 0} Pending
            </span>
          </div>
        </div>

        {/* Total Gross Volume & Transactions */}
        <div className="bg-white dark:bg-[#0c1017] border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-2 relative overflow-hidden group hover:border-blue-400/50 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Platform Gross Volume
            </span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Receipt size={18} />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            ₹{(overview?.total_revenue ?? 0).toLocaleString()}
          </p>
          <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 pt-1">
            {overview?.total_transactions ?? 0} Total Transactions
          </p>
        </div>

        {/* Security Logs & Alerts */}
        <div className="bg-white dark:bg-[#0c1017] border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-2 relative overflow-hidden group hover:border-rose-400/50 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Audit Logs & Security
            </span>
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
              <ShieldAlert size={18} />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            {overview?.total_audit_logs ?? 0}
          </p>
          <div className="flex items-center gap-2 pt-1 text-[10px] font-bold">
            <span className="text-rose-600 dark:text-rose-400">
              {overview?.active_fraud_alerts ?? 0} Fraud Interceptions
            </span>
            <span className="text-slate-400">•</span>
            <span className="text-indigo-600 dark:text-indigo-400">
              {overview?.total_support_tickets ?? 0} Tickets
            </span>
          </div>
        </div>

      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-1 overflow-x-auto">
        <button
          onClick={() => setActiveTab("overview")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "overview"
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60"
          }`}
        >
          <Activity size={14} />
          <span>System Health & Infrastructure</span>
        </button>

        <button
          onClick={() => setActiveTab("users")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "users"
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60"
          }`}
        >
          <Users size={14} />
          <span>User & Role Governance ({users.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("merchants")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "merchants"
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60"
          }`}
        >
          <Building2 size={14} />
          <span>Merchant KYC Compliance ({merchants.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("audit")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "audit"
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60"
          }`}
        >
          <Lock size={14} />
          <span>Immutable Audit Logs</span>
        </button>
      </div>

      {/* ── Tab 1: System Health & Infrastructure ────────────────────────── */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-200">
          
          {/* Left 2 Cols: Services Status Grid */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white dark:bg-[#0c1017] border border-slate-200/90 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <Server size={16} className="text-indigo-500" />
                  <span>Platform Core Microservices Matrix</span>
                </h3>
                <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                  99.98% Uptime SLA
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <Database size={14} className="text-blue-500" /> Relational Database
                    </span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  </div>
                  <p className="text-xs font-mono font-bold text-slate-600 dark:text-slate-300">
                    {overview?.system_health.database || "MySQL 8.0 (finai_db)"}
                  </p>
                  <p className="text-[10px] text-slate-400">Connection pooling: active (pool_size=10)</p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <Cpu size={14} className="text-indigo-500" /> AI LLM Gateway
                    </span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  </div>
                  <p className="text-xs font-mono font-bold text-slate-600 dark:text-slate-300">
                    {overview?.system_health.ai_engine || "Llama-3.1 70B & 8B Instruct"}
                  </p>
                  <p className="text-[10px] text-slate-400">Multilingual & Copilot reasoning ready</p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <Activity size={14} className="text-emerald-500" /> WebSocket Live Feeds
                    </span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  </div>
                  <p className="text-xs font-mono font-bold text-slate-600 dark:text-slate-300">
                    /ws/alerts (Real-Time Push)
                  </p>
                  <p className="text-[10px] text-slate-400">Low-latency anomaly broadcast</p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <Lock size={14} className="text-amber-500" /> Security Middleware
                    </span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  </div>
                  <p className="text-xs font-mono font-bold text-slate-600 dark:text-slate-300">
                    JWT Auth + Immutable Auditing
                  </p>
                  <p className="text-[10px] text-slate-400">Role boundary checks enforced</p>
                </div>

              </div>
            </div>
          </div>

          {/* Right Col: Admin Shortcuts & Role Matrix */}
          <div className="space-y-4">
            <div className="bg-white dark:bg-[#0c1017] border border-slate-200/90 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Sliders size={16} className="text-indigo-500" />
                <span>Quick Administration Actions</span>
              </h3>

              <div className="space-y-2">
                <button
                  onClick={() => setActiveTab("merchants")}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 hover:bg-indigo-50/60 dark:hover:bg-indigo-950/30 border border-slate-200 dark:border-slate-800 transition-all text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <FileCheck size={14} className="text-emerald-500" />
                    <span>Review Pending KYC ({overview?.pending_kyc_count ?? 0})</span>
                  </span>
                  <ArrowUpRight size={14} className="text-slate-400" />
                </button>

                <button
                  onClick={() => setActiveTab("users")}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 hover:bg-indigo-50/60 dark:hover:bg-indigo-950/30 border border-slate-200 dark:border-slate-800 transition-all text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <UserCheck size={14} className="text-indigo-500" />
                    <span>Manage User Access Roles</span>
                  </span>
                  <ArrowUpRight size={14} className="text-slate-400" />
                </button>

                <button
                  onClick={() => setActiveTab("audit")}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 hover:bg-indigo-50/60 dark:hover:bg-indigo-950/30 border border-slate-200 dark:border-slate-800 transition-all text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Lock size={14} className="text-rose-500" />
                    <span>Inspect Security Audit Trail</span>
                  </span>
                  <ArrowUpRight size={14} className="text-slate-400" />
                </button>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* ── Tab 2: User & Role Governance ────────────────────────────────── */}
      {activeTab === "users" && (
        <div className="bg-white dark:bg-[#0c1017] border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden animate-in fade-in duration-200">
          <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Registered Users & Role Assignments</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Modify user roles or manage tenant access permissions.</p>
            </div>
            <div className="relative w-full sm:w-64">
              <Search size={14} className="absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search user email or role..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">User Email</th>
                  <th className="px-5 py-3.5">Linked Business</th>
                  <th className="px-5 py-3.5">Assigned Role</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors">
                    <td className="px-5 py-4 font-bold text-slate-900 dark:text-white">
                      {u.email}
                    </td>
                    <td className="px-5 py-4 text-slate-600 dark:text-slate-300">
                      {u.business_name}
                    </td>
                    <td className="px-5 py-4">
                      <select
                        value={u.role}
                        onChange={(e) => handleUpdateRole(u.id, e.target.value)}
                        className="bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                      >
                        <option value="merchant">Merchant</option>
                        <option value="customer_care">Customer Care Officer</option>
                        <option value="analyst">Risk & Fraud Analyst</option>
                        <option value="admin">System Administrator</option>
                      </select>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        u.is_active
                          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                          : "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300"
                      }`}>
                        {u.is_active ? "Active" : "Disabled"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <span className="text-[11px] text-slate-400">
                        ID #{u.id}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Tab 3: Merchant KYC Compliance ──────────────────────────────── */}
      {activeTab === "merchants" && (
        <div className="bg-white dark:bg-[#0c1017] border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden animate-in fade-in duration-200">
          <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Merchant Accounts & KYC Status</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Verify merchant onboarding documentation and update status.</p>
            </div>
            <div className="relative w-full sm:w-64">
              <Search size={14} className="absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search merchant or KYC status..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Business Name</th>
                  <th className="px-5 py-3.5">Owner Account</th>
                  <th className="px-5 py-3.5">KYC Compliance</th>
                  <th className="px-5 py-3.5">Transactions</th>
                  <th className="px-5 py-3.5 text-right">KYC Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                {filteredMerchants.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors">
                    <td className="px-5 py-4 font-bold text-slate-900 dark:text-white">
                      {m.business_name}
                    </td>
                    <td className="px-5 py-4 text-slate-600 dark:text-slate-300">
                      {m.user_email}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        m.kyc_status === "verified"
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800"
                          : m.kyc_status === "rejected"
                          ? "bg-rose-100 text-rose-800 dark:bg-rose-950/50 dark:text-rose-400 border border-rose-300 dark:border-rose-800"
                          : "bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-400 border border-amber-300 dark:border-amber-800"
                      }`}>
                        {m.kyc_status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-slate-700 dark:text-slate-300 font-bold">
                      {m.total_transactions} txns
                    </td>
                    <td className="px-5 py-4 text-right space-x-1.5">
                      <button
                        onClick={() => handleUpdateKyc(m.id, "verified")}
                        disabled={m.kyc_status === "verified"}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-30 text-white rounded-lg text-[10px] font-bold shadow-sm transition-all active:scale-95 cursor-pointer"
                      >
                        Approve KYC
                      </button>
                      <button
                        onClick={() => handleUpdateKyc(m.id, "rejected")}
                        disabled={m.kyc_status === "rejected"}
                        className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 disabled:opacity-30 text-white rounded-lg text-[10px] font-bold shadow-sm transition-all active:scale-95 cursor-pointer"
                      >
                        Reject
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Tab 4: Immutable Security Audit Logs ──────────────────────────── */}
      {activeTab === "audit" && (
        <div className="bg-white dark:bg-[#0c1017] border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden animate-in fade-in duration-200">
          <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Security & API Audit Trail</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Append-only audit log records for administrative compliance.</p>
            </div>
            <span className="px-3 py-1 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] font-mono font-bold rounded-lg text-slate-600 dark:text-slate-300">
              Latest {auditLogs.length} Events
            </span>
          </div>

          <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider sticky top-0 backdrop-blur-md">
                <tr>
                  <th className="px-5 py-3.5">Method</th>
                  <th className="px-5 py-3.5">API Endpoint Path</th>
                  <th className="px-5 py-3.5">Actor / User Email</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors">
                    <td className="px-5 py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        log.method === "POST"
                          ? "bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300"
                          : log.method === "PATCH"
                          ? "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300"
                          : log.method === "DELETE"
                          ? "bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300"
                          : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                      }`}>
                        {log.method}
                      </span>
                    </td>
                    <td className="px-5 py-3 font-semibold text-slate-800 dark:text-slate-200">
                      {log.path}
                    </td>
                    <td className="px-5 py-3 text-slate-600 dark:text-slate-400">
                      {log.user_email}
                    </td>
                    <td className="px-5 py-3 font-bold">
                      <span className={log.status_code === 200 ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}>
                        {log.status_code || 200}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right text-[11px] text-slate-400">
                      {log.created_at ? new Date(log.created_at).toLocaleString() : "Just now"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
