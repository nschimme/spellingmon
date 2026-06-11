import { defineStore } from 'pinia';

export const useInputStore = defineStore('input', {
  state: () => ({
    listeners: [],
  }),
  actions: {
    init() {
      window.addEventListener('keydown', this.handleKeydown);
    },
    cleanup() {
      window.removeEventListener('keydown', this.handleKeydown);
    },
    handleKeydown(e) {
      // Sort listeners by priority (highest first)
      const sorted = [...this.listeners].sort((a, b) => b.priority - a.priority);
      for (const listener of sorted) {
        if (listener.callback(e)) {
          e.preventDefault();
          break; // Stop propagation if a listener handled the event
        }
      }
    },
    addListener(id, callback, priority = 0) {
      this.listeners.push({ id, callback, priority });
    },
    removeListener(id) {
      this.listeners = this.listeners.filter(l => l.id !== id);
    }
  }
});
