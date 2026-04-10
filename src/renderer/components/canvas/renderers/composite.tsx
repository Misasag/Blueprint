import React from 'react';
import { Renderer, px, safeInt } from '../utils';

/** 子ノードからスロットタグをまとめて抽出するヘルパー */
function extractSlots(children: React.ReactNode, slotTags: string[]): { slots: Record<string, React.ReactNode>; rest: React.ReactNode[] } {
  const slots: Record<string, React.ReactNode> = {};
  const rest: React.ReactNode[] = [];
  React.Children.forEach(children, child => {
    if (React.isValidElement(child)) {
      const tag = child.props['data-tag'];
      if (tag && slotTags.includes(tag)) {
        slots[tag] = child;
        return;
      }
    }
    rest.push(child);
  });
  return { slots, rest };
}

export const compositeRenderers: Record<string, Renderer> = {
  // --- Card ---
  Card: ({ node, commonProps, children }) => {
    const { slots, rest } = extractSlots(children, ['CardHeader', 'CardBody', 'CardFooter']);
    const hasSlots = Object.keys(slots).length > 0;
    const variant = node.props.variant ?? 'outlined';
    const variantStyle: React.CSSProperties =
      variant === 'elevated' ? { border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }
      : variant === 'filled' ? { border: 'none', background: 'var(--bg-secondary)' }
      : { border: '1px solid var(--border-color)' };
    return (
      <div {...commonProps} style={{
        ...commonProps.style, ...variantStyle,
        borderRadius: px(node.props.radius) ?? '8px',
        padding: px(node.props.padding) ?? '16px',
        background: variantStyle.background ?? 'var(--bg-primary)',
      }}>
        {hasSlots ? <>{slots.CardHeader}{slots.CardBody}{rest}{slots.CardFooter}</> : children}
      </div>
    );
  },
  CardHeader: ({ commonProps, children }) => (
    <div {...commonProps} style={{ ...commonProps.style, fontWeight: 600, marginBottom: '8px', paddingBottom: '8px', borderBottom: '1px solid var(--border-color)' }}>{children}</div>
  ),
  CardBody: ({ commonProps, children }) => (
    <div {...commonProps} style={{ ...commonProps.style, marginBottom: '8px' }}>{children}</div>
  ),
  CardFooter: ({ commonProps, children }) => (
    <div {...commonProps} style={{ ...commonProps.style, paddingTop: '8px', borderTop: '1px solid var(--border-color)' }}>{children}</div>
  ),

  // --- Modal ---
  Modal: ({ node, commonProps, children }) => {
    const { slots, rest } = extractSlots(children, ['ModalHeader', 'ModalBody', 'ModalFooter']);
    const hasSlots = Object.keys(slots).length > 0;
    const sizeWidth = node.props.size === 'small' ? '300px' : node.props.size === 'large' ? '600px' : '420px';
    return (
      <div {...commonProps} style={{
        ...commonProps.style, border: '1px solid var(--border-color)', borderRadius: '8px', padding: '16px',
        background: 'var(--bg-primary)', boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
        width: node.props.width ?? sizeWidth,
      }}>
        {hasSlots ? <>{slots.ModalHeader}{slots.ModalBody}{rest}{slots.ModalFooter}</> : children}
      </div>
    );
  },
  ModalHeader: ({ commonProps, children }) => (
    <div {...commonProps} style={{ ...commonProps.style, fontWeight: 600, marginBottom: '12px', paddingBottom: '8px', borderBottom: '1px solid var(--border-color)' }}>{children}</div>
  ),
  ModalBody: ({ commonProps, children }) => (
    <div {...commonProps} style={{ ...commonProps.style, marginBottom: '12px' }}>{children}</div>
  ),
  ModalFooter: ({ commonProps, children }) => (
    <div {...commonProps} style={{ ...commonProps.style, paddingTop: '8px', borderTop: '1px solid var(--border-color)' }}>{children}</div>
  ),

  // --- Table ---
  Table: ({ node, commonProps, children }) => {
    const bordered = node.props.bordered !== 'false';
    const striped = node.props.striped === 'true';
    return (
      <div {...commonProps} style={{
        ...commonProps.style,
        border: bordered ? '1px solid var(--border-color)' : undefined,
        borderRadius: '4px', overflow: 'hidden',
      }}>
        {React.Children.map(children, (child, i) => {
          if (!React.isValidElement(child)) return child;
          const tag = child.props['data-tag'];
          if (tag === 'TableHeader' && (node.props.headerBackground || node.props.headerColor)) {
            return React.cloneElement(child as React.ReactElement<any>, {
              style: {
                ...(child as React.ReactElement<any>).props.style,
                background: node.props.headerBackground ?? undefined,
                color: node.props.headerColor ?? undefined,
              },
            });
          }
          if (tag === 'TableRow' && striped && i % 2 === 0) {
            return React.cloneElement(child as React.ReactElement<any>, {
              style: {
                ...(child as React.ReactElement<any>).props.style,
                background: 'var(--bg-secondary)',
              },
            });
          }
          return child;
        })}
      </div>
    );
  },
  TableHeader: ({ commonProps, children }) => (
    <div {...commonProps} style={{
      ...commonProps.style, display: 'flex', background: 'var(--bg-secondary)',
      borderBottom: '1px solid var(--border-color)', fontWeight: 600,
    }}>{children}</div>
  ),
  TableRow: ({ commonProps, children }) => (
    <div {...commonProps} style={{
      ...commonProps.style, display: 'flex', borderBottom: '1px solid var(--border-color)',
    }}>{children}</div>
  ),
  TableCell: ({ node, commonProps, children }) => (
    <div {...commonProps} style={{
      ...commonProps.style,
      flex: node.props.width ? undefined : 1,
      width: node.props.width ? px(node.props.width) : undefined,
      padding: '8px', fontSize: '12px',
      textAlign: (node.props.align as React.CSSProperties['textAlign']) ?? undefined,
      fontWeight: node.props.weight ?? undefined,
    }}>
      {node.textContent ?? children}
    </div>
  ),

  // --- Accordion ---
  Accordion: ({ node, commonProps, children }) => {
    const openIdx = node.props.defaultOpen !== undefined ? parseInt(node.props.defaultOpen, 10) : -1;
    return (
      <div {...commonProps} style={{ ...commonProps.style, border: '1px solid var(--border-color)', borderRadius: '4px' }}>
        {React.Children.map(children, (child, i) => {
          if (!React.isValidElement(child) || child.props['data-tag'] !== 'AccordionItem') return child;
          return React.cloneElement(child as React.ReactElement<any>, { 'data-open': i === openIdx ? 'true' : undefined });
        })}
      </div>
    );
  },
  AccordionItem: ({ commonProps, children, node }) => {
    const isOpen = (commonProps as any)['data-open'] === 'true';
    return (
      <div {...commonProps} style={{ ...commonProps.style, borderBottom: '1px solid var(--border-color)' }}>
        {React.Children.map(children, child => {
          if (!React.isValidElement(child)) return child;
          const tag = child.props['data-tag'];
          if (tag === 'AccordionBody' && !isOpen) return null;
          return child;
        })}
      </div>
    );
  },
  AccordionHeader: ({ commonProps, children }) => (
    <div {...commonProps} style={{
      ...commonProps.style, padding: '10px 14px', fontSize: '13px',
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    }}>
      {children}
      <span style={{ color: 'var(--text-secondary)' }}>▶</span>
    </div>
  ),
  AccordionBody: ({ commonProps, children }) => (
    <div {...commonProps} style={{
      ...commonProps.style, padding: '10px 14px', background: 'var(--bg-secondary)', fontSize: '13px',
    }}>{children}</div>
  ),

  // --- Tabs ---
  Tabs: ({ node, commonProps, children }) => {
    const variant = node.props.variant ?? 'underline';
    // TabItem の子からラベルを抽出して表示
    const tabItems: React.ReactNode[] = [];
    const tabPanels: React.ReactNode[] = [];
    const activeIdx = safeInt(node.props.active, 0);

    React.Children.forEach(children, (child, i) => {
      if (!React.isValidElement(child)) return;
      const tag = child.props['data-tag'];
      if (tag === 'TabItem') {
        // TabItem の中から TabLabel と TabPanel を探す
        const itemChildren = child.props.children;
        let label: React.ReactNode = `Tab ${i + 1}`;
        let panel: React.ReactNode = null;
        React.Children.forEach(itemChildren, (ic: React.ReactNode) => {
          if (React.isValidElement(ic)) {
            if (ic.props['data-tag'] === 'TabLabel') label = ic;
            if (ic.props['data-tag'] === 'TabPanel') panel = ic;
          }
        });
        tabItems.push(label);
        tabPanels.push(panel);
      }
    });

    return (
      <div {...commonProps} style={{ ...commonProps.style }}>
        <div style={{
          display: 'flex',
          ...(variant !== 'pills' ? { borderBottom: '1px solid var(--border-color)' } : {}),
          gap: variant === 'pills' ? '4px' : '0',
        }}>
          {tabItems.map((item, i) => {
            const isActive = i === activeIdx;
            const tabStyle: React.CSSProperties =
              variant === 'pills'
                ? { padding: '6px 16px', fontSize: '13px', borderRadius: '20px', background: isActive ? 'var(--accent)' : 'transparent', color: isActive ? '#fff' : 'var(--text-secondary)' }
                : { padding: '8px 16px', fontSize: '13px', borderBottom: isActive ? '2px solid var(--accent)' : '2px solid transparent', color: isActive ? 'var(--accent)' : 'var(--text-secondary)' };
            return <div key={i} style={tabStyle}>{item}</div>;
          })}
        </div>
        {tabPanels[activeIdx] && <div style={{ padding: '8px 0' }}>{tabPanels[activeIdx]}</div>}
      </div>
    );
  },
  TabItem: ({ commonProps, children }) => (
    <div {...commonProps} style={{ ...commonProps.style }}>{children}</div>
  ),
  TabLabel: ({ commonProps, children }) => (
    <span {...commonProps} style={{ ...commonProps.style }}>{children}</span>
  ),
  TabPanel: ({ commonProps, children }) => (
    <div {...commonProps} style={{ ...commonProps.style, padding: '8px' }}>{children}</div>
  ),

  // --- List ---
  List: ({ node, commonProps, children }) => {
    const showDivider = node.props.divider !== 'false';
    const ordered = node.props.ordered === 'true';
    return (
      <div {...commonProps} style={{ ...commonProps.style, border: '1px solid var(--border-color)', borderRadius: '4px' }}>
        {React.Children.map(children, (child, i) => (
          <div style={{
            padding: '10px 14px', fontSize: '13px', display: 'flex', gap: '8px',
            borderBottom: showDivider ? '1px solid var(--border-color)' : 'none',
          }}>
            {ordered && <span style={{ color: 'var(--text-secondary)', minWidth: '16px' }}>{i + 1}.</span>}
            {child}
          </div>
        ))}
      </div>
    );
  },

  // --- Timeline ---
  Timeline: ({ commonProps, children }) => (
    <div {...commonProps} style={{ ...commonProps.style, padding: '8px' }}>
      {React.Children.map(children, (child, i) => (
        <div style={{ display: 'flex', gap: '12px', paddingBottom: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{
              width: '10px', height: '10px', borderRadius: '50%', flexShrink: 0,
              background: i === 0 ? 'var(--accent)' : 'var(--bg-tertiary)',
              border: `2px solid ${i === 0 ? 'var(--accent)' : 'var(--border-color)'}`,
            }} />
            <div style={{ width: '2px', flex: 1, background: 'var(--border-color)', minHeight: '16px' }} />
          </div>
          <div style={{ fontSize: '13px' }}>{child}</div>
        </div>
      ))}
    </div>
  ),

  // --- Carousel ---
  Carousel: ({ node, commonProps, children }) => {
    const childCount = React.Children.count(children);
    const dotCount = childCount || 1;
    return (
      <div {...commonProps} style={{
        ...commonProps.style, border: '1px solid var(--border-color)', borderRadius: '8px',
        padding: '16px 40px', position: 'relative', minHeight: '120px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {(node.props.arrows !== 'false') && ['←', '→'].map((arrow, i) => (
          <span key={i} style={{
            position: 'absolute', [i === 0 ? 'left' : 'right']: '8px', top: '50%', transform: 'translateY(-50%)',
            background: 'var(--bg-secondary)', border: '1px solid var(--border-color)',
            borderRadius: '50%', width: '28px', height: '28px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '14px', color: 'var(--text-secondary)',
          }}>{arrow}</span>
        ))}
        <div style={{ textAlign: 'center', width: '100%' }}>{children}</div>
        {node.props.dots !== 'false' && (
          <div style={{ position: 'absolute', bottom: '6px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '4px' }}>
            {Array.from({ length: dotCount }, (_, i) => <div key={i} style={{ width: '6px', height: '6px', borderRadius: '50%', background: i === 0 ? 'var(--accent)' : 'var(--bg-tertiary)' }} />)}
          </div>
        )}
      </div>
    );
  },

  // --- Kanban ---
  Kanban: ({ commonProps, children }) => (
    <div {...commonProps} style={{ ...commonProps.style, display: 'flex', gap: '8px' }}>
      {React.Children.map(children, child => (
        <div style={{ flex: 1, background: 'var(--bg-secondary)', borderRadius: '6px', padding: '8px', minHeight: '120px' }}>
          {child}
        </div>
      ))}
    </div>
  ),

  // --- Tree ---
  Tree: ({ commonProps, children }) => (
    <div {...commonProps} style={{ ...commonProps.style, fontSize: '13px' }}>{children}</div>
  ),
  TreeNode: ({ node, commonProps, children }) => {
    const hasChildren = React.Children.count(children) > 0;
    return (
      <div {...commonProps} style={{ ...commonProps.style }}>
        <div style={{ padding: '4px 8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>{hasChildren ? '▼' : '▸'}</span>
          {node.props.label ?? ''}
        </div>
        {hasChildren && <div style={{ paddingLeft: '16px' }}>{children}</div>}
      </div>
    );
  },

  // --- PricingTable ---
  PricingTable: ({ commonProps, children }) => (
    <div {...commonProps} style={{ ...commonProps.style, display: 'flex', gap: '12px' }}>
      {React.Children.map(children, (child, i) => (
        <div style={{
          flex: 1,
          ...(i === 1 ? { transform: 'scale(1.02)' } : {}),
        }}>
          {child}
        </div>
      ))}
    </div>
  ),

  // --- FAQSection ---
  FAQSection: ({ commonProps, children }) => (
    <div {...commonProps} style={{ ...commonProps.style, border: '1px solid var(--border-color)', borderRadius: '4px' }}>{children}</div>
  ),

  // --- NotificationPanel ---
  NotificationPanel: ({ node, commonProps, children }) => (
    <div {...commonProps} style={{
      ...commonProps.style, border: '1px solid var(--border-color)', borderRadius: '8px',
      background: 'var(--bg-primary)', overflow: 'hidden',
    }}>
      <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border-color)', fontWeight: 600, fontSize: '13px' }}>
        {node.props.title ?? '通知'}
      </div>
      {React.Children.map(children, (child, i) => (
        <div style={{
          padding: '10px 14px', borderBottom: '1px solid var(--border-color)',
          fontSize: '12px', display: 'flex', alignItems: 'center', gap: '8px',
        }}>
          <div style={{
            width: '8px', height: '8px', borderRadius: '50%',
            background: i === 0 ? 'var(--accent)' : 'var(--bg-tertiary)', flexShrink: 0,
          }} />
          {child}
        </div>
      ))}
    </div>
  ),
};
