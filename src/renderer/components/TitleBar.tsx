import React from 'react';

interface TitleBarProps {
  fileName: string;
  isDirty: boolean;
}

export const TitleBar: React.FC<TitleBarProps> = ({ fileName, isDirty }) => {
  return (
    <div style={{
      height: 'var(--titlebar-height)',
      background: 'var(--bg-secondary)',
      borderBottom: '1px solid var(--border-color)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '12px',
      color: 'var(--text-secondary)',
      userSelect: 'none',
    }}>
      <span>{fileName}{isDirty ? ' •' : ''}</span>
      <span style={{ marginLeft: '8px', opacity: 0.5 }}>— Blueprint</span>
    </div>
  );
};
