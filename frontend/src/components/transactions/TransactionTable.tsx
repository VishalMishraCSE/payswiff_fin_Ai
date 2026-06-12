"use client";

import { useState } from "react";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";

type Transaction = {
  id: string;
  date: string;
  amount: number;
  status: "Completed" | "Pending" | "Failed";
  merchant: string;
};

const mockData: Transaction[] = [
  { id: "TXN-101", date: "2023-10-27T10:30:00Z", amount: 150.5, status: "Completed", merchant: "Amazon" },
  { id: "TXN-102", date: "2023-10-27T14:45:00Z", amount: 25.0, status: "Pending", merchant: "Starbucks" },
  { id: "TXN-103", date: "2023-10-26T09:15:00Z", amount: 1200.0, status: "Completed", merchant: "Apple Store" },
  { id: "TXN-104", date: "2023-10-26T18:20:00Z", amount: 45.75, status: "Failed", merchant: "Uber" },
  { id: "TXN-105", date: "2023-10-25T11:00:00Z", amount: 89.99, status: "Completed", merchant: "Netflix" },
  { id: "TXN-106", date: "2023-10-24T16:30:00Z", amount: 350.0, status: "Completed", merchant: "Nike" },
  { id: "TXN-107", date: "2023-10-24T08:10:00Z", amount: 12.5, status: "Pending", merchant: "McDonalds" },
];

export function TransactionTable() {
  const [data, setData] = useState<Transaction[]>(mockData);
  const [sortConfig, setSortConfig] = useState<{ key: keyof Transaction; direction: "asc" | "desc" } | null>(null);

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
                <div className="flex items-center">Transaction ID {getSortIcon("id")}</div>
              </th>
              <th className="p-4 font-semibold cursor-pointer select-none" onClick={() => handleSort("date")}>
                <div className="flex items-center">Date & Time {getSortIcon("date")}</div>
              </th>
              <th className="p-4 font-semibold cursor-pointer select-none" onClick={() => handleSort("merchant")}>
                <div className="flex items-center">Merchant {getSortIcon("merchant")}</div>
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
                <td className="p-4 font-medium text-slate-900 dark:text-white">{txn.id}</td>
                <td className="p-4">{new Date(txn.date).toLocaleString()}</td>
                <td className="p-4">{txn.merchant}</td>
                <td className="p-4 font-medium text-slate-900 dark:text-white">
                  ${txn.amount.toFixed(2)}
                </td>
                <td className="p-4">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      txn.status === "Completed"
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
          </tbody>
        </table>
      </div>
    </div>
  );
}
