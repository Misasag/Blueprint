import React, { useRef } from 'react';
import { UINode } from '../../parser';
import { buildStyle } from './canvas/utils';
import { tagRenderers } from './canvas/renderers';
import { canvasUIStore, useNodeUIState } from './canvas/dragStore';

interface RenderNodeProps {
  node: UINode;
  onSelectNode: (nodeId: string) => void;
  onAddNode: (tag: string, parentId: string | null, index?: number) => void;
  onMoveNode: (nodeId: string, targetParentId: string | null, targetIndex: number) => void;
}

export const RenderNode = React.memo<RenderNodeProps>(function RenderNode({
  node, onSelectNode, onAddNode, onMoveNode,
}) {
  const { isSelected, isDragging, isDropTarget } = useNodeUIState(node.id);
  const enterCount = useRef(0);

  const style = buildStyle(node);
  const decorationStyle: React.CSSProperties = {
    ...(isSelected && { outline: '2px solid var(--selection)', outlineOffset: '-1px' }),
    ...(isDropTarget && { outline: '2px dashed var(--accent)', outlineOffset: '-1px', background: 'var(--accent-light)' }),
    ...(isDragging && { opacity: 0.4 }),
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelectNode(node.id);
  };

  const handleDragStart = (e: React.DragEvent) => {
    e.stopPropagation();
    e.dataTransfer.setData('application/x-blueprint-node-id', node.id);
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
    if (enterCount.current === 1) {
      canvasUIStore.setDropTarget(node.id);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = e.dataTransfer.types.includes('application/x-blueprint-tag') ? 'copy' : 'move';
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
    const tag = e.dataTransfer.getData('application/x-blueprint-tag');
    const movingId = e.dataTransfer.getData('application/x-blueprint-node-id');
    if (tag) {
      onAddNode(tag, node.id);
    } else if (movingId && movingId !== node.id) {
      onMoveNode(movingId, node.id, node.children.length);
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

  const children = node.children.map(child => (
    <RenderNode
      key={child.id}
      node={child}
      onSelectNode={onSelectNode}
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
