export const MONS = {
  Grammander: { name: 'Grammander', type: 'Fire', hp: 20, maxHp: 20, level: 5, exp: 0 },
  Squirtspell: { name: 'Squirtspell', type: 'Water', hp: 22, maxHp: 22, level: 5, exp: 0 },
  Bulbaword: { name: 'Bulbaword', type: 'Grass', hp: 24, maxHp: 24, level: 5, exp: 0 },
  Pikachart: { name: 'Pikachart', type: 'Electric', hp: 18, maxHp: 18, level: 5, exp: 0 },
  Rattatext: { name: 'Rattatext', type: 'Normal', hp: 15, maxHp: 15, level: 3, exp: 0 },
  Pidgeyparagraph: { name: 'Pidgeyparagraph', type: 'Flying', hp: 16, maxHp: 16, level: 3, exp: 0 },
  Nidoranotes: { name: 'Nidoranotes', type: 'Poison', hp: 25, maxHp: 25, level: 10, exp: 0 },
  Mankeymath: { name: 'Mankeymath', type: 'Fighting', hp: 30, maxHp: 30, level: 12, exp: 0 },
  Geodudeo: { name: 'Geodudeo', type: 'Rock', hp: 35, maxHp: 35, level: 15, exp: 0 },
  Slowspell: { name: 'Slowspell', type: 'Psychic', hp: 50, maxHp: 50, level: 20, exp: 0 },
};

export function createMon(species, level = 5) {
  const base = MONS[species] || MONS.Rattatext;
  const hp = Math.floor(base.maxHp * (level / base.level));
  return {
    ...base,
    level,
    hp,
    maxHp: hp,
    exp: 0,
    expToNext: Math.pow(level, 3),
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
