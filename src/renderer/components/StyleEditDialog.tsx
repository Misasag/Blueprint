import React, { useState } from 'react';

interface StyleEditDialogProps {
  nodeTag: string;
  onAdd: (propName: string, value: string) => void;
  onClose: () => void;
  position: { x: number; y: number };
}

export const StyleEditDialog: React.FC<StyleEditDialogProps> = ({ nodeTag, onAdd, onClose, position }) => {
  const [propName, setPropName] = useState('');
  const [value, setValue] = useState('');

  const handleSubmit = () => {
    const name = propName.trim();
    const val = value.trim();
    if (!name || !val) return;
    onAdd(name, val);
    setPropName('');
    setValue('');
  };

  // 画面端に収まるよう位置を調整
  const left = Math.min(position.x, window.innerWidth - 280);
  const top = Math.min(position.y, window.innerHeight - 220);

  return (
    <>
      {/* 背景オーバーレイ */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 999,
        }}
      />
      {/* ダイアログ */}
      <div style={{
        position: 'fixed', left, top, zIndex: 1000,
        width: '260px',
        background: 'var(--bg-primary)',
        border: '1px solid var(--border-color)',
        borderRadius: '8px',
        boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
        padding: '12px',
      }}>
        <div style={{
          fontSize: '12px', fontWeight: 600, marginBottom: '8px',
          color: 'var(--accent)',
        }}>
          &lt;{nodeTag}&gt; にスタイルを追加
        </div>

        <div style={{ marginBottom: '6px' }}>
          <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '2px' }}>
            プロパティ名
          </label>
          <input
            type="text"
            value={propName}
            onChange={e => setPropName(e.target.value)}
            placeholder="例: letterSpacing"
            autoFocus
            style={inputStyle}
          />
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '2px' }}>
            値
          </label>
          <input
            type="text"
            value={value}
            onChange={e => setValue(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleSubmit(); }}
            placeholder="例: 2px"
            style={inputStyle}
          />
        </div>

        <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={btnStyle}>
            キャンセル
          </button>
          <button
            onClick={handleSubmit}
            disabled={!propName.trim() || !value.trim()}
            style={{
              ...btnStyle,
              background: 'var(--accent)',
              color: '#fff',
              opacity: (!propName.trim() || !value.trim()) ? 0.4 : 1,
            }}
          >
            追加
          </button>
        </div>
      </div>
    </>
  );
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '4px 8px',
  border: '1px solid var(--border-color)',
  borderRadius: '4px',
  fontSize: '12px',
  background: 'var(--bg-secondary)',
  outline: 'none',
  fontFamily: 'inherit',
};

const btnStyle: React.CSSProperties = {
  padding: '4px 12px',
  border: '1px solid var(--border-color)',
  borderRadius: '4px',
  fontSize: '11px',
  background: 'var(--bg-primary)',
  cursor: 'pointer',
  fontFamily: 'inherit',
};
