export default function AnalystDashboard() {
  return (
    <div className="p-8 animate-fade-in">
      <h1 className="text-2xl font-bold tracking-tight text-white mb-6">Analyst Dashboard</h1>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {/* Placeholder metric cards */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-400">Pending Reviews</p>
          <p className="mt-2 text-3xl font-bold text-amber-400">0</p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-400">Flagged Transactions</p>
          <p className="mt-2 text-3xl font-bold text-red-400">0</p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-400">Resolved Today</p>
          <p className="mt-2 text-3xl font-bold text-emerald-400">0</p>
        </div>
      </div>
    </div>
  );
}
