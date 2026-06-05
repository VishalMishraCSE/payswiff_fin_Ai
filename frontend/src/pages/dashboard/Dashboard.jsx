import React from 'react';
import MetricCard from '../../components/dashboard/MetricCard';
import MerchantCard from '../../components/dashboard/MerchantCard';
import RevenueChart from '../../components/dashboard/RevenueChart';
import { merchants } from '../../data/merchantData'; 

export default function Dashboard() {
  const totalMerchants = merchants.length;
  const totalRevenue = merchants.reduce((sum, item) => sum + item.revenue, 0);
  const totalTransactions = merchants.reduce((sum, item) => sum + item.transactions, 0);

  return (
    <div style={{ padding: '24px', backgroundColor: '#f9fafb', minHeight: '100vh', width: '100%', boxSizing: 'border-box', textAlign: 'left' }}>
      
      {/* Header Panel */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#111827', margin: '0' }}>PaySwiff FinAI Hub</h1>
        <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px', marginBottom: '0' }}>Day 1 Interface Verification Environment</p>
      </div>

      {/* FORCE GRID FOR METRIC CARDS */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', marginBottom: '32px', width: '100%' }}>
        <MetricCard title="Total Active Merchants" value={totalMerchants} />
        <MetricCard title="Gross Volume Managed" value={`₹${totalRevenue.toLocaleString('en-IN')}`} />
        <MetricCard title="Total System Events" value={totalTransactions.toLocaleString('en-IN')} />
      </div>

      {/* Analytics Chart Block */}
      <div style={{ width: '100%', marginBottom: '32px', backgroundColor: '#ffffff', padding: '20px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
        <RevenueChart />
      </div>

      {/* FORCE GRID FOR MERCHANT PROFILES */}
      <div style={{ marginTop: '40px' }}>
        <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', marginBottom: '16px' }}>Merchant Profiles Registry</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', width: '100%' }}>
          {merchants.map((merchant) => (
            <MerchantCard key={merchant.id} merchant={merchant} />
          ))}
        </div>
      </div>

    </div>
  );
}