import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useSessionStore } from '../../src/stores/sessionStore';
import { STATUS_CONDITIONS, ANIMATION_DURATIONS } from '../../src/utils/constants';

describe('Overworld Poison Damage', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.useFakeTimers();
  });

  it('applies damage and triggers flash when party member is poisoned', () => {
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

    // Should reset after duration
    vi.advanceTimersByTime(ANIMATION_DURATIONS.POISON_FLASH_DURATION_MS);
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

  it('clears previous timeout on rapid damage ticks', () => {
    const session = useSessionStore();
    session.player.party = [{
      id: 'mon_1',
      species: 'Grammander',
      hp: 10,
      maxHp: 10,
      status: STATUS_CONDITIONS.POISON,
      stages: { atk: 0, def: 0, spa: 0, spd: 0, spe: 0 }
    } as any];

    session.applyOverworldDamage();
    expect(session.overworldPoisonDamage).toBe(true);
    const firstAt = session.overworldPoisonDamageAt;

    // Halfway through
    vi.advanceTimersByTime(ANIMATION_DURATIONS.POISON_FLASH_DURATION_MS / 2);

    // Another tick
    session.applyOverworldDamage();
    expect(session.overworldPoisonDamageAt).toBeGreaterThan(firstAt);

    // Advance past the FIRST timer's end
    vi.advanceTimersByTime(ANIMATION_DURATIONS.POISON_FLASH_DURATION_MS / 2 + 10);

    // Should STILL be true because the second timer was set
    expect(session.overworldPoisonDamage).toBe(true);

    // Advance to end of second timer
    vi.advanceTimersByTime(ANIMATION_DURATIONS.POISON_FLASH_DURATION_MS / 2);
    expect(session.overworldPoisonDamage).toBe(false);
  });
});
