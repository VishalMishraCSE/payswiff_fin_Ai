import React from 'react';

export default function MerchantCard({ merchant }) {
  const riskColors = {
    Low: { bg: '#d1fae5', text: '#065f46' },
    Medium: { bg: '#fef3c7', text: '#92400e' },
    High: { bg: '#fee2e2', text: '#991b1b' },
  };

  const kycColors = {
    Verified: { bg: '#dbeafe', text: '#1e40af' },
    Pending: { bg: '#ffedd5', text: '#9a3412' },
    "Under Review": { bg: '#f3e8ff', text: '#6b21a8' },
  };

  const currentRisk = riskColors[merchant.risk] || { bg: '#f3f4f6', text: '#374151' };
  const currentKyc = kycColors[merchant.kyc] || { bg: '#f3f4f6', text: '#374151' };

  return (
    <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '24px', border: '1px solid #e5e7eb', flex: '1 1 calc(50% - 24px)', minWidth: '300px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', boxSizing: 'border-box' }}>
      
      <div style={{ display: 'flex', justifyContent: 'between', alignItems: 'start', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', margin: '0' }}>{merchant.name}</h3>
          <p style={{ fontSize: '12px', color: '#6b7280', margin: '4px 0 0 0' }}>{merchant.category}</p>
        </div>
        <span style={{ fontSize: '12px', fontWeight: '600', padding: '2px 10px', borderRadius: '9999px', backgroundColor: currentRisk.bg, color: currentRisk.text }}>
          {merchant.risk} Risk
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', margin: '16px 0', fontSize: '14px' }}>
        <div>
          <p style={{ color: '#9ca3af', fontSize: '12px', margin: '0' }}>Revenue</p>
          <p style={{ fontWeight: '700', color: '#111827', margin: '4px 0 0 0' }}>₹{merchant.revenue.toLocaleString('en-IN')}</p>
        </div>
        <div>
          <p style={{ color: '#9ca3af', fontSize: '12px', margin: '0' }}>Settlements</p>
          <p style={{ fontWeight: '600', color: '#374151', margin: '4px 0 0 0' }}>₹{merchant.settlements.toLocaleString('en-IN')}</p>
        </div>
        <div>
          <p style={{ color: '#9ca3af', fontSize: '12px', margin: '0' }}>Transactions</p>
          <p style={{ fontWeight: '600', color: '#374151', margin: '4px 0 0 0' }}>{merchant.transactions}</p>
        </div>
        <div>
          <p style={{ color: '#9ca3af', fontSize: '12px', margin: '0' }}>Growth</p>
          <p style={{ fontWeight: '600', margin: '4px 0 0 0', color: merchant.growth >= 0 ? '#16a34a' : '#dc2626' }}>
            {merchant.growth >= 0 ? `+${merchant.growth}%` : `${merchant.growth}%`}
          </p>
        </div>
      </div>

      <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
        <span style={{ fontSize: '12px', color: '#9ca3af' }}>KYC Status</span>
        <span style={{ fontSize: '12px', fontWeight: '500', padding: '2px 10px', borderRadius: '4px', backgroundColor: currentKyc.bg, color: currentKyc.text }}>
          {merchant.kyc}
        </span>
      </div>

    </div>
  );
}