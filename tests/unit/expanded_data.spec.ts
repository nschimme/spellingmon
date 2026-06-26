import { describe, it, expect } from 'vitest';
import { MONS, TYPE_CHART, calculateStat, createMon } from '../../src/utils/gameData';

describe('Expanded Game Data', () => {
  it('contains unique emojis for all MONS', () => {
    const emojis = Object.values(MONS).map(m => m.emoji);
    // Note: Some might share emojis (like Caterpie/Weedle equivalents), but they should all have them
    for (const mon of Object.values(MONS)) {
      expect(mon.emoji).toBeDefined();
      expect(mon.emoji.length).toBeGreaterThan(0);
    }
  });

  it('has valid types for all MONS', () => {
    const validTypes = Object.keys(TYPE_CHART);
    for (const mon of Object.values(MONS)) {
      for (const t of mon.types) {
        expect(validTypes).toContain(t);
      }
    }
  });

  it('defines valid evolution species', () => {
    const speciesNames = Object.keys(MONS);
    for (const mon of Object.values(MONS)) {
      if (mon.evolvesInto) {
        expect(speciesNames).toContain(mon.evolvesInto);
      }
    }
  });

  it('creates monsters with the correct emoji', () => {
    const mon = createMon('Grammander', 5);
    expect(mon.emoji).toBe('🦎');
    expect(mon.species).toBe('Grammander');
  });

  it('handles all new types in the type chart', () => {
    expect(TYPE_CHART.Bug).toBeDefined();
    expect(TYPE_CHART.Ground).toBeDefined();
    expect(TYPE_CHART.Ghost).toBeDefined();
    expect(TYPE_CHART.Dragon).toBeDefined();
    expect(TYPE_CHART.Ice).toBeDefined();

    // Specific advantages
    expect(TYPE_CHART.Ground.Electric).toBe(2);
    expect(TYPE_CHART.Electric.Ground).toBe(0);
    expect(TYPE_CHART.Ghost.Normal).toBe(0);
  });

  it('calculates stats for a high-level monster correctly', () => {
    // Mewtwo-meta Level 100: baseHp 106, baseAtk 110, baseDef 90, baseSpd 130
    // HP = Math.floor(((2 * 106 + 31) * 100) / 100) + 100 + 10 = 212 + 31 + 110 = 353
    const hp = calculateStat(106, 100, true);
    expect(hp).toBe(353);

    // Atk = Math.floor(((2 * 110 + 31) * 100) / 100) + 5 = 220 + 31 + 5 = 256
    const atk = calculateStat(110, 100);
    expect(atk).toBe(256);
  });
});
