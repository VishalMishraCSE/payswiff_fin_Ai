export default function AdminDashboard() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      <div className="mt-4 grid grid-cols-3 gap-4">
        <div className="rounded-lg bg-slate-800 p-6 shadow">User Management</div>
        <div className="rounded-lg bg-slate-800 p-6 shadow">System Logs</div>
        <div className="rounded-lg bg-slate-800 p-6 shadow">Tenant Settings</div>
      </div>
    </div>
  );
}
