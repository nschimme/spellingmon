import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useSessionStore } from '../../src/stores/sessionStore';

describe('SessionStore Battle Logic', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('logs damage to enemy', () => {
    const session = useSessionStore();
    session.battle.enemyMon = { name: 'Enemy', hp: 100, maxHp: 100 };

    session.damageEnemy(20);

    expect(session.battle.enemyMon.hp).toBe(80);
  });
});
