import React from 'react';
import { UINode, ParseError } from '../../parser';

interface StatusBarProps {
  selectedNode: UINode | null;
  parseErrors: ParseError[];
}

export const StatusBar: React.FC<StatusBarProps> = ({ selectedNode, parseErrors }) => {
  return (
    <div style={{
      height: 'var(--statusbar-height)',
      background: 'var(--bg-secondary)',
      borderTop: '1px solid var(--border-color)',
      display: 'flex',
      alignItems: 'center',
      padding: '0 12px',
      fontSize: '11px',
      color: 'var(--text-secondary)',
      gap: '16px',
    }}>
      {selectedNode ? (
        <span>&lt;{selectedNode.tag}&gt; を選択中</span>
      ) : (
        <span>要素を選択してください</span>
      )}
      {parseErrors.length > 0 && (
        <span
          style={{ color: '#d32f2f', marginLeft: 'auto' }}
          title={parseErrors.map(e => `${e.line}:${e.column} ${e.message}`).join('\n')}
        >
          {parseErrors.length} 件のパースエラー
        </span>
      )}
    </div>
  );
};
