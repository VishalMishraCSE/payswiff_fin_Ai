export default function AnalystDashboard() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Analyst Dashboard</h1>
      <div className="mt-4 grid grid-cols-3 gap-4">
        <div className="rounded-lg bg-slate-800 p-6 shadow">Data Insights</div>
        <div className="rounded-lg bg-slate-800 p-6 shadow">Report Generation</div>
        <div className="rounded-lg bg-slate-800 p-6 shadow">Anomaly Detection</div>
      </div>
    </div>
  );
}
