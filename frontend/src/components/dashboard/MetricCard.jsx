import React from 'react';

export default function MetricCard({ title, value }) {
  return (
    <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '24px', border: '1px solid #e5e7eb', flex: '1 1 calc(33.333% - 20px)', minWidth: '240px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', boxSizing: 'border-box' }}>
      <h3 style={{ color: '#9ca3af', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0' }}>
        {title}
      </h3>
      <p style={{ fontSize: '28px', fontWeight: '900', color: '#111827', marginTop: '8px', marginBottom: '0' }}>
        {value}
      </p>
    </div>
  );
}