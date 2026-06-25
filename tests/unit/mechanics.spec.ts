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
    const attacker = { species: 'Squirtspell', types: ['Water'], level: 10, atk: 20, spa: 20, def: 20, spd: 20, spe: 20, stages: {} } as any;
    const defender = { species: 'Grammander', types: ['Fire'], level: 10, atk: 20, spa: 20, def: 20, spd: 20, spe: 20, stages: {} } as any;
    const move = { type: 'Water', category: 'Special', power: 40, accuracy: 100 } as any;

    // Water vs Fire should have 2x multiplier
    const result = calculateDamage(attacker, defender, move, { isCorrect: true, isPerfect: false, isPower: true });
    expect(result.typeMod).toBe(2);
    expect(result.damage).toBeGreaterThan(1);
  });

  it('calculates damage with type resistances', () => {
    const attacker = { species: 'Grammander', types: ['Fire'], level: 10, atk: 20, spa: 20, def: 20, spd: 20, spe: 20, stages: {} } as any;
    const defender = { species: 'Squirtspell', types: ['Water'], level: 10, atk: 20, spa: 20, def: 20, spd: 20, spe: 20, stages: {} } as any;
    const move = { type: 'Fire', category: 'Special', power: 40, accuracy: 100 } as any;

    // Fire vs Water should have 0.5x multiplier
    const result = calculateDamage(attacker, defender, move, { isCorrect: true, isPerfect: false, isPower: true });
    expect(result.typeMod).toBe(0.5);
  });

  it('calculates damage incorporating word difficulty (performance)', () => {
    const attacker = { species: 'Grammander', types: ['Fire'], level: 10, atk: 20, spa: 20, def: 20, spd: 20, spe: 20, stages: {}, status: 'None' } as any;
    const defender = { species: 'Caterspell', types: ['Bug'], level: 10, atk: 20, spa: 20, def: 20, spd: 20, spe: 20, stages: {}, status: 'None' } as any;
    const move = { type: 'Fire', category: 'Special', power: 40, accuracy: 100 } as any;

    // Fix random factor for test
    vi.spyOn(Math, 'random').mockReturnValue(0.9);

    // Normal word (isPower false)
    const resultNormal = calculateDamage(attacker, defender, move, { isCorrect: true, isPerfect: false, isPower: false });
    // Power word (isPower true)
    const resultPower = calculateDamage(attacker, defender, move, { isCorrect: true, isPerfect: false, isPower: true });

    expect(resultPower.damage).toBeGreaterThan(resultNormal.damage);

    vi.restoreAllMocks();
  });
});
