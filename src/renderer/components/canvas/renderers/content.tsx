import React from 'react';
import { Renderer, px, toTextAlign, safeInt } from '../utils';

export const contentRenderers: Record<string, Renderer> = {
  Text: ({ node, commonProps }) => (
    <div {...commonProps} style={{
      ...commonProps.style,
      fontSize: px(node.props.size),
      fontWeight: node.props.weight ?? undefined,
      textAlign: toTextAlign(node.props.align),
      lineHeight: node.props.lineHeight ?? undefined,
    }}>
      {node.textContent ?? ''}
    </div>
  ),

  Image: ({ node, commonProps }) => (
    <div {...commonProps} style={{
      ...commonProps.style,
      background: 'var(--bg-tertiary)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      minHeight: '80px',
      borderRadius: px(node.props.radius),
      color: 'var(--text-secondary)', fontSize: '12px',
    }}>
      {node.props.alt ?? 'Image'}
    </div>
  ),

  Icon: ({ node, commonProps }) => (
    <span {...commonProps} style={{
      ...commonProps.style,
      fontSize: px(node.props.size) ?? '16px',
      color: node.props.color ?? 'var(--text-primary)',
    }}>
      {node.props.name ?? '⬡'}
    </span>
  ),

  Divider: ({ node, commonProps }) => (
    <hr {...commonProps} style={{
      ...commonProps.style,
      border: 'none',
      borderTop: `${node.props.thickness ?? '1'}px solid var(--border-color)`,
      margin: '8px 0', width: '100%',
    }} />
  ),

  Avatar: ({ node, commonProps }) => (
    <div {...commonProps} style={{
      ...commonProps.style,
      width: px(node.props.size) ?? '40px',
      height: px(node.props.size) ?? '40px',
      borderRadius: '50%', background: 'var(--bg-tertiary)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: '14px', color: 'var(--text-secondary)',
    }}>
      {(node.props.name ?? 'U')[0]}
    </div>
  ),

  Badge: ({ node, commonProps }) => (
    <span {...commonProps} style={{
      ...commonProps.style,
      padding: '2px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: 600,
      background: node.props.color ?? 'var(--accent)', color: '#fff',
    }}>
      {node.props.label ?? 'Badge'}
    </span>
  ),

  Tag: ({ node, commonProps }) => (
    <span {...commonProps} style={{
      ...commonProps.style,
      padding: '2px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: 600,
      background: node.props.color ?? 'var(--accent)', color: '#fff',
    }}>
      {node.props.label ?? 'Tag'}
    </span>
  ),

  ProgressBar: ({ node, commonProps }) => (
    <div {...commonProps} style={{
      ...commonProps.style,
      height: '8px', background: 'var(--bg-tertiary)', borderRadius: '4px',
      overflow: 'hidden', width: node.props.width ?? '100%',
    }}>
      <div style={{
        height: '100%',
        width: `${Math.min(100, safeInt(node.props.value, 50) / Math.max(1, safeInt(node.props.max, 100)) * 100)}%`,
        background: node.props.color ?? 'var(--accent)', borderRadius: '4px',
      }} />
    </div>
  ),

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

  Chart: ({ node, commonProps }) => (
    <div {...commonProps} style={{
      ...commonProps.style,
      padding: '16px', border: '1px solid var(--border-color)', borderRadius: '8px',
      background: 'var(--bg-primary)', minHeight: '160px',
    }}>
      <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
        {node.props.type ?? 'bar'} chart
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', height: '100px' }}>
        {[60, 80, 45, 90, 55, 70, 85].map((h, i) => (
          <div key={i} style={{
            flex: 1, height: `${h}%`, background: node.props.color ?? 'var(--accent)',
            borderRadius: '2px 2px 0 0', opacity: 0.6 + (i % 3) * 0.15,
          }} />
        ))}
      </div>
    </div>
  ),
};
