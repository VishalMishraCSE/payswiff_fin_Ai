export default function MerchantDashboard() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Merchant Overview</h1>
      <div className="mt-4 grid grid-cols-3 gap-4">
        <div className="rounded-lg bg-slate-800 p-6 shadow">Total Revenue</div>
        <div className="rounded-lg bg-slate-800 p-6 shadow">Transaction Volume</div>
        <div className="rounded-lg bg-slate-800 p-6 shadow">Fraud Alerts</div>
      </div>
    </div>
  );
}
