import { ref, watch, onUnmounted, nextTick, unref, type Ref } from 'vue';
import { useInputStore } from '../stores/inputStore';
import { audio } from '../utils/audio';
import { SOUND_EFFECTS } from '../utils/constants';

export interface SpatialMapItem {
  up?: number;
  down?: number;
  left?: number;
  right?: number;
}

export interface KeyboardNavigationOptions {
  id: string;
  maxIndex: Ref<number> | (() => number) | number;
  onConfirm: (index: number) => void;
  onCancel?: (() => void) | null;
  onLeft?: ((index: number) => void) | null;
  onRight?: ((index: number) => void) | null;
  gridColumns?: number;
  isActive?: Ref<boolean>;
  loop?: boolean;
  spatialMap?: SpatialMapItem[] | null;
  itemRefs?: Ref<(HTMLElement | null)[]> | null;
  priority?: number;
}

/**
 * useKeyboardNavigation
 */
export function useKeyboardNavigation({
  id,
  maxIndex,
  onConfirm,
  onCancel = null,
  onLeft = null,
  onRight = null,
  gridColumns = 1,
  isActive = ref(true),
  loop = true,
  spatialMap = null,
  itemRefs = null
}: KeyboardNavigationOptions) {
  const selectedIndex = ref(0);
  const inputStore = useInputStore();

  const syncDomFocus = () => {
    if (!isActive.value) return;
    if (itemRefs?.value) {
      const refs = unref(itemRefs);
      const el = unref(refs[selectedIndex.value]);
      if (el instanceof HTMLElement) {
        el.focus();
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent): boolean => {
    if (!isActive.value) return false;

    const max = typeof maxIndex === 'function' ? maxIndex() : (typeof maxIndex === 'number' ? maxIndex : maxIndex.value);
    if (max <= 0) return false;

    let newIndex = selectedIndex.value;
    const key = e.key.toLowerCase();
    const target = e.target as HTMLElement | null;
    const isInput = target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA';
    const isRange = (target as HTMLInputElement)?.type === 'range';
    const isSelect = target?.tagName === 'SELECT';

    // If it's a range or select and it's NOT handled by custom callbacks, let it handle left/right naturally
    if ((isRange || isSelect) && (e.key === 'ArrowLeft' || e.key === 'ArrowRight') && !onLeft && !onRight) {
      return false;
    }

    if (e.key === 'ArrowUp' || (!isInput && key === 'w')) {
      if (spatialMap && spatialMap[selectedIndex.value]?.up !== undefined) {
        newIndex = spatialMap[selectedIndex.value].up!;
      } else if (selectedIndex.value - gridColumns >= 0) {
        newIndex = selectedIndex.value - gridColumns;
      } else if (loop) {
        const col = selectedIndex.value % gridColumns;
        const rows = Math.ceil(max / gridColumns);
        newIndex = (rows - 1) * gridColumns + col;
        if (newIndex >= max) newIndex -= gridColumns;
      }
    } else if (e.key === 'ArrowDown' || (!isInput && key === 's')) {
      if (spatialMap && spatialMap[selectedIndex.value]?.down !== undefined) {
        newIndex = spatialMap[selectedIndex.value].down!;
      } else if (selectedIndex.value + gridColumns < max) {
        newIndex = selectedIndex.value + gridColumns;
      } else if (loop) {
        newIndex = selectedIndex.value % gridColumns;
      }
    } else if (e.key === 'ArrowLeft' || (!isInput && key === 'a')) {
      if (onLeft) {
        onLeft(selectedIndex.value);
        return true;
      }
      if (spatialMap && spatialMap[selectedIndex.value]?.left !== undefined) {
        newIndex = spatialMap[selectedIndex.value].left!;
      } else if (selectedIndex.value % gridColumns > 0) {
        newIndex = selectedIndex.value - 1;
      } else if (loop) {
        const rowStart = Math.floor(selectedIndex.value / gridColumns) * gridColumns;
        newIndex = Math.min(max - 1, rowStart + gridColumns - 1);
      }
    } else if (e.key === 'ArrowRight' || (!isInput && key === 'd')) {
      if (onRight) {
        onRight(selectedIndex.value);
        return true;
      }
      if (spatialMap && spatialMap[selectedIndex.value]?.right !== undefined) {
        newIndex = spatialMap[selectedIndex.value].right!;
      } else {
        const rowStart = Math.floor(selectedIndex.value / gridColumns) * gridColumns;
        if (selectedIndex.value < rowStart + gridColumns - 1 && selectedIndex.value + 1 < max) {
          newIndex = selectedIndex.value + 1;
        } else if (loop) {
          newIndex = rowStart;
        }
      }
    } else if (e.key === 'Enter' || e.key === ' ') {
      if (e.key === ' ' && isInput) return false;
      onConfirm(selectedIndex.value);
      return true;
    } else if ((e.key === 'Escape' || e.key === 'Backspace') && onCancel) {
      if (e.key === 'Backspace' && isInput) return false;
      onCancel();
      return true;
    } else {
      return false;
    }

    if (newIndex !== selectedIndex.value) {
      selectedIndex.value = newIndex;
      audio.playSound(SOUND_EFFECTS.CLICK);
      nextTick(syncDomFocus);
      return true;
    }

    return false;
  };

  const register = () => {
    inputStore.pushLayer(id, handleKeyDown);
    nextTick(syncDomFocus);
  };

  const unregister = () => {
    inputStore.popLayer(id);
  };

  watch(isActive, (active) => {
    if (active) register();
    else unregister();
  }, { immediate: true });

  watch(selectedIndex, () => {
     nextTick(syncDomFocus);
  });

  onUnmounted(unregister);

  return {
    selectedIndex,
    reset: (index = 0) => {
      selectedIndex.value = index;
      nextTick(syncDomFocus);
    }
  };
}
