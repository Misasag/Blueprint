import React from 'react';
import { Renderer, px } from '../utils';

export const feedbackRenderers: Record<string, Renderer> = {
  Alert: ({ node, commonProps }) => (
    <div {...commonProps} style={{
      ...commonProps.style,
      padding: '10px 14px', borderRadius: '4px',
      border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', fontSize: '13px',
    }}>
      {node.textContent ?? node.props.message ?? 'Alert'}
    </div>
  ),

  Toast: ({ node, commonProps }) => (
    <div {...commonProps} style={{
      ...commonProps.style,
      padding: '10px 14px', borderRadius: '6px', background: '#333',
      color: '#fff', fontSize: '13px', boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
    }}>
      {node.props.message ?? 'Toast notification'}
    </div>
  ),

  Tooltip: ({ node, commonProps, children }) => (
    <div {...commonProps} style={{
      ...commonProps.style,
      padding: '6px 10px', borderRadius: '4px', background: '#333', color: '#fff',
      fontSize: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
    }}>
      {node.props.content ?? 'Tooltip'}
      {children}
    </div>
  ),

  Popover: ({ node, commonProps, children }) => (
    <div {...commonProps} style={{
      ...commonProps.style,
      padding: '6px 10px', borderRadius: '4px', background: 'var(--bg-primary)',
      border: '1px solid var(--border-color)', fontSize: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
    }}>
      {node.props.content ?? 'Popover'}
      {children}
    </div>
  ),

  Spinner: ({ node, commonProps }) => (
    <div {...commonProps} style={{
      ...commonProps.style,
      width: px(node.props.size) ?? '24px', height: px(node.props.size) ?? '24px',
      border: '2px solid var(--bg-tertiary)', borderTopColor: 'var(--accent)',
      borderRadius: '50%', animation: 'spin 1s linear infinite',
    }} />
  ),

  ConfirmDialog: ({ node, commonProps }) => (
    <div {...commonProps} style={{
      ...commonProps.style,
      border: '1px solid var(--border-color)', borderRadius: '8px', padding: '16px',
      background: 'var(--bg-primary)', boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
    }}>
      <div style={{ fontWeight: 600, marginBottom: '8px' }}>{node.props.title ?? '確認'}</div>
      <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '12px' }}>{node.props.message ?? '実行しますか？'}</div>
      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
        <span style={{ padding: '4px 12px', border: '1px solid var(--border-color)', borderRadius: '4px', fontSize: '12px' }}>キャンセル</span>
        <span style={{ padding: '4px 12px', background: 'var(--accent)', color: '#fff', borderRadius: '4px', fontSize: '12px' }}>OK</span>
      </div>
    </div>
  ),

  EmptyState: ({ node, commonProps }) => (
    <div {...commonProps} style={{ ...commonProps.style, padding: '32px', textAlign: 'center', color: 'var(--text-secondary)' }}>
      {node.props.icon && <div style={{ fontSize: '32px', marginBottom: '8px' }}>{node.props.icon}</div>}
      <div style={{ fontWeight: 600 }}>{node.props.title ?? 'データがありません'}</div>
      {node.props.message && <div style={{ fontSize: '12px', marginTop: '4px' }}>{node.props.message}</div>}
    </div>
  ),
};
