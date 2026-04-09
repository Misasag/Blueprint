import React from 'react';
import { UINode } from '../../../parser';

/** parseInt のNaN安全ラッパー */
export function safeInt(value: string | undefined, fallback: number): number {
  const n = parseInt(value ?? String(fallback), 10);
  return isNaN(n) ? fallback : n;
}

/** CSS値を正規化。��値のみなら px を付与 */
export function normalizeCSSLength(value: string): string | undefined {
  if (!value) return undefined;
  if (/^\d+(\.\d+)?$/.test(value)) return `${value}px`;
  if (value === 'auto' || value === 'inherit') return value;
  return value;
}

/** textAlign のバリデーション */
type TextAlign = 'left' | 'center' | 'right' | 'justify' | 'start' | 'end';
const VALID_TEXT_ALIGNS: TextAlign[] = ['left', 'center', 'right', 'justify', 'start', 'end'];
export function toTextAlign(value: string | undefined): TextAlign | undefined {
  if (!value) return undefined;
  return VALID_TEXT_ALIGNS.includes(value as TextAlign) ? (value as TextAlign) : undefined;
}

/** ノードの共通プロパティからCSSスタイルを構築 */
export function buildStyle(node: UINode): React.CSSProperties {
  const s: React.CSSProperties = {};
  const p = node.props;

  if (p.width) {
    const w = normalizeCSSLength(p.width);
    if (w) s.width = w;
  }
  if (p.height) {
    const h = normalizeCSSLength(p.height);
    if (h) s.height = h;
  }
  if (p.margin) s.margin = /^\d+$/.test(p.margin) ? `${p.margin}px` : p.margin;
  if (p.color) s.color = p.color;
  if (p.background) s.background = p.background;
  if (p.opacity) {
    const val = parseFloat(p.opacity);
    if (!isNaN(val)) s.opacity = Math.max(0, Math.min(1, val));
  }
  if (p.border) s.border = p.border;
  if (p.shadow) s.boxShadow = p.shadow;

  return s;
}

/** レンダラー共通の props 型 */
/** px ヘルパー: "16" → "16px", undefined → undefined */
export function px(value: string | undefined): string | undefined {
  if (!value) return undefined;
  return /^\d+$/.test(value) ? `${value}px` : value;
}

export interface RenderProps {
  node: UINode;
  commonProps: {
    onClick: (e: React.MouseEvent) => void;
    style: React.CSSProperties;
    'data-tag': string;
    'data-node-id': string;
  };
  selectedNodeId: string | null;
  onSelectNode: (nodeId: string) => void;
  children: React.ReactNode;
}
