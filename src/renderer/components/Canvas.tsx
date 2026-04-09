import React, { useEffect, useRef, useState, useCallback } from 'react';
import { UINode } from '../../parser';
import { canvasUIStore } from './canvas/dragStore';
import { RenderNode } from './RenderNode';
import { StyleEditDialog } from './StyleEditDialog';
import { findNodeById } from '../store/treeUtils';

const ZOOM_MIN = 0.25;
const ZOOM_MAX = 2;
const ZOOM_STEP = 0.1;

interface ContextMenuState {
  nodeId: string;
  x: number;
  y: number;
}

interface CanvasProps {
  nodes: UINode[];
  selectedNodeId: string | null;
  onSelectNode: (nodeId: string | null) => void;
  onAddNode: (tag: string, parentId: string | null, index?: number) => void;
  onMoveNode: (nodeId: string, targetParentId: string | null, targetIndex: number) => void;
  onUpdateProp: (nodeId: string, propName: string, value: string) => void;
  onDeleteNode: (nodeId: string) => void;
}

export const Canvas: React.FC<CanvasProps> = ({ nodes, selectedNodeId, onSelectNode, onAddNode, onMoveNode, onUpdateProp, onDeleteNode }) => {
  const [zoom, setZoom] = useState(1);
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);
  const [styleDialog, setStyleDialog] = useState<{ nodeId: string; x: number; y: number } | null>(null);

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    const nodeEl = (e.target as HTMLElement).closest('[data-node-id]');
    if (!nodeEl) return;
    e.preventDefault();
    const nodeId = nodeEl.getAttribute('data-node-id')!;
    onSelectNode(nodeId);
    setContextMenu({ nodeId, x: e.clientX, y: e.clientY });
  }, [onSelectNode]);

  const closeContextMenu = useCallback(() => setContextMenu(null), []);

  const zoomIn = useCallback(() => setZoom(z => Math.min(ZOOM_MAX, Math.round((z + ZOOM_STEP) * 100) / 100)), []);
  const zoomOut = useCallback(() => setZoom(z => Math.max(ZOOM_MIN, Math.round((z - ZOOM_STEP) * 100) / 100)), []);
  const zoomReset = useCallback(() => setZoom(1), []);

  // Ctrl+ホイールでズーム
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handler = (e: WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      setZoom(z => {
        const next = z + (e.deltaY < 0 ? ZOOM_STEP : -ZOOM_STEP);
        return Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, Math.round(next * 100) / 100));
      });
    };
    el.addEventListener('wheel', handler, { passive: false });
    return () => el.removeEventListener('wheel', handler);
  }, []);

  // 親 store の選択状態を canvasUIStore に同期
  useEffect(() => {
    canvasUIStore.setSelected(selectedNodeId);
  }, [selectedNodeId]);

  const handleRootDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const tag = e.dataTransfer.getData('application/x-blueprint-tag');
    const movingId = e.dataTransfer.getData('application/x-blueprint-node-id');
    if (tag) {
      onAddNode(tag, null);
    } else if (movingId) {
      onMoveNode(movingId, null, nodes.length);
    }
    canvasUIStore.setDragging(null);
    canvasUIStore.setDropTarget(null);
  };

  return (
    <div
      ref={containerRef}
      style={{
        flex: 1,
        background: 'var(--bg-tertiary)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* ズームコントロール */}
      <div style={{
        position: 'absolute', bottom: '12px', right: '12px', zIndex: 10,
        display: 'flex', alignItems: 'center', gap: '2px',
        background: 'var(--bg-primary)', border: '1px solid var(--border-color)',
        borderRadius: '6px', padding: '2px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
      }}>
        <button onClick={zoomOut} style={zoomBtnStyle} title="ズームアウト">−</button>
        <button onClick={zoomReset} style={{ ...zoomBtnStyle, width: '48px', fontSize: '11px' }} title="リセット">
          {Math.round(zoom * 100)}%
        </button>
        <button onClick={zoomIn} style={zoomBtnStyle} title="ズームイン">+</button>
      </div>

      {/* コンテキストメニュー */}
      {contextMenu && (
        <>
          <div onClick={closeContextMenu} style={{ position: 'fixed', inset: 0, zIndex: 998 }} />
          <div style={{
            position: 'fixed', left: contextMenu.x, top: contextMenu.y, zIndex: 999,
            background: 'var(--bg-primary)', border: '1px solid var(--border-color)',
            borderRadius: '6px', boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
            padding: '4px', minWidth: '160px',
          }}>
            <button onClick={() => {
              setStyleDialog({ nodeId: contextMenu.nodeId, x: contextMenu.x, y: contextMenu.y });
              setContextMenu(null);
            }} style={menuItemStyle}>
              スタイルを編集
            </button>
            <div style={{ height: '1px', background: 'var(--border-color)', margin: '4px 0' }} />
            <button onClick={() => {
              onDeleteNode(contextMenu.nodeId);
              setContextMenu(null);
            }} style={{ ...menuItemStyle, color: '#d32f2f' }}>
              削除
            </button>
          </div>
        </>
      )}

      {/* スタイル編集ダイアログ */}
      {styleDialog && findNodeById(nodes, styleDialog.nodeId) && (
        <StyleEditDialog
          nodeTag={findNodeById(nodes, styleDialog.nodeId)!.tag}
          position={{ x: styleDialog.x, y: styleDialog.y }}
          onAdd={(propName, value) => onUpdateProp(styleDialog.nodeId, propName, value)}
          onClose={() => setStyleDialog(null)}
        />
      )}

      {/* キャンバス本体 */}
      <div
        style={{
          flex: 1,
          overflow: 'auto',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'center',
          padding: '24px',
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget) onSelectNode(null);
        }}
        onContextMenu={handleContextMenu}
        onDragOver={(e) => {
          e.preventDefault();
          e.dataTransfer.dropEffect = e.dataTransfer.types.includes('application/x-blueprint-tag') ? 'copy' : 'move';
        }}
        onDrop={handleRootDrop}
      >
        <div
          style={{
            background: 'var(--bg-primary)',
            borderRadius: '4px',
            border: '1px solid var(--border-color)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            minWidth: '360px',
            minHeight: '480px',
            width: '800px',
            overflow: 'visible',
            transform: `scale(${zoom})`,
            transformOrigin: 'top center',
          }}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.stopPropagation();
            handleRootDrop(e);
          }}
        >
          {nodes.map(node => (
            <RenderNode
              key={node.id}
              node={node}
              onSelectNode={onSelectNode}
              onAddNode={onAddNode}
              onMoveNode={onMoveNode}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

const zoomBtnStyle: React.CSSProperties = {
  width: '28px', height: '28px', border: 'none', borderRadius: '4px',
  background: 'transparent', cursor: 'pointer', fontSize: '14px',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  color: 'var(--text-primary)',
};

const menuItemStyle: React.CSSProperties = {
  display: 'block', width: '100%', padding: '6px 12px',
  border: 'none', background: 'transparent', textAlign: 'left',
  fontSize: '12px', cursor: 'pointer', borderRadius: '4px',
  fontFamily: 'inherit', color: 'var(--text-primary)',
};

