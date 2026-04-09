import React, { useState, useEffect, useCallback } from 'react';

interface PropInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  isColor?: boolean;
}

/** 数値スライダーの範囲定義 */
const SLIDER_CONFIG: Record<string, { min: number; max: number; step: number }> = {
  padding: { min: 0, max: 64, step: 1 },
  margin: { min: 0, max: 64, step: 1 },
  gap: { min: 0, max: 64, step: 1 },
  radius: { min: 0, max: 32, step: 1 },
  opacity: { min: 0, max: 1, step: 0.05 },
  size: { min: 8, max: 72, step: 1 },
  lineHeight: { min: 1, max: 3, step: 0.1 },
  thickness: { min: 1, max: 8, step: 1 },
  rows: { min: 1, max: 20, step: 1 },
  cols: { min: 1, max: 12, step: 1 },
  min: { min: 0, max: 1000, step: 1 },
  max: { min: 0, max: 1000, step: 1 },
  value: { min: 0, max: 100, step: 1 },
  step: { min: 1, max: 50, step: 1 },
  length: { min: 3, max: 8, step: 1 },
  zIndex: { min: 0, max: 100, step: 1 },
  grow: { min: 0, max: 5, step: 1 },
};

/** 値が純粋な数値かどうかを判定 */
function isNumericValue(val: string): boolean {
  if (val === '') return false;
  return !isNaN(Number(val));
}

/** デバウンス付きプロパティ入力 — ローカルstateで即座に反映、commitはblur/Enter時 */
export const PropInput: React.FC<PropInputProps> = ({ label, value, onChange, isColor }) => {
  const [localValue, setLocalValue] = useState(value);
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (!focused) {
      setLocalValue(value);
    }
  }, [value, focused]);

  const commitValue = useCallback(() => {
    if (localValue !== value) {
      onChange(localValue);
    }
  }, [localValue, value, onChange]);

  const sliderConfig = SLIDER_CONFIG[label];
  const showSlider = sliderConfig && (isNumericValue(localValue) || localValue === '');

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      marginBottom: '2px',
      gap: '4px',
    }}>
      <label style={{
        width: '70px',
        fontSize: '11px',
        color: 'var(--text-secondary)',
        flexShrink: 0,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      }}>
        {label}
      </label>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '4px' }}>
        {isColor && (
          <input
            type="color"
            value={(localValue || '#000000').startsWith('#') ? localValue || '#000000' : '#000000'}
            onChange={e => setLocalValue(e.target.value)}
            onBlur={() => onChange(localValue)}
            style={{
              width: '20px',
              height: '20px',
              border: '1px solid var(--border-color)',
              borderRadius: '2px',
              padding: 0,
              cursor: 'pointer',
            }}
          />
        )}
        {showSlider && (
          <input
            type="range"
            min={sliderConfig.min}
            max={sliderConfig.max}
            step={sliderConfig.step}
            value={Number(localValue) || sliderConfig.min}
            onChange={e => {
              const v = sliderConfig.step < 1 ? e.target.value : String(Math.round(Number(e.target.value)));
              setLocalValue(v);
              onChange(v);
            }}
            style={{
              width: '60px',
              flexShrink: 0,
              accentColor: 'var(--accent)',
            }}
          />
        )}
        <input
          type="text"
          value={localValue}
          onChange={e => setLocalValue(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') commitValue(); }}
          placeholder="—"
          style={{
            flex: 1,
            padding: '2px 6px',
            border: focused ? '1px solid var(--accent)' : '1px solid transparent',
            borderRadius: '3px',
            fontSize: '11px',
            background: 'var(--bg-secondary)',
            outline: 'none',
            minWidth: 0,
          }}
          onFocus={() => setFocused(true)}
          onBlur={() => {
            setFocused(false);
            commitValue();
          }}
        />
      </div>
    </div>
  );
};
