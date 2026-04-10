# Blueprint — プロジェクト仕様書

## 概要

エンジニア向けのFigmaライクなデスクトップUIエディタ。
`.ui` ファイル（独自フォーマット）をビジュアルで作成・編集し、完成した `.ui` をAIに渡して任意のフレームワーク（Vue / React / Flutter等）のコードに変換するワークフローを実現する。

**エディタの位置づけ:** AIに依存しない独立したビジュアルエディタ。エンジニアが一からUIを組み立てることも、AIが生成した `.ui` を修正することもできる。AIはサポート役であり必須ではない。

---

## 解決する課題

- エンジニアが UI を作るには CSS やデザインツールの知識が必要で、ハードルが高い
- UIコンポーネントの名称や使い分けがわからず、適切なパーツを選べない
- コードベースで UI の構造やスタイルを調整するのは非効率で、試行錯誤に時間がかかる

**解決策：** エンジニアがビジュアルエディタで直感的にUIを作成・修正できるようにする。言語化不要で構造もスタイルも操作可能。完成した `.ui` をAIに渡せばコード化される。AIなしでもエディタ単体でUIの作成が完結する。

---

## ワークフロー

### ケース1: デザインファイルからの変換

```
① デザイナーが Figma / Illustrator 等でデザインを作成
        ↓
② AIがデザインファイルや画像を読み取り .ui ファイルを生成
        ↓
③ エンジニアがエディタで .ui を修正
        ↓
④ 修正済み .ui をAIに渡してコード化
```

### ケース2: AIとの共同作成

```
① エンジニアがAIと要件を詰める
        ↓
② AIが .ui ファイルを生成
        ↓
③ エンジニアがエディタで .ui を修正
        ↓
④ 修正済み .ui をAIに渡してコード化
```

### ケース3: エンジニアが一から作成

```
① エンジニアがエディタで一から .ui を作成
  （コンポーネントの選択、配置、スタイル調整を全てビジュアルで行う）
        ↓
② 完成した .ui をAIに渡してコード化
```

**ケース3を第一に設計する。** エディタ単体で UI の作成が完結すること。ケース1・2 はその上で AI 連携が加わるだけ。

`.ui` 以降（コード変換・管理）はエンジニアの責務。エディタの責務は `.ui` の作成と編集。

### 新規作成

エディタ起動時またはメニューの「新規作成」で、空の Screen を1つ持つ状態から開始する。

```jsx
<Screen name="untitled">
</Screen>
```

エンジニアはこの空の Screen にコンポーネントパネルから要素を追加して UI を組み立てる。

---

## .ui フォーマット仕様

### 記法

JSXライクな独自フォーマット。拡張子 `.ui`。フレームワーク非依存。

```jsx
<Screen name="login">
  <VStack gap="16" padding="24">
    <Text size="24" weight="bold">ログイン</Text>
    <Input placeholder="メールアドレス" width="100%" />
    <Input placeholder="パスワード" type="password" width="100%" />
    <Button
      label="ログイン"
      color="#3B82F6"
      radius="8"
      width="100%"
      navigate="home"
    />
    <Link label="パスワードを忘れた方" navigate="reset" />
  </VStack>
</Screen>
```

### ファイルと画面の関係

- 1ファイル = 1 Screen（1つの .ui ファイルに1つの画面）
- 複数画面のアプリは複数の .ui ファイルで管理する（例: `login.ui`, `home.ui`, `settings.ui`）
- 画面遷移（`navigate="home"`）はテキストプロパティとして設定する
- 画面間の整合性（navigate 先のファイルが存在するか等）はエディタの責務外

### .ui ファイルが持つ情報

| カテゴリ | 内容 |
|----------|------|
| 構造 | コンポーネントの階層・レイアウト |
| 見た目 | 色・サイズ・フォント・余白・グリッド（独自プロパティとして直接記述） |
| 意味 | 独自タグ（Button / Input / Table 等） |
| インタラクション | 画面遷移程度（`navigate="home"` など） |

### スタイルの持ち方

スタイルは独自プロパティとしてタグに直接記述する（CSSではなく）。

```jsx
<!-- Good -->
<Button color="#3B82F6" radius="8" padding="16" width="100%" />

<!-- Bad: styleブロックは使わない -->
<Button id="btn1" />
<Style target="btn1" color="#3B82F6" />
```

### 共通プロパティ（全タグ共通）

パネルに表示する共通スタイルプロパティ。セクションごとに分類して表示する。

#### SIZE（サイズ）
```
width, height, minWidth, maxWidth, minHeight, maxHeight
```

#### SPACING（余白）
```
padding, margin
```

#### APPEARANCE（外観）
```
color, background, opacity
```

#### BORDER（枠線・影）
```
radius, border, shadow
```

#### LAYOUT（親としてのレイアウト）
```
overflow, zIndex
```
レイアウト系タグ（VStack, HStack, Grid 等）のみ表示。

#### SELF（親の中での配置）
```
grow, alignSelf
```
親がレイアウトコンテナ（VStack, HStack, Grid, Box, SplitScreen, BentoGrid）の場合のみ表示。

#### PARENT LAYOUT（親のレイアウト属性）
```
親の gap, align, justify, cols を子要素のパネルから直接編集可能
```
親がレイアウトコンテナの場合のみ表示。詳細は layout-ops-spec.md を参照。

> コンポーネントの種類に応じて、関連するセクションのみ表示する。
> 例: `<Text>` には APPEARANCE のみ表示。
> 例: `<VStack>` には SIZE + SPACING + APPEARANCE + BORDER + LAYOUT を表示。
> 例: VStack の子の `<Button>` には SELF + PARENT LAYOUT + SIZE + SPACING + APPEARANCE + BORDER を表示。

### 右クリックメニュー

キャンバスまたはツリービューで要素を右クリックすると、コンテキストメニューが表示される。メニューにはスタイル編集と構造編集の操作が含まれる。詳細は structural-editing-spec.md を参照。

### カスタムスタイル

パネルに表示されていないCSSプロパティを指定したい場合:

1. 右クリックメニュー →「スタイルを編集」を選択
2. プロパティ名と値を自由入力（例: `letterSpacing: 2`, `textDecoration: underline`）
3. 入力したカスタムスタイルは `.ui` の props に保存され、プロパティパネルの「OTHER」セクションに表示される

これにより、普段はエンジニアに必要なプロパティだけを簡潔に表示しつつ、必要な時にCSSの全プロパティにアクセスできる。

#### OTHER セクションでの編集・削除

追加したカスタムスタイルは OTHER セクションに表示され、以下の操作が可能:

```
OTHER
  letterSpacing  [ 2px     ] ✕    ← 値の編集 + 削除ボタン
  textDecoration [ underline] ✕
```

- **値の編集**: テキスト入力で直接変更可能
- **プロパティの削除**: 各プロパティの右端に ✕ ボタンを表示。クリックで削除
- **プロパティ名の変更**: 直接変更はできない。削除して再追加する

---

## タグ一覧

### レイアウト系

```jsx
<Screen>      // 1画面全体のルートコンテナ
<VStack>      // 縦並びコンテナ
<HStack>      // 横並びコンテナ
<Grid>        // グリッドレイアウト（cols で列数指定）
<Box>         // 汎用コンテナ
<ScrollView>  // スクロール可能なコンテナ
<SplitScreen> // 左右2分割レイアウト
<HeroSection> // ページ冒頭の大きなビジュアルセクション
<BentoGrid>   // 様々なサイズのカードをタイル状に配置
```

### 図形系

```jsx
<Rectangle>   // 四角形。装飾ブロック、背景エリアに使う
<Ellipse>     // 楕円・円。width=height で正円。装飾やインジケーターに使う
<Line>        // 線。装飾線や接続線に使う
<Arrow>       // 矢印。フロー図や方向指示に使う
<Polygon>     // 多角形。sides で辺数指定（3=三角形、6=六角形）
```

### コンテンツ系

```jsx
<Text>        // テキスト表示
<Image>       // 画像表示
<Icon>        // アイコン表示
<Divider>     // 区切り線
<Avatar>      // ユーザーアバター（円形）
<Badge>       // 通知バッジ
<Tag>         // タグ / チップ
<ProgressBar> // プログレスバー
<Skeleton>    // スケルトンスクリーン
<StatCard>    // 統計カード（数値を大きく表示）
<Chart>       // チャート・グラフ
```

### 入力系

```jsx
<Button>      // ボタン
<Input>       // 1行テキスト入力
<Textarea>    // 複数行テキスト入力
<Select>      // ドロップダウン
<Checkbox>    // チェックボックス
<Radio>       // ラジオボタン
<Toggle>      // トグルスイッチ
<Slider>      // スライダー
<DatePicker>  // 日付選択
<FileUpload>  // ファイルアップロード
<SearchBar>   // 検索バー
<Autocomplete>// オートコンプリート
<TagInput>    // タグ入力
<OTPInput>    // OTP入力
<ColorPicker> // カラーピッカー
<Link>        // リンク
```

### ナビゲーション系

```jsx
<Navbar>      // 上部ナビゲーションバー
<Sidebar>     // 左サイドバーナビ
<Breadcrumb>  // パンくずリスト
<Pagination>  // ページネーション
<Tabs>        // タブ
<Stepper>     // ステッパー（マルチステップ）
<AppBar>      // モバイルアプリバー
```

### 複合コンポーネント系

```jsx
<Card>              // カード
<Modal>             // モーダル
<Table>             // テーブル
<Accordion>         // アコーディオン
<Carousel>          // カルーセル
<Kanban>            // カンバンボード
<Timeline>          // タイムライン
<List>              // リストビュー
<Tree>              // ツリービュー
<PricingTable>      // 料金テーブル
<FAQSection>        // FAQセクション
<NotificationPanel> // 通知パネル
```

### スロットタグ（複合コンポーネントの子要素）

```jsx
<CardHeader>    // Card のヘッダー領域
<CardBody>      // Card のコンテンツ領域
<CardFooter>    // Card のフッター領域
<ModalHeader>   // Modal のヘッダー領域
<ModalBody>     // Modal のコンテンツ領域
<ModalFooter>   // Modal のフッター領域
<TableHeader>   // Table のヘッダー行
<TableRow>      // Table のデータ行
<TableCell>     // Table のセル
```

### フィードバック系

```jsx
<Toast>         // トースト通知
<Alert>         // アラート / バナー
<Tooltip>       // ツールチップ
<Popover>       // ポップオーバー
<Spinner>       // ローディングスピナー
<ConfirmDialog> // 確認ダイアログ
<EmptyState>    // エンプティステート
```

---

## 複合コンポーネント設計

### 基本ルール

複合コンポーネント（Card, Modal, Table 等）は2つのモードで記述できる。

**1. Shortcut props（簡易モード）**

```jsx
<Card title="My Card" subtitle="Description" />
```

propsで完結する。個別のスタイリングはできない。

**2. Slot children（フル制御モード）**

```jsx
<Card>
  <CardHeader>
    <Text size="18" weight="bold" color="#333">My Card</Text>
  </CardHeader>
  <CardBody>
    <Text>Description</Text>
    <Image src="photo.png" />
  </CardBody>
  <CardFooter>
    <HStack gap="8">
      <Button label="Action" />
      <Button label="Cancel" variant="outlined" />
    </HStack>
  </CardFooter>
</Card>
```

スロットタグで構造を明示し、各部分を個別にスタイリングできる。

### 優先ルール

- **slot children > shortcut props**（スロット単位の上書き）
- `<CardHeader>` が子にあれば `title` props を無視
- `<CardBody>` がなくても `title` 以外の子要素は body 扱い
- スロットタグのない子要素はデフォルト領域に配置

### Table の記述例

```jsx
<!-- 簡易: propsだけ -->
<Table columns="名前,年齢,役職" striped bordered />

<!-- フル制御: slot childrenで構造化 -->
<Table bordered>
  <TableHeader>
    <TableCell width="200" weight="bold">名前</TableCell>
    <TableCell width="80" align="center">年齢</TableCell>
    <TableCell>役職</TableCell>
  </TableHeader>
  <TableRow>
    <TableCell>田中太郎</TableCell>
    <TableCell align="center">28</TableCell>
    <TableCell>エンジニア</TableCell>
  </TableRow>
</Table>
```

### Modal の記述例

```jsx
<Modal size="medium" closable>
  <ModalHeader>
    <Text size="16" weight="bold">確認</Text>
  </ModalHeader>
  <ModalBody>
    <Text>この操作は取り消せません。</Text>
  </ModalBody>
  <ModalFooter>
    <HStack gap="8" justify="flex-end">
      <Button label="キャンセル" variant="outlined" />
      <Button label="OK" color="#d32f2f" />
    </HStack>
  </ModalFooter>
</Modal>
```

---

## 拡張タグプロパティ

各コンポーネントのタグ固有プロパティ。レンダラーが実際に解釈するもののみ定義する。

### 入力系

| タグ | プロパティ |
|------|----------|
| Button | label, variant, navigate, disabled, icon, iconPosition, loading, size |
| Input | placeholder, type, value, disabled, label, error, helperText, required, prefix, suffix |
| Textarea | placeholder, rows, value, disabled, label, error, maxLength |
| Select | options, placeholder, value, disabled, label, multiple, searchable, error |
| Checkbox | label, checked, disabled, indeterminate |
| Radio | label, checked, group, disabled |
| Toggle | label, checked, disabled, size |
| Slider | min, max, value, step, label, showValue |
| DatePicker | placeholder, value |
| FileUpload | accept, label |
| SearchBar | placeholder |
| Autocomplete | placeholder, options |
| TagInput | placeholder, tags |
| OTPInput | length, placeholder |
| ColorPicker | value, label |
| Link | label, navigate, href |

### 図形系

| タグ | プロパティ |
|------|----------|
| Rectangle | width, height, background, radius, border |
| Ellipse | width, height, background, border |
| Line | length, direction, stroke, strokeWidth |
| Arrow | length, direction, stroke, strokeWidth |
| Polygon | sides, size, background, border |

### コンテンツ系

| タグ | プロパティ |
|------|----------|
| Text | size, weight, align, lineHeight, decoration, transform, truncate, maxLines |
| Image | src, alt, fit, fallback |
| Avatar | src, size, name, status |
| Badge | label, variant, dot |
| Tag | label, variant, closable |
| ProgressBar | value, max, label, showPercent |
| Chart | type, data, title, legend |
| Icon | name, size |
| Divider | direction, thickness |
| Skeleton | width, height, variant |
| StatCard | label, value, trend |

### 複合コンポーネント系

| タグ | プロパティ |
|------|----------|
| Card | title, subtitle, image, variant, hoverable |
| Modal | title, open, size, closable |
| Table | columns, rows, striped, bordered, cellAlign, headerBackground, headerColor, columnWidths |
| Accordion | items, defaultOpen, multiple |
| Carousel | items, autoplay, dots, arrows, interval |
| List | items, divider, ordered |
| Kanban | columns |
| Timeline | items |
| Tree | items |
| PricingTable | plans, columns |
| FAQSection | items |
| NotificationPanel | items, title |

### スロットタグ

| タグ | プロパティ |
|------|----------|
| TableCell | width, align, weight |

### ナビゲーション系

| タグ | プロパティ |
|------|----------|
| Navbar | title, items, logo, sticky |
| Sidebar | collapsed, items, width |
| AppBar | title, back, actions |
| Breadcrumb | items |
| Pagination | total, current, pageSize |
| Tabs | items, active, variant |
| Stepper | steps, current |

### フィードバック系

| タグ | プロパティ |
|------|----------|
| Alert | message, variant, closable, icon, title |
| Toast | message, variant, position, closable |
| ConfirmDialog | title, message, confirmLabel, cancelLabel |
| EmptyState | title, message, icon, actionLabel |
| Tooltip | content |
| Popover | content |
| Spinner | size |

---

## アプリケーション仕様

### 技術スタック

- **フレームワーク:** Electron + React（デスクトップアプリ）
- **言語:** TypeScript
- **スタイル:** CSS変数 + グローバルCSS

### エディタUI構成

```
┌─────────────────────────────────────────────────────┐
│ タイトルバー  login.ui                  UI Editor   │
├─────────────────────────────────────────────────────┤
│ ツールバー [選択] [移動] | [元に戻す] [やり直す] [保存] │
├──────────────┬──────────────────────┬───────────────┤
│              │                      │               │
│ 左パネル     │    キャンバス         │ プロパティ    │
│ [Components] │    （ビジュアル       │ パネル（右）  │
│ [Tree]       │     プレビュー）      │               │
│              │                      │ <Button>       │
│ ◆ Components │  ┌──────────────┐   │               │
│ LAYOUT       │  │ Screen:login │   │ CONTENT        │
│  VStack      │  │              │   │  label: ログイン│
│  HStack      │  │  ログイン    │   │               │
│  Grid ...    │  │  [input]     │   │ BUTTON         │
│              │  │  [input]     │   │  navigate: home│
│ CONTENT      │  │  [Button] ←─┼───┼─ （選択中）    │
│  Text        │  └──────────────┘   │               │
│  Image ...   │                      │ STYLE          │
│              │                      │  width: 100%  │
│ ◆ Tree       │                      │  color: #3B82F6│
│ ▼ <Screen>   │                      │  radius: 5px  │
│  ▼ <VStack>  │                      │               │
│    <Text>    │                      │               │
│    <Input>   │                      │               │
│    <Button>  │                      │               │
│    <Link>    │                      │               │
└──────────────┴──────────────────────┴───────────────┘
│ ステータスバー  Button を選択中    W:300 H:390  100% │
└─────────────────────────────────────────────────────┘
```

### 各パネルの仕様

#### 左パネル（Components / Tree タブ切替）

「Components」タブと「Tree」タブを切り替え可能。

**Components タブ:**
- カテゴリ別にタグを一覧表示
- 検索フィールドあり
- 各コンポーネントにホバーするとツールチップ表示
  - タグ名（`<Button>`）
  - 日本語説明
  - SVGアニメーションで動作イメージを表示
  - 使用可能なprops一覧

**Tree タブ:**
- コンポーネントの階層構造をツリー表示
- ノードの展開/折りたたみ
- クリックで要素を選択（キャンバスと連動）

#### キャンバス（中央）

- `.ui` ファイルをビジュアルレンダリング
- 要素をクリックで選択（青枠ハイライト）
- ドラッグ&ドロップで要素の追加・移動
- ズームイン/アウト対応

#### プロパティパネル（右）

- 選択中の要素のプロパティをGUIで表示・編集
- CSSの知識不要（独自プロパティ名で表示）
- カラープロパティはカラーピッカーで編集
- 数値プロパティは数値スピナーで編集（下記参照）
- スタイルはセクション分け（SIZE / SPACING / APPEARANCE / BORDER / LAYOUT / SELF / PARENT LAYOUT）
- コンポーネントの種類に応じて関連セクションのみ表示
- パネルにないプロパティは右クリック → 「スタイルを編集」で自由追加

##### 数値スピナー

長さを指定する属性（width, height, padding, margin, gap, radius 等）は、数値スピナーで入力する。

```
radius  [ 8  ▲▼ px ]
width   [ 100 ▲▼ %  ]
```

- 数値入力欄 + ▲▼ボタン + 単位表示
- ▲▼ボタンで1ずつ増減（上限なし）
- テキスト入力で直接数字を書くことも可能
- 単位は右端に常に表示する（px がデフォルト）
- 単位の変更: 単位部分をクリックして `px` / `%` / `em` / `rem` を切り替え
- 単位が不要な属性（opacity, zIndex, grow 等）は単位表示なし

#### ツールバー

- 選択ツール / 移動ツール（SVGアイコン）
- 元に戻す / やり直す（Cmd+Z / Cmd+Shift+Z）
- 保存（Cmd+S）
- 現在のファイル名表示

### デザイン方針

- ライトテーマのみ（ダークテーマは将来対応）
- フラットデザイン（グラデーション・シャドウなし）
- VSCodeライクなコンパクトなUI
- ボーダーとフラット背景色だけで構成

---

## AI連携仕様

### .ui 生成（AIへの指示方法）

エディタとは別にAIへ指示する。システムプロンプトに `.ui` の仕様書とタグ一覧・例を渡すことでAIが `.ui` を生成できる。MCPは現時点では不要。

```
システムプロンプト例:
「あなたはUIの仕様書として .ui ファイルを生成するアシスタントです。
以下のタグ仕様に従って .ui ファイルを出力してください。
[タグ一覧と使用例を記述]」
```

### .ui → コード変換

変換はエディタの責務外。エンジニアが修正済みの `.ui` ファイルを任意のAIに投げてフレームワーク指定でコード生成させる。
DESIGN.md（デザインシステムのプレーンテキスト仕様書）を併用することで、AIがデザインシステムに沿った一貫性のあるコードを生成できる。

```
使用例:
「このlogin.uiをNuxt3 + Tailwind CSSで実装してください」
「このdashboard.uiをReact + shadcn/uiで実装してください」
「このlogin.uiをDESIGN.mdのデザインシステムに従ってReactで実装してください」
```

---

## 開発フェーズ

### Phase 1: コア（実装済み）
- `.ui` パーサー（JSXライク構文の解析）
- キャンバスレンダリング（`.ui` → ビジュアル表示）
- プロパティパネル（クリックで編集）
- `.ui` ファイルの読み書き
- ドラッグ&ドロップでコンポーネント追加
- 要素の移動・削除
- Undo/Redo
- コンポーネントホバーアニメーション
- ツリービュー
- カラーピッカー統合

### Phase 2: エディタ強化（設計済み・未実装）
- レンダラーの属性反映改善（→ renderer-spec.md）
- D&D の兄弟間並び替え・任意位置挿入（→ layout-ops-spec.md）
- SELF / PARENT LAYOUT セクション（→ layout-ops-spec.md）
- 構造編集: Wrap / Unwrap / Duplicate / Copy & Paste / 複数選択（→ structural-editing-spec.md）
- コンポーネント発見: SVGプレビュー全タグ対応 + 説明文充実（→ component-discovery-spec.md）
- 図形系タグ: Rectangle / Ellipse / Line / Arrow / Polygon
- 数値スピナー: スライダー → スピナー + 単位表示に変更
- カスタムスタイル: OTHER セクションに削除ボタン追加

### Phase 3: 将来対応
- ダークテーマ
- MCP連携（AIとのリアルタイム連携）
- DESIGN.md インポート（デザイントークンをプロパティパネルのプリセットとして反映）
