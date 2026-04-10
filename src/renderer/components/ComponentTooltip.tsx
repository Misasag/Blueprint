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

const S = { w: 140, h: 72 };
const C = { accent: '#0078d4', border: '#d4d4d4', bg: '#e8e8e8', text: '#6b6b6b', white: '#fff' };

function Svg({ children }: { children: React.ReactNode }) {
  return <svg width={S.w} height={S.h} viewBox={`0 0 ${S.w} ${S.h}`} fill="none">{children}</svg>;
}

const tagPreviews: Partial<Record<string, React.FC>> = {
  // --- レイアウト系 ---
  Screen: () => (
    <Svg>
      <rect x="10" y="6" width="120" height="60" rx="3" fill={C.white} stroke={C.border} strokeWidth="1" />
      <rect x="10" y="6" width="120" height="14" rx="3" fill={C.bg} />
      <rect x="18" y="26" width="104" height="12" rx="2" fill={C.bg} />
      <rect x="18" y="44" width="104" height="16" rx="2" fill={C.bg} />
    </Svg>
  ),
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
  Box: () => (
    <Svg>
      <rect x="15" y="10" width="110" height="52" rx="4" fill="none" stroke={C.border} strokeWidth="1" strokeDasharray="4 2" />
      <rect x="35" y="22" width="70" height="28" rx="3" fill={C.bg} />
    </Svg>
  ),
  ScrollView: () => (
    <Svg>
      <rect x="10" y="6" width="110" height="60" rx="3" fill={C.white} stroke={C.border} strokeWidth="1" />
      <rect x="18" y="12" width="90" height="10" rx="2" fill={C.bg}>
        <animate attributeName="y" values="12;30;12" dur="2s" repeatCount="indefinite" />
      </rect>
      <rect x="18" y="26" width="90" height="10" rx="2" fill={C.bg}>
        <animate attributeName="y" values="26;44;26" dur="2s" repeatCount="indefinite" />
      </rect>
      <rect x="122" y="10" width="4" height="20" rx="2" fill={C.border}>
        <animate attributeName="y" values="10;40;10" dur="2s" repeatCount="indefinite" />
      </rect>
    </Svg>
  ),
  SplitScreen: () => (
    <Svg>
      <rect x="10" y="6" width="50" height="60" rx="3" fill={C.bg}>
        <animate attributeName="width" values="50;70;50" dur="2s" repeatCount="indefinite" />
      </rect>
      <rect x="64" y="6" width="66" height="60" rx="3" fill={C.bg}>
        <animate attributeName="x" values="64;84;64" dur="2s" repeatCount="indefinite" />
        <animate attributeName="width" values="66;46;66" dur="2s" repeatCount="indefinite" />
      </rect>
    </Svg>
  ),
  HeroSection: () => (
    <Svg>
      <rect x="5" y="4" width="130" height="64" rx="4" fill={C.bg} />
      <rect x="30" y="18" width="80" height="10" rx="2" fill={C.border}>
        <animate attributeName="opacity" values="0;1" dur="0.4s" fill="freeze" />
      </rect>
      <rect x="40" y="34" width="60" height="6" rx="2" fill={C.border}>
        <animate attributeName="opacity" values="0;1" dur="0.4s" begin="0.2s" fill="freeze" />
      </rect>
    </Svg>
  ),
  BentoGrid: () => (
    <Svg>
      <rect x="8" y="6" width="56" height="34" rx="3" fill={C.bg}><animate attributeName="opacity" values="0;1" dur="0.2s" fill="freeze" /></rect>
      <rect x="68" y="6" width="64" height="16" rx="3" fill={C.bg}><animate attributeName="opacity" values="0;1" dur="0.2s" begin="0.1s" fill="freeze" /></rect>
      <rect x="68" y="26" width="64" height="14" rx="3" fill={C.bg}><animate attributeName="opacity" values="0;1" dur="0.2s" begin="0.15s" fill="freeze" /></rect>
      <rect x="8" y="44" width="40" height="22" rx="3" fill={C.bg}><animate attributeName="opacity" values="0;1" dur="0.2s" begin="0.2s" fill="freeze" /></rect>
      <rect x="52" y="44" width="80" height="22" rx="3" fill={C.bg}><animate attributeName="opacity" values="0;1" dur="0.2s" begin="0.25s" fill="freeze" /></rect>
    </Svg>
  ),

  // --- 図形系 ---
  Rectangle: () => (
    <Svg>
      <rect x="20" y="16" width="100" height="40" rx="6" fill={C.accent} opacity="0.3">
        <animate attributeName="rx" values="0;12;0" dur="2s" repeatCount="indefinite" />
      </rect>
    </Svg>
  ),
  Ellipse: () => (
    <Svg>
      <ellipse cx="70" cy="36" rx="40" ry="28" fill={C.accent} opacity="0.3">
        <animate attributeName="ry" values="28;20;28" dur="2s" repeatCount="indefinite" />
        <animate attributeName="rx" values="40;28;40" dur="2s" repeatCount="indefinite" />
      </ellipse>
    </Svg>
  ),
  Line: () => (
    <Svg>
      <line x1="15" y1="36" x2="125" y2="36" stroke={C.border} strokeWidth="2">
        <animate attributeName="x2" values="15;125" dur="0.5s" fill="freeze" />
      </line>
    </Svg>
  ),
  Arrow: () => (
    <Svg>
      <line x1="15" y1="36" x2="110" y2="36" stroke={C.text} strokeWidth="2">
        <animate attributeName="x2" values="15;110" dur="0.5s" fill="freeze" />
      </line>
      <polygon points="110,30 125,36 110,42" fill={C.text}>
        <animate attributeName="opacity" values="0;1" dur="0.3s" begin="0.3s" fill="freeze" />
      </polygon>
    </Svg>
  ),
  Polygon: () => (
    <Svg>
      <polygon points="70,8 130,56 10,56" fill={C.accent} opacity="0.3">
        <animateTransform attributeName="transform" type="rotate" from="0 70 40" to="360 70 40" dur="4s" repeatCount="indefinite" />
      </polygon>
    </Svg>
  ),

  // --- コンテンツ系 ---
  Text: () => (
    <Svg>
      <rect x="15" y="14" width="80" height="8" rx="2" fill={C.bg} />
      <rect x="15" y="28" width="110" height="6" rx="2" fill={C.bg} />
      <rect x="15" y="40" width="95" height="6" rx="2" fill={C.bg} />
      <rect x="15" y="52" width="60" height="6" rx="2" fill={C.bg} />
    </Svg>
  ),
  Image: () => (
    <Svg>
      <rect x="20" y="8" width="100" height="56" rx="4" fill={C.bg} />
      <circle cx="45" cy="28" r="8" fill={C.border} />
      <polygon points="35,55 60,35 85,50 100,40 115,55" fill={C.border} />
    </Svg>
  ),
  Icon: () => (
    <Svg>
      <polygon points="70,12 82,32 104,32 86,46 94,66 70,54 46,66 54,46 36,32 58,32" fill={C.accent} opacity="0.5">
        <animate attributeName="opacity" values="0.3;0.7;0.3" dur="1.5s" repeatCount="indefinite" />
      </polygon>
    </Svg>
  ),
  Divider: () => (
    <Svg>
      <line x1="10" y1="36" x2="130" y2="36" stroke={C.border} strokeWidth="1">
        <animate attributeName="x2" values="10;130" dur="0.5s" fill="freeze" />
      </line>
    </Svg>
  ),
  Badge: () => (
    <Svg>
      <rect x="45" y="22" width="50" height="28" rx="14" fill={C.accent}>
        <animate attributeName="opacity" values="0;1" dur="0.3s" fill="freeze" />
      </rect>
      <text x="70" y="41" textAnchor="middle" fill={C.white} fontSize="13" fontWeight="600">3</text>
    </Svg>
  ),
  Tag: () => (
    <Svg>
      <rect x="25" y="22" width="70" height="28" rx="14" fill={C.bg} />
      <text x="52" y="40" textAnchor="middle" fill={C.text} fontSize="11">Tag</text>
      <text x="85" y="40" fill={C.text} fontSize="10" opacity="0.5">✕</text>
      <rect x="25" y="22" width="70" height="28" rx="14" fill="none" stroke={C.border} strokeWidth="1">
        <animate attributeName="opacity" values="1;0" dur="0.5s" begin="1.5s" fill="freeze" />
      </rect>
    </Svg>
  ),
  Skeleton: () => (
    <Svg>
      <rect x="15" y="14" width="110" height="12" rx="3" fill={C.bg}>
        <animate attributeName="opacity" values="0.3;0.7;0.3" dur="1.5s" repeatCount="indefinite" />
      </rect>
      <rect x="15" y="32" width="80" height="12" rx="3" fill={C.bg}>
        <animate attributeName="opacity" values="0.3;0.7;0.3" dur="1.5s" begin="0.2s" repeatCount="indefinite" />
      </rect>
      <rect x="15" y="50" width="50" height="12" rx="3" fill={C.bg}>
        <animate attributeName="opacity" values="0.3;0.7;0.3" dur="1.5s" begin="0.4s" repeatCount="indefinite" />
      </rect>
    </Svg>
  ),
  StatCard: () => (
    <Svg>
      <rect x="15" y="6" width="110" height="60" rx="6" fill={C.white} stroke={C.border} strokeWidth="1" />
      <text x="25" y="26" fill={C.text} fontSize="10">Revenue</text>
      <text x="25" y="48" fill={C.accent} fontSize="20" fontWeight="700">$1.2k</text>
      <text x="95" y="48" fill="#2e7d32" fontSize="10">↑12%</text>
    </Svg>
  ),

  // --- 入力系 ---
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
  Textarea: () => (
    <Svg>
      <rect x="10" y="8" width="120" height="56" rx="4" fill={C.white} stroke={C.border} strokeWidth="1" />
      <rect x="18" y="16" width="80" height="5" rx="1" fill={C.bg} />
      <rect x="18" y="26" width="100" height="5" rx="1" fill={C.bg} />
      <rect x="18" y="36" width="60" height="5" rx="1" fill={C.bg} />
    </Svg>
  ),
  Select: () => (
    <Svg>
      <rect x="10" y="20" width="120" height="32" rx="4" fill={C.white} stroke={C.border} strokeWidth="1" />
      <text x="18" y="40" fill={C.text} fontSize="11">選択...</text>
      <text x="118" y="40" fill={C.text} fontSize="10">▼</text>
      <rect x="10" y="52" width="120" height="16" rx="2" fill={C.white} stroke={C.border} strokeWidth="1" opacity="0">
        <animate attributeName="opacity" values="0;1;1;0" dur="2s" repeatCount="indefinite" />
      </rect>
    </Svg>
  ),
  Radio: () => (
    <Svg>
      {[0, 1, 2].map(i => (
        <React.Fragment key={i}>
          <circle cx="25" cy={16 + i * 20} r="7" fill={C.white} stroke={C.border} strokeWidth="1.5" />
          <text x="38" y={20 + i * 20} fill={C.text} fontSize="11">Option {i + 1}</text>
        </React.Fragment>
      ))}
      <circle cx="25" cy="16" r="4" fill={C.accent}>
        <animate attributeName="cy" values="16;36;56;16" dur="3s" repeatCount="indefinite" />
      </circle>
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
  DatePicker: () => (
    <Svg>
      <rect x="10" y="16" width="120" height="40" rx="4" fill={C.white} stroke={C.border} strokeWidth="1" />
      <text x="18" y="40" fill={C.text} fontSize="11">2025-01-15</text>
      <rect x="108" y="24" width="16" height="16" rx="2" fill={C.bg} />
      <text x="116" y="36" textAnchor="middle" fill={C.text} fontSize="9">📅</text>
    </Svg>
  ),
  FileUpload: () => (
    <Svg>
      <rect x="15" y="10" width="110" height="52" rx="6" fill="none" stroke={C.border} strokeWidth="1.5" strokeDasharray="5 3" />
      <text x="70" y="32" textAnchor="middle" fill={C.text} fontSize="16">↑</text>
      <text x="70" y="48" textAnchor="middle" fill={C.text} fontSize="10">ファイルをドロップ</text>
    </Svg>
  ),
  SearchBar: () => (
    <Svg>
      <rect x="10" y="20" width="120" height="32" rx="16" fill={C.white} stroke={C.border} strokeWidth="1" />
      <text x="22" y="40" fill={C.text} fontSize="12">🔍</text>
      <text x="38" y="40" fill={C.text} fontSize="11">検索...</text>
      <line x1="80" y1="28" x2="80" y2="44" stroke={C.accent} strokeWidth="1.5">
        <animate attributeName="opacity" values="1;0;1" dur="1s" repeatCount="indefinite" />
      </line>
    </Svg>
  ),
  Autocomplete: () => (
    <Svg>
      <rect x="10" y="10" width="120" height="28" rx="14" fill={C.white} stroke={C.border} strokeWidth="1" />
      <text x="18" y="28" fill={C.text} fontSize="10">検索...</text>
      <text x="118" y="28" fill={C.text} fontSize="9">▼</text>
      <rect x="10" y="40" width="120" height="26" rx="3" fill={C.white} stroke={C.border} strokeWidth="1">
        <animate attributeName="opacity" values="0;1" dur="0.3s" begin="0.3s" fill="freeze" />
      </rect>
      <text x="18" y="56" fill={C.text} fontSize="9">候補 1</text>
    </Svg>
  ),
  TagInput: () => (
    <Svg>
      <rect x="10" y="18" width="120" height="36" rx="4" fill={C.white} stroke={C.border} strokeWidth="1" />
      {['React', 'Vue'].map((t, i) => (
        <React.Fragment key={i}>
          <rect x={16 + i * 48} y="26" width="40" height="20" rx="10" fill={C.bg}>
            <animate attributeName="opacity" values="0;1" dur="0.3s" begin={`${i * 0.15}s`} fill="freeze" />
          </rect>
          <text x={28 + i * 48} y="40" fill={C.text} fontSize="9">{t}</text>
        </React.Fragment>
      ))}
    </Svg>
  ),
  OTPInput: () => (
    <Svg>
      {[0, 1, 2, 3].map(i => (
        <React.Fragment key={i}>
          <rect x={18 + i * 28} y="18" width="24" height="36" rx="4" fill={C.white} stroke={C.border} strokeWidth="1" />
          <circle cx={30 + i * 28} cy="36" r="3" fill={C.accent} opacity="0">
            <animate attributeName="opacity" values="0;1" dur="0.2s" begin={`${i * 0.3}s`} fill="freeze" />
          </circle>
        </React.Fragment>
      ))}
    </Svg>
  ),
  ColorPicker: () => (
    <Svg>
      <rect x="20" y="16" width="36" height="36" rx="6" stroke={C.border} strokeWidth="1">
        <animate attributeName="fill" values="#3B82F6;#EF4444;#22C55E;#EAB308;#3B82F6" dur="3s" repeatCount="indefinite" />
      </rect>
      <text x="66" y="30" fill={C.text} fontSize="10">Color</text>
      <text x="66" y="44" fill={C.text} fontSize="9">#3B82F6</text>
    </Svg>
  ),
  Link: () => (
    <Svg>
      <text x="35" y="38" fill={C.accent} fontSize="13" textDecoration="underline">Link text</text>
      <line x1="35" y1="42" x2="105" y2="42" stroke={C.accent} strokeWidth="1">
        <animate attributeName="opacity" values="1;0.5;1" dur="1.5s" repeatCount="indefinite" />
      </line>
    </Svg>
  ),

  // --- ナビゲーション系 ---
  Navbar: () => (
    <Svg>
      <rect x="5" y="16" width="130" height="28" rx="3" fill={C.bg} />
      <rect x="10" y="22" width="14" height="14" rx="2" fill={C.accent} />
      <rect x="30" y="26" width="30" height="8" rx="2" fill={C.border} />
      {[0, 1, 2].map(i => (
        <rect key={i} x={76 + i * 20} y="26" width="14" height="8" rx="2" fill={C.border} />
      ))}
    </Svg>
  ),
  Sidebar: () => (
    <Svg>
      <rect x="10" y="6" width="40" height="60" rx="3" fill={C.bg} />
      {[0, 1, 2, 3].map(i => (
        <rect key={i} x="16" y={14 + i * 14} width="28" height="8" rx="2" fill={i === 0 ? C.accent : C.border} />
      ))}
    </Svg>
  ),
  Breadcrumb: () => (
    <Svg>
      <text x="10" y="40" fill={C.text} fontSize="11">Home</text>
      <text x="45" y="40" fill={C.text} fontSize="11">/</text>
      <text x="55" y="40" fill={C.text} fontSize="11">Page</text>
      <text x="85" y="40" fill={C.text} fontSize="11">/</text>
      <text x="95" y="40" fill={C.accent} fontSize="11">Current</text>
    </Svg>
  ),
  Pagination: () => (
    <Svg>
      <text x="15" y="40" fill={C.text} fontSize="12">←</text>
      {[1, 2, 3].map(i => (
        <rect key={i} x={28 + (i - 1) * 26} y="26" width="22" height="22" rx="3"
          fill={i === 1 ? C.accent : 'none'} stroke={i === 1 ? C.accent : C.border} strokeWidth="1">
          {i === 1 && <animate attributeName="x" values="28;54;80;28" dur="3s" repeatCount="indefinite" />}
        </rect>
      ))}
      <text x="35" y="42" textAnchor="middle" fill={C.white} fontSize="11">1</text>
      <text x="61" y="42" textAnchor="middle" fill={C.text} fontSize="11">2</text>
      <text x="87" y="42" textAnchor="middle" fill={C.text} fontSize="11">3</text>
      <text x="112" y="40" fill={C.text} fontSize="12">→</text>
    </Svg>
  ),
  Stepper: () => (
    <Svg>
      {[0, 1, 2].map(i => (
        <React.Fragment key={i}>
          <circle cx={25 + i * 45} cy="36" r="10" fill={C.bg} stroke={C.border} strokeWidth="1">
            <animate attributeName="fill" values={i === 0 ? `${C.accent};${C.accent}` : `${C.bg};${C.accent};${C.accent};${C.bg}`} dur="3s" repeatCount="indefinite" />
          </circle>
          <text x={25 + i * 45} y="40" textAnchor="middle" fill={C.white} fontSize="10">{i + 1}</text>
          {i < 2 && <line x1={35 + i * 45} y1="36" x2={60 + i * 45} y2="36" stroke={C.border} strokeWidth="1" />}
        </React.Fragment>
      ))}
    </Svg>
  ),
  AppBar: () => (
    <Svg>
      <rect x="5" y="16" width="130" height="28" rx="3" fill={C.bg} />
      <text x="14" y="34" fill={C.text} fontSize="14">←</text>
      <text x="70" y="34" textAnchor="middle" fill={C.text} fontSize="12" fontWeight="600">Title</text>
    </Svg>
  ),

  // --- 複合系 ---
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
  Accordion: () => (
    <Svg>
      <rect x="10" y="6" width="120" height="60" rx="3" fill={C.white} stroke={C.border} strokeWidth="1" />
      <rect x="10" y="6" width="120" height="18" rx="3" fill={C.bg} />
      <text x="20" y="18" fill={C.text} fontSize="9">Section 1 ▼</text>
      <rect x="14" y="26" width="112" height="14" rx="2" fill={C.bg} opacity="0.4">
        <animate attributeName="height" values="0;14" dur="0.3s" fill="freeze" />
      </rect>
      <line x1="10" y1="42" x2="130" y2="42" stroke={C.border} strokeWidth="0.5" />
      <text x="20" y="54" fill={C.text} fontSize="9">Section 2 ▶</text>
    </Svg>
  ),
  Carousel: () => (
    <Svg>
      <rect x="15" y="6" width="110" height="60" rx="6" fill={C.bg} stroke={C.border} strokeWidth="1" />
      <rect x="20" y="46" width="6" height="6" rx="3" fill={C.accent} />
      <rect x="30" y="46" width="6" height="6" rx="3" fill={C.border} />
      <rect x="40" y="46" width="6" height="6" rx="3" fill={C.border} />
      <circle cx="22" cy="30" r="10" fill={C.white} stroke={C.border} strokeWidth="1" />
      <text x="22" y="34" textAnchor="middle" fill={C.text} fontSize="10">←</text>
      <circle cx="118" cy="30" r="10" fill={C.white} stroke={C.border} strokeWidth="1" />
      <text x="118" y="34" textAnchor="middle" fill={C.text} fontSize="10">→</text>
      <text x="70" y="34" textAnchor="middle" fill={C.text} fontSize="11">Slide 1</text>
    </Svg>
  ),
  Kanban: () => (
    <Svg>
      {['Todo', 'Doing', 'Done'].map((col, i) => (
        <React.Fragment key={i}>
          <rect x={6 + i * 44} y="6" width="40" height="60" rx="3" fill={C.bg} />
          <text x={26 + i * 44} y="18" textAnchor="middle" fill={C.text} fontSize="7">{col}</text>
          <rect x={10 + i * 44} y="22" width="32" height="14" rx="2" fill={C.white} stroke={C.border} strokeWidth="0.5">
            {i === 0 && <animate attributeName="x" values="10;54;10" dur="3s" repeatCount="indefinite" />}
          </rect>
        </React.Fragment>
      ))}
    </Svg>
  ),
  Timeline: () => (
    <Svg>
      <line x1="25" y1="12" x2="25" y2="60" stroke={C.border} strokeWidth="2" />
      {[0, 1, 2].map(i => (
        <React.Fragment key={i}>
          <circle cx="25" cy={16 + i * 20} r="5" fill={i === 0 ? C.accent : C.bg} stroke={C.border} strokeWidth="1">
            <animate attributeName="opacity" values="0;1" dur="0.3s" begin={`${i * 0.15}s`} fill="freeze" />
          </circle>
          <rect x="38" y={12 + i * 20} width="60" height="8" rx="2" fill={C.bg}>
            <animate attributeName="opacity" values="0;1" dur="0.3s" begin={`${i * 0.15}s`} fill="freeze" />
          </rect>
        </React.Fragment>
      ))}
    </Svg>
  ),
  List: () => (
    <Svg>
      {[0, 1, 2].map(i => (
        <React.Fragment key={i}>
          <rect x="15" y={8 + i * 22} width="110" height="16" rx="2" fill={C.bg} />
          {i < 2 && <line x1="15" y1={24 + i * 22} x2="125" y2={24 + i * 22} stroke={C.border} strokeWidth="0.5" />}
        </React.Fragment>
      ))}
    </Svg>
  ),
  Tree: () => (
    <Svg>
      <text x="10" y="18" fill={C.text} fontSize="10">▼ Root</text>
      <text x="26" y="34" fill={C.text} fontSize="10">▸ Child 1</text>
      <text x="26" y="50" fill={C.text} fontSize="10">▸ Child 2</text>
      <line x1="18" y1="22" x2="18" y2="46" stroke={C.border} strokeWidth="1" />
    </Svg>
  ),
  PricingTable: () => (
    <Svg>
      {['Free', 'Pro', 'Biz'].map((p, i) => (
        <React.Fragment key={i}>
          <rect x={6 + i * 44} y="6" width="40" height="60" rx="4" fill={C.white} stroke={i === 1 ? C.accent : C.border} strokeWidth={i === 1 ? 2 : 1} />
          <text x={26 + i * 44} y="22" textAnchor="middle" fill={C.text} fontSize="8" fontWeight="600">{p}</text>
          <text x={26 + i * 44} y="40" textAnchor="middle" fill={C.text} fontSize="14" fontWeight="700">${i * 19}</text>
        </React.Fragment>
      ))}
    </Svg>
  ),
  FAQSection: () => (
    <Svg>
      <rect x="10" y="6" width="120" height="60" rx="3" fill={C.white} stroke={C.border} strokeWidth="1" />
      {[0, 1, 2].map(i => (
        <React.Fragment key={i}>
          <text x="18" y={22 + i * 20} fill={C.text} fontSize="9">Q: Question {i + 1}?</text>
          {i < 2 && <line x1="10" y1={26 + i * 20} x2="130" y2={26 + i * 20} stroke={C.border} strokeWidth="0.5" />}
        </React.Fragment>
      ))}
    </Svg>
  ),
  NotificationPanel: () => (
    <Svg>
      <rect x="10" y="6" width="120" height="60" rx="4" fill={C.white} stroke={C.border} strokeWidth="1" />
      <rect x="10" y="6" width="120" height="16" rx="4" fill={C.bg} />
      <text x="20" y="18" fill={C.text} fontSize="9" fontWeight="600">通知</text>
      {[0, 1].map(i => (
        <React.Fragment key={i}>
          <circle cx="20" cy={32 + i * 16} r="3" fill={i === 0 ? C.accent : C.bg} />
          <rect x="28" y={28 + i * 16} width="90" height="6" rx="2" fill={C.bg} />
        </React.Fragment>
      ))}
    </Svg>
  ),

  // --- フィードバック系 ---
  Toast: () => (
    <Svg>
      <rect x="20" y="20" width="100" height="32" rx="6" fill="#333">
        <animate attributeName="x" values="160;20" dur="0.4s" fill="freeze" />
      </rect>
      <text x="70" y="40" textAnchor="middle" fill={C.white} fontSize="10">
        Notification
      </text>
    </Svg>
  ),
  Alert: () => (
    <Svg>
      <rect x="10" y="18" width="120" height="36" rx="4" fill="#fef2f2" stroke="#fca5a5" strokeWidth="1">
        <animate attributeName="fill" values="#fef2f2;#ecfdf5;#fffbeb;#fef2f2" dur="3s" repeatCount="indefinite" />
      </rect>
      <rect x="10" y="18" width="4" height="36" rx="2" fill="#fca5a5">
        <animate attributeName="fill" values="#fca5a5;#6ee7b7;#fcd34d;#fca5a5" dur="3s" repeatCount="indefinite" />
      </rect>
      <text x="22" y="40" fill={C.text} fontSize="10">Alert message</text>
    </Svg>
  ),
  Tooltip: () => (
    <Svg>
      <rect x="45" y="38" width="50" height="20" rx="3" fill={C.bg} />
      <rect x="35" y="10" width="70" height="24" rx="4" fill="#333">
        <animate attributeName="opacity" values="0;1" dur="0.3s" fill="freeze" />
      </rect>
      <text x="70" y="26" textAnchor="middle" fill={C.white} fontSize="9">Tooltip</text>
      <polygon points="65,34 75,34 70,38" fill="#333">
        <animate attributeName="opacity" values="0;1" dur="0.3s" fill="freeze" />
      </polygon>
    </Svg>
  ),
  Popover: () => (
    <Svg>
      <rect x="45" y="42" width="50" height="16" rx="3" fill={C.bg} />
      <rect x="20" y="4" width="100" height="36" rx="6" fill={C.white} stroke={C.border} strokeWidth="1">
        <animate attributeName="opacity" values="0;1" dur="0.3s" fill="freeze" />
      </rect>
      <rect x="28" y="12" width="60" height="6" rx="2" fill={C.bg} />
      <rect x="28" y="24" width="84" height="6" rx="2" fill={C.bg} />
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
  ConfirmDialog: () => (
    <Svg>
      <rect x="0" y="0" width={S.w} height={S.h} fill="rgba(0,0,0,0.1)" />
      <rect x="20" y="10" width="100" height="52" rx="6" fill={C.white} stroke={C.border} strokeWidth="1">
        <animate attributeName="opacity" values="0;1" dur="0.3s" fill="freeze" />
      </rect>
      <rect x="28" y="18" width="40" height="6" rx="2" fill={C.bg} />
      <rect x="28" y="30" width="84" height="6" rx="2" fill={C.bg} />
      <rect x="56" y="44" width="28" height="12" rx="3" fill="none" stroke={C.border} strokeWidth="1" />
      <rect x="88" y="44" width="24" height="12" rx="3" fill={C.accent} />
    </Svg>
  ),
  EmptyState: () => (
    <Svg>
      <text x="70" y="24" textAnchor="middle" fill={C.bg} fontSize="24">📭</text>
      <text x="70" y="44" textAnchor="middle" fill={C.text} fontSize="10" fontWeight="600">No data</text>
      <rect x="50" y="50" width="40" height="12" rx="4" fill={C.accent} />
      <text x="70" y="59" textAnchor="middle" fill={C.white} fontSize="8">Action</text>
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
  Avatar: () => (
    <Svg>
      <circle cx="70" cy="30" r="18" fill={C.bg}>
        <animate attributeName="r" values="0;18" dur="0.3s" fill="freeze" />
      </circle>
      <text x="70" y="35" textAnchor="middle" fill={C.text} fontSize="14" fontWeight="600">U</text>
      <text x="70" y="62" textAnchor="middle" fill={C.text} fontSize="10">Avatar</text>
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
};

// カテゴリ別のデフォルトプレビュー（個別プレビューがないタグ用 — スロットタグ等）
const categoryPreviews: Record<string, React.FC> = {
  LAYOUT: () => (
    <Svg>
      <rect x="10" y="6" width="120" height="60" rx="4" fill="none" stroke={C.border} strokeWidth="1" strokeDasharray="4 2" />
      <rect x="18" y="14" width="104" height="16" rx="2" fill={C.bg} />
      <rect x="18" y="36" width="104" height="22" rx="2" fill={C.bg} />
    </Svg>
  ),
  SHAPE: () => (
    <Svg>
      <rect x="15" y="12" width="40" height="40" rx="4" fill={C.bg} />
      <circle cx="95" cy="36" r="20" fill={C.bg} />
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
