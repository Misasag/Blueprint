import React, { useRef } from 'react';
import { UINode } from '../../parser';
import { buildStyle, LEAF_TAGS } from './canvas/utils';
import { tagRenderers } from './canvas/renderers';
import { canvasUIStore, useNodeUIState, DropPosition } from './canvas/dragStore';

/** 親のタグから判定方向を決定 */
function isHorizontalParent(parentTag: string | undefined): boolean {
  return parentTag === 'HStack';
}

interface RenderNodeProps {
  node: UINode;
  parentId: string | null;
  parentTag?: string;
  siblingIndex: number;
  onSelectNode: (nodeId: string) => void;
  onSelectNodeAdd?: (nodeId: string) => void;
  onAddNode: (tag: string, parentId: string | null, index?: number) => void;
  onMoveNode: (nodeId: string, targetParentId: string | null, targetIndex: number) => void;
}

export const RenderNode = React.memo<RenderNodeProps>(function RenderNode({
  node, parentId, parentTag, siblingIndex, onSelectNode, onSelectNodeAdd, onAddNode, onMoveNode,
}) {
  const { isSelected, isDragging, isDropTarget, dropPosition } = useNodeUIState(node.id);
  const enterCount = useRef(0);
  const isLeaf = LEAF_TAGS.has(node.tag);
  const isHorizontal = isHorizontalParent(parentTag);

  const style = buildStyle(node);

  // インジケーター表示
  const indicatorStyle: React.CSSProperties = {};
  if (isDropTarget && dropPosition === 'before') {
    if (isHorizontal) {
      indicatorStyle.boxShadow = 'inset 2px 0 0 0 var(--accent)';
    } else {
      indicatorStyle.boxShadow = 'inset 0 2px 0 0 var(--accent)';
    }
  } else if (isDropTarget && dropPosition === 'after') {
    if (isHorizontal) {
      indicatorStyle.boxShadow = 'inset -2px 0 0 0 var(--accent)';
    } else {
      indicatorStyle.boxShadow = 'inset 0 -2px 0 0 var(--accent)';
    }
  }

  const decorationStyle: React.CSSProperties = {
    ...(isSelected && { outline: '2px solid var(--selection)', outlineOffset: '-1px' }),
    ...(isDropTarget && dropPosition === 'inside' && { outline: '2px dashed var(--accent)', outlineOffset: '-1px', background: 'var(--accent-light)' }),
    ...indicatorStyle,
    ...(isDragging && { opacity: 0.4 }),
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if ((e.ctrlKey || e.metaKey) && onSelectNodeAdd) {
      onSelectNodeAdd(node.id);
    } else {
      onSelectNode(node.id);
    }
  };

  const handleDragStart = (e: React.DragEvent) => {
    e.stopPropagation();
    e.dataTransfer.setData('application/x-blueprint-node-id', node.id);
    e.dataTransfer.setData('application/x-blueprint-source-parent', parentId ?? '');
    e.dataTransfer.setData('application/x-blueprint-source-index', String(siblingIndex));
    e.dataTransfer.effectAllowed = 'move';
    canvasUIStore.setDragging(node.id);
  };

  const handleDragEnd = () => {
    canvasUIStore.setDragging(null);
    canvasUIStore.setDropTarget(null);
    enterCount.current = 0;
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.stopPropagation();
    enterCount.current++;
  };

  /** 3分割判定でドロップ位置を計算 */
  const calcDropPosition = (e: React.DragEvent): DropPosition => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    if (isHorizontal) {
      const x = e.clientX - rect.left;
      const ratio = x / rect.width;
      if (isLeaf) return ratio < 0.5 ? 'before' : 'after';
      if (ratio < 0.25) return 'before';
      if (ratio > 0.75) return 'after';
      return 'inside';
    } else {
      const y = e.clientY - rect.top;
      const ratio = y / rect.height;
      if (isLeaf) return ratio < 0.5 ? 'before' : 'after';
      if (ratio < 0.25) return 'before';
      if (ratio > 0.75) return 'after';
      return 'inside';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = e.dataTransfer.types.includes('application/x-blueprint-tag') ? 'copy' : 'move';
    const pos = calcDropPosition(e);
    canvasUIStore.setDropTarget(node.id, pos);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.stopPropagation();
    enterCount.current--;
    if (enterCount.current <= 0) {
      enterCount.current = 0;
      canvasUIStore.setDropTarget(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    enterCount.current = 0;
    const pos = calcDropPosition(e);
    const tag = e.dataTransfer.getData('application/x-blueprint-tag');
    const movingId = e.dataTransfer.getData('application/x-blueprint-node-id');

    let insertIdx = pos === 'before' ? siblingIndex : siblingIndex + 1;

    if (pos === 'inside') {
      if (tag) {
        onAddNode(tag, node.id);
      } else if (movingId && movingId !== node.id) {
        onMoveNode(movingId, node.id, node.children.length);
      }
    } else {
      if (tag) {
        onAddNode(tag, parentId, insertIdx);
      } else if (movingId && movingId !== node.id) {
        // 同じ親内での移動時、削除後のインデックスを考慮
        const sourceParent = e.dataTransfer.getData('application/x-blueprint-source-parent');
        const sourceIndex = parseInt(e.dataTransfer.getData('application/x-blueprint-source-index'), 10);
        const sourceParentId = sourceParent || null;
        if (sourceParentId === parentId && !isNaN(sourceIndex) && sourceIndex < insertIdx) {
          insertIdx--;
        }
        onMoveNode(movingId, parentId, insertIdx);
      }
    }
    canvasUIStore.setDragging(null);
    canvasUIStore.setDropTarget(null);
  };

  const commonProps = {
    onClick: handleClick,
    draggable: true,
    onDragStart: handleDragStart,
    onDragEnd: handleDragEnd,
    onDragEnter: handleDragEnter,
    onDragOver: handleDragOver,
    onDragLeave: handleDragLeave,
    onDrop: handleDrop,
    style: { ...style, ...decorationStyle, cursor: 'pointer', position: 'relative' as const },
    'data-tag': node.tag,
    'data-node-id': node.id,
  };

  const children = node.children.map((child, i) => (
    <RenderNode
      key={child.id}
      node={child}
      parentId={node.id}
      parentTag={node.tag}
      siblingIndex={i}
      onSelectNode={onSelectNode}
      onSelectNodeAdd={onSelectNodeAdd}
      onAddNode={onAddNode}
      onMoveNode={onMoveNode}
    />
  ));

  const renderer = tagRenderers[node.tag];
  if (renderer) {
    return renderer({ node, commonProps, selectedNodeId: null, onSelectNode, children });
  }

  return (
    <div {...commonProps} style={{
      ...commonProps.style,
      padding: node.props.padding ? `${node.props.padding}px` : '8px',
      border: '1px dashed var(--border-color)',
      borderRadius: '4px',
      fontSize: '12px',
    }}>
      <span style={{ color: 'var(--text-secondary)', fontSize: '10px' }}>&lt;{node.tag}&gt;</span>
      {node.textContent && <div>{node.textContent}</div>}
      {children}
    </div>
  );
});
