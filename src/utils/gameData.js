import { MONSTER_TYPES, BIOMES } from './constants';
import i18n from '../i18n';

const { t } = i18n.global;

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

export const MONS = {
  // Starters
  [SPECIES.Grammander]: { get name() { return t("monsters.Grammander") }, get type() { return t("types.Fire") }, rawType: MONSTER_TYPES.FIRE, emoji: '🦎', baseHp: 39, baseAtk: 52, baseDef: 43, baseSpd: 65, evolvesAt: 16, evolvesInto: SPECIES.Wordmeleon },
  [SPECIES.Wordmeleon]: { get name() { return t("monsters.Wordmeleon") }, get type() { return t("types.Fire") }, rawType: MONSTER_TYPES.FIRE, emoji: '🦖', baseHp: 58, baseAtk: 64, baseDef: 58, baseSpd: 80, evolvesAt: 36, evolvesInto: SPECIES.Spelchar },
  [SPECIES.Spelchar]: { get name() { return t("monsters.Spelchar") }, get type() { return t("types.Fire") }, rawType: MONSTER_TYPES.FIRE, emoji: '🐉', baseHp: 78, baseAtk: 84, baseDef: 78, baseSpd: 100 },

  [SPECIES.Squirtspell]: { get name() { return t("monsters.Squirtspell") }, get type() { return t("types.Water") }, rawType: MONSTER_TYPES.WATER, emoji: '🐢', baseHp: 44, baseAtk: 48, baseDef: 65, baseSpd: 43, evolvesAt: 16, evolvesInto: SPECIES.Wartword },
  [SPECIES.Wartword]: { get name() { return t("monsters.Wartword") }, get type() { return t("types.Water") }, rawType: MONSTER_TYPES.WATER, emoji: '🛡️', baseHp: 59, baseAtk: 63, baseDef: 80, baseSpd: 58, evolvesAt: 36, evolvesInto: SPECIES.Blastlexis },
  [SPECIES.Blastlexis]: { get name() { return t("monsters.Blastlexis") }, get type() { return t("types.Water") }, rawType: MONSTER_TYPES.WATER, emoji: '🌊', baseHp: 79, baseAtk: 83, baseDef: 100, baseSpd: 78 },

  [SPECIES.Bulbaword]: { get name() { return t("monsters.Bulbaword") }, get type() { return t("types.Grass") }, rawType: MONSTER_TYPES.GRASS, emoji: '🍃', baseHp: 45, baseAtk: 49, baseDef: 49, baseSpd: 45, evolvesAt: 16, evolvesInto: SPECIES.Ivysyllable },
  [SPECIES.Ivysyllable]: { get name() { return t("monsters.Ivysyllable") }, get type() { return t("types.Grass") }, rawType: MONSTER_TYPES.GRASS, emoji: '🌺', baseHp: 60, baseAtk: 62, baseDef: 63, baseSpd: 60, evolvesAt: 32, evolvesInto: SPECIES.Venusterm },
  [SPECIES.Venusterm]: { get name() { return t("monsters.Venusterm") }, get type() { return t("types.Grass") }, rawType: MONSTER_TYPES.GRASS, emoji: '🌴', baseHp: 80, baseAtk: 82, baseDef: 83, baseSpd: 80 },

  [SPECIES.Pikachart]: { get name() { return t("monsters.Pikachart") }, get type() { return t("types.Electric") }, rawType: MONSTER_TYPES.ELECTRIC, emoji: '🐭', baseHp: 35, baseAtk: 55, baseDef: 40, baseSpd: 90, evolvesAt: 20, evolvesInto: SPECIES.Raichure },
  [SPECIES.Raichure]: { get name() { return t("monsters.Raichure") }, get type() { return t("types.Electric") }, rawType: MONSTER_TYPES.ELECTRIC, emoji: '⚡', baseHp: 60, baseAtk: 90, baseDef: 55, baseSpd: 110 },

  // Wild Mons & Evolutions
  [SPECIES.Caterspell]: { get name() { return t("monsters.Caterspell") }, get type() { return t("types.Bug") }, rawType: MONSTER_TYPES.BUG, emoji: '🐛', baseHp: 45, baseAtk: 30, baseDef: 35, baseSpd: 45, evolvesAt: 7, evolvesInto: SPECIES.Metaphrase },
  [SPECIES.Metaphrase]: { get name() { return t("monsters.Metaphrase") }, get type() { return t("types.Bug") }, rawType: MONSTER_TYPES.BUG, emoji: '📦', baseHp: 50, baseAtk: 20, baseDef: 55, baseSpd: 30, evolvesAt: 10, evolvesInto: SPECIES.Butterfluent },
  [SPECIES.Butterfluent]: { get name() { return t("monsters.Butterfluent") }, get type() { return t("types.Bug") }, rawType: MONSTER_TYPES.BUG, emoji: '🦋', baseHp: 60, baseAtk: 45, baseDef: 50, baseSpd: 70 },

  [SPECIES.Weedword]: { get name() { return t("monsters.Weedword") }, get type() { return t("types.Bug") }, rawType: MONSTER_TYPES.BUG, emoji: '🐛', baseHp: 40, baseAtk: 35, baseDef: 30, baseSpd: 50, evolvesAt: 7, evolvesInto: SPECIES.Verbakuna },
  [SPECIES.Verbakuna]: { get name() { return t("monsters.Verbakuna") }, get type() { return t("types.Bug") }, rawType: MONSTER_TYPES.BUG, emoji: '🍯', baseHp: 45, baseAtk: 25, baseDef: 50, baseSpd: 35, evolvesAt: 10, evolvesInto: SPECIES.Beedictionary },
  [SPECIES.Beedictionary]: { get name() { return t("monsters.Beedictionary") }, get type() { return t("types.Bug") }, rawType: MONSTER_TYPES.BUG, emoji: '🐝', baseHp: 65, baseAtk: 80, baseDef: 40, baseSpd: 75 },

  [SPECIES.Aviprosa]: { get name() { return t("monsters.Aviprosa") }, get type() { return t("types.Flying") }, rawType: MONSTER_TYPES.FLYING, emoji: '🐦', baseHp: 40, baseAtk: 45, baseDef: 40, baseSpd: 56, evolvesAt: 18, evolvesInto: SPECIES.Syntaxo },
  [SPECIES.Syntaxo]: { get name() { return t("monsters.Syntaxo") }, get type() { return t("types.Flying") }, rawType: MONSTER_TYPES.FLYING, emoji: '🦅', baseHp: 63, baseAtk: 60, baseDef: 55, baseSpd: 71, evolvesAt: 36, evolvesInto: SPECIES.Vocalis },
  [SPECIES.Vocalis]: { get name() { return t("monsters.Vocalis") }, get type() { return t("types.Flying") }, rawType: MONSTER_TYPES.FLYING, emoji: '👑', baseHp: 83, baseAtk: 80, baseDef: 75, baseSpd: 91 },

  [SPECIES.Verminverb]: { get name() { return t("monsters.Verminverb") }, get type() { return t("types.Normal") }, rawType: MONSTER_TYPES.NORMAL, emoji: '🐀', baseHp: 30, baseAtk: 56, baseDef: 35, baseSpd: 72, evolvesAt: 20, evolvesInto: SPECIES.Lexicat },
  [SPECIES.Lexicat]: { get name() { return t("monsters.Lexicat") }, get type() { return t("types.Normal") }, rawType: MONSTER_TYPES.NORMAL, emoji: '🐀', baseHp: 55, baseAtk: 81, baseDef: 60, baseSpd: 97 },

  [SPECIES.Penpigeon]: { get name() { return t("monsters.Penpigeon") }, get type() { return t("types.Flying") }, rawType: MONSTER_TYPES.FLYING, emoji: '🐦', baseHp: 40, baseAtk: 60, baseDef: 30, baseSpd: 70, evolvesAt: 20, evolvesInto: SPECIES.Foliofalcon },
  [SPECIES.Foliofalcon]: { get name() { return t("monsters.Foliofalcon") }, get type() { return t("types.Flying") }, rawType: MONSTER_TYPES.FLYING, emoji: '🦅', baseHp: 65, baseAtk: 90, baseDef: 65, baseSpd: 100 },

  [SPECIES.Slinkscript]: { get name() { return t("monsters.Slinkscript") }, get type() { return t("types.Poison") }, rawType: MONSTER_TYPES.POISON, emoji: '🐍', baseHp: 35, baseAtk: 60, baseDef: 44, baseSpd: 55, evolvesAt: 22, evolvesInto: SPECIES.Vipervocab },
  [SPECIES.Vipervocab]: { get name() { return t("monsters.Vipervocab") }, get type() { return t("types.Poison") }, rawType: MONSTER_TYPES.POISON, emoji: '🐍', baseHp: 60, baseAtk: 85, baseDef: 69, baseSpd: 80 },

  [SPECIES.Burrowbook]: { get name() { return t("monsters.Burrowbook") }, get type() { return t("types.Ground") }, rawType: MONSTER_TYPES.GROUND, emoji: '🦔', baseHp: 50, baseAtk: 75, baseDef: 85, baseSpd: 40, evolvesAt: 22, evolvesInto: SPECIES.Quillquote },
  [SPECIES.Quillquote]: { get name() { return t("monsters.Quillquote") }, get type() { return t("types.Ground") }, rawType: MONSTER_TYPES.GROUND, emoji: '🦔', baseHp: 75, baseAtk: 100, baseDef: 110, baseSpd: 65 },

  [SPECIES.Pointernote]: { get name() { return t("monsters.Pointernote") }, get type() { return t("types.Poison") }, rawType: MONSTER_TYPES.POISON, emoji: '🦂', baseHp: 46, baseAtk: 57, baseDef: 40, baseSpd: 50, evolvesAt: 16, evolvesInto: SPECIES.Venomverse },
  [SPECIES.Venomverse]: { get name() { return t("monsters.Venomverse") }, get type() { return t("types.Poison") }, rawType: MONSTER_TYPES.POISON, emoji: '🦂', baseHp: 61, baseAtk: 72, baseDef: 57, baseSpd: 65, evolvesAt: 36, evolvesInto: SPECIES.Toxiterm },
  [SPECIES.Toxiterm]: { get name() { return t("monsters.Toxiterm") }, get type() { return t("types.Poison") }, rawType: MONSTER_TYPES.POISON, emoji: '👑', baseHp: 81, baseAtk: 92, baseDef: 77, baseSpd: 85 },

  [SPECIES.Clausefairy]: { get name() { return t("monsters.Clausefairy") }, get type() { return t("types.Normal") }, rawType: MONSTER_TYPES.NORMAL, emoji: '🧚', baseHp: 70, baseAtk: 45, baseDef: 48, baseSpd: 35, evolvesAt: 25, evolvesInto: SPECIES.Citable },
  [SPECIES.Citable]: { get name() { return t("monsters.Citable") }, get type() { return t("types.Normal") }, rawType: MONSTER_TYPES.NORMAL, emoji: '🧚', baseHp: 95, baseAtk: 70, baseDef: 73, baseSpd: 60 },

  [SPECIES.Foxphrase]: { get name() { return t("monsters.Foxphrase") }, get type() { return t("types.Fire") }, rawType: MONSTER_TYPES.FIRE, emoji: '🦊', baseHp: 38, baseAtk: 41, baseDef: 40, baseSpd: 65, evolvesAt: 25, evolvesInto: SPECIES.Fablefire },
  [SPECIES.Fablefire]: { get name() { return t("monsters.Fablefire") }, get type() { return t("types.Fire") }, rawType: MONSTER_TYPES.FIRE, emoji: '🦊', baseHp: 73, baseAtk: 76, baseDef: 75, baseSpd: 100 },

  [SPECIES.Puffpoet]: { get name() { return t("monsters.Puffpoet") }, get type() { return t("types.Normal") }, rawType: MONSTER_TYPES.NORMAL, emoji: '🎈', baseHp: 115, baseAtk: 45, baseDef: 20, baseSpd: 20, evolvesAt: 25, evolvesInto: SPECIES.Balloonbard },
  [SPECIES.Balloonbard]: { get name() { return t("monsters.Balloonbard") }, get type() { return t("types.Normal") }, rawType: MONSTER_TYPES.NORMAL, emoji: '🎈', baseHp: 140, baseAtk: 70, baseDef: 45, baseSpd: 45 },

  [SPECIES.Wingword]: { get name() { return t("monsters.Wingword") }, get type() { return t("types.Poison") }, rawType: MONSTER_TYPES.POISON, emoji: '🦇', baseHp: 40, baseAtk: 45, baseDef: 35, baseSpd: 55, evolvesAt: 22, evolvesInto: SPECIES.Echoedit },
  [SPECIES.Echoedit]: { get name() { return t("monsters.Echoedit") }, get type() { return t("types.Poison") }, rawType: MONSTER_TYPES.POISON, emoji: '🦇', baseHp: 75, baseAtk: 80, baseDef: 70, baseSpd: 90 },

  [SPECIES.Odeish]: { get name() { return t("monsters.Odeish") }, get type() { return t("types.Grass") }, rawType: MONSTER_TYPES.GRASS, emoji: '🌱', baseHp: 45, baseAtk: 50, baseDef: 55, baseSpd: 30, evolvesAt: 21, evolvesInto: SPECIES.Grammgloom },
  [SPECIES.Grammgloom]: { get name() { return t("monsters.Grammgloom") }, get type() { return t("types.Grass") }, rawType: MONSTER_TYPES.GRASS, emoji: '🤢', baseHp: 60, baseAtk: 65, baseDef: 70, baseSpd: 40, evolvesAt: 32, evolvesInto: SPECIES.Vocabplume },
  [SPECIES.Vocabplume]: { get name() { return t("monsters.Vocabplume") }, get type() { return t("types.Grass") }, rawType: MONSTER_TYPES.GRASS, emoji: '🌸', baseHp: 75, baseAtk: 80, baseDef: 85, baseSpd: 50 },

  [SPECIES.Phraseling]: { get name() { return t("monsters.Phraseling") }, get type() { return t("types.Bug") }, rawType: MONSTER_TYPES.BUG, emoji: '🍄', baseHp: 35, baseAtk: 70, baseDef: 55, baseSpd: 25, evolvesAt: 24, evolvesInto: SPECIES.Paragraphid },
  [SPECIES.Paragraphid]: { get name() { return t("monsters.Paragraphid") }, get type() { return t("types.Bug") }, rawType: MONSTER_TYPES.BUG, emoji: '🍄', baseHp: 60, baseAtk: 95, baseDef: 80, baseSpd: 30 },

  [SPECIES.Voicenat]: { get name() { return t("monsters.Voicenat") }, get type() { return t("types.Bug") }, rawType: MONSTER_TYPES.BUG, emoji: '🕷️', baseHp: 60, baseAtk: 55, baseDef: 50, baseSpd: 45, evolvesAt: 31, evolvesInto: SPECIES.Vowelmoth },
  [SPECIES.Vowelmoth]: { get name() { return t("monsters.Vowelmoth") }, get type() { return t("types.Bug") }, rawType: MONSTER_TYPES.BUG, emoji: '🦋', baseHp: 70, baseAtk: 65, baseDef: 60, baseSpd: 90 },

  [SPECIES.Dictatone]: { get name() { return t("monsters.Dictatone") }, get type() { return t("types.Ground") }, rawType: MONSTER_TYPES.GROUND, emoji: '⛰️', baseHp: 10, baseAtk: 55, baseDef: 25, baseSpd: 95, evolvesAt: 26, evolvesInto: SPECIES.Dialogrio },
  [SPECIES.Dialogrio]: { get name() { return t("monsters.Dialogrio") }, get type() { return t("types.Ground") }, rawType: MONSTER_TYPES.GROUND, emoji: '⛰️', baseHp: 35, baseAtk: 80, baseDef: 50, baseSpd: 120 },

  [SPECIES.Memocat]: { get name() { return t("monsters.Memocat") }, get type() { return t("types.Normal") }, rawType: MONSTER_TYPES.NORMAL, emoji: '🐱', baseHp: 40, baseAtk: 45, baseDef: 35, baseSpd: 90, evolvesAt: 28, evolvesInto: SPECIES.Poetcat },
  [SPECIES.Poetcat]: { get name() { return t("monsters.Poetcat") }, get type() { return t("types.Normal") }, rawType: MONSTER_TYPES.NORMAL, emoji: '🐱', baseHp: 65, baseAtk: 70, baseDef: 60, baseSpd: 115 },

  [SPECIES.Punderduck]: { get name() { return t("monsters.Punderduck") }, get type() { return t("types.Water") }, rawType: MONSTER_TYPES.WATER, emoji: '🦆', baseHp: 50, baseAtk: 52, baseDef: 48, baseSpd: 55, evolvesAt: 33, evolvesInto: SPECIES.Quackquote },
  [SPECIES.Quackquote]: { get name() { return t("monsters.Quackquote") }, get type() { return t("types.Water") }, rawType: MONSTER_TYPES.WATER, emoji: '🦆', baseHp: 80, baseAtk: 82, baseDef: 78, baseSpd: 85 },

  [SPECIES.Primath]: { get name() { return t("monsters.Primath") }, get type() { return t("types.Fighting") }, rawType: MONSTER_TYPES.FIGHTING, emoji: '🐒', baseHp: 40, baseAtk: 80, baseDef: 35, baseSpd: 70, evolvesAt: 28, evolvesInto: SPECIES.Gorillagram },
  [SPECIES.Gorillagram]: { get name() { return t("monsters.Gorillagram") }, get type() { return t("types.Fighting") }, rawType: MONSTER_TYPES.FIGHTING, emoji: '🐒', baseHp: 65, baseAtk: 105, baseDef: 60, baseSpd: 95 },

  [SPECIES.Barkbook]: { get name() { return t("monsters.Barkbook") }, get type() { return t("types.Fire") }, rawType: MONSTER_TYPES.FIRE, emoji: '🐶', baseHp: 55, baseAtk: 70, baseDef: 45, baseSpd: 60, evolvesAt: 30, evolvesInto: SPECIES.Houndhaiku },
  [SPECIES.Houndhaiku]: { get name() { return t("monsters.Houndhaiku") }, get type() { return t("types.Fire") }, rawType: MONSTER_TYPES.FIRE, emoji: '🐕', baseHp: 90, baseAtk: 110, baseDef: 80, baseSpd: 95 },

  [SPECIES.Printwag]: { get name() { return t("monsters.Printwag") }, get type() { return t("types.Water") }, rawType: MONSTER_TYPES.WATER, emoji: '🌀', baseHp: 40, baseAtk: 50, baseDef: 40, baseSpd: 90, evolvesAt: 25, evolvesInto: SPECIES.Pagewhirl },
  [SPECIES.Pagewhirl]: { get name() { return t("monsters.Pagewhirl") }, get type() { return t("types.Water") }, rawType: MONSTER_TYPES.WATER, emoji: '🌀', baseHp: 65, baseAtk: 65, baseDef: 65, baseSpd: 90, evolvesAt: 36, evolvesInto: SPECIES.Paperwrath },
  [SPECIES.Paperwrath]: { get name() { return t("monsters.Paperwrath") }, get type() { return t("types.Water") }, rawType: MONSTER_TYPES.WATER, emoji: '🐸', baseHp: 90, baseAtk: 95, baseDef: 95, baseSpd: 70 },

  [SPECIES.Abstra]: { get name() { return t("monsters.Abstra") }, get type() { return t("types.Psychic") }, rawType: MONSTER_TYPES.PSYCHIC, emoji: '🧠', baseHp: 25, baseAtk: 20, baseDef: 15, baseSpd: 90, evolvesAt: 16, evolvesInto: SPECIES.Keydabra },
  [SPECIES.Keydabra]: { get name() { return t("monsters.Keydabra") }, get type() { return t("types.Psychic") }, rawType: MONSTER_TYPES.PSYCHIC, emoji: '🧠', baseHp: 40, baseAtk: 35, baseDef: 30, baseSpd: 105, evolvesAt: 36, evolvesInto: SPECIES.Archizam },
  [SPECIES.Archizam]: { get name() { return t("monsters.Archizam") }, get type() { return t("types.Psychic") }, rawType: MONSTER_TYPES.PSYCHIC, emoji: '🧠', baseHp: 55, baseAtk: 50, baseDef: 45, baseSpd: 120 },

  [SPECIES.Chopscript]: { get name() { return t("monsters.Chopscript") }, get type() { return t("types.Fighting") }, rawType: MONSTER_TYPES.FIGHTING, emoji: '💪', baseHp: 70, baseAtk: 80, baseDef: 50, baseSpd: 35, evolvesAt: 28, evolvesInto: SPECIES.Chokemessage },
  [SPECIES.Chokemessage]: { get name() { return t("monsters.Chokemessage") }, get type() { return t("types.Fighting") }, rawType: MONSTER_TYPES.FIGHTING, emoji: '💪', baseHp: 80, baseAtk: 100, baseDef: 70, baseSpd: 45, evolvesAt: 36, evolvesInto: SPECIES.Champmanual },
  [SPECIES.Champmanual]: { get name() { return t("monsters.Champmanual") }, get type() { return t("types.Fighting") }, rawType: MONSTER_TYPES.FIGHTING, emoji: '💪', baseHp: 90, baseAtk: 130, baseDef: 80, baseSpd: 55 },

  [SPECIES.Rudeo]: { get name() { return t("monsters.Rudeo") }, get type() { return t("types.Rock") }, rawType: MONSTER_TYPES.ROCK, emoji: '🪨', baseHp: 40, baseAtk: 80, baseDef: 100, baseSpd: 20, evolvesAt: 25, evolvesInto: SPECIES.Glossler },
  [SPECIES.Glossler]: { get name() { return t("monsters.Glossler") }, get type() { return t("types.Rock") }, rawType: MONSTER_TYPES.ROCK, emoji: '🪨', baseHp: 55, baseAtk: 95, baseDef: 115, baseSpd: 35, evolvesAt: 36, evolvesInto: SPECIES.Textlem },
  [SPECIES.Textlem]: { get name() { return t("monsters.Textlem") }, get type() { return t("types.Rock") }, rawType: MONSTER_TYPES.ROCK, emoji: '🪨', baseHp: 80, baseAtk: 120, baseDef: 130, baseSpd: 45 },

  [SPECIES.Spellpoke]: { get name() { return t("monsters.Spellpoke") }, get type() { return t("types.Psychic") }, rawType: MONSTER_TYPES.PSYCHIC, emoji: '🧠', baseHp: 90, baseAtk: 65, baseDef: 65, baseSpd: 15, evolvesAt: 37, evolvesInto: SPECIES.Bookbro },
  [SPECIES.Bookbro]: { get name() { return t("monsters.Bookbro") }, get type() { return t("types.Psychic") }, rawType: MONSTER_TYPES.PSYCHIC, emoji: '🐚', baseHp: 95, baseAtk: 75, baseDef: 110, baseSpd: 30 },

  [SPECIES.Ghostwriter]: { get name() { return t("monsters.Ghostwriter") }, get type() { return t("types.Ghost") }, rawType: MONSTER_TYPES.GHOST, emoji: '👻', baseHp: 30, baseAtk: 35, baseDef: 30, baseSpd: 80, evolvesAt: 25, evolvesInto: SPECIES.Haikunter },
  [SPECIES.Haikunter]: { get name() { return t("monsters.Haikunter") }, get type() { return t("types.Ghost") }, rawType: MONSTER_TYPES.GHOST, emoji: '👻', baseHp: 45, baseAtk: 50, baseDef: 45, baseSpd: 95, evolvesAt: 36, evolvesInto: SPECIES.Gramgar },
  [SPECIES.Gramgar]: { get name() { return t("monsters.Gramgar") }, get type() { return t("types.Ghost") }, rawType: MONSTER_TYPES.GHOST, emoji: '😈', baseHp: 60, baseAtk: 65, baseDef: 60, baseSpd: 110 },

  [SPECIES.Outlinix]: { get name() { return t("monsters.Outlinix") }, get type() { return t("types.Rock") }, rawType: MONSTER_TYPES.ROCK, emoji: '🐍', baseHp: 35, baseAtk: 45, baseDef: 160, baseSpd: 70 },

  [SPECIES.Copybone]: { get name() { return t("monsters.Copybone") }, get type() { return t("types.Ground") }, rawType: MONSTER_TYPES.GROUND, emoji: '🦴', baseHp: 50, baseAtk: 50, baseDef: 95, baseSpd: 35, evolvesAt: 28, evolvesInto: SPECIES.Memowak },
  [SPECIES.Memowak]: { get name() { return t("monsters.Memowak") }, get type() { return t("types.Ground") }, rawType: MONSTER_TYPES.GROUND, emoji: '🦴', baseHp: 60, baseAtk: 80, baseDef: 110, baseSpd: 45 },

  [SPECIES.Leeletter]: { get name() { return t("monsters.Leeletter") }, get type() { return t("types.Fighting") }, rawType: MONSTER_TYPES.FIGHTING, emoji: '🦵', baseHp: 50, baseAtk: 120, baseDef: 53, baseSpd: 87 },
  [SPECIES.Chanhistory]: { get name() { return t("monsters.Chanhistory") }, get type() { return t("types.Fighting") }, rawType: MONSTER_TYPES.FIGHTING, emoji: '🥊', baseHp: 50, baseAtk: 105, baseDef: 79, baseSpd: 76 },

  [SPECIES.Kerneloff]: { get name() { return t("monsters.Kerneloff") }, get type() { return t("types.Poison") }, rawType: MONSTER_TYPES.POISON, emoji: '💣', baseHp: 40, baseAtk: 65, baseDef: 95, baseSpd: 35, evolvesAt: 35, evolvesInto: SPECIES.Wordweeze },
  [SPECIES.Wordweeze]: { get name() { return t("monsters.Wordweeze") }, get type() { return t("types.Poison") }, rawType: MONSTER_TYPES.POISON, emoji: '💨', baseHp: 65, baseAtk: 90, baseDef: 120, baseSpd: 60 },

  [SPECIES.Citesey]: { get name() { return t("monsters.Citesey") }, get type() { return t("types.Normal") }, rawType: MONSTER_TYPES.NORMAL, emoji: '🥚', baseHp: 250, baseAtk: 5, baseDef: 5, baseSpd: 50 },

  [SPECIES.Scrypt]: { get name() { return t("monsters.Scrypt") }, get type() { return t("types.Bug") }, rawType: MONSTER_TYPES.BUG, emoji: '🔪', baseHp: 70, baseAtk: 110, baseDef: 80, baseSpd: 105 },

  [SPECIES.Finfolio]: { get name() { return t("monsters.Finfolio") }, get type() { return t("types.Water") }, rawType: MONSTER_TYPES.WATER, emoji: '🐟', baseHp: 20, baseAtk: 10, baseDef: 55, baseSpd: 80, evolvesAt: 20, evolvesInto: SPECIES.Seaslang },
  [SPECIES.Seaslang]: { get name() { return t("monsters.Seaslang") }, get type() { return t("types.Water") }, rawType: MONSTER_TYPES.WATER, emoji: '🐉', baseHp: 95, baseAtk: 125, baseDef: 79, baseSpd: 81 },

  [SPECIES.Legendras]: { get name() { return t("monsters.Legendras") }, get type() { return t("types.Water") }, rawType: MONSTER_TYPES.WATER, emoji: '⛵', baseHp: 130, baseAtk: 85, baseDef: 80, baseSpd: 60 },

  [SPECIES.Drafto]: { get name() { return t("monsters.Drafto") }, get type() { return t("types.Normal") }, rawType: MONSTER_TYPES.NORMAL, emoji: '👥', baseHp: 48, baseAtk: 48, baseDef: 48, baseSpd: 48 },

  [SPECIES.Essayve]: { get name() { return t("monsters.Essayve") }, get type() { return t("types.Normal") }, rawType: MONSTER_TYPES.NORMAL, emoji: '🐕', baseHp: 55, baseAtk: 55, baseDef: 50, baseSpd: 55, evolvesAt: 20, evolvesInto: SPECIES.Verseon }, // Simplified evolution
  [SPECIES.Verseon]: { get name() { return t("monsters.Verseon") }, get type() { return t("types.Water") }, rawType: MONSTER_TYPES.WATER, emoji: '🧜', baseHp: 130, baseAtk: 65, baseDef: 60, baseSpd: 65 },
  [SPECIES.Jingleon]: { get name() { return t("monsters.Jingleon") }, get type() { return t("types.Electric") }, rawType: MONSTER_TYPES.ELECTRIC, emoji: '⚡', baseHp: 65, baseAtk: 65, baseDef: 60, baseSpd: 130 },
  [SPECIES.Noteon]: { get name() { return t("monsters.Noteon") }, get type() { return t("types.Fire") }, rawType: MONSTER_TYPES.FIRE, emoji: '🔥', baseHp: 65, baseAtk: 130, baseDef: 60, baseSpd: 65 },

  [SPECIES.Summarylax]: { get name() { return t("monsters.Summarylax") }, get type() { return t("types.Normal") }, rawType: MONSTER_TYPES.NORMAL, emoji: '😴', baseHp: 160, baseAtk: 110, baseDef: 65, baseSpd: 30 },

  [SPECIES.Draftini]: { get name() { return t("monsters.Draftini") }, get type() { return t("types.Dragon") }, rawType: MONSTER_TYPES.DRAGON, emoji: '🐉', baseHp: 41, baseAtk: 64, baseDef: 45, baseSpd: 50, evolvesAt: 30, evolvesInto: SPECIES.Docair },
  [SPECIES.Docair]: { get name() { return t("monsters.Docair") }, get type() { return t("types.Dragon") }, rawType: MONSTER_TYPES.DRAGON, emoji: '🐉', baseHp: 61, baseAtk: 84, baseDef: 65, baseSpd: 70, evolvesAt: 55, evolvesInto: SPECIES.Datanite },
  [SPECIES.Datanite]: { get name() { return t("monsters.Datanite") }, get type() { return t("types.Dragon") }, rawType: MONSTER_TYPES.DRAGON, emoji: '🐉', baseHp: 91, baseAtk: 134, baseDef: 95, baseSpd: 80 },

  [SPECIES.Musetwo]: { get name() { return t("monsters.Musetwo") }, get type() { return t("types.Psychic") }, rawType: MONSTER_TYPES.PSYCHIC, emoji: '👽', baseHp: 106, baseAtk: 110, baseDef: 90, baseSpd: 130 },
  [SPECIES.Muse]: { get name() { return t("monsters.Muse") }, get type() { return t("types.Psychic") }, rawType: MONSTER_TYPES.PSYCHIC, emoji: '✨', baseHp: 100, baseAtk: 100, baseDef: 100, baseSpd: 100 },
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

export function calculateDamage(attacker, defender, basePower, difficulty = 1) {
  const atk = attacker.atk || calculateStat(MONS[attacker.species]?.baseAtk || 50, attacker.level);
  const def = defender.def || calculateStat(MONS[defender.species]?.baseDef || 50, defender.level);

  // Use word difficulty to scale damage: Easy (1) -> 1.0x, Hard (2) -> 1.5x
  const difficultyMultiplier = difficulty === 2 ? 1.5 : 1.0;

  // Use raw types for type chart calculation
  // We access the underlying MONS definition which has the getter, but we need the raw constant
  // Actually, we can just look up the MONS[species] and check what it points to in TYPE_CHART
  // But wait, the getters return translated strings. We need the keys.
  // Let s use a helper or just access the raw MONS constant if we had it.
  // Alternatively, we can find which MONSTER_TYPES key matches the untranslated type.
  // Actually, let s just use the species to look up the base type again safely.

  const attackerRawType = MONS[attacker.species]?.rawType;
  const defenderRawType = MONS[defender.species]?.rawType;
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

export function calculateExpToNext(level) {
  // Use a quadratic formula for smoother "per-level" progression
  return Math.floor(5 * Math.pow(level, 2)) + 10;
}

export function createMon(species, level = 5) {
  const base = MONS[species] || MONS[SPECIES.Verminverb];
  const hp = calculateStat(base.baseHp, level, true);
  const atk = calculateStat(base.baseAtk, level);
  const def = calculateStat(base.baseDef, level);
  const spd = calculateStat(base.baseSpd, level);

  return {
    species,
    get name() { return t("monsters." + this.species) },
    get type() { return t("types." + base.rawType) },
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
  // Pokemon-inspired formula: (Base * Level) / 7
  const baseExp = 60;
  const trainerBonus = isTrainer ? 1.5 : 1.0;
  return Math.floor((baseExp * enemyMon.level / 7) * trainerBonus);
}

/**
 * Linear algorithm for battle timer duration.
 * Harder and longer words receive more time.
 * @param {Object} wordObj - The word object
 * @param {boolean} isCapture - Whether this is a capture attempt
 * @returns {number} Duration in seconds
 */
export function calculateTimerDuration(wordObj, isCapture = false) {
  const base = isCapture ? 6 : 8;
  const diffMultiplier = isCapture ? 1.5 : 2;
  const lengthMultiplier = isCapture ? 0.4 : 0.6;

  const difficulty = wordObj.difficulty || 1;
  const length = wordObj.word.length;

  const time = base + (difficulty * diffMultiplier) + (length * lengthMultiplier);
  return Math.round(time);
}

export const AREA_CONFIGS = {
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
