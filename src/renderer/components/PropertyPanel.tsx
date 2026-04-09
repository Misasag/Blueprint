import React from 'react';
import { UINode, COMMON_PROPS, TAG_PROPS, TEXT_TAGS } from '../../parser';
import { PropInput } from './PropInput';

interface PropertyPanelProps {
  selectedNode: UINode | null;
  onUpdateProp: (nodeId: string, propName: string, value: string) => void;
  onUpdateText: (nodeId: string, text: string) => void;
  onDeleteNode: (nodeId: string) => void;
}

export const PropertyPanel: React.FC<PropertyPanelProps> = ({
  selectedNode, onUpdateProp, onUpdateText, onDeleteNode,
}) => {
  return (
    <div style={{
      width: 'var(--panel-width)',
      borderLeft: '1px solid var(--border-color)',
      background: 'var(--bg-primary)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>
      <div style={{
        padding: '6px 0', borderBottom: '1px solid var(--border-color)',
        fontSize: '12px', fontWeight: 500, textAlign: 'center',
        color: 'var(--text-secondary)',
      }}>
        Properties
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
        {selectedNode ? (
          <PropertiesView
            node={selectedNode}
            onUpdateProp={onUpdateProp}
            onUpdateText={onUpdateText}
            onDelete={() => onDeleteNode(selectedNode.id)}
          />
        ) : (
          <div style={{ color: 'var(--text-secondary)', fontSize: '12px', padding: '16px', textAlign: 'center' }}>
            要素を選択してプロパティを編集
          </div>
        )}
      </div>
    </div>
  );
};

const PropSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div style={{ marginBottom: '12px' }}>
    <div style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '0.5px', marginBottom: '4px' }}>
      {title}
    </div>
    {children}
  </div>
);

const PropertiesView = React.memo<{
  node: UINode;
  onUpdateProp: (nodeId: string, propName: string, value: string) => void;
  onUpdateText: (nodeId: string, text: string) => void;
  onDelete: () => void;
}>(function PropertiesView({ node, onUpdateProp, onUpdateText, onDelete }) {
  const tagSpecificProps = TAG_PROPS[node.tag] ?? [];
  const hasTextContent = node.textContent !== undefined || TEXT_TAGS.includes(node.tag as any);

  const otherProps = Object.keys(node.props).filter(
    p => !tagSpecificProps.includes(p) && !(COMMON_PROPS as readonly string[]).includes(p)
  );

  return (
    <div>
      <div style={{
        fontSize: '12px', fontWeight: 600, color: 'var(--accent)',
        marginBottom: '12px', padding: '4px 8px',
        background: 'var(--accent-light)', borderRadius: '3px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <span>&lt;{node.tag}&gt;</span>
        <button
          onClick={onDelete}
          title="削除 (Delete)"
          style={{
            background: 'transparent', border: 'none', cursor: 'pointer',
            color: 'var(--accent)', fontSize: '12px', padding: '0 4px',
          }}
        >
          ✕
        </button>
      </div>

      {hasTextContent && (
        <PropSection title="CONTENT">
          <PropInput label="text" value={node.textContent ?? ''} onChange={v => onUpdateText(node.id, v)} />
        </PropSection>
      )}

      {tagSpecificProps.length > 0 && (
        <PropSection title={node.tag.toUpperCase()}>
          {tagSpecificProps.map(prop => (
            <PropInput
              key={prop} label={prop}
              value={node.props[prop] ?? ''}
              onChange={v => onUpdateProp(node.id, prop, v)}
              isColor={prop === 'color'}
            />
          ))}
        </PropSection>
      )}

      <PropSection title="STYLE">
        {[...COMMON_PROPS].map(prop => (
          <PropInput
            key={prop} label={prop}
            value={node.props[prop] ?? ''}
            onChange={v => onUpdateProp(node.id, prop, v)}
            isColor={prop === 'color' || prop === 'background'}
          />
        ))}
      </PropSection>

      {otherProps.length > 0 && (
        <PropSection title="OTHER">
          {otherProps.map(prop => (
            <PropInput
              key={prop} label={prop}
              value={node.props[prop] ?? ''}
              onChange={v => onUpdateProp(node.id, prop, v)}
            />
          ))}
        </PropSection>
      )}
    </div>
  );
});
