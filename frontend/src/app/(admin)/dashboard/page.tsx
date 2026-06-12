export default function AdminDashboard() {
  return (
    <div className="p-8 animate-fade-in">
      <h1 className="text-2xl font-bold tracking-tight text-white mb-6">Admin Dashboard</h1>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* Placeholder metric cards */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-400">Total Merchants</p>
          <p className="mt-2 text-3xl font-bold text-white">0</p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-400">Active Users</p>
          <p className="mt-2 text-3xl font-bold text-white">0</p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-400">System Alerts</p>
          <p className="mt-2 text-3xl font-bold text-white">0</p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-400">API Requests</p>
          <p className="mt-2 text-3xl font-bold text-white">0</p>
        </div>
      </div>
    </div>
  );
}
