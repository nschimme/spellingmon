import { MONSTER_TYPES, BIOMES } from './constants';

export interface Monster {
  id: string;
  species: string;
  emoji: string;
  type: string;
  level: number;
  hp: number;
  maxHp: number;
  atk: number;
  def: number;
  spd: number;
  exp: number;
  expToNext: number;
}

export interface SpeciesBase {
  type: string;
  emoji: string;
  baseHp: number;
  baseAtk: number;
  baseDef: number;
  baseSpd: number;
  evolvesAt?: number;
  evolvesInto?: string;
}

export interface AreaConfig {
  name: string;
  minLevel: number;
  maxLevel: number;
  biome: string;
  encounters: string[];
}

export interface Word {
  word: string;
  definition: string;
  sentence: string;
  difficulty?: number;
}

export const SPECIES = {
  Grammander: 'Grammander',
  Wordmeleon: 'Wordmeleon',
  Spelchar: 'Spelchar',
  Squirtspell: 'Squirtspell',
  Wartword: 'Wartword',
  Blastlexis: 'Blastlexis',
  Bulbaword: 'Bulbaword',
  Ivysyllable: 'Ivysyllable',
  Venusterm: 'Venusterm',
  Pikachart: 'Pikachart',
  Raichure: 'Raichure',
  Caterspell: 'Caterspell',
  Metaphrase: 'Metaphrase',
  Butterfluent: 'Butterfluent',
  Weedword: 'Weedword',
  Verbakuna: 'Verbakuna',
  Beedictionary: 'Beedictionary',
  Aviprosa: 'Aviprosa',
  Syntaxo: 'Syntaxo',
  Vocalis: 'Vocalis',
  Verminverb: 'Verminverb',
  Lexicat: 'Lexicat',
  Penpigeon: 'Penpigeon',
  Foliofalcon: 'Foliofalcon',
  Slinkscript: 'Slinkscript',
  Vipervocab: 'Vipervocab',
  Burrowbook: 'Burrowbook',
  Quillquote: 'Quillquote',
  Pointernote: 'Pointernote',
  Venomverse: 'Venomverse',
  Toxiterm: 'Toxiterm',
  Clausefairy: 'Clausefairy',
  Citable: 'Citable',
  Foxphrase: 'Foxphrase',
  Fablefire: 'Fablefire',
  Puffpoet: 'Puffpoet',
  Balloonbard: 'Balloonbard',
  Wingword: 'Wingword',
  Echoedit: 'Echoedit',
  Odeish: 'Odeish',
  Grammgloom: 'Grammgloom',
  Vocabplume: 'Vocabplume',
  Phraseling: 'Phraseling',
  Paragraphid: 'Paragraphid',
  Voicenat: 'Voicenat',
  Vowelmoth: 'Vowelmoth',
  Dictatone: 'Dictatone',
  Dialogrio: 'Dialogrio',
  Memocat: 'Memocat',
  Poetcat: 'Poetcat',
  Punderduck: 'Punderduck',
  Quackquote: 'Quackquote',
  Primath: 'Primath',
  Gorillagram: 'Gorillagram',
  Barkbook: 'Barkbook',
  Houndhaiku: 'Houndhaiku',
  Printwag: 'Printwag',
  Pagewhirl: 'Pagewhirl',
  Paperwrath: 'Paperwrath',
  Abstra: 'Abstra',
  Keydabra: 'Keydabra',
  Archizam: 'Archizam',
  Chopscript: 'Chopscript',
  Chokemessage: 'Chokemessage',
  Champmanual: 'Champmanual',
  Rudeo: 'Rudeo',
  Glossler: 'Glossler',
  Textlem: 'Textlem',
  Spellpoke: 'Spellpoke',
  Bookbro: 'Bookbro',
  Ghostwriter: 'Ghostwriter',
  Haikunter: 'Haikunter',
  Gramgar: 'Gramgar',
  Outlinix: 'Outlinix',
  Copybone: 'Copybone',
  Memowak: 'Memowak',
  Leeletter: 'Leeletter',
  Chanhistory: 'Chanhistory',
  Kerneloff: 'Kerneloff',
  Wordweeze: 'Wordweeze',
  Citesey: 'Citesey',
  Scrypt: 'Scrypt',
  Finfolio: 'Finfolio',
  Seaslang: 'Seaslang',
  Legendras: 'Legendras',
  Drafto: 'Drafto',
  Essayve: 'Essayve',
  Verseon: 'Verseon',
  Jingleon: 'Jingleon',
  Noteon: 'Noteon',
  Summarylax: 'Summarylax',
  Draftini: 'Draftini',
  Docair: 'Docair',
  Datanite: 'Datanite',
  Musetwo: 'Musetwo',
  Muse: 'Muse',
};

export const MONS: Record<string, SpeciesBase> = {
  // Starters
  [SPECIES.Grammander]: { type: MONSTER_TYPES.FIRE, emoji: '🦎', baseHp: 39, baseAtk: 52, baseDef: 43, baseSpd: 65, evolvesAt: 16, evolvesInto: SPECIES.Wordmeleon },
  [SPECIES.Wordmeleon]: { type: MONSTER_TYPES.FIRE, emoji: '🦖', baseHp: 58, baseAtk: 64, baseDef: 58, baseSpd: 80, evolvesAt: 36, evolvesInto: SPECIES.Spelchar },
  [SPECIES.Spelchar]: { type: MONSTER_TYPES.FIRE, emoji: '🐉', baseHp: 78, baseAtk: 84, baseDef: 78, baseSpd: 100 },

  [SPECIES.Squirtspell]: { type: MONSTER_TYPES.WATER, emoji: '🐢', baseHp: 44, baseAtk: 48, baseDef: 65, baseSpd: 43, evolvesAt: 16, evolvesInto: SPECIES.Wartword },
  [SPECIES.Wartword]: { type: MONSTER_TYPES.WATER, emoji: '🛡️', baseHp: 59, baseAtk: 63, baseDef: 80, baseSpd: 58, evolvesAt: 36, evolvesInto: SPECIES.Blastlexis },
  [SPECIES.Blastlexis]: { type: MONSTER_TYPES.WATER, emoji: '🌊', baseHp: 79, baseAtk: 83, baseDef: 100, baseSpd: 78 },

  [SPECIES.Bulbaword]: { type: MONSTER_TYPES.GRASS, emoji: '🍃', baseHp: 45, baseAtk: 49, baseDef: 49, baseSpd: 45, evolvesAt: 16, evolvesInto: SPECIES.Ivysyllable },
  [SPECIES.Ivysyllable]: { type: MONSTER_TYPES.GRASS, emoji: '🌺', baseHp: 60, baseAtk: 62, baseDef: 63, baseSpd: 60, evolvesAt: 32, evolvesInto: SPECIES.Venusterm },
  [SPECIES.Venusterm]: { type: MONSTER_TYPES.GRASS, emoji: '🌴', baseHp: 80, baseAtk: 82, baseDef: 83, baseSpd: 80 },

  [SPECIES.Pikachart]: { type: MONSTER_TYPES.ELECTRIC, emoji: '🐭', baseHp: 35, baseAtk: 55, baseDef: 40, baseSpd: 90, evolvesAt: 20, evolvesInto: SPECIES.Raichure },
  [SPECIES.Raichure]: { type: MONSTER_TYPES.ELECTRIC, emoji: '⚡', baseHp: 60, baseAtk: 90, baseDef: 55, baseSpd: 110 },

  // Wild Mons & Evolutions
  [SPECIES.Caterspell]: { type: MONSTER_TYPES.BUG, emoji: '🐛', baseHp: 45, baseAtk: 30, baseDef: 35, baseSpd: 45, evolvesAt: 7, evolvesInto: SPECIES.Metaphrase },
  [SPECIES.Metaphrase]: { type: MONSTER_TYPES.BUG, emoji: '📦', baseHp: 50, baseAtk: 20, baseDef: 55, baseSpd: 30, evolvesAt: 10, evolvesInto: SPECIES.Butterfluent },
  [SPECIES.Butterfluent]: { type: MONSTER_TYPES.BUG, emoji: '🦋', baseHp: 60, baseAtk: 45, baseDef: 50, baseSpd: 70 },

  [SPECIES.Weedword]: { type: MONSTER_TYPES.BUG, emoji: '🐛', baseHp: 40, baseAtk: 35, baseDef: 30, baseSpd: 50, evolvesAt: 7, evolvesInto: SPECIES.Verbakuna },
  [SPECIES.Verbakuna]: { type: MONSTER_TYPES.BUG, emoji: '🍯', baseHp: 45, baseAtk: 25, baseDef: 50, baseSpd: 35, evolvesAt: 10, evolvesInto: SPECIES.Beedictionary },
  [SPECIES.Beedictionary]: { type: MONSTER_TYPES.BUG, emoji: '🐝', baseHp: 65, baseAtk: 80, baseDef: 40, baseSpd: 75 },

  [SPECIES.Aviprosa]: { type: MONSTER_TYPES.FLYING, emoji: '🐦', baseHp: 40, baseAtk: 45, baseDef: 40, baseSpd: 56, evolvesAt: 18, evolvesInto: SPECIES.Syntaxo },
  [SPECIES.Syntaxo]: { type: MONSTER_TYPES.FLYING, emoji: '🦅', baseHp: 63, baseAtk: 60, baseDef: 55, baseSpd: 71, evolvesAt: 36, evolvesInto: SPECIES.Vocalis },
  [SPECIES.Vocalis]: { type: MONSTER_TYPES.FLYING, emoji: '👑', baseHp: 83, baseAtk: 80, baseDef: 75, baseSpd: 91 },

  [SPECIES.Verminverb]: { type: MONSTER_TYPES.NORMAL, emoji: '🐀', baseHp: 30, baseAtk: 56, baseDef: 35, baseSpd: 72, evolvesAt: 20, evolvesInto: SPECIES.Lexicat },
  [SPECIES.Lexicat]: { type: MONSTER_TYPES.NORMAL, emoji: '🐀', baseHp: 55, baseAtk: 81, baseDef: 60, baseSpd: 97 },

  [SPECIES.Penpigeon]: { type: MONSTER_TYPES.FLYING, emoji: '🐦', baseHp: 40, baseAtk: 60, baseDef: 30, baseSpd: 70, evolvesAt: 20, evolvesInto: SPECIES.Foliofalcon },
  [SPECIES.Foliofalcon]: { type: MONSTER_TYPES.FLYING, emoji: '🦅', baseHp: 65, baseAtk: 90, baseDef: 65, baseSpd: 100 },

  [SPECIES.Slinkscript]: { type: MONSTER_TYPES.POISON, emoji: '🐍', baseHp: 35, baseAtk: 60, baseDef: 44, baseSpd: 55, evolvesAt: 22, evolvesInto: SPECIES.Vipervocab },
  [SPECIES.Vipervocab]: { type: MONSTER_TYPES.POISON, emoji: '🐍', baseHp: 60, baseAtk: 85, baseDef: 69, baseSpd: 80 },

  [SPECIES.Burrowbook]: { type: MONSTER_TYPES.GROUND, emoji: '🦔', baseHp: 50, baseAtk: 75, baseDef: 85, baseSpd: 40, evolvesAt: 22, evolvesInto: SPECIES.Quillquote },
  [SPECIES.Quillquote]: { type: MONSTER_TYPES.GROUND, emoji: '🦔', baseHp: 75, baseAtk: 100, baseDef: 110, baseSpd: 65 },

  [SPECIES.Pointernote]: { type: MONSTER_TYPES.POISON, emoji: '🦂', baseHp: 46, baseAtk: 57, baseDef: 40, baseSpd: 50, evolvesAt: 16, evolvesInto: SPECIES.Venomverse },
  [SPECIES.Venomverse]: { type: MONSTER_TYPES.POISON, emoji: '🦂', baseHp: 61, baseAtk: 72, baseDef: 57, baseSpd: 65, evolvesAt: 36, evolvesInto: SPECIES.Toxiterm },
  [SPECIES.Toxiterm]: { type: MONSTER_TYPES.POISON, emoji: '👑', baseHp: 81, baseAtk: 92, baseDef: 77, baseSpd: 85 },

  [SPECIES.Clausefairy]: { type: MONSTER_TYPES.NORMAL, emoji: '🧚', baseHp: 70, baseAtk: 45, baseDef: 48, baseSpd: 35, evolvesAt: 25, evolvesInto: SPECIES.Citable },
  [SPECIES.Citable]: { type: MONSTER_TYPES.NORMAL, emoji: '🧚', baseHp: 95, baseAtk: 70, baseDef: 73, baseSpd: 60 },

  [SPECIES.Foxphrase]: { type: MONSTER_TYPES.FIRE, emoji: '🦊', baseHp: 38, baseAtk: 41, baseDef: 40, baseSpd: 65, evolvesAt: 25, evolvesInto: SPECIES.Fablefire },
  [SPECIES.Fablefire]: { type: MONSTER_TYPES.FIRE, emoji: '🦊', baseHp: 73, baseAtk: 76, baseDef: 75, baseSpd: 100 },

  [SPECIES.Puffpoet]: { type: MONSTER_TYPES.NORMAL, emoji: '🎈', baseHp: 115, baseAtk: 45, baseDef: 20, baseSpd: 20, evolvesAt: 25, evolvesInto: SPECIES.Balloonbard },
  [SPECIES.Balloonbard]: { type: MONSTER_TYPES.NORMAL, emoji: '🎈', baseHp: 140, baseAtk: 70, baseDef: 45, baseSpd: 45 },

  [SPECIES.Wingword]: { type: MONSTER_TYPES.POISON, emoji: '🦇', baseHp: 40, baseAtk: 45, baseDef: 35, baseSpd: 55, evolvesAt: 22, evolvesInto: SPECIES.Echoedit },
  [SPECIES.Echoedit]: { type: MONSTER_TYPES.POISON, emoji: '🦇', baseHp: 75, baseAtk: 80, baseDef: 70, baseSpd: 90 },

  [SPECIES.Odeish]: { type: MONSTER_TYPES.GRASS, emoji: '🌱', baseHp: 45, baseAtk: 50, baseDef: 55, baseSpd: 30, evolvesAt: 21, evolvesInto: SPECIES.Grammgloom },
  [SPECIES.Grammgloom]: { type: MONSTER_TYPES.GRASS, emoji: '🤢', baseHp: 60, baseAtk: 65, baseDef: 70, baseSpd: 40, evolvesAt: 32, evolvesInto: SPECIES.Vocabplume },
  [SPECIES.Vocabplume]: { type: MONSTER_TYPES.GRASS, emoji: '🌸', baseHp: 75, baseAtk: 80, baseDef: 85, baseSpd: 50 },

  [SPECIES.Phraseling]: { type: MONSTER_TYPES.BUG, emoji: '🍄', baseHp: 35, baseAtk: 70, baseDef: 55, baseSpd: 25, evolvesAt: 24, evolvesInto: SPECIES.Paragraphid },
  [SPECIES.Paragraphid]: { type: MONSTER_TYPES.BUG, emoji: '🍄', baseHp: 60, baseAtk: 95, baseDef: 80, baseSpd: 30 },

  [SPECIES.Voicenat]: { type: MONSTER_TYPES.BUG, emoji: '🕷️', baseHp: 60, baseAtk: 55, baseDef: 50, baseSpd: 45, evolvesAt: 31, evolvesInto: SPECIES.Vowelmoth },
  [SPECIES.Vowelmoth]: { type: MONSTER_TYPES.BUG, emoji: '🦋', baseHp: 70, baseAtk: 65, baseDef: 60, baseSpd: 90 },

  [SPECIES.Dictatone]: { type: MONSTER_TYPES.GROUND, emoji: '⛰️', baseHp: 10, baseAtk: 55, baseDef: 25, baseSpd: 95, evolvesAt: 26, evolvesInto: SPECIES.Dialogrio },
  [SPECIES.Dialogrio]: { type: MONSTER_TYPES.GROUND, emoji: '⛰️', baseHp: 35, baseAtk: 80, baseDef: 50, baseSpd: 120 },

  [SPECIES.Memocat]: { type: MONSTER_TYPES.NORMAL, emoji: '🐱', baseHp: 40, baseAtk: 45, baseDef: 35, baseSpd: 90, evolvesAt: 28, evolvesInto: SPECIES.Poetcat },
  [SPECIES.Poetcat]: { type: MONSTER_TYPES.NORMAL, emoji: '🐱', baseHp: 65, baseAtk: 70, baseDef: 60, baseSpd: 115 },

  [SPECIES.Punderduck]: { type: MONSTER_TYPES.WATER, emoji: '🦆', baseHp: 50, baseAtk: 52, baseDef: 48, baseSpd: 55, evolvesAt: 33, evolvesInto: SPECIES.Quackquote },
  [SPECIES.Quackquote]: { type: MONSTER_TYPES.WATER, emoji: '🦆', baseHp: 80, baseAtk: 82, baseDef: 78, baseSpd: 85 },

  [SPECIES.Primath]: { type: MONSTER_TYPES.FIGHTING, emoji: '🐒', baseHp: 40, baseAtk: 80, baseDef: 35, baseSpd: 70, evolvesAt: 28, evolvesInto: SPECIES.Gorillagram },
  [SPECIES.Gorillagram]: { type: MONSTER_TYPES.FIGHTING, emoji: '🐒', baseHp: 65, baseAtk: 105, baseDef: 60, baseSpd: 95 },

  [SPECIES.Barkbook]: { type: MONSTER_TYPES.FIRE, emoji: '🐶', baseHp: 55, baseAtk: 70, baseDef: 45, baseSpd: 60, evolvesAt: 30, evolvesInto: SPECIES.Houndhaiku },
  [SPECIES.Houndhaiku]: { type: MONSTER_TYPES.FIRE, emoji: '🐕', baseHp: 90, baseAtk: 110, baseDef: 80, baseSpd: 95 },

  [SPECIES.Printwag]: { type: MONSTER_TYPES.WATER, emoji: '🌀', baseHp: 40, baseAtk: 50, baseDef: 40, baseSpd: 90, evolvesAt: 25, evolvesInto: SPECIES.Pagewhirl },
  [SPECIES.Pagewhirl]: { type: MONSTER_TYPES.WATER, emoji: '🌀', baseHp: 65, baseAtk: 65, baseDef: 65, baseSpd: 90, evolvesAt: 36, evolvesInto: SPECIES.Paperwrath },
  [SPECIES.Paperwrath]: { type: MONSTER_TYPES.WATER, emoji: '🐸', baseHp: 90, baseAtk: 95, baseDef: 95, baseSpd: 70 },

  [SPECIES.Abstra]: { type: MONSTER_TYPES.PSYCHIC, emoji: '🧠', baseHp: 25, baseAtk: 20, baseDef: 15, baseSpd: 90, evolvesAt: 16, evolvesInto: SPECIES.Keydabra },
  [SPECIES.Keydabra]: { type: MONSTER_TYPES.PSYCHIC, emoji: '🧠', baseHp: 40, baseAtk: 35, baseDef: 30, baseSpd: 105, evolvesAt: 36, evolvesInto: SPECIES.Archizam },
  [SPECIES.Archizam]: { type: MONSTER_TYPES.PSYCHIC, emoji: '🧠', baseHp: 55, baseAtk: 50, baseDef: 45, baseSpd: 120 },

  [SPECIES.Chopscript]: { type: MONSTER_TYPES.FIGHTING, emoji: '💪', baseHp: 70, baseAtk: 80, baseDef: 50, baseSpd: 35, evolvesAt: 28, evolvesInto: SPECIES.Chokemessage },
  [SPECIES.Chokemessage]: { type: MONSTER_TYPES.FIGHTING, emoji: '💪', baseHp: 80, baseAtk: 100, baseDef: 70, baseSpd: 45, evolvesAt: 36, evolvesInto: SPECIES.Champmanual },
  [SPECIES.Champmanual]: { type: MONSTER_TYPES.FIGHTING, emoji: '💪', baseHp: 90, baseAtk: 130, baseDef: 80, baseSpd: 55 },

  [SPECIES.Rudeo]: { type: MONSTER_TYPES.ROCK, emoji: '🪨', baseHp: 40, baseAtk: 80, baseDef: 100, baseSpd: 20, evolvesAt: 25, evolvesInto: SPECIES.Glossler },
  [SPECIES.Glossler]: { type: MONSTER_TYPES.ROCK, emoji: '🪨', baseHp: 55, baseAtk: 95, baseDef: 115, baseSpd: 35, evolvesAt: 36, evolvesInto: SPECIES.Textlem },
  [SPECIES.Textlem]: { type: MONSTER_TYPES.ROCK, emoji: '🪨', baseHp: 80, baseAtk: 120, baseDef: 130, baseSpd: 45 },

  [SPECIES.Spellpoke]: { type: MONSTER_TYPES.PSYCHIC, emoji: '🧠', baseHp: 90, baseAtk: 65, baseDef: 65, baseSpd: 15, evolvesAt: 37, evolvesInto: SPECIES.Bookbro },
  [SPECIES.Bookbro]: { type: MONSTER_TYPES.PSYCHIC, emoji: '🐚', baseHp: 95, baseAtk: 75, baseDef: 110, baseSpd: 30 },

  [SPECIES.Ghostwriter]: { type: MONSTER_TYPES.GHOST, emoji: '👻', baseHp: 30, baseAtk: 35, baseDef: 30, baseSpd: 80, evolvesAt: 25, evolvesInto: SPECIES.Haikunter },
  [SPECIES.Haikunter]: { type: MONSTER_TYPES.GHOST, emoji: '👻', baseHp: 45, baseAtk: 50, baseDef: 45, baseSpd: 95, evolvesAt: 36, evolvesInto: SPECIES.Gramgar },
  [SPECIES.Gramgar]: { type: MONSTER_TYPES.GHOST, emoji: '😈', baseHp: 60, baseAtk: 65, baseDef: 60, baseSpd: 110 },

  [SPECIES.Outlinix]: { type: MONSTER_TYPES.ROCK, emoji: '🐍', baseHp: 35, baseAtk: 45, baseDef: 160, baseSpd: 70 },

  [SPECIES.Copybone]: { type: MONSTER_TYPES.GROUND, emoji: '🦴', baseHp: 50, baseAtk: 50, baseDef: 95, baseSpd: 35, evolvesAt: 28, evolvesInto: SPECIES.Memowak },
  [SPECIES.Memowak]: { type: MONSTER_TYPES.GROUND, emoji: '🦴', baseHp: 60, baseAtk: 80, baseDef: 110, baseSpd: 45 },

  [SPECIES.Leeletter]: { type: MONSTER_TYPES.FIGHTING, emoji: '🦵', baseHp: 50, baseAtk: 120, baseDef: 53, baseSpd: 87 },
  [SPECIES.Chanhistory]: { type: MONSTER_TYPES.FIGHTING, emoji: '🥊', baseHp: 50, baseAtk: 105, baseDef: 79, baseSpd: 76 },

  [SPECIES.Kerneloff]: { type: MONSTER_TYPES.POISON, emoji: '💣', baseHp: 40, baseAtk: 65, baseDef: 95, baseSpd: 35, evolvesAt: 35, evolvesInto: SPECIES.Wordweeze },
  [SPECIES.Wordweeze]: { type: MONSTER_TYPES.POISON, emoji: '💨', baseHp: 65, baseAtk: 90, baseDef: 120, baseSpd: 60 },

  [SPECIES.Citesey]: { type: MONSTER_TYPES.NORMAL, emoji: '🥚', baseHp: 250, baseAtk: 5, baseDef: 5, baseSpd: 50 },

  [SPECIES.Scrypt]: { type: MONSTER_TYPES.BUG, emoji: '🔪', baseHp: 70, baseAtk: 110, baseDef: 80, baseSpd: 105 },

  [SPECIES.Finfolio]: { type: MONSTER_TYPES.WATER, emoji: '🐟', baseHp: 20, baseAtk: 10, baseDef: 55, baseSpd: 80, evolvesAt: 20, evolvesInto: SPECIES.Seaslang },
  [SPECIES.Seaslang]: { type: MONSTER_TYPES.WATER, emoji: '🐉', baseHp: 95, baseAtk: 125, baseDef: 79, baseSpd: 81 },

  [SPECIES.Legendras]: { type: MONSTER_TYPES.WATER, emoji: '⛵', baseHp: 130, baseAtk: 85, baseDef: 80, baseSpd: 60 },

  [SPECIES.Drafto]: { type: MONSTER_TYPES.NORMAL, emoji: '👥', baseHp: 48, baseAtk: 48, baseDef: 48, baseSpd: 48 },

  [SPECIES.Essayve]: { type: MONSTER_TYPES.NORMAL, emoji: '🐕', baseHp: 55, baseAtk: 55, baseDef: 50, baseSpd: 55, evolvesAt: 20, evolvesInto: SPECIES.Verseon }, // Simplified evolution
  [SPECIES.Verseon]: { type: MONSTER_TYPES.WATER, emoji: '🧜', baseHp: 130, baseAtk: 65, baseDef: 60, baseSpd: 65 },
  [SPECIES.Jingleon]: { type: MONSTER_TYPES.ELECTRIC, emoji: '⚡', baseHp: 65, baseAtk: 65, baseDef: 60, baseSpd: 130 },
  [SPECIES.Noteon]: { type: MONSTER_TYPES.FIRE, emoji: '🔥', baseHp: 65, baseAtk: 130, baseDef: 60, baseSpd: 65 },

  [SPECIES.Summarylax]: { type: MONSTER_TYPES.NORMAL, emoji: '😴', baseHp: 160, baseAtk: 110, baseDef: 65, baseSpd: 30 },

  [SPECIES.Draftini]: { type: MONSTER_TYPES.DRAGON, emoji: '🐉', baseHp: 41, baseAtk: 64, baseDef: 45, baseSpd: 50, evolvesAt: 30, evolvesInto: SPECIES.Docair },
  [SPECIES.Docair]: { type: MONSTER_TYPES.DRAGON, emoji: '🐉', baseHp: 61, baseAtk: 84, baseDef: 65, baseSpd: 70, evolvesAt: 55, evolvesInto: SPECIES.Datanite },
  [SPECIES.Datanite]: { type: MONSTER_TYPES.DRAGON, emoji: '🐉', baseHp: 91, baseAtk: 134, baseDef: 95, baseSpd: 80 },

  [SPECIES.Musetwo]: { type: MONSTER_TYPES.PSYCHIC, emoji: '👽', baseHp: 106, baseAtk: 110, baseDef: 90, baseSpd: 130 },
  [SPECIES.Muse]: { type: MONSTER_TYPES.PSYCHIC, emoji: '✨', baseHp: 100, baseAtk: 100, baseDef: 100, baseSpd: 100 },
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

export function calculateStat(base: number, level: number, isHp: boolean = false): number {
  // Simplified Pokemon stat formula
  // IV is assumed 31, EV is 0
  const iv = 31;
  if (isHp) {
    return Math.floor(((2 * base + iv) * level) / 100) + level + 10;
  }
  return Math.floor(((2 * base + iv) * level) / 100) + 5;
}

export function calculateDamage(
  attacker: { species: string; level: number; atk?: number },
  defender: { species: string; level: number; def?: number },
  basePower: number,
  difficulty: number = 1
) {
  const atk = attacker.atk || calculateStat(MONS[attacker.species]?.baseAtk || 50, attacker.level);
  const def = defender.def || calculateStat(MONS[defender.species]?.baseDef || 50, defender.level);

  // Use word difficulty to scale damage: Easy (1) -> 1.0x, Hard (2) -> 1.5x
  const difficultyMultiplier = difficulty === 2 ? 1.5 : 1.0;

  const attackerRawType = MONS[attacker.species]?.type;
  const defenderRawType = MONS[defender.species]?.type;
  const typeMod = TYPE_CHART[attackerRawType]?.[defenderRawType] || 1;

  // Simplified Pokemon damage formula
  // Damage = (((2 * level / 5 + 2) * Power * A/D) / 50 + 2) * Multiplier
  const levelPart = (2 * attacker.level) / 5 + 2;
  const statRatio = atk / def;
  const baseDamage = (((levelPart * basePower * statRatio) / 50) + 2) * typeMod;

  const finalDamage = Math.floor(baseDamage * difficultyMultiplier);
  return {
    damage: Math.max(1, finalDamage),
    typeMod,
  };
}

export function calculateExpToNext(level: number): number {
  // Use a quadratic formula for smoother "per-level" progression
  return Math.floor(5 * Math.pow(level, 2)) + 10;
}

export function createMon(species: string, level: number = 5): Monster {
  const base = MONS[species] || MONS[SPECIES.Verminverb];
  const hp = calculateStat(base.baseHp, level, true);
  const atk = calculateStat(base.baseAtk, level);
  const def = calculateStat(base.baseDef, level);
  const spd = calculateStat(base.baseSpd, level);

  return {
    species,
    emoji: base.emoji,
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

export function calculateExpGain(enemyMon: { level: number }, isTrainer: boolean): number {
  // Pokemon-inspired formula: (Base * Level) / 7
  const baseExp = 60;
  const trainerBonus = isTrainer ? 1.5 : 1.0;
  return Math.floor((baseExp * enemyMon.level / 7) * trainerBonus);
}

/**
 * Linear algorithm for battle timer duration.
 * Harder and longer words receive more time.
 * @param {Word} wordObj - The word object
 * @param {boolean} isCapture - Whether this is a capture attempt
 * @returns {number} Duration in seconds
 */
export function calculateTimerDuration(wordObj: Word, isCapture: boolean = false): number {
  const base = isCapture ? 6 : 8;
  const diffMultiplier = isCapture ? 1.5 : 2;
  const lengthMultiplier = isCapture ? 0.4 : 0.6;

  const difficulty = wordObj.difficulty || 1;
  const length = wordObj.word.length;

  const time = base + (difficulty * diffMultiplier) + (length * lengthMultiplier);
  return Math.round(time);
}

export const AREA_CONFIGS: Record<number, AreaConfig> = {
  1: {
    name: 'Alphabet Avenue',
    minLevel: 1,
    maxLevel: 10,
    biome: BIOMES.ROUTE,
    encounters: [
      SPECIES.Verminverb, SPECIES.Aviprosa, SPECIES.Caterspell, SPECIES.Weedword,
      SPECIES.Drafto, SPECIES.Essayve, SPECIES.Grammander, SPECIES.Squirtspell, SPECIES.Bulbaword
    ],
  },
  2: {
    name: 'Blend Boulevard',
    minLevel: 11,
    maxLevel: 18,
    biome: BIOMES.TOWN,
    encounters: [
      SPECIES.Pikachart, SPECIES.Pointernote, SPECIES.Lexicat, SPECIES.Syntaxo,
      SPECIES.Metaphrase, SPECIES.Verbakuna, SPECIES.Foliofalcon, SPECIES.Slinkscript,
      SPECIES.Penpigeon, SPECIES.Vipervocab, SPECIES.Burrowbook, SPECIES.Copybone, SPECIES.Draftini
    ],
  },
  3: {
    name: 'Syllable Springs',
    minLevel: 19,
    maxLevel: 28,
    biome: BIOMES.WILDERNESS,
    encounters: [
      SPECIES.Primath, SPECIES.Rudeo, SPECIES.Burrowbook, SPECIES.Chopscript,
      SPECIES.Grammgloom, SPECIES.Paragraphid, SPECIES.Vowelmoth, SPECIES.Dictatone,
      SPECIES.Punderduck, SPECIES.Printwag, SPECIES.Abstra, SPECIES.Leeletter, SPECIES.Chanhistory,
      SPECIES.Barkbook, SPECIES.Ghostwriter, SPECIES.Keydabra, SPECIES.Wordmeleon, SPECIES.Wartword, SPECIES.Ivysyllable
    ],
  },
  4: {
    name: 'Suffix Summit',
    minLevel: 29,
    maxLevel: 38,
    biome: BIOMES.CAVE,
    encounters: [
      SPECIES.Spellpoke, SPECIES.Venomverse, SPECIES.Clausefairy, SPECIES.Foxphrase,
      SPECIES.Balloonbard, SPECIES.Echoedit, SPECIES.Kerneloff, SPECIES.Citesey,
      SPECIES.Draftini, SPECIES.Essayve, SPECIES.Drafto, SPECIES.Keydabra, SPECIES.Chokemessage, SPECIES.Glossler,
      SPECIES.Raichure, SPECIES.Beedictionary, SPECIES.Vocalis, SPECIES.Fablefire, SPECIES.Vocabplume, SPECIES.Dialogrio
    ],
  },
  5: {
    name: 'Prefix Peak',
    minLevel: 39,
    maxLevel: 48,
    biome: BIOMES.WILDERNESS,
    encounters: [
      SPECIES.Spellpoke, SPECIES.Pikachart, SPECIES.Summarylax, SPECIES.Legendras,
      SPECIES.Archizam, SPECIES.Champmanual, SPECIES.Textlem,
      SPECIES.Bookbro, SPECIES.Houndhaiku, SPECIES.Gorillagram, SPECIES.Paperwrath,
      SPECIES.Spelchar, SPECIES.Blastlexis, SPECIES.Venusterm, SPECIES.Butterfluent, SPECIES.Quillquote, SPECIES.Toxiterm,
      SPECIES.Citable, SPECIES.Poetcat, SPECIES.Quackquote, SPECIES.Pagewhirl
    ],
  },
  6: {
    name: 'Homophone Harbor',
    minLevel: 49,
    maxLevel: 58,
    biome: BIOMES.TOWN,
    encounters: [
      SPECIES.Gramgar, SPECIES.Haikunter, SPECIES.Outlinix, SPECIES.Memowak, SPECIES.Wordweeze,
      SPECIES.Scrypt, SPECIES.Seaslang, SPECIES.Finfolio, SPECIES.Docair,
      SPECIES.Verseon, SPECIES.Jingleon, SPECIES.Noteon
    ],
  },
  7: {
    name: 'Loanword Labyrinth',
    minLevel: 59,
    maxLevel: 68,
    biome: BIOMES.CAVE,
    encounters: [
      SPECIES.Musetwo, SPECIES.Muse, SPECIES.Datanite, SPECIES.Docair,
      SPECIES.Legendras, SPECIES.Summarylax, SPECIES.Archizam, SPECIES.Champmanual, SPECIES.Textlem
    ],
  },
  8: {
    name: 'Phoneme Forest',
    minLevel: 69,
    maxLevel: 80,
    biome: BIOMES.FOREST,
    encounters: [
      SPECIES.Musetwo, SPECIES.Muse, SPECIES.Datanite, SPECIES.Scrypt, SPECIES.Seaslang,
      SPECIES.Gramgar, SPECIES.Toxiterm, SPECIES.Venusterm, SPECIES.Blastlexis, SPECIES.Spelchar
    ],
  },
  9: {
    name: 'Etymology Elite',
    minLevel: 81,
    maxLevel: 100,
    biome: BIOMES.TOWN,
    encounters: [
      SPECIES.Musetwo, SPECIES.Muse, SPECIES.Datanite, SPECIES.Archizam, SPECIES.Champmanual, SPECIES.Textlem
    ],
  },
};
