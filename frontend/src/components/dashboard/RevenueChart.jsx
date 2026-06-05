import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const chartData = [
  { month: "Jan", revenue: 250000 },
  { month: "Feb", revenue: 320000 },
  { month: "Mar", revenue: 280000 },
  { month: "Apr", revenue: 450000 },
  { month: "May", revenue: 420000 },
  { month: "Jun", revenue: 580000 },
];

export default function RevenueChart() {
  return (
    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 w-full min-w-0">
      <h3 className="text-lg font-bold text-gray-900 mb-6">6-Month Revenue Forecast</h3>
      
      <div className="w-full min-w-0 block">
        <ResponsiveContainer width="99%" height={300}>
          <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#4B5563', fontSize: 12 }} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#4B5563', fontSize: 12 }} tickFormatter={(value) => `₹${value / 1000}k`} />
            <Tooltip formatter={(value) => [`₹${value.toLocaleString('en-IN')}`, "Revenue"]} />
            <Line type="monotone" dataKey="revenue" stroke="#4F46E5" strokeWidth={3} dot={{ r: 4, fill: '#4F46E5' }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}