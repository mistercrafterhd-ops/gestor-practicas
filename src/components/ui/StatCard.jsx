import React from 'react';

export const StatCard = ({ title, value, icon, color, trend }) => {
  return (
    <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderTop: `4px solid ${color}` }}>
      <div style={{ padding: '1rem', borderRadius: 'var(--radius-md)', background: `${color}15`, color: color }}>
        {icon}
      </div>
      <div>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: '600', marginBottom: '0.25rem' }}>{title}</p>
        <div style={{ display: 'flex', alignItems: 'end', gap: '0.5rem' }}>
          <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-primary)', lineHeight: 1 }}>{value}</h3>
          {trend && <span style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--status-active)' }}>{trend}</span>}
        </div>
      </div>
    </div>
  );
};
