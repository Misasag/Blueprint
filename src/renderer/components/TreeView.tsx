import React, { useState, useRef, useCallback } from 'react';
import { UINode } from '../../parser';
import { LEAF_TAGS } from './canvas/utils';
import { canvasUIStore, DropPosition } from './canvas/dragStore';

interface TreeViewProps {
  nodes: UINode[];
  selectedNodeId: string | null;
  onSelectNode: (nodeId: string | null) => void;
  onMoveNode: (nodeId: string, targetParentId: string | null, targetIndex: number) => void;
  onAddNode: (tag: string, parentId: string | null, index?: number) => void;
}

export const TreeView: React.FC<TreeViewProps> = ({ nodes, selectedNodeId, onSelectNode, onMoveNode, onAddNode }) => {
  const [dropState, setDropState] = useState<{ targetId: string; position: DropPosition } | null>(null);

  return (
    <div style={{ fontSize: '12px' }}>
      {nodes.map((node, i) => (
        <TreeNode
          key={node.id} node={node} depth={0} siblingIndex={i}
          parentId={null} selectedNodeId={selectedNodeId}
          onSelectNode={onSelectNode} onMoveNode={onMoveNode} onAddNode={onAddNode}
          dropState={dropState} setDropState={setDropState}
        />
      ))}
    </div>
  );
};

const TreeNode: React.FC<{
  node: UINode;
  depth: number;
  siblingIndex: number;
  parentId: string | null;
  selectedNodeId: string | null;
  onSelectNode: (nodeId: string | null) => void;
  onMoveNode: (nodeId: string, targetParentId: string | null, targetIndex: number) => void;
  onAddNode: (tag: string, parentId: string | null, index?: number) => void;
  dropState: { targetId: string; position: DropPosition } | null;
  setDropState: (state: { targetId: string; position: DropPosition } | null) => void;
}> = ({ node, depth, siblingIndex, parentId, selectedNodeId, onSelectNode, onMoveNode, onAddNode, dropState, setDropState }) => {
  const [expanded, setExpanded] = useState(true);
  const enterCount = useRef(0);
  const hasChildren = node.children.length > 0;
  const isSelected = node.id === selectedNodeId;
  const isLeaf = LEAF_TAGS.has(node.tag);

  const isDropTarget = dropState?.targetId === node.id;
  const dropPosition = isDropTarget ? dropState!.position : null;

  const calcDropPosition = useCallback((e: React.DragEvent): DropPosition => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const y = e.clientY - rect.top;
    const ratio = y / rect.height;
    if (isLeaf) return ratio < 0.5 ? 'before' : 'after';
    if (ratio < 0.25) return 'before';
    if (ratio > 0.75) return 'after';
    return 'inside';
  }, [isLeaf]);

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
    setDropState(null);
    enterCount.current = 0;
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.stopPropagation();
    enterCount.current++;
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = e.dataTransfer.types.includes('application/x-blueprint-tag') ? 'copy' : 'move';
    const pos = calcDropPosition(e);
    if (!dropState || dropState.targetId !== node.id || dropState.position !== pos) {
      setDropState({ targetId: node.id, position: pos });
    }
    canvasUIStore.setDropTarget(node.id, pos);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.stopPropagation();
    enterCount.current--;
    if (enterCount.current <= 0) {
      enterCount.current = 0;
      setDropState(null);
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
        const sourceParent = e.dataTransfer.getData('application/x-blueprint-source-parent');
        const sourceIndex = parseInt(e.dataTransfer.getData('application/x-blueprint-source-index'), 10);
        const sourceParentId = sourceParent || null;
        if (sourceParentId === parentId && !isNaN(sourceIndex) && sourceIndex < insertIdx) {
          insertIdx--;
        }
        onMoveNode(movingId, parentId, insertIdx);
      }
    }
    setDropState(null);
    canvasUIStore.setDragging(null);
    canvasUIStore.setDropTarget(null);
  };

  // ドロップインジケータースタイル
  const indicatorStyle: React.CSSProperties = {};
  if (dropPosition === 'before') {
    indicatorStyle.boxShadow = 'inset 0 2px 0 0 var(--accent)';
  } else if (dropPosition === 'after') {
    indicatorStyle.boxShadow = 'inset 0 -2px 0 0 var(--accent)';
  } else if (dropPosition === 'inside') {
    indicatorStyle.background = 'var(--accent-light)';
  }

  const label = node.textContent?.slice(0, 20) || node.props.name || node.props.label || '';

  return (
    <div>
      <div
        draggable
        onClick={() => onSelectNode(node.id)}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        style={{
          padding: `2px 4px 2px ${depth * 16 + 4}px`,
          cursor: 'grab',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          borderRadius: '2px',
          background: isSelected ? 'var(--accent-light)' : 'transparent',
          ...indicatorStyle,
        }}
      >
        {hasChildren ? (
          <span
            onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
            style={{ fontSize: '10px', width: '10px', textAlign: 'center', color: 'var(--text-secondary)', cursor: 'pointer' }}
          >
            {expanded ? '▼' : '▶'}
          </span>
        ) : (
          <span style={{ width: '10px' }} />
        )}
        <span style={{ color: isSelected ? 'var(--accent)' : 'var(--text-primary)' }}>&lt;{node.tag}&gt;</span>
        {label && (
          <span style={{ color: 'var(--text-secondary)', fontSize: '10px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {label}
          </span>
        )}
      </div>
      {expanded && hasChildren && node.children.map((child, i) => (
        <TreeNode
          key={child.id} node={child} depth={depth + 1} siblingIndex={i}
          parentId={node.id} selectedNodeId={selectedNodeId}
          onSelectNode={onSelectNode} onMoveNode={onMoveNode} onAddNode={onAddNode}
          dropState={dropState} setDropState={setDropState}
        />
      ))}
    </div>
  );
};
