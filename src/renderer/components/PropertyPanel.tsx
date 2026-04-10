import React from 'react';
import { UINode, TAG_PROPS, TEXT_TAGS, getStyleSectionsForTag } from '../../parser';
import { PropInput } from './PropInput';

/** PARENT LAYOUT 対象のレイアウトコンテナ */
const LAYOUT_CONTAINERS = new Set(['VStack', 'HStack', 'Grid', 'Box', 'SplitScreen', 'HeroSection', 'BentoGrid']);

/** PARENT LAYOUT で表示する属性 */
const PARENT_LAYOUT_PROPS: Record<string, string[]> = {
  VStack: ['gap', 'align', 'justify'],
  HStack: ['gap', 'align', 'justify'],
  Grid: ['cols', 'gap', 'rows'],
  Box: ['align', 'justify'],
  SplitScreen: ['ratio'],
  HeroSection: ['align'],
  BentoGrid: ['cols', 'gap', 'rows'],
};

interface PropertyPanelProps {
  selectedNode: UINode | null;
  parentNode: UINode | null;
  onUpdateProp: (nodeId: string, propName: string, value: string) => void;
  onUpdateText: (nodeId: string, text: string) => void;
}

export const PropertyPanel: React.FC<PropertyPanelProps> = ({
  selectedNode, parentNode, onUpdateProp, onUpdateText,
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
            parentNode={parentNode}
            onUpdateProp={onUpdateProp}
            onUpdateText={onUpdateText}
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
  parentNode: UINode | null;
  onUpdateProp: (nodeId: string, propName: string, value: string) => void;
  onUpdateText: (nodeId: string, text: string) => void;
}>(function PropertiesView({ node, parentNode, onUpdateProp, onUpdateText }) {
  const tagSpecificProps = TAG_PROPS[node.tag] ?? [];
  const styleSections = getStyleSectionsForTag(node.tag);
  const hasTextContent = node.textContent !== undefined || TEXT_TAGS.includes(node.tag as any);

  // SELF セクションを分離（親がレイアウトコンテナの場合のみ表示）
  const showSelf = parentNode && LAYOUT_CONTAINERS.has(parentNode.tag);
  const selfSection = styleSections.find(s => s.name === 'SELF');
  const nonSelfSections = styleSections.filter(s => s.name !== 'SELF');

  // PARENT LAYOUT セクション（親がレイアウトコンテナの場合のみ表示）
  const parentLayoutProps = parentNode ? PARENT_LAYOUT_PROPS[parentNode.tag] : undefined;

  const shownStyleProps = new Set(styleSections.flatMap(s => s.props as unknown as string[]));
  const otherProps = Object.keys(node.props).filter(
    p => !tagSpecificProps.includes(p) && !shownStyleProps.has(p)
  );

  return (
    <div>
      <div style={{
        fontSize: '12px', fontWeight: 600, color: 'var(--accent)',
        marginBottom: '12px', padding: '4px 8px',
        background: 'var(--accent-light)', borderRadius: '3px',
      }}>
        &lt;{node.tag}&gt;
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

      {showSelf && selfSection && (
        <PropSection title="SELF">
          {(selfSection.props as unknown as string[]).map(prop => (
            <PropInput
              key={prop} label={prop}
              value={node.props[prop] ?? ''}
              onChange={v => onUpdateProp(node.id, prop, v)}
            />
          ))}
        </PropSection>
      )}

      {parentNode && parentLayoutProps && (
        <PropSection title="PARENT LAYOUT">
          <div style={{ fontSize: '10px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
            &lt;{parentNode.tag}&gt;
          </div>
          {parentLayoutProps.map(prop => (
            <PropInput
              key={prop} label={prop}
              value={parentNode.props[prop] ?? ''}
              onChange={v => onUpdateProp(parentNode.id, prop, v)}
            />
          ))}
        </PropSection>
      )}

      {nonSelfSections.map(({ name, props }) => (
        <PropSection key={name} title={name}>
          {(props as unknown as string[]).map(prop => (
            <PropInput
              key={prop} label={prop}
              value={node.props[prop] ?? ''}
              onChange={v => onUpdateProp(node.id, prop, v)}
              isColor={prop === 'color' || prop === 'background'}
            />
          ))}
        </PropSection>
      ))}

      {otherProps.length > 0 && (
        <PropSection title="OTHER">
          {otherProps.map(prop => (
            <div key={prop} style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
              <div style={{ flex: 1 }}>
                <PropInput
                  label={prop}
                  value={node.props[prop] ?? ''}
                  onChange={v => onUpdateProp(node.id, prop, v)}
                />
              </div>
              <button
                onClick={() => onUpdateProp(node.id, prop, '')}
                title="プロパティを削除"
                style={{
                  background: 'transparent', border: 'none', cursor: 'pointer',
                  color: 'var(--text-secondary)', fontSize: '10px', padding: '2px',
                  flexShrink: 0,
                }}
              >
                ✕
              </button>
            </div>
          ))}
        </PropSection>
      )}
    </div>
  );
});
