import { UINode } from '../../parser';

/** ツリー内の特定ノードを更新する（イミュータブル） */
export function updateNodeInTree(
  nodes: UINode[],
  nodeId: string,
  updater: (node: UINode) => UINode,
): UINode[] {
  let changed = false;
  const result = nodes.map(node => {
    if (node.id === nodeId) {
      changed = true;
      return updater(node);
    }
    if (node.children.length > 0) {
      const newChildren = updateNodeInTree(node.children, nodeId, updater);
      if (newChildren !== node.children) {
        changed = true;
        return { ...node, children: newChildren };
      }
    }
    return node;
  });
  return changed ? result : nodes;
}

/** IDでノードを検索 */
export function findNodeById(nodes: UINode[], id: string): UINode | null {
  for (const node of nodes) {
    if (node.id === id) return node;
    const found = findNodeById(node.children, id);
    if (found) return found;
  }
  return null;
}

/** ツリーからノードを削除する（イミュータブル） */
export function removeNodeFromTree(nodes: UINode[], nodeId: string): UINode[] {
  let changed = false;
  const result: UINode[] = [];
  for (const node of nodes) {
    if (node.id === nodeId) {
      changed = true;
      continue;
    }
    if (node.children.length > 0) {
      const newChildren = removeNodeFromTree(node.children, nodeId);
      if (newChildren !== node.children) {
        changed = true;
        result.push({ ...node, children: newChildren });
        continue;
      }
    }
    result.push(node);
  }
  return changed ? result : nodes;
}

/** ノードが targetId の子孫かどうかを判定 */
export function isDescendant(node: UINode, targetId: string): boolean {
  if (node.id === targetId) return true;
  for (const child of node.children) {
    if (isDescendant(child, targetId)) return true;
  }
  return false;
}

/** ノードとその子孫の全IDを収集 */
export function collectIds(node: UINode): Set<string> {
  const ids = new Set<string>();
  const stack = [node];
  while (stack.length > 0) {
    const n = stack.pop()!;
    ids.add(n.id);
    stack.push(...n.children);
  }
  return ids;
}

/** タグのデフォルトプロパティ */
export function defaultPropsForTag(tag: string): Record<string, string> {
  const defaults: Record<string, Record<string, string>> = {
    Text: { size: '14' },
    Button: { label: 'Button', color: '#3B82F6', radius: '4' },
    Input: { placeholder: 'Input', width: '100%' },
    Link: { label: 'Link' },
    VStack: { gap: '8', padding: '8' },
    HStack: { gap: '8', padding: '8' },
    Grid: { cols: '2', gap: '8' },
    Screen: { name: 'screen' },
  };
  return defaults[tag] ?? {};
}
