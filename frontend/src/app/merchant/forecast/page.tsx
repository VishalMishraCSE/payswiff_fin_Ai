"use client";

import React, { useState, useEffect } from "react";
import {
  TrendingUp,
  Sparkles,
  Calendar,
  Percent,
  LineChart as ChartIcon,
  ShieldCheck,
  Info,
  Clock
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import axios from "axios";

export default function ForecastPage() {
  const [data, setData] = useState<any[]>([]);
  const [metadata, setMetadata] = useState<any>({
    algorithm: "Prophet",
    confidence_interval: "95%",
    rmse: 0,
    insights: ""
  });
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const fetchForecast = async () => {
      try {
        const res = await axios.get("http://localhost:8000/analytics/forecast");
        setData(res.data.data);
        setMetadata(res.data.model_metadata);
      } catch (err) {
        console.error("Failed to load forecast data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchForecast();
  }, []);

  return (
    <div className="min-h-[calc(100vh-8rem)] flex flex-col bg-slate-50 dark:bg-[#07090e] transition-colors duration-300">

      {/* Title */}
      <div className="border-b border-slate-200 dark:border-slate-800/80 pb-4 mb-6">
        <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-xs uppercase tracking-widest mb-1">
          <Sparkles size={12} className="animate-pulse" />
          <span>Predictive Financial Forecasting</span>
        </div>
        <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
          Revenue Forecasting
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Machine learning time-series models generating projected settlement volumes and seasonal cashflow forecasts.
        </p>
      </div>

      {/* Main Area */}
      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
          <Clock className="animate-spin text-indigo-500" size={24} />
          <span className="text-xs">Running Prophet time-series calculations...</span>
        </div>
      ) : (
        <div className="space-y-6 max-w-7xl mx-auto w-full">

          {/* Metrics summary widgets */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            <div className="bg-white dark:bg-[#0c101a] border border-slate-200 dark:border-slate-800/60 rounded-2xl p-5 shadow-sm">
              <span className="text-xs text-slate-400 uppercase tracking-wider font-bold">Algorithmic Base</span>
              <h3 className="text-lg font-black text-slate-900 dark:text-white mt-1 flex items-center gap-1.5">
                <ChartIcon size={16} className="text-indigo-500" />
                <span>{metadata.algorithm}</span>
              </h3>
            </div>

            <div className="bg-white dark:bg-[#0c101a] border border-slate-200 dark:border-slate-800/60 rounded-2xl p-5 shadow-sm">
              <span className="text-xs text-slate-400 uppercase tracking-wider font-bold">Confidence bounds</span>
              <h3 className="text-lg font-black text-slate-900 dark:text-white mt-1 flex items-center gap-1.5">
                <Percent size={16} className="text-emerald-500" />
                <span>{metadata.confidence_interval} CI Threshold</span>
              </h3>
            </div>

            <div className="bg-white dark:bg-[#0c101a] border border-slate-200 dark:border-slate-800/60 rounded-2xl p-5 shadow-sm">
              <span className="text-xs text-slate-400 uppercase tracking-wider font-bold">Root Mean Squared Error (RMSE)</span>
              <h3 className="text-lg font-black text-slate-900 dark:text-white mt-1 flex items-center gap-1.5">
                <ShieldCheck size={16} className="text-indigo-500" />
                <span>{metadata.rmse.toLocaleString()} INR</span>
              </h3>
            </div>

          </div>

          {/* Forecasting Chart */}
          <div className="bg-white dark:bg-[#0c101a] border border-slate-200 dark:border-slate-800/65 rounded-2xl p-6 shadow-sm space-y-4">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Revenue Projection Model</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Actual sales logs vs Next 7 days prediction line</p>
            </div>

            <div className="h-80">
              {mounted && (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data} margin={{ top: 10, right: 15, left: -10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorHist" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366F1" stopOpacity={0.35}/>
                        <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorFcst" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#A78BFA" stopOpacity={0.35}/>
                        <stop offset="95%" stopColor="#A78BFA" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                    <XAxis dataKey="day" stroke="#64748B" fontSize={11} tickLine={false} />
                    <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0c101a', borderColor: '#1E293B', borderRadius: '12px', color: '#fff' }}
                    />
                    {/* Render historical area */}
                    <Area
                      type="monotone"
                      dataKey={(item) => item.type === "historical" ? item.revenue : null}
                      name="Historical Revenue (INR)"
                      stroke="#6366F1"
                      strokeWidth={2.5}
                      fill="url(#colorHist)"
                    />
                    {/* Render forecasting area */}
                    <Area
                      type="monotone"
                      dataKey={(item) => item.type === "forecast" ? item.revenue : null}
                      name="Forecasted Revenue (INR)"
                      stroke="#A78BFA"
                      strokeWidth={2.5}
                      strokeDasharray="4 4"
                      fill="url(#colorFcst)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* AI Generative Summary */}
          <div className="bg-[#eff6ff] dark:bg-indigo-950/10 border border-blue-200 dark:border-indigo-500/20 rounded-2xl p-6 shadow-sm flex items-start gap-4">
            <Info className="text-blue-600 dark:text-indigo-400 shrink-0 mt-0.5" size={20} />
            <div className="space-y-2">
              <h3 className="font-bold text-sm text-blue-900 dark:text-indigo-300 flex items-center gap-1.5">
                <span>`[GenAI] Forecasting Summary Report`</span>
              </h3>
              <p className="text-xs text-blue-800 dark:text-slate-300 leading-relaxed font-medium">
                {metadata.insights}
              </p>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
