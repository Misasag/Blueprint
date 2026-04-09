import { UINode, ParseResult, ParseError, VALID_TAGS } from './types';

let nextId = 0;
function generateId(): string {
  return `node_${nextId++}`;
}

export function resetIdCounter(): void {
  nextId = 0;
}

/**
 * .ui ファイルの内容をパースして AST を返す
 */
export function parseUI(source: string): ParseResult {
  resetIdCounter();
  const errors: ParseError[] = [];
  const tokens = tokenize(source, errors);
  const nodes = parseTokens(tokens, errors);
  return { nodes, errors };
}

// --- Tokenizer ---

type TokenType =
  | 'OPEN_TAG'      // <Tag
  | 'CLOSE_TAG'     // </Tag>
  | 'SELF_CLOSE'    // />
  | 'TAG_END'       // >
  | 'ATTR_NAME'     // name
  | 'ATTR_VALUE'    // "value"
  | 'EQUALS'        // =
  | 'TEXT'          // テキストコンテンツ
  | 'COMMENT';      // <!-- ... -->

interface Token {
  type: TokenType;
  value: string;
  line: number;
  column: number;
}

function tokenize(source: string, errors: ParseError[]): Token[] {
  const tokens: Token[] = [];
  let pos = 0;
  let line = 1;
  let col = 1;

  function advance(n = 1) {
    for (let i = 0; i < n; i++) {
      if (source[pos] === '\n') {
        line++;
        col = 1;
      } else {
        col++;
      }
      pos++;
    }
  }

  function peek(): string {
    return source[pos] || '';
  }

  function match(str: string): boolean {
    return source.slice(pos, pos + str.length) === str;
  }

  function skipWhitespace() {
    while (pos < source.length && /\s/.test(source[pos])) {
      advance();
    }
  }

  while (pos < source.length) {
    // コメント <!-- ... -->
    if (match('<!--')) {
      const startLine = line;
      const startCol = col;
      advance(4);
      let comment = '';
      while (pos < source.length && !match('-->')) {
        comment += source[pos];
        advance();
      }
      if (match('-->')) {
        advance(3);
      } else {
        errors.push({ message: '閉じられていないコメント', line: startLine, column: startCol });
      }
      tokens.push({ type: 'COMMENT', value: comment.trim(), line: startLine, column: startCol });
      continue;
    }

    // 閉じタグ </Tag>
    if (match('</')) {
      const startLine = line;
      const startCol = col;
      advance(2);
      skipWhitespace();
      let tagName = '';
      while (pos < source.length && /[a-zA-Z0-9_]/.test(source[pos])) {
        tagName += source[pos];
        advance();
      }
      skipWhitespace();
      if (peek() === '>') {
        advance();
      } else {
        errors.push({ message: `閉じタグ </${tagName}> の '>' がありません`, line, column: col });
      }
      tokens.push({ type: 'CLOSE_TAG', value: tagName, line: startLine, column: startCol });
      continue;
    }

    // 開きタグ <Tag (大文字始まり)
    if (peek() === '<' && /[A-Z]/.test(source[pos + 1] || '')) {
      const startLine = line;
      const startCol = col;
      advance(); // skip <
      let tagName = '';
      while (pos < source.length && /[a-zA-Z0-9_]/.test(source[pos])) {
        tagName += source[pos];
        advance();
      }
      tokens.push({ type: 'OPEN_TAG', value: tagName, line: startLine, column: startCol });

      // 属性をパース
      while (pos < source.length) {
        skipWhitespace();

        // 自己閉じ />
        if (match('/>')) {
          tokens.push({ type: 'SELF_CLOSE', value: '/>', line, column: col });
          advance(2);
          break;
        }

        // タグ終了 >
        if (peek() === '>') {
          tokens.push({ type: 'TAG_END', value: '>', line, column: col });
          advance();
          break;
        }

        // 属性名
        if (/[a-zA-Z_]/.test(peek())) {
          const attrLine = line;
          const attrCol = col;
          let attrName = '';
          while (pos < source.length && /[a-zA-Z0-9_\-]/.test(source[pos])) {
            attrName += source[pos];
            advance();
          }
          tokens.push({ type: 'ATTR_NAME', value: attrName, line: attrLine, column: attrCol });

          skipWhitespace();
          if (peek() === '=') {
            tokens.push({ type: 'EQUALS', value: '=', line, column: col });
            advance();
            skipWhitespace();

            // 属性値 "..." or '...'
            if (peek() === '"' || peek() === "'") {
              const quote = peek();
              advance(); // skip opening quote
              const valLine = line;
              const valCol = col;
              let attrValue = '';
              while (pos < source.length && source[pos] !== quote) {
                // バックスラッシュエスケープ対応
                if (source[pos] === '\\' && pos + 1 < source.length) {
                  advance();
                  attrValue += source[pos];
                  advance();
                  continue;
                }
                attrValue += source[pos];
                advance();
              }
              if (peek() === quote) {
                advance(); // skip closing quote
              } else {
                errors.push({ message: `属性値の引用符が閉じられていません`, line: valLine, column: valCol });
              }
              tokens.push({ type: 'ATTR_VALUE', value: attrValue, line: valLine, column: valCol });
            } else if (/[^\s>\/]/.test(peek())) {
              // 引用符なし属性値
              const valLine = line;
              const valCol = col;
              let attrValue = '';
              while (pos < source.length && /[^\s>\/]/.test(source[pos])) {
                attrValue += source[pos];
                advance();
              }
              tokens.push({ type: 'ATTR_VALUE', value: attrValue, line: valLine, column: valCol });
            }
          }
          continue;
        }

        // 不明な文字
        errors.push({ message: `予期しない文字: '${peek()}'`, line, column: col });
        advance();
      }
      continue;
    }

    // 小文字始まりのタグはエラー報告
    if (peek() === '<' && /[a-z]/.test(source[pos + 1] || '')) {
      const startLine = line;
      const startCol = col;
      advance();
      let tagName = '';
      while (pos < source.length && /[a-zA-Z0-9_]/.test(source[pos])) {
        tagName += source[pos];
        advance();
      }
      errors.push({
        message: `タグ名は大文字で始めてください: <${tagName}> → <${tagName.charAt(0).toUpperCase() + tagName.slice(1)}>`,
        line: startLine,
        column: startCol,
      });
      // タグ全体をスキップ
      while (pos < source.length && source[pos] !== '>') advance();
      if (peek() === '>') advance();
      continue;
    }

    // テキストコンテンツ
    if (peek() !== '<') {
      const startLine = line;
      const startCol = col;
      let text = '';
      while (pos < source.length && source[pos] !== '<') {
        text += source[pos];
        advance();
      }
      const trimmed = text.trim();
      if (trimmed) {
        tokens.push({ type: 'TEXT', value: unescapeTextContent(trimmed), line: startLine, column: startCol });
      }
      continue;
    }

    // それ以外の '<' はスキップ
    advance();
  }

  return tokens;
}

// --- Parser ---

function parseTokens(tokens: Token[], errors: ParseError[]): UINode[] {
  let pos = 0;

  function current(): Token | undefined {
    return tokens[pos];
  }

  function consume(type?: TokenType): Token | undefined {
    const tok = tokens[pos];
    if (type && tok?.type !== type) return undefined;
    pos++;
    return tok;
  }

  function parseNode(): UINode | null {
    // コメントをループでスキップ（再帰ではなくスタックオーバーフロー防止）
    while (current()?.type === 'COMMENT') {
      consume();
    }

    const tok = current();
    if (!tok) return null;

    if (tok.type !== 'OPEN_TAG') {
      return null;
    }

    const tagName = tok.value;
    consume(); // OPEN_TAG

    // タグの有効性チェック
    if (!VALID_TAGS.includes(tagName as any)) {
      errors.push({ message: `不明なタグ: <${tagName}>`, line: tok.line, column: tok.column });
    }

    // 属性をパース
    const props: Record<string, string> = {};
    while (current() && current()!.type === 'ATTR_NAME') {
      const nameToken = consume('ATTR_NAME')!;
      if (current()?.type === 'EQUALS') {
        consume('EQUALS');
        const valToken = consume('ATTR_VALUE');
        props[nameToken.value] = valToken?.value ?? '';
      } else {
        // boolean属性 (例: disabled)
        props[nameToken.value] = 'true';
      }
    }

    // 自己閉じタグ
    if (current()?.type === 'SELF_CLOSE') {
      consume();
      return {
        id: generateId(),
        tag: tagName,
        props,
        children: [],
      };
    }

    // タグ終了 >
    consume('TAG_END');

    // 子要素とテキストコンテンツ
    const children: UINode[] = [];
    const textParts: string[] = [];

    while (current()) {
      if (current()!.type === 'CLOSE_TAG') {
        break;
      }

      if (current()!.type === 'TEXT') {
        textParts.push(current()!.value);
        consume();
        continue;
      }

      if (current()!.type === 'COMMENT') {
        consume();
        continue;
      }

      const child = parseNode();
      if (child) {
        children.push(child);
      } else {
        break;
      }
    }

    // 閉じタグ
    if (current()?.type === 'CLOSE_TAG') {
      if (current()!.value !== tagName) {
        errors.push({
          message: `タグの不一致: <${tagName}> に対して </${current()!.value}> で閉じています`,
          line: current()!.line,
          column: current()!.column,
        });
      }
      consume();
    } else {
      errors.push({
        message: `閉じタグ </${tagName}> がありません`,
        line: tok.line,
        column: tok.column,
      });
    }

    const node: UINode = {
      id: generateId(),
      tag: tagName,
      props,
      children,
    };
    // テキストパーツを連結
    if (textParts.length > 0) {
      node.textContent = textParts.join(' ');
    }
    return node;
  }

  const nodes: UINode[] = [];
  while (pos < tokens.length) {
    if (current()?.type === 'COMMENT') {
      consume();
      continue;
    }
    const node = parseNode();
    if (node) {
      nodes.push(node);
    } else {
      pos++; // 無限ループ防止
    }
  }

  return nodes;
}

/** 属性値内の特殊文字をエスケープ */
function escapeAttrValue(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r');
}

/** テキストコンテンツ内の < > をエスケープ */
function escapeTextContent(text: string): string {
  return text.replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/** エスケープされたテキストを復元 */
function unescapeTextContent(text: string): string {
  return text.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
}

/**
 * AST を .ui フォーマットの文字列にシリアライズする
 */
export function serializeUI(nodes: UINode[], indent = 0): string {
  const pad = '  '.repeat(indent);
  let result = '';

  for (const node of nodes) {
    const propsStr = Object.entries(node.props)
      .map(([k, v]) => `${k}="${escapeAttrValue(v)}"`)
      .join(' ');
    const opening = propsStr ? `${node.tag} ${propsStr}` : node.tag;

    if (node.children.length === 0 && !node.textContent) {
      result += `${pad}<${opening} />\n`;
    } else if (node.children.length === 0 && node.textContent) {
      result += `${pad}<${opening}>${escapeTextContent(node.textContent)}</${node.tag}>\n`;
    } else {
      result += `${pad}<${opening}>\n`;
      if (node.textContent) {
        result += `${pad}  ${escapeTextContent(node.textContent)}\n`;
      }
      result += serializeUI(node.children, indent + 1);
      result += `${pad}</${node.tag}>\n`;
    }
  }

  return result;
}
