import React from 'react';
import { Renderer, safeInt } from '../utils';

export const navigationRenderers: Record<string, Renderer> = {
  Navbar: ({ node, commonProps, children }) => (
    <div {...commonProps} style={{
      ...commonProps.style,
      padding: '8px 16px', borderBottom: '1px solid var(--border-color)',
      display: 'flex', alignItems: 'center', fontWeight: 600,
    }}>
      {node.props.title ?? 'Navbar'}
      {children}
    </div>
  ),

  AppBar: ({ node, commonProps, children }) => (
    <div {...commonProps} style={{
      ...commonProps.style,
      padding: '8px 16px', borderBottom: '1px solid var(--border-color)',
      display: 'flex', alignItems: 'center', fontWeight: 600,
    }}>
      {node.props.title ?? 'AppBar'}
      {children}
    </div>
  ),

  Sidebar: ({ node, commonProps, children }) => (
    <div {...commonProps} style={{
      ...commonProps.style,
      width: node.props.collapsed === 'true' ? '48px' : '200px',
      borderRight: '1px solid var(--border-color)', padding: '8px', background: 'var(--bg-secondary)',
    }}>
      {children}
    </div>
  ),

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

  Pagination: ({ node, commonProps }) => (
    <div {...commonProps} style={{ ...commonProps.style, display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}>
      <span style={{ padding: '4px 8px', border: '1px solid var(--border-color)', borderRadius: '3px' }}>←</span>
      <span style={{ padding: '4px 8px', background: 'var(--accent)', color: '#fff', borderRadius: '3px' }}>{node.props.current ?? '1'}</span>
      <span style={{ padding: '4px 8px', border: '1px solid var(--border-color)', borderRadius: '3px' }}>→</span>
    </div>
  ),

  Tabs: ({ node, commonProps }) => (
    <div {...commonProps} style={{ ...commonProps.style, display: 'flex', borderBottom: '1px solid var(--border-color)' }}>
      {(node.props.items ?? 'Tab1,Tab2,Tab3').split(',').map((item, i) => (
        <div key={i} style={{
          padding: '8px 16px', fontSize: '13px',
          borderBottom: i === safeInt(node.props.active, 0) ? '2px solid var(--accent)' : '2px solid transparent',
          color: i === safeInt(node.props.active, 0) ? 'var(--accent)' : 'var(--text-secondary)',
        }}>
          {item.trim()}
        </div>
      ))}
    </div>
  ),

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
