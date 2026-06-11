"use client";

import React, { useState, useEffect } from 'react';
import {
  IndianRupee,
  CreditCard,
  ShieldAlert,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Search,
  Bell,
  Settings,
  User,
  RefreshCw,
  Calendar,
  Filter,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  TrendingDown
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import TransactionTable from "@/components/TransactionTable";

// Mock data for sales trend
const revenueData = [
  { name: 'Mon', revenue: 120000, transactions: 840 },
  { name: 'Tue', revenue: 190000, transactions: 1100 },
  { name: 'Wed', revenue: 150000, transactions: 920 },
  { name: 'Thu', revenue: 220000, transactions: 1400 },
  { name: 'Fri', revenue: 280000, transactions: 1850 },
  { name: 'Sat', revenue: 240000, transactions: 1600 },
  { name: 'Sun', revenue: 310000, transactions: 2100 },
];

// Mock data for transaction status
const statusData = [
  { name: 'Success', value: 9200, color: '#10B981' },
  { name: 'Pending', value: 480, color: '#F59E0B' },
  { name: 'Failed', value: 120, color: '#EF4444' },
];

export default function MerchantDashboard() {
  const [refreshing, setRefreshing] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-[#080B11] text-slate-100 flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="border-b border-slate-800 bg-[#0B0F19]/80 backdrop-blur-md sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center font-bold text-white-forced shadow-md shadow-indigo-500/20">
            F
          </div>
          <div>
            <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">FinAI</span>
            <span className="text-xs text-indigo-400 ml-2 px-1.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20">Merchant</span>
          </div>
        </div>

        {/* Global Controls */}
        <div className="flex items-center gap-4">
          <div className="relative hidden md:block">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
              <Search size={16} />
            </span>
            <input
              type="text"
              placeholder="Search payments, customers..."
              className="bg-slate-900/60 border border-slate-800 rounded-full py-1.5 pl-9 pr-4 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 w-64 transition-all"
            />
          </div>

          <button className="relative p-2 text-slate-400 hover:text-white hover:bg-slate-900 rounded-full transition-all">
            <Bell size={18} />
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-rose-500"></span>
          </button>

          <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-900 rounded-full transition-all">
            <Settings size={18} />
          </button>

          <div className="h-8 w-px bg-slate-800 hidden sm:block"></div>

          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-indigo-950 border border-indigo-500 flex items-center justify-center text-indigo-300 font-medium text-sm">
              VM
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-semibold">Vishal Stores</p>
              <p className="text-[10px] text-slate-400">ID: VM-20658</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Dashboard Layout */}
      <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full space-y-8">

        {/* Header Title with quick Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
              Merchant Overview
            </h1>
            <p className="text-sm text-slate-400 mt-1">Real-time payment analytics, health and alerts.</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              className="flex items-center gap-2 bg-slate-900/80 border border-slate-800 hover:bg-slate-800/80 px-4 py-2 rounded-lg text-sm transition-all text-white-forced active:scale-95"
            >
              <RefreshCw size={14} className={`${refreshing ? 'animate-spin' : ''}`} />
              <span>{refreshing ? 'Refreshing...' : 'Sync'}</span>
            </button>
            <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-lg text-sm text-white-forced font-medium shadow-md shadow-indigo-600/20 transition-all active:scale-95">
              <span>Settlements</span>
              <ArrowUpRight size={14} />
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

          {/* Revenue Stat */}
          <div className="relative group overflow-hidden bg-slate-900/40 backdrop-blur-md border border-slate-800/80 hover:border-slate-700/80 rounded-2xl p-6 transition-all hover:-translate-y-1 duration-300">
            <div className="absolute top-0 right-0 h-24 w-24 bg-indigo-500/5 rounded-full blur-2xl group-hover:bg-indigo-500/10 transition-all"></div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">Total Revenue</span>
              <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-xl">
                <IndianRupee size={18} />
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-3xl font-bold tracking-tight">₹14.82L</h3>
              <p className="text-xs text-emerald-400 flex items-center gap-1 mt-2">
                <TrendingUp size={12} />
                <span>+12.4% vs last week</span>
              </p>
            </div>
          </div>

          {/* Transactions Stat */}
          <div className="relative group overflow-hidden bg-slate-900/40 backdrop-blur-md border border-slate-800/80 hover:border-slate-700/80 rounded-2xl p-6 transition-all hover:-translate-y-1 duration-300">
            <div className="absolute top-0 right-0 h-24 w-24 bg-violet-500/5 rounded-full blur-2xl group-hover:bg-violet-500/10 transition-all"></div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-violet-400 uppercase tracking-wider">Transactions</span>
              <div className="p-2 bg-violet-500/10 border border-violet-500/20 text-violet-400 rounded-xl">
                <CreditCard size={18} />
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-3xl font-bold tracking-tight">12,480</h3>
              <p className="text-xs text-emerald-400 flex items-center gap-1 mt-2">
                <TrendingUp size={12} />
                <span>+8.2% vs last week</span>
              </p>
            </div>
          </div>

          {/* Success Rate Stat */}
          <div className="relative group overflow-hidden bg-slate-900/40 backdrop-blur-md border border-slate-800/80 hover:border-slate-700/80 rounded-2xl p-6 transition-all hover:-translate-y-1 duration-300">
            <div className="absolute top-0 right-0 h-24 w-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-all"></div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Success Rate</span>
              <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl">
                <CheckCircle2 size={18} />
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-3xl font-bold tracking-tight">98.4%</h3>
              <p className="text-xs text-emerald-400 flex items-center gap-1 mt-2">
                <TrendingUp size={12} />
                <span>+0.3% vs last week</span>
              </p>
            </div>
          </div>

          {/* Fraud Alerts Stat */}
          <div className="relative group overflow-hidden bg-slate-900/40 backdrop-blur-md border border-slate-800/80 hover:border-slate-700/80 rounded-2xl p-6 transition-all hover:-translate-y-1 duration-300">
            <div className="absolute top-0 right-0 h-24 w-24 bg-rose-500/5 rounded-full blur-2xl group-hover:bg-rose-500/10 transition-all"></div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-rose-400 uppercase tracking-wider">Active Fraud Alerts</span>
              <div className="p-2 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl">
                <ShieldAlert size={18} />
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-3xl font-bold tracking-tight">2</h3>
              <p className="text-xs text-rose-400 flex items-center gap-1 mt-2">
                <TrendingDown size={12} />
                <span>-50.0% vs last week</span>
              </p>
            </div>
          </div>

        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Revenue Analytics (Line/Area Chart) */}
          <div className="lg:col-span-2 bg-[#0B0F19]/60 backdrop-blur-md border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg text-slate-100">Revenue Stream</h3>
                <p className="text-xs text-slate-400">Daily revenue breakdown and trends</p>
              </div>
              <div className="flex items-center gap-2 bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs text-slate-400">
                <button className="px-2.5 py-1 rounded bg-slate-800 text-white font-medium">7D</button>
                <button className="px-2.5 py-1 rounded hover:text-white transition-all">30D</button>
              </div>
            </div>

            <div className="h-72">
              {mounted ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366F1" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                    <XAxis dataKey="name" stroke="#64748B" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="#64748B" fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0B0F19', borderColor: '#1E293B', borderRadius: '12px' }}
                      labelStyle={{ fontWeight: 'bold', color: '#94A3B8' }}
                    />
                    <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#6366F1" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full w-full bg-slate-900/30 animate-pulse rounded-2xl flex items-center justify-center text-xs text-slate-500">
                  Loading chart stream...
                </div>
              )}
            </div>
          </div>

          {/* Status Breakdown (Pie Chart) */}
          <div className="bg-[#0B0F19]/60 backdrop-blur-md border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-lg text-slate-100">Payment Breakdown</h3>
              <p className="text-xs text-slate-400">Overall success, pending, & failure logs</p>
            </div>

            <div className="h-48 relative flex items-center justify-center my-4">
              {mounted ? (
                <>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={85}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {statusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute text-center">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Total Logs</span>
                    <span className="text-2xl font-black text-white">9,800</span>
                  </div>
                </>
              ) : (
                <div className="h-32 w-32 rounded-full border-4 border-slate-900/30 border-t-indigo-500 animate-spin" />
              )}
            </div>

            <div className="space-y-2">
              {statusData.map((item, index) => (
                <div key={index} className="flex items-center justify-between text-xs p-2 bg-slate-900/40 rounded-lg border border-slate-800/40">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                    <span className="font-medium text-slate-300">{item.name}</span>
                  </div>
                  <span className="font-bold text-slate-100">{item.value.toLocaleString()} ({((item.value / 9800) * 100).toFixed(1)}%)</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Dynamic Transaction Table Integration */}
        <TransactionTable />

      </main>
    </div>
  );
}
