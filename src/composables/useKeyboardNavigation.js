import { ref, watch, onUnmounted } from 'vue';
import { useInputStore } from '../stores/inputStore';
import { audio } from '../utils/audio';
import { SOUND_EFFECTS } from '../utils/constants';

/**
 * useKeyboardNavigation
 * @param {Object} options
 * @param {String} options.id - Unique ID for the input listener
 * @param {Ref<Number>} options.initialIndex - Starting index
 * @param {Ref<Number>} options.maxIndex - Maximum index (exclusive)
 * @param {Number} options.priority - Input listener priority
 * @param {Function} options.onConfirm - Callback when Enter is pressed
 * @param {Function} options.onCancel - Callback when Escape is pressed (optional)
 * @param {Number} options.gridColumns - Number of columns for grid navigation (optional)
 * @param {Boolean} options.isActive - Ref to control if listener is active
 * @param {Boolean} options.loop - Whether to loop around when reaching the end
 */
export function useKeyboardNavigation({
  id,
  maxIndex,
  onConfirm,
  onCancel = null,
  priority = 10,
  gridColumns = 1,
  isActive = ref(true),
  loop = true
}) {
  const selectedIndex = ref(0);
  const inputStore = useInputStore();

  const handleKeyDown = (e) => {
    if (!isActive.value) return false;

    const max = typeof maxIndex === 'function' ? maxIndex() : (maxIndex.value !== undefined ? maxIndex.value : maxIndex);
    if (max <= 0) return false;

    let newIndex = selectedIndex.value;

    const key = e.key.toLowerCase();
    const isInput = e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA';

    if (e.key === 'ArrowUp' || (!isInput && key === 'w')) {
      if (selectedIndex.value - gridColumns >= 0) {
        newIndex = selectedIndex.value - gridColumns;
      } else if (loop) {
        // Find last possible index in the same "column" but at the bottom
        const col = selectedIndex.value % gridColumns;
        const rows = Math.ceil(max / gridColumns);
        newIndex = (rows - 1) * gridColumns + col;
        if (newIndex >= max) newIndex -= gridColumns;
      }
    } else if (e.key === 'ArrowDown' || (!isInput && key === 's')) {
      if (selectedIndex.value + gridColumns < max) {
        newIndex = selectedIndex.value + gridColumns;
      } else if (loop) {
        newIndex = selectedIndex.value % gridColumns;
      }
    } else if (e.key === 'ArrowLeft' || (!isInput && key === 'a')) {
      if (selectedIndex.value % gridColumns > 0) {
        newIndex = selectedIndex.value - 1;
      } else if (loop) {
        // Go to end of current row
        const rowStart = Math.floor(selectedIndex.value / gridColumns) * gridColumns;
        newIndex = Math.min(max - 1, rowStart + gridColumns - 1);
      }
    } else if (e.key === 'ArrowRight' || (!isInput && key === 'd')) {
      const rowStart = Math.floor(selectedIndex.value / gridColumns) * gridColumns;
      if (selectedIndex.value < rowStart + gridColumns - 1 && selectedIndex.value + 1 < max) {
        newIndex = selectedIndex.value + 1;
      } else if (loop) {
        newIndex = rowStart;
      }
    } else if (e.key === 'Enter' || e.key === ' ') {
      // Space only triggers if not in an input field (to allow typing spaces)
      if (e.key === ' ' && e.target.tagName === 'INPUT') return false;
      onConfirm(selectedIndex.value);
      return true;
    } else if ((e.key === 'Escape' || e.key === 'Backspace') && onCancel) {
      // Backspace only triggers if not in an input field
      if (e.key === 'Backspace' && e.target.tagName === 'INPUT') return false;
      onCancel();
      return true;
    } else {
      return false;
    }

    if (newIndex !== selectedIndex.value) {
      selectedIndex.value = newIndex;
      audio.playSound(SOUND_EFFECTS.CLICK);
      return true;
    }

    return false;
  };

  const register = () => {
    inputStore.addListener(id, handleKeyDown, priority);
  };

  const unregister = () => {
    inputStore.removeListener(id);
  };

  watch(isActive, (active) => {
    if (active) register();
    else unregister();
  }, { immediate: true });

  onUnmounted(unregister);

  return {
    selectedIndex,
    reset: (index = 0) => { selectedIndex.value = index; }
  };
}
