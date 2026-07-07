"use client";

import { useState, useEffect } from "react";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { getApiBaseUrl, getWsBaseUrl } from "@/utils/api";

export type Transaction = {
  id: number;
  reference_id: string;
  merchant_id: number;
  customer_name: string;
  customer_email: string;
  amount: number;
  currency: string;
  status: string;
  payment_method: string;
  is_fraud: boolean;
  fraud_score: number;
  created_at: string;
};

// Fallback mock data if API fails or returns empty
const mockData: Transaction[] = [
  { id: 101, reference_id: "REF123", merchant_id: 1, customer_name: "John Doe", customer_email: "john@example.com", amount: 150.5, currency: "USD", status: "Success", payment_method: "Card", is_fraud: false, fraud_score: 0.01, created_at: "2023-10-27T10:30:00Z" },
];

export function TransactionTable({ initialData = [] }: { initialData?: Transaction[] }) {
  const [data, setData] = useState<Transaction[]>(initialData.length > 0 ? initialData : mockData);
  const [sortConfig, setSortConfig] = useState<{ key: keyof Transaction; direction: "asc" | "desc" } | null>(null);

  // Form states for Mock Payment Sandbox
  const [showSandbox, setShowSandbox] = useState(false);
  const [customerName, setCustomerName] = useState("Rahul Sharma");
  const [customerEmail, setCustomerEmail] = useState("rahul.sharma@gmail.com");
  const [amount, setAmount] = useState("12000");
  const [paymentMethod, setPaymentMethod] = useState("Card");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sandboxResult, setSandboxResult] = useState<{ success: boolean; message: string } | null>(null);

  // 1. Live WebSocket Sync
  useEffect(() => {
    const ws = new WebSocket(`${getWsBaseUrl()}/ws/alerts`);
    ws.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload.type === "transaction" || payload.type === "alert") {
          const newTxn: Transaction = {
            id: payload.id,
            reference_id: payload.reference_id,
            merchant_id: payload.merchant_id || 1,
            customer_name: payload.customer_name,
            customer_email: payload.customer_email || `${payload.customer_name.toLowerCase().replace(" ", "_")}@example.com`,
            amount: payload.amount,
            currency: "INR",
            status: payload.status,
            payment_method: payload.payment_method,
            is_fraud: payload.is_fraud,
            fraud_score: payload.fraud_score / 100.0,
            created_at: payload.created_at || new Date().toISOString(),
          };
          setData((prev) => {
            // Avoid duplicate records if transaction is double received
            if (prev.some(t => t.id === newTxn.id || t.reference_id === newTxn.reference_id)) {
              return prev;
            }
            return [newTxn, ...prev];
          });
        }
      } catch (err) {
        console.error("WS error parsing event", err);
      }
    };
    return () => {
      ws.close();
    };
  }, []);

  useEffect(() => {
    if (initialData.length > 0) {
      setData(initialData);
    }
  }, [initialData]);

  // Handle Mock Pay Submission
  const handleMockPay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setSandboxResult(null);

    try {
      const res = await fetch(`${getApiBaseUrl()}/transactions/mock-pay`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customer_name: customerName,
          customer_email: customerEmail,
          amount: parseFloat(amount),
          payment_method: paymentMethod,
        }),
      });

      if (!res.ok) {
        throw new Error(`HTTP Error ${res.status}`);
      }

      const txn = await res.json();
      setSandboxResult({
        success: txn.status === "Success",
        message: txn.is_fraud
          ? `⚠️ Payment Flagged: Fraud risk detected (Score: ${(txn.fraud_score * 100).toFixed(0)}%). Status: ${txn.status}.`
          : `🎉 Payment successful! Txn Ref: ${txn.reference_id}. Status: ${txn.status}.`,
      });

      // Clear result message after 6 seconds
      setTimeout(() => setSandboxResult(null), 6000);
    } catch (err: any) {
      console.error(err);
      setSandboxResult({
        success: false,
        message: `Error executing payment simulation: ${err.message || err}`,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSort = (key: keyof Transaction) => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }

    const sortedData = [...data].sort((a, b) => {
      if (a[key] < b[key]) {
        return direction === "asc" ? -1 : 1;
      }
      if (a[key] > b[key]) {
        return direction === "asc" ? 1 : -1;
      }
      return 0;
    });

    setData(sortedData);
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key: keyof Transaction) => {
    if (!sortConfig || sortConfig.key !== key) {
      return <ArrowUpDown className="ml-1 h-4 w-4 text-slate-400" />;
    }
    return sortConfig.direction === "asc" ? (
      <ArrowUp className="ml-1 h-4 w-4 text-teal-500" />
    ) : (
      <ArrowDown className="ml-1 h-4 w-4 text-teal-500" />
    );
  };

  return (
    <div className="space-y-6">
      {/* Sandbox Toggle Button */}
      <div className="flex justify-end">
        <button
          onClick={() => setShowSandbox(!showSandbox)}
          className="flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
        >
          <span>⚡ {showSandbox ? "Close Sandbox" : "Open Payment Sandbox"}</span>
        </button>
      </div>

      {/* Sandbox Form Panel */}
      {showSandbox && (
        <div className="p-6 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-2xl animate-fade-in shadow-sm">
          <h2 className="text-sm font-black uppercase text-slate-800 dark:text-slate-200 tracking-wider mb-4">
            Test Sandbox Payment Gateway
          </h2>
          <form onSubmit={handleMockPay} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 mb-1.5">
                Customer Name
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                required
                className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                required
                className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 mb-1.5">
                Amount (INR)
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                min="1"
                className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 mb-1.5">
                Payment Route
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-900 dark:text-white"
              >
                <option value="Card">Card Payment</option>
                <option value="UPI">UPI Payment</option>
                <option value="NetBanking">NetBanking</option>
              </select>
            </div>
            <div className="md:col-span-4 flex justify-end gap-3 items-center mt-2">
              {sandboxResult && (
                <div className={`text-xs font-semibold px-3.5 py-1.5 rounded-lg mr-auto ${
                  sandboxResult.success
                    ? "bg-emerald-100 dark:bg-emerald-500/10 text-emerald-800 dark:text-emerald-450 border border-emerald-250 dark:border-emerald-500/20"
                    : "bg-rose-100 dark:bg-rose-500/10 text-rose-800 dark:text-rose-450 border border-rose-250 dark:border-rose-500/20"
                }`}>
                  {sandboxResult.message}
                </div>
              )}
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? "Processing Pay..." : "Process Test Payment"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Transactions Table Layout */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-200">
              <tr>
                <th className="p-4 font-semibold cursor-pointer select-none" onClick={() => handleSort("id")}>
                  <div className="flex items-center">Txn ID {getSortIcon("id")}</div>
                </th>
                <th className="p-4 font-semibold cursor-pointer select-none" onClick={() => handleSort("created_at")}>
                  <div className="flex items-center">Date & Time {getSortIcon("created_at")}</div>
                </th>
                <th className="p-4 font-semibold cursor-pointer select-none" onClick={() => handleSort("customer_name")}>
                  <div className="flex items-center">Customer {getSortIcon("customer_name")}</div>
                </th>
                <th className="p-4 font-semibold cursor-pointer select-none" onClick={() => handleSort("amount")}>
                  <div className="flex items-center">Amount {getSortIcon("amount")}</div>
                </th>
                <th className="p-4 font-semibold cursor-pointer select-none" onClick={() => handleSort("status")}>
                  <div className="flex items-center">Status {getSortIcon("status")}</div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {data.map((txn) => (
                <tr key={txn.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/25 transition-colors">
                  <td className="p-4 font-medium text-slate-900 dark:text-white">#{txn.id}</td>
                  <td className="p-4">{new Date(txn.created_at).toLocaleString()}</td>
                  <td className="p-4">{txn.customer_name}</td>
                  <td className="p-4 font-medium text-slate-900 dark:text-white">
                    {txn.currency === "INR" ? "₹" : "$"}{txn.amount.toFixed(2)}
                  </td>
                  <td className="p-4">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        txn.status === "Success" || txn.status === "Completed"
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-400"
                          : txn.status === "Pending"
                          ? "bg-amber-100 text-amber-800 dark:bg-amber-500/10 dark:text-amber-400"
                          : "bg-rose-100 text-rose-800 dark:bg-rose-500/10 dark:text-rose-400"
                      }`}
                    >
                      {txn.status}
                    </span>
                  </td>
                </tr>
              ))}
              {data.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">
                    No transactions found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
