import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useBattleStore } from '../../src/stores/battleStore';

describe('BattleStore Logic', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('determines turn order based on Speed', () => {
    const store = useBattleStore();
    const playerMon = { name: 'Player', level: 10, spd: 50, hp: 100, maxHp: 100 };
    const enemyMon = { name: 'Enemy', level: 10, spd: 60, hp: 100, maxHp: 100 };

    store.startBattle(playerMon, enemyMon);

    // Enemy is faster (60 > 50), so isPlayerTurn should be false
    expect(store.isPlayerTurn).toBe(false);
  });

  it('sets player turn if player is faster', () => {
    const store = useBattleStore();
    const playerMon = { name: 'Player', level: 10, spd: 70, hp: 100, maxHp: 100 };
    const enemyMon = { name: 'Enemy', level: 10, spd: 60, hp: 100, maxHp: 100 };

    store.startBattle(playerMon, enemyMon);

    expect(store.isPlayerTurn).toBe(true);
  });

  it('logs damage to enemy', () => {
    const store = useBattleStore();
    store.enemyMon = { name: 'Enemy', hp: 100, maxHp: 100 };

    store.damageEnemy(20);

    expect(store.enemyMon.hp).toBe(80);
  });
});
