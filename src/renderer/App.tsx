import React, { useEffect, Component } from 'react';
import { TitleBar } from './components/TitleBar';
import { Toolbar } from './components/Toolbar';
import { ComponentPanel } from './components/ComponentPanel';
import { Canvas } from './components/Canvas';
import { PropertyPanel } from './components/PropertyPanel';
import { StatusBar } from './components/StatusBar';
import { useEditorStore } from './store/editorStore';
import { useFileAPI } from './hooks/useFileAPI';
import './styles/global.css';

class ErrorBoundary extends Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  state = { hasError: false, error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '24px', fontFamily: 'monospace' }}>
          <h2 style={{ color: '#d32f2f' }}>エラーが発生しました</h2>
          <pre style={{ marginTop: '12px', color: '#666', whiteSpace: 'pre-wrap' }}>
            {this.state.error?.message}
          </pre>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            style={{ marginTop: '12px', padding: '8px 16px', cursor: 'pointer' }}
          >
            リトライ
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const EditorApp: React.FC = () => {
  const {
    state, selectedNode, canUndo, canRedo,
    selectNode, updateNodeProps, updateNodeText,
    addNode, deleteNode, moveNode, undo, redo,
    loadSource, markSaved,
  } = useEditorStore();

  const { handleOpen, handleSave } = useFileAPI({
    filePath: state.filePath,
    source: state.source,
    loadSource,
    markSaved,
  });

  // メニューバーからのアクション受信
  useEffect(() => {
    if (!window.electronAPI?.onMenuAction) return;
    return window.electronAPI.onMenuAction((action) => {
      switch (action) {
        case 'menu:open': handleOpen(); break;
        case 'menu:save': handleSave(); break;
        case 'menu:saveAs':
          if (window.electronAPI) {
            window.electronAPI.saveFileAs(state.source).then(result => {
              if (result?.success && result.filePath) markSaved(result.filePath);
            });
          }
          break;
        case 'menu:undo': undo(); break;
        case 'menu:redo': redo(); break;
        case 'menu:delete': if (state.selectedNodeId) deleteNode(state.selectedNodeId); break;
      }
    });
  }, [handleOpen, handleSave, undo, redo, deleteNode, state.source, state.selectedNodeId, markSaved]);

  // キーボードショートカット
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const isMod = e.ctrlKey || e.metaKey;
      const key = e.key.toLowerCase();

      if (isMod && key === 's' && e.shiftKey) {
        e.preventDefault();
        if (window.electronAPI) {
          window.electronAPI.saveFileAs(state.source).then(result => {
            if (result?.success && result.filePath) markSaved(result.filePath);
          });
        }
        return;
      }
      if (isMod && key === 's' && !e.shiftKey) {
        e.preventDefault();
        handleSave();
        return;
      }
      if (isMod && key === 'o') {
        e.preventDefault();
        handleOpen();
        return;
      }
      // Redo: Ctrl+Shift+Z または Ctrl+Y
      if (isMod && ((key === 'z' && e.shiftKey) || key === 'y')) {
        e.preventDefault();
        redo();
        return;
      }
      // Undo: Ctrl+Z (shift なし)
      if (isMod && key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
        return;
      }

      // Delete / Backspace で削除（input にフォーカスがない場合のみ）
      if (key === 'delete' || key === 'backspace') {
        const target = e.target as HTMLElement;
        const tag = target.tagName.toLowerCase();
        if (tag === 'input' || tag === 'textarea' || target.isContentEditable) return;
        // Backspace のブラウザナビゲーション抑制
        e.preventDefault();
        if (state.selectedNodeId) {
          deleteNode(state.selectedNodeId);
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleOpen, handleSave, undo, redo, deleteNode, state.selectedNodeId]);

  return (
    <>
      <TitleBar fileName={state.fileName} isDirty={state.isDirty} />
      <Toolbar
        onOpen={handleOpen}
        onSave={handleSave}
        onUndo={undo}
        onRedo={redo}
        canUndo={canUndo}
        canRedo={canRedo}
      />
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        <ComponentPanel
          nodes={state.nodes}
          selectedNodeId={state.selectedNodeId}
          onSelectNode={selectNode}
        />
        <Canvas
          nodes={state.nodes}
          selectedNodeId={state.selectedNodeId}
          onSelectNode={selectNode}
          onAddNode={addNode}
          onMoveNode={moveNode}
          onUpdateProp={updateNodeProps}
          onDeleteNode={deleteNode}
        />
        <PropertyPanel
          selectedNode={selectedNode}
          onUpdateProp={updateNodeProps}
          onUpdateText={updateNodeText}
          onDeleteNode={deleteNode}
        />
      </div>
      <StatusBar selectedNode={selectedNode} parseErrors={state.parseErrors} />
    </>
  );
};

export const App: React.FC = () => (
  <ErrorBoundary>
    <EditorApp />
  </ErrorBoundary>
);
