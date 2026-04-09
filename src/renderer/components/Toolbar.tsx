import React from 'react';

interface ToolbarProps {
  onOpen: () => void;
  onSave: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

export const Toolbar: React.FC<ToolbarProps> = ({ onOpen, onSave, onUndo, onRedo, canUndo, canRedo }) => {
  return (
    <div className="toolbar">
      <button className="tool-button" title="ファイルを開く (Ctrl+O)" onClick={onOpen}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M1.5 2.5h5l1.5 1.5h6.5v9h-13v-10.5z" stroke="currentColor" strokeWidth="1" fill="none"/>
        </svg>
      </button>
      <button className="tool-button" title="保存 (Ctrl+S)" onClick={onSave}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M2 1h9.5l2.5 2.5v10.5h-12v-13z" stroke="currentColor" strokeWidth="1" fill="none"/>
          <rect x="4" y="1" width="5" height="4" stroke="currentColor" strokeWidth="1" fill="none"/>
          <rect x="4" y="9" width="8" height="4" stroke="currentColor" strokeWidth="1" fill="none"/>
        </svg>
      </button>
      <div className="toolbar-divider" />
      <button
        className="tool-button"
        title="元に戻す (Ctrl+Z)"
        onClick={onUndo}
        disabled={!canUndo}
        style={{ opacity: canUndo ? 1 : 0.3 }}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M3 8h7a3 3 0 010 6h-2M3 8l3-3M3 8l3 3" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      <button
        className="tool-button"
        title="やり直す (Ctrl+Shift+Z)"
        onClick={onRedo}
        disabled={!canRedo}
        style={{ opacity: canRedo ? 1 : 0.3 }}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M13 8H6a3 3 0 000 6h2M13 8l-3-3M13 8l-3 3" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      <div className="toolbar-divider" />
      <button className="tool-button" title="選択ツール (V)" onClick={() => {}}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M3 2l3.5 12 1.5-4.5 4.5-1.5L3 2z" stroke="currentColor" strokeWidth="1" fill="none"/>
        </svg>
      </button>
    </div>
  );
};
