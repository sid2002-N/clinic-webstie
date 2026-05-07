import React, { useEffect } from 'react';
import { staggerIn } from '../../utils/animations';

interface Column {
  key: string;
  header: string;
  render?: (row: any) => React.ReactNode;
  width?: number | string;
}

interface TableAnimatedProps {
  columns: Column[];
  data: any[];
  loading?: boolean;
  emptyState?: { icon?: React.ElementType; title?: string; desc?: string };
  onRowClick?: (row: any) => void;
  striped?: boolean;
  compact?: boolean;
}

export default function TableAnimated({ columns, data, loading, emptyState, onRowClick, striped, compact }: TableAnimatedProps) {
  useEffect(() => {
    if (!loading && data.length > 0) {
      staggerIn('tbody tr');
    }
  }, [loading, data]);

  const thPad = compact ? '8px 16px' : '11px 16px';
  const tdPad = compact ? '10px 16px' : '14px 16px';

  return (
    <div style={{ border: '1px solid var(--border-default)', borderRadius: 'var(--r-lg)', overflow: 'hidden', background: 'var(--surface-base)', boxShadow: 'var(--shadow-xs)' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: 'var(--surface-subtle)', borderBottom: '1px solid var(--border-default)' }}>
            {columns.map((col) => (
              <th key={col.key} style={{
                padding: thPad, textAlign: 'left', fontSize: 'var(--text-xs)',
                fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase',
                letterSpacing: '0.06em', whiteSpace: 'nowrap', width: col.width,
              }}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <tr key={i} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                {columns.map((col, j) => (
                  <td key={col.key} style={{ padding: tdPad }}>
                    <div className="skeleton" style={{ height: 16, width: j === 0 ? 140 : j === columns.length - 1 ? 60 : 100 }} />
                  </td>
                ))}
              </tr>
            ))
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} style={{ padding: '60px 20px', textAlign: 'center' }}>
                {emptyState && (
                  <>
                    {emptyState.icon && (
                      <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--surface-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
                        <emptyState.icon size={40} style={{ color: 'var(--text-disabled)' }} />
                      </div>
                    )}
                    {emptyState.title && <p style={{ fontSize: 'var(--text-base)', fontWeight: 600, color: 'var(--text-primary)', marginTop: 12 }}>{emptyState.title}</p>}
                    {emptyState.desc && <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', maxWidth: 300, margin: '6px auto 0' }}>{emptyState.desc}</p>}
                  </>
                )}
              </td>
            </tr>
          ) : (
            data.map((row, i) => (
              <tr
                key={row.id ?? i}
                onClick={() => onRowClick?.(row)}
                style={{
                  borderBottom: i < data.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                  cursor: onRowClick ? 'pointer' : 'default',
                  background: striped && i % 2 === 1 ? 'var(--surface-subtle)' : undefined,
                  transition: 'background var(--dur-fast) var(--ease)',
                }}
                onMouseEnter={(e) => { if (onRowClick) e.currentTarget.style.background = 'var(--brand-50)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = striped && i % 2 === 1 ? 'var(--surface-subtle)' : ''; }}
              >
                {columns.map((col) => (
                  <td key={col.key} style={{ padding: tdPad, fontSize: 'var(--text-sm)', verticalAlign: 'middle' }}>
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
