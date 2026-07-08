"use client";

import { useState } from "react";
import LinkElem from "next/link";
import { Shield, Mail, Lock, UserPlus, Loader2, AlertCircle, CheckCircle2, Sparkles, TrendingUp, Activity } from "lucide-react";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("merchant");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Registration failed");

      setSuccess("Account created successfully! Redirecting to login...");
      setTimeout(() => {
        window.location.href = "/login";
      }, 1500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-100 via-slate-50 to-teal-50/30 dark:from-[#07090e] dark:via-[#0c101a] dark:to-[#0a0d16] p-4 md:p-8 transition-colors duration-300">

      {/* Background ambient glowing spheres */}
      <div className="absolute top-1/4 left-10 w-96 h-96 bg-teal-500/10 dark:bg-teal-500/15 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-indigo-500/10 dark:bg-indigo-500/15 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl shadow-2xl overflow-hidden relative z-10">

        {/* Left Column: Fintech Feature Showcase (Hidden on small mobile, spans 7 cols on lg) */}
        <div className="hidden lg:flex lg:col-span-7 p-10 flex-col justify-between relative overflow-hidden bg-gradient-to-br from-teal-900/90 via-slate-900 to-[#07090e] text-white border-r border-slate-800">
          <div className="absolute top-0 right-0 w-72 h-72 bg-teal-500/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-indigo-500/20 rounded-full blur-3xl"></div>

          {/* Top Brand */}
          <div className="flex items-center gap-3 relative z-10">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-teal-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-teal-500/30">
              <Shield className="h-5 w-5 text-white animate-pulse" />
            </div>
            <span className="text-xl font-black tracking-wider bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
              FinAI Platform
            </span>
          </div>

          {/* Center Hero Banner */}
          <div className="space-y-6 relative z-10 my-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-500/20 border border-teal-500/30 text-teal-300 text-xs font-semibold">
              <Sparkles size={14} className="text-teal-400" />
              <span>Join the Autonomous Era</span>
            </div>
            <h1 className="text-4xl font-black tracking-tight leading-tight">
              Create Your Merchant or Fraud Analyst Account
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed max-w-md">
              Gain instant access to real-time transaction monitoring, instant KYC document verification, and GenAI risk copilots.
            </p>

            {/* Floating Live Stat Card */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md space-y-3 max-w-md shadow-xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Activity size={14} className="text-teal-400 animate-pulse" />
                  <span>Onboarding Engine</span>
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30">
                  Instant Verification
                </span>
              </div>
              <div className="flex items-center justify-between text-xs font-mono text-slate-300">
                <span>Active Merchants & Analysts</span>
                <span className="font-bold text-white text-sm">10,480+ Active</span>
              </div>
            </div>
          </div>

          {/* Bottom Trust Badges */}
          <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/10 relative z-10 text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-teal-400 shrink-0" />
              <span>Enterprise-Grade Security</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp size={16} className="text-indigo-400 shrink-0" />
              <span>Sub-second Audit Logging</span>
            </div>
          </div>
        </div>

        {/* Right Column: Register Card (Spans 5 cols on lg) */}
        <div className="col-span-1 lg:col-span-5 p-8 lg:p-10 flex flex-col justify-center relative bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">

          <div className="flex flex-col items-start mb-6">
            <div className="lg:hidden flex items-center gap-2 mb-6">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-teal-500 to-indigo-500 flex items-center justify-center text-white shadow-md">
                <Shield className="h-5 w-5" />
              </div>
              <span className="text-lg font-black tracking-wider text-slate-900 dark:text-white">FinAI</span>
            </div>
            <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">Create Account</h2>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Register your credentials to get started</p>
          </div>

          {error && (
            <div className="mb-4 flex items-center gap-2.5 rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs font-semibold text-rose-600 dark:text-rose-400 animate-fade-in">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-4 flex items-center gap-2.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs font-semibold text-emerald-600 dark:text-emerald-400 animate-fade-in">
              <CheckCircle2 className="h-5 w-5 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <div>
              <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider block mb-1.5">Email Address</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400 dark:text-slate-500">
                  <Mail size={16} />
                </span>
                <input
                  type="email"
                  required
                  placeholder="name@company.com"
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/80 pl-10 pr-4 py-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all shadow-sm"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider block mb-1.5">Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400 dark:text-slate-500">
                  <Lock size={16} />
                </span>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/80 pl-10 pr-4 py-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all shadow-sm"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider block mb-1.5">Account Role</label>
              <select
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/80 py-3 px-4 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all shadow-sm"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="merchant">Merchant</option>
                <option value="analyst">Fraud Analyst</option>
                <option value="admin">System Admin</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-500 hover:to-teal-600 py-3.5 font-bold text-sm text-white shadow-lg shadow-teal-500/25 transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <span>Create Account</span>
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400">
            Already have an account?{" "}
            <LinkElem href="/login" className="text-teal-600 dark:text-teal-400 font-bold hover:underline transition-all">
              Login here
            </LinkElem>
          </div>
        </div>

      </div>
    </div>
  );
}
