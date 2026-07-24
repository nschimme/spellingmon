import { STATUS_CONDITIONS, MOVE_EFFECT_TYPES, MONSTER_TYPES, MOVE_IDS } from './constants';
import { type Monster, type Move } from './gameData';

export function applyMoveEffect(
  ctx: { t: (key: string, params?: any) => string; session: { battle: { log: string[] } } },
  attacker: Monster,
  defender: Monster,
  move: Move,
  damage: number
): void {
  const t = ctx.t;
  const log = ctx.session.battle.log;

  if (move.id === MOVE_IDS.Transform) {
     attacker.species = defender.species;
     attacker.emoji = defender.emoji;
     attacker.types = [...defender.types];
     attacker.atk = defender.atk;
     attacker.def = defender.def;
     attacker.spa = defender.spa;
     attacker.spd = defender.spd;
     attacker.spe = defender.spe;
     attacker.moves = [...defender.moves];
     log.push(t('battle.transformed', { attacker: t('monsters.' + attacker.species), defender: t('monsters.' + defender.species) }));
     return;
  }

  if (move.id === MOVE_IDS.LeechSeed) {
     if (!defender.isSeeded) {
        defender.isSeeded = true;
        log.push(t('battle.seeded', { name: t('monsters.' + defender.species) }));
     }
     return;
  }

  const chance = move.effectChance || 100;
  const roll = Math.random() * 100;

  if (roll > chance) return;

  const type = move.effectType;
  const stat = move.effectStat;
  const amount = move.effectAmount || 1;

  if (type === MOVE_EFFECT_TYPES.STAT_DOWN) {
     const target = defender;
     target.stages[stat!] = Math.max(-6, (target.stages[stat!] || 0) - amount);
     log.push(t(amount > 1 ? 'battle.statDown2' : 'battle.statDown', { mon: t('monsters.' + target.species), stat: t('battle.stats.' + stat) }));
  } else if (type === MOVE_EFFECT_TYPES.STAT_UP) {
     const target = attacker;
     target.stages[stat!] = Math.min(6, (target.stages[stat!] || 0) + amount);
     log.push(t(amount > 1 ? 'battle.statUp2' : 'battle.statUp', { mon: t('monsters.' + target.species), stat: t('battle.stats.' + stat) }));
  } else if (type === MOVE_EFFECT_TYPES.STATUS) {
     if (stat === STATUS_CONDITIONS.CONFUSION) {
        if (!defender.confusionTurns) {
           defender.confusionTurns = 2 + Math.floor(Math.random() * 4);
           log.push(t('battle.isConfused', { name: t('monsters.' + defender.species) }));
        }
        return;
     }

     if (defender.status === STATUS_CONDITIONS.NONE) {
        // Type immunities
        if (stat === STATUS_CONDITIONS.BURN && defender.types.includes(MONSTER_TYPES.FIRE)) return;
        if (stat === STATUS_CONDITIONS.POISON && (defender.types.includes(MONSTER_TYPES.POISON) || defender.types.includes(MONSTER_TYPES.STEEL))) return;
        if (stat === STATUS_CONDITIONS.PARALYSIS && defender.types.includes(MONSTER_TYPES.ELECTRIC)) return;

        defender.status = STATUS_CONDITIONS[stat as keyof typeof STATUS_CONDITIONS];
        if (defender.status === STATUS_CONDITIONS.SLEEP) {
           defender.statusTurns = 1 + Math.floor(Math.random() * 3);
        }
        log.push(t('battle.statusApplied', { mon: t('monsters.' + defender.species), status: t('battle.status.' + stat!.toLowerCase()) }));
     }
  } else if (type === MOVE_EFFECT_TYPES.HEAL) {
     const heal = Math.floor(attacker.maxHp / 2);
     attacker.hp = Math.min(attacker.maxHp, attacker.hp + heal);
     log.push(t('battle.healed', { name: t('monsters.' + attacker.species) }));
  } else if (type === MOVE_EFFECT_TYPES.DRAIN) {
     const heal = Math.floor(damage / 2);
     attacker.hp = Math.min(attacker.maxHp, attacker.hp + heal);
     log.push(t('battle.drained', { name: t('monsters.' + attacker.species) }));
  } else if (type === MOVE_EFFECT_TYPES.RECOIL) {
     const recoil = Math.floor(damage / 4);
     attacker.hp = Math.max(0, attacker.hp - recoil);
     log.push(t('battle.recoil', { name: t('monsters.' + attacker.species) }));
  }
}
