export const MONS = {
  // Starters
  Grammander: { name: 'Grammander', type: 'Fire', baseHp: 39, baseAtk: 52, baseDef: 43, baseSpd: 65, evolvesAt: 16, evolvesInto: 'Wordmeleon' },
  Wordmeleon: { name: 'Wordmeleon', type: 'Fire', baseHp: 58, baseAtk: 64, baseDef: 58, baseSpd: 80, evolvesAt: 36, evolvesInto: 'Spelchar' },
  Spelchar: { name: 'Spelchar', type: 'Fire', baseHp: 78, baseAtk: 84, baseDef: 78, baseSpd: 100 },

  Squirtspell: { name: 'Squirtspell', type: 'Water', baseHp: 44, baseAtk: 48, baseDef: 65, baseSpd: 43, evolvesAt: 16, evolvesInto: 'Wartword' },
  Wartword: { name: 'Wartword', type: 'Water', baseHp: 59, baseAtk: 63, baseDef: 80, baseSpd: 58, evolvesAt: 36, evolvesInto: 'Blastlexis' },
  Blastlexis: { name: 'Blastlexis', type: 'Water', baseHp: 79, baseAtk: 83, baseDef: 100, baseSpd: 78 },

  Bulbaword: { name: 'Bulbaword', type: 'Grass', baseHp: 45, baseAtk: 49, baseDef: 49, baseSpd: 45, evolvesAt: 16, evolvesInto: 'Ivysyllable' },
  Ivysyllable: { name: 'Ivysyllable', type: 'Grass', baseHp: 60, baseAtk: 62, baseDef: 63, baseSpd: 60, evolvesAt: 32, evolvesInto: 'Venusterm' },
  Venusterm: { name: 'Venusterm', type: 'Grass', baseHp: 80, baseAtk: 82, baseDef: 83, baseSpd: 80 },

  Pikachart: { name: 'Pikachart', type: 'Electric', baseHp: 35, baseAtk: 55, baseDef: 40, baseSpd: 90, evolvesAt: 20, evolvesInto: 'Raichure' },
  Raichure: { name: 'Raichure', type: 'Electric', baseHp: 60, baseAtk: 90, baseDef: 55, baseSpd: 110 },

  // Wild Mons
  Rattatext: { name: 'Rattatext', type: 'Normal', baseHp: 30, baseAtk: 56, baseDef: 35, baseSpd: 72 },
  Pidgeyparagraph: { name: 'Pidgeyparagraph', type: 'Flying', baseHp: 40, baseAtk: 45, baseDef: 40, baseSpd: 56 },
  Nidoranotes: { name: 'Nidoranotes', type: 'Poison', baseHp: 46, baseAtk: 57, baseDef: 40, baseSpd: 50 },
  Mankeymath: { name: 'Mankeymath', type: 'Fighting', baseHp: 40, baseAtk: 80, baseDef: 35, baseSpd: 70 },
  Geodudeo: { name: 'Geodudeo', type: 'Rock', baseHp: 40, baseAtk: 80, baseDef: 100, baseSpd: 20 },
  Slowspell: { name: 'Slowspell', type: 'Psychic', baseHp: 90, baseAtk: 65, baseDef: 65, baseSpd: 15 },
};

export const TYPE_EMOJIS = {
  Fire: '🔥',
  Water: '💧',
  Grass: '🌿',
  Electric: '⚡',
  Normal: '🐾',
  Flying: '🦅',
  Poison: '☠️',
  Fighting: '🥊',
  Rock: '🪨',
  Psychic: '🔮',
};

export const TYPE_CHART = {
  Normal: {},
  Fire: { Grass: 2, Water: 0.5, Fire: 0.5, Rock: 0.5 },
  Water: { Fire: 2, Water: 0.5, Grass: 0.5, Rock: 2 },
  Grass: { Water: 2, Grass: 0.5, Fire: 0.5, Rock: 2 },
  Electric: { Water: 2, Grass: 0.5, Electric: 0.5, Flying: 2 },
  Flying: { Grass: 2, Electric: 0.5, Fighting: 2 },
  Poison: { Grass: 2, Poison: 0.5, Rock: 0.5 },
  Fighting: { Normal: 2, Rock: 2, Flying: 0.5, Poison: 0.5, Psychic: 0.5 },
  Rock: { Fire: 2, Fighting: 0.5, Flying: 2 },
  Psychic: { Fighting: 2, Poison: 2, Psychic: 0.5 },
};

export function calculateStat(base, level, isHp = false) {
  // Simplified Pokemon stat formula
  // IV is assumed 31, EV is 0
  const iv = 31;
  if (isHp) {
    return Math.floor(((2 * base + iv) * level) / 100) + level + 10;
  }
  return Math.floor(((2 * base + iv) * level) / 100) + 5;
}

export function calculateDamage(attacker, defender, basePower, difficultyMultiplier = 1) {
  const atk = attacker.atk || calculateStat(MONS[attacker.species]?.baseAtk || 50, attacker.level);
  const def = defender.def || calculateStat(MONS[defender.species]?.baseDef || 50, defender.level);

  const typeMod = TYPE_CHART[attacker.type]?.[defender.type] || 1;

  // Simplified Pokemon damage formula
  // Damage = (((2 * level / 5 + 2) * Power * A/D) / 50 + 2) * Multiplier
  const levelPart = (2 * attacker.level) / 5 + 2;
  const statRatio = atk / def;
  const baseDamage = ((levelPart * basePower * statRatio) / 50) + 2;

  const finalDamage = Math.floor(baseDamage * typeMod * difficultyMultiplier);
  return {
    damage: Math.max(1, finalDamage),
    typeMod,
  };
}

export function calculateExpToNext(level) {
  return Math.pow(level, 3);
}

export function createMon(species, level = 5) {
  const base = MONS[species] || MONS.Rattatext;
  const hp = calculateStat(base.baseHp, level, true);
  const atk = calculateStat(base.baseAtk, level);
  const def = calculateStat(base.baseDef, level);
  const spd = calculateStat(base.baseSpd, level);

  return {
    species,
    name: base.name,
    type: base.type,
    level,
    hp,
    maxHp: hp,
    atk,
    def,
    spd,
    exp: 0,
    expToNext: calculateExpToNext(level),
    id: Math.random().toString(36).slice(2, 11)
  };
}

export function calculateExpGain(enemyMon, isTrainer) {
  const baseExp = 50;
  const levelBonus = enemyMon.level * 10;
  const trainerBonus = isTrainer ? 1.5 : 1.0;
  return Math.floor((baseExp + levelBonus) * trainerBonus);
}

export const AREA_CONFIGS = {
  1: {
    name: 'Route 1',
    minLevel: 2,
    maxLevel: 5,
    encounters: ['Rattatext', 'Pidgeyparagraph'],
    layout: {
      grass: [{ x1: 3, y1: 3, x2: 7, y2: 7 }, { x1: 13, y1: 13, x2: 17, y2: 17 }],
      spellCenter: { x: 10, y: 10 },
      trainers: [{ x: 5, y: 15 }]
    }
  },
  2: {
    name: 'Route 2',
    minLevel: 6,
    maxLevel: 10,
    encounters: ['Pikachart', 'Nidoranotes'],
    layout: {
      grass: [{ x1: 3, y1: 9, x2: 17, y2: 11 }],
      spellCenter: { x: 10, y: 10 },
      trainers: [{ x: 15, y: 5 }]
    }
  },
  3: {
    name: 'Route 3',
    minLevel: 11,
    maxLevel: 15,
    encounters: ['Mankeymath', 'Geodudeo'],
    layout: {
      grass: [{ x1: 3, y1: 3, x2: 7, y2: 7 }, { x1: 13, y1: 13, x2: 17, y2: 17 }],
      spellCenter: { x: 10, y: 10 },
      trainers: [{ x: 5, y: 15 }, { x: 15, y: 5 }]
    }
  },
  4: {
    name: 'Route 4',
    minLevel: 16,
    maxLevel: 20,
    encounters: ['Slowspell'],
    layout: {
      grass: [{ x1: 3, y1: 9, x2: 17, y2: 11 }],
      spellCenter: { x: 10, y: 10 },
      trainers: [{ x: 5, y: 15 }]
    }
  },
  5: {
    name: 'Route 5',
    minLevel: 21,
    maxLevel: 30,
    encounters: ['Slowspell', 'Pikachart'],
    layout: {
      grass: [{ x1: 3, y1: 3, x2: 17, y2: 17 }],
      spellCenter: { x: 10, y: 10 },
      trainers: [{ x: 5, y: 5 }]
    }
  },
};

export const TRAINERS = {
  1: [{ name: 'Youngster Joey', dialog: 'My Rattatext is top percentage!', party: [{ species: 'Rattatext', level: 4 }] }],
  2: [{ name: 'Lass Haley', dialog: 'Did you know you can catch these?', party: [{ species: 'Pidgeyparagraph', level: 8 }] }],
  3: [
    { name: 'Hiker Erik', dialog: 'Sturdy as a rock!', party: [{ species: 'Geodudeo', level: 14 }] },
    { name: 'Camper Ted', dialog: 'Nature is great!', party: [{ species: 'Mankeymath', level: 13 }] }
  ],
  4: [{ name: 'Psychic Mark', dialog: 'I saw you coming...', party: [{ species: 'Slowspell', level: 19 }] }],
  5: [{ name: 'Ace Trainer Red', dialog: '...', party: [{ species: 'Pikachart', level: 28 }] }],
};
