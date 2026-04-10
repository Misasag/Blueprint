import React from 'react';
import { Renderer, px, safeInt } from '../utils';

/** disabled 共通スタイル */
const disabledStyle: React.CSSProperties = { opacity: 0.5, pointerEvents: 'none' };

export const inputRenderers: Record<string, Renderer> = {
  Button: ({ node, commonProps }) => {
    const sizeStyle = node.props.size === 'small' ? { padding: '4px 10px', fontSize: '12px' }
      : node.props.size === 'large' ? { padding: '12px 24px', fontSize: '16px' }
      : { padding: px(node.props.padding) ?? '8px 16px', fontSize: '14px' };
    const variant = node.props.variant ?? 'filled';
    const color = node.props.color ?? '#0078d4';
    const isDisabled = node.props.disabled === 'true';
    const variantStyle: React.CSSProperties =
      variant === 'outlined' ? { backgroundColor: 'transparent', color, border: `1px solid ${color}` }
      : variant === 'ghost' ? { backgroundColor: 'transparent', color, border: 'none' }
      : variant === 'text' ? { backgroundColor: 'transparent', color, border: 'none', padding: '4px 8px' }
      : { backgroundColor: color, color: '#ffffff', border: 'none' };
    return (
      <button {...commonProps} style={{
        ...commonProps.style,
        ...sizeStyle,
        ...variantStyle,
        borderRadius: px(node.props.radius) ?? '4px',
        fontWeight: 500, width: node.props.width ?? undefined,
        opacity: node.props.loading === 'true' ? 0.7 : undefined,
        display: 'inline-flex', alignItems: 'center', gap: '6px',
        ...(isDisabled ? disabledStyle : {}),
      }}>
        {node.props.icon && node.props.iconPosition !== 'right' && <span>{node.props.icon}</span>}
        {node.props.loading === 'true' ? '...' : (node.textContent ?? node.props.label ?? 'Button')}
        {node.props.icon && node.props.iconPosition === 'right' && <span>{node.props.icon}</span>}
      </button>
    );
  },

  Input: ({ node, commonProps }) => {
    const hasError = !!node.props.error;
    const isDisabled = node.props.disabled === 'true';
    return (
      <div {...commonProps} style={{ ...commonProps.style, width: node.props.width ?? undefined, ...(isDisabled ? disabledStyle : {}) }}>
        {node.props.label && (
          <div style={{ fontSize: '12px', marginBottom: '4px', color: 'var(--text-secondary)' }}>
            {node.props.label}
            {node.props.required === 'true' && <span style={{ color: '#d32f2f', marginLeft: '2px' }}>*</span>}
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'center', border: `1px solid ${hasError ? '#d32f2f' : 'var(--border-color)'}`, borderRadius: px(node.props.radius) ?? '4px', background: isDisabled ? 'var(--bg-tertiary)' : 'var(--bg-primary)', overflow: 'hidden' }}>
          {node.props.prefix && <span style={{ padding: '8px', color: 'var(--text-secondary)', fontSize: '13px', background: 'var(--bg-secondary)', borderRight: '1px solid var(--border-color)' }}>{node.props.prefix}</span>}
          <input readOnly type={node.props.type ?? 'text'} placeholder={node.props.value ? undefined : (node.props.placeholder ?? '')} value={node.props.value ?? ''}
            style={{ flex: 1, padding: '8px 12px', border: 'none', fontSize: '14px', background: 'transparent', outline: 'none', fontFamily: 'inherit' }}
          />
          {node.props.suffix && <span style={{ padding: '8px', color: 'var(--text-secondary)', fontSize: '13px', background: 'var(--bg-secondary)', borderLeft: '1px solid var(--border-color)' }}>{node.props.suffix}</span>}
        </div>
        {node.props.error && <div style={{ fontSize: '11px', color: '#d32f2f', marginTop: '2px' }}>{node.props.error}</div>}
        {node.props.helperText && !node.props.error && <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>{node.props.helperText}</div>}
      </div>
    );
  },

  Textarea: ({ node, commonProps }) => {
    const hasError = !!node.props.error;
    const isDisabled = node.props.disabled === 'true';
    const valLen = (node.props.value ?? '').length;
    return (
      <div {...commonProps} style={{ ...commonProps.style, width: node.props.width ?? '100%', ...(isDisabled ? disabledStyle : {}) }}>
        {node.props.label && (
          <div style={{ fontSize: '12px', marginBottom: '4px', color: 'var(--text-secondary)' }}>{node.props.label}</div>
        )}
        <textarea readOnly placeholder={node.props.value ? undefined : (node.props.placeholder ?? '')} value={node.props.value ?? ''} rows={safeInt(node.props.rows, 3)}
          style={{
            width: '100%', padding: '8px 12px',
            border: `1px solid ${hasError ? '#d32f2f' : 'var(--border-color)'}`,
            borderRadius: '4px', fontSize: '14px', resize: 'none', fontFamily: 'inherit',
            background: isDisabled ? 'var(--bg-tertiary)' : undefined,
          }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2px' }}>
          <div>{node.props.error && <span style={{ fontSize: '11px', color: '#d32f2f' }}>{node.props.error}</span>}</div>
          {node.props.maxLength && <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>{valLen}/{node.props.maxLength}</span>}
        </div>
      </div>
    );
  },

  Select: ({ node, commonProps }) => {
    const hasError = !!node.props.error;
    const isDisabled = node.props.disabled === 'true';
    return (
      <div {...commonProps} style={{ ...commonProps.style, width: node.props.width ?? undefined, ...(isDisabled ? disabledStyle : {}) }}>
        {node.props.label && (
          <div style={{ fontSize: '12px', marginBottom: '4px', color: 'var(--text-secondary)' }}>{node.props.label}</div>
        )}
        <div style={{
          display: 'flex', alignItems: 'center',
          border: `1px solid ${hasError ? '#d32f2f' : 'var(--border-color)'}`,
          borderRadius: '4px', background: isDisabled ? 'var(--bg-tertiary)' : 'var(--bg-primary)', overflow: 'hidden',
        }}>
          {node.props.searchable === 'true' && (
            <span style={{ padding: '8px 4px 8px 8px', color: 'var(--text-secondary)', fontSize: '12px' }}>🔍</span>
          )}
          <select style={{
            flex: 1, padding: '8px 12px',
            border: 'none', fontSize: '14px', background: 'transparent', fontFamily: 'inherit', appearance: 'auto',
          }}>
            {node.props.value
              ? <option>{node.props.value}</option>
              : <option>{node.props.placeholder ?? '選択してください'}</option>
            }
            {node.props.options?.split(',').map((opt, i) => <option key={i}>{opt.trim()}</option>)}
          </select>
        </div>
        {node.props.multiple === 'true' && <div style={{ fontSize: '10px', color: 'var(--text-secondary)', marginTop: '2px' }}>複数選択可</div>}
        {node.props.error && <div style={{ fontSize: '11px', color: '#d32f2f', marginTop: '2px' }}>{node.props.error}</div>}
      </div>
    );
  },

  Checkbox: ({ node, commonProps }) => {
    const isDisabled = node.props.disabled === 'true';
    const isIndeterminate = node.props.indeterminate === 'true';
    return (
      <label {...commonProps} style={{ ...commonProps.style, display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', ...(isDisabled ? disabledStyle : {}) }}>
        {isIndeterminate ? (
          <div style={{
            width: '16px', height: '16px', borderRadius: '3px',
            background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: '12px', fontWeight: 700,
          }}>−</div>
        ) : (
          <input type="checkbox" readOnly checked={node.props.checked === 'true'} />
        )}
        {node.props.label ?? ''}
      </label>
    );
  },

  Radio: ({ node, commonProps }) => {
    const isDisabled = node.props.disabled === 'true';
    return (
      <label {...commonProps} style={{ ...commonProps.style, display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', ...(isDisabled ? disabledStyle : {}) }}>
        <input type="radio" readOnly checked={node.props.checked === 'true'} />
        {node.props.label ?? ''}
      </label>
    );
  },

  Toggle: ({ node, commonProps }) => {
    const isDisabled = node.props.disabled === 'true';
    const isChecked = node.props.checked === 'true';
    const sz = node.props.size;
    const w = sz === 'small' ? 28 : sz === 'large' ? 48 : 36;
    const h = sz === 'small' ? 16 : sz === 'large' ? 26 : 20;
    const thumb = sz === 'small' ? 12 : sz === 'large' ? 22 : 16;
    return (
      <label {...commonProps} style={{ ...commonProps.style, display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', ...(isDisabled ? disabledStyle : {}) }}>
        <div style={{
          width: `${w}px`, height: `${h}px`, borderRadius: `${h / 2}px`,
          background: isChecked ? 'var(--accent)' : 'var(--bg-tertiary)',
          position: 'relative',
        }}>
          <div style={{
            width: `${thumb}px`, height: `${thumb}px`, borderRadius: '50%', background: '#fff',
            position: 'absolute', top: `${(h - thumb) / 2}px`,
            left: isChecked ? `${w - thumb - (h - thumb) / 2}px` : `${(h - thumb) / 2}px`,
            transition: 'left 0.2s',
          }} />
        </div>
        {node.props.label ?? ''}
      </label>
    );
  },

  Slider: ({ node, commonProps }) => (
    <div {...commonProps} style={{ ...commonProps.style }}>
      {node.props.label && <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>{node.props.label}</div>}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <input type="range" readOnly
          min={node.props.min ?? '0'} max={node.props.max ?? '100'}
          value={node.props.value ?? '50'} step={node.props.step ?? '1'}
          style={{ flex: 1 }}
        />
        {node.props.showValue !== 'false' && (
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{node.props.value ?? '50'}</span>
        )}
      </div>
    </div>
  ),

  DatePicker: ({ node, commonProps }) => (
    <input {...commonProps} readOnly type="date" value={node.props.value ?? ''} placeholder={node.props.placeholder ?? ''}
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

  Autocomplete: ({ node, commonProps }) => {
    const optionCount = node.props.options ? node.props.options.split(',').length : 0;
    return (
      <div {...commonProps} style={{ ...commonProps.style, width: node.props.width ?? '100%', position: 'relative' }}>
        <input readOnly type="search" placeholder={node.props.placeholder ?? '検索...'}
          style={{
            width: '100%', padding: '8px 12px', paddingRight: '48px',
            border: '1px solid var(--border-color)', borderRadius: '20px',
            fontSize: '14px', background: 'var(--bg-primary)',
          }}
        />
        <span style={{
          position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
          fontSize: '11px', color: 'var(--text-secondary)',
        }}>
          ▼{optionCount > 0 && ` ${optionCount}件`}
        </span>
      </div>
    );
  },

  FileUpload: ({ node, commonProps }) => (
    <div {...commonProps} style={{
      ...commonProps.style,
      border: '2px dashed var(--border-color)', borderRadius: '8px',
      padding: '16px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '13px',
    }}>
      {node.props.label ?? 'ファイルをドロップ'}
      {node.props.accept && <div style={{ fontSize: '10px', marginTop: '4px', color: 'var(--text-secondary)' }}>対応形式: {node.props.accept}</div>}
    </div>
  ),

  Link: ({ node, commonProps }) => (
    <div {...commonProps} style={{ ...commonProps.style }}>
      <a style={{
        color: node.props.color ?? 'var(--accent)', textDecoration: 'none', fontSize: '13px',
      }}>
        {node.textContent ?? node.props.label ?? 'Link'}
      </a>
      {node.props.href && <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>{node.props.href}</div>}
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
    const ph = node.props.placeholder ?? '';
    return (
      <div {...commonProps} style={{ ...commonProps.style, display: 'flex', gap: '8px' }}>
        {Array.from({ length }, (_, i) => (
          <div key={i} style={{
            width: '40px', height: '48px', border: '1px solid var(--border-color)',
            borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '20px', fontWeight: 600, background: 'var(--bg-primary)',
            color: ph ? 'var(--text-secondary)' : undefined,
          }}>
            {ph && i < ph.length ? ph[i] : ''}
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
