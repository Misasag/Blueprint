import React, { useState } from 'react';
import { UINode } from '../../parser';

interface TreeViewProps {
  nodes: UINode[];
  selectedNodeId: string | null;
  onSelectNode: (nodeId: string | null) => void;
}

export const TreeView: React.FC<TreeViewProps> = ({ nodes, selectedNodeId, onSelectNode }) => {
  return (
    <div style={{ fontSize: '12px' }}>
      {nodes.map(node => (
        <TreeNode key={node.id} node={node} depth={0} selectedNodeId={selectedNodeId} onSelectNode={onSelectNode} />
      ))}
    </div>
  );
};

const TreeNode: React.FC<{
  node: UINode;
  depth: number;
  selectedNodeId: string | null;
  onSelectNode: (nodeId: string | null) => void;
}> = ({ node, depth, selectedNodeId, onSelectNode }) => {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = node.children.length > 0;
  const isSelected = node.id === selectedNodeId;

  return (
    <div>
      <div
        onClick={() => onSelectNode(node.id)}
        style={{
          padding: `2px 4px 2px ${depth * 16 + 4}px`,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          borderRadius: '2px',
          background: isSelected ? 'var(--accent-light)' : 'transparent',
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
        {node.props.name && (
          <span style={{ color: 'var(--text-secondary)', fontSize: '10px' }}>
            {node.props.name}
          </span>
        )}
      </div>
      {expanded && hasChildren && node.children.map(child => (
        <TreeNode key={child.id} node={child} depth={depth + 1} selectedNodeId={selectedNodeId} onSelectNode={onSelectNode} />
      ))}
    </div>
  );
};
