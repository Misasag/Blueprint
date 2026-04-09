import React, { useState, useCallback } from 'react';
import { TAG_CATEGORIES, TAG_DESCRIPTIONS, TagName } from '../../parser';

export const ComponentPanel: React.FC = () => {
  const [search, setSearch] = useState('');
  const [hoveredTag, setHoveredTag] = useState<string | null>(null);
  const handleHover = useCallback((tag: string | null) => setHoveredTag(tag), []);

  return (
    <div style={{
      width: 'var(--panel-width)',
      borderRight: '1px solid var(--border-color)',
      background: 'var(--bg-primary)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>
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
                  isHovered={hoveredTag === tag}
                  onHover={handleHover}
                />
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const ComponentItem = React.memo<{
  tag: TagName;
  description: string;
  isHovered: boolean;
  onHover: (tag: string | null) => void;
}>(function ComponentItem({ tag, description, isHovered, onHover }) {
  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('application/x-blueprint-tag', tag);
        e.dataTransfer.effectAllowed = 'copy';
      }}
      onMouseEnter={() => onHover(tag)}
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
      {isHovered && (
        <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>
          {description}
        </span>
      )}
    </div>
  );
});
