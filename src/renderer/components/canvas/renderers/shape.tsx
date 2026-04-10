import React from 'react';
import { Renderer, px } from '../utils';

/** 正多角形の clip-path を生成 */
function polygonClipPath(sides: number): string {
  const points: string[] = [];
  for (let i = 0; i < sides; i++) {
    const angle = (2 * Math.PI * i) / sides - Math.PI / 2;
    const x = 50 + 50 * Math.cos(angle);
    const y = 50 + 50 * Math.sin(angle);
    points.push(`${x.toFixed(2)}% ${y.toFixed(2)}%`);
  }
  return `polygon(${points.join(', ')})`;
}

export const shapeRenderers: Record<string, Renderer> = {
  Rectangle: ({ node, commonProps }) => (
    <div {...commonProps} style={{
      ...commonProps.style,
      width: px(node.props.width) ?? '200px',
      height: px(node.props.height) ?? '100px',
      background: node.props.background ?? 'var(--bg-tertiary)',
      borderRadius: px(node.props.radius),
      border: node.props.border ?? undefined,
    }} />
  ),

  Ellipse: ({ node, commonProps }) => (
    <div {...commonProps} style={{
      ...commonProps.style,
      width: px(node.props.width) ?? '48px',
      height: px(node.props.height) ?? '48px',
      background: node.props.background ?? 'var(--bg-tertiary)',
      borderRadius: '50%',
      border: node.props.border ?? undefined,
    }} />
  ),

  Line: ({ node, commonProps }) => {
    const length = px(node.props.length) ?? '100px';
    const strokeWidth = node.props.strokeWidth ?? '1';
    const stroke = node.props.stroke ?? 'var(--border-color)';
    const isVertical = node.props.direction === 'vertical';
    return (
      <div {...commonProps} style={{
        ...commonProps.style,
        width: isVertical ? '0px' : length,
        height: isVertical ? length : '0px',
        ...(isVertical
          ? { borderLeft: `${strokeWidth}px solid ${stroke}` }
          : { borderTop: `${strokeWidth}px solid ${stroke}` }
        ),
      }} />
    );
  },

  Arrow: ({ node, commonProps }) => {
    const length = px(node.props.length) ?? '100px';
    const strokeWidth = parseFloat(node.props.strokeWidth ?? '2') || 2;
    const stroke = node.props.stroke ?? 'var(--text-primary)';
    const direction = node.props.direction ?? 'right';
    const arrowSize = strokeWidth * 3;
    const isHorizontal = direction === 'right' || direction === 'left';

    return (
      <div {...commonProps} style={{
        ...commonProps.style,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: isHorizontal ? 'row' : 'column',
      }}>
        {(direction === 'left' || direction === 'up') && (
          <span style={{
            fontSize: `${arrowSize}px`, lineHeight: 1, color: stroke, flexShrink: 0,
          }}>
            {direction === 'left' ? '◀' : '▲'}
          </span>
        )}
        <div style={{
          ...(isHorizontal
            ? { width: length, height: '0px', borderTop: `${strokeWidth}px solid ${stroke}` }
            : { height: length, width: '0px', borderLeft: `${strokeWidth}px solid ${stroke}` }
          ),
        }} />
        {(direction === 'right' || direction === 'down') && (
          <span style={{
            fontSize: `${arrowSize}px`, lineHeight: 1, color: stroke, flexShrink: 0,
          }}>
            {direction === 'right' ? '▶' : '▼'}
          </span>
        )}
      </div>
    );
  },

  Polygon: ({ node, commonProps }) => {
    const sides = Math.max(3, parseInt(node.props.sides ?? '3', 10) || 3);
    const size = px(node.props.size) ?? '48px';
    return (
      <div {...commonProps} style={{
        ...commonProps.style,
        width: size,
        height: size,
        background: node.props.background ?? 'var(--bg-tertiary)',
        clipPath: polygonClipPath(sides),
        border: node.props.border ?? undefined,
      }} />
    );
  },
};
