"use client";

import React, { useState, useEffect } from "react";
import { 
  Users, 
  UserCheck, 
  Settings, 
  Database, 
  ServerCrash, 
  Key, 
  ShieldAlert, 
  Plus, 
  Search, 
  Trash2, 
  CheckCircle, 
  AlertTriangle 
} from "lucide-react";

// Mock Admins and system variables
const initialUsers = [
  { id: 1, email: "merchant@finai.com", role: "merchant", status: "active", date: "2 days ago" },
  { id: 2, email: "analyst@finai.com", role: "analyst", status: "active", date: "1 day ago" },
  { id: 3, email: "admin@finai.com", role: "admin", status: "active", date: "Just now" },
  { id: 4, email: "unverified@finai.com", role: "merchant", status: "suspended", date: "4 days ago" }
];

export default function AdminDashboard() {
  const [users, setUsers] = useState(initialUsers);
  const [searchTerm, setSearchTerm] = useState("");
  const [dbStatus, setDbStatus] = useState("Online");
  const [cacheStatus, setCacheStatus] = useState("Online");

  const toggleStatus = (id: number) => {
    setUsers(users.map(u => u.id === id ? { ...u, status: u.status === "active" ? "suspended" : "active" } : u));
  };

  const filteredUsers = users.filter(u => u.email.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
          System Administration
        </h1>
        <p className="text-sm text-slate-400 mt-1">Manage tenant configurations, user roles, and system microservices.</p>
      </div>

      {/* System Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card hover:border-slate-700 transition-all flex items-center gap-4">
          <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl">
            <Database className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Database Status</p>
            <h3 className="text-lg font-bold flex items-center gap-2 mt-0.5">
              <span>PostgreSQL</span>
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            </h3>
          </div>
        </div>

        <div className="card hover:border-slate-700 transition-all flex items-center gap-4">
          <div className="p-3 bg-teal-500/10 text-teal-400 rounded-xl">
            <ServerCrash className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Cache Layer</p>
            <h3 className="text-lg font-bold flex items-center gap-2 mt-0.5">
              <span>Redis Cluster</span>
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            </h3>
          </div>
        </div>

        <div className="card hover:border-slate-700 transition-all flex items-center gap-4">
          <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl">
            <Key className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">OAuth Providers</p>
            <h3 className="text-lg font-bold mt-0.5">JWT / HS256 Active</h3>
          </div>
        </div>
      </div>

      {/* User Management Section */}
      <div className="card space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-lg text-slate-100">User Directory</h3>
            <p className="text-xs text-slate-400">View and toggle status of all registered roles</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-500">
                <Search size={16} />
              </span>
              <input
                type="text"
                placeholder="Search users..."
                className="bg-slate-800/50 border border-slate-700 rounded-xl py-2 pl-10 pr-4 text-xs focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 w-48 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 px-3 py-2 rounded-xl text-xs text-white font-medium transition-all">
              <Plus size={14} />
              <span>Add User</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-850 text-[10px] text-slate-450 font-bold uppercase tracking-wider">
                <th className="pb-3 pl-2">User details</th>
                <th className="pb-3">Role</th>
                <th className="pb-3">Registered</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 pr-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="group hover:bg-slate-900/20 transition-all">
                  <td className="py-4 pl-2">
                    <div className="text-xs font-semibold text-slate-200">{user.email}</div>
                  </td>
                  <td className="py-4">
                    <span className="text-xs font-medium text-slate-350 capitalize">{user.role}</span>
                  </td>
                  <td className="py-4 text-xs text-slate-400">{user.date}</td>
                  <td className="py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                      user.status === "active" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-red-500/10 text-red-400 border-red-500/20"
                    }`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${user.status === "active" ? "bg-emerald-400" : "bg-red-400"}`}></span>
                      {user.status}
                    </span>
                  </td>
                  <td className="py-4 pr-2 text-right">
                    <button 
                      onClick={() => toggleStatus(user.id)}
                      className={`text-xs font-medium ${user.status === "active" ? "text-red-400 hover:text-red-300" : "text-emerald-400 hover:text-emerald-305"} transition-all`}
                    >
                      {user.status === "active" ? "Suspend" : "Activate"}
                    </button>
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
