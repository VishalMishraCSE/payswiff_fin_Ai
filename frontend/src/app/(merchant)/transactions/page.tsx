import { cookies } from "next/headers";
import { TransactionTable } from "@/components/transactions/TransactionTable";

async function getTransactions() {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;

  if (!token) return [];

  try {
    const res = await fetch("http://localhost:8000/transactions", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    if (!res.ok) return [];
    
    const data = await res.json();
    return data.items || [];
  } catch (error) {
    console.error("Failed to fetch transactions", error);
    return [];
  }
}

export default async function TransactionsPage() {
  const transactions = await getTransactions();

  return (
    <div className="p-8 animate-fade-in max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Transactions</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">
          View and sort your recent transaction history.
        </p>
      </div>
      
      <TransactionTable initialData={transactions} />
    </div>
  );
}
