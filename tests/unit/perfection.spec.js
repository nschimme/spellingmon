import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useBattleStore } from '../../src/stores/battleStore';

describe('Tiered Attack Quality and Damage', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  const mockPlayer = {
    species: 'Grammander',
    type: 'Fire',
    level: 10,
    hp: 30,
    maxHp: 30,
    atk: 20,
    def: 20,
    spd: 20
  };

  const mockEnemy = {
    species: 'Bulbaword',
    type: 'Grass',
    level: 10,
    hp: 30,
    maxHp: 30,
    atk: 20,
    def: 20,
    spd: 20
  };

  it('calculates higher damage for Perfect than Correct', () => {
    const store = useBattleStore();
    store.playerMon = { ...mockPlayer };
    store.enemyMon = { ...mockEnemy };
    store.inBattle = true;

    const resultCorrect = store.processAttack(false, false);
    const hpAfterCorrect = store.enemyMon.hp;

    // Reset HP for next test
    store.enemyMon.hp = 30;
    const resultPerfect = store.processAttack(false, true);
    const hpAfterPerfect = store.enemyMon.hp;

    expect(resultPerfect.damage).toBeGreaterThan(resultCorrect.damage);
    expect(hpAfterPerfect).toBeLessThan(hpAfterCorrect);
  });

  it('calculates highest damage for Perfect + Fast', () => {
    const store = useBattleStore();
    store.playerMon = { ...mockPlayer };
    store.enemyMon = { ...mockEnemy };

    const res1 = store.processAttack(false, false); // Correct
    const res2 = store.processAttack(true, false);  // Correct + Fast
    const res3 = store.processAttack(false, true);  // Perfect
    const res4 = store.processAttack(true, true);   // Perfect + Fast

    expect(res4.damage).toBeGreaterThan(res3.damage);
    expect(res3.damage).toBeGreaterThan(res2.damage);
    expect(res2.damage).toBeGreaterThan(res1.damage);
  });

  it('logs appropriate messages for each quality tier', () => {
    const store = useBattleStore();
    store.playerMon = { ...mockPlayer };
    store.enemyMon = { ...mockEnemy };

    store.processAttack(true, true);
    expect(store.battleLog).toContain('Perfect & Fast! Ultimate Hit!');

    store.processAttack(false, true);
    expect(store.battleLog).toContain('Perfect! Great Hit!');

    store.processAttack(true, false);
    expect(store.battleLog).toContain('Correct & Fast! Good Hit!');

    store.processAttack(false, false);
    expect(store.battleLog).toContain('Correct! Dealt damage.');
  });
});
