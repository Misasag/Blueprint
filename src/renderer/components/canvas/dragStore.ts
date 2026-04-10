import { useSyncExternalStore } from 'react';

export type DropPosition = 'before' | 'inside' | 'after';

class CanvasUIStore {
  selectedNodeId: string | null = null;
  draggingNodeId: string | null = null;
  dropTargetId: string | null = null;
  dropPosition: DropPosition | null = null;
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

  setDropTarget(id: string | null, position?: DropPosition | null) {
    const pos = position ?? null;
    if (this.dropTargetId === id && this.dropPosition === pos) return;
    this.dropTargetId = id;
    this.dropPosition = pos;
    this.emit();
  }
}

export const canvasUIStore = new CanvasUIStore();

/** 指定ノードIDの選択/ドラッグ/ドロップ状態を購読 */
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
  const dropPosition = useSyncExternalStore(
    canvasUIStore.subscribe,
    () => canvasUIStore.dropTargetId === nodeId ? canvasUIStore.dropPosition : null,
  );
  return { isSelected, isDragging, isDropTarget, dropPosition };
}
