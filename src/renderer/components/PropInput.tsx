import React, { useState, useEffect, useCallback } from 'react';

interface PropInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  isColor?: boolean;
}

/** スピナーの設定（step + 任意の min/max） */
const SPINNER_CONFIG: Record<string, { step: number; min?: number; max?: number }> = {
  padding: { step: 1, min: 0 }, margin: { step: 1 }, gap: { step: 1, min: 0 }, radius: { step: 1, min: 0 },
  size: { step: 1, min: 1 }, thickness: { step: 1, min: 1 }, rows: { step: 1, min: 1 }, cols: { step: 1, min: 1 },
  min: { step: 1 }, max: { step: 1 }, value: { step: 1 }, step: { step: 1, min: 1 }, length: { step: 1, min: 1 },
  zIndex: { step: 1, min: 0 }, grow: { step: 1, min: 0 }, sides: { step: 1, min: 3 },
  width: { step: 1, min: 0 }, height: { step: 1, min: 0 },
  minWidth: { step: 1, min: 0 }, maxWidth: { step: 1, min: 0 },
  minHeight: { step: 1, min: 0 }, maxHeight: { step: 1, min: 0 },
  strokeWidth: { step: 1, min: 1 },
  opacity: { step: 0.05, min: 0, max: 1 }, lineHeight: { step: 0.1, min: 0.5 },
};

/** 長さ系プロパティ（単位表示が必要） */
const LENGTH_PROPS = new Set([
  'width', 'height', 'minWidth', 'maxWidth', 'minHeight', 'maxHeight',
  'padding', 'margin', 'gap', 'radius', 'size', 'length',
]);

/** 単位の選択肢 */
const UNITS = ['px', '%', 'em', 'rem'] as const;

/** 値から数値と単位を分離する */
function parseValueUnit(val: string): { num: string; unit: string } {
  if (!val) return { num: '', unit: 'px' };
  const match = val.match(/^(-?\d*\.?\d+)\s*(px|%|em|rem)?$/);
  if (match) {
    return { num: match[1], unit: match[2] || 'px' };
  }
  return { num: val, unit: '' };
}

/** 値が純粋な数値かどうかを判定 */
function isNumericValue(val: string): boolean {
  if (val === '') return false;
  return !isNaN(Number(val));
}

/** デバウンス付きプロパティ入力 */
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

  const spinnerConfig = SPINNER_CONFIG[label];
  const isLength = LENGTH_PROPS.has(label);
  const showSpinner = spinnerConfig !== undefined && (isNumericValue(localValue) || localValue === '' || (isLength && parseValueUnit(localValue).num !== localValue));

  const handleIncrement = useCallback((delta: number) => {
    if (!spinnerConfig) return;
    const { step, min, max } = spinnerConfig;
    if (isLength) {
      const { num, unit } = parseValueUnit(localValue || '0');
      let next = Math.round((Number(num) + delta * step) * 100) / 100;
      if (min !== undefined) next = Math.max(min, next);
      if (max !== undefined) next = Math.min(max, next);
      // 元の値が単位なし数値なら単位なしで保存（.uiフォーマットの慣例維持）
      const hasExplicitUnit = /[a-z%]+$/i.test(localValue);
      const newVal = hasExplicitUnit ? `${next}${unit}` : String(next);
      setLocalValue(newVal);
      onChange(newVal);
    } else {
      const current = Number(localValue) || 0;
      let next = Math.round((current + delta * step) * 100) / 100;
      if (min !== undefined) next = Math.max(min, next);
      if (max !== undefined) next = Math.min(max, next);
      const newVal = String(next);
      setLocalValue(newVal);
      onChange(newVal);
    }
  }, [localValue, spinnerConfig, isLength, onChange]);

  const handleUnitCycle = useCallback(() => {
    if (!isLength) return;
    const { num, unit } = parseValueUnit(localValue);
    const idx = UNITS.indexOf(unit as typeof UNITS[number]);
    const nextUnit = UNITS[(idx + 1) % UNITS.length];
    const newVal = num ? `${num}${nextUnit}` : '';
    setLocalValue(newVal);
    if (newVal) onChange(newVal);
  }, [localValue, isLength, onChange]);

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
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '2px' }}>
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
        <input
          type="text"
          value={isLength ? parseValueUnit(localValue).num : localValue}
          onChange={e => {
            if (isLength) {
              const hasExplicitUnit = /[a-z%]+$/i.test(localValue);
              const raw = e.target.value;
              if (hasExplicitUnit) {
                const { unit } = parseValueUnit(localValue);
                setLocalValue(raw ? `${raw}${unit}` : '');
              } else {
                setLocalValue(raw);
              }
            } else {
              setLocalValue(e.target.value);
            }
          }}
          onKeyDown={e => {
            if (e.key === 'Enter') commitValue();
            if (showSpinner) {
              if (e.key === 'ArrowUp') { e.preventDefault(); handleIncrement(1); }
              if (e.key === 'ArrowDown') { e.preventDefault(); handleIncrement(-1); }
            }
          }}
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
        {showSpinner && (
          <div style={{ display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
            <button
              onClick={() => handleIncrement(1)}
              style={spinnerBtnStyle}
              tabIndex={-1}
            >▲</button>
            <button
              onClick={() => handleIncrement(-1)}
              style={spinnerBtnStyle}
              tabIndex={-1}
            >▼</button>
          </div>
        )}
        {isLength && showSpinner && (
          <button
            onClick={handleUnitCycle}
            style={unitBtnStyle}
            tabIndex={-1}
            title="単位を切り替え"
          >
            {parseValueUnit(localValue).unit || 'px'}
          </button>
        )}
      </div>
    </div>
  );
};

const spinnerBtnStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  width: '14px', height: '10px',
  border: 'none', background: 'transparent',
  fontSize: '6px', cursor: 'pointer', padding: 0,
  color: 'var(--text-secondary)', lineHeight: 1,
};

const unitBtnStyle: React.CSSProperties = {
  padding: '1px 4px',
  border: '1px solid var(--border-color)',
  borderRadius: '2px',
  fontSize: '9px',
  background: 'var(--bg-secondary)',
  color: 'var(--text-secondary)',
  cursor: 'pointer',
  flexShrink: 0,
  fontFamily: 'inherit',
};
