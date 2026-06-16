import { ref, watch, onUnmounted, nextTick } from 'vue';
import { useInputStore } from '../stores/inputStore';
import { audio } from '../utils/audio';
import { SOUND_EFFECTS } from '../utils/constants';

/**
 * useKeyboardNavigation
 * @param {Object} options
 * @param {String} options.id - Unique ID for the input listener
 * @param {Ref<Number>|Function|Number} options.maxIndex - Maximum index (exclusive)
 * @param {Function} options.onConfirm - Callback when Enter/Space is pressed
 * @param {Function} options.onCancel - Callback when Escape/Backspace is pressed
 * @param {Function} options.onLeft - Callback when Left is pressed
 * @param {Function} options.onRight - Callback when Right is pressed
 * @param {Number} options.gridColumns - Number of columns for grid navigation
 * @param {Ref<Boolean>} options.isActive - Ref to control if listener is active
 * @param {Boolean} options.loop - Whether to loop around when reaching the end
 * @param {Array<Object>} options.spatialMap - Optional map for irregular layouts [{up, down, left, right}]
 * @param {Ref<Array<HTMLElement>>} options.itemRefs - Optional refs to DOM elements for focus management
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
}) {
  const selectedIndex = ref(0);
  const inputStore = useInputStore();

  const syncDomFocus = () => {
    if (itemRefs?.value && itemRefs.value[selectedIndex.value]) {
      const el = itemRefs.value[selectedIndex.value];
      if (el instanceof HTMLElement) {
        el.focus();
      }
    }
  };

  const handleKeyDown = (e) => {
    if (!isActive.value) return false;

    const max = typeof maxIndex === 'function' ? maxIndex() : (maxIndex?.value !== undefined ? maxIndex.value : maxIndex);
    if (max <= 0) return false;

    let newIndex = selectedIndex.value;
    const key = e.key.toLowerCase();
    const isInput = e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA';
    const isRange = e.target.type === 'range';
    const isSelect = e.target.tagName === 'SELECT';

    // If it's a range or select and it's NOT handled by custom callbacks, let it handle left/right naturally
    if ((isRange || isSelect) && (e.key === 'ArrowLeft' || e.key === 'ArrowRight') && !onLeft && !onRight) {
      return false;
    }

    if (e.key === 'ArrowUp' || (!isInput && key === 'w')) {
      if (spatialMap && spatialMap[selectedIndex.value]?.up !== undefined) {
        newIndex = spatialMap[selectedIndex.value].up;
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
        newIndex = spatialMap[selectedIndex.value].down;
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
        newIndex = spatialMap[selectedIndex.value].left;
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
        newIndex = spatialMap[selectedIndex.value].right;
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
