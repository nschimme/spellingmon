import { describe, it, expect } from 'vitest';
import { calculateStat, calculateDamage, MONS } from '../../src/utils/gameData';

describe('Spellingmon Stats and Mechanics', () => {
  it('calculates HP correctly based on base stats and level', () => {
    // Grammander Level 5: base 39
    // HP = Math.floor(((2 * 39 + 31) * 5) / 100) + 5 + 10 = floor(109 * 5 / 100) + 15 = floor(5.45) + 15 = 5 + 15 = 20
    // Wait, my manual math: 5.45 -> 5. 5 + 15 = 20.
    // Let's check Level 100 Grammander: floor(109 * 100 / 100) + 100 + 10 = 109 + 110 = 219.
    const hp5 = calculateStat(39, 5, true);
    expect(hp5).toBe(20);

    const hp100 = calculateStat(39, 100, true);
    expect(hp100).toBe(219);
  });

  it('calculates other stats correctly', () => {
    // Grammander Atk Level 5: base 52
    // Stat = floor(((2 * 52 + 31) * 5) / 100) + 5 = floor(135 * 5 / 100) + 5 = floor(6.75) + 5 = 11
    const atk5 = calculateStat(52, 5);
    expect(atk5).toBe(11);
  });

  it('calculates damage with type advantages', () => {
    const attacker = { species: 'Squirtspell', type: 'Water', level: 10, atk: 20 };
    const defender = { species: 'Grammander', type: 'Fire', level: 10, def: 15 };

    // Water vs Fire should have 2x multiplier
    const result = calculateDamage(attacker, defender, 40);
    expect(result.typeMod).toBe(2);
    expect(result.damage).toBeGreaterThan(1);
  });

  it('calculates damage with type resistances', () => {
    const attacker = { species: 'Grammander', type: 'Fire', level: 10, atk: 20 };
    const defender = { species: 'Squirtspell', type: 'Water', level: 10, def: 15 };

    // Fire vs Water should have 0.5x multiplier
    const result = calculateDamage(attacker, defender, 40);
    expect(result.typeMod).toBe(0.5);
  });

  it('calculates damage incorporating word difficulty', () => {
    const attacker = { species: 'Grammander', type: 'Fire', level: 10, atk: 20 };
    const defender = { species: 'Caterspell', type: 'Bug', level: 10, def: 15 };

    // Easy word (difficulty 1)
    const resultEasy = calculateDamage(attacker, defender, 40, 1);
    // Hard word (difficulty 2)
    const resultHard = calculateDamage(attacker, defender, 40, 2);

    // Using toBeCloseTo or checking if it's within 1 because of Math.floor during calculation
    expect(resultHard.damage).toBeGreaterThanOrEqual(Math.floor(resultEasy.damage * 1.5));
  });
});
