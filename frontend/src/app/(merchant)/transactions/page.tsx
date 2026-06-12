import { TransactionTable } from "@/components/transactions/TransactionTable";

export default function TransactionsPage() {
  return (
    <div className="p-8 animate-fade-in max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Transactions</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">
          View and sort your recent transaction history.
        </p>
      </div>
      
      <TransactionTable />
    </div>
  );
}
