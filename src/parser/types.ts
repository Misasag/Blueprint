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
  // 図形系
  'Rectangle', 'Ellipse', 'Line', 'Arrow', 'Polygon',
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
  'overflow', 'zIndex',
  'grow', 'alignSelf',
] as const;

/** プロパティパネルのセクション定義 */
export const STYLE_SECTIONS = {
  SIZE:       ['width', 'height', 'minWidth', 'maxWidth', 'minHeight', 'maxHeight'],
  SPACING:    ['padding', 'margin'],
  APPEARANCE: ['color', 'background', 'opacity'],
  BORDER:     ['radius', 'border', 'shadow'],
  LAYOUT:     ['overflow', 'zIndex'],
  SELF:       ['grow', 'alignSelf'],
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
  // 図形系
  Rectangle: ['width', 'height', 'background', 'radius', 'border'],
  Ellipse: ['width', 'height', 'background', 'border'],
  Line: ['length', 'direction', 'stroke', 'strokeWidth'],
  Arrow: ['length', 'direction', 'stroke', 'strokeWidth'],
  Polygon: ['sides', 'size', 'background', 'border'],
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
  Textarea: ['placeholder', 'rows', 'value', 'disabled', 'label', 'error', 'maxLength'],
  Select: ['options', 'placeholder', 'value', 'disabled', 'label', 'multiple', 'searchable', 'error'],
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
  // レイアウト系
  Screen: '1画面分のルート要素。全ての要素はこの中に配置する',
  VStack: '子要素を縦に並べる。フォームやリスト風のレイアウトに使う',
  HStack: '子要素を横に並べる。ボタン群やアイコン+テキストの横並びに使う',
  Grid: '子要素を格子状に配置する。カード一覧や画像ギャラリーに使う',
  Box: 'スタイルを当てるための汎用の箱。グループ化や背景の区切りに使う',
  ScrollView: '中身が溢れたらスクロール可能にする。長いリストやコンテンツ領域に使う',
  SplitScreen: '画面を左右に分割する。サイドバー+メインコンテンツの構成に使う',
  HeroSection: 'ページ冒頭の大きなビジュアル。LPのキャッチコピーや画像表示に使う',
  BentoGrid: '大小異なるサイズのカードを配置する。ダッシュボードのウィジェットに使う',
  // 図形系
  Rectangle: '四角形の図形。装飾ブロックや背景エリアに使う',
  Ellipse: '楕円・円の図形。装飾やステータスインジケーター、アイコンの背景に使う',
  Line: '線の図形。装飾線や接続線に使う',
  Arrow: '矢印の図形。フロー図や方向指示に使う',
  Polygon: '多角形の図形。三角形（sides=3）や六角形（sides=6）などを描く',
  // コンテンツ系
  Text: 'テキストを表示する。見出し、本文、ラベルなど全てのテキストに使う',
  Image: '画像を表示する。写真、バナー、アイコン画像などに使う',
  Icon: '小さなアイコンを表示する。ボタンやメニュー項目の装飾に使う',
  Divider: 'セクション間を区切る線。横線または縦線を引く',
  Avatar: 'ユーザーのプロフィール画像を丸く表示する。ユーザー一覧やコメント欄に使う',
  Badge: '小さなラベルや数値を表示する。未読件数やステータス表示に使う',
  Tag: 'カテゴリや属性を示す小さなラベル。フィルタ条件や選択済み項目の表示に使う',
  ProgressBar: '進捗状況をバーで表示する。アップロードやステップの進捗に使う',
  Skeleton: 'コンテンツ読み込み中のプレースホルダー。ローディング中の画面に使う',
  StatCard: '数値を大きく目立たせるカード。ダッシュボードのKPI表示に使う',
  Chart: 'グラフを表示する。棒グラフ、折れ線、円グラフなどに使う',
  // 入力系
  Button: 'クリック可能なボタン。フォーム送信やアクション実行に使う',
  Input: '1行のテキスト入力欄。名前やメールアドレスの入力に使う',
  Textarea: '複数行のテキスト入力欄。コメントや説明文の入力に使う',
  Select: '選択肢から1つ（または複数）を選ぶ。カテゴリ選択や設定変更に使う',
  Checkbox: 'ON/OFFを切り替える。利用規約の同意や複数選択に使う',
  Radio: '複数の選択肢から1つだけ選ぶ。性別やプランの選択に使う',
  Toggle: 'ON/OFFを切り替えるスイッチ。設定の有効/無効の切り替えに使う',
  Slider: '数値をドラッグで指定する。音量や価格範囲の調整に使う',
  DatePicker: 'カレンダーから日付を選ぶ。予約日や期間の入力に使う',
  FileUpload: 'ファイルをアップロードするエリア。画像や書類の添付に使う',
  SearchBar: 'キーワード検索の入力欄。一覧ページの上部に配置する',
  Autocomplete: '入力に応じて候補を表示する検索欄。住所や商品名の入力補助に使う',
  TagInput: 'タグを追加・削除できる入力欄。記事のタグ付けやフィルタ設定に使う',
  OTPInput: 'ワンタイムパスワードの入力欄。SMS認証や2段階認証に使う',
  ColorPicker: '色を選択する。テーマカスタマイズや背景色の設定に使う',
  Link: 'クリック可能なテキストリンク。ページ遷移やパスワードリセットに使う',
  // ナビゲーション系
  Navbar: 'ページ上部のナビゲーション。ロゴとメニューリンクを横並びに配置する',
  Sidebar: '左側のナビゲーション。管理画面のメニューに使う',
  Breadcrumb: '現在のページ位置を階層で表示する。ページの上部に配置する',
  Pagination: 'ページ番号による切り替え。一覧の下部に配置する',
  Tabs: 'コンテンツをタブで切り替える。設定画面や詳細ページに使う',
  Stepper: '手順を段階的に表示する。会員登録や決済フローに使う',
  AppBar: 'モバイルアプリの上部バー。タイトルと戻るボタンを表示する',
  // 複合コンポーネント系
  Card: '情報をまとめるカード。商品一覧やブログ記事の表示に使う',
  Modal: 'オーバーレイで表示するダイアログ。確認や詳細入力に使う',
  Table: 'データを行と列で表示する。一覧表示やデータ管理に使う',
  Accordion: '開閉できるセクション。FAQや設定のグループ化に使う',
  Carousel: '複数のスライドを切り替えて表示する。画像ギャラリーやバナーに使う',
  Kanban: '複数列にカードを配置するボード。タスク管理やステータス管理に使う',
  Timeline: '時系列でイベントを並べる。活動履歴や手順の表示に使う',
  List: '項目を縦に並べて表示する。メニュー項目や検索結果に使う',
  Tree: '階層構造をインデントで表示する。ファイル一覧やカテゴリ管理に使う',
  PricingTable: 'プランと価格を並べて比較する。SaaSの料金ページに使う',
  FAQSection: 'よくある質問を開閉式で表示する。サポートページに使う',
  NotificationPanel: '通知の一覧を表示する。ヘッダーの通知ドロップダウンに使う',
  // スロットタグ
  CardHeader: 'Card のヘッダー領域。タイトルやアクションを配置する',
  CardBody: 'Card のコンテンツ領域。本文や画像を配置する',
  CardFooter: 'Card のフッター領域。ボタンやリンクを配置する',
  ModalHeader: 'Modal のヘッダー領域。タイトルや閉じるボタンを配置する',
  ModalBody: 'Modal のコンテンツ領域。本文やフォームを配置する',
  ModalFooter: 'Modal のフッター領域。確定・キャンセルボタンを配置する',
  TableHeader: 'Table のヘッダー行。列タイトルを TableCell で並べる',
  TableRow: 'Table のデータ行。データを TableCell で並べる',
  TableCell: 'Table の1つのセル。テキストやコンポーネントを配置する',
  // フィードバック系
  Toast: '一時的な通知メッセージ。保存完了やエラー通知に使う',
  Alert: '画面内に埋め込む通知バナー。警告やお知らせに使う',
  Tooltip: '要素にホバーすると表示される補足テキスト',
  Popover: '要素をクリックすると表示されるカード風の補足情報',
  Spinner: 'ローディング中の回転アニメーション。データ読み込み中に使う',
  ConfirmDialog: '操作の確認を求めるダイアログ。削除や重要な操作の前に使う',
  EmptyState: 'データがないときの表示。空の一覧や検索結果0件の画面に使う',
};

type SectionName = keyof typeof STYLE_SECTIONS;

/** タグカテゴリごとに表示するセクション */
const CATEGORY_SECTIONS: Record<string, readonly SectionName[]> = {
  LAYOUT:     ['SIZE', 'SPACING', 'APPEARANCE', 'BORDER', 'LAYOUT', 'SELF'],
  SHAPE:      ['SIZE', 'APPEARANCE', 'BORDER'],
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
  'SHAPE': ['Rectangle', 'Ellipse', 'Line', 'Arrow', 'Polygon'],
  'CONTENT': ['Text', 'Image', 'Icon', 'Divider', 'Avatar', 'Badge', 'Tag', 'ProgressBar', 'Skeleton', 'StatCard', 'Chart'],
  'INPUT': ['Button', 'Input', 'Textarea', 'Select', 'Checkbox', 'Radio', 'Toggle', 'Slider', 'DatePicker', 'FileUpload', 'SearchBar', 'Autocomplete', 'TagInput', 'OTPInput', 'ColorPicker', 'Link'],
  'NAVIGATION': ['Navbar', 'Sidebar', 'Breadcrumb', 'Pagination', 'Tabs', 'Stepper', 'AppBar'],
  'COMPOSITE': ['Card', 'Modal', 'Table', 'Accordion', 'Carousel', 'Kanban', 'Timeline', 'List', 'Tree', 'PricingTable', 'FAQSection', 'NotificationPanel',
    'CardHeader', 'CardBody', 'CardFooter', 'ModalHeader', 'ModalBody', 'ModalFooter', 'TableHeader', 'TableRow', 'TableCell'],
  'FEEDBACK': ['Toast', 'Alert', 'Tooltip', 'Popover', 'Spinner', 'ConfirmDialog', 'EmptyState'],
};
