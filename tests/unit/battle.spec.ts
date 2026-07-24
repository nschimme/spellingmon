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

  it('reverts transformed monsters back to their original species and moves when resetBattle is called', () => {
    const session = useSessionStore();
    const drafto = {
      id: 'drafto_1',
      species: 'Drafto',
      emoji: '👥',
      types: ['Normal'],
      level: 5,
      hp: 30,
      maxHp: 30,
      atk: 10,
      def: 10,
      spa: 10,
      spd: 10,
      spe: 10,
      moves: ['Transform'],
      status: 'NONE',
      stages: { atk: 0, def: 0, spa: 0, spd: 0, spe: 0 },
      originalSpecies: 'Drafto',
      originalEmoji: '👥',
      originalTypes: ['Normal'],
      originalMoves: ['Transform'],
      originalAtk: 10,
      originalDef: 10,
      originalSpa: 10,
      originalSpd: 10,
      originalSpe: 10
    };

    // Simulate transformed state during battle
    drafto.species = 'Grammander';
    drafto.emoji = '🦎';
    drafto.types = ['Fire'];
    drafto.moves = ['Scratch', 'Ember'];
    drafto.atk = 15;

    session.player.party = [drafto as any];

    session.resetBattle();

    const reverted = session.player.party[0];
    expect(reverted.species).toBe('Drafto');
    expect(reverted.emoji).toBe('👥');
    expect(reverted.types).toContain('Normal');
    expect(reverted.moves).toContain('Transform');
    expect(reverted.atk).toBe(10);
    expect(reverted.originalSpecies).toBeUndefined();
  });
});
