import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useSessionStore } from '../../src/stores/sessionStore';
import { STATUS_CONDITIONS } from '../../src/utils/constants';

describe('Overworld Poison Damage', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('applies damage and sets flash flag when party member is poisoned', () => {
    const session = useSessionStore();

    // Set up a poisoned mon
    session.player.party = [{
      id: 'mon_1',
      species: 'Grammander',
      hp: 10,
      maxHp: 10,
      status: STATUS_CONDITIONS.POISON,
      stages: { atk: 0, def: 0, spa: 0, spd: 0, spe: 0 }
    } as any];

    session.applyOverworldDamage();

    expect(session.player.party[0].hp).toBe(9);
    expect(session.overworldPoisonDamage).toBe(true);
    expect(session.overworldPoisonDamageAt).toBeGreaterThan(0);

    // Should clear when clear function is called
    session.clearOverworldPoisonDamage();
    expect(session.overworldPoisonDamage).toBe(false);
  });

  it('does not trigger flash when no one is poisoned', () => {
    const session = useSessionStore();

    session.player.party = [{
      id: 'mon_1',
      species: 'Grammander',
      hp: 10,
      maxHp: 10,
      status: STATUS_CONDITIONS.NONE,
      stages: { atk: 0, def: 0, spa: 0, spd: 0, spe: 0 }
    } as any];

    session.applyOverworldDamage();

    expect(session.player.party[0].hp).toBe(10);
    expect(session.overworldPoisonDamage).toBe(false);
    expect(session.overworldPoisonDamageAt).toBe(0);
  });
});
