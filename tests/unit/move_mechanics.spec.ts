import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { SPECIES, createMon, calculateDamage, MOVES } from '../../src/utils/gameData';
import { MOVE_IDS } from '../../src/utils/constants';

describe('Move Mechanics and Effects', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('calculates STAB correctly', () => {
    const attacker = createMon(SPECIES.Grammander, 10);
    const defender = createMon(SPECIES.Verminverb, 10);
    const stabMove = { ...MOVES[MOVE_IDS.Ember], power: 40 };
    const nonStabMove = { ...MOVES[MOVE_IDS.Tackle], power: 40 };
    attacker.atk = 10;
    attacker.spa = 10;
    defender.def = 10;
    defender.spd = 10;
    const stabDmg = calculateDamage(attacker, defender, stabMove, { isCorrect: true, isPerfect: false, isPower: false });
    const nonStabDmg = calculateDamage(attacker, defender, nonStabMove, { isCorrect: true, isPerfect: false, isPower: false });
    expect(stabDmg.damage).toBeGreaterThan(nonStabDmg.damage);
  });

  it('handles dual types correctly in damage calculation', () => {
     const attacker = createMon(SPECIES.Grammander, 10);
     attacker.spa = 100;
     const defender = createMon(SPECIES.Venusterm, 10);
     defender.spd = 10;
     const dmg = calculateDamage(attacker, defender, MOVES[MOVE_IDS.Ember], { isCorrect: true, isPerfect: false, isPower: false });
     expect(dmg.typeMod).toBe(2);
     const rockAttacker = createMon(SPECIES.Rudeo, 10);
     const fireFlyingDef = createMon(SPECIES.Spelchar, 10);
     const rockDmg = calculateDamage(rockAttacker, fireFlyingDef, MOVES[MOVE_IDS.RockThrow], { isCorrect: true, isPerfect: false, isPower: false });
     expect(rockDmg.typeMod).toBe(4);
  });

  it('populates learnset moves correctly on creation', () => {
     const mon = createMon(SPECIES.Leeletter, 50);
     expect(mon.moves).toContain(MOVE_IDS.HighJumpKick);
     expect(mon.moves.length).toBe(4);
     const baby = createMon(SPECIES.Pikachart, 5);
     expect(baby.moves).toContain(MOVE_IDS.ThunderShock);
     expect(baby.moves).not.toContain(MOVE_IDS.Thunder);
  });
});
