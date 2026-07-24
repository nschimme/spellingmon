import { describe, it, expect, beforeEach, vi } from 'vitest';
import { applyMoveEffect } from '../../src/utils/battleMechanics';
import { STATUS_CONDITIONS, MOVE_EFFECT_TYPES, MONSTER_TYPES, MOVE_CATEGORIES, MOVE_IDS } from '../../src/utils/constants';
import type { Monster, Move } from '../../src/utils/gameData';

describe('Battle Mechanics - applyMoveEffect', () => {
  let ctx: {
    t: (key: string, params?: any) => string;
    session: {
      battle: {
        log: string[];
      };
    };
  };

  let attacker: Monster;
  let defender: Monster;

  beforeEach(() => {
    ctx = {
      t: (key: string) => key,
      session: {
        battle: {
          log: []
        }
      }
    };

    attacker = {
      id: 'attacker_1',
      species: 'Grammander',
      emoji: '🦎',
      types: [MONSTER_TYPES.FIRE],
      level: 10,
      hp: 50,
      maxHp: 50,
      atk: 10,
      def: 10,
      spa: 10,
      spd: 10,
      spe: 10,
      exp: 0,
      expToNext: 100,
      moves: [],
      status: STATUS_CONDITIONS.NONE,
      stages: { atk: 0, def: 0, spa: 0, spd: 0, spe: 0 }
    };

    defender = {
      id: 'defender_1',
      species: 'Verminverb',
      emoji: '🐀',
      types: [MONSTER_TYPES.NORMAL],
      level: 10,
      hp: 40,
      maxHp: 40,
      atk: 10,
      def: 10,
      spa: 10,
      spd: 10,
      spe: 10,
      exp: 0,
      expToNext: 100,
      moves: [],
      status: STATUS_CONDITIONS.NONE,
      stages: { atk: 0, def: 0, spa: 0, spd: 0, spe: 0 }
    };
  });

  it('ignores move effects when effect chance rolls too high', () => {
    const move: Move = {
      id: 'test_move',
      name: 'Test Move',
      type: MONSTER_TYPES.NORMAL,
      category: MOVE_CATEGORIES.PHYSICAL,
      power: 40,
      accuracy: 100,
      effectType: MOVE_EFFECT_TYPES.STAT_DOWN,
      effectStat: 'def',
      effectAmount: 1,
      effectChance: 30
    };

    vi.spyOn(Math, 'random').mockReturnValue(0.4); // 40% (rolls higher than 30)

    applyMoveEffect(ctx, attacker, defender, move, 10);

    expect(defender.stages.def).toBe(0);
    expect(ctx.session.battle.log).toHaveLength(0);

    vi.restoreAllMocks();
  });

  it('applies STAT_DOWN to defender and clamps at -6', () => {
    const move: Move = {
      id: 'test_move',
      name: 'Test Move',
      type: MONSTER_TYPES.NORMAL,
      category: MOVE_CATEGORIES.PHYSICAL,
      power: 40,
      accuracy: 100,
      effectType: MOVE_EFFECT_TYPES.STAT_DOWN,
      effectStat: 'def',
      effectAmount: 2
    };

    // First application
    applyMoveEffect(ctx, attacker, defender, move, 10);
    expect(defender.stages.def).toBe(-2);
    expect(ctx.session.battle.log).toContain('battle.statDown2');

    // Clamping checks
    defender.stages.def = -5;
    applyMoveEffect(ctx, attacker, defender, move, 10);
    expect(defender.stages.def).toBe(-6);
  });

  it('applies STAT_UP to attacker and clamps at 6', () => {
    const move: Move = {
      id: 'test_move',
      name: 'Test Move',
      type: MONSTER_TYPES.NORMAL,
      category: MOVE_CATEGORIES.PHYSICAL,
      power: 40,
      accuracy: 100,
      effectType: MOVE_EFFECT_TYPES.STAT_UP,
      effectStat: 'atk',
      effectAmount: 2
    };

    // First application
    applyMoveEffect(ctx, attacker, defender, move, 10);
    expect(attacker.stages.atk).toBe(2);
    expect(ctx.session.battle.log).toContain('battle.statUp2');

    // Clamping checks
    attacker.stages.atk = 5;
    applyMoveEffect(ctx, attacker, defender, move, 10);
    expect(attacker.stages.atk).toBe(6);
  });

  it('applies CONFUSION status', () => {
    const move: Move = {
      id: 'test_move',
      name: 'Test Move',
      type: MONSTER_TYPES.NORMAL,
      category: MOVE_CATEGORIES.PHYSICAL,
      power: 40,
      accuracy: 100,
      effectType: MOVE_EFFECT_TYPES.STATUS,
      effectStat: STATUS_CONDITIONS.CONFUSION
    };

    applyMoveEffect(ctx, attacker, defender, move, 10);
    expect(defender.confusionTurns).toBeGreaterThanOrEqual(2);
    expect(defender.confusionTurns).toBeLessThanOrEqual(5);
    expect(ctx.session.battle.log).toContain('battle.isConfused');
  });

  it('applies standard STATUS conditions like SLEEP', () => {
    const move: Move = {
      id: 'test_move',
      name: 'Test Move',
      type: MONSTER_TYPES.NORMAL,
      category: MOVE_CATEGORIES.PHYSICAL,
      power: 40,
      accuracy: 100,
      effectType: MOVE_EFFECT_TYPES.STATUS,
      effectStat: STATUS_CONDITIONS.SLEEP
    };

    applyMoveEffect(ctx, attacker, defender, move, 10);
    expect(defender.status).toBe(STATUS_CONDITIONS.SLEEP);
    expect(defender.statusTurns).toBeGreaterThanOrEqual(1);
    expect(defender.statusTurns).toBeLessThanOrEqual(3);
    expect(ctx.session.battle.log).toContain('battle.statusApplied');
  });

  it('respects Type Immunities', () => {
    // 1. Fire-types immune to BURN
    const burnMove: Move = {
      id: 'burn_move',
      name: 'Burn',
      type: MONSTER_TYPES.FIRE,
      category: MOVE_CATEGORIES.PHYSICAL,
      power: 40,
      accuracy: 100,
      effectType: MOVE_EFFECT_TYPES.STATUS,
      effectStat: STATUS_CONDITIONS.BURN
    };
    defender.types = [MONSTER_TYPES.FIRE];
    applyMoveEffect(ctx, attacker, defender, burnMove, 10);
    expect(defender.status).toBe(STATUS_CONDITIONS.NONE);

    // 2. Poison-types immune to POISON
    const poisonMove: Move = {
      id: 'poison_move',
      name: 'Poison',
      type: MONSTER_TYPES.POISON,
      category: MOVE_CATEGORIES.PHYSICAL,
      power: 40,
      accuracy: 100,
      effectType: MOVE_EFFECT_TYPES.STATUS,
      effectStat: STATUS_CONDITIONS.POISON
    };
    defender.types = [MONSTER_TYPES.POISON];
    applyMoveEffect(ctx, attacker, defender, poisonMove, 10);
    expect(defender.status).toBe(STATUS_CONDITIONS.NONE);

    // 3. Electric-types immune to PARALYSIS
    const paraMove: Move = {
      id: 'para_move',
      name: 'Paralyze',
      type: MONSTER_TYPES.ELECTRIC,
      category: MOVE_CATEGORIES.PHYSICAL,
      power: 40,
      accuracy: 100,
      effectType: MOVE_EFFECT_TYPES.STATUS,
      effectStat: STATUS_CONDITIONS.PARALYSIS
    };
    defender.types = [MONSTER_TYPES.ELECTRIC];
    applyMoveEffect(ctx, attacker, defender, paraMove, 10);
    expect(defender.status).toBe(STATUS_CONDITIONS.NONE);
  });

  it('applies HEAL effect to self', () => {
    const move: Move = {
      id: 'test_move',
      name: 'Test Move',
      type: MONSTER_TYPES.NORMAL,
      category: MOVE_CATEGORIES.PHYSICAL,
      power: 40,
      accuracy: 100,
      effectType: MOVE_EFFECT_TYPES.HEAL
    };

    attacker.hp = 10;
    applyMoveEffect(ctx, attacker, defender, move, 10);
    // heals 50 / 2 = 25 hp
    expect(attacker.hp).toBe(35);
    expect(ctx.session.battle.log).toContain('battle.healed');
  });

  it('applies DRAIN effect to self based on damage dealt', () => {
    const move: Move = {
      id: 'test_move',
      name: 'Test Move',
      type: MONSTER_TYPES.NORMAL,
      category: MOVE_CATEGORIES.PHYSICAL,
      power: 40,
      accuracy: 100,
      effectType: MOVE_EFFECT_TYPES.DRAIN
    };

    attacker.hp = 10;
    applyMoveEffect(ctx, attacker, defender, move, 20);
    // drains 20 / 2 = 10 hp
    expect(attacker.hp).toBe(20);
    expect(ctx.session.battle.log).toContain('battle.drained');
  });

  it('applies RECOIL effect to self based on damage dealt', () => {
    const move: Move = {
      id: 'test_move',
      name: 'Test Move',
      type: MONSTER_TYPES.NORMAL,
      category: MOVE_CATEGORIES.PHYSICAL,
      power: 40,
      accuracy: 100,
      effectType: MOVE_EFFECT_TYPES.RECOIL
    };

    attacker.hp = 40;
    applyMoveEffect(ctx, attacker, defender, move, 40);
    // recoil is 40 / 4 = 10 hp
    expect(attacker.hp).toBe(30);
    expect(ctx.session.battle.log).toContain('battle.recoil');
  });

  it('applies Transform effect by copying species, types, moves, and stats', () => {
    const move: Move = {
      id: MOVE_IDS.Transform,
      name: 'Transform',
      type: MONSTER_TYPES.NORMAL,
      category: MOVE_CATEGORIES.STATUS,
      power: 0,
      accuracy: 100
    };

    defender.species = 'Squirtspell';
    defender.types = [MONSTER_TYPES.WATER];
    defender.atk = 22;
    defender.moves = ['Bubble'];

    applyMoveEffect(ctx, attacker, defender, move, 0);

    expect(attacker.species).toBe('Squirtspell');
    expect(attacker.types).toContain(MONSTER_TYPES.WATER);
    expect(attacker.atk).toBe(22);
    expect(attacker.moves).toContain('Bubble');
    expect(ctx.session.battle.log).toContain('battle.transformed');
  });

  it('applies LeechSeed effect by seeding the defender', () => {
    const move: Move = {
      id: MOVE_IDS.LeechSeed,
      name: 'Leech Seed',
      type: MONSTER_TYPES.GRASS,
      category: MOVE_CATEGORIES.STATUS,
      power: 0,
      accuracy: 100
    };

    applyMoveEffect(ctx, attacker, defender, move, 0);

    expect((defender as any).isSeeded).toBe(true);
    expect(ctx.session.battle.log).toContain('battle.seeded');
  });
});
