"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { getApiBaseUrl } from "@/utils/api";
import { ChevronLeft, ChevronRight, Filter, RefreshCw, AlertTriangle, ArrowUpDown, IndianRupee } from "lucide-react";

interface Transaction {
  id: number;
  merchant_id: number;
  amount: number;
  status: string;
  fraud_score: number;
  created_at: string;
}

export default function TransactionTable() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const pageSize = 15;

  const fetchTransactions = async () => {
    setLoading(true);
    const params: Record<string, string | number> = { page, page_size: pageSize };
    if (statusFilter) params.status = statusFilter;

    try {
      const res = await axios.get(`${getApiBaseUrl()}/transactions`, { params });
      setTransactions(res.data.items);
      setTotal(res.data.total);
    } catch (err) {
      console.error("Failed to load transactions", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [page, statusFilter]);

  const totalPages = Math.ceil(total / pageSize) || 1;

  const statusBadge = (status: string) => {
    const badges: Record<string, string> = {
      success: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded-full text-xs font-bold",
      pending: "bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2.5 py-0.5 rounded-full text-xs font-bold",
      failed: "bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2.5 py-0.5 rounded-full text-xs font-bold",
    };
    return (
      <span className={`${badges[status] || badges.pending} capitalize inline-flex items-center gap-1.5`}>
        <span className={`h-1.5 w-1.5 rounded-full ${
          status === "success" ? "bg-emerald-400" : status === "failed" ? "bg-rose-400" : "bg-amber-400"
        }`}></span>
        {status}
      </span>
    );
  };

  const fraudBadge = (score: number) => {
    if (score >= 70) {
      return (
        <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded-lg">
          <AlertTriangle size={12} className="shrink-0" />
          <span>{score}% Critical</span>
        </span>
      );
    }
    if (score >= 40) {
      return (
        <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-lg">
          <span>{score}% Warning</span>
        </span>
      );
    }
    return (
      <span className="text-xs text-slate-400 px-2 py-0.5">
        {score}% Safe
      </span>
    );
  };

  return (
    <div className="card space-y-6 animate-fade-in relative overflow-hidden group">
      {/* Decorative gradient overlay */}
      <div className="absolute top-0 right-0 h-48 w-48 bg-indigo-500/5 rounded-full blur-3xl group-hover:bg-indigo-500/10 transition-all duration-500"></div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <span>Transaction Ledger</span>
            {loading && <RefreshCw size={14} className="animate-spin text-indigo-400" />}
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            {total.toLocaleString()} transactions archived in cloud data-lake
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs">
            <Filter size={14} className="text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="bg-transparent text-slate-300 font-medium focus:outline-none cursor-pointer"
            >
              <option value="">All Statuses</option>
              <option value="success">Success</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
          </div>
          <button
            onClick={fetchTransactions}
            className="p-2 bg-slate-900 border border-slate-800 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-all"
          >
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              <th className="pb-3 pl-2">ID</th>
              <th className="pb-3">Merchant ID</th>
              <th className="pb-3">Date & Time</th>
              <th className="pb-3">Amount</th>
              <th className="pb-3">Status</th>
              <th className="pb-3 text-right pr-2">Fraud Score</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/40">
            {transactions.map((txn) => (
              <tr key={txn.id} className="group hover:bg-slate-900/30 transition-all">
                <td className="py-4 pl-2 font-mono text-xs text-indigo-400">#{txn.id}</td>
                <td className="py-4 text-xs font-semibold text-slate-300">MID-{txn.merchant_id}</td>
                <td className="py-4 text-xs text-slate-400">
                  {txn.created_at ? new Date(txn.created_at).toLocaleString() : "Recently"}
                </td>
                <td className="py-4 text-xs text-slate-100 font-bold">
                  ₹{(txn.amount / 100).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </td>
                <td className="py-4">{statusBadge(txn.status)}</td>
                <td className="py-4 pr-2 text-right">{fraudBadge(txn.fraud_score)}</td>
              </tr>
            ))}
            {transactions.length === 0 && !loading && (
              <tr>
                <td colSpan={6} className="py-12 text-center text-xs text-slate-450">
                  No transaction records found matching your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination controls */}
      <div className="flex items-center justify-between text-xs text-slate-400 pt-4 border-t border-slate-800/60">
        <span className="font-medium">
          Showing page <span className="text-white">{page}</span> of <span className="text-white">{totalPages}</span>
        </span>
        <div className="flex items-center gap-2">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="flex items-center gap-1 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 hover:text-white text-slate-400 px-3 py-2 transition-all disabled:opacity-30 disabled:pointer-events-none"
          >
            <ChevronLeft size={14} />
            <span>Previous</span>
          </button>
          <button
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="flex items-center gap-1 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 hover:text-white text-slate-400 px-3 py-2 transition-all disabled:opacity-30 disabled:pointer-events-none"
          >
            <span>Next</span>
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
