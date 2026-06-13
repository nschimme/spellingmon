import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { usePlayerStore } from '../../src/stores/playerStore';

describe('PlayerStore Logout', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('sets gameStarted to false on logout', () => {
    const store = usePlayerStore();
    store.gameStarted = true;
    expect(store.gameStarted).toBe(true);

    store.logout();
    expect(store.gameStarted).toBe(false);
  });
});
