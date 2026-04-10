import React from 'react';
import { Renderer, safeInt } from '../utils';

export const navigationRenderers: Record<string, Renderer> = {
  Navbar: ({ node, commonProps, children }) => {
    const items = node.props.items ? node.props.items.split(',') : [];
    return (
      <div {...commonProps} style={{
        ...commonProps.style,
        padding: '8px 16px', borderBottom: '1px solid var(--border-color)',
        display: 'flex', alignItems: 'center', fontWeight: 600, gap: '16px',
      }}>
        {node.props.logo && <span style={{ fontSize: '14px' }}>🖼</span>}
        <span>{node.props.title ?? 'Navbar'}</span>
        {items.length > 0 && (
          <div style={{ display: 'flex', gap: '16px', marginLeft: 'auto', fontWeight: 400 }}>
            {items.map((item, i) => (
              <span key={i} style={{ fontSize: '13px', color: 'var(--accent)' }}>{item.trim()}</span>
            ))}
          </div>
        )}
        {node.props.sticky === 'true' && (
          <span style={{ fontSize: '9px', color: 'var(--text-secondary)', marginLeft: 'auto' }}>sticky</span>
        )}
        {children}
      </div>
    );
  },

  AppBar: ({ node, commonProps, children }) => {
    const actions = node.props.actions ? node.props.actions.split(',') : [];
    return (
      <div {...commonProps} style={{
        ...commonProps.style,
        padding: '8px 16px', borderBottom: '1px solid var(--border-color)',
        display: 'flex', alignItems: 'center', fontWeight: 600,
      }}>
        {node.props.back === 'true' && <span style={{ marginRight: '8px', fontSize: '14px', cursor: 'pointer' }}>←</span>}
        <span style={{ flex: 1 }}>{node.props.title ?? 'AppBar'}</span>
        {actions.length > 0 && (
          <div style={{ display: 'flex', gap: '8px' }}>
            {actions.map((action, i) => (
              <span key={i} style={{ fontSize: '12px', padding: '4px 8px', border: '1px solid var(--border-color)', borderRadius: '4px' }}>{action.trim()}</span>
            ))}
          </div>
        )}
        {children}
      </div>
    );
  },

  Sidebar: ({ node, commonProps, children }) => {
    const isCollapsed = node.props.collapsed === 'true';
    const items = node.props.items ? node.props.items.split(',') : [];
    const rawWidth = node.props.width;
    const w = isCollapsed ? '48px' : (rawWidth ? (/^\d+$/.test(rawWidth) ? `${rawWidth}px` : rawWidth) : '200px');
    return (
      <div {...commonProps} style={{
        ...commonProps.style,
        width: w, borderRight: '1px solid var(--border-color)',
        padding: '8px', background: 'var(--bg-secondary)',
      }}>
        {items.map((item, i) => (
          <div key={i} style={{ padding: '8px 12px', fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {isCollapsed ? item.trim()[0] : item.trim()}
          </div>
        ))}
        {children}
      </div>
    );
  },

  Breadcrumb: ({ node, commonProps }) => (
    <div {...commonProps} style={{
      ...commonProps.style,
      display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--text-secondary)',
    }}>
      {(node.props.items ?? 'Home,Page').split(',').map((item, i, arr) => (
        <React.Fragment key={i}>
          <span style={{ color: i === arr.length - 1 ? 'var(--text-primary)' : undefined }}>{item.trim()}</span>
          {i < arr.length - 1 && <span>/</span>}
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

  Tabs: ({ node, commonProps }) => {
    const variant = node.props.variant ?? 'underline';
    return (
      <div {...commonProps} style={{
        ...commonProps.style, display: 'flex',
        ...(variant !== 'pills' ? { borderBottom: '1px solid var(--border-color)' } : {}),
        gap: variant === 'pills' ? '4px' : '0',
      }}>
        {(node.props.items ?? 'Tab1,Tab2,Tab3').split(',').map((item, i) => {
          const isActive = i === safeInt(node.props.active, 0);
          const tabStyle: React.CSSProperties =
            variant === 'pills'
              ? { padding: '6px 16px', fontSize: '13px', borderRadius: '20px', background: isActive ? 'var(--accent)' : 'transparent', color: isActive ? '#fff' : 'var(--text-secondary)' }
              : variant === 'outlined'
              ? { padding: '8px 16px', fontSize: '13px', border: '1px solid var(--border-color)', borderBottom: isActive ? '1px solid var(--bg-primary)' : undefined, background: isActive ? 'var(--bg-primary)' : 'transparent', color: isActive ? 'var(--accent)' : 'var(--text-secondary)', marginBottom: '-1px' }
              : { padding: '8px 16px', fontSize: '13px', borderBottom: isActive ? '2px solid var(--accent)' : '2px solid transparent', color: isActive ? 'var(--accent)' : 'var(--text-secondary)' };
          return <div key={i} style={tabStyle}>{item.trim()}</div>;
        })}
      </div>
    );
  },

  Stepper: ({ node, commonProps }) => {
    const steps = (node.props.steps ?? 'Step 1,Step 2,Step 3').split(',');
    return (
      <div {...commonProps} style={{ ...commonProps.style, display: 'flex', alignItems: 'center', gap: '8px' }}>
        {steps.map((step, i) => (
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
              {step.trim()}
            </div>
            {i < steps.length - 1 && <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }} />}
          </React.Fragment>
        ))}
      </div>
    );
  },
};
