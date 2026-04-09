import { useSyncExternalStore } from 'react';

/**
 * Drag/Selection 状態の小規模ストア。
 * useSyncExternalStore で個別ノードが selector で購読できるため、
 * 状態変更時に該当ノードだけが再レンダーされる。
 */
class CanvasUIStore {
  selectedNodeId: string | null = null;
  draggingNodeId: string | null = null;
  dropTargetId: string | null = null;
  private listeners = new Set<() => void>();

  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  private emit() {
    this.listeners.forEach(l => l());
  }

  setSelected(id: string | null) {
    if (this.selectedNodeId === id) return;
    this.selectedNodeId = id;
    this.emit();
  }

  setDragging(id: string | null) {
    if (this.draggingNodeId === id) return;
    this.draggingNodeId = id;
    this.emit();
  }

  setDropTarget(id: string | null) {
    if (this.dropTargetId === id) return;
    this.dropTargetId = id;
    this.emit();
  }
}

export const canvasUIStore = new CanvasUIStore();

/** 指定ノードIDの選択/ドラッグ状態を購読 */
export function useNodeUIState(nodeId: string) {
  const isSelected = useSyncExternalStore(
    canvasUIStore.subscribe,
    () => canvasUIStore.selectedNodeId === nodeId,
  );
  const isDragging = useSyncExternalStore(
    canvasUIStore.subscribe,
    () => canvasUIStore.draggingNodeId === nodeId,
  );
  const isDropTarget = useSyncExternalStore(
    canvasUIStore.subscribe,
    () => canvasUIStore.dropTargetId === nodeId,
  );
  return { isSelected, isDragging, isDropTarget };
}
