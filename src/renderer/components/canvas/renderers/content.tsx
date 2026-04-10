import React from 'react';
import { Renderer, px, toTextAlign, safeInt, VARIANT_COLORS } from '../utils';

export const contentRenderers: Record<string, Renderer> = {
  Text: ({ node, commonProps }) => (
    <div {...commonProps} style={{
      ...commonProps.style,
      fontSize: px(node.props.size),
      fontWeight: node.props.weight ?? undefined,
      textAlign: toTextAlign(node.props.align),
      lineHeight: node.props.lineHeight ?? undefined,
      textDecoration: node.props.decoration ?? undefined,
      textTransform: (node.props.transform as React.CSSProperties['textTransform']) ?? undefined,
      ...(node.props.truncate === 'true' ? { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const } : {}),
      ...(node.props.maxLines ? {
        display: '-webkit-box',
        WebkitLineClamp: safeInt(node.props.maxLines, 1),
        WebkitBoxOrient: 'vertical' as const,
        overflow: 'hidden',
      } : {}),
    }}>
      {node.textContent ?? ''}
    </div>
  ),

  Image: ({ node, commonProps }) => {
    const fileName = node.props.src ? node.props.src.split('/').pop() : undefined;
    return (
      <div {...commonProps} style={{
        ...commonProps.style,
        background: 'var(--bg-tertiary)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        minHeight: '80px',
        borderRadius: px(node.props.radius),
        color: 'var(--text-secondary)', fontSize: '12px',
      }}>
        {fileName ?? node.props.alt ?? 'Image'}
      </div>
    );
  },

  Icon: ({ node, commonProps }) => (
    <span {...commonProps} style={{
      ...commonProps.style,
      fontSize: px(node.props.size) ?? '16px',
      color: node.props.color ?? 'var(--text-primary)',
    }}>
      {node.props.name ?? '⬡'}
    </span>
  ),

  Divider: ({ node, commonProps }) => {
    const isVertical = node.props.direction === 'vertical';
    const t = node.props.thickness ?? '1';
    if (isVertical) {
      return (
        <div {...commonProps} style={{
          ...commonProps.style,
          borderLeft: `${t}px solid var(--border-color)`,
          height: '100%', margin: '0 8px',
        }} />
      );
    }
    return (
      <hr {...commonProps} style={{
        ...commonProps.style,
        border: 'none',
        borderTop: `${t}px solid var(--border-color)`,
        margin: '8px 0', width: '100%',
      }} />
    );
  },

  Avatar: ({ node, commonProps }) => {
    const sz = px(node.props.size) ?? '40px';
    const hasSrc = !!node.props.src;
    const statusColors: Record<string, string> = { online: '#22c55e', offline: '#9ca3af', busy: '#ef4444', away: '#eab308' };
    const statusColor = statusColors[node.props.status ?? ''];
    return (
      <div {...commonProps} style={{
        ...commonProps.style,
        width: sz, height: sz,
        borderRadius: '50%', background: 'var(--bg-tertiary)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '14px', color: 'var(--text-secondary)',
        position: 'relative',
      }}>
        {hasSrc ? '🖼' : (node.props.name ?? 'U')[0]}
        {statusColor && (
          <div style={{
            position: 'absolute', right: '0', bottom: '0',
            width: '25%', height: '25%', minWidth: '8px', minHeight: '8px',
            borderRadius: '50%', background: statusColor,
            border: '2px solid white',
          }} />
        )}
      </div>
    );
  },

  Badge: ({ node, commonProps }) => {
    const v = VARIANT_COLORS[node.props.variant ?? ''];
    if (node.props.dot === 'true') {
      return <span {...commonProps} style={{ ...commonProps.style, display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: v?.bg ?? node.props.color ?? 'var(--accent)' }} />;
    }
    return (
      <span {...commonProps} style={{
        ...commonProps.style,
        padding: '2px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: 600,
        background: v?.bg ?? node.props.color ?? 'var(--accent)',
        color: v?.text ?? '#fff',
      }}>
        {node.props.label ?? 'Badge'}
      </span>
    );
  },

  Tag: ({ node, commonProps }) => {
    const v = VARIANT_COLORS[node.props.variant ?? ''];
    return (
      <span {...commonProps} style={{
        ...commonProps.style,
        padding: '2px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: 600,
        background: v?.bg ?? node.props.color ?? 'var(--accent)',
        color: v?.text ?? '#fff',
        display: 'inline-flex', alignItems: 'center', gap: '4px',
      }}>
        {node.props.label ?? 'Tag'}
        {node.props.closable === 'true' && <span style={{ fontSize: '10px', opacity: 0.7 }}>✕</span>}
      </span>
    );
  },

  ProgressBar: ({ node, commonProps }) => {
    const val = safeInt(node.props.value, 50);
    const max = Math.max(1, safeInt(node.props.max, 100));
    const pct = Math.min(100, val / max * 100);
    return (
      <div {...commonProps} style={{ ...commonProps.style, width: node.props.width ?? '100%' }}>
        {node.props.label && <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>{node.props.label}</div>}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ flex: 1, height: '8px', background: 'var(--bg-tertiary)', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${pct}%`, background: node.props.color ?? 'var(--accent)', borderRadius: '4px' }} />
          </div>
          {node.props.showPercent === 'true' && <span style={{ fontSize: '11px', color: 'var(--text-secondary)', flexShrink: 0 }}>{Math.round(pct)}%</span>}
        </div>
      </div>
    );
  },

  Skeleton: ({ node, commonProps }) => (
    <div {...commonProps} style={{
      ...commonProps.style,
      height: node.props.height ?? '16px', width: node.props.width ?? '100%',
      background: 'var(--bg-tertiary)',
      borderRadius: node.props.variant === 'circle' ? '50%' : '4px',
      animation: 'pulse 1.5s ease-in-out infinite',
    }} />
  ),

  StatCard: ({ node, commonProps }) => (
    <div {...commonProps} style={{
      ...commonProps.style,
      border: '1px solid var(--border-color)', borderRadius: '8px',
      padding: '16px', background: 'var(--bg-primary)',
    }}>
      <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{node.props.label ?? 'Label'}</div>
      <div style={{ fontSize: '24px', fontWeight: 700, marginTop: '4px' }}>{node.props.value ?? '0'}</div>
      {node.props.trend && (
        <div style={{ fontSize: '12px', color: node.props.trend.startsWith('-') ? '#d32f2f' : '#2e7d32', marginTop: '4px' }}>
          {node.props.trend}
        </div>
      )}
    </div>
  ),

  Chart: ({ node, commonProps }) => {
    const chartType = node.props.type ?? 'bar';
    return (
      <div {...commonProps} style={{
        ...commonProps.style,
        padding: '16px', border: '1px solid var(--border-color)', borderRadius: '8px',
        background: 'var(--bg-primary)', minHeight: '160px',
      }}>
        {node.props.title && <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>{node.props.title}</div>}
        <div style={{ height: '100px', display: 'flex', alignItems: 'flex-end', gap: '6px' }}>
          {chartType === 'pie' ? (
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: `conic-gradient(var(--accent) 0% 40%, #6ee7b7 40% 70%, #fcd34d 70% 100%)`, margin: '0 auto' }} />
          ) : chartType === 'line' ? (
            <svg width="100%" height="100" viewBox="0 0 140 100" fill="none">
              <polyline points="0,80 20,50 40,60 60,30 80,45 100,20 120,35 140,15" stroke="var(--accent)" strokeWidth="2" fill="none" />
            </svg>
          ) : (
            [60, 80, 45, 90, 55, 70, 85].map((h, i) => (
              <div key={i} style={{
                flex: 1, height: `${h}%`, background: node.props.color ?? 'var(--accent)',
                borderRadius: '2px 2px 0 0', opacity: 0.6 + (i % 3) * 0.15,
              }} />
            ))
          )}
        </div>
        {node.props.legend === 'true' && (
          <div style={{ display: 'flex', gap: '12px', marginTop: '8px', fontSize: '10px', color: 'var(--text-secondary)' }}>
            <span><span style={{ display: 'inline-block', width: '8px', height: '8px', background: 'var(--accent)', borderRadius: '2px', marginRight: '4px' }} />Series 1</span>
            <span><span style={{ display: 'inline-block', width: '8px', height: '8px', background: '#6ee7b7', borderRadius: '2px', marginRight: '4px' }} />Series 2</span>
          </div>
        )}
      </div>
    );
  },
};
