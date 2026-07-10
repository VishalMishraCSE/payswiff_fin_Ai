"use client";

import React, { useState, useEffect, useRef } from 'react';
import {
  IndianRupee,
  CreditCard,
  ShieldAlert,
  TrendingUp,
  ArrowUpRight,
  RefreshCw,
  Search,
  Bell,
  Settings,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles
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
import axios from 'axios';
import { getApiBaseUrl, getWsBaseUrl } from "@/utils/api";

interface LiveTransaction {
  id: number;
  reference_id: string;
  customer_name: string;
  amount: number;
  payment_method: string;
  is_fraud: boolean;
  fraud_score: number;
  status: string;
  created_at: string;
}

export default function MerchantDashboard() {
  const [metrics, setMetrics] = useState({
    total_revenue: 0,
    total_transactions: 0,
    success_rate: 100.0,
    active_fraud_alerts: 0
  });

  const [trendData, setTrendData] = useState<any[]>([]);
  const [breakdownData, setBreakdownData] = useState<any[]>([]);
  const [liveTransactions, setLiveTransactions] = useState<LiveTransaction[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [upiUrl, setUpiUrl] = useState('');

  const socketRef = useRef<WebSocket | null>(null);

  const playNotificationSound = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();

      // Tone 1
      const osc1 = audioCtx.createOscillator();
      const gain1 = audioCtx.createGain();
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      gain1.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.4);
      osc1.connect(gain1);
      gain1.connect(audioCtx.destination);
      osc1.start();
      osc1.stop(audioCtx.currentTime + 0.45);

      // Tone 2 (Delayed A5)
      setTimeout(() => {
        const osc2 = audioCtx.createOscillator();
        const gain2 = audioCtx.createGain();
        osc2.type = "sine";
        osc2.frequency.setValueAtTime(880.0, audioCtx.currentTime); // A5
        gain2.gain.setValueAtTime(0.06, audioCtx.currentTime);
        gain2.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);
        osc2.connect(gain2);
        gain2.connect(audioCtx.destination);
        osc2.start();
        osc2.stop(audioCtx.currentTime + 0.55);
      }, 120);
    } catch (e) {
      console.error("Synthesizer audio failed", e);
    }
  };

  const fetchDashboardData = async () => {
    try {
      setRefreshing(true);
      const apiBase = getApiBaseUrl();
      const [metricsRes, trendRes, breakdownRes] = await Promise.all([
        axios.get(`${apiBase}/analytics/dashboard`),
        axios.get(`${apiBase}/analytics/revenue_trend`),
        axios.get(`${apiBase}/analytics/status_breakdown`)
      ]);
      setMetrics(metricsRes.data);
      setTrendData(trendRes.data);
      setBreakdownData(breakdownRes.data);
    } catch (err) {
      console.error("Error loading dashboard metrics:", err);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    fetchDashboardData();

    const fetchServerIp = async () => {
      const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
      if (!isLocal) {
        if (typeof window !== 'undefined') {
          setUpiUrl(`${window.location.origin}/mock-upi-pay?merchant_id=1&route=UPI`);
        }
        return;
      }
      try {
        const res = await axios.get(`${getApiBaseUrl()}/analytics/server-ip`);
        if (res.data && res.data.ip) {
          setUpiUrl(`http://${res.data.ip}:3000/mock-upi-pay?merchant_id=1&route=UPI`);
          return;
        }
      } catch (err) {
        console.error("Failed to fetch server LAN IP, falling back:", err);
      }
      if (typeof window !== 'undefined') {
        setUpiUrl(`${window.location.origin}/mock-upi-pay?merchant_id=1&route=UPI`);
      }
    };
    fetchServerIp();

    // Establish WebSocket Connection for Real-Time Anomaly Alerts
    const ws = new WebSocket(`${getWsBaseUrl()}/ws/alerts`);
    socketRef.current = ws;

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === "alert" || data.type === "transaction") {
        const newTxn: LiveTransaction = {
          id: data.id,
          reference_id: data.reference_id,
          customer_name: data.customer_name,
          amount: data.amount,
          payment_method: data.payment_method,
          is_fraud: data.is_fraud,
          fraud_score: data.fraud_score,
          status: data.status,
          created_at: data.created_at
        };

        // Play chime sound
        playNotificationSound();

        // Append to live feed
        setLiveTransactions((prev) => [newTxn, ...prev.slice(0, 4)]);

        // Update metrics counter
        setMetrics((prev) => ({
          ...prev,
          total_transactions: prev.total_transactions + 1,
          total_revenue: data.status === "Success" ? prev.total_revenue + data.amount : prev.total_revenue,
          active_fraud_alerts: data.is_fraud ? prev.active_fraud_alerts + 1 : prev.active_fraud_alerts
        }));

        // Trigger premium soundless toast if fraud is detected
        if (data.is_fraud) {
          setToastMessage(`ShieldAI Alert: Flagged transaction from ${data.customer_name} (Score: ${data.fraud_score}%)`);
          setShowToast(true);
          setTimeout(() => setShowToast(false), 4500);
        }
      }
    };

    ws.onclose = () => {
      console.log("WebSocket connection closed");
    };

    return () => {
      if (socketRef.current) socketRef.current.close();
    };
  }, []);

  const handleRefresh = () => {
    fetchDashboardData();
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#07090e] text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-300">

      {/* Toast Alert Box */}
      {showToast && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce flex items-center gap-3 bg-rose-600 text-white px-5 py-4 rounded-2xl shadow-xl shadow-rose-600/30 border border-rose-500 max-w-md">
          <ShieldAlert size={20} className="animate-pulse shrink-0 text-white" />
          <div className="text-sm font-semibold leading-snug">
            {toastMessage}
          </div>
        </div>
      )}

      {/* Main Dashboard Layout */}
      <div className="flex-1 max-w-7xl mx-auto w-full space-y-8">

        {/* Top welcome panel */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800/80 pb-6">
          <div>
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-semibold text-xs uppercase tracking-widest mb-1.5">
              <Sparkles size={12} />
              <span>FinAI Smart Operations</span>
            </div>
            <h1 className="text-3xl font-black tracking-tight bg-gradient-to-r from-slate-900 via-slate-800 to-slate-600 dark:from-white dark:via-slate-200 dark:to-slate-400 bg-clip-text text-transparent">
              Merchant Overview
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Real-time payment aggregations, fraud modeling, and agentic workflows.</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              className="flex items-center gap-2 bg-white dark:bg-[#0c101a] border border-slate-200 dark:border-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-900 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all active:scale-95 text-slate-700 dark:text-slate-200"
            >
              <RefreshCw size={12} className={`${refreshing ? 'animate-spin' : ''}`} />
              <span>{refreshing ? 'Syncing...' : 'Force Sync'}</span>
            </button>
            <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 px-4 py-2.5 rounded-xl text-xs text-white font-bold shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/30 transition-all active:scale-95">
              <span>Settlement Ledger</span>
              <ArrowUpRight size={14} />
            </button>
          </div>
        </div>

        {/* Metric Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

          {/* Revenue Stat */}
          <div className="relative group overflow-hidden glass-card p-6 transition-all hover:-translate-y-1 duration-300">
            <div className="absolute top-0 right-0 h-24 w-24 bg-indigo-500/5 rounded-full blur-2xl group-hover:bg-indigo-500/10 transition-all"></div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Revenue</span>
              <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-xl">
                <IndianRupee size={16} />
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-3xl font-black tracking-tight">
                ₹{(metrics.total_revenue / 100000).toFixed(2)}L
              </h3>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-2">
                <TrendingUp size={12} />
                <span>Active Settlements Pipeline</span>
              </p>
            </div>
          </div>

          {/* Transactions Stat */}
          <div className="relative group overflow-hidden glass-card p-6 transition-all hover:-translate-y-1 duration-300">
            <div className="absolute top-0 right-0 h-24 w-24 bg-violet-500/5 rounded-full blur-2xl group-hover:bg-violet-500/10 transition-all"></div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Orders</span>
              <div className="p-2 bg-violet-500/10 border border-violet-500/20 text-violet-600 dark:text-violet-400 rounded-xl">
                <CreditCard size={16} />
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-3xl font-black tracking-tight">
                {metrics.total_transactions.toLocaleString()}
              </h3>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-2">
                <TrendingUp size={12} />
                <span>+8.2% vs last week</span>
              </p>
            </div>
          </div>

          {/* Success Rate Stat */}
          <div className="relative group overflow-hidden glass-card p-6 transition-all hover:-translate-y-1 duration-300">
            <div className="absolute top-0 right-0 h-24 w-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-all"></div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Success Rate</span>
              <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-xl">
                <CheckCircle2 size={16} />
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-3xl font-black tracking-tight">
                {metrics.success_rate}%
              </h3>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-2">
                <TrendingUp size={12} />
                <span>Standard SLA Guarded</span>
              </p>
            </div>
          </div>

          {/* Fraud Alerts Stat */}
          <div className="relative group overflow-hidden glass-card p-6 transition-all hover:-translate-y-1 duration-300">
            <div className="absolute top-0 right-0 h-24 w-24 bg-rose-500/5 rounded-full blur-2xl group-hover:bg-rose-500/10 transition-all"></div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Active Anomalies</span>
              <div className="p-2 bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 rounded-xl">
                <ShieldAlert size={16} />
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-3xl font-black tracking-tight">
                {metrics.active_fraud_alerts}
              </h3>
              <p className="text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1 mt-2">
                <AlertCircle size={12} />
                <span>Flagged by ML engine</span>
              </p>
            </div>
          </div>

        </div>

        {/* Charts & Interactive Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Revenue Stream chart */}
          <div className="lg:col-span-2 glass-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">Revenue Stream</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Daily business volume trends</p>
              </div>
              <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-900 p-1 rounded-lg border border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
                <button className="px-2.5 py-1 rounded bg-white dark:bg-slate-800 text-indigo-600 dark:text-white font-semibold shadow-sm">7D</button>
                <button className="px-2.5 py-1 rounded hover:text-slate-900 dark:hover:text-white transition-all">30D</button>
              </div>
            </div>

            <div className="h-72">
              {mounted && trendData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                      contentStyle={{ backgroundColor: '#0c101a', borderColor: '#1E293B', borderRadius: '12px', color: '#fff' }}
                      labelStyle={{ fontWeight: 'bold', color: '#94A3B8' }}
                    />
                    <Area type="monotone" dataKey="revenue" name="Revenue (INR)" stroke="#6366F1" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full w-full bg-slate-100 dark:bg-slate-900/30 animate-pulse rounded-2xl flex items-center justify-center text-xs text-slate-400">
                  Loading revenue analysis stream...
                </div>
              )}
            </div>
          </div>

          {/* Status breakdown pie chart */}
          <div className="glass-card p-6 flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">Ledger Distribution</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Success vs fail rates</p>
            </div>

            <div className="h-44 relative flex items-center justify-center my-4">
              {mounted && breakdownData.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={breakdownData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={70}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {breakdownData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute text-center">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Processed</span>
                    <span className="text-xl font-black text-slate-900 dark:text-white">
                      {metrics.total_transactions}
                    </span>
                  </div>
                </>
              ) : (
                <div className="h-28 w-28 rounded-full border-4 border-slate-200 dark:border-slate-800 border-t-indigo-500 animate-spin" />
              )}
            </div>

            <div className="space-y-2">
              {breakdownData.map((item, index) => (
                <div key={index} className="flex items-center justify-between text-xs p-2 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-200 dark:border-slate-800/40">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{item.name}</span>
                  </div>
                  <span className="font-bold text-slate-900 dark:text-slate-100">
                    {item.value.toLocaleString()} ({item.percentage}%)
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Real-time feed & scan-to-pay QR Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Real-time live threat feed block */}
          <div className="lg:col-span-2 glass-card p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>ShieldAI Live Stream • Real-time Threat Analysis</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Incoming payment stream analyzed on the fly by XGBoost and Isolation Forest models.</p>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Clock size={10} />
                <span>Live Listening</span>
              </span>
            </div>

            <div className="space-y-3">
              {liveTransactions.map((txn, index) => (
                <div
                  key={txn.id}
                  className={`flex flex-col md:flex-row md:items-center justify-between p-4 rounded-xl border transition-all duration-300 hover:scale-[1.01] ${
                    txn.is_fraud
                      ? "bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/40"
                      : "bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800/60"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-lg border font-mono text-xs font-bold ${
                      txn.is_fraud
                        ? "bg-rose-100/50 border-rose-200 text-rose-600 dark:bg-rose-500/20 dark:border-rose-500/30 dark:text-rose-400"
                        : "bg-slate-200/50 border-slate-300 text-slate-700 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300"
                    }`}>
                      {txn.payment_method}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900 dark:text-slate-100">{txn.customer_name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">#{txn.reference_id}</span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Processed {new Date(txn.created_at).toLocaleTimeString()}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 mt-3 md:mt-0 justify-between md:justify-end">
                    <div>
                      <p className="text-xs text-slate-400 text-left md:text-right">Transaction Amount</p>
                      <span className="inline-block font-black text-sm px-3 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/80 text-indigo-900 dark:text-indigo-200 shadow-sm">
                        ₹{txn.amount.toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 text-left md:text-right">Fraud Score</p>
                      <span className={`text-sm font-black flex items-center gap-1 justify-start md:justify-end ${
                        txn.is_fraud ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400"
                      }`}>
                        {txn.is_fraud && <ShieldAlert size={14} />}
                        {txn.fraud_score}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}

              {liveTransactions.length === 0 && (
                <div className="py-10 text-center text-xs text-slate-400 flex flex-col items-center justify-center gap-2">
                  <Clock size={16} className="text-slate-500 animate-spin" />
                  <span>Waiting for live transactions from the backend gateway stream (triggers every 12 seconds)...</span>
                </div>
              )}
            </div>
          </div>

          {/* UPI Sandbox QR Code */}
          <div className="glass-card p-6 flex flex-col justify-between space-y-4">
            <div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <span>⚡ UPI Sandbox Pay</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Simulate incoming phone transactions instantly</p>
            </div>

            <div className="text-center py-4 space-y-3 bg-slate-50/50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-2xl">
              {upiUrl ? (
                <div className="space-y-3">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(upiUrl)}&color=6366f1&bgcolor=ffffff`}
                    alt="UPI Payment QR Code"
                    className="h-36 w-36 rounded-xl border border-slate-200 dark:border-slate-800 p-2 bg-white mx-auto shadow-sm"
                  />
                  <p className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 select-all max-w-[220px] mx-auto truncate">
                    {upiUrl}
                  </p>
                </div>
              ) : (
                <div className="h-36 w-36 bg-slate-100 dark:bg-slate-900 animate-pulse rounded-xl mx-auto" />
              )}
            </div>

            <div className="text-center text-xs text-slate-500 dark:text-slate-400 font-semibold py-1">
              📲 Scan to simulate a transaction from any network
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
