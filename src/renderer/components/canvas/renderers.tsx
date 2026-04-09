import React from 'react';
import { UINode } from '../../../parser';
import { RenderProps, safeInt, toTextAlign, px } from './utils';

type Renderer = (p: RenderProps) => React.ReactElement;

/** タグ名 → レンダラー関数のマップ */
export const tagRenderers: Record<string, Renderer> = {
  // --- レイアウト系 ---
  Screen: ({ node, commonProps, children }) => (
    <div {...commonProps} style={{ ...commonProps.style, padding: px(node.props.padding) }}>
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
      gap: px(node.props.gap) ?? '8px', padding: px(node.props.padding),
    }}>
      {children}
    </div>
  ),

  Box: ({ node, commonProps, children }) => (
    <div {...commonProps} style={{ ...commonProps.style, padding: px(node.props.padding) }}>
      {children}
    </div>
  ),

  ScrollView: ({ node, commonProps, children }) => (
    <div {...commonProps} style={{ ...commonProps.style, padding: px(node.props.padding), overflow: 'auto' }}>
      {children}
    </div>
  ),

  SplitScreen: ({ commonProps, children }) => (
    <div {...commonProps} style={{ ...commonProps.style, display: 'flex', gap: '8px' }}>
      {children}
    </div>
  ),

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
      gap: px(node.props.gap) ?? '8px',
    }}>
      {children}
    </div>
  ),

  // --- コンテンツ系 ---
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

  Spinner: ({ node, commonProps }) => (
    <div {...commonProps} style={{
      ...commonProps.style,
      width: px(node.props.size) ?? '24px', height: px(node.props.size) ?? '24px',
      border: '2px solid var(--bg-tertiary)', borderTopColor: 'var(--accent)',
      borderRadius: '50%', animation: 'spin 1s linear infinite',
    }} />
  ),

  // --- 入力系 ---
  Button: ({ node, commonProps }) => (
    <button {...commonProps} style={{
      ...commonProps.style,
      padding: px(node.props.padding) ?? '8px 16px',
      backgroundColor: node.props.color ?? '#0078d4', color: '#ffffff',
      border: 'none', borderRadius: px(node.props.radius) ?? '4px',
      fontSize: '14px', fontWeight: 500, width: node.props.width ?? undefined,
    }}>
      {node.textContent ?? node.props.label ?? 'Button'}
    </button>
  ),

  Input: ({ node, commonProps }) => (
    <input {...commonProps} readOnly type={node.props.type ?? 'text'} placeholder={node.props.placeholder ?? ''}
      style={{
        ...commonProps.style,
        padding: '8px 12px', border: '1px solid var(--border-color)',
        borderRadius: px(node.props.radius) ?? '4px', fontSize: '14px',
        width: node.props.width ?? undefined, background: 'var(--bg-primary)',
      }}
    />
  ),

  Textarea: ({ node, commonProps }) => (
    <textarea {...commonProps} readOnly placeholder={node.props.placeholder ?? ''} rows={safeInt(node.props.rows, 3)}
      style={{
        ...commonProps.style,
        padding: '8px 12px', border: '1px solid var(--border-color)', borderRadius: '4px',
        fontSize: '14px', width: node.props.width ?? '100%', resize: 'none',
      }}
    />
  ),

  Select: ({ node, commonProps }) => (
    <select {...commonProps} style={{
      ...commonProps.style,
      padding: '8px 12px', border: '1px solid var(--border-color)', borderRadius: '4px',
      fontSize: '14px', width: node.props.width ?? undefined, background: 'var(--bg-primary)',
    }}>
      <option>{node.props.placeholder ?? '選択してください'}</option>
    </select>
  ),

  Checkbox: ({ node, commonProps }) => (
    <label {...commonProps} style={{ ...commonProps.style, display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
      <input type="checkbox" readOnly checked={node.props.checked === 'true'} />
      {node.props.label ?? ''}
    </label>
  ),

  Radio: ({ node, commonProps }) => (
    <label {...commonProps} style={{ ...commonProps.style, display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
      <input type="radio" readOnly checked={node.props.checked === 'true'} />
      {node.props.label ?? ''}
    </label>
  ),

  Toggle: ({ node, commonProps }) => (
    <label {...commonProps} style={{ ...commonProps.style, display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
      <div style={{
        width: '36px', height: '20px', borderRadius: '10px',
        background: node.props.checked === 'true' ? 'var(--accent)' : 'var(--bg-tertiary)',
        position: 'relative',
      }}>
        <div style={{
          width: '16px', height: '16px', borderRadius: '50%', background: '#fff',
          position: 'absolute', top: '2px',
          left: node.props.checked === 'true' ? '18px' : '2px',
          transition: 'left 0.2s',
        }} />
      </div>
      {node.props.label ?? ''}
    </label>
  ),

  Slider: ({ node, commonProps }) => (
    <div {...commonProps} style={{ ...commonProps.style, display: 'flex', alignItems: 'center', gap: '8px' }}>
      <input type="range" readOnly min={node.props.min ?? '0'} max={node.props.max ?? '100'} value={node.props.value ?? '50'} style={{ flex: 1 }} />
      <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{node.props.value ?? '50'}</span>
    </div>
  ),

  DatePicker: ({ node, commonProps }) => (
    <input {...commonProps} readOnly type="date" placeholder={node.props.placeholder ?? ''}
      style={{
        ...commonProps.style,
        padding: '8px 12px', border: '1px solid var(--border-color)', borderRadius: '4px',
        fontSize: '14px', background: 'var(--bg-primary)',
      }}
    />
  ),

  SearchBar: ({ node, commonProps }) => (
    <input {...commonProps} readOnly type="search" placeholder={node.props.placeholder ?? '検索...'}
      style={{
        ...commonProps.style,
        padding: '8px 12px', border: '1px solid var(--border-color)', borderRadius: '20px',
        fontSize: '14px', width: node.props.width ?? '100%', background: 'var(--bg-primary)',
      }}
    />
  ),

  Autocomplete: ({ node, commonProps }) => tagRenderers.SearchBar({ node, commonProps, selectedNodeId: null, onSelectNode: () => {}, children: null }),

  FileUpload: ({ node, commonProps }) => (
    <div {...commonProps} style={{
      ...commonProps.style,
      border: '2px dashed var(--border-color)', borderRadius: '8px',
      padding: '16px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '13px',
    }}>
      {node.props.label ?? 'ファイルをドロップ'}
    </div>
  ),

  Link: ({ node, commonProps }) => (
    <a {...commonProps} style={{
      ...commonProps.style,
      color: node.props.color ?? 'var(--accent)', textDecoration: 'none', fontSize: '13px',
    }}>
      {node.textContent ?? node.props.label ?? 'Link'}
    </a>
  ),

  // --- ナビゲーション系 ---
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

  AppBar: ({ node, commonProps, children }) => tagRenderers.Navbar({
    node: { ...node, props: { ...node.props, title: node.props.title ?? 'AppBar' } },
    commonProps, selectedNodeId: null, onSelectNode: () => {}, children,
  }),

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

  // --- 複合コンポーネント系 ---
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

  // --- フィードバック系 ---
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

  // --- 追加レンダラー ---

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

  TagInput: ({ node, commonProps }) => {
    const tags = (node.props.tags ?? 'tag1,tag2').split(',');
    return (
      <div {...commonProps} style={{
        ...commonProps.style,
        display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '4px',
        padding: '6px 8px', border: '1px solid var(--border-color)', borderRadius: '4px',
        background: 'var(--bg-primary)', minHeight: '36px',
      }}>
        {tags.map((tag, i) => (
          <span key={i} style={{
            padding: '2px 8px', background: 'var(--bg-tertiary)', borderRadius: '10px',
            fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px',
          }}>
            {tag.trim()}
            <span style={{ color: 'var(--text-secondary)', fontSize: '10px' }}>×</span>
          </span>
        ))}
        <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
          {node.props.placeholder ?? 'タグを追加...'}
        </span>
      </div>
    );
  },

  OTPInput: ({ node, commonProps }) => {
    const length = safeInt(node.props.length, 6);
    return (
      <div {...commonProps} style={{ ...commonProps.style, display: 'flex', gap: '8px' }}>
        {Array.from({ length }, (_, i) => (
          <div key={i} style={{
            width: '40px', height: '48px', border: '1px solid var(--border-color)',
            borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '20px', fontWeight: 600, background: 'var(--bg-primary)',
          }}>
            {i === 0 ? '•' : ''}
          </div>
        ))}
      </div>
    );
  },

  ColorPicker: ({ node, commonProps }) => (
    <div {...commonProps} style={{
      ...commonProps.style, display: 'flex', alignItems: 'center', gap: '8px',
    }}>
      <div style={{
        width: '32px', height: '32px', borderRadius: '6px',
        background: node.props.value ?? '#0078d4',
        border: '1px solid var(--border-color)',
      }} />
      <div>
        <div style={{ fontSize: '12px' }}>{node.props.label ?? 'Color'}</div>
        <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{node.props.value ?? '#0078d4'}</div>
      </div>
    </div>
  ),
};
