import React from 'react';
import { Renderer, safeInt } from '../utils';

export const navigationRenderers: Record<string, Renderer> = {
  Navbar: ({ node, commonProps, children }) => (
    <div {...commonProps} style={{
      ...commonProps.style,
      padding: '8px 16px', borderBottom: '1px solid var(--border-color)',
      display: 'flex', alignItems: 'center', fontWeight: 600, gap: '16px',
    }}>
      {node.props.logo && <span style={{ fontSize: '14px' }}>🖼</span>}
      <span>{node.props.title ?? 'Navbar'}</span>
      <div style={{ display: 'flex', gap: '16px', marginLeft: 'auto', fontWeight: 400 }}>
        {children}
      </div>
    </div>
  ),

  AppBar: ({ node, commonProps, children }) => (
    <div {...commonProps} style={{
      ...commonProps.style,
      padding: '8px 16px', borderBottom: '1px solid var(--border-color)',
      display: 'flex', alignItems: 'center', fontWeight: 600,
    }}>
      {node.props.back === 'true' && <span style={{ marginRight: '8px', fontSize: '14px' }}>←</span>}
      <span style={{ flex: 1 }}>{node.props.title ?? 'AppBar'}</span>
      {children}
    </div>
  ),

  Sidebar: ({ node, commonProps, children }) => {
    const isCollapsed = node.props.collapsed === 'true';
    const rawWidth = node.props.width;
    const w = isCollapsed ? '48px' : (rawWidth ? (/^\d+$/.test(rawWidth) ? `${rawWidth}px` : rawWidth) : '200px');
    return (
      <div {...commonProps} style={{
        ...commonProps.style,
        width: w, borderRight: '1px solid var(--border-color)',
        padding: '8px', background: 'var(--bg-secondary)',
      }}>
        {children}
      </div>
    );
  },

  Breadcrumb: ({ commonProps, children }) => (
    <div {...commonProps} style={{
      ...commonProps.style,
      display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--text-secondary)',
    }}>
      {React.Children.map(children, (child, i) => (
        <React.Fragment key={i}>
          {i > 0 && <span>/</span>}
          {child}
        </React.Fragment>
      ))}
    </div>
  ),

  Pagination: ({ node, commonProps }) => {
    const total = safeInt(node.props.total, 0);
    const pageSize = safeInt(node.props.pageSize, 10);
    const current = safeInt(node.props.current, 1);
    const pageCount = total > 0 ? Math.ceil(total / pageSize) : 1;

    const pages: (number | '...')[] = [];
    if (pageCount <= 5) {
      for (let i = 1; i <= pageCount; i++) pages.push(i);
    } else {
      pages.push(1, 2);
      if (current > 3) pages.push('...');
      if (current > 2 && current < pageCount - 1) pages.push(current);
      if (current < pageCount - 2) pages.push('...');
      pages.push(pageCount - 1, pageCount);
    }

    return (
      <div {...commonProps} style={{ ...commonProps.style, display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}>
        <span style={{ padding: '4px 8px', border: '1px solid var(--border-color)', borderRadius: '3px' }}>←</span>
        {pages.map((p, i) => (
          <span key={i} style={{
            padding: '4px 8px', borderRadius: '3px',
            ...(p === current ? { background: 'var(--accent)', color: '#fff' } : { border: '1px solid var(--border-color)' }),
          }}>{p}</span>
        ))}
        <span style={{ padding: '4px 8px', border: '1px solid var(--border-color)', borderRadius: '3px' }}>→</span>
      </div>
    );
  },

  Stepper: ({ node, commonProps, children }) => (
    <div {...commonProps} style={{ ...commonProps.style, display: 'flex', alignItems: 'center', gap: '8px' }}>
      {React.Children.map(children, (child, i) => (
        <React.Fragment key={i}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '4px',
            color: i <= safeInt(node.props.current, 0) ? 'var(--accent)' : 'var(--text-secondary)',
            fontSize: '12px',
          }}>
            <span style={{
              width: '20px', height: '20px', borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: i <= safeInt(node.props.current, 0) ? 'var(--accent)' : 'var(--bg-tertiary)',
              color: i <= safeInt(node.props.current, 0) ? '#fff' : 'var(--text-secondary)',
              fontSize: '10px',
            }}>{i + 1}</span>
            {child}
          </div>
          {i < React.Children.count(children) - 1 && <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }} />}
        </React.Fragment>
      ))}
    </div>
  ),
};
