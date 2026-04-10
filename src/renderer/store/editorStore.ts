import { useReducer, useCallback, useMemo } from 'react';
import { UINode, ParseError, parseUI, serializeUI } from '../../parser';
import {
  updateNodeInTree, findNodeById, findParentNode,
  removeNodeFromTree, removeNodesFromTree, isDescendant, collectIds,
  defaultPropsForTag, defaultChildrenForTag, deepCloneNode, insertNodeAt,
} from './treeUtils';
import { LEAF_TAGS } from '../components/canvas/utils';

export interface EditorState {
  nodes: UINode[];
  selectedNodeIds: string[];
  filePath: string | null;
  fileName: string;
  source: string;
  parseErrors: ParseError[];
  savedHistoryIndex: number;
  clipboard: UINode[] | null;
}

interface HistoryEntry {
  nodes: UINode[];
  source: string;
  selectedNodeIds: string[];
}

interface EditorReducerState {
  current: EditorState;
  past: HistoryEntry[];
  future: HistoryEntry[];
}

type Action =
  | { type: 'SELECT'; nodeId: string | null }
  | { type: 'SELECT_ADD'; nodeId: string }
  | { type: 'UPDATE_PROP'; nodeId: string; propName: string; value: string }
  | { type: 'UPDATE_TEXT'; nodeId: string; text: string }
  | { type: 'ADD_NODE'; tag: string; parentId: string | null; index?: number; meta?: Record<string, number> }
  | { type: 'DELETE_NODE'; nodeId: string }
  | { type: 'DELETE_SELECTED' }
  | { type: 'MOVE_NODE'; nodeId: string; targetParentId: string | null; targetIndex: number }
  | { type: 'WRAP_NODES'; nodeIds: string[]; containerTag: string }
  | { type: 'UNWRAP_NODE'; nodeId: string }
  | { type: 'DUPLICATE_NODES'; nodeIds: string[] }
  | { type: 'MOVE_OUT'; nodeId: string }
  | { type: 'COPY'; nodeIds: string[] }
  | { type: 'CUT'; nodeIds: string[] }
  | { type: 'EXPAND_SHORTCUT'; nodeId: string }
  | { type: 'PASTE' }
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'LOAD'; source: string; filePath?: string }
  | { type: 'MARK_SAVED'; filePath?: string };

const SAMPLE_UI = `<Screen name="login">
  <VStack gap="16" padding="24">
    <Text size="24" weight="bold">ログイン</Text>
    <Input placeholder="メールアドレス" width="100%" />
    <Input placeholder="パスワード" type="password" width="100%" />
    <Button label="ログイン" color="#3B82F6" radius="8" width="100%" navigate="home" />
    <Link label="パスワードを忘れた方" navigate="reset" />
  </VStack>
</Screen>`;

const MAX_HISTORY = 100;

let dynamicIdCounter = 0;
function generateDynamicId(): string {
  return `dyn_${Date.now()}_${dynamicIdCounter++}`;
}

function snapshot(s: EditorState): HistoryEntry {
  return { nodes: s.nodes, source: s.source, selectedNodeIds: s.selectedNodeIds };
}

function withHistory(state: EditorReducerState, nextCurrent: EditorState): EditorReducerState {
  const past = [...state.past, snapshot(state.current)];
  let trimmedPast = past;
  let savedIdx = nextCurrent.savedHistoryIndex;
  if (past.length > MAX_HISTORY) {
    const drop = past.length - MAX_HISTORY;
    trimmedPast = past.slice(drop);
    savedIdx = savedIdx >= 0 ? savedIdx - drop : savedIdx;
  }
  return {
    current: { ...nextCurrent, savedHistoryIndex: savedIdx },
    past: trimmedPast,
    future: [],
  };
}

/** 共通: ノード変更後の状態を作る */
function withNewNodes(state: EditorReducerState, newNodes: UINode[], selectedNodeIds?: string[]): EditorReducerState {
  const cur = state.current;
  return withHistory(state, {
    ...cur,
    nodes: newNodes,
    source: serializeUI(newNodes),
    parseErrors: [],
    selectedNodeIds: selectedNodeIds ?? cur.selectedNodeIds,
  });
}

function reducer(state: EditorReducerState, action: Action): EditorReducerState {
  const cur = state.current;

  switch (action.type) {
    case 'SELECT':
      if (action.nodeId === null) {
        if (cur.selectedNodeIds.length === 0) return state;
        return { ...state, current: { ...cur, selectedNodeIds: [] } };
      }
      if (cur.selectedNodeIds.length === 1 && cur.selectedNodeIds[0] === action.nodeId) return state;
      return { ...state, current: { ...cur, selectedNodeIds: [action.nodeId] } };

    case 'SELECT_ADD': {
      const idx = cur.selectedNodeIds.indexOf(action.nodeId);
      if (idx >= 0) {
        // 既に選択済み → 解除
        const next = [...cur.selectedNodeIds];
        next.splice(idx, 1);
        return { ...state, current: { ...cur, selectedNodeIds: next } };
      }
      // 同じ親の兄弟のみ選択可能
      if (cur.selectedNodeIds.length > 0) {
        const firstParent = findParentNode(cur.nodes, cur.selectedNodeIds[0]);
        const newParent = findParentNode(cur.nodes, action.nodeId);
        const firstParentId = firstParent?.id ?? null;
        const newParentId = newParent?.id ?? null;
        if (firstParentId !== newParentId) {
          // 異なる親 → 新しい要素のみ選択
          return { ...state, current: { ...cur, selectedNodeIds: [action.nodeId] } };
        }
      }
      return { ...state, current: { ...cur, selectedNodeIds: [...cur.selectedNodeIds, action.nodeId] } };
    }

    case 'UPDATE_PROP': {
      const newNodes = updateNodeInTree(cur.nodes, action.nodeId, node => {
        if (action.value === '') {
          const { [action.propName]: _, ...rest } = node.props;
          return { ...node, props: rest };
        }
        return { ...node, props: { ...node.props, [action.propName]: action.value } };
      });
      if (newNodes === cur.nodes) return state;
      return withHistory(state, { ...cur, nodes: newNodes, source: serializeUI(newNodes), parseErrors: [] });
    }

    case 'UPDATE_TEXT': {
      const newNodes = updateNodeInTree(cur.nodes, action.nodeId, node => ({ ...node, textContent: action.text }));
      if (newNodes === cur.nodes) return state;
      return withHistory(state, { ...cur, nodes: newNodes, source: serializeUI(newNodes), parseErrors: [] });
    }

    case 'ADD_NODE': {
      let defaultChildren = defaultChildrenForTag(action.tag);
      // TableRow の列数カスタマイズ
      if (action.tag === 'TableRow' && action.meta?.colCount) {
        const colCount = action.meta.colCount;
        defaultChildren = Array.from({ length: colCount }, (_, i) => ({
          id: '', tag: 'TableCell', props: {}, children: [], textContent: `データ${i + 1}`,
        }));
      }
      const assignIds = (nodes: UINode[]): UINode[] =>
        nodes.map(n => ({ ...n, id: generateDynamicId(), children: assignIds(n.children) }));
      const newNode: UINode = {
        id: generateDynamicId(),
        tag: action.tag,
        props: defaultPropsForTag(action.tag),
        children: assignIds(defaultChildren),
      };
      const newNodes = insertNodeAt(cur.nodes, action.parentId, action.index ?? (action.parentId === null ? cur.nodes.length : Infinity), [newNode]);
      return withNewNodes(state, newNodes, [newNode.id]);
    }

    case 'DELETE_NODE': {
      const target = findNodeById(cur.nodes, action.nodeId);
      if (!target) return state;
      const removedIds = collectIds(target);
      const newNodes = removeNodeFromTree(cur.nodes, action.nodeId);
      if (newNodes === cur.nodes) return state;
      const newSelected = cur.selectedNodeIds.filter(id => !removedIds.has(id));
      return withNewNodes(state, newNodes, newSelected);
    }

    case 'DELETE_SELECTED': {
      if (cur.selectedNodeIds.length === 0) return state;
      const newNodes = removeNodesFromTree(cur.nodes, new Set(cur.selectedNodeIds));
      return withNewNodes(state, newNodes, []);
    }

    case 'MOVE_NODE': {
      const node = findNodeById(cur.nodes, action.nodeId);
      if (!node) return state;
      if (action.targetParentId && isDescendant(node, action.targetParentId)) return state;
      const without = removeNodeFromTree(cur.nodes, action.nodeId);
      const newNodes = insertNodeAt(without, action.targetParentId, action.targetIndex, [node]);
      return withNewNodes(state, newNodes);
    }

    case 'WRAP_NODES': {
      if (action.nodeIds.length === 0) return state;
      const parent = findParentNode(cur.nodes, action.nodeIds[0]);
      const parentId = parent?.id ?? null;
      const siblings = parent ? parent.children : cur.nodes;
      const selectedSet = new Set(action.nodeIds);
      const indices = siblings.map((c, i) => selectedSet.has(c.id) ? i : -1).filter(i => i >= 0);
      if (indices.length === 0) return state;
      const minIdx = indices[0];
      const maxIdx = indices[indices.length - 1];
      // 連続範囲内の全ノードを囲む（間にある未選択ノードも含める）
      const nodesToWrap = siblings.slice(minIdx, maxIdx + 1);
      // 囲むノードのIDセットを更新（間のノードも含む）
      const wrapIds = new Set(nodesToWrap.map(n => n.id));
      // ツリーから囲むノードを削除
      let newNodes = removeNodesFromTree(cur.nodes, wrapIds);
      // 新しいコンテナを作成
      const container: UINode = {
        id: generateDynamicId(),
        tag: action.containerTag,
        props: defaultPropsForTag(action.containerTag),
        children: nodesToWrap,
      };
      // コンテナを元の位置に挿入
      newNodes = insertNodeAt(newNodes, parentId, minIdx, [container]);
      return withNewNodes(state, newNodes, [container.id]);
    }

    case 'UNWRAP_NODE': {
      const node = findNodeById(cur.nodes, action.nodeId);
      if (!node || node.children.length === 0) return state;
      const parent = findParentNode(cur.nodes, action.nodeId);
      if (!parent) return state; // ルートは unwrap 不可
      const parentId = parent.id;
      const idx = parent.children.findIndex(c => c.id === action.nodeId);
      const childrenToPromote = [...node.children];
      // コンテナを削除
      let newNodes = removeNodeFromTree(cur.nodes, action.nodeId);
      // 子を元の位置に挿入
      newNodes = insertNodeAt(newNodes, parentId, idx, childrenToPromote);
      return withNewNodes(state, newNodes, [childrenToPromote[0].id]);
    }

    case 'DUPLICATE_NODES': {
      if (action.nodeIds.length === 0) return state;
      const parent = findParentNode(cur.nodes, action.nodeIds[0]);
      const parentId = parent?.id ?? null;
      const siblings = parent ? parent.children : cur.nodes;
      const selectedSet = new Set(action.nodeIds);
      // ドキュメント順でソート
      const sortedIds = siblings.filter(c => selectedSet.has(c.id)).map(c => c.id);
      const lastIdx = siblings.findIndex(c => c.id === sortedIds[sortedIds.length - 1]);
      if (lastIdx < 0) return state;
      const clones = sortedIds
        .map(id => findNodeById(cur.nodes, id))
        .filter((n): n is UINode => n !== null)
        .map(n => deepCloneNode(n, generateDynamicId));
      const newNodes = insertNodeAt(cur.nodes, parentId, lastIdx + 1, clones);
      return withNewNodes(state, newNodes, clones.map(c => c.id));
    }

    case 'MOVE_OUT': {
      const node = findNodeById(cur.nodes, action.nodeId);
      if (!node) return state;
      const parent = findParentNode(cur.nodes, action.nodeId);
      if (!parent) return state; // ルート直下は move out 不可
      const grandParent = findParentNode(cur.nodes, parent.id);
      const grandParentId = grandParent?.id ?? null;
      const childIdx = parent.children.findIndex(c => c.id === action.nodeId);
      const parentSiblings = grandParent ? grandParent.children : cur.nodes;
      const parentIdx = parentSiblings.findIndex(c => c.id === parent.id);
      // 挿入位置: 最初の子→親の前、それ以外→親の後
      const insertIdx = childIdx === 0 ? parentIdx : parentIdx + 1;
      // ノードを親から削除
      let newNodes = removeNodeFromTree(cur.nodes, action.nodeId);
      // 新しい位置に挿入
      newNodes = insertNodeAt(newNodes, grandParentId, insertIdx, [node]);
      return withNewNodes(state, newNodes, [action.nodeId]);
    }

    case 'COPY': {
      if (action.nodeIds.length === 0) return state;
      const nodesToCopy = action.nodeIds
        .map(id => findNodeById(cur.nodes, id))
        .filter((n): n is UINode => n !== null);
      return { ...state, current: { ...cur, clipboard: nodesToCopy } };
    }

    case 'CUT': {
      if (action.nodeIds.length === 0) return state;
      const nodesToCut = action.nodeIds
        .map(id => findNodeById(cur.nodes, id))
        .filter((n): n is UINode => n !== null);
      const newNodes = removeNodesFromTree(cur.nodes, new Set(action.nodeIds));
      return withHistory(state, {
        ...cur,
        nodes: newNodes,
        source: serializeUI(newNodes),
        parseErrors: [],
        selectedNodeIds: [],
        clipboard: nodesToCut,
      });
    }

    case 'PASTE': {
      if (!cur.clipboard || cur.clipboard.length === 0) return state;
      const clones = cur.clipboard.map(n => deepCloneNode(n, generateDynamicId));
      let parentId: string | null = null;
      let insertIdx: number;
      if (cur.selectedNodeIds.length === 0) {
        // 何も選択していない → ルート末尾
        insertIdx = cur.nodes.length;
      } else {
        const lastSelectedId = cur.selectedNodeIds[cur.selectedNodeIds.length - 1];
        const lastSelected = findNodeById(cur.nodes, lastSelectedId);
        if (lastSelected && lastSelected.children !== undefined && lastSelected.children.length >= 0) {
          // コンテナの場合は子の末尾に
          // リーフ判定: TAG_PROPS で子を持てるかどうかはレンダラーの責務なので、ここでは children 配列で判断
          const isLeafLike = LEAF_TAGS.has(lastSelected.tag);
          if (isLeafLike) {
            // リーフの直後に兄弟として挿入
            const parent = findParentNode(cur.nodes, lastSelectedId);
            parentId = parent?.id ?? null;
            const siblings = parent ? parent.children : cur.nodes;
            insertIdx = siblings.findIndex(c => c.id === lastSelectedId) + 1;
          } else {
            parentId = lastSelectedId;
            insertIdx = lastSelected.children.length;
          }
        } else {
          insertIdx = cur.nodes.length;
        }
      }
      const newNodes = insertNodeAt(cur.nodes, parentId, insertIdx, clones);
      return withNewNodes(state, newNodes, clones.map(c => c.id));
    }

    case 'UNDO': {
      if (state.past.length === 0) return state;
      const last = state.past[state.past.length - 1];
      return {
        current: {
          ...cur,
          nodes: last.nodes,
          source: last.source,
          selectedNodeIds: last.selectedNodeIds,
          parseErrors: [],
        },
        past: state.past.slice(0, -1),
        future: [...state.future, snapshot(cur)],
      };
    }

    case 'REDO': {
      if (state.future.length === 0) return state;
      const next = state.future[state.future.length - 1];
      return {
        current: {
          ...cur,
          nodes: next.nodes,
          source: next.source,
          selectedNodeIds: next.selectedNodeIds,
          parseErrors: [],
        },
        past: [...state.past, snapshot(cur)],
        future: state.future.slice(0, -1),
      };
    }

    case 'LOAD': {
      const result = parseUI(action.source);
      const fileName = action.filePath
        ? (action.filePath.split(/[\\/]/).pop() || 'untitled.ui')
        : 'untitled.ui';
      return {
        current: {
          nodes: result.nodes,
          selectedNodeIds: [],
          filePath: action.filePath ?? null,
          fileName,
          source: action.source,
          parseErrors: result.errors,
          savedHistoryIndex: 0,
          clipboard: cur.clipboard,
        },
        past: [],
        future: [],
      };
    }

    case 'MARK_SAVED': {
      const fileName = action.filePath
        ? (action.filePath.split(/[\\/]/).pop() || cur.fileName)
        : cur.fileName;
      return {
        ...state,
        current: {
          ...cur,
          filePath: action.filePath ?? cur.filePath,
          fileName,
          savedHistoryIndex: state.past.length,
        },
      };
    }

    default:
      return state;
  }
}

const initialState = (): EditorReducerState => {
  const result = parseUI(SAMPLE_UI);
  return {
    current: {
      nodes: result.nodes,
      selectedNodeIds: [],
      filePath: null,
      fileName: 'untitled.ui',
      source: SAMPLE_UI,
      parseErrors: result.errors,
      savedHistoryIndex: 0,
      clipboard: null,
    },
    past: [],
    future: [],
  };
};

export function useEditorStore() {
  const [reducerState, dispatch] = useReducer(reducer, undefined, initialState);
  const { current: state, past, future } = reducerState;

  const isDirty = past.length !== state.savedHistoryIndex;

  // 後方互換: selectedNodeId は最初の選択ノード
  const selectedNodeId = state.selectedNodeIds[0] ?? null;

  const selectedNode = useMemo(() => {
    if (!selectedNodeId) return null;
    return findNodeById(state.nodes, selectedNodeId);
  }, [state.nodes, selectedNodeId]);

  const parentNode = useMemo(() => {
    if (!selectedNodeId) return null;
    return findParentNode(state.nodes, selectedNodeId);
  }, [state.nodes, selectedNodeId]);

  const selectNode = useCallback((nodeId: string | null) => dispatch({ type: 'SELECT', nodeId }), []);
  const selectNodeAdd = useCallback((nodeId: string) => dispatch({ type: 'SELECT_ADD', nodeId }), []);
  const updateNodeProps = useCallback((nodeId: string, propName: string, value: string) => dispatch({ type: 'UPDATE_PROP', nodeId, propName, value }), []);
  const updateNodeText = useCallback((nodeId: string, text: string) => dispatch({ type: 'UPDATE_TEXT', nodeId, text }), []);
  const addNode = useCallback((tag: string, parentId: string | null, index?: number, meta?: Record<string, number>) => dispatch({ type: 'ADD_NODE', tag, parentId, index, meta }), []);
  const deleteNode = useCallback((nodeId: string) => dispatch({ type: 'DELETE_NODE', nodeId }), []);
  const deleteSelected = useCallback(() => dispatch({ type: 'DELETE_SELECTED' }), []);
  const moveNode = useCallback((nodeId: string, targetParentId: string | null, targetIndex: number) => dispatch({ type: 'MOVE_NODE', nodeId, targetParentId, targetIndex }), []);
  const wrapNodes = useCallback((nodeIds: string[], containerTag: string) => dispatch({ type: 'WRAP_NODES', nodeIds, containerTag }), []);
  const unwrapNode = useCallback((nodeId: string) => dispatch({ type: 'UNWRAP_NODE', nodeId }), []);
  const duplicateNodes = useCallback((nodeIds: string[]) => dispatch({ type: 'DUPLICATE_NODES', nodeIds }), []);
  const moveOut = useCallback((nodeId: string) => dispatch({ type: 'MOVE_OUT', nodeId }), []);
  const copyNodes = useCallback((nodeIds: string[]) => dispatch({ type: 'COPY', nodeIds }), []);
  const cutNodes = useCallback((nodeIds: string[]) => dispatch({ type: 'CUT', nodeIds }), []);
  const paste = useCallback(() => dispatch({ type: 'PASTE' }), []);
  const undo = useCallback(() => dispatch({ type: 'UNDO' }), []);
  const redo = useCallback(() => dispatch({ type: 'REDO' }), []);
  const loadSource = useCallback((source: string, filePath?: string) => dispatch({ type: 'LOAD', source, filePath }), []);
  const markSaved = useCallback((filePath?: string) => dispatch({ type: 'MARK_SAVED', filePath }), []);

  return {
    state: { ...state, isDirty, selectedNodeId },
    selectedNode,
    parentNode,
    canUndo: past.length > 0,
    canRedo: future.length > 0,
    selectNode,
    selectNodeAdd,
    updateNodeProps,
    updateNodeText,
    addNode,
    deleteNode,
    deleteSelected,
    moveNode,
    wrapNodes,
    unwrapNode,
    duplicateNodes,
    moveOut,
    copyNodes,
    cutNodes,
    paste,
    undo,
    redo,
    loadSource,
    markSaved,
  };
}
