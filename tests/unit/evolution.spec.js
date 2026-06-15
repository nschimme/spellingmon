import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { usePlayerStore } from '../../src/stores/playerStore';
import { MONS } from '../../src/utils/gameData';

describe('PlayerStore Evolution', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('triggers evolution pending when level threshold is met', () => {
    const store = usePlayerStore();
    const mon = {
      id: 'test-mon',
      species: 'Grammander',
      level: 15,
      exp: 0,
      expToNext: 100,
      name: 'Grammander',
      hp: 20,
      maxHp: 20
    };
    store.party = [mon];

    store.levelUp(mon); // Should reach Level 16

    expect(mon.level).toBe(16);
    expect(store.evolutionPending).not.toBeNull();
    expect(store.evolutionPending.newSpecies).toBe('Wordmeleon');
  });

  it('completes evolution and transforms species', () => {
    const store = usePlayerStore();
    const mon = {
      id: 'test-mon',
      species: 'Grammander',
      level: 16,
      name: 'Grammander',
      type: 'Fire',
      hp: 20,
      maxHp: 20
    };
    store.party = [mon];
    store.evolutionPending = {
      monId: 'test-mon',
      oldSpecies: 'Grammander',
      newSpecies: 'Wordmeleon'
    };

    store.completeEvolution();

    const evolvedMon = store.party[0];
    expect(evolvedMon.species).toBe('Wordmeleon');
    expect(evolvedMon.name).toBe('Wordmeleon');
    expect(store.evolutionPending).toBeNull();
  });
});
