import React from 'react';
import { Renderer, px, safeInt } from '../utils';

export const compositeRenderers: Record<string, Renderer> = {
  Card: ({ node, commonProps, children }) => (
    <div {...commonProps} style={{
      ...commonProps.style,
      border: '1px solid var(--border-color)', borderRadius: px(node.props.radius) ?? '8px',
      padding: px(node.props.padding) ?? '16px', background: 'var(--bg-primary)',
    }}>
      {node.props.title && <div style={{ fontWeight: 600, marginBottom: '8px' }}>{node.props.title}</div>}
      {node.props.subtitle && <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}>{node.props.subtitle}</div>}
      {children}
    </div>
  ),

  Modal: ({ node, commonProps, children }) => (
    <div {...commonProps} style={{
      ...commonProps.style,
      border: '1px solid var(--border-color)', borderRadius: '8px', padding: '16px',
      background: 'var(--bg-primary)', boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
    }}>
      {node.props.title && (
        <div style={{ fontWeight: 600, marginBottom: '12px', paddingBottom: '8px', borderBottom: '1px solid var(--border-color)' }}>
          {node.props.title}
        </div>
      )}
      {children}
    </div>
  ),

  Table: ({ node, commonProps, children }) => {
    const cols = (node.props.columns ?? 'Col1,Col2,Col3').split(',');
    return (
      <div {...commonProps} style={{ ...commonProps.style, border: '1px solid var(--border-color)', borderRadius: '4px', overflow: 'hidden' }}>
        <div style={{ display: 'flex', background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)' }}>
          {cols.map((col, i) => <div key={i} style={{ flex: 1, padding: '8px', fontSize: '12px', fontWeight: 600 }}>{col.trim()}</div>)}
        </div>
        <div style={{ display: 'flex' }}>
          {cols.map((_, i) => <div key={i} style={{ flex: 1, padding: '8px', fontSize: '12px', color: 'var(--text-secondary)' }}>—</div>)}
        </div>
        {children}
      </div>
    );
  },

  Accordion: ({ node, commonProps, children }) => (
    <div {...commonProps} style={{ ...commonProps.style, border: '1px solid var(--border-color)', borderRadius: '4px' }}>
      {(node.props.items ?? 'Section 1,Section 2').split(',').map((item, i) => (
        <div key={i} style={{
          padding: '10px 14px', borderBottom: '1px solid var(--border-color)',
          fontSize: '13px', display: 'flex', justifyContent: 'space-between',
        }}>
          {item.trim()} <span style={{ color: 'var(--text-secondary)' }}>▶</span>
        </div>
      ))}
      {children}
    </div>
  ),

  List: ({ node, commonProps, children }) => {
    const items = (node.props.items ?? 'Item 1,Item 2,Item 3').split(',');
    return (
      <div {...commonProps} style={{ ...commonProps.style, border: '1px solid var(--border-color)', borderRadius: '4px' }}>
        {items.map((item, i) => (
          <div key={i} style={{
            padding: '10px 14px', fontSize: '13px',
            borderBottom: i < items.length - 1 ? '1px solid var(--border-color)' : 'none',
          }}>
            {item.trim()}
          </div>
        ))}
        {children}
      </div>
    );
  },

  Timeline: ({ node, commonProps }) => {
    const items = (node.props.items ?? 'Event 1,Event 2,Event 3').split(',');
    return (
      <div {...commonProps} style={{ ...commonProps.style, padding: '8px' }}>
        {items.map((item, i) => (
          <div key={i} style={{ display: 'flex', gap: '12px', paddingBottom: i < items.length - 1 ? '16px' : '0' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{
                width: '10px', height: '10px', borderRadius: '50%', flexShrink: 0,
                background: i === 0 ? 'var(--accent)' : 'var(--bg-tertiary)',
                border: `2px solid ${i === 0 ? 'var(--accent)' : 'var(--border-color)'}`,
              }} />
              {i < items.length - 1 && <div style={{ width: '2px', flex: 1, background: 'var(--border-color)', minHeight: '16px' }} />}
            </div>
            <div style={{ fontSize: '13px' }}>{item.trim()}</div>
          </div>
        ))}
      </div>
    );
  },

  Carousel: ({ node, commonProps, children }) => (
    <div {...commonProps} style={{
      ...commonProps.style,
      border: '1px solid var(--border-color)', borderRadius: '8px',
      padding: '16px 40px', position: 'relative', minHeight: '120px',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      {['←', '→'].map((arrow, i) => (
        <span key={i} style={{
          position: 'absolute', [i === 0 ? 'left' : 'right']: '8px', top: '50%', transform: 'translateY(-50%)',
          background: 'var(--bg-secondary)', border: '1px solid var(--border-color)',
          borderRadius: '50%', width: '28px', height: '28px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '14px', color: 'var(--text-secondary)',
        }}>{arrow}</span>
      ))}
      <div style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '13px' }}>
        {children && React.Children.count(children) > 0 ? children : 'Slide 1'}
      </div>
    </div>
  ),

  Kanban: ({ node, commonProps, children }) => {
    const cols = (node.props.columns ?? 'Todo,In Progress,Done').split(',');
    return (
      <div {...commonProps} style={{ ...commonProps.style, display: 'flex', gap: '8px' }}>
        {cols.map((col, i) => (
          <div key={i} style={{
            flex: 1, background: 'var(--bg-secondary)', borderRadius: '6px', padding: '8px', minHeight: '120px',
          }}>
            <div style={{ fontSize: '12px', fontWeight: 600, marginBottom: '8px', color: 'var(--text-secondary)' }}>
              {col.trim()}
            </div>
            <div style={{
              background: 'var(--bg-primary)', border: '1px solid var(--border-color)',
              borderRadius: '4px', padding: '8px', fontSize: '12px', marginBottom: '4px',
            }}>
              Card {i + 1}
            </div>
          </div>
        ))}
        {children}
      </div>
    );
  },

  Tree: ({ node, commonProps }) => {
    const items = (node.props.items ?? 'Root,Child 1,Child 2').split(',');
    return (
      <div {...commonProps} style={{ ...commonProps.style, fontSize: '13px' }}>
        {items.map((item, i) => (
          <div key={i} style={{
            padding: '4px 8px', paddingLeft: i === 0 ? '8px' : '24px',
            display: 'flex', alignItems: 'center', gap: '4px',
          }}>
            <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>{i === 0 ? '▼' : '▸'}</span>
            {item.trim()}
          </div>
        ))}
      </div>
    );
  },

  PricingTable: ({ node, commonProps, children }) => {
    const plans = (node.props.plans ?? 'Free,Pro,Enterprise').split(',');
    return (
      <div {...commonProps} style={{ ...commonProps.style, display: 'flex', gap: '12px' }}>
        {plans.map((plan, i) => (
          <div key={i} style={{
            flex: 1, border: '1px solid var(--border-color)', borderRadius: '8px',
            padding: '16px', textAlign: 'center', background: 'var(--bg-primary)',
            ...(i === 1 ? { borderColor: 'var(--accent)', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' } : {}),
          }}>
            <div style={{ fontWeight: 600, marginBottom: '4px' }}>{plan.trim()}</div>
            <div style={{ fontSize: '24px', fontWeight: 700, margin: '8px 0' }}>
              ${i === 0 ? '0' : i === 1 ? '19' : '49'}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>/month</div>
          </div>
        ))}
        {children}
      </div>
    );
  },

  FAQSection: ({ node, commonProps, children }) => (
    <div {...commonProps} style={{ ...commonProps.style, border: '1px solid var(--border-color)', borderRadius: '4px' }}>
      {(node.props.items ?? 'Question 1?,Question 2?,Question 3?').split(',').map((item, i) => (
        <div key={i} style={{
          padding: '10px 14px', borderBottom: '1px solid var(--border-color)',
          fontSize: '13px', display: 'flex', justifyContent: 'space-between',
        }}>
          {item.trim()} <span style={{ color: 'var(--text-secondary)' }}>▶</span>
        </div>
      ))}
      {children}
    </div>
  ),

  NotificationPanel: ({ node, commonProps, children }) => (
    <div {...commonProps} style={{
      ...commonProps.style,
      border: '1px solid var(--border-color)', borderRadius: '8px',
      background: 'var(--bg-primary)', overflow: 'hidden',
    }}>
      <div style={{
        padding: '10px 14px', borderBottom: '1px solid var(--border-color)',
        fontWeight: 600, fontSize: '13px',
      }}>
        {node.props.title ?? '通知'}
      </div>
      {(node.props.items ?? 'Notification 1,Notification 2,Notification 3').split(',').map((item, i) => (
        <div key={i} style={{
          padding: '10px 14px', borderBottom: '1px solid var(--border-color)',
          fontSize: '12px', display: 'flex', alignItems: 'center', gap: '8px',
        }}>
          <div style={{
            width: '8px', height: '8px', borderRadius: '50%',
            background: i === 0 ? 'var(--accent)' : 'var(--bg-tertiary)', flexShrink: 0,
          }} />
          {item.trim()}
        </div>
      ))}
      {children}
    </div>
  ),
};
