import React from 'react';
import { Renderer, px } from '../utils';

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
  // --- Card: スロット対応 ---
  Card: ({ node, commonProps, children }) => {
    const { slots, rest } = extractSlots(children, ['CardHeader', 'CardBody', 'CardFooter']);
    const hasSlots = Object.keys(slots).length > 0;

    return (
      <div {...commonProps} style={{
        ...commonProps.style,
        border: '1px solid var(--border-color)', borderRadius: px(node.props.radius) ?? '8px',
        padding: px(node.props.padding) ?? '16px', background: 'var(--bg-primary)',
        ...(node.props.hoverable === 'true' ? { transition: 'box-shadow 0.2s' } : {}),
      }}>
        {node.props.image && (
          <div style={{ background: 'var(--bg-tertiary)', height: '120px', margin: '-16px -16px 12px', borderRadius: '8px 8px 0 0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', fontSize: '12px' }}>
            {node.props.image}
          </div>
        )}
        {hasSlots ? (
          <>{slots.CardHeader}{slots.CardBody}{rest}{slots.CardFooter}</>
        ) : (
          <>
            {node.props.title && <div style={{ fontWeight: 600, marginBottom: '8px' }}>{node.props.title}</div>}
            {node.props.subtitle && <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}>{node.props.subtitle}</div>}
            {children}
          </>
        )}
      </div>
    );
  },

  // スロットタグ: CardHeader / CardBody / CardFooter
  CardHeader: ({ commonProps, children }) => (
    <div {...commonProps} style={{ ...commonProps.style, fontWeight: 600, marginBottom: '8px', paddingBottom: '8px', borderBottom: '1px solid var(--border-color)' }}>
      {children}
    </div>
  ),
  CardBody: ({ commonProps, children }) => (
    <div {...commonProps} style={{ ...commonProps.style, marginBottom: '8px' }}>
      {children}
    </div>
  ),
  CardFooter: ({ commonProps, children }) => (
    <div {...commonProps} style={{ ...commonProps.style, paddingTop: '8px', borderTop: '1px solid var(--border-color)' }}>
      {children}
    </div>
  ),

  // --- Modal: スロット対応 ---
  Modal: ({ node, commonProps, children }) => {
    const { slots, rest } = extractSlots(children, ['ModalHeader', 'ModalBody', 'ModalFooter']);
    const hasSlots = Object.keys(slots).length > 0;
    const sizeWidth = node.props.size === 'small' ? '300px' : node.props.size === 'large' ? '600px' : '420px';

    return (
      <div {...commonProps} style={{
        ...commonProps.style,
        border: '1px solid var(--border-color)', borderRadius: '8px', padding: '16px',
        background: 'var(--bg-primary)', boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
        width: node.props.width ?? sizeWidth,
      }}>
        {hasSlots ? (
          <>{slots.ModalHeader}{slots.ModalBody}{rest}{slots.ModalFooter}</>
        ) : (
          <>
            {node.props.title && (
              <div style={{ fontWeight: 600, marginBottom: '12px', paddingBottom: '8px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between' }}>
                {node.props.title}
                {node.props.closable === 'true' && <span style={{ cursor: 'pointer', color: 'var(--text-secondary)' }}>✕</span>}
              </div>
            )}
            {children}
          </>
        )}
      </div>
    );
  },

  ModalHeader: ({ commonProps, children }) => (
    <div {...commonProps} style={{ ...commonProps.style, fontWeight: 600, marginBottom: '12px', paddingBottom: '8px', borderBottom: '1px solid var(--border-color)' }}>
      {children}
    </div>
  ),
  ModalBody: ({ commonProps, children }) => (
    <div {...commonProps} style={{ ...commonProps.style, marginBottom: '12px' }}>
      {children}
    </div>
  ),
  ModalFooter: ({ commonProps, children }) => (
    <div {...commonProps} style={{ ...commonProps.style, paddingTop: '8px', borderTop: '1px solid var(--border-color)' }}>
      {children}
    </div>
  ),

  // --- Table: スロット対応 + 拡張props ---
  Table: ({ node, commonProps, children }) => {
    let hasTableSlots = false;
    React.Children.forEach(children, child => {
      if (React.isValidElement(child)) {
        const tag = child.props['data-tag'];
        if (tag === 'TableHeader' || tag === 'TableRow') hasTableSlots = true;
      }
    });
    const bordered = node.props.bordered !== 'false';
    const striped = node.props.striped === 'true';

    if (hasTableSlots) {
      return (
        <div {...commonProps} style={{
          ...commonProps.style,
          border: bordered ? '1px solid var(--border-color)' : undefined,
          borderRadius: '4px', overflow: 'hidden',
          ...(striped ? { '--table-striped': '1' } as React.CSSProperties : {}),
        }}>
          {React.Children.map(children, (child, i) => {
            if (!React.isValidElement(child)) return child;
            const tag = child.props['data-tag'];
            // TableHeader にヘッダースタイルを伝搬
            if (tag === 'TableHeader' && (node.props.headerBackground || node.props.headerColor)) {
              return React.cloneElement(child as React.ReactElement<any>, {
                style: {
                  ...(child as React.ReactElement<any>).props.style,
                  background: node.props.headerBackground ?? undefined,
                  color: node.props.headerColor ?? undefined,
                },
              });
            }
            // TableRow に striped を適用
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
    }

    // shortcut props モード
    const cols = (node.props.columns ?? 'Col1,Col2,Col3').split(',');
    const widths = node.props.columnWidths ? node.props.columnWidths.split(',') : [];
    return (
      <div {...commonProps} style={{
        ...commonProps.style,
        border: bordered ? '1px solid var(--border-color)' : undefined,
        borderRadius: '4px', overflow: 'hidden',
      }}>
        <div style={{
          display: 'flex',
          background: node.props.headerBackground ?? 'var(--bg-secondary)',
          borderBottom: '1px solid var(--border-color)',
        }}>
          {cols.map((col, i) => (
            <div key={i} style={{
              flex: widths[i] ? undefined : 1,
              width: widths[i]?.trim(),
              padding: '8px', fontSize: '12px', fontWeight: 600,
              color: node.props.headerColor ?? undefined,
              textAlign: (node.props.cellAlign as React.CSSProperties['textAlign']) ?? undefined,
            }}>
              {col.trim()}
            </div>
          ))}
        </div>
        <div style={{
          display: 'flex',
          background: striped ? 'var(--bg-secondary)' : undefined,
        }}>
          {cols.map((_, i) => (
            <div key={i} style={{
              flex: widths[i] ? undefined : 1,
              width: widths[i]?.trim(),
              padding: '8px', fontSize: '12px', color: 'var(--text-secondary)',
              textAlign: (node.props.cellAlign as React.CSSProperties['textAlign']) ?? undefined,
            }}>—</div>
          ))}
        </div>
        {children}
      </div>
    );
  },

  TableHeader: ({ commonProps, children }) => (
    <div {...commonProps} style={{
      ...commonProps.style,
      display: 'flex', background: 'var(--bg-secondary)',
      borderBottom: '1px solid var(--border-color)', fontWeight: 600,
    }}>
      {children}
    </div>
  ),
  TableRow: ({ commonProps, children }) => (
    <div {...commonProps} style={{
      ...commonProps.style,
      display: 'flex', borderBottom: '1px solid var(--border-color)',
    }}>
      {children}
    </div>
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

  // --- 以下は既存（変更なし） ---
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
    const showDivider = node.props.divider !== 'false';
    const ordered = node.props.ordered === 'true';
    return (
      <div {...commonProps} style={{ ...commonProps.style, border: '1px solid var(--border-color)', borderRadius: '4px' }}>
        {items.map((item, i) => (
          <div key={i} style={{
            padding: '10px 14px', fontSize: '13px', display: 'flex', gap: '8px',
            borderBottom: showDivider && i < items.length - 1 ? '1px solid var(--border-color)' : 'none',
          }}>
            {ordered && <span style={{ color: 'var(--text-secondary)', minWidth: '16px' }}>{i + 1}.</span>}
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
      {(node.props.arrows !== 'false') && ['←', '→'].map((arrow, i) => (
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
      {node.props.dots !== 'false' && (
        <div style={{ position: 'absolute', bottom: '6px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '4px' }}>
          {[0, 1, 2].map(i => <div key={i} style={{ width: '6px', height: '6px', borderRadius: '50%', background: i === 0 ? 'var(--accent)' : 'var(--bg-tertiary)' }} />)}
        </div>
      )}
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
