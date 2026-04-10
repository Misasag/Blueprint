import React from 'react';
import { Renderer, px } from '../utils';

export const layoutRenderers: Record<string, Renderer> = {
  Screen: ({ node, commonProps, children }) => (
    <div {...commonProps} style={{ ...commonProps.style, padding: px(node.props.padding) }}>
      {node.props.name && (
        <div style={{ background: 'var(--bg-secondary)', padding: '4px 12px', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
          {node.props.name}
        </div>
      )}
      {children}
    </div>
  ),

  VStack: ({ node, commonProps, children }) => (
    <div {...commonProps} style={{
      ...commonProps.style,
      display: 'flex', flexDirection: 'column',
      gap: px(node.props.gap), padding: px(node.props.padding),
      alignItems: node.props.align ?? undefined,
      justifyContent: node.props.justify ?? undefined,
    }}>
      {children}
    </div>
  ),

  HStack: ({ node, commonProps, children }) => (
    <div {...commonProps} style={{
      ...commonProps.style,
      display: 'flex', flexDirection: 'row',
      gap: px(node.props.gap), padding: px(node.props.padding),
      alignItems: node.props.align ?? 'center',
      justifyContent: node.props.justify ?? undefined,
    }}>
      {children}
    </div>
  ),

  Grid: ({ node, commonProps, children }) => (
    <div {...commonProps} style={{
      ...commonProps.style,
      display: 'grid',
      gridTemplateColumns: `repeat(${node.props.cols ?? 2}, 1fr)`,
      gridTemplateRows: node.props.rows ? `repeat(${node.props.rows}, 1fr)` : undefined,
      gap: px(node.props.gap) ?? '8px', padding: px(node.props.padding),
    }}>
      {children}
    </div>
  ),

  Box: ({ node, commonProps, children }) => {
    const hasFlex = node.props.align || node.props.justify;
    return (
      <div {...commonProps} style={{
        ...commonProps.style,
        padding: px(node.props.padding),
        ...(hasFlex ? { display: 'flex', alignItems: node.props.align, justifyContent: node.props.justify } : {}),
      }}>
        {children}
      </div>
    );
  },

  ScrollView: ({ node, commonProps, children }) => {
    const dir = node.props.direction;
    const overflowStyle = dir === 'horizontal' ? { overflowX: 'auto' as const, overflowY: 'hidden' as const }
      : dir === 'vertical' ? { overflowX: 'hidden' as const, overflowY: 'auto' as const }
      : { overflow: 'auto' as const };
    return (
      <div {...commonProps} style={{ ...commonProps.style, padding: px(node.props.padding), ...overflowStyle }}>
        {children}
      </div>
    );
  },

  SplitScreen: ({ node, commonProps, children }) => {
    const ratios = node.props.ratio ? node.props.ratio.split(':').map(Number) : [];
    return (
      <div {...commonProps} style={{ ...commonProps.style, display: 'flex', gap: '8px' }}>
        {ratios.length >= 2
          ? React.Children.map(children, (child, i) => (
              <div style={{ flex: ratios[i] ?? 1 }}>{child}</div>
            ))
          : children
        }
      </div>
    );
  },

  HeroSection: ({ node, commonProps, children }) => (
    <div {...commonProps} style={{
      ...commonProps.style,
      padding: px(node.props.padding) ?? '32px',
      minHeight: px(node.props.height) ?? '200px',
      display: 'flex', flexDirection: 'column', justifyContent: 'center',
      alignItems: node.props.align ?? 'center',
      background: node.props.background ?? 'var(--bg-secondary)',
    }}>
      {node.props.title && <div style={{ fontSize: '24px', fontWeight: 700 }}>{node.props.title}</div>}
      {node.props.subtitle && <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '8px' }}>{node.props.subtitle}</div>}
      {children}
    </div>
  ),

  BentoGrid: ({ node, commonProps, children }) => (
    <div {...commonProps} style={{
      ...commonProps.style,
      display: 'grid',
      gridTemplateColumns: `repeat(${node.props.cols ?? 3}, 1fr)`,
      gridTemplateRows: node.props.rows ? `repeat(${node.props.rows}, 1fr)` : undefined,
      gap: px(node.props.gap) ?? '8px',
    }}>
      {children}
    </div>
  ),
};
