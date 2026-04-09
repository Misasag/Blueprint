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
  // スロットタグ（複合コンポーネントの子要素）
  'CardHeader', 'CardBody', 'CardFooter',
  'ModalHeader', 'ModalBody', 'ModalFooter',
  'TableHeader', 'TableRow', 'TableCell',
  // フィードバック系
  'Toast', 'Alert', 'Tooltip', 'Popover', 'Spinner', 'ConfirmDialog', 'EmptyState',
] as const;

export type TagName = (typeof VALID_TAGS)[number];

/** 共通プロパティ（全タグ共通で利用可能） */
export const COMMON_PROPS = [
  'width', 'height', 'minWidth', 'maxWidth', 'minHeight', 'maxHeight',
  'padding', 'margin',
  'color', 'background', 'opacity',
  'radius', 'border', 'shadow',
  'overflow', 'zIndex', 'grow', 'alignSelf',
] as const;

/** プロパティパネルのセクション定義 */
export const STYLE_SECTIONS = {
  SIZE:       ['width', 'height', 'minWidth', 'maxWidth', 'minHeight', 'maxHeight'],
  SPACING:    ['padding', 'margin'],
  APPEARANCE: ['color', 'background', 'opacity'],
  BORDER:     ['radius', 'border', 'shadow'],
  LAYOUT:     ['overflow', 'zIndex', 'grow', 'alignSelf'],
} as const;

/** タグ別の固有プロパティ */
export const TAG_PROPS: Record<string, string[]> = {
  // レイアウト系
  Screen: ['name'],
  VStack: ['gap', 'align', 'justify'],
  HStack: ['gap', 'align', 'justify'],
  Grid: ['cols', 'gap', 'rows'],
  Box: ['align', 'justify'],
  ScrollView: ['direction'],
  SplitScreen: ['ratio'],
  HeroSection: ['title', 'subtitle', 'background', 'height', 'align'],
  BentoGrid: ['cols', 'gap', 'rows'],
  // コンテンツ系
  Text: ['size', 'weight', 'align', 'lineHeight', 'decoration', 'transform', 'truncate', 'maxLines'],
  Image: ['src', 'alt', 'fit', 'fallback'],
  Icon: ['name', 'size'],
  Divider: ['direction', 'thickness'],
  Avatar: ['src', 'size', 'name', 'status'],
  Badge: ['label', 'variant', 'dot'],
  Tag: ['label', 'variant', 'closable'],
  ProgressBar: ['value', 'max', 'label', 'showPercent'],
  Skeleton: ['width', 'height', 'variant'],
  StatCard: ['label', 'value', 'trend'],
  Chart: ['type', 'data', 'title', 'legend'],
  // 入力系
  Button: ['label', 'variant', 'navigate', 'disabled', 'icon', 'iconPosition', 'loading', 'size'],
  Input: ['placeholder', 'type', 'value', 'disabled', 'label', 'error', 'helperText', 'required', 'prefix', 'suffix'],
  Textarea: ['placeholder', 'rows', 'value', 'label', 'error', 'maxLength'],
  Select: ['options', 'placeholder', 'value', 'label', 'multiple', 'searchable', 'error'],
  Checkbox: ['label', 'checked', 'disabled', 'indeterminate'],
  Radio: ['label', 'checked', 'group', 'disabled'],
  Toggle: ['label', 'checked', 'disabled', 'size'],
  Slider: ['min', 'max', 'value', 'step', 'label', 'showValue'],
  DatePicker: ['placeholder', 'value'],
  FileUpload: ['accept', 'label'],
  SearchBar: ['placeholder'],
  Autocomplete: ['placeholder', 'options'],
  TagInput: ['placeholder', 'tags'],
  OTPInput: ['length', 'placeholder'],
  ColorPicker: ['value', 'label'],
  Link: ['label', 'navigate', 'href'],
  // ナビゲーション系
  Navbar: ['title', 'items', 'logo', 'sticky'],
  Sidebar: ['collapsed', 'items', 'width'],
  Breadcrumb: ['items'],
  Pagination: ['total', 'current', 'pageSize'],
  Tabs: ['items', 'active', 'variant'],
  Stepper: ['steps', 'current'],
  AppBar: ['title', 'back', 'actions'],
  // 複合コンポーネント系
  Card: ['title', 'subtitle', 'image', 'variant', 'hoverable'],
  Modal: ['title', 'open', 'size', 'closable'],
  Table: ['columns', 'rows', 'striped', 'bordered', 'cellAlign', 'headerBackground', 'headerColor', 'columnWidths'],
  Accordion: ['items', 'defaultOpen', 'multiple'],
  Carousel: ['items', 'autoplay', 'dots', 'arrows', 'interval'],
  Kanban: ['columns'],
  Timeline: ['items'],
  List: ['items', 'divider', 'ordered'],
  Tree: ['items'],
  PricingTable: ['plans', 'columns'],
  FAQSection: ['items'],
  NotificationPanel: ['items', 'title'],
  // スロットタグ
  CardHeader: [], CardBody: [], CardFooter: [],
  ModalHeader: [], ModalBody: [], ModalFooter: [],
  TableHeader: [], TableRow: [],
  TableCell: ['width', 'align', 'weight'],
  // フィードバック系
  Toast: ['message', 'variant', 'position', 'closable'],
  Alert: ['message', 'variant', 'closable', 'icon', 'title'],
  Tooltip: ['content'],
  Popover: ['content'],
  Spinner: ['size'],
  ConfirmDialog: ['title', 'message', 'confirmLabel', 'cancelLabel'],
  EmptyState: ['title', 'message', 'icon', 'actionLabel'],
};

/** 構造プロパティ（CSSではないためbuildStyleで除外する） */
export const STRUCTURAL_PROPS = new Set(
  Object.values(TAG_PROPS).flat()
);

/** テキストコンテンツを持てるタグ */
export const TEXT_TAGS: TagName[] = [
  'Text', 'Button', 'Link', 'Alert', 'Badge', 'Toast', 'Tag', 'TableCell',
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
  CardHeader: 'カードヘッダー',
  CardBody: 'カード本体',
  CardFooter: 'カードフッター',
  ModalHeader: 'モーダルヘッダー',
  ModalBody: 'モーダル本体',
  ModalFooter: 'モーダルフッター',
  TableHeader: 'テーブルヘッダー行',
  TableRow: 'テーブルデータ行',
  TableCell: 'テーブルセル',
};

type SectionName = keyof typeof STYLE_SECTIONS;

/** タグカテゴリごとに表示するセクション */
const CATEGORY_SECTIONS: Record<string, readonly SectionName[]> = {
  LAYOUT:     ['SIZE', 'SPACING', 'APPEARANCE', 'BORDER', 'LAYOUT'],
  CONTENT:    ['SIZE', 'APPEARANCE'],
  INPUT:      ['SIZE', 'SPACING', 'APPEARANCE', 'BORDER'],
  NAVIGATION: ['SIZE', 'SPACING', 'APPEARANCE', 'BORDER'],
  COMPOSITE:  ['SIZE', 'SPACING', 'APPEARANCE', 'BORDER'],
  FEEDBACK:   ['APPEARANCE', 'BORDER'],
};

/** カテゴリデフォルトと異なるタグの個別オーバーライド */
const TAG_SECTION_OVERRIDES: Partial<Record<string, readonly SectionName[]>> = {
  // Content — テキスト系は SIZE 不要、画像は BORDER 必要
  Text:        ['APPEARANCE'],
  Icon:        ['APPEARANCE'],
  Divider:     ['APPEARANCE'],
  Avatar:      ['APPEARANCE', 'BORDER'],
  Image:       ['SIZE', 'APPEARANCE', 'BORDER'],
  ProgressBar: ['SIZE', 'APPEARANCE'],
  Chart:       ['SIZE', 'APPEARANCE', 'BORDER'],
  // Input — インライン系は SIZE/SPACING 不要
  Button:      ['SIZE', 'SPACING', 'APPEARANCE', 'BORDER'],
  Checkbox:    ['APPEARANCE'],
  Radio:       ['APPEARANCE'],
  Toggle:      ['APPEARANCE'],
  Slider:      ['SIZE', 'APPEARANCE'],
  Link:        ['APPEARANCE'],
  // Composite — モーダルは LAYOUT 含む
  Modal:       ['SIZE', 'SPACING', 'APPEARANCE', 'BORDER'],
  Card:        ['SIZE', 'SPACING', 'APPEARANCE', 'BORDER'],
  // Feedback
  Spinner:     ['APPEARANCE'],
};

/** タグに表示すべきスタイルセクション一覧を返す */
export function getStyleSectionsForTag(tag: string): { name: SectionName; props: readonly string[] }[] {
  let sectionNames: readonly SectionName[] | undefined;

  if (tag in TAG_SECTION_OVERRIDES) {
    sectionNames = TAG_SECTION_OVERRIDES[tag];
  } else {
    for (const [category, tags] of Object.entries(TAG_CATEGORIES)) {
      if ((tags as readonly string[]).includes(tag)) {
        sectionNames = CATEGORY_SECTIONS[category];
        break;
      }
    }
  }

  const names = sectionNames ?? (['SIZE', 'SPACING', 'APPEARANCE', 'BORDER', 'LAYOUT'] as SectionName[]);
  return names.map(name => ({ name, props: STYLE_SECTIONS[name] }));
}

/** タグのカテゴリ分類 */
export const TAG_CATEGORIES: Record<string, TagName[]> = {
  'LAYOUT': ['Screen', 'VStack', 'HStack', 'Grid', 'Box', 'ScrollView', 'SplitScreen', 'HeroSection', 'BentoGrid'],
  'CONTENT': ['Text', 'Image', 'Icon', 'Divider', 'Avatar', 'Badge', 'Tag', 'ProgressBar', 'Skeleton', 'StatCard', 'Chart'],
  'INPUT': ['Button', 'Input', 'Textarea', 'Select', 'Checkbox', 'Radio', 'Toggle', 'Slider', 'DatePicker', 'FileUpload', 'SearchBar', 'Autocomplete', 'TagInput', 'OTPInput', 'ColorPicker', 'Link'],
  'NAVIGATION': ['Navbar', 'Sidebar', 'Breadcrumb', 'Pagination', 'Tabs', 'Stepper', 'AppBar'],
  'COMPOSITE': ['Card', 'Modal', 'Table', 'Accordion', 'Carousel', 'Kanban', 'Timeline', 'List', 'Tree', 'PricingTable', 'FAQSection', 'NotificationPanel',
    'CardHeader', 'CardBody', 'CardFooter', 'ModalHeader', 'ModalBody', 'ModalFooter', 'TableHeader', 'TableRow', 'TableCell'],
  'FEEDBACK': ['Toast', 'Alert', 'Tooltip', 'Popover', 'Spinner', 'ConfirmDialog', 'EmptyState'],
};
