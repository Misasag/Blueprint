import { useReducer, useCallback, useMemo } from 'react';
import { UINode, ParseError, parseUI, serializeUI } from '../../parser';
import { updateNodeInTree, findNodeById, removeNodeFromTree, isDescendant, collectIds, defaultPropsForTag } from './treeUtils';

export interface EditorState {
  nodes: UINode[];
  selectedNodeId: string | null;
  filePath: string | null;
  fileName: string;
  source: string;
  parseErrors: ParseError[];
  /** 履歴の中の「保存済み位置」のインデックス。-1 = 未保存 */
  savedHistoryIndex: number;
}

interface HistoryEntry {
  nodes: UINode[];
  source: string;
  selectedNodeId: string | null;
}

interface EditorReducerState {
  current: EditorState;
  past: HistoryEntry[];
  future: HistoryEntry[];
}

type Action =
  | { type: 'SELECT'; nodeId: string | null }
  | { type: 'UPDATE_PROP'; nodeId: string; propName: string; value: string }
  | { type: 'UPDATE_TEXT'; nodeId: string; text: string }
  | { type: 'ADD_NODE'; tag: string; parentId: string | null; index?: number }
  | { type: 'DELETE_NODE'; nodeId: string }
  | { type: 'MOVE_NODE'; nodeId: string; targetParentId: string | null; targetIndex: number }
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
  return { nodes: s.nodes, source: s.source, selectedNodeId: s.selectedNodeId };
}

/** 状態を変更してヒストリにスナップショットを記録する */
function withHistory(state: EditorReducerState, nextCurrent: EditorState): EditorReducerState {
  const past = [...state.past, snapshot(state.current)];
  // 履歴が溢れたら古いものを捨てる + savedHistoryIndex も追従
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

function reducer(state: EditorReducerState, action: Action): EditorReducerState {
  const cur = state.current;

  switch (action.type) {
    case 'SELECT':
      if (cur.selectedNodeId === action.nodeId) return state;
      return { ...state, current: { ...cur, selectedNodeId: action.nodeId } };

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
      const newNode: UINode = {
        id: generateDynamicId(),
        tag: action.tag,
        props: defaultPropsForTag(action.tag),
        children: [],
      };

      let newNodes: UINode[];
      if (action.parentId === null) {
        const idx = action.index ?? cur.nodes.length;
        newNodes = [...cur.nodes.slice(0, idx), newNode, ...cur.nodes.slice(idx)];
      } else {
        newNodes = updateNodeInTree(cur.nodes, action.parentId, parent => {
          const idx = action.index ?? parent.children.length;
          return {
            ...parent,
            children: [...parent.children.slice(0, idx), newNode, ...parent.children.slice(idx)],
          };
        });
      }
      return withHistory(state, {
        ...cur,
        nodes: newNodes,
        source: serializeUI(newNodes),
        parseErrors: [],
        selectedNodeId: newNode.id,
      });
    }

    case 'DELETE_NODE': {
      // 削除対象の子孫IDも収集
      const target = findNodeById(cur.nodes, action.nodeId);
      if (!target) return state;
      const removedIds = collectIds(target);
      const newNodes = removeNodeFromTree(cur.nodes, action.nodeId);
      if (newNodes === cur.nodes) return state;
      return withHistory(state, {
        ...cur,
        nodes: newNodes,
        source: serializeUI(newNodes),
        parseErrors: [],
        selectedNodeId: cur.selectedNodeId && removedIds.has(cur.selectedNodeId) ? null : cur.selectedNodeId,
      });
    }

    case 'MOVE_NODE': {
      const node = findNodeById(cur.nodes, action.nodeId);
      if (!node) return state;
      if (action.targetParentId && isDescendant(node, action.targetParentId)) return state;

      const without = removeNodeFromTree(cur.nodes, action.nodeId);
      let newNodes: UINode[];
      if (action.targetParentId === null) {
        const idx = Math.min(action.targetIndex, without.length);
        newNodes = [...without.slice(0, idx), node, ...without.slice(idx)];
      } else {
        newNodes = updateNodeInTree(without, action.targetParentId, parent => {
          const idx = Math.min(action.targetIndex, parent.children.length);
          return {
            ...parent,
            children: [...parent.children.slice(0, idx), node, ...parent.children.slice(idx)],
          };
        });
      }
      return withHistory(state, { ...cur, nodes: newNodes, source: serializeUI(newNodes), parseErrors: [] });
    }

    case 'UNDO': {
      if (state.past.length === 0) return state;
      const last = state.past[state.past.length - 1];
      return {
        current: {
          ...cur,
          nodes: last.nodes,
          source: last.source,
          selectedNodeId: last.selectedNodeId,
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
          selectedNodeId: next.selectedNodeId,
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
          selectedNodeId: null,
          filePath: action.filePath ?? null,
          fileName,
          source: action.source,
          parseErrors: result.errors,
          savedHistoryIndex: 0, // ロード直後は保存済み状態
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
      selectedNodeId: null,
      filePath: null,
      fileName: 'untitled.ui',
      source: SAMPLE_UI,
      parseErrors: result.errors,
      savedHistoryIndex: 0,
    },
    past: [],
    future: [],
  };
};

export function useEditorStore() {
  const [reducerState, dispatch] = useReducer(reducer, undefined, initialState);
  const { current: state, past, future } = reducerState;

  const isDirty = past.length !== state.savedHistoryIndex;

  const selectedNode = useMemo(() => {
    if (!state.selectedNodeId) return null;
    return findNodeById(state.nodes, state.selectedNodeId);
  }, [state.nodes, state.selectedNodeId]);

  const selectNode = useCallback((nodeId: string | null) => dispatch({ type: 'SELECT', nodeId }), []);
  const updateNodeProps = useCallback((nodeId: string, propName: string, value: string) => dispatch({ type: 'UPDATE_PROP', nodeId, propName, value }), []);
  const updateNodeText = useCallback((nodeId: string, text: string) => dispatch({ type: 'UPDATE_TEXT', nodeId, text }), []);
  const addNode = useCallback((tag: string, parentId: string | null, index?: number) => dispatch({ type: 'ADD_NODE', tag, parentId, index }), []);
  const deleteNode = useCallback((nodeId: string) => dispatch({ type: 'DELETE_NODE', nodeId }), []);
  const moveNode = useCallback((nodeId: string, targetParentId: string | null, targetIndex: number) => dispatch({ type: 'MOVE_NODE', nodeId, targetParentId, targetIndex }), []);
  const undo = useCallback(() => dispatch({ type: 'UNDO' }), []);
  const redo = useCallback(() => dispatch({ type: 'REDO' }), []);
  const loadSource = useCallback((source: string, filePath?: string) => dispatch({ type: 'LOAD', source, filePath }), []);
  const markSaved = useCallback((filePath?: string) => dispatch({ type: 'MARK_SAVED', filePath }), []);

  return {
    state: { ...state, isDirty },
    selectedNode,
    canUndo: past.length > 0,
    canRedo: future.length > 0,
    selectNode,
    updateNodeProps,
    updateNodeText,
    addNode,
    deleteNode,
    moveNode,
    undo,
    redo,
    loadSource,
    markSaved,
  };
}

