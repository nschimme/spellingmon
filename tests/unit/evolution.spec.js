import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useSessionStore } from '../../src/stores/sessionStore';
import { SPECIES } from '../../src/utils/gameData';

describe('SessionStore Evolution', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('triggers evolution pending when level threshold is met', () => {
    const session = useSessionStore();
    const mon = {
      id: 'test-mon',
      species: SPECIES.Grammander,
      level: 15,
      exp: 0,
      expToNext: 100,
      name: 'Grammander',
      hp: 20,
      maxHp: 20
    };
    session.player.party = [mon];

    session.levelUpMon(mon); // Should reach Level 16

    expect(mon.level).toBe(16);
    expect(session.evolutionPending).not.toBeNull();
    expect(session.evolutionPending.newSpecies).toBe(SPECIES.Wordmeleon);
  });

  it('completes evolution and transforms species', () => {
    const session = useSessionStore();
    const mon = {
      id: 'test-mon',
      species: SPECIES.Grammander,
      level: 16,
      name: 'Grammander',
      type: 'Fire',
      hp: 20,
      maxHp: 20
    };
    session.player.party = [mon];
    session.evolutionPending = {
      monId: 'test-mon',
      newSpecies: SPECIES.Wordmeleon
    };

    session.completeEvolution();

    const evolvedMon = session.player.party[0];
    expect(evolvedMon.species).toBe(SPECIES.Wordmeleon);
    expect(session.evolutionPending).toBeNull();
  });
});
