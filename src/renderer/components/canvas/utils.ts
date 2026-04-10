import React from 'react';
import { UINode, STRUCTURAL_PROPS } from '../../../parser';

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
  if (p.minWidth) { const v = normalizeCSSLength(p.minWidth); if (v) s.minWidth = v; }
  if (p.maxWidth) { const v = normalizeCSSLength(p.maxWidth); if (v) s.maxWidth = v; }
  if (p.minHeight) { const v = normalizeCSSLength(p.minHeight); if (v) s.minHeight = v; }
  if (p.maxHeight) { const v = normalizeCSSLength(p.maxHeight); if (v) s.maxHeight = v; }
  if (p.padding) s.padding = /^\d+$/.test(p.padding) ? `${p.padding}px` : p.padding;
  if (p.margin) s.margin = /^\d+$/.test(p.margin) ? `${p.margin}px` : p.margin;
  if (p.color) s.color = p.color;
  if (p.background) s.background = p.background;
  if (p.opacity) {
    const val = parseFloat(p.opacity);
    if (!isNaN(val)) s.opacity = Math.max(0, Math.min(1, val));
  }
  if (p.radius) s.borderRadius = /^\d+$/.test(p.radius) ? `${p.radius}px` : p.radius;
  if (p.border) s.border = p.border;
  if (p.shadow) s.boxShadow = p.shadow;
  if (p.overflow) s.overflow = p.overflow as React.CSSProperties['overflow'];
  if (p.zIndex) { const z = parseInt(p.zIndex, 10); if (!isNaN(z)) s.zIndex = z; }
  if (p.grow) { const g = parseFloat(p.grow); if (!isNaN(g)) s.flexGrow = g; }
  if (p.alignSelf) s.alignSelf = p.alignSelf;

  // ホワイトリスト外のプロパティもCSSとして適用（カスタムスタイル対応）
  const handled = new Set([
    'width', 'height', 'minWidth', 'maxWidth', 'minHeight', 'maxHeight',
    'padding', 'margin', 'color', 'background', 'opacity',
    'radius', 'border', 'shadow', 'overflow', 'zIndex', 'grow', 'alignSelf',
  ]);
  for (const [key, val] of Object.entries(p)) {
    if (handled.has(key) || !val) continue;
    // 構造プロパティ（TAG_PROPS由来）はCSSではないので除外
    if (STRUCTURAL_PROPS.has(key)) continue;
    // camelCase のプロパティ名で、CSSプロパティとして妥当なものを適用
    if (/^[a-z][a-zA-Z]*$/.test(key)) {
      // 純粋な数値ならpxを付与（length系プロパティ対応）
      (s as Record<string, string>)[key] = /^\d+(\.\d+)?$/.test(val) ? `${val}px` : val;
    }
  }

  return s;
}

/** レンダラー共通の props 型 */
/** px ヘルパー: "16" → "16px", undefined → undefined */
export function px(value: string | undefined): string | undefined {
  if (!value) return undefined;
  return /^\d+$/.test(value) ? `${value}px` : value;
}

/** リーフ要素（子を持てないタグ） */
export const LEAF_TAGS = new Set([
  'Text', 'Image', 'Icon', 'Divider', 'Avatar', 'Badge', 'Tag', 'ProgressBar', 'Skeleton', 'StatCard', 'Chart',
  'Button', 'Input', 'Textarea', 'Select', 'Checkbox', 'Radio', 'Toggle', 'Slider', 'DatePicker',
  'FileUpload', 'SearchBar', 'Autocomplete', 'TagInput', 'OTPInput', 'ColorPicker', 'Link',
  'Pagination', 'Spinner',
  'Rectangle', 'Ellipse', 'Line', 'Arrow', 'Polygon',
]);

/** variant カラースキーム（インライン系: Alert, Badge, Tag 等） */
export const VARIANT_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  success: { bg: '#ecfdf5', text: '#065f46', border: '#6ee7b7' },
  error:   { bg: '#fef2f2', text: '#991b1b', border: '#fca5a5' },
  warning: { bg: '#fffbeb', text: '#92400e', border: '#fcd34d' },
  info:    { bg: '#eff6ff', text: '#1e40af', border: '#93c5fd' },
};

/** variant カラースキーム（オーバーレイ系: Toast） */
export const TOAST_VARIANT_COLORS: Record<string, { bg: string; text: string }> = {
  success: { bg: '#065f46', text: '#fff' },
  error:   { bg: '#991b1b', text: '#fff' },
  warning: { bg: '#92400e', text: '#fff' },
  info:    { bg: '#1e40af', text: '#fff' },
};

export type Renderer = (p: RenderProps) => React.ReactElement;

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
