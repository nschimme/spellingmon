import { MONSTER_TYPES } from './constants';

export const MONS = {
  // Starters
  Grammander: { name: 'Grammander', type: MONSTER_TYPES.FIRE, emoji: '🦎', baseHp: 39, baseAtk: 52, baseDef: 43, baseSpd: 65, evolvesAt: 16, evolvesInto: 'Wordmeleon' },
  Wordmeleon: { name: 'Wordmeleon', type: MONSTER_TYPES.FIRE, emoji: '🦖', baseHp: 58, baseAtk: 64, baseDef: 58, baseSpd: 80, evolvesAt: 36, evolvesInto: 'Spelchar' },
  Spelchar: { name: 'Spelchar', type: MONSTER_TYPES.FIRE, emoji: '🐉', baseHp: 78, baseAtk: 84, baseDef: 78, baseSpd: 100 },

  Squirtspell: { name: 'Squirtspell', type: MONSTER_TYPES.WATER, emoji: '🐢', baseHp: 44, baseAtk: 48, baseDef: 65, baseSpd: 43, evolvesAt: 16, evolvesInto: 'Wartword' },
  Wartword: { name: 'Wartword', type: MONSTER_TYPES.WATER, emoji: '🛡️', baseHp: 59, baseAtk: 63, baseDef: 80, baseSpd: 58, evolvesAt: 36, evolvesInto: 'Blastlexis' },
  Blastlexis: { name: 'Blastlexis', type: MONSTER_TYPES.WATER, emoji: '🌊', baseHp: 79, baseAtk: 83, baseDef: 100, baseSpd: 78 },

  Bulbaword: { name: 'Bulbaword', type: MONSTER_TYPES.GRASS, emoji: '🍃', baseHp: 45, baseAtk: 49, baseDef: 49, baseSpd: 45, evolvesAt: 16, evolvesInto: 'Ivysyllable' },
  Ivysyllable: { name: 'Ivysyllable', type: MONSTER_TYPES.GRASS, emoji: '🌺', baseHp: 60, baseAtk: 62, baseDef: 63, baseSpd: 60, evolvesAt: 32, evolvesInto: 'Venusterm' },
  Venusterm: { name: 'Venusterm', type: MONSTER_TYPES.GRASS, emoji: '🌴', baseHp: 80, baseAtk: 82, baseDef: 83, baseSpd: 80 },

  Pikachart: { name: 'Pikachart', type: MONSTER_TYPES.ELECTRIC, emoji: '🐭', baseHp: 35, baseAtk: 55, baseDef: 40, baseSpd: 90, evolvesAt: 20, evolvesInto: 'Raichure' },
  Raichure: { name: 'Raichure', type: MONSTER_TYPES.ELECTRIC, emoji: '⚡', baseHp: 60, baseAtk: 90, baseDef: 55, baseSpd: 110 },

  // Wild Mons & Evolutions
  Caterspell: { name: 'Caterspell', type: MONSTER_TYPES.BUG, emoji: '🐛', baseHp: 45, baseAtk: 30, baseDef: 35, baseSpd: 45, evolvesAt: 7, evolvesInto: 'Metaphrase' },
  Metaphrase: { name: 'Metaphrase', type: MONSTER_TYPES.BUG, emoji: '📦', baseHp: 50, baseAtk: 20, baseDef: 55, baseSpd: 30, evolvesAt: 10, evolvesInto: 'Butterfluent' },
  Butterfluent: { name: 'Butterfluent', type: MONSTER_TYPES.BUG, emoji: '🦋', baseHp: 60, baseAtk: 45, baseDef: 50, baseSpd: 70 },

  Weedword: { name: 'Weedword', type: MONSTER_TYPES.BUG, emoji: '🐛', baseHp: 40, baseAtk: 35, baseDef: 30, baseSpd: 50, evolvesAt: 7, evolvesInto: 'Verbakuna' },
  Verbakuna: { name: 'Verbakuna', type: MONSTER_TYPES.BUG, emoji: '🍯', baseHp: 45, baseAtk: 25, baseDef: 50, baseSpd: 35, evolvesAt: 10, evolvesInto: 'Beedictionary' },
  Beedictionary: { name: 'Beedictionary', type: MONSTER_TYPES.BUG, emoji: '🐝', baseHp: 65, baseAtk: 80, baseDef: 40, baseSpd: 75 },

  Aviprosa: { name: 'Aviprosa', type: MONSTER_TYPES.FLYING, emoji: '🐦', baseHp: 40, baseAtk: 45, baseDef: 40, baseSpd: 56, evolvesAt: 18, evolvesInto: 'Syntaxo' },
  Syntaxo: { name: 'Syntaxo', type: MONSTER_TYPES.FLYING, emoji: '🦅', baseHp: 63, baseAtk: 60, baseDef: 55, baseSpd: 71, evolvesAt: 36, evolvesInto: 'Vocalis' },
  Vocalis: { name: 'Vocalis', type: MONSTER_TYPES.FLYING, emoji: '👑', baseHp: 83, baseAtk: 80, baseDef: 75, baseSpd: 91 },

  Verminverb: { name: 'Verminverb', type: MONSTER_TYPES.NORMAL, emoji: '🐀', baseHp: 30, baseAtk: 56, baseDef: 35, baseSpd: 72, evolvesAt: 20, evolvesInto: 'Lexicat' },
  Lexicat: { name: 'Lexicat', type: MONSTER_TYPES.NORMAL, emoji: '🐀', baseHp: 55, baseAtk: 81, baseDef: 60, baseSpd: 97 },

  Penpigeon: { name: 'Penpigeon', type: MONSTER_TYPES.FLYING, emoji: '🐦', baseHp: 40, baseAtk: 60, baseDef: 30, baseSpd: 70, evolvesAt: 20, evolvesInto: 'Foliofalcon' },
  Foliofalcon: { name: 'Foliofalcon', type: MONSTER_TYPES.FLYING, emoji: '🦅', baseHp: 65, baseAtk: 90, baseDef: 65, baseSpd: 100 },

  Slinkscript: { name: 'Slinkscript', type: MONSTER_TYPES.POISON, emoji: '🐍', baseHp: 35, baseAtk: 60, baseDef: 44, baseSpd: 55, evolvesAt: 22, evolvesInto: 'Vipervocab' },
  Vipervocab: { name: 'Vipervocab', type: MONSTER_TYPES.POISON, emoji: '🐍', baseHp: 60, baseAtk: 85, baseDef: 69, baseSpd: 80 },

  Burrowbook: { name: 'Burrowbook', type: MONSTER_TYPES.GROUND, emoji: '🦔', baseHp: 50, baseAtk: 75, baseDef: 85, baseSpd: 40, evolvesAt: 22, evolvesInto: 'Quillquote' },
  Quillquote: { name: 'Quillquote', type: MONSTER_TYPES.GROUND, emoji: '🦔', baseHp: 75, baseAtk: 100, baseDef: 110, baseSpd: 65 },

  Pointernote: { name: 'Pointernote', type: MONSTER_TYPES.POISON, emoji: '🦂', baseHp: 46, baseAtk: 57, baseDef: 40, baseSpd: 50, evolvesAt: 16, evolvesInto: 'Venomverse' },
  Venomverse: { name: 'Venomverse', type: MONSTER_TYPES.POISON, emoji: '🦂', baseHp: 61, baseAtk: 72, baseDef: 57, baseSpd: 65, evolvesAt: 36, evolvesInto: 'Toxiterm' },
  Toxiterm: { name: 'Toxiterm', type: MONSTER_TYPES.POISON, emoji: '👑', baseHp: 81, baseAtk: 92, baseDef: 77, baseSpd: 85 },

  Clausefairy: { name: 'Clausefairy', type: MONSTER_TYPES.NORMAL, emoji: '🧚', baseHp: 70, baseAtk: 45, baseDef: 48, baseSpd: 35, evolvesAt: 25, evolvesInto: 'Citable' },
  Citable: { name: 'Citable', type: MONSTER_TYPES.NORMAL, emoji: '🧚', baseHp: 95, baseAtk: 70, baseDef: 73, baseSpd: 60 },

  Foxphrase: { name: 'Foxphrase', type: MONSTER_TYPES.FIRE, emoji: '🦊', baseHp: 38, baseAtk: 41, baseDef: 40, baseSpd: 65, evolvesAt: 25, evolvesInto: 'Fablefire' },
  Fablefire: { name: 'Fablefire', type: MONSTER_TYPES.FIRE, emoji: '🦊', baseHp: 73, baseAtk: 76, baseDef: 75, baseSpd: 100 },

  Puffpoet: { name: 'Puffpoet', type: MONSTER_TYPES.NORMAL, emoji: '🎈', baseHp: 115, baseAtk: 45, baseDef: 20, baseSpd: 20, evolvesAt: 25, evolvesInto: 'Balloonbard' },
  Balloonbard: { name: 'Balloonbard', type: MONSTER_TYPES.NORMAL, emoji: '🎈', baseHp: 140, baseAtk: 70, baseDef: 45, baseSpd: 45 },

  Wingword: { name: 'Wingword', type: MONSTER_TYPES.POISON, emoji: '🦇', baseHp: 40, baseAtk: 45, baseDef: 35, baseSpd: 55, evolvesAt: 22, evolvesInto: 'Echoedit' },
  Echoedit: { name: 'Echoedit', type: MONSTER_TYPES.POISON, emoji: '🦇', baseHp: 75, baseAtk: 80, baseDef: 70, baseSpd: 90 },

  Odeish: { name: 'Odeish', type: MONSTER_TYPES.GRASS, emoji: '🌱', baseHp: 45, baseAtk: 50, baseDef: 55, baseSpd: 30, evolvesAt: 21, evolvesInto: 'Grammgloom' },
  Grammgloom: { name: 'Grammgloom', type: MONSTER_TYPES.GRASS, emoji: '🤢', baseHp: 60, baseAtk: 65, baseDef: 70, baseSpd: 40, evolvesAt: 32, evolvesInto: 'Vocabplume' },
  Vocabplume: { name: 'Vocabplume', type: MONSTER_TYPES.GRASS, emoji: '🌸', baseHp: 75, baseAtk: 80, baseDef: 85, baseSpd: 50 },

  Phraseling: { name: 'Phraseling', type: MONSTER_TYPES.BUG, emoji: '🍄', baseHp: 35, baseAtk: 70, baseDef: 55, baseSpd: 25, evolvesAt: 24, evolvesInto: 'Paragraphid' },
  Paragraphid: { name: 'Paragraphid', type: MONSTER_TYPES.BUG, emoji: '🍄', baseHp: 60, baseAtk: 95, baseDef: 80, baseSpd: 30 },

  Voicenat: { name: 'Voicenat', type: MONSTER_TYPES.BUG, emoji: '🕷️', baseHp: 60, baseAtk: 55, baseDef: 50, baseSpd: 45, evolvesAt: 31, evolvesInto: 'Vowelmoth' },
  Vowelmoth: { name: 'Vowelmoth', type: MONSTER_TYPES.BUG, emoji: '🦋', baseHp: 70, baseAtk: 65, baseDef: 60, baseSpd: 90 },

  Dictatone: { name: 'Dictatone', type: MONSTER_TYPES.GROUND, emoji: '⛰️', baseHp: 10, baseAtk: 55, baseDef: 25, baseSpd: 95, evolvesAt: 26, evolvesInto: 'Dialogrio' },
  Dialogrio: { name: 'Dialogrio', type: MONSTER_TYPES.GROUND, emoji: '⛰️', baseHp: 35, baseAtk: 80, baseDef: 50, baseSpd: 120 },

  Memocat: { name: 'Memocat', type: MONSTER_TYPES.NORMAL, emoji: '🐱', baseHp: 40, baseAtk: 45, baseDef: 35, baseSpd: 90, evolvesAt: 28, evolvesInto: 'Poetcat' },
  Poetcat: { name: 'Poetcat', type: MONSTER_TYPES.NORMAL, emoji: '🐱', baseHp: 65, baseAtk: 70, baseDef: 60, baseSpd: 115 },

  Punderduck: { name: 'Punderduck', type: MONSTER_TYPES.WATER, emoji: '🦆', baseHp: 50, baseAtk: 52, baseDef: 48, baseSpd: 55, evolvesAt: 33, evolvesInto: 'Quackquote' },
  Quackquote: { name: 'Quackquote', type: MONSTER_TYPES.WATER, emoji: '🦆', baseHp: 80, baseAtk: 82, baseDef: 78, baseSpd: 85 },

  Primath: { name: 'Primath', type: MONSTER_TYPES.FIGHTING, emoji: '🐒', baseHp: 40, baseAtk: 80, baseDef: 35, baseSpd: 70, evolvesAt: 28, evolvesInto: 'Gorillagram' },
  Gorillagram: { name: 'Gorillagram', type: MONSTER_TYPES.FIGHTING, emoji: '🐒', baseHp: 65, baseAtk: 105, baseDef: 60, baseSpd: 95 },

  Barkbook: { name: 'Barkbook', type: MONSTER_TYPES.FIRE, emoji: '🐶', baseHp: 55, baseAtk: 70, baseDef: 45, baseSpd: 60, evolvesAt: 30, evolvesInto: 'Houndhaiku' },
  Houndhaiku: { name: 'Houndhaiku', type: MONSTER_TYPES.FIRE, emoji: '🐕', baseHp: 90, baseAtk: 110, baseDef: 80, baseSpd: 95 },

  Printwag: { name: 'Printwag', type: MONSTER_TYPES.WATER, emoji: '🌀', baseHp: 40, baseAtk: 50, baseDef: 40, baseSpd: 90, evolvesAt: 25, evolvesInto: 'Pagewhirl' },
  Pagewhirl: { name: 'Pagewhirl', type: MONSTER_TYPES.WATER, emoji: '🌀', baseHp: 65, baseAtk: 65, baseDef: 65, baseSpd: 90, evolvesAt: 36, evolvesInto: 'Paperwrath' },
  Paperwrath: { name: 'Paperwrath', type: MONSTER_TYPES.WATER, emoji: '🐸', baseHp: 90, baseAtk: 95, baseDef: 95, baseSpd: 70 },

  Abstra: { name: 'Abstra', type: MONSTER_TYPES.PSYCHIC, emoji: '🧠', baseHp: 25, baseAtk: 20, baseDef: 15, baseSpd: 90, evolvesAt: 16, evolvesInto: 'Keydabra' },
  Keydabra: { name: 'Keydabra', type: MONSTER_TYPES.PSYCHIC, emoji: '🧠', baseHp: 40, baseAtk: 35, baseDef: 30, baseSpd: 105, evolvesAt: 36, evolvesInto: 'Archizam' },
  Archizam: { name: 'Archizam', type: MONSTER_TYPES.PSYCHIC, emoji: '🧠', baseHp: 55, baseAtk: 50, baseDef: 45, baseSpd: 120 },

  Chopscript: { name: 'Chopscript', type: MONSTER_TYPES.FIGHTING, emoji: '💪', baseHp: 70, baseAtk: 80, baseDef: 50, baseSpd: 35, evolvesAt: 28, evolvesInto: 'Chokemessage' },
  Chokemessage: { name: 'Chokemessage', type: MONSTER_TYPES.FIGHTING, emoji: '💪', baseHp: 80, baseAtk: 100, baseDef: 70, baseSpd: 45, evolvesAt: 36, evolvesInto: 'Champmanual' },
  Champmanual: { name: 'Champmanual', type: MONSTER_TYPES.FIGHTING, emoji: '💪', baseHp: 90, baseAtk: 130, baseDef: 80, baseSpd: 55 },

  Rudeo: { name: 'Rudeo', type: MONSTER_TYPES.ROCK, emoji: '🪨', baseHp: 40, baseAtk: 80, baseDef: 100, baseSpd: 20, evolvesAt: 25, evolvesInto: 'Glossler' },
  Glossler: { name: 'Glossler', type: MONSTER_TYPES.ROCK, emoji: '🪨', baseHp: 55, baseAtk: 95, baseDef: 115, baseSpd: 35, evolvesAt: 36, evolvesInto: 'Textlem' },
  Textlem: { name: 'Textlem', type: MONSTER_TYPES.ROCK, emoji: '🪨', baseHp: 80, baseAtk: 120, baseDef: 130, baseSpd: 45 },

  Spellpoke: { name: 'Spellpoke', type: MONSTER_TYPES.PSYCHIC, emoji: '🧠', baseHp: 90, baseAtk: 65, baseDef: 65, baseSpd: 15, evolvesAt: 37, evolvesInto: 'Bookbro' },
  Bookbro: { name: 'Bookbro', type: MONSTER_TYPES.PSYCHIC, emoji: '🐚', baseHp: 95, baseAtk: 75, baseDef: 110, baseSpd: 30 },

  Ghostwriter: { name: 'Ghostwriter', type: MONSTER_TYPES.GHOST, emoji: '👻', baseHp: 30, baseAtk: 35, baseDef: 30, baseSpd: 80, evolvesAt: 25, evolvesInto: 'Haikunter' },
  Haikunter: { name: 'Haikunter', type: MONSTER_TYPES.GHOST, emoji: '👻', baseHp: 45, baseAtk: 50, baseDef: 45, baseSpd: 95, evolvesAt: 36, evolvesInto: 'Gramgar' },
  Gramgar: { name: 'Gramgar', type: MONSTER_TYPES.GHOST, emoji: '😈', baseHp: 60, baseAtk: 65, baseDef: 60, baseSpd: 110 },

  Outlinix: { name: 'Outlinix', type: MONSTER_TYPES.ROCK, emoji: '🐍', baseHp: 35, baseAtk: 45, baseDef: 160, baseSpd: 70 },

  Copybone: { name: 'Copybone', type: MONSTER_TYPES.GROUND, emoji: '🦴', baseHp: 50, baseAtk: 50, baseDef: 95, baseSpd: 35, evolvesAt: 28, evolvesInto: 'Memowak' },
  Memowak: { name: 'Memowak', type: MONSTER_TYPES.GROUND, emoji: '🦴', baseHp: 60, baseAtk: 80, baseDef: 110, baseSpd: 45 },

  Leeletter: { name: 'Leeletter', type: MONSTER_TYPES.FIGHTING, emoji: '🦵', baseHp: 50, baseAtk: 120, baseDef: 53, baseSpd: 87 },
  Chanhistory: { name: 'Chanhistory', type: MONSTER_TYPES.FIGHTING, emoji: '🥊', baseHp: 50, baseAtk: 105, baseDef: 79, baseSpd: 76 },

  Kerneloff: { name: 'Kerneloff', type: MONSTER_TYPES.POISON, emoji: '💣', baseHp: 40, baseAtk: 65, baseDef: 95, baseSpd: 35, evolvesAt: 35, evolvesInto: 'Wordweeze' },
  Wordweeze: { name: 'Wordweeze', type: MONSTER_TYPES.POISON, emoji: '💨', baseHp: 65, baseAtk: 90, baseDef: 120, baseSpd: 60 },

  Citesey: { name: 'Citesey', type: MONSTER_TYPES.NORMAL, emoji: '🥚', baseHp: 250, baseAtk: 5, baseDef: 5, baseSpd: 50 },

  Scrypt: { name: 'Scrypt', type: MONSTER_TYPES.BUG, emoji: '🔪', baseHp: 70, baseAtk: 110, baseDef: 80, baseSpd: 105 },

  Finfolio: { name: 'Finfolio', type: MONSTER_TYPES.WATER, emoji: '🐟', baseHp: 20, baseAtk: 10, baseDef: 55, baseSpd: 80, evolvesAt: 20, evolvesInto: 'Seaslang' },
  Seaslang: { name: 'Seaslang', type: MONSTER_TYPES.WATER, emoji: '🐉', baseHp: 95, baseAtk: 125, baseDef: 79, baseSpd: 81 },

  Legendras: { name: 'Legendras', type: MONSTER_TYPES.WATER, emoji: '⛵', baseHp: 130, baseAtk: 85, baseDef: 80, baseSpd: 60 },

  Drafto: { name: 'Drafto', type: MONSTER_TYPES.NORMAL, emoji: '👥', baseHp: 48, baseAtk: 48, baseDef: 48, baseSpd: 48 },

  Essayve: { name: 'Essayve', type: MONSTER_TYPES.NORMAL, emoji: '🐕', baseHp: 55, baseAtk: 55, baseDef: 50, baseSpd: 55, evolvesAt: 20, evolvesInto: 'Verseon' }, // Simplified evolution
  Verseon: { name: 'Verseon', type: MONSTER_TYPES.WATER, emoji: '🧜', baseHp: 130, baseAtk: 65, baseDef: 60, baseSpd: 65 },
  Jingleon: { name: 'Jingleon', type: MONSTER_TYPES.ELECTRIC, emoji: '⚡', baseHp: 65, baseAtk: 65, baseDef: 60, baseSpd: 130 },
  Noteon: { name: 'Noteon', type: MONSTER_TYPES.FIRE, emoji: '🔥', baseHp: 65, baseAtk: 130, baseDef: 60, baseSpd: 65 },

  Summarylax: { name: 'Summarylax', type: MONSTER_TYPES.NORMAL, emoji: '😴', baseHp: 160, baseAtk: 110, baseDef: 65, baseSpd: 30 },

  Draftini: { name: 'Draftini', type: MONSTER_TYPES.DRAGON, emoji: '🐉', baseHp: 41, baseAtk: 64, baseDef: 45, baseSpd: 50, evolvesAt: 30, evolvesInto: 'Docair' },
  Docair: { name: 'Docair', type: MONSTER_TYPES.DRAGON, emoji: '🐉', baseHp: 61, baseAtk: 84, baseDef: 65, baseSpd: 70, evolvesAt: 55, evolvesInto: 'Datanite' },
  Datanite: { name: 'Datanite', type: MONSTER_TYPES.DRAGON, emoji: '🐉', baseHp: 91, baseAtk: 134, baseDef: 95, baseSpd: 80 },

  Musetwo: { name: 'Musetwo', type: MONSTER_TYPES.PSYCHIC, emoji: '👽', baseHp: 106, baseAtk: 110, baseDef: 90, baseSpd: 130 },
  Muse: { name: 'Muse', type: MONSTER_TYPES.PSYCHIC, emoji: '✨', baseHp: 100, baseAtk: 100, baseDef: 100, baseSpd: 100 },
};

export const TYPE_EMOJIS = {
  [MONSTER_TYPES.FIRE]: '🔥',
  [MONSTER_TYPES.WATER]: '💧',
  [MONSTER_TYPES.GRASS]: '🌿',
  [MONSTER_TYPES.ELECTRIC]: '⚡',
  [MONSTER_TYPES.NORMAL]: '🐾',
  [MONSTER_TYPES.FLYING]: '🦅',
  [MONSTER_TYPES.POISON]: '☠️',
  [MONSTER_TYPES.FIGHTING]: '🥊',
  [MONSTER_TYPES.ROCK]: '🪨',
  [MONSTER_TYPES.PSYCHIC]: '🔮',
  [MONSTER_TYPES.BUG]: '🐛',
  [MONSTER_TYPES.GROUND]: '🏜️',
  [MONSTER_TYPES.GHOST]: '👻',
  [MONSTER_TYPES.DRAGON]: '🐲',
  [MONSTER_TYPES.ICE]: '❄️',
};

export const TYPE_CHART = {
  [MONSTER_TYPES.NORMAL]: {},
  [MONSTER_TYPES.FIRE]: { [MONSTER_TYPES.GRASS]: 2, [MONSTER_TYPES.WATER]: 0.5, [MONSTER_TYPES.FIRE]: 0.5, [MONSTER_TYPES.ROCK]: 0.5, [MONSTER_TYPES.ICE]: 2, [MONSTER_TYPES.BUG]: 2 },
  [MONSTER_TYPES.WATER]: { [MONSTER_TYPES.FIRE]: 2, [MONSTER_TYPES.WATER]: 0.5, [MONSTER_TYPES.GRASS]: 0.5, [MONSTER_TYPES.ROCK]: 2, [MONSTER_TYPES.GROUND]: 2 },
  [MONSTER_TYPES.GRASS]: { [MONSTER_TYPES.WATER]: 2, [MONSTER_TYPES.GRASS]: 0.5, [MONSTER_TYPES.FIRE]: 0.5, [MONSTER_TYPES.ROCK]: 2, [MONSTER_TYPES.GROUND]: 2, [MONSTER_TYPES.POISON]: 0.5, [MONSTER_TYPES.BUG]: 0.5, [MONSTER_TYPES.FLYING]: 0.5 },
  [MONSTER_TYPES.ELECTRIC]: { [MONSTER_TYPES.WATER]: 2, [MONSTER_TYPES.GRASS]: 0.5, [MONSTER_TYPES.ELECTRIC]: 0.5, [MONSTER_TYPES.FLYING]: 2, [MONSTER_TYPES.GROUND]: 0 },
  [MONSTER_TYPES.FLYING]: { [MONSTER_TYPES.GRASS]: 2, [MONSTER_TYPES.ELECTRIC]: 0.5, [MONSTER_TYPES.FIGHTING]: 2, [MONSTER_TYPES.BUG]: 2, [MONSTER_TYPES.ROCK]: 0.5 },
  [MONSTER_TYPES.POISON]: { [MONSTER_TYPES.GRASS]: 2, [MONSTER_TYPES.POISON]: 0.5, [MONSTER_TYPES.ROCK]: 0.5, [MONSTER_TYPES.GROUND]: 0.5, [MONSTER_TYPES.BUG]: 2 },
  [MONSTER_TYPES.FIGHTING]: { [MONSTER_TYPES.NORMAL]: 2, [MONSTER_TYPES.ROCK]: 2, [MONSTER_TYPES.FLYING]: 0.5, [MONSTER_TYPES.POISON]: 0.5, [MONSTER_TYPES.PSYCHIC]: 0.5, [MONSTER_TYPES.ICE]: 2, [MONSTER_TYPES.BUG]: 0.5 },
  [MONSTER_TYPES.ROCK]: { [MONSTER_TYPES.FIRE]: 2, [MONSTER_TYPES.FIGHTING]: 0.5, [MONSTER_TYPES.FLYING]: 2, [MONSTER_TYPES.BUG]: 2, [MONSTER_TYPES.ICE]: 2, [MONSTER_TYPES.GROUND]: 0.5 },
  [MONSTER_TYPES.PSYCHIC]: { [MONSTER_TYPES.FIGHTING]: 2, [MONSTER_TYPES.POISON]: 2, [MONSTER_TYPES.PSYCHIC]: 0.5 },
  [MONSTER_TYPES.BUG]: { [MONSTER_TYPES.GRASS]: 2, [MONSTER_TYPES.PSYCHIC]: 2, [MONSTER_TYPES.POISON]: 0.5, [MONSTER_TYPES.FIRE]: 0.5, [MONSTER_TYPES.FIGHTING]: 0.5, [MONSTER_TYPES.FLYING]: 0.5 },
  [MONSTER_TYPES.GROUND]: { [MONSTER_TYPES.FIRE]: 2, [MONSTER_TYPES.ELECTRIC]: 2, [MONSTER_TYPES.POISON]: 2, [MONSTER_TYPES.ROCK]: 2, [MONSTER_TYPES.GRASS]: 0.5, [MONSTER_TYPES.BUG]: 0.5, [MONSTER_TYPES.FLYING]: 0 },
  [MONSTER_TYPES.GHOST]: { [MONSTER_TYPES.PSYCHIC]: 2, [MONSTER_TYPES.GHOST]: 2, [MONSTER_TYPES.NORMAL]: 0 },
  [MONSTER_TYPES.DRAGON]: { [MONSTER_TYPES.DRAGON]: 2 },
  [MONSTER_TYPES.ICE]: { [MONSTER_TYPES.GRASS]: 2, [MONSTER_TYPES.GROUND]: 2, [MONSTER_TYPES.FLYING]: 2, [MONSTER_TYPES.DRAGON]: 2, [MONSTER_TYPES.FIRE]: 0.5, [MONSTER_TYPES.WATER]: 0.5, [MONSTER_TYPES.ICE]: 0.5 },
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
  const base = MONS[species] || MONS.Verminverb;
  const hp = calculateStat(base.baseHp, level, true);
  const atk = calculateStat(base.baseAtk, level);
  const def = calculateStat(base.baseDef, level);
  const spd = calculateStat(base.baseSpd, level);

  return {
    species,
    name: base.name,
    type: base.type,
    emoji: base.emoji,
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
    maxLevel: 6,
    encounters: [
      'Verminverb', 'Aviprosa', 'Caterspell', 'Weedword',
      'Puffpoet', 'Phraseling', 'Leeletter', 'Memocat',
      'Voicenat', 'Wingword', 'Odeish', 'Drafto', 'Essayve',
      'Grammander', 'Squirtspell', 'Bulbaword'
    ],
  },
  2: {
    name: 'Route 2',
    minLevel: 7,
    maxLevel: 11,
    encounters: [
      'Pikachart', 'Pointernote', 'Lexicat', 'Syntaxo',
      'Metaphrase', 'Verbakuna', 'Foliofalcon', 'Slinkscript',
      'Penpigeon', 'Vipervocab', 'Burrowbook', 'Copybone', 'Draftini'
    ],
  },
  3: {
    name: 'Route 3',
    minLevel: 12,
    maxLevel: 16,
    encounters: [
      'Primath', 'Rudeo', 'Burrowbook', 'Chopscript',
      'Grammgloom', 'Paragraphid', 'Vowelmoth', 'Dictatone',
      'Punderduck', 'Printwag', 'Abstra', 'Leeletter', 'Chanhistory',
      'Barkbook', 'Ghostwriter', 'Keydabra', 'Wordmeleon', 'Wartword', 'Ivysyllable'
    ],
  },
  4: {
    name: 'Route 4',
    minLevel: 17,
    maxLevel: 21,
    encounters: [
      'Spellpoke', 'Venomverse', 'Clausefairy', 'Foxphrase',
      'Balloonbard', 'Echoedit', 'Kerneloff', 'Citesey',
      'Draftini', 'Essayve', 'Drafto', 'Keydabra', 'Chokemessage', 'Glossler',
      'Raichure', 'Beedictionary', 'Vocalis', 'Fablefire', 'Vocabplume', 'Dialogrio'
    ],
  },
  5: {
    name: 'Route 5',
    minLevel: 22,
    maxLevel: 30,
    encounters: [
      'Spellpoke', 'Pikachart', 'Summarylax', 'Legendras',
      'Musetwo', 'Muse', 'Scrypt', 'Seaslang', 'Finfolio',
      'Datanite', 'Docair', 'Archizam', 'Champmanual', 'Textlem',
      'Gramgar', 'Haikunter', 'Outlinix', 'Memowak', 'Wordweeze',
      'Bookbro', 'Houndhaiku', 'Gorillagram', 'Paperwrath', 'Verseon', 'Jingleon', 'Noteon',
      'Spelchar', 'Blastlexis', 'Venusterm', 'Butterfluent', 'Quillquote', 'Toxiterm',
      'Citable', 'Poetcat', 'Quackquote', 'Pagewhirl'
    ],
  },
};
