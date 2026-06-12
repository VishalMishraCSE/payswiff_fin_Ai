"use client";

import { useState, useEffect } from "react";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";

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

  useEffect(() => {
    if (initialData.length > 0) {
      setData(initialData);
    }
  }, [initialData]);

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
                  ${txn.amount.toFixed(2)}
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
  );
}
