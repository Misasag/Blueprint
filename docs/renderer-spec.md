# レンダラー仕様書

## 原則

**エンジニアが `.ui` で指定した属性は、全てキャンバス上の見た目に反映する。**

- 属性の値を変更したら、キャンバスの見た目が必ず変わること
- `.ui` に書かれていない部分（デフォルトスタイル）はニュートラルで見やすいデザインにする
- 特定のフレームワークの見た目を再現する必要はない

## 制約事項

以下はエディタの構造上の制約であり、対応しない。

| 属性 | 理由 |
|------|------|
| Image の src（実画像表示） | エディタはプロジェクトのファイルシステムを参照できない。ファイル名のテキスト表示で代替する |
| Toast の position（実際の配置） | コンポーネントはツリー構造でインライン描画されるため、画面の特定位置に配置できない |
| Modal の open="false"（非表示） | 非表示にすると編集できなくなる。常に表示する |
| Carousel の autoplay / interval | アニメーション再生の挙動であり、静的プレビューでは表現できない |
| Accordion の multiple | 複数同時展開の可否はユーザー操作時の挙動であり、静的プレビューでは表現できない |

---

## 共通仕様

### variant カラースキーム

`variant` の取りうる値は `success`, `error`, `warning`, `info` の4種。これ以外の値が指定された場合は default（未指定）と同じ扱いにする。

**インライン系（Alert, Badge, Tag）** — コンテンツ内に埋め込まれるため、淡い背景 + 濃い文字で周囲と馴染む配色。

| variant | 背景色 | 文字色 | ボーダー色 |
|---------|--------|--------|-----------|
| success | #ecfdf5 | #065f46 | #6ee7b7 |
| error | #fef2f2 | #991b1b | #fca5a5 |
| warning | #fffbeb | #92400e | #fcd34d |
| info | #eff6ff | #1e40af | #93c5fd |
| default（未指定） | コンポーネントごとの既定色 | | |

**オーバーレイ系（Toast）** — コンテンツの上に浮かぶため、濃い背景 + 白文字で視認性を確保する配色。

| variant | 背景色 | 文字色 |
|---------|--------|--------|
| success | #065f46 | #fff |
| error | #991b1b | #fff |
| warning | #92400e | #fff |
| info | #1e40af | #fff |
| default（未指定） | #333 | #fff |

### disabled 共通表現

`disabled` 属性を持つコンポーネント（Button, Input, Textarea, Select, Checkbox, Radio, Toggle）は、以下を共通適用する。

※ Textarea, Select の `disabled` は spec.md の TAG_PROPS に追加済み。

```
opacity: 0.5
cursor: not-allowed
pointerEvents: none（操作を視覚的に無効に見せる）
```

### closable 共通表現

`closable` 属性を持つコンポーネント（Alert, Toast, Tag）は、右端に `✕` ボタンを表示する。

```
closable="true" の場合:
  右端に ✕ を表示
  ✕ の色はコンポーネントの文字色と同じ
```

---

## 入力系

### Button

```
variant:
  省略 / "filled"  → 背景: color属性の値、文字: 白
  "outlined"       → 背景: 透明、枠線: color属性の値、文字: color属性の値
  "ghost"          → 背景: 透明、枠線: なし、文字: color属性の値
  "text"           → 背景: 透明、枠線: なし、文字: color属性の値、padding小さめ

disabled:
  共通の disabled 表現を適用
```

### Input

```
value:
  指定あり → フィールド内にテキストとして表示する
  指定なし → placeholder を表示

disabled:
  背景: var(--bg-tertiary)
  共通の disabled 表現を適用
```

### Textarea

```
value:
  指定あり → textarea 内にテキストとして表示する

maxLength:
  指定あり → 右下に「{valueの文字数}/{maxLength}」を小さく表示する
  例: "12/100"

disabled:
  共通の disabled 表現を適用
```

### Select

```
value:
  指定あり → value のテキストを選択済みとして表示する
  指定なし → placeholder を表示

searchable:
  "true" → 左端に虫眼鏡アイコン（🔍 or SVG）を表示

disabled:
  共通の disabled 表現を適用
```

### Checkbox

```
disabled:
  共通の disabled 表現を適用

indeterminate:
  "true" → チェックマークの代わりに「−」（横棒）を表示
  チェックボックスの背景: var(--accent)
```

### Radio

```
disabled:
  共通の disabled 表現を適用
```

### Toggle

```
disabled:
  共通の disabled 表現を適用

size:
  "small"  → トグル幅: 28px、高さ: 16px、つまみ: 12px
  省略      → トグル幅: 36px、高さ: 20px、つまみ: 16px（現行）
  "large"  → トグル幅: 48px、高さ: 26px、つまみ: 22px
```

### Slider

```
step:
  input[type=range] の step 属性に渡す

label:
  指定あり → スライダーの上にラベルテキストを表示

showValue:
  "true" / 省略 → 右端に値を表示（現行動作）
  "false"        → 値を非表示
```

### DatePicker

```
value:
  指定あり → input の value として日付を表示
```

### FileUpload

```
accept:
  指定あり → ラベルの下に小さく許可形式を表示
  例: accept="image/*" → 「対応形式: image/*」
```

### Autocomplete

```
SearchBar と視覚的に区別するため:
  常に右端にドロップダウン矢印（▼）を表示（options の有無に関わらず）
  options 指定あり → 矢印の横に選択肢数を小さく表示
  例: options="React,Vue,Angular" → 「▼ 3件」
  options 未指定   → 「▼」のみ表示
```

### OTPInput

```
placeholder:
  指定あり → 空のボックスに placeholder 文字を薄く表示
  指定なし → 空のボックスは空のまま（現行の "•" は削除）
```

### Link

```
href:
  指定あり → テキストの下に小さく URL を表示（色: var(--text-secondary)、フォントサイズ: 10px）
```

---

## 図形系

### Rectangle

```
width, height:
  共通プロパティ（buildStyle）で処理される
  指定なし → width: 200px, height: 100px

radius:
  共通プロパティで処理される（角丸）

background, border:
  共通プロパティで処理される
```

### Ellipse

```
width, height:
  共通プロパティで処理される
  指定なし → width: 48px, height: 48px
  width = height → 正円

常に borderRadius: 50% を適用する。
background, border は共通プロパティで処理される。
```

### Line

```
length:
  指定あり → direction に応じて width または height に設定
  指定なし → 100px

direction:
  "horizontal"（省略時） → 横線。width: {length}, height: 0, borderTop: {strokeWidth}px solid {stroke}
  "vertical"             → 縦線。width: 0, height: {length}, borderLeft: {strokeWidth}px solid {stroke}

stroke:
  線の色。指定なし → var(--border-color)

strokeWidth:
  線の太さ。指定なし → 1
```

### Arrow

```
Line と同じ属性（length, direction, stroke, strokeWidth）に加えて、
終端に三角形の矢印を表示する。

矢印の表示:
  direction="right"  → 右端に ▶（三角形）
  direction="left"   → 左端に ◀
  direction="down"   → 下端に ▼
  direction="up"     → 上端に ▲
  省略               → "right"

矢印のサイズ: strokeWidth の 3 倍
矢印の色: stroke と同じ
```

### Polygon

```
sides:
  辺の数。指定なし → 3（三角形）
  例: sides="3" → 三角形、sides="5" → 五角形、sides="6" → 六角形

size:
  外接円の直径。指定なし → 48px

描画方法: CSS clip-path で正多角形を描画する。
  例: sides="3" → clip-path: polygon(50% 0%, 0% 100%, 100% 100%)
  例: sides="6" → clip-path で正六角形の座標を計算

background, border は共通プロパティで処理される。
```

---

## コンテンツ系

### Text

```
decoration:
  "underline"     → textDecoration: underline
  "line-through"  → textDecoration: line-through
  "overline"      → textDecoration: overline

transform:
  "uppercase"   → textTransform: uppercase
  "lowercase"   → textTransform: lowercase
  "capitalize"  → textTransform: capitalize

truncate:
  "true" → overflow: hidden, textOverflow: ellipsis, whiteSpace: nowrap

maxLines:
  数値指定 → display: -webkit-box, -webkit-line-clamp: {値}, -webkit-box-orient: vertical, overflow: hidden
```

### Image

制約事項により実画像は表示できない。プレースホルダー表示のみ。

```
src:
  指定あり → グレーの箱の中にファイル名を表示
  例: src="photo.png" → 箱内に「photo.png」
  指定なし → 箱内に「Image」（現行）
```

### Divider

```
direction:
  "vertical" → 横線ではなく縦線で表示
    width: {thickness}px（デフォルト1px）
    height: 100%
    borderTop: none
    borderLeft: {thickness}px solid var(--border-color)
    margin: 0 8px
```

### Avatar

```
src:
  指定あり → イニシャルの代わりに「🖼」を表示（画像がある意図を示す）
  指定なし → イニシャル表示（現行）

status:
  "online"  → 右下に緑色の丸（直径: Avatarサイズの25%）
  "offline" → 右下に灰色の丸
  "busy"    → 右下に赤色の丸
  "away"    → 右下に黄色の丸
  丸の位置: 右下、Avatar本体に重なる形で配置
  丸のボーダー: 2px solid white（背景から浮かせる）
```

### Badge

```
variant:
  共通の variant カラースキームを適用
  "success" → 緑背景
  "error"   → 赤背景
  "warning" → 黄背景
  "info"    → 青背景
  省略      → var(--accent) 背景（現行）

dot:
  "true" → ラベルテキストを非表示にし、小さな丸（8x8px）のみ表示
```

### Tag

```
variant:
  共通の variant カラースキームを適用（Badge と同じ配色）

closable:
  "true" → ラベルの右に ✕ を表示（フォントサイズ: 10px）
```

### ProgressBar

```
label:
  指定あり → バーの上にラベルテキストを表示

showPercent:
  "true" → バーの右に「{value/max*100}%」を表示
```

### Chart

```
type:
  "bar"  → 棒グラフ（現行のまま）
  "line" → 折れ線グラフ風の表示（SVG path で山形の線）
  "pie"  → 円グラフ風の表示（SVG で3色に分割した円）
  省略   → "bar" と同じ

title:
  指定あり → チャート上部にタイトルテキスト（fontWeight: 600）

legend:
  "true" → チャート下部に凡例（色の四角 + ラベル）を表示
```

---

## レイアウト系

### Screen

```
name:
  指定あり → Screen 上部に画面名ラベルを表示
  表示: 背景 var(--bg-secondary)、padding 4px 12px、fontSize 11px、color var(--text-secondary)
  例: name="login" → 「login」とラベル表示
```

### Grid

```
rows:
  指定あり → gridTemplateRows を設定
  例: rows="2" → gridTemplateRows: repeat(2, 1fr)
```

### Box

```
align:
  指定あり → display: flex, alignItems: {値}

justify:
  指定あり → display: flex, justifyContent: {値}

※ align または justify のいずれかが指定された場合に display: flex を適用
```

### ScrollView

```
direction:
  "horizontal" → overflowX: auto, overflowY: hidden
  "vertical"   → overflowX: hidden, overflowY: auto
  省略          → overflow: auto（現行）
```

### SplitScreen

```
ratio:
  指定あり → 子要素の flex 比率に反映
  例: ratio="1:2" → 1番目の子: flex 1、2番目の子: flex 2
  例: ratio="3:1" → 1番目の子: flex 3、2番目の子: flex 1
  指定なし → 均等（現行）
```

### BentoGrid

```
rows:
  指定あり → gridTemplateRows を設定（Grid と同じ）
```

---

## ナビゲーション系

### Navbar

```
items:
  指定あり → タイトルの右にメニュー項目を横並びで表示
  例: items="Home,About,Contact"
  → [Home] [About] [Contact] をリンク風に表示（fontSize: 13px、gap: 16px）

logo:
  指定あり → タイトルの左に「🖼」プレースホルダーを表示

sticky:
  "true" → ラベル「sticky」を右端に小さく表示（視覚的インジケーター）
```

### Sidebar

```
items:
  指定あり → カンマ区切りのメニュー項目をリスト表示
  各項目: padding 8px 12px、fontSize 13px、hover風スタイルなし
  collapsed="true" の場合 → 項目の先頭1文字のみ表示

width:
  指定あり → width に反映（現行の固定 200px/48px を上書き）
  collapsed="true" の場合 → width は無視して 48px
```

### Pagination

```
total + pageSize:
  ページ数 = ceil(total / pageSize)
  ←  [1] [2] [3] ... [n]  → のようにページ番号を表示
  current に該当するページ番号をアクティブスタイル（背景: accent）
  5ページ以下 → 全て表示
  6ページ以上 → 最初2つ + ... + 最後2つ を表示

total のみ指定:
  pageSize=10 として計算

どちらも未指定:
  ← [1] → のみ表示（現行相当）
```

### Tabs

```
variant:
  省略 / "underline" → 下線スタイル（現行）
  "pills"            → アクティブタブに背景色（accent）+ borderRadius: 20px、下線なし
  "outlined"         → 全タブにボーダー、アクティブタブの背景: white
```

### AppBar

```
back:
  "true" → タイトルの左に「←」ボタンを表示

actions:
  指定あり → カンマ区切りのアクション名を右端にボタン風で表示
  例: actions="検索,メニュー" → 右端に [検索] [メニュー]
  表示: fontSize 12px、padding 4px 8px
```

---

## 複合コンポーネント系

### Card

```
variant:
  省略 / "outlined" → border: 1px solid（現行）
  "elevated"        → border なし、boxShadow: 0 2px 8px rgba(0,0,0,0.1)
  "filled"          → border なし、background: var(--bg-secondary)
```

### Modal

制約事項により open="false" でも常に表示する。変更なし。

### Table

```
rows:
  shortcut props モード時:
  指定あり → カンマ区切りで行数分のデータ行を表示
  例: rows="3" → 3行の空データ行（「—」セル）を表示
  指定なし → 1行のみ（現行）
```

### Accordion

```
defaultOpen:
  指定あり → 該当インデックスのアイテムを展開状態で表示
  展開状態: ▶ → ▼ に変更、下にコンテンツ領域（高さ 40px、背景 var(--bg-secondary)）を表示
  例: defaultOpen="0" → 最初のアイテムが展開
```

### Carousel

```
items:
  指定あり → 最初のアイテム名をスライド内に表示
  例: items="画像1,画像2,画像3" → 中央に「画像1」
  dots の数も items の数に連動
  指定なし → "Slide 1" + dots 3個（現行）
```

### PricingTable

```
columns:
  指定あり → 各プランの下に機能行を表示
  例: columns="5GB,50GB,無制限"
  → 各プランカード内に対応する値を1行表示
```

### ConfirmDialog

```
confirmLabel:
  指定あり → OK ボタンのテキストを置き換え
  例: confirmLabel="削除する" → [削除する]

cancelLabel:
  指定あり → キャンセルボタンのテキストを置き換え
```

### EmptyState

```
actionLabel:
  指定あり → メッセージの下にアクションボタンを表示
  表示: 背景 var(--accent)、色 #fff、borderRadius 4px、padding 8px 16px
```

---

## フィードバック系

### Alert

```
variant:
  共通の variant カラースキームを適用
  背景色、文字色、左ボーダー（4px solid ボーダー色）を設定
  例: variant="error" → 赤背景 + 赤い左ボーダー

title:
  指定あり → message の上にタイトルを太字で表示

icon:
  指定あり → 左端にアイコンテキストを表示

closable:
  共通の closable 表現を適用
```

### Toast

```
variant:
  "success" → 背景 #065f46、文字 白
  "error"   → 背景 #991b1b、文字 白
  "warning" → 背景 #92400e、文字 白
  "info"    → 背景 #1e40af、文字 白
  省略      → 背景 #333（現行）

closable:
  共通の closable 表現を適用
```

※ position は制約事項により対応しない。
