import React from 'react';
import { Renderer, px, safeInt } from '../utils';

export const inputRenderers: Record<string, Renderer> = {
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

  Autocomplete: ({ node, commonProps }) => (
    <input {...commonProps} readOnly type="search" placeholder={node.props.placeholder ?? '検索...'}
      style={{
        ...commonProps.style,
        padding: '8px 12px', border: '1px solid var(--border-color)', borderRadius: '20px',
        fontSize: '14px', width: node.props.width ?? '100%', background: 'var(--bg-primary)',
      }}
    />
  ),

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
