import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { MOVE_IDS } from '../../src/utils/constants';
import { createMon, SPECIES, calculateDamage, MOVES } from '../../src/utils/gameData';

describe('Battle AI Performance', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('applies more damage for AI Perfect performance', async () => {
    // Mock random to ensure hit and average damage
    const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0.5);

    const attacker = createMon(SPECIES.Verminverb, 5);
    const defender = createMon(SPECIES.Grammander, 5);
    const move = MOVES[MOVE_IDS.Tackle];

    // Test Poor Performance
    const { damage: damagePoor } = calculateDamage(attacker, defender, move, { isCorrect: true, isPerfect: false, isPower: false });

    // Test Perfect Performance
    const { damage: damagePerfect } = calculateDamage(attacker, defender, move, { isCorrect: true, isPerfect: true, isPower: true });

    expect(damagePoor).toBeGreaterThan(0);
    expect(damagePerfect).toBeGreaterThan(damagePoor);

    randomSpy.mockRestore();
  });
});
