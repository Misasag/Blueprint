/** .ui AST のノード型 */
export interface UINode {
  id: string;
  tag: string;
  props: Record<string, string>;
  children: UINode[];
  /** テキストコンテンツ（<Text>ログイン</Text> の "ログイン" 部分） */
  textContent?: string;
}

/** パーサーの結果 */
export interface ParseResult {
  nodes: UINode[];
  errors: ParseError[];
}

export interface ParseError {
  message: string;
  line: number;
  column: number;
}

/** すべての有効なタグ名 */
export const VALID_TAGS = [
  // レイアウト系
  'Screen', 'VStack', 'HStack', 'Grid', 'Box', 'ScrollView', 'SplitScreen', 'HeroSection', 'BentoGrid',
  // コンテンツ系
  'Text', 'Image', 'Icon', 'Divider', 'Avatar', 'Badge', 'Tag', 'ProgressBar', 'Skeleton', 'StatCard', 'Chart',
  // 入力系
  'Button', 'Input', 'Textarea', 'Select', 'Checkbox', 'Radio', 'Toggle', 'Slider', 'DatePicker',
  'FileUpload', 'SearchBar', 'Autocomplete', 'TagInput', 'OTPInput', 'ColorPicker', 'Link',
  // ナビゲーション系
  'Navbar', 'Sidebar', 'Breadcrumb', 'Pagination', 'Tabs', 'Stepper', 'AppBar',
  // 複合コンポーネント系
  'Card', 'Modal', 'Table', 'Accordion', 'Carousel', 'Kanban', 'Timeline', 'List', 'Tree', 'PricingTable', 'FAQSection', 'NotificationPanel',
  // フィードバック系
  'Toast', 'Alert', 'Tooltip', 'Popover', 'Spinner', 'ConfirmDialog', 'EmptyState',
] as const;

export type TagName = (typeof VALID_TAGS)[number];

/** 共通プロパティ */
export const COMMON_PROPS = [
  'width', 'height', 'padding', 'margin', 'color', 'background', 'radius', 'border', 'shadow', 'opacity',
] as const;

/** タグ別の固有プロパティ */
export const TAG_PROPS: Record<string, string[]> = {
  Screen: ['name'],
  VStack: ['gap', 'align', 'justify'],
  HStack: ['gap', 'align', 'justify'],
  Grid: ['cols', 'gap', 'rows'],
  Box: ['align', 'justify'],
  ScrollView: ['direction'],
  SplitScreen: ['ratio'],
  HeroSection: ['title', 'subtitle', 'background', 'height', 'align'],
  BentoGrid: ['cols', 'gap', 'rows'],
  Text: ['size', 'weight', 'align', 'lineHeight'],
  Image: ['src', 'alt', 'fit'],
  Icon: ['name', 'size'],
  Divider: ['direction', 'thickness'],
  Avatar: ['src', 'size', 'name'],
  Badge: ['label', 'variant'],
  Tag: ['label', 'variant'],
  ProgressBar: ['value', 'max'],
  Skeleton: ['width', 'height', 'variant'],
  StatCard: ['label', 'value', 'trend'],
  Chart: ['type', 'data'],
  Button: ['label', 'variant', 'navigate', 'disabled'],
  Input: ['placeholder', 'type', 'value', 'disabled'],
  Textarea: ['placeholder', 'rows', 'value'],
  Select: ['options', 'placeholder', 'value'],
  Checkbox: ['label', 'checked'],
  Radio: ['label', 'checked', 'group'],
  Toggle: ['label', 'checked'],
  Slider: ['min', 'max', 'value', 'step'],
  DatePicker: ['placeholder', 'value'],
  FileUpload: ['accept', 'label'],
  SearchBar: ['placeholder'],
  Autocomplete: ['placeholder', 'options'],
  TagInput: ['placeholder', 'tags'],
  OTPInput: ['length', 'placeholder'],
  ColorPicker: ['value', 'label'],
  Link: ['label', 'navigate', 'href'],
  Navbar: ['title'],
  Sidebar: ['collapsed'],
  Breadcrumb: ['items'],
  Pagination: ['total', 'current', 'pageSize'],
  Tabs: ['items', 'active'],
  Stepper: ['steps', 'current'],
  AppBar: ['title', 'back'],
  Card: ['title', 'subtitle'],
  Modal: ['title', 'open'],
  Table: ['columns', 'rows'],
  Accordion: ['items'],
  Carousel: ['items', 'autoplay'],
  Kanban: ['columns'],
  Timeline: ['items'],
  List: ['items'],
  Tree: ['items'],
  PricingTable: ['plans', 'columns'],
  FAQSection: ['items'],
  NotificationPanel: ['items', 'title'],
  Toast: ['message', 'variant'],
  Alert: ['message', 'variant'],
  Tooltip: ['content'],
  Popover: ['content'],
  Spinner: ['size'],
  ConfirmDialog: ['title', 'message'],
  EmptyState: ['title', 'message', 'icon'],
};

/** テキストコンテンツを持てるタグ */
export const TEXT_TAGS: TagName[] = [
  'Text', 'Button', 'Link', 'Alert', 'Badge', 'Toast', 'Tag',
];

/** タグの日本語説明 */
export const TAG_DESCRIPTIONS: Record<string, string> = {
  Screen: '画面全体のルートコンテナ',
  VStack: '縦並びコンテナ',
  HStack: '横並びコンテナ',
  Grid: 'グリッドレイアウト',
  Box: '汎用コンテナ',
  ScrollView: 'スクロールコンテナ',
  SplitScreen: '左右2分割',
  HeroSection: 'ヒーローセクション',
  BentoGrid: 'タイル配置',
  Text: 'テキスト表示',
  Image: '画像表示',
  Icon: 'アイコン表示',
  Divider: '区切り線',
  Avatar: 'アバター',
  Badge: '通知バッジ',
  Tag: 'タグ / チップ',
  ProgressBar: 'プログレスバー',
  Skeleton: 'スケルトン',
  StatCard: '統計カード',
  Chart: 'チャート',
  Button: 'ボタン',
  Input: 'テキスト入力',
  Textarea: '複数行入力',
  Select: 'ドロップダウン',
  Checkbox: 'チェックボックス',
  Radio: 'ラジオボタン',
  Toggle: 'トグルスイッチ',
  Slider: 'スライダー',
  DatePicker: '日付選択',
  FileUpload: 'ファイルアップ',
  SearchBar: '検索バー',
  Autocomplete: 'オートコンプリート',
  TagInput: 'タグ入力',
  OTPInput: 'OTP入力',
  ColorPicker: 'カラーピッカー',
  Link: 'リンク',
  Navbar: 'ナビゲーションバー',
  Sidebar: 'サイドバー',
  Breadcrumb: 'パンくずリスト',
  Pagination: 'ページネーション',
  Tabs: 'タブ',
  Stepper: 'ステッパー',
  AppBar: 'アプリバー',
  Card: 'カード',
  Modal: 'モーダル',
  Table: 'テーブル',
  Accordion: 'アコーディオン',
  Carousel: 'カルーセル',
  Kanban: 'カンバン',
  Timeline: 'タイムライン',
  List: 'リスト',
  Tree: 'ツリー',
  PricingTable: '料金テーブル',
  FAQSection: 'FAQ',
  NotificationPanel: '通知パネル',
  Toast: 'トースト',
  Alert: 'アラート',
  Tooltip: 'ツールチップ',
  Popover: 'ポップオーバー',
  Spinner: 'スピナー',
  ConfirmDialog: '確認ダイアログ',
  EmptyState: 'エンプティステート',
};

/** タグのカテゴリ分類 */
export const TAG_CATEGORIES: Record<string, TagName[]> = {
  'LAYOUT': ['Screen', 'VStack', 'HStack', 'Grid', 'Box', 'ScrollView', 'SplitScreen', 'HeroSection', 'BentoGrid'],
  'CONTENT': ['Text', 'Image', 'Icon', 'Divider', 'Avatar', 'Badge', 'Tag', 'ProgressBar', 'Skeleton', 'StatCard', 'Chart'],
  'INPUT': ['Button', 'Input', 'Textarea', 'Select', 'Checkbox', 'Radio', 'Toggle', 'Slider', 'DatePicker', 'FileUpload', 'SearchBar', 'Autocomplete', 'TagInput', 'OTPInput', 'ColorPicker', 'Link'],
  'NAVIGATION': ['Navbar', 'Sidebar', 'Breadcrumb', 'Pagination', 'Tabs', 'Stepper', 'AppBar'],
  'COMPOSITE': ['Card', 'Modal', 'Table', 'Accordion', 'Carousel', 'Kanban', 'Timeline', 'List', 'Tree', 'PricingTable', 'FAQSection', 'NotificationPanel'],
  'FEEDBACK': ['Toast', 'Alert', 'Tooltip', 'Popover', 'Spinner', 'ConfirmDialog', 'EmptyState'],
};
