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

  it('clears seeded flag and resets stat stages for non-transformed party members when resetBattle is called', () => {
    const session = useSessionStore();

    const partyMon = {
      id: 'mon_1',
      species: 'Grammander',
      emoji: '🦎',
      types: ['Fire'],
      level: 5,
      hp: 30,
      maxHp: 30,
      atk: 10,
      def: 10,
      spa: 10,
      spd: 10,
      spe: 10,
      moves: ['Ember'],
      status: 'NONE',
      isSeeded: true,
      stages: {
        atk: 2,
        def: -1,
        spa: 3,
        spd: -2,
        spe: 1
      }
    };

    session.player.party = [partyMon as any];

    // Sanity-check preconditions
    expect(session.player.party[0].isSeeded).toBe(true);
    expect(session.player.party[0].stages.atk).toBe(2);

    // When we reset the battle, seeded status and stat stages should be cleared
    session.resetBattle();

    expect(session.player.party[0].isSeeded).toBe(false);
    expect(session.player.party[0].stages.atk).toBe(0);
    expect(session.player.party[0].stages.def).toBe(0);
    expect(session.player.party[0].stages.spa).toBe(0);
    expect(session.player.party[0].stages.spd).toBe(0);
    expect(session.player.party[0].stages.spe).toBe(0);
  });
});
