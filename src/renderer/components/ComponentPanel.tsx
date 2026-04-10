import React, { useState, useCallback } from 'react';
import { UINode, TAG_CATEGORIES, TAG_DESCRIPTIONS, TagName } from '../../parser';
import { TreeView } from './TreeView';
import { ComponentTooltip } from './ComponentTooltip';

type TabType = 'components' | 'tree';

interface ComponentPanelProps {
  nodes: UINode[];
  selectedNodeId: string | null;
  onSelectNode: (nodeId: string | null) => void;
}

export const ComponentPanel: React.FC<ComponentPanelProps> = ({ nodes, selectedNodeId, onSelectNode }) => {
  const [activeTab, setActiveTab] = useState<TabType>('components');
  const [search, setSearch] = useState('');
  const [hoverInfo, setHoverInfo] = useState<{ tag: TagName; rect: DOMRect } | null>(null);
  const handleHover = useCallback((tag: TagName | null, rect?: DOMRect) => {
    setHoverInfo(tag && rect ? { tag, rect } : null);
  }, []);

  return (
    <div style={{
      width: 'var(--panel-width)',
      borderRight: '1px solid var(--border-color)',
      background: 'var(--bg-primary)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)' }}>
        <TabButton active={activeTab === 'components'} onClick={() => setActiveTab('components')}>
          Components
        </TabButton>
        <TabButton active={activeTab === 'tree'} onClick={() => setActiveTab('tree')}>
          Tree
        </TabButton>
      </div>

      {activeTab === 'components' ? (
        <>
          <div style={{ padding: '8px' }}>
            <input
              type="text"
              placeholder="コンポーネントを検索..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '4px 8px',
                border: '1px solid var(--border-color)',
                borderRadius: '4px',
                outline: 'none',
                fontSize: '12px',
                background: 'var(--bg-secondary)',
              }}
            />
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '0 8px 8px' }}>
            {Object.entries(TAG_CATEGORIES).map(([category, tags]) => {
              const filtered = tags.filter(tag =>
                search === '' ||
                tag.toLowerCase().includes(search.toLowerCase()) ||
                (TAG_DESCRIPTIONS[tag] ?? '').includes(search)
              );
              if (filtered.length === 0) return null;

              return (
                <div key={category} style={{ marginBottom: '12px' }}>
                  <div style={{
                    fontSize: '10px',
                    fontWeight: 600,
                    color: 'var(--text-secondary)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    marginBottom: '4px',
                  }}>
                    {category}
                  </div>
                  {filtered.map(tag => (
                    <ComponentItem
                      key={tag}
                      tag={tag}
                      description={TAG_DESCRIPTIONS[tag] ?? ''}
                      isHovered={hoverInfo?.tag === tag}
                      onHover={handleHover}
                    />
                  ))}
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
          <TreeView nodes={nodes} selectedNodeId={selectedNodeId} onSelectNode={onSelectNode} />
        </div>
      )}

      {hoverInfo && (
        <ComponentTooltip
          tag={hoverInfo.tag}
          description={TAG_DESCRIPTIONS[hoverInfo.tag] ?? ''}
          rect={hoverInfo.rect}
        />
      )}
    </div>
  );
};

const TabButton: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode }> = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    style={{
      flex: 1, padding: '6px 0', border: 'none',
      borderBottom: active ? '2px solid var(--accent)' : '2px solid transparent',
      background: 'transparent',
      color: active ? 'var(--accent)' : 'var(--text-secondary)',
      fontSize: '12px', fontWeight: 500, cursor: 'pointer',
      fontFamily: 'inherit',
    }}
  >
    {children}
  </button>
);

const ComponentItem = React.memo<{
  tag: TagName;
  description: string;
  isHovered: boolean;
  onHover: (tag: TagName | null, rect?: DOMRect) => void;
}>(function ComponentItem({ tag, description, isHovered, onHover }) {
  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('application/x-blueprint-tag', tag);
        e.dataTransfer.effectAllowed = 'copy';
      }}
      onMouseEnter={(e) => onHover(tag, e.currentTarget.getBoundingClientRect())}
      onMouseLeave={() => onHover(null)}
      style={{
        padding: '3px 8px',
        borderRadius: '3px',
        cursor: 'grab',
        fontSize: '12px',
        background: isHovered ? 'var(--bg-tertiary)' : 'transparent',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
      title={`<${tag}> — ${description}`}
    >
      <span>{tag}</span>
    </div>
  );
});
