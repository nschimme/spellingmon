import { defineStore } from 'pinia';

/**
 * useInputStore
 * Manages a stack of input listeners. Listeners are checked from top to bottom.
 * If a listener returns true, the event is considered handled and propagation stops.
 */
export const useInputStore = defineStore('input', {
  state: () => ({
    // Stack of { id, callback }
    stack: [],
  }),
  actions: {
    init() {
      if (this._handler) return;
      this._handler = (e) => this.handleKeydown(e);
      window.addEventListener('keydown', this._handler);
    },
    cleanup() {
      if (this._handler) {
        window.removeEventListener('keydown', this._handler);
        this._handler = null;
      }
    },
    handleKeydown(e) {
      if (this.stack.length === 0) return;

      // Check from top to bottom
      for (let i = this.stack.length - 1; i >= 0; i--) {
        const listener = this.stack[i];
        if (listener && listener.callback(e)) {
          e.preventDefault();
          break; // Stop propagation
        }
      }
    },
    /**
     * pushLayer
     * Adds a new input handling layer to the top of the stack.
     */
    pushLayer(id, callback) {
      // Avoid duplicates of the same ID
      this.popLayer(id);
      this.stack.push({ id, callback });
    },
    /**
     * popLayer
     * Removes a layer from the stack by ID.
     */
    popLayer(id) {
      this.stack = this.stack.filter(l => l.id !== id);
    },
    // Compatibility methods for old API
    addListener(id, callback) {
      this.pushLayer(id, callback);
    },
    removeListener(id) {
      this.popLayer(id);
    }
  }
});
