import React from 'react';
import { TagName, TAG_PROPS, TAG_CATEGORIES } from '../../parser';

interface ComponentTooltipProps {
  tag: TagName;
  description: string;
  rect: DOMRect;
}

export const ComponentTooltip: React.FC<ComponentTooltipProps> = ({ tag, description, rect }) => {
  const props = TAG_PROPS[tag] ?? [];
  const Preview = tagPreviews[tag] ?? getCategoryPreview(tag);

  // 画面下端からはみ出さないように調整
  const top = Math.min(rect.top, window.innerHeight - 260);

  return (
    <div style={{
      position: 'fixed',
      left: rect.right + 8,
      top,
      width: '200px',
      background: 'var(--bg-primary)',
      border: '1px solid var(--border-color)',
      borderRadius: '6px',
      padding: '12px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
      zIndex: 1000,
      pointerEvents: 'none',
    }}>
      <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '2px' }}>
        &lt;{tag}&gt;
      </div>
      <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
        {description}
      </div>
      <div style={{
        marginBottom: '8px', display: 'flex', justifyContent: 'center',
        background: 'var(--bg-secondary)', borderRadius: '4px', padding: '8px',
      }}>
        <Preview />
      </div>
      {props.length > 0 && (
        <div>
          <div style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '2px' }}>
            PROPS
          </div>
          <div style={{ fontSize: '10px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
            {props.join(', ')}
          </div>
        </div>
      )}
    </div>
  );
};

// --- SVG プレビュー定義 ---

const S = { w: 140, h: 72 }; // SVG viewBox サイズ
const C = { accent: '#0078d4', border: '#d4d4d4', bg: '#e8e8e8', text: '#6b6b6b', white: '#fff' };

function Svg({ children }: { children: React.ReactNode }) {
  return <svg width={S.w} height={S.h} viewBox={`0 0 ${S.w} ${S.h}`} fill="none">{children}</svg>;
}

// 個別プレビュー
const tagPreviews: Partial<Record<string, React.FC>> = {
  VStack: () => (
    <Svg>
      {[0, 1, 2].map(i => (
        <rect key={i} x="20" y={4 + i * 23} width="100" height="18" rx="3" fill={C.bg}>
          <animate attributeName="opacity" values="0;1" dur="0.3s" begin={`${i * 0.1}s`} fill="freeze" />
        </rect>
      ))}
    </Svg>
  ),
  HStack: () => (
    <Svg>
      {[0, 1, 2].map(i => (
        <rect key={i} x={8 + i * 44} y="16" width="38" height="40" rx="3" fill={C.bg}>
          <animate attributeName="opacity" values="0;1" dur="0.3s" begin={`${i * 0.1}s`} fill="freeze" />
        </rect>
      ))}
    </Svg>
  ),
  Grid: () => (
    <Svg>
      {[[0,0],[1,0],[0,1],[1,1]].map(([c,r], i) => (
        <rect key={i} x={14 + c * 58} y={6 + r * 34} width="52" height="28" rx="3" fill={C.bg}>
          <animate attributeName="opacity" values="0;1" dur="0.2s" begin={`${i * 0.08}s`} fill="freeze" />
        </rect>
      ))}
    </Svg>
  ),
  Button: () => (
    <Svg>
      <rect x="25" y="20" width="90" height="32" rx="6" fill={C.accent}>
        <animate attributeName="y" values="20;23;20" dur="0.6s" repeatCount="indefinite" />
      </rect>
      <text x="70" y="41" textAnchor="middle" fill={C.white} fontSize="12" fontWeight="500">
        Button
        <animate attributeName="y" values="41;44;41" dur="0.6s" repeatCount="indefinite" />
      </text>
    </Svg>
  ),
  Input: () => (
    <Svg>
      <rect x="10" y="20" width="120" height="32" rx="4" fill={C.white} stroke={C.border} strokeWidth="1" />
      <text x="18" y="40" fill={C.text} fontSize="11">テキスト入力...</text>
      <line x1="90" y1="28" x2="90" y2="44" stroke={C.accent} strokeWidth="1.5">
        <animate attributeName="opacity" values="1;0;1" dur="1s" repeatCount="indefinite" />
      </line>
    </Svg>
  ),
  Toggle: () => (
    <Svg>
      <rect x="42" y="24" width="40" height="22" rx="11" fill={C.bg}>
        <animate attributeName="fill" values={`${C.bg};${C.accent};${C.accent};${C.bg}`} dur="2s" repeatCount="indefinite" />
      </rect>
      <circle cx="54" cy="35" r="8" fill={C.white}>
        <animate attributeName="cx" values="54;70;70;54" dur="2s" repeatCount="indefinite" />
      </circle>
      <text x="88" y="39" fill={C.text} fontSize="10">ON</text>
    </Svg>
  ),
  Checkbox: () => (
    <Svg>
      <rect x="20" y="24" width="18" height="18" rx="3" fill={C.white} stroke={C.border} strokeWidth="1.5">
        <animate attributeName="fill" values={`${C.white};${C.accent};${C.accent};${C.white}`} dur="2s" repeatCount="indefinite" />
      </rect>
      <path d="M24 33 L27 36 L35 28" stroke={C.white} strokeWidth="2" fill="none" strokeLinecap="round">
        <animate attributeName="opacity" values="0;1;1;0" dur="2s" repeatCount="indefinite" />
      </path>
      <text x="44" y="37" fill={C.text} fontSize="11">Label</text>
    </Svg>
  ),
  Slider: () => (
    <Svg>
      <line x1="15" y1="36" x2="125" y2="36" stroke={C.bg} strokeWidth="4" strokeLinecap="round" />
      <line x1="15" y1="36" x2="70" y2="36" stroke={C.accent} strokeWidth="4" strokeLinecap="round">
        <animate attributeName="x2" values="40;100;40" dur="2s" repeatCount="indefinite" />
      </line>
      <circle cx="70" cy="36" r="7" fill={C.accent}>
        <animate attributeName="cx" values="40;100;40" dur="2s" repeatCount="indefinite" />
      </circle>
    </Svg>
  ),
  ProgressBar: () => (
    <Svg>
      <rect x="10" y="30" width="120" height="10" rx="5" fill={C.bg} />
      <rect x="10" y="30" width="20" height="10" rx="5" fill={C.accent}>
        <animate attributeName="width" values="20;110;20" dur="2s" repeatCount="indefinite" />
      </rect>
    </Svg>
  ),
  Spinner: () => (
    <Svg>
      <circle cx="70" cy="36" r="16" fill="none" stroke={C.bg} strokeWidth="3" />
      <path d="M70 20 A16 16 0 0 1 86 36" fill="none" stroke={C.accent} strokeWidth="3" strokeLinecap="round">
        <animateTransform attributeName="transform" type="rotate" from="0 70 36" to="360 70 36" dur="0.8s" repeatCount="indefinite" />
      </path>
    </Svg>
  ),
  Avatar: () => (
    <Svg>
      <circle cx="70" cy="30" r="18" fill={C.bg}>
        <animate attributeName="r" values="0;18" dur="0.3s" fill="freeze" />
      </circle>
      <text x="70" y="35" textAnchor="middle" fill={C.text} fontSize="14" fontWeight="600">U</text>
      <text x="70" y="62" textAnchor="middle" fill={C.text} fontSize="10">Avatar</text>
    </Svg>
  ),
  Card: () => (
    <Svg>
      <rect x="15" y="6" width="110" height="60" rx="6" fill={C.white} stroke={C.border} strokeWidth="1">
        <animate attributeName="opacity" values="0;1" dur="0.3s" fill="freeze" />
      </rect>
      <rect x="23" y="14" width="50" height="8" rx="2" fill={C.bg} />
      <rect x="23" y="28" width="90" height="6" rx="2" fill={C.bg} />
      <rect x="23" y="38" width="70" height="6" rx="2" fill={C.bg} />
      <rect x="23" y="50" width="40" height="10" rx="4" fill={C.accent} />
    </Svg>
  ),
  Table: () => (
    <Svg>
      <rect x="10" y="6" width="120" height="60" rx="3" fill={C.white} stroke={C.border} strokeWidth="1" />
      <rect x="10" y="6" width="120" height="16" rx="3" fill={C.bg} />
      {[0, 1, 2].map(i => (
        <line key={i} x1="10" y1={22 + i * 15} x2="130" y2={22 + i * 15} stroke={C.border} strokeWidth="0.5" />
      ))}
      {[0, 1].map(i => (
        <line key={i} x1={50 + i * 40} y1="6" x2={50 + i * 40} y2="66" stroke={C.border} strokeWidth="0.5" />
      ))}
    </Svg>
  ),
  Modal: () => (
    <Svg>
      <rect x="0" y="0" width={S.w} height={S.h} fill="rgba(0,0,0,0.15)" />
      <rect x="20" y="10" width="100" height="52" rx="6" fill={C.white} stroke={C.border} strokeWidth="1">
        <animate attributeName="opacity" values="0;1" dur="0.3s" fill="freeze" />
        <animate attributeName="y" values="20;10" dur="0.3s" fill="freeze" />
      </rect>
      <rect x="28" y="18" width="40" height="6" rx="2" fill={C.bg} />
      <line x1="20" y1="30" x2="120" y2="30" stroke={C.border} strokeWidth="0.5" />
      <rect x="80" y="44" width="32" height="12" rx="4" fill={C.accent} />
    </Svg>
  ),
  Chart: () => (
    <Svg>
      {[30, 50, 25, 55, 35, 45].map((h, i) => (
        <rect key={i} x={15 + i * 20} y={S.h - 8 - h} width="14" height={h} rx="2" fill={C.accent} opacity={0.6 + (i % 3) * 0.15}>
          <animate attributeName="height" values={`0;${h}`} dur="0.4s" begin={`${i * 0.06}s`} fill="freeze" />
          <animate attributeName="y" values={`${S.h - 8};${S.h - 8 - h}`} dur="0.4s" begin={`${i * 0.06}s`} fill="freeze" />
        </rect>
      ))}
      <line x1="10" y1={S.h - 8} x2="130" y2={S.h - 8} stroke={C.border} strokeWidth="1" />
    </Svg>
  ),
  Tabs: () => (
    <Svg>
      <line x1="0" y1="30" x2={S.w} y2="30" stroke={C.border} strokeWidth="1" />
      {['Tab 1', 'Tab 2', 'Tab 3'].map((label, i) => (
        <React.Fragment key={i}>
          <text x={24 + i * 46} y="24" textAnchor="middle" fill={i === 0 ? C.accent : C.text} fontSize="10">{label}</text>
          {i === 0 && <line x1="4" y1="29" x2="44" y2="29" stroke={C.accent} strokeWidth="2" />}
        </React.Fragment>
      ))}
      <rect x="10" y="38" width="120" height="28" rx="2" fill={C.bg} />
    </Svg>
  ),
  Toast: () => (
    <Svg>
      <rect x="20" y="20" width="100" height="32" rx="6" fill="#333">
        <animate attributeName="x" values="160;20" dur="0.4s" fill="freeze" />
        <animate attributeName="opacity" values="0;1" dur="0.3s" fill="freeze" />
      </rect>
      <text x="70" y="40" textAnchor="middle" fill={C.white} fontSize="10">
        Notification
        <animate attributeName="x" values="230;70" dur="0.4s" fill="freeze" />
      </text>
    </Svg>
  ),
};

// カテゴリ別のデフォルトプレビュー
const categoryPreviews: Record<string, React.FC> = {
  LAYOUT: () => (
    <Svg>
      <rect x="10" y="6" width="120" height="60" rx="4" fill="none" stroke={C.border} strokeWidth="1" strokeDasharray="4 2" />
      <rect x="18" y="14" width="104" height="16" rx="2" fill={C.bg} />
      <rect x="18" y="36" width="104" height="22" rx="2" fill={C.bg} />
    </Svg>
  ),
  CONTENT: () => (
    <Svg>
      <rect x="15" y="12" width="80" height="8" rx="2" fill={C.bg} />
      <rect x="15" y="26" width="110" height="6" rx="2" fill={C.bg} />
      <rect x="15" y="38" width="95" height="6" rx="2" fill={C.bg} />
      <rect x="15" y="50" width="60" height="6" rx="2" fill={C.bg} />
    </Svg>
  ),
  INPUT: () => (
    <Svg>
      <rect x="10" y="22" width="120" height="28" rx="4" fill={C.white} stroke={C.border} strokeWidth="1" />
      <text x="20" y="40" fill={C.text} fontSize="10">入力...</text>
    </Svg>
  ),
  NAVIGATION: () => (
    <Svg>
      <rect x="10" y="10" width="120" height="20" rx="2" fill={C.bg} />
      <rect x="16" y="15" width="30" height="10" rx="2" fill={C.accent} />
      <rect x="52" y="15" width="30" height="10" rx="2" fill="transparent" stroke={C.border} strokeWidth="0.5" />
      <rect x="88" y="15" width="30" height="10" rx="2" fill="transparent" stroke={C.border} strokeWidth="0.5" />
    </Svg>
  ),
  COMPOSITE: () => (
    <Svg>
      <rect x="15" y="6" width="110" height="60" rx="6" fill={C.white} stroke={C.border} strokeWidth="1" />
      <rect x="23" y="14" width="50" height="8" rx="2" fill={C.bg} />
      <rect x="23" y="28" width="90" height="6" rx="2" fill={C.bg} />
      <rect x="23" y="40" width="70" height="6" rx="2" fill={C.bg} />
    </Svg>
  ),
  FEEDBACK: () => (
    <Svg>
      <rect x="15" y="20" width="110" height="32" rx="4" fill={C.bg} stroke={C.border} strokeWidth="1">
        <animate attributeName="opacity" values="0;1" dur="0.3s" fill="freeze" />
      </rect>
      <text x="70" y="40" textAnchor="middle" fill={C.text} fontSize="10">Alert message</text>
    </Svg>
  ),
};

function getCategoryPreview(tag: string): React.FC {
  for (const [category, tags] of Object.entries(TAG_CATEGORIES)) {
    if ((tags as readonly string[]).includes(tag)) {
      return categoryPreviews[category] ?? categoryPreviews.CONTENT;
    }
  }
  return categoryPreviews.CONTENT;
}
