import React from 'react';
import { UINode, TAG_PROPS, TEXT_TAGS, getStyleSectionsForTag } from '../../parser';
import { LEAF_TAGS } from './canvas/utils';
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

/** 追加ボタンの定義: 親タグ → { ラベル, 追加するタグ } */
const ADD_CHILD_CONFIG: Record<string, { label: string; tag: string }> = {
  Table: { label: '+ 行を追加', tag: '_TableRow' },
  Accordion: { label: '+ セクションを追加', tag: '_AccordionItem' },
  FAQSection: { label: '+ 質問を追加', tag: '_AccordionItem' },
  Tabs: { label: '+ タブを追加', tag: '_TabItem' },
  List: { label: '+ 項目を追加', tag: 'Text' },
  Timeline: { label: '+ イベントを追加', tag: 'Text' },
  Tree: { label: '+ ノードを追加', tag: 'TreeNode' },
  Kanban: { label: '+ 列を追加', tag: 'Box' },
  Carousel: { label: '+ スライドを追加', tag: 'Box' },
  PricingTable: { label: '+ プランを追加', tag: '_PricingCard' },
  NotificationPanel: { label: '+ 通知を追加', tag: 'Text' },
  Navbar: { label: '+ リンクを追加', tag: 'Link' },
  Sidebar: { label: '+ リンクを追加', tag: 'Link' },
  Breadcrumb: { label: '+ パスを追加', tag: 'Link' },
  Stepper: { label: '+ ステップを追加', tag: 'Text' },
  Card: { label: '+ セクションを追加', tag: 'CardBody' },
  Modal: { label: '+ セクションを追加', tag: 'ModalBody' },
  // スロットタグ
  TableHeader: { label: '+ セルを追加', tag: 'TableCell' },
  TableRow: { label: '+ セルを追加', tag: 'TableCell' },
  TreeNode: { label: '+ 子ノードを追加', tag: 'TreeNode' },
};

interface PropertyPanelProps {
  selectedNode: UINode | null;
  parentNode: UINode | null;
  onUpdateProp: (nodeId: string, propName: string, value: string) => void;
  onUpdateText: (nodeId: string, text: string) => void;
  onSelectNode: (nodeId: string | null) => void;
  onAddNode: (tag: string, parentId: string | null, index?: number, meta?: Record<string, number>) => void;
  onDeleteNode: (nodeId: string) => void;
}

export const PropertyPanel: React.FC<PropertyPanelProps> = ({
  selectedNode, parentNode, onUpdateProp, onUpdateText, onSelectNode, onAddNode, onDeleteNode,
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
            onSelectNode={onSelectNode}
            onAddNode={onAddNode}
            onDeleteNode={onDeleteNode}
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
  onSelectNode: (nodeId: string | null) => void;
  onAddNode: (tag: string, parentId: string | null, index?: number, meta?: Record<string, number>) => void;
  onDeleteNode: (nodeId: string) => void;
}>(function PropertiesView({ node, parentNode, onUpdateProp, onUpdateText, onSelectNode, onAddNode, onDeleteNode }) {
  const tagSpecificProps = TAG_PROPS[node.tag] ?? [];
  const styleSections = getStyleSectionsForTag(node.tag);
  const hasTextContent = node.textContent !== undefined || TEXT_TAGS.includes(node.tag as any);
  const isContainer = !LEAF_TAGS.has(node.tag);

  // SELF セクションを分離
  const showSelf = parentNode && LAYOUT_CONTAINERS.has(parentNode.tag);
  const selfSection = styleSections.find(s => s.name === 'SELF');
  const nonSelfSections = styleSections.filter(s => s.name !== 'SELF');

  // PARENT LAYOUT セクション
  const parentLayoutProps = parentNode ? PARENT_LAYOUT_PROPS[parentNode.tag] : undefined;

  const shownStyleProps = new Set(styleSections.flatMap(s => s.props as unknown as string[]));
  const otherProps = Object.keys(node.props).filter(
    p => !tagSpecificProps.includes(p) && !shownStyleProps.has(p)
  );

  // CHILDREN セクション
  const addChildConfig = ADD_CHILD_CONFIG[node.tag];

  const handleAddChild = () => {
    if (!addChildConfig) return;
    const tag = addChildConfig.tag;
    // 特殊ケース: 複合子要素を生成する必要があるもの
    if (tag === '_TableRow') {
      const headerCells = node.children.find(c => c.tag === 'TableHeader')?.children.length;
      const firstRowCells = node.children.find(c => c.tag === 'TableRow')?.children.length;
      const colCount = headerCells ?? firstRowCells ?? 3;
      onAddNode('TableRow', node.id, undefined, { colCount });
      return;
    }
    if (tag === '_AccordionItem') {
      onAddNode('AccordionItem', node.id);
      return;
    }
    if (tag === '_TabItem') {
      onAddNode('TabItem', node.id);
      return;
    }
    if (tag === '_PricingCard') {
      onAddNode('Card', node.id);
      return;
    }
    onAddNode(tag, node.id);
  };

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

      {/* CHILDREN セクション */}
      {isContainer && (
        <PropSection title="CHILDREN">
          {node.children.length > 0 ? (
            node.children.map(child => (
              <div key={child.id} style={{
                display: 'flex', alignItems: 'center', gap: '4px',
                padding: '2px 4px', borderRadius: '3px', marginBottom: '1px',
                cursor: 'pointer', fontSize: '11px',
              }}
                onClick={() => onSelectNode(child.id)}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-tertiary)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <span style={{ color: 'var(--text-secondary)', flexShrink: 0 }}>&lt;</span>
                <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {child.tag}
                  {child.textContent && <span style={{ color: 'var(--text-secondary)', marginLeft: '4px' }}>{child.textContent.slice(0, 20)}</span>}
                </span>
                <button
                  onClick={e => { e.stopPropagation(); onDeleteNode(child.id); }}
                  title="削除"
                  style={{
                    background: 'transparent', border: 'none', cursor: 'pointer',
                    color: 'var(--text-secondary)', fontSize: '9px', padding: '2px',
                    flexShrink: 0,
                  }}
                >✕</button>
              </div>
            ))
          ) : (
            <div style={{ fontSize: '10px', color: 'var(--text-secondary)', padding: '4px' }}>
              {addChildConfig ? '子要素なし' : '子要素なし（D&D で追加）'}
            </div>
          )}
          {addChildConfig && (
            <button
              onClick={handleAddChild}
              style={{
                display: 'block', width: '100%', marginTop: '4px',
                padding: '4px 8px', border: '1px dashed var(--border-color)',
                borderRadius: '3px', background: 'transparent',
                fontSize: '11px', color: 'var(--accent)', cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              {addChildConfig.label}
            </button>
          )}
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
