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
    state, selectedNode, parentNode, canUndo, canRedo,
    selectNode, selectNodeAdd, updateNodeProps, updateNodeText,
    addNode, deleteNode, deleteSelected, moveNode,
    wrapNodes, unwrapNode, duplicateNodes, moveOut,
    copyNodes, cutNodes, paste,
    undo, redo, loadSource, markSaved,
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
        case 'menu:delete': if (state.selectedNodeIds.length > 0) deleteSelected(); break;
      }
    });
  }, [handleOpen, handleSave, undo, redo, deleteSelected, state.source, state.selectedNodeIds, markSaved]);

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

      // input/textarea にフォーカスがある場合はエディタショートカット無効
      const target = e.target as HTMLElement;
      const tagName = target.tagName.toLowerCase();
      const isEditing = tagName === 'input' || tagName === 'textarea' || target.isContentEditable;

      // Ctrl+D: 複製
      if (isMod && key === 'd' && !isEditing) {
        e.preventDefault();
        if (state.selectedNodeIds.length > 0) {
          duplicateNodes(state.selectedNodeIds);
        }
        return;
      }
      // Ctrl+C: コピー
      if (isMod && key === 'c' && !isEditing) {
        e.preventDefault();
        if (state.selectedNodeIds.length > 0) {
          copyNodes(state.selectedNodeIds);
        }
        return;
      }
      // Ctrl+X: カット
      if (isMod && key === 'x' && !isEditing) {
        e.preventDefault();
        if (state.selectedNodeIds.length > 0) {
          cutNodes(state.selectedNodeIds);
        }
        return;
      }
      // Ctrl+V: ペースト
      if (isMod && key === 'v' && !isEditing) {
        e.preventDefault();
        paste();
        return;
      }

      // Delete / Backspace で削除
      if (key === 'delete' || key === 'backspace') {
        if (isEditing) return;
        e.preventDefault();
        if (state.selectedNodeIds.length > 0) {
          deleteSelected();
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleOpen, handleSave, undo, redo, deleteSelected, duplicateNodes, copyNodes, cutNodes, paste, state.selectedNodeIds, state.source, markSaved]);

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
          selectedNodeIds={state.selectedNodeIds}
          onSelectNode={selectNode}
          onSelectNodeAdd={selectNodeAdd}
          onAddNode={addNode}
          onMoveNode={moveNode}
          onUpdateProp={updateNodeProps}
          onDeleteNode={deleteNode}
          onDeleteSelected={deleteSelected}
          onWrapNodes={wrapNodes}
          onUnwrapNode={unwrapNode}
          onDuplicateNodes={duplicateNodes}
          onMoveOut={moveOut}
          onCopyNodes={copyNodes}
          onCutNodes={cutNodes}
          onPaste={paste}
        />
        <PropertyPanel
          selectedNode={selectedNode}
          parentNode={parentNode}
          onUpdateProp={updateNodeProps}
          onUpdateText={updateNodeText}
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
