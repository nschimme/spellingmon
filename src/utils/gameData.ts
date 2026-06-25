import { MONSTER_TYPES, BIOMES, MOVE_IDS, MOVE_CATEGORIES, STATUS_CONDITIONS } from './constants';

export interface Monster {
  id: string;
  species: string;
  emoji: string;
  types: string[];
  level: number;
  hp: number;
  maxHp: number;
  atk: number;
  def: number;
  spa: number; // Special Attack
  spd: number; // Special Defense
  spe: number; // Speed
  exp: number;
  expToNext: number;
  moves: string[];
  status: string;
  statusTurns?: number;
  stages: Record<string, number>;
}

export interface SpeciesBase {
  types: string[];
  emoji: string;
  baseHp: number;
  baseAtk: number;
  baseDef: number;
  baseSpa: number;
  baseSpd: number;
  baseSpe: number;
  evolvesAt?: number;
  evolvesInto?: string;
  learnset: Record<number, string[]>;
}

export interface Move {
  id: string;
  name: string;
  type: string;
  category: string;
  power: number;
  accuracy: number;
  effect?: string;
  effectChance?: number;
}

export const MOVES: Record<string, Move> = {
  [MOVE_IDS.Absorb]: { id: MOVE_IDS.Absorb, name: "LexiconLeech", type: MONSTER_TYPES.GRASS, category: MOVE_CATEGORIES.SPECIAL, power: 20, accuracy: 100 },
  [MOVE_IDS.Acid]: { id: MOVE_IDS.Acid, name: "InkSpray", type: MONSTER_TYPES.POISON, category: MOVE_CATEGORIES.SPECIAL, power: 40, accuracy: 100 },
  [MOVE_IDS.AcidArmor]: { id: MOVE_IDS.AcidArmor, name: "InkShield", type: MONSTER_TYPES.POISON, category: MOVE_CATEGORIES.STATUS, power: 0, accuracy: 100 },
  [MOVE_IDS.Agility]: { id: MOVE_IDS.Agility, name: "QuickQuote", type: MONSTER_TYPES.PSYCHIC, category: MOVE_CATEGORIES.STATUS, power: 0, accuracy: 100 },
  [MOVE_IDS.Amnesia]: { id: MOVE_IDS.Amnesia, name: "WriterBlock", type: MONSTER_TYPES.PSYCHIC, category: MOVE_CATEGORIES.STATUS, power: 0, accuracy: 100 },
  [MOVE_IDS.AuroraBeam]: { id: MOVE_IDS.AuroraBeam, name: "PrismProse", type: MONSTER_TYPES.ICE, category: MOVE_CATEGORIES.SPECIAL, power: 65, accuracy: 100 },
  [MOVE_IDS.Barrage]: { id: MOVE_IDS.Barrage, name: "VolleyVerb", type: MONSTER_TYPES.NORMAL, category: MOVE_CATEGORIES.PHYSICAL, power: 15, accuracy: 85 },
  [MOVE_IDS.Barrier]: { id: MOVE_IDS.Barrier, name: "Blockade", type: MONSTER_TYPES.PSYCHIC, category: MOVE_CATEGORIES.STATUS, power: 0, accuracy: 100 },
  [MOVE_IDS.Bide]: { id: MOVE_IDS.Bide, name: "WaitAndWrite", type: MONSTER_TYPES.NORMAL, category: MOVE_CATEGORIES.PHYSICAL, power: 0, accuracy: 100 },
  [MOVE_IDS.Bind]: { id: MOVE_IDS.Bind, name: "SentenceStay", type: MONSTER_TYPES.NORMAL, category: MOVE_CATEGORIES.PHYSICAL, power: 15, accuracy: 85 },
  [MOVE_IDS.Bite]: { id: MOVE_IDS.Bite, name: "WordSnap", type: MONSTER_TYPES.NORMAL, category: MOVE_CATEGORIES.PHYSICAL, power: 60, accuracy: 100 },
  [MOVE_IDS.Blizzard]: { id: MOVE_IDS.Blizzard, name: "ArcticAuthor", type: MONSTER_TYPES.ICE, category: MOVE_CATEGORIES.SPECIAL, power: 110, accuracy: 70 },
  [MOVE_IDS.BodySlam]: { id: MOVE_IDS.BodySlam, name: "TomeTopple", type: MONSTER_TYPES.NORMAL, category: MOVE_CATEGORIES.PHYSICAL, power: 85, accuracy: 100 },
  [MOVE_IDS.BoneClub]: { id: MOVE_IDS.BoneClub, name: "ManuscriptMace", type: MONSTER_TYPES.GROUND, category: MOVE_CATEGORIES.PHYSICAL, power: 65, accuracy: 85 },
  [MOVE_IDS.Bonemerang]: { id: MOVE_IDS.Bonemerang, name: "TomeThrow", type: MONSTER_TYPES.GROUND, category: MOVE_CATEGORIES.PHYSICAL, power: 50, accuracy: 90 },
  [MOVE_IDS.Bubble]: { id: MOVE_IDS.Bubble, name: "InkPop", type: MONSTER_TYPES.WATER, category: MOVE_CATEGORIES.SPECIAL, power: 40, accuracy: 100 },
  [MOVE_IDS.BubbleBeam]: { id: MOVE_IDS.BubbleBeam, name: "InkStream", type: MONSTER_TYPES.WATER, category: MOVE_CATEGORIES.SPECIAL, power: 65, accuracy: 100 },
  [MOVE_IDS.Clamp]: { id: MOVE_IDS.Clamp, name: "FolderForce", type: MONSTER_TYPES.WATER, category: MOVE_CATEGORIES.PHYSICAL, power: 35, accuracy: 85 },
  [MOVE_IDS.CometPunch]: { id: MOVE_IDS.CometPunch, name: "PunctuationPunch", type: MONSTER_TYPES.NORMAL, category: MOVE_CATEGORIES.PHYSICAL, power: 18, accuracy: 85 },
  [MOVE_IDS.ConfuseRay]: { id: MOVE_IDS.ConfuseRay, name: "DizzyDictation", type: MONSTER_TYPES.GHOST, category: MOVE_CATEGORIES.STATUS, power: 0, accuracy: 100 },
  [MOVE_IDS.Confusion]: { id: MOVE_IDS.Confusion, name: "MuddledMsg", type: MONSTER_TYPES.PSYCHIC, category: MOVE_CATEGORIES.SPECIAL, power: 50, accuracy: 100 },
  [MOVE_IDS.Constrict]: { id: MOVE_IDS.Constrict, name: "TightType", type: MONSTER_TYPES.NORMAL, category: MOVE_CATEGORIES.PHYSICAL, power: 10, accuracy: 100 },
  [MOVE_IDS.Conversion]: { id: MOVE_IDS.Conversion, name: "FormatFlip", type: MONSTER_TYPES.NORMAL, category: MOVE_CATEGORIES.STATUS, power: 0, accuracy: 100 },
  [MOVE_IDS.Counter]: { id: MOVE_IDS.Counter, name: "Rebuttal", type: MONSTER_TYPES.FIGHTING, category: MOVE_CATEGORIES.PHYSICAL, power: 0, accuracy: 100 },
  [MOVE_IDS.Crabhammer]: { id: MOVE_IDS.Crabhammer, name: "ClawClause", type: MONSTER_TYPES.WATER, category: MOVE_CATEGORIES.PHYSICAL, power: 100, accuracy: 90 },
  [MOVE_IDS.Cut]: { id: MOVE_IDS.Cut, name: "EditEdge", type: MONSTER_TYPES.NORMAL, category: MOVE_CATEGORIES.PHYSICAL, power: 50, accuracy: 95 },
  [MOVE_IDS.DefenseCurl]: { id: MOVE_IDS.DefenseCurl, name: "BookRoll", type: MONSTER_TYPES.NORMAL, category: MOVE_CATEGORIES.STATUS, power: 0, accuracy: 100 },
  [MOVE_IDS.Dig]: { id: MOVE_IDS.Dig, name: "FootnoteFollow", type: MONSTER_TYPES.GROUND, category: MOVE_CATEGORIES.PHYSICAL, power: 80, accuracy: 100 },
  [MOVE_IDS.Disable]: { id: MOVE_IDS.Disable, name: "MuteMove", type: MONSTER_TYPES.NORMAL, category: MOVE_CATEGORIES.STATUS, power: 0, accuracy: 100 },
  [MOVE_IDS.DizzyPunch]: { id: MOVE_IDS.DizzyPunch, name: "DazedDraft", type: MONSTER_TYPES.NORMAL, category: MOVE_CATEGORIES.PHYSICAL, power: 70, accuracy: 100 },
  [MOVE_IDS.DoubleKick]: { id: MOVE_IDS.DoubleKick, name: "DualDactyl", type: MONSTER_TYPES.FIGHTING, category: MOVE_CATEGORIES.PHYSICAL, power: 30, accuracy: 100 },
  [MOVE_IDS.DoubleSlap]: { id: MOVE_IDS.DoubleSlap, name: "PairOfParagraphs", type: MONSTER_TYPES.NORMAL, category: MOVE_CATEGORIES.PHYSICAL, power: 15, accuracy: 85 },
  [MOVE_IDS.DoubleTeam]: { id: MOVE_IDS.DoubleTeam, name: "CloneCopy", type: MONSTER_TYPES.NORMAL, category: MOVE_CATEGORIES.STATUS, power: 0, accuracy: 100 },
  [MOVE_IDS.DoubleEdge]: { id: MOVE_IDS.DoubleEdge, name: "HardHaiku", type: MONSTER_TYPES.NORMAL, category: MOVE_CATEGORIES.PHYSICAL, power: 120, accuracy: 100 },
  [MOVE_IDS.DragonRage]: { id: MOVE_IDS.DragonRage, name: "LoreLash", type: MONSTER_TYPES.DRAGON, category: MOVE_CATEGORIES.SPECIAL, power: 0, accuracy: 100 },
  [MOVE_IDS.DreamEater]: { id: MOVE_IDS.DreamEater, name: "FableFeed", type: MONSTER_TYPES.PSYCHIC, category: MOVE_CATEGORIES.SPECIAL, power: 100, accuracy: 100 },
  [MOVE_IDS.DrillPeck]: { id: MOVE_IDS.DrillPeck, name: "SpiralScript", type: MONSTER_TYPES.FLYING, category: MOVE_CATEGORIES.PHYSICAL, power: 80, accuracy: 100 },
  [MOVE_IDS.Earthquake]: { id: MOVE_IDS.Earthquake, name: "PageQuake", type: MONSTER_TYPES.GROUND, category: MOVE_CATEGORIES.PHYSICAL, power: 100, accuracy: 100 },
  [MOVE_IDS.EggBomb]: { id: MOVE_IDS.EggBomb, name: "ShellScript", type: MONSTER_TYPES.NORMAL, category: MOVE_CATEGORIES.PHYSICAL, power: 100, accuracy: 75 },
  [MOVE_IDS.Ember]: { id: MOVE_IDS.Ember, name: "InkBurn", type: MONSTER_TYPES.FIRE, category: MOVE_CATEGORIES.SPECIAL, power: 40, accuracy: 100 },
  [MOVE_IDS.Explosion]: { id: MOVE_IDS.Explosion, name: "FinalDraft", type: MONSTER_TYPES.NORMAL, category: MOVE_CATEGORIES.PHYSICAL, power: 250, accuracy: 100 },
  [MOVE_IDS.FireBlast]: { id: MOVE_IDS.FireBlast, name: "BlazingBallad", type: MONSTER_TYPES.FIRE, category: MOVE_CATEGORIES.SPECIAL, power: 110, accuracy: 85 },
  [MOVE_IDS.FirePunch]: { id: MOVE_IDS.FirePunch, name: "FyreFist", type: MONSTER_TYPES.FIRE, category: MOVE_CATEGORIES.PHYSICAL, power: 75, accuracy: 100 },
  [MOVE_IDS.FireSpin]: { id: MOVE_IDS.FireSpin, name: "WhirlingVerse", type: MONSTER_TYPES.FIRE, category: MOVE_CATEGORIES.SPECIAL, power: 35, accuracy: 85 },
  [MOVE_IDS.Fissure]: { id: MOVE_IDS.Fissure, name: "GrandGap", type: MONSTER_TYPES.GROUND, category: MOVE_CATEGORIES.PHYSICAL, power: 0, accuracy: 30 },
  [MOVE_IDS.Flamethrower]: { id: MOVE_IDS.Flamethrower, name: "InkTorch", type: MONSTER_TYPES.FIRE, category: MOVE_CATEGORIES.SPECIAL, power: 90, accuracy: 100 },
  [MOVE_IDS.Flash]: { id: MOVE_IDS.Flash, name: "BrightBeam", type: MONSTER_TYPES.NORMAL, category: MOVE_CATEGORIES.STATUS, power: 0, accuracy: 100 },
  [MOVE_IDS.Fly]: { id: MOVE_IDS.Fly, name: "AeroAlpha", type: MONSTER_TYPES.FLYING, category: MOVE_CATEGORIES.PHYSICAL, power: 90, accuracy: 95 },
  [MOVE_IDS.FocusEnergy]: { id: MOVE_IDS.FocusEnergy, name: "DeepDraft", type: MONSTER_TYPES.NORMAL, category: MOVE_CATEGORIES.STATUS, power: 0, accuracy: 100 },
  [MOVE_IDS.FuryAttack]: { id: MOVE_IDS.FuryAttack, name: "RapidRhyme", type: MONSTER_TYPES.NORMAL, category: MOVE_CATEGORIES.PHYSICAL, power: 15, accuracy: 85 },
  [MOVE_IDS.FurySwipes]: { id: MOVE_IDS.FurySwipes, name: "SwiftScript", type: MONSTER_TYPES.NORMAL, category: MOVE_CATEGORIES.PHYSICAL, power: 18, accuracy: 80 },
  [MOVE_IDS.Glare]: { id: MOVE_IDS.Glare, name: "StaringSyllable", type: MONSTER_TYPES.NORMAL, category: MOVE_CATEGORIES.STATUS, power: 0, accuracy: 100 },
  [MOVE_IDS.Growl]: { id: MOVE_IDS.Growl, name: "GrammarGrowl", type: MONSTER_TYPES.NORMAL, category: MOVE_CATEGORIES.STATUS, power: 0, accuracy: 100 },
  [MOVE_IDS.Growth]: { id: MOVE_IDS.Growth, name: "ScaleStory", type: MONSTER_TYPES.NORMAL, category: MOVE_CATEGORIES.STATUS, power: 0, accuracy: 100 },
  [MOVE_IDS.Guillotine]: { id: MOVE_IDS.Guillotine, name: "CutConclusion", type: MONSTER_TYPES.NORMAL, category: MOVE_CATEGORIES.PHYSICAL, power: 0, accuracy: 30 },
  [MOVE_IDS.Gust]: { id: MOVE_IDS.Gust, name: "BreezeBook", type: MONSTER_TYPES.FLYING, category: MOVE_CATEGORIES.SPECIAL, power: 40, accuracy: 100 },
  [MOVE_IDS.Harden]: { id: MOVE_IDS.Harden, name: "BoundCover", type: MONSTER_TYPES.NORMAL, category: MOVE_CATEGORIES.STATUS, power: 0, accuracy: 100 },
  [MOVE_IDS.Haze]: { id: MOVE_IDS.Haze, name: "VagueVerse", type: MONSTER_TYPES.ICE, category: MOVE_CATEGORIES.STATUS, power: 0, accuracy: 100 },
  [MOVE_IDS.Headbutt]: { id: MOVE_IDS.Headbutt, name: "HeavyHeader", type: MONSTER_TYPES.NORMAL, category: MOVE_CATEGORIES.PHYSICAL, power: 70, accuracy: 100 },
  [MOVE_IDS.HighJumpKick]: { id: MOVE_IDS.HighJumpKick, name: "LeapingLetter", type: MONSTER_TYPES.FIGHTING, category: MOVE_CATEGORIES.PHYSICAL, power: 130, accuracy: 90 },
  [MOVE_IDS.HornAttack]: { id: MOVE_IDS.HornAttack, name: "PointyParagraph", type: MONSTER_TYPES.NORMAL, category: MOVE_CATEGORIES.PHYSICAL, power: 65, accuracy: 100 },
  [MOVE_IDS.HornDrill]: { id: MOVE_IDS.HornDrill, name: "PiercePoem", type: MONSTER_TYPES.NORMAL, category: MOVE_CATEGORIES.PHYSICAL, power: 0, accuracy: 30 },
  [MOVE_IDS.HydroPump]: { id: MOVE_IDS.HydroPump, name: "VolumeVortex", type: MONSTER_TYPES.WATER, category: MOVE_CATEGORIES.SPECIAL, power: 110, accuracy: 80 },
  [MOVE_IDS.HyperBeam]: { id: MOVE_IDS.HyperBeam, name: "LaserLexicon", type: MONSTER_TYPES.NORMAL, category: MOVE_CATEGORIES.SPECIAL, power: 150, accuracy: 90 },
  [MOVE_IDS.HyperFang]: { id: MOVE_IDS.HyperFang, name: "GreatGrammar", type: MONSTER_TYPES.NORMAL, category: MOVE_CATEGORIES.PHYSICAL, power: 80, accuracy: 90 },
  [MOVE_IDS.Hypnosis]: { id: MOVE_IDS.Hypnosis, name: "LullabyLyric", type: MONSTER_TYPES.PSYCHIC, category: MOVE_CATEGORIES.STATUS, power: 0, accuracy: 60 },
  [MOVE_IDS.IceBeam]: { id: MOVE_IDS.IceBeam, name: "FrostyFont", type: MONSTER_TYPES.ICE, category: MOVE_CATEGORIES.SPECIAL, power: 90, accuracy: 100 },
  [MOVE_IDS.IcePunch]: { id: MOVE_IDS.IcePunch, name: "ChilledChapter", type: MONSTER_TYPES.ICE, category: MOVE_CATEGORIES.PHYSICAL, power: 75, accuracy: 100 },
  [MOVE_IDS.JumpKick]: { id: MOVE_IDS.JumpKick, name: "KickKoda", type: MONSTER_TYPES.FIGHTING, category: MOVE_CATEGORIES.PHYSICAL, power: 100, accuracy: 95 },
  [MOVE_IDS.KarateChop]: { id: MOVE_IDS.KarateChop, name: "CutterClash", type: MONSTER_TYPES.FIGHTING, category: MOVE_CATEGORIES.PHYSICAL, power: 50, accuracy: 100 },
  [MOVE_IDS.Kinesis]: { id: MOVE_IDS.Kinesis, name: "PsychicPen", type: MONSTER_TYPES.PSYCHIC, category: MOVE_CATEGORIES.STATUS, power: 0, accuracy: 80 },
  [MOVE_IDS.LeechLife]: { id: MOVE_IDS.LeechLife, name: "LifeLine", type: MONSTER_TYPES.BUG, category: MOVE_CATEGORIES.PHYSICAL, power: 80, accuracy: 100 },
  [MOVE_IDS.LeechSeed]: { id: MOVE_IDS.LeechSeed, name: "SeedScript", type: MONSTER_TYPES.GRASS, category: MOVE_CATEGORIES.STATUS, power: 0, accuracy: 90 },
  [MOVE_IDS.Leer]: { id: MOVE_IDS.Leer, name: "LookLeaf", type: MONSTER_TYPES.NORMAL, category: MOVE_CATEGORIES.STATUS, power: 0, accuracy: 100 },
  [MOVE_IDS.Lick]: { id: MOVE_IDS.Lick, name: "TongueType", type: MONSTER_TYPES.GHOST, category: MOVE_CATEGORIES.PHYSICAL, power: 30, accuracy: 100 },
  [MOVE_IDS.LightScreen]: { id: MOVE_IDS.LightScreen, name: "BrightBorder", type: MONSTER_TYPES.PSYCHIC, category: MOVE_CATEGORIES.STATUS, power: 0, accuracy: 100 },
  [MOVE_IDS.LovelyKiss]: { id: MOVE_IDS.LovelyKiss, name: "SweetSonnet", type: MONSTER_TYPES.NORMAL, category: MOVE_CATEGORIES.STATUS, power: 0, accuracy: 75 },
  [MOVE_IDS.LowKick]: { id: MOVE_IDS.LowKick, name: "BaseBounce", type: MONSTER_TYPES.FIGHTING, category: MOVE_CATEGORIES.PHYSICAL, power: 0, accuracy: 100 },
  [MOVE_IDS.Meditate]: { id: MOVE_IDS.Meditate, name: "ZenZine", type: MONSTER_TYPES.PSYCHIC, category: MOVE_CATEGORIES.STATUS, power: 0, accuracy: 100 },
  [MOVE_IDS.MegaDrain]: { id: MOVE_IDS.MegaDrain, name: "GreatGulp", type: MONSTER_TYPES.GRASS, category: MOVE_CATEGORIES.SPECIAL, power: 40, accuracy: 100 },
  [MOVE_IDS.MegaKick]: { id: MOVE_IDS.MegaKick, name: "GrandGesture", type: MONSTER_TYPES.NORMAL, category: MOVE_CATEGORIES.PHYSICAL, power: 120, accuracy: 75 },
  [MOVE_IDS.MegaPunch]: { id: MOVE_IDS.MegaPunch, name: "MajorManuscript", type: MONSTER_TYPES.NORMAL, category: MOVE_CATEGORIES.PHYSICAL, power: 80, accuracy: 85 },
  [MOVE_IDS.Metronome]: { id: MOVE_IDS.Metronome, name: "RandomRhyme", type: MONSTER_TYPES.NORMAL, category: MOVE_CATEGORIES.STATUS, power: 0, accuracy: 100 },
  [MOVE_IDS.Mimic]: { id: MOVE_IDS.Mimic, name: "EchoEdit", type: MONSTER_TYPES.NORMAL, category: MOVE_CATEGORIES.STATUS, power: 0, accuracy: 100 },
  [MOVE_IDS.Minimize]: { id: MOVE_IDS.Minimize, name: "SmallScript", type: MONSTER_TYPES.NORMAL, category: MOVE_CATEGORIES.STATUS, power: 0, accuracy: 100 },
  [MOVE_IDS.MirrorMove]: { id: MOVE_IDS.MirrorMove, name: "CopyCat", type: MONSTER_TYPES.FLYING, category: MOVE_CATEGORIES.STATUS, power: 0, accuracy: 100 },
  [MOVE_IDS.Mist]: { id: MOVE_IDS.Mist, name: "HazyHistory", type: MONSTER_TYPES.ICE, category: MOVE_CATEGORIES.STATUS, power: 0, accuracy: 100 },
  [MOVE_IDS.NightShade]: { id: MOVE_IDS.NightShade, name: "DarkDraft", type: MONSTER_TYPES.GHOST, category: MOVE_CATEGORIES.SPECIAL, power: 0, accuracy: 100 },
  [MOVE_IDS.PayDay]: { id: MOVE_IDS.PayDay, name: "CoinCollection", type: MONSTER_TYPES.NORMAL, category: MOVE_CATEGORIES.PHYSICAL, power: 40, accuracy: 100 },
  [MOVE_IDS.Peck]: { id: MOVE_IDS.Peck, name: "BeakBit", type: MONSTER_TYPES.FLYING, category: MOVE_CATEGORIES.PHYSICAL, power: 35, accuracy: 100 },
  [MOVE_IDS.PetalDance]: { id: MOVE_IDS.PetalDance, name: "FloralFlow", type: MONSTER_TYPES.GRASS, category: MOVE_CATEGORIES.SPECIAL, power: 120, accuracy: 100 },
  [MOVE_IDS.PinMissile]: { id: MOVE_IDS.PinMissile, name: "NeedleNote", type: MONSTER_TYPES.BUG, category: MOVE_CATEGORIES.PHYSICAL, power: 25, accuracy: 95 },
  [MOVE_IDS.PoisonGas]: { id: MOVE_IDS.PoisonGas, name: "ToxicTale", type: MONSTER_TYPES.POISON, category: MOVE_CATEGORIES.STATUS, power: 0, accuracy: 90 },
  [MOVE_IDS.PoisonPowder]: { id: MOVE_IDS.PoisonPowder, name: "VenomVerse", type: MONSTER_TYPES.POISON, category: MOVE_CATEGORIES.STATUS, power: 0, accuracy: 75 },
  [MOVE_IDS.PoisonSting]: { id: MOVE_IDS.PoisonSting, name: "StingerStory", type: MONSTER_TYPES.POISON, category: MOVE_CATEGORIES.PHYSICAL, power: 15, accuracy: 100 },
  [MOVE_IDS.Pound]: { id: MOVE_IDS.Pound, name: "ThumpType", type: MONSTER_TYPES.NORMAL, category: MOVE_CATEGORIES.PHYSICAL, power: 40, accuracy: 100 },
  [MOVE_IDS.Psybeam]: { id: MOVE_IDS.Psybeam, name: "MindManuscript", type: MONSTER_TYPES.PSYCHIC, category: MOVE_CATEGORIES.SPECIAL, power: 65, accuracy: 100 },
  [MOVE_IDS.Psychic]: { id: MOVE_IDS.Psychic, name: "MentalMsg", type: MONSTER_TYPES.PSYCHIC, category: MOVE_CATEGORIES.SPECIAL, power: 90, accuracy: 100 },
  [MOVE_IDS.Psywave]: { id: MOVE_IDS.Psywave, name: "ThoughtWave", type: MONSTER_TYPES.PSYCHIC, category: MOVE_CATEGORIES.SPECIAL, power: 0, accuracy: 100 },
  [MOVE_IDS.QuickAttack]: { id: MOVE_IDS.QuickAttack, name: "AgileAlphabet", type: MONSTER_TYPES.NORMAL, category: MOVE_CATEGORIES.PHYSICAL, power: 40, accuracy: 100 },
  [MOVE_IDS.Rage]: { id: MOVE_IDS.Rage, name: "AngryAuthor", type: MONSTER_TYPES.NORMAL, category: MOVE_CATEGORIES.PHYSICAL, power: 20, accuracy: 100 },
  [MOVE_IDS.RazorLeaf]: { id: MOVE_IDS.RazorLeaf, name: "SharpSheet", type: MONSTER_TYPES.GRASS, category: MOVE_CATEGORIES.PHYSICAL, power: 55, accuracy: 95 },
  [MOVE_IDS.RazorWind]: { id: MOVE_IDS.RazorWind, name: "AiryAria", type: MONSTER_TYPES.NORMAL, category: MOVE_CATEGORIES.SPECIAL, power: 80, accuracy: 100 },
  [MOVE_IDS.Recover]: { id: MOVE_IDS.Recover, name: "ReviseHP", type: MONSTER_TYPES.NORMAL, category: MOVE_CATEGORIES.STATUS, power: 0, accuracy: 100 },
  [MOVE_IDS.Reflect]: { id: MOVE_IDS.Reflect, name: "MirrorManuscript", type: MONSTER_TYPES.PSYCHIC, category: MOVE_CATEGORIES.STATUS, power: 0, accuracy: 100 },
  [MOVE_IDS.Rest]: { id: MOVE_IDS.Rest, name: "PowerNap", type: MONSTER_TYPES.PSYCHIC, category: MOVE_CATEGORIES.STATUS, power: 0, accuracy: 100 },
  [MOVE_IDS.Roar]: { id: MOVE_IDS.Roar, name: "LoudLegend", type: MONSTER_TYPES.NORMAL, category: MOVE_CATEGORIES.STATUS, power: 0, accuracy: 100 },
  [MOVE_IDS.RockSlide]: { id: MOVE_IDS.RockSlide, name: "StonyStory", type: MONSTER_TYPES.ROCK, category: MOVE_CATEGORIES.PHYSICAL, power: 75, accuracy: 90 },
  [MOVE_IDS.RockThrow]: { id: MOVE_IDS.RockThrow, name: "PebblePoem", type: MONSTER_TYPES.ROCK, category: MOVE_CATEGORIES.PHYSICAL, power: 50, accuracy: 90 },
  [MOVE_IDS.RollingKick]: { id: MOVE_IDS.RollingKick, name: "SpinningScript", type: MONSTER_TYPES.FIGHTING, category: MOVE_CATEGORIES.PHYSICAL, power: 60, accuracy: 85 },
  [MOVE_IDS.SandAttack]: { id: MOVE_IDS.SandAttack, name: "GritGrammar", type: MONSTER_TYPES.GROUND, category: MOVE_CATEGORIES.STATUS, power: 0, accuracy: 100 },
  [MOVE_IDS.Scratch]: { id: MOVE_IDS.Scratch, name: "TypoTackle", type: MONSTER_TYPES.NORMAL, category: MOVE_CATEGORIES.PHYSICAL, power: 40, accuracy: 100 },
  [MOVE_IDS.Screech]: { id: MOVE_IDS.Screech, name: "PiercingProse", type: MONSTER_TYPES.NORMAL, category: MOVE_CATEGORIES.STATUS, power: 0, accuracy: 85 },
  [MOVE_IDS.SeismicToss]: { id: MOVE_IDS.SeismicToss, name: "WorldWeight", type: MONSTER_TYPES.FIGHTING, category: MOVE_CATEGORIES.PHYSICAL, power: 0, accuracy: 100 },
  [MOVE_IDS.SelfDestruct]: { id: MOVE_IDS.SelfDestruct, name: "DraftDash", type: MONSTER_TYPES.NORMAL, category: MOVE_CATEGORIES.PHYSICAL, power: 200, accuracy: 100 },
  [MOVE_IDS.Sharpen]: { id: MOVE_IDS.Sharpen, name: "EdgeEdit", type: MONSTER_TYPES.NORMAL, category: MOVE_CATEGORIES.STATUS, power: 0, accuracy: 100 },
  [MOVE_IDS.Sing]: { id: MOVE_IDS.Sing, name: "SongSyllable", type: MONSTER_TYPES.NORMAL, category: MOVE_CATEGORIES.STATUS, power: 0, accuracy: 55 },
  [MOVE_IDS.SkullBash]: { id: MOVE_IDS.SkullBash, name: "HeadHeader", type: MONSTER_TYPES.NORMAL, category: MOVE_CATEGORIES.PHYSICAL, power: 130, accuracy: 100 },
  [MOVE_IDS.SkyAttack]: { id: MOVE_IDS.SkyAttack, name: "HighHistory", type: MONSTER_TYPES.FLYING, category: MOVE_CATEGORIES.PHYSICAL, power: 140, accuracy: 90 },
  [MOVE_IDS.Slam]: { id: MOVE_IDS.Slam, name: "HardHeader", type: MONSTER_TYPES.NORMAL, category: MOVE_CATEGORIES.PHYSICAL, power: 80, accuracy: 75 },
  [MOVE_IDS.Slash]: { id: MOVE_IDS.Slash, name: "SlicingSyllable", type: MONSTER_TYPES.NORMAL, category: MOVE_CATEGORIES.PHYSICAL, power: 70, accuracy: 100 },
  [MOVE_IDS.SleepPowder]: { id: MOVE_IDS.SleepPowder, name: "NoddingNote", type: MONSTER_TYPES.GRASS, category: MOVE_CATEGORIES.STATUS, power: 0, accuracy: 75 },
  [MOVE_IDS.Sludge]: { id: MOVE_IDS.Sludge, name: "InkMuck", type: MONSTER_TYPES.POISON, category: MOVE_CATEGORIES.SPECIAL, power: 65, accuracy: 100 },
  [MOVE_IDS.Smog]: { id: MOVE_IDS.Smog, name: "SmokeStory", type: MONSTER_TYPES.POISON, category: MOVE_CATEGORIES.SPECIAL, power: 30, accuracy: 70 },
  [MOVE_IDS.Smokescreen]: { id: MOVE_IDS.Smokescreen, name: "MistMsg", type: MONSTER_TYPES.NORMAL, category: MOVE_CATEGORIES.STATUS, power: 0, accuracy: 100 },
  [MOVE_IDS.SoftBoiled]: { id: MOVE_IDS.SoftBoiled, name: "GoodGrade", type: MONSTER_TYPES.NORMAL, category: MOVE_CATEGORIES.STATUS, power: 0, accuracy: 100 },
  [MOVE_IDS.SolarBeam]: { id: MOVE_IDS.SolarBeam, name: "SunStory", type: MONSTER_TYPES.GRASS, category: MOVE_CATEGORIES.SPECIAL, power: 120, accuracy: 100 },
  [MOVE_IDS.SonicBoom]: { id: MOVE_IDS.SonicBoom, name: "SoundScript", type: MONSTER_TYPES.NORMAL, category: MOVE_CATEGORIES.SPECIAL, power: 0, accuracy: 90 },
  [MOVE_IDS.SpikeCannon]: { id: MOVE_IDS.SpikeCannon, name: "NeedleNarrative", type: MONSTER_TYPES.NORMAL, category: MOVE_CATEGORIES.PHYSICAL, power: 20, accuracy: 100 },
  [MOVE_IDS.Splash]: { id: MOVE_IDS.Splash, name: "WordWater", type: MONSTER_TYPES.NORMAL, category: MOVE_CATEGORIES.STATUS, power: 0, accuracy: 100 },
  [MOVE_IDS.Spore]: { id: MOVE_IDS.Spore, name: "FungalFont", type: MONSTER_TYPES.GRASS, category: MOVE_CATEGORIES.STATUS, power: 0, accuracy: 100 },
  [MOVE_IDS.Stomp]: { id: MOVE_IDS.Stomp, name: "HeavyHistory", type: MONSTER_TYPES.NORMAL, category: MOVE_CATEGORIES.PHYSICAL, power: 65, accuracy: 100 },
  [MOVE_IDS.Strength]: { id: MOVE_IDS.Strength, name: "MightyManuscript", type: MONSTER_TYPES.NORMAL, category: MOVE_CATEGORIES.PHYSICAL, power: 80, accuracy: 100 },
  [MOVE_IDS.StringShot]: { id: MOVE_IDS.StringShot, name: "WebWord", type: MONSTER_TYPES.BUG, category: MOVE_CATEGORIES.STATUS, power: 0, accuracy: 95 },
  [MOVE_IDS.Struggle]: { id: MOVE_IDS.Struggle, name: "EmptyEssay", type: MONSTER_TYPES.NORMAL, category: MOVE_CATEGORIES.PHYSICAL, power: 50, accuracy: 100 },
  [MOVE_IDS.StunSpore]: { id: MOVE_IDS.StunSpore, name: "StaticStory", type: MONSTER_TYPES.GRASS, category: MOVE_CATEGORIES.STATUS, power: 0, accuracy: 75 },
  [MOVE_IDS.Submission]: { id: MOVE_IDS.Submission, name: "YieldYield", type: MONSTER_TYPES.FIGHTING, category: MOVE_CATEGORIES.PHYSICAL, power: 80, accuracy: 80 },
  [MOVE_IDS.Substitute]: { id: MOVE_IDS.Substitute, name: "StuntScript", type: MONSTER_TYPES.NORMAL, category: MOVE_CATEGORIES.STATUS, power: 0, accuracy: 100 },
  [MOVE_IDS.SuperFang]: { id: MOVE_IDS.SuperFang, name: "GreatGrowl", type: MONSTER_TYPES.NORMAL, category: MOVE_CATEGORIES.PHYSICAL, power: 0, accuracy: 90 },
  [MOVE_IDS.Supersonic]: { id: MOVE_IDS.Supersonic, name: "HighHymn", type: MONSTER_TYPES.NORMAL, category: MOVE_CATEGORIES.STATUS, power: 0, accuracy: 55 },
  [MOVE_IDS.Surf]: { id: MOVE_IDS.Surf, name: "WaveWriter", type: MONSTER_TYPES.WATER, category: MOVE_CATEGORIES.SPECIAL, power: 90, accuracy: 100 },
  [MOVE_IDS.Swift]: { id: MOVE_IDS.Swift, name: "StarScript", type: MONSTER_TYPES.NORMAL, category: MOVE_CATEGORIES.SPECIAL, power: 60, accuracy: 100 },
  [MOVE_IDS.SwordsDance]: { id: MOVE_IDS.SwordsDance, name: "BladeBallad", type: MONSTER_TYPES.NORMAL, category: MOVE_CATEGORIES.STATUS, power: 0, accuracy: 100 },
  [MOVE_IDS.Tackle]: { id: MOVE_IDS.Tackle, name: "TypoTackle", type: MONSTER_TYPES.NORMAL, category: MOVE_CATEGORIES.PHYSICAL, power: 40, accuracy: 100 },
  [MOVE_IDS.TailWhip]: { id: MOVE_IDS.TailWhip, name: "TaleTwist", type: MONSTER_TYPES.NORMAL, category: MOVE_CATEGORIES.STATUS, power: 0, accuracy: 100 },
  [MOVE_IDS.TakeDown]: { id: MOVE_IDS.TakeDown, name: "RoughDraft", type: MONSTER_TYPES.NORMAL, category: MOVE_CATEGORIES.PHYSICAL, power: 90, accuracy: 85 },
  [MOVE_IDS.Teleport]: { id: MOVE_IDS.Teleport, name: "JumpJournal", type: MONSTER_TYPES.PSYCHIC, category: MOVE_CATEGORIES.STATUS, power: 0, accuracy: 100 },
  [MOVE_IDS.Thrash]: { id: MOVE_IDS.Thrash, name: "WildWord", type: MONSTER_TYPES.NORMAL, category: MOVE_CATEGORIES.PHYSICAL, power: 120, accuracy: 100 },
  [MOVE_IDS.Thunder]: { id: MOVE_IDS.Thunder, name: "DataStorm", type: MONSTER_TYPES.ELECTRIC, category: MOVE_CATEGORIES.SPECIAL, power: 110, accuracy: 70 },
  [MOVE_IDS.ThunderPunch]: { id: MOVE_IDS.ThunderPunch, name: "VoltVerse", type: MONSTER_TYPES.ELECTRIC, category: MOVE_CATEGORIES.PHYSICAL, power: 75, accuracy: 100 },
  [MOVE_IDS.ThunderShock]: { id: MOVE_IDS.ThunderShock, name: "DataDolt", type: MONSTER_TYPES.ELECTRIC, category: MOVE_CATEGORIES.SPECIAL, power: 40, accuracy: 100 },
  [MOVE_IDS.ThunderWave]: { id: MOVE_IDS.ThunderWave, name: "SignalScript", type: MONSTER_TYPES.ELECTRIC, category: MOVE_CATEGORIES.STATUS, power: 0, accuracy: 90 },
  [MOVE_IDS.Thunderbolt]: { id: MOVE_IDS.Thunderbolt, name: "DataBolt", type: MONSTER_TYPES.ELECTRIC, category: MOVE_CATEGORIES.SPECIAL, power: 90, accuracy: 100 },
  [MOVE_IDS.Toxic]: { id: MOVE_IDS.Toxic, name: "LethalLiterature", type: MONSTER_TYPES.POISON, category: MOVE_CATEGORIES.STATUS, power: 0, accuracy: 90 },
  [MOVE_IDS.Transform]: { id: MOVE_IDS.Transform, name: "MorphMsg", type: MONSTER_TYPES.NORMAL, category: MOVE_CATEGORIES.STATUS, power: 0, accuracy: 100 },
  [MOVE_IDS.TriAttack]: { id: MOVE_IDS.TriAttack, name: "TripleType", type: MONSTER_TYPES.NORMAL, category: MOVE_CATEGORIES.SPECIAL, power: 80, accuracy: 100 },
  [MOVE_IDS.Twineedle]: { id: MOVE_IDS.Twineedle, name: "DualDraft", type: MONSTER_TYPES.BUG, category: MOVE_CATEGORIES.PHYSICAL, power: 25, accuracy: 100 },
  [MOVE_IDS.VineWhip]: { id: MOVE_IDS.VineWhip, name: "VineVerb", type: MONSTER_TYPES.GRASS, category: MOVE_CATEGORIES.PHYSICAL, power: 45, accuracy: 100 },
  [MOVE_IDS.ViseGrip]: { id: MOVE_IDS.ViseGrip, name: "ClampChapter", type: MONSTER_TYPES.NORMAL, category: MOVE_CATEGORIES.PHYSICAL, power: 55, accuracy: 100 },
  [MOVE_IDS.WaterGun]: { id: MOVE_IDS.WaterGun, name: "InkStream", type: MONSTER_TYPES.WATER, category: MOVE_CATEGORIES.SPECIAL, power: 40, accuracy: 100 },
  [MOVE_IDS.Waterfall]: { id: MOVE_IDS.Waterfall, name: "RiverRun", type: MONSTER_TYPES.WATER, category: MOVE_CATEGORIES.PHYSICAL, power: 80, accuracy: 100 },
  [MOVE_IDS.Whirlwind]: { id: MOVE_IDS.Whirlwind, name: "CycloneCopy", type: MONSTER_TYPES.NORMAL, category: MOVE_CATEGORIES.STATUS, power: 0, accuracy: 100 },
  [MOVE_IDS.WingAttack]: { id: MOVE_IDS.WingAttack, name: "FeatherFont", type: MONSTER_TYPES.FLYING, category: MOVE_CATEGORIES.PHYSICAL, power: 60, accuracy: 100 },
  [MOVE_IDS.Withdraw]: { id: MOVE_IDS.Withdraw, name: "ShellScript", type: MONSTER_TYPES.WATER, category: MOVE_CATEGORIES.STATUS, power: 0, accuracy: 100 },
  [MOVE_IDS.Wrap]: { id: MOVE_IDS.Wrap, name: "BindBook", type: MONSTER_TYPES.NORMAL, category: MOVE_CATEGORIES.PHYSICAL, power: 15, accuracy: 90 },
};


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
  [SPECIES.Grammander]: { types: [MONSTER_TYPES.FIRE], emoji: '🦎', baseHp: 39, baseAtk: 52, baseDef: 43, baseSpa: 60, baseSpd: 50, baseSpe: 65, evolvesAt: 16, evolvesInto: SPECIES.Wordmeleon, learnset: { 1: [MOVE_IDS.Growl, MOVE_IDS.Scratch], 9: [MOVE_IDS.Ember], 15: [MOVE_IDS.Leer], 22: [MOVE_IDS.Rage], 30: [MOVE_IDS.Slash], 38: [MOVE_IDS.Flamethrower], 46: [MOVE_IDS.FireSpin] } },
  [SPECIES.Wordmeleon]: { types: [MONSTER_TYPES.FIRE], emoji: '🦖', baseHp: 58, baseAtk: 64, baseDef: 58, baseSpa: 80, baseSpd: 65, baseSpe: 80, evolvesAt: 36, evolvesInto: SPECIES.Spelchar, learnset: { 1: [MOVE_IDS.Ember, MOVE_IDS.Growl, MOVE_IDS.Scratch], 9: [MOVE_IDS.Ember], 15: [MOVE_IDS.Leer], 24: [MOVE_IDS.Rage], 33: [MOVE_IDS.Slash], 42: [MOVE_IDS.Flamethrower], 56: [MOVE_IDS.FireSpin] } },
  [SPECIES.Spelchar]: { types: [MONSTER_TYPES.FIRE, MONSTER_TYPES.FLYING], emoji: '🐉', baseHp: 78, baseAtk: 84, baseDef: 78, baseSpa: 109, baseSpd: 85, baseSpe: 100, learnset: { 1: [MOVE_IDS.Ember, MOVE_IDS.Growl, MOVE_IDS.Leer, MOVE_IDS.Scratch], 9: [MOVE_IDS.Ember], 15: [MOVE_IDS.Leer], 24: [MOVE_IDS.Rage], 36: [MOVE_IDS.Slash], 46: [MOVE_IDS.Flamethrower], 55: [MOVE_IDS.FireSpin] } },

  [SPECIES.Squirtspell]: { types: [MONSTER_TYPES.WATER], emoji: '🐢', baseHp: 44, baseAtk: 48, baseDef: 65, baseSpa: 50, baseSpd: 64, baseSpe: 43, evolvesAt: 16, evolvesInto: SPECIES.Wartword, learnset: { 1: [MOVE_IDS.Tackle, MOVE_IDS.TailWhip], 8: [MOVE_IDS.Bubble], 15: [MOVE_IDS.WaterGun], 22: [MOVE_IDS.Bite], 28: [MOVE_IDS.Withdraw], 35: [MOVE_IDS.SkullBash], 42: [MOVE_IDS.HydroPump] } },
  [SPECIES.Wartword]: { types: [MONSTER_TYPES.WATER], emoji: '🛡️', baseHp: 59, baseAtk: 63, baseDef: 80, baseSpa: 65, baseSpd: 80, baseSpe: 58, evolvesAt: 36, evolvesInto: SPECIES.Blastlexis, learnset: { 1: [MOVE_IDS.Bubble, MOVE_IDS.Tackle, MOVE_IDS.TailWhip], 8: [MOVE_IDS.Bubble], 15: [MOVE_IDS.WaterGun], 24: [MOVE_IDS.Bite], 31: [MOVE_IDS.Withdraw], 39: [MOVE_IDS.SkullBash], 47: [MOVE_IDS.HydroPump] } },
  [SPECIES.Blastlexis]: { types: [MONSTER_TYPES.WATER], emoji: '🌊', baseHp: 79, baseAtk: 83, baseDef: 100, baseSpa: 85, baseSpd: 105, baseSpe: 78, learnset: { 1: [MOVE_IDS.Bubble, MOVE_IDS.Tackle, MOVE_IDS.TailWhip, MOVE_IDS.WaterGun], 8: [MOVE_IDS.Bubble], 15: [MOVE_IDS.WaterGun], 24: [MOVE_IDS.Bite], 31: [MOVE_IDS.Withdraw], 42: [MOVE_IDS.SkullBash], 52: [MOVE_IDS.HydroPump] } },

  [SPECIES.Bulbaword]: { types: [MONSTER_TYPES.GRASS, MONSTER_TYPES.POISON], emoji: '🍃', baseHp: 45, baseAtk: 49, baseDef: 49, baseSpa: 65, baseSpd: 65, baseSpe: 45, evolvesAt: 16, evolvesInto: SPECIES.Ivysyllable, learnset: { 1: [MOVE_IDS.Growl, MOVE_IDS.Tackle], 7: [MOVE_IDS.LeechSeed], 13: [MOVE_IDS.VineWhip], 20: [MOVE_IDS.PoisonPowder], 27: [MOVE_IDS.RazorLeaf], 34: [MOVE_IDS.Growth], 41: [MOVE_IDS.SleepPowder], 48: [MOVE_IDS.SolarBeam] } },
  [SPECIES.Ivysyllable]: { types: [MONSTER_TYPES.GRASS, MONSTER_TYPES.POISON], emoji: '🌺', baseHp: 60, baseAtk: 62, baseDef: 63, baseSpa: 80, baseSpd: 80, baseSpe: 60, evolvesAt: 32, evolvesInto: SPECIES.Venusterm, learnset: { 1: [MOVE_IDS.Growl, MOVE_IDS.LeechSeed, MOVE_IDS.Tackle], 7: [MOVE_IDS.LeechSeed], 13: [MOVE_IDS.VineWhip], 22: [MOVE_IDS.PoisonPowder], 30: [MOVE_IDS.RazorLeaf], 38: [MOVE_IDS.Growth], 46: [MOVE_IDS.SleepPowder], 54: [MOVE_IDS.SolarBeam] } },
  [SPECIES.Venusterm]: { types: [MONSTER_TYPES.GRASS, MONSTER_TYPES.POISON], emoji: '🌴', baseHp: 80, baseAtk: 82, baseDef: 83, baseSpa: 100, baseSpd: 100, baseSpe: 80, learnset: { 1: [MOVE_IDS.Growl, MOVE_IDS.LeechSeed, MOVE_IDS.Tackle, MOVE_IDS.VineWhip], 7: [MOVE_IDS.LeechSeed], 13: [MOVE_IDS.VineWhip], 22: [MOVE_IDS.PoisonPowder], 30: [MOVE_IDS.RazorLeaf], 43: [MOVE_IDS.Growth], 55: [MOVE_IDS.SleepPowder], 65: [MOVE_IDS.SolarBeam] } },

  [SPECIES.Pikachart]: { types: [MONSTER_TYPES.ELECTRIC], emoji: '🐭', baseHp: 35, baseAtk: 55, baseDef: 40, baseSpa: 50, baseSpd: 50, baseSpe: 90, evolvesAt: 20, evolvesInto: SPECIES.Raichure, learnset: { 1: [MOVE_IDS.Growl, MOVE_IDS.ThunderShock], 9: [MOVE_IDS.ThunderWave], 16: [MOVE_IDS.QuickAttack], 26: [MOVE_IDS.Swift], 33: [MOVE_IDS.Agility], 43: [MOVE_IDS.Thunder] } },
  [SPECIES.Raichure]: { types: [MONSTER_TYPES.ELECTRIC], emoji: '⚡', baseHp: 60, baseAtk: 90, baseDef: 55, baseSpa: 90, baseSpd: 80, baseSpe: 110, learnset: { 1: [MOVE_IDS.Growl, MOVE_IDS.ThunderShock, MOVE_IDS.ThunderWave] } },

  // Wild Mons & Evolutions
  [SPECIES.Caterspell]: { types: [MONSTER_TYPES.BUG], emoji: '🐛', baseHp: 45, baseAtk: 30, baseDef: 35, baseSpa: 20, baseSpd: 20, baseSpe: 45, evolvesAt: 7, evolvesInto: SPECIES.Metaphrase, learnset: { 1: [MOVE_IDS.StringShot, MOVE_IDS.Tackle] } },
  [SPECIES.Metaphrase]: { types: [MONSTER_TYPES.BUG], emoji: '📦', baseHp: 50, baseAtk: 20, baseDef: 55, baseSpa: 25, baseSpd: 25, baseSpe: 30, evolvesAt: 10, evolvesInto: SPECIES.Butterfluent, learnset: { 1: [MOVE_IDS.Harden] } },
  [SPECIES.Butterfluent]: { types: [MONSTER_TYPES.BUG, MONSTER_TYPES.FLYING], emoji: '🦋', baseHp: 60, baseAtk: 45, baseDef: 50, baseSpa: 90, baseSpd: 80, baseSpe: 70, learnset: { 1: [MOVE_IDS.Confusion], 12: [MOVE_IDS.Confusion], 15: [MOVE_IDS.PoisonPowder], 16: [MOVE_IDS.StunSpore], 17: [MOVE_IDS.SleepPowder], 21: [MOVE_IDS.Supersonic], 26: [MOVE_IDS.Whirlwind], 32: [MOVE_IDS.Psybeam] } },

  [SPECIES.Weedword]: { types: [MONSTER_TYPES.BUG, MONSTER_TYPES.POISON], emoji: '🐛', baseHp: 40, baseAtk: 35, baseDef: 30, baseSpa: 20, baseSpd: 20, baseSpe: 50, evolvesAt: 7, evolvesInto: SPECIES.Verbakuna, learnset: { 1: [MOVE_IDS.PoisonSting, MOVE_IDS.StringShot] } },
  [SPECIES.Verbakuna]: { types: [MONSTER_TYPES.BUG, MONSTER_TYPES.POISON], emoji: '🍯', baseHp: 45, baseAtk: 25, baseDef: 50, baseSpa: 25, baseSpd: 25, baseSpe: 35, evolvesAt: 10, evolvesInto: SPECIES.Beedictionary, learnset: { 1: [MOVE_IDS.Harden] } },
  [SPECIES.Beedictionary]: { types: [MONSTER_TYPES.BUG, MONSTER_TYPES.POISON], emoji: '🐝', baseHp: 65, baseAtk: 90, baseDef: 40, baseSpa: 45, baseSpd: 80, baseSpe: 75, learnset: { 1: [MOVE_IDS.FuryAttack], 12: [MOVE_IDS.FuryAttack], 16: [MOVE_IDS.FocusEnergy], 20: [MOVE_IDS.Twineedle], 25: [MOVE_IDS.Rage], 30: [MOVE_IDS.PinMissile], 35: [MOVE_IDS.Agility] } },

  [SPECIES.Aviprosa]: { types: [MONSTER_TYPES.NORMAL, MONSTER_TYPES.FLYING], emoji: '🐦', baseHp: 40, baseAtk: 45, baseDef: 40, baseSpa: 35, baseSpd: 35, baseSpe: 56, evolvesAt: 18, evolvesInto: SPECIES.Syntaxo, learnset: { 1: [MOVE_IDS.Gust], 5: [MOVE_IDS.SandAttack], 12: [MOVE_IDS.QuickAttack], 19: [MOVE_IDS.Whirlwind], 28: [MOVE_IDS.WingAttack], 36: [MOVE_IDS.Agility], 44: [MOVE_IDS.MirrorMove] } },
  [SPECIES.Syntaxo]: { types: [MONSTER_TYPES.NORMAL, MONSTER_TYPES.FLYING], emoji: '🦅', baseHp: 63, baseAtk: 60, baseDef: 55, baseSpa: 50, baseSpd: 50, baseSpe: 71, evolvesAt: 36, evolvesInto: SPECIES.Vocalis, learnset: { 1: [MOVE_IDS.Gust, MOVE_IDS.SandAttack], 5: [MOVE_IDS.SandAttack], 12: [MOVE_IDS.QuickAttack], 21: [MOVE_IDS.Whirlwind], 31: [MOVE_IDS.WingAttack], 40: [MOVE_IDS.Agility], 49: [MOVE_IDS.MirrorMove] } },
  [SPECIES.Vocalis]: { types: [MONSTER_TYPES.NORMAL, MONSTER_TYPES.FLYING], emoji: '👑', baseHp: 83, baseAtk: 80, baseDef: 75, baseSpa: 70, baseSpd: 70, baseSpe: 91, learnset: { 1: [MOVE_IDS.Gust, MOVE_IDS.QuickAttack, MOVE_IDS.SandAttack], 5: [MOVE_IDS.SandAttack], 12: [MOVE_IDS.QuickAttack], 21: [MOVE_IDS.Whirlwind], 31: [MOVE_IDS.WingAttack], 44: [MOVE_IDS.Agility], 54: [MOVE_IDS.MirrorMove] } },

  [SPECIES.Verminverb]: { types: [MONSTER_TYPES.NORMAL], emoji: '🐀', baseHp: 30, baseAtk: 56, baseDef: 35, baseSpa: 25, baseSpd: 35, baseSpe: 72, evolvesAt: 20, evolvesInto: SPECIES.Lexicat, learnset: { 1: [MOVE_IDS.Tackle, MOVE_IDS.TailWhip], 7: [MOVE_IDS.QuickAttack], 14: [MOVE_IDS.HyperFang], 23: [MOVE_IDS.FocusEnergy], 34: [MOVE_IDS.SuperFang] } },
  [SPECIES.Lexicat]: { types: [MONSTER_TYPES.NORMAL], emoji: '🐀', baseHp: 55, baseAtk: 81, baseDef: 60, baseSpa: 50, baseSpd: 70, baseSpe: 97, learnset: { 1: [MOVE_IDS.QuickAttack, MOVE_IDS.Tackle, MOVE_IDS.TailWhip], 7: [MOVE_IDS.QuickAttack], 14: [MOVE_IDS.HyperFang], 27: [MOVE_IDS.FocusEnergy], 41: [MOVE_IDS.SuperFang] } },

  [SPECIES.Penpigeon]: { types: [MONSTER_TYPES.NORMAL, MONSTER_TYPES.FLYING], emoji: '🐦', baseHp: 40, baseAtk: 60, baseDef: 30, baseSpa: 31, baseSpd: 31, baseSpe: 70, evolvesAt: 20, evolvesInto: SPECIES.Foliofalcon, learnset: { 1: [MOVE_IDS.Growl, MOVE_IDS.Peck], 9: [MOVE_IDS.Leer], 15: [MOVE_IDS.FuryAttack], 22: [MOVE_IDS.MirrorMove], 29: [MOVE_IDS.DrillPeck], 36: [MOVE_IDS.Agility] } },
  [SPECIES.Foliofalcon]: { types: [MONSTER_TYPES.NORMAL, MONSTER_TYPES.FLYING], emoji: '🦅', baseHp: 65, baseAtk: 90, baseDef: 65, baseSpa: 61, baseSpd: 61, baseSpe: 100, learnset: { 1: [MOVE_IDS.Growl, MOVE_IDS.Leer, MOVE_IDS.Peck], 9: [MOVE_IDS.Leer], 15: [MOVE_IDS.FuryAttack], 25: [MOVE_IDS.MirrorMove], 34: [MOVE_IDS.DrillPeck], 43: [MOVE_IDS.Agility] } },

  [SPECIES.Slinkscript]: { types: [MONSTER_TYPES.POISON], emoji: '🐍', baseHp: 35, baseAtk: 60, baseDef: 44, baseSpa: 40, baseSpd: 54, baseSpe: 55, evolvesAt: 22, evolvesInto: SPECIES.Vipervocab, learnset: { 1: [MOVE_IDS.Leer, MOVE_IDS.Wrap], 10: [MOVE_IDS.PoisonSting], 17: [MOVE_IDS.Bite], 24: [MOVE_IDS.Glare], 31: [MOVE_IDS.Screech], 38: [MOVE_IDS.Acid] } },
  [SPECIES.Vipervocab]: { types: [MONSTER_TYPES.POISON], emoji: '🐍', baseHp: 60, baseAtk: 85, baseDef: 69, baseSpa: 65, baseSpd: 79, baseSpe: 80, learnset: { 1: [MOVE_IDS.Leer, MOVE_IDS.PoisonSting, MOVE_IDS.Wrap], 10: [MOVE_IDS.PoisonSting], 17: [MOVE_IDS.Bite], 27: [MOVE_IDS.Glare], 36: [MOVE_IDS.Screech], 47: [MOVE_IDS.Acid] } },

  [SPECIES.Burrowbook]: { types: [MONSTER_TYPES.GROUND], emoji: '🦔', baseHp: 50, baseAtk: 75, baseDef: 85, baseSpa: 20, baseSpd: 30, baseSpe: 40, evolvesAt: 22, evolvesInto: SPECIES.Quillquote, learnset: { 1: [MOVE_IDS.Scratch], 10: [MOVE_IDS.SandAttack], 17: [MOVE_IDS.Slash], 24: [MOVE_IDS.PoisonSting], 31: [MOVE_IDS.Swift], 38: [MOVE_IDS.FurySwipes] } },
  [SPECIES.Quillquote]: { types: [MONSTER_TYPES.GROUND], emoji: '🦔', baseHp: 75, baseAtk: 100, baseDef: 110, baseSpa: 45, baseSpd: 55, baseSpe: 65, learnset: { 1: [MOVE_IDS.SandAttack, MOVE_IDS.Scratch], 10: [MOVE_IDS.SandAttack], 17: [MOVE_IDS.Slash], 27: [MOVE_IDS.PoisonSting], 36: [MOVE_IDS.Swift], 47: [MOVE_IDS.FurySwipes] } },

  [SPECIES.Pointernote]: { types: [MONSTER_TYPES.POISON], emoji: '🦂', baseHp: 46, baseAtk: 57, baseDef: 40, baseSpa: 40, baseSpd: 40, baseSpe: 50, evolvesAt: 16, evolvesInto: SPECIES.Venomverse, learnset: { 1: [MOVE_IDS.Growl, MOVE_IDS.Tackle], 8: [MOVE_IDS.Scratch], 14: [MOVE_IDS.PoisonSting], 21: [MOVE_IDS.TailWhip], 29: [MOVE_IDS.Bite], 36: [MOVE_IDS.FurySwipes], 43: [MOVE_IDS.DoubleKick] } },
  [SPECIES.Venomverse]: { types: [MONSTER_TYPES.POISON], emoji: '🦂', baseHp: 61, baseAtk: 72, baseDef: 57, baseSpa: 55, baseSpd: 55, baseSpe: 65, evolvesAt: 36, evolvesInto: SPECIES.Toxiterm, learnset: { 1: [MOVE_IDS.Growl, MOVE_IDS.Scratch, MOVE_IDS.Tackle], 8: [MOVE_IDS.Scratch], 14: [MOVE_IDS.PoisonSting], 23: [MOVE_IDS.TailWhip], 32: [MOVE_IDS.Bite], 41: [MOVE_IDS.FurySwipes], 50: [MOVE_IDS.DoubleKick] } },
  [SPECIES.Toxiterm]: { types: [MONSTER_TYPES.POISON], emoji: '👑', baseHp: 81, baseAtk: 92, baseDef: 77, baseSpa: 85, baseSpd: 75, baseSpe: 85, learnset: { 1: [MOVE_IDS.BodySlam, MOVE_IDS.Scratch, MOVE_IDS.Tackle, MOVE_IDS.TailWhip], 8: [MOVE_IDS.Scratch], 14: [MOVE_IDS.PoisonSting], 23: [MOVE_IDS.BodySlam] } },

  [SPECIES.Clausefairy]: { types: [MONSTER_TYPES.NORMAL], emoji: '🧚', baseHp: 70, baseAtk: 45, baseDef: 48, baseSpa: 60, baseSpd: 65, baseSpe: 35, evolvesAt: 25, evolvesInto: SPECIES.Citable, learnset: { 1: [MOVE_IDS.Growl, MOVE_IDS.Pound], 13: [MOVE_IDS.Sing], 18: [MOVE_IDS.DoubleSlap], 24: [MOVE_IDS.Minimize], 31: [MOVE_IDS.Metronome], 39: [MOVE_IDS.DefenseCurl], 48: [MOVE_IDS.LightScreen] } },
  [SPECIES.Citable]: { types: [MONSTER_TYPES.NORMAL], emoji: '🧚', baseHp: 95, baseAtk: 70, baseDef: 73, baseSpa: 85, baseSpd: 90, baseSpe: 60, learnset: { 1: [MOVE_IDS.DoubleSlap, MOVE_IDS.Metronome, MOVE_IDS.Minimize, MOVE_IDS.Sing] } },

  [SPECIES.Foxphrase]: { types: [MONSTER_TYPES.FIRE], emoji: '🦊', baseHp: 38, baseAtk: 41, baseDef: 40, baseSpa: 50, baseSpd: 65, baseSpe: 65, evolvesAt: 25, evolvesInto: SPECIES.Fablefire, learnset: { 1: [MOVE_IDS.Ember, MOVE_IDS.TailWhip], 16: [MOVE_IDS.QuickAttack], 21: [MOVE_IDS.Roar], 28: [MOVE_IDS.ConfuseRay], 35: [MOVE_IDS.Flamethrower], 42: [MOVE_IDS.FireSpin] } },
  [SPECIES.Fablefire]: { types: [MONSTER_TYPES.FIRE], emoji: '🦊', baseHp: 73, baseAtk: 76, baseDef: 75, baseSpa: 81, baseSpd: 100, baseSpe: 100, learnset: { 1: [MOVE_IDS.Ember, MOVE_IDS.QuickAttack, MOVE_IDS.Roar, MOVE_IDS.TailWhip] } },

  [SPECIES.Puffpoet]: { types: [MONSTER_TYPES.NORMAL], emoji: '🎈', baseHp: 115, baseAtk: 45, baseDef: 20, baseSpa: 45, baseSpd: 25, baseSpe: 20, evolvesAt: 25, evolvesInto: SPECIES.Balloonbard, learnset: { 1: [MOVE_IDS.Sing], 9: [MOVE_IDS.Pound], 14: [MOVE_IDS.Disable], 19: [MOVE_IDS.DefenseCurl], 24: [MOVE_IDS.DoubleSlap], 29: [MOVE_IDS.Rest], 34: [MOVE_IDS.BodySlam], 39: [MOVE_IDS.DoubleEdge] } },
  [SPECIES.Balloonbard]: { types: [MONSTER_TYPES.NORMAL], emoji: '🎈', baseHp: 140, baseAtk: 70, baseDef: 45, baseSpa: 75, baseSpd: 50, baseSpe: 45, learnset: { 1: [MOVE_IDS.DefenseCurl, MOVE_IDS.Disable, MOVE_IDS.DoubleSlap, MOVE_IDS.Sing] } },

  [SPECIES.Wingword]: { types: [MONSTER_TYPES.POISON, MONSTER_TYPES.FLYING], emoji: '🦇', baseHp: 40, baseAtk: 45, baseDef: 35, baseSpa: 30, baseSpd: 40, baseSpe: 55, evolvesAt: 22, evolvesInto: SPECIES.Echoedit, learnset: { 1: [MOVE_IDS.LeechLife], 10: [MOVE_IDS.Supersonic], 15: [MOVE_IDS.Bite], 21: [MOVE_IDS.ConfuseRay], 28: [MOVE_IDS.WingAttack], 36: [MOVE_IDS.Haze] } },
  [SPECIES.Echoedit]: { types: [MONSTER_TYPES.POISON, MONSTER_TYPES.FLYING], emoji: '🦇', baseHp: 75, baseAtk: 80, baseDef: 70, baseSpa: 65, baseSpd: 75, baseSpe: 90, learnset: { 1: [MOVE_IDS.Bite, MOVE_IDS.LeechLife, MOVE_IDS.Screech], 10: [MOVE_IDS.Supersonic], 15: [MOVE_IDS.Bite], 21: [MOVE_IDS.ConfuseRay], 32: [MOVE_IDS.WingAttack], 43: [MOVE_IDS.Haze] } },

  [SPECIES.Odeish]: { types: [MONSTER_TYPES.GRASS, MONSTER_TYPES.POISON], emoji: '🌱', baseHp: 45, baseAtk: 50, baseDef: 55, baseSpa: 75, baseSpd: 65, baseSpe: 30, evolvesAt: 21, evolvesInto: SPECIES.Grammgloom, learnset: { 1: [MOVE_IDS.Absorb], 15: [MOVE_IDS.PoisonPowder], 17: [MOVE_IDS.StunSpore], 19: [MOVE_IDS.SleepPowder], 24: [MOVE_IDS.Acid], 33: [MOVE_IDS.PetalDance], 46: [MOVE_IDS.SolarBeam] } },
  [SPECIES.Grammgloom]: { types: [MONSTER_TYPES.GRASS, MONSTER_TYPES.POISON], emoji: '🤢', baseHp: 60, baseAtk: 65, baseDef: 70, baseSpa: 85, baseSpd: 75, baseSpe: 40, evolvesAt: 32, evolvesInto: SPECIES.Vocabplume, learnset: { 1: [MOVE_IDS.Absorb, MOVE_IDS.PoisonPowder, MOVE_IDS.StunSpore], 15: [MOVE_IDS.PoisonPowder], 17: [MOVE_IDS.StunSpore], 19: [MOVE_IDS.SleepPowder], 28: [MOVE_IDS.Acid], 38: [MOVE_IDS.PetalDance], 52: [MOVE_IDS.SolarBeam] } },
  [SPECIES.Vocabplume]: { types: [MONSTER_TYPES.GRASS, MONSTER_TYPES.POISON], emoji: '🌸', baseHp: 75, baseAtk: 80, baseDef: 85, baseSpa: 100, baseSpd: 90, baseSpe: 50, learnset: { 1: [MOVE_IDS.Acid, MOVE_IDS.PetalDance, MOVE_IDS.SleepPowder, MOVE_IDS.StunSpore], 15: [MOVE_IDS.PoisonPowder], 17: [MOVE_IDS.StunSpore], 19: [MOVE_IDS.SleepPowder] } },

  [SPECIES.Phraseling]: { types: [MONSTER_TYPES.BUG, MONSTER_TYPES.GRASS], emoji: '🍄', baseHp: 35, baseAtk: 70, baseDef: 55, baseSpa: 45, baseSpd: 55, baseSpe: 25, evolvesAt: 24, evolvesInto: SPECIES.Paragraphid, learnset: { 1: [MOVE_IDS.Scratch], 13: [MOVE_IDS.StunSpore], 20: [MOVE_IDS.LeechLife], 27: [MOVE_IDS.Spore], 34: [MOVE_IDS.Slash], 41: [MOVE_IDS.Growth] } },
  [SPECIES.Paragraphid]: { types: [MONSTER_TYPES.BUG, MONSTER_TYPES.GRASS], emoji: '🍄', baseHp: 60, baseAtk: 95, baseDef: 80, baseSpa: 60, baseSpd: 80, baseSpe: 30, learnset: { 1: [MOVE_IDS.LeechLife, MOVE_IDS.Scratch, MOVE_IDS.StunSpore], 13: [MOVE_IDS.StunSpore], 20: [MOVE_IDS.LeechLife], 30: [MOVE_IDS.Spore], 39: [MOVE_IDS.Slash], 48: [MOVE_IDS.Growth] } },

  [SPECIES.Voicenat]: { types: [MONSTER_TYPES.BUG, MONSTER_TYPES.POISON], emoji: '🕷️', baseHp: 60, baseAtk: 55, baseDef: 50, baseSpa: 40, baseSpd: 55, baseSpe: 45, evolvesAt: 31, evolvesInto: SPECIES.Vowelmoth, learnset: { 1: [MOVE_IDS.Disable, MOVE_IDS.Tackle], 24: [MOVE_IDS.PoisonPowder], 27: [MOVE_IDS.LeechLife], 30: [MOVE_IDS.StunSpore], 35: [MOVE_IDS.Psybeam], 38: [MOVE_IDS.SleepPowder], 43: [MOVE_IDS.Psychic] } },
  [SPECIES.Vowelmoth]: { types: [MONSTER_TYPES.BUG, MONSTER_TYPES.POISON], emoji: '🦋', baseHp: 70, baseAtk: 65, baseDef: 60, baseSpa: 90, baseSpd: 75, baseSpe: 90, learnset: { 1: [MOVE_IDS.Disable, MOVE_IDS.LeechLife, MOVE_IDS.PoisonPowder, MOVE_IDS.Tackle], 24: [MOVE_IDS.PoisonPowder], 27: [MOVE_IDS.LeechLife], 30: [MOVE_IDS.StunSpore], 38: [MOVE_IDS.Psybeam], 43: [MOVE_IDS.SleepPowder], 50: [MOVE_IDS.Psychic] } },

  [SPECIES.Dictatone]: { types: [MONSTER_TYPES.GROUND], emoji: '⛰️', baseHp: 10, baseAtk: 55, baseDef: 25, baseSpa: 35, baseSpd: 45, baseSpe: 95, evolvesAt: 26, evolvesInto: SPECIES.Dialogrio, learnset: { 1: [MOVE_IDS.Scratch], 15: [MOVE_IDS.Growl], 19: [MOVE_IDS.Dig], 24: [MOVE_IDS.SandAttack], 31: [MOVE_IDS.Slash], 40: [MOVE_IDS.Earthquake] } },
  [SPECIES.Dialogrio]: { types: [MONSTER_TYPES.GROUND], emoji: '⛰️', baseHp: 35, baseAtk: 80, baseDef: 50, baseSpa: 50, baseSpd: 70, baseSpe: 120, learnset: { 1: [MOVE_IDS.Dig, MOVE_IDS.Growl, MOVE_IDS.Scratch], 15: [MOVE_IDS.Growl], 19: [MOVE_IDS.Dig], 24: [MOVE_IDS.SandAttack], 35: [MOVE_IDS.Slash], 47: [MOVE_IDS.Earthquake] } },

  [SPECIES.Memocat]: { types: [MONSTER_TYPES.NORMAL], emoji: '🐱', baseHp: 40, baseAtk: 45, baseDef: 35, baseSpa: 40, baseSpd: 40, baseSpe: 90, evolvesAt: 28, evolvesInto: SPECIES.Poetcat, learnset: { 1: [MOVE_IDS.Growl, MOVE_IDS.Scratch], 12: [MOVE_IDS.Bite], 17: [MOVE_IDS.PayDay], 24: [MOVE_IDS.Screech], 33: [MOVE_IDS.FurySwipes], 44: [MOVE_IDS.Slash] } },
  [SPECIES.Poetcat]: { types: [MONSTER_TYPES.NORMAL], emoji: '🐱', baseHp: 65, baseAtk: 70, baseDef: 60, baseSpa: 65, baseSpd: 65, baseSpe: 115, learnset: { 1: [MOVE_IDS.Bite, MOVE_IDS.Growl, MOVE_IDS.Scratch, MOVE_IDS.Screech], 12: [MOVE_IDS.Bite], 17: [MOVE_IDS.PayDay], 24: [MOVE_IDS.Screech], 37: [MOVE_IDS.FurySwipes], 51: [MOVE_IDS.Slash] } },

  [SPECIES.Punderduck]: { types: [MONSTER_TYPES.WATER], emoji: '🦆', baseHp: 50, baseAtk: 52, baseDef: 48, baseSpa: 64, baseSpd: 50, baseSpe: 55, evolvesAt: 33, evolvesInto: SPECIES.Quackquote, learnset: { 1: [MOVE_IDS.Scratch], 28: [MOVE_IDS.TailWhip], 31: [MOVE_IDS.Disable], 36: [MOVE_IDS.Confusion], 43: [MOVE_IDS.FurySwipes], 52: [MOVE_IDS.HydroPump] } },
  [SPECIES.Quackquote]: { types: [MONSTER_TYPES.WATER], emoji: '🦆', baseHp: 80, baseAtk: 82, baseDef: 78, baseSpa: 95, baseSpd: 80, baseSpe: 85, learnset: { 1: [MOVE_IDS.Disable, MOVE_IDS.Scratch, MOVE_IDS.TailWhip], 28: [MOVE_IDS.TailWhip], 31: [MOVE_IDS.Disable], 39: [MOVE_IDS.Confusion], 48: [MOVE_IDS.FurySwipes], 59: [MOVE_IDS.HydroPump] } },

  [SPECIES.Primath]: { types: [MONSTER_TYPES.FIGHTING], emoji: '🐒', baseHp: 40, baseAtk: 80, baseDef: 35, baseSpa: 35, baseSpd: 45, baseSpe: 70, evolvesAt: 28, evolvesInto: SPECIES.Gorillagram, learnset: { 1: [MOVE_IDS.Leer, MOVE_IDS.Scratch], 15: [MOVE_IDS.KarateChop], 21: [MOVE_IDS.FurySwipes], 27: [MOVE_IDS.FocusEnergy], 33: [MOVE_IDS.SeismicToss], 39: [MOVE_IDS.Thrash] } },
  [SPECIES.Gorillagram]: { types: [MONSTER_TYPES.FIGHTING], emoji: '🐒', baseHp: 65, baseAtk: 105, baseDef: 60, baseSpa: 60, baseSpd: 70, baseSpe: 95, learnset: { 1: [MOVE_IDS.FurySwipes, MOVE_IDS.KarateChop, MOVE_IDS.Leer, MOVE_IDS.Scratch], 15: [MOVE_IDS.KarateChop], 21: [MOVE_IDS.FurySwipes], 27: [MOVE_IDS.FocusEnergy], 37: [MOVE_IDS.SeismicToss], 46: [MOVE_IDS.Thrash] } },

  [SPECIES.Barkbook]: { types: [MONSTER_TYPES.FIRE], emoji: '🐶', baseHp: 55, baseAtk: 70, baseDef: 45, baseSpa: 70, baseSpd: 50, baseSpe: 60, evolvesAt: 30, evolvesInto: SPECIES.Houndhaiku, learnset: { 1: [MOVE_IDS.Bite, MOVE_IDS.Roar], 18: [MOVE_IDS.Ember], 23: [MOVE_IDS.Leer], 30: [MOVE_IDS.TakeDown], 39: [MOVE_IDS.Agility], 50: [MOVE_IDS.Flamethrower] } },
  [SPECIES.Houndhaiku]: { types: [MONSTER_TYPES.FIRE], emoji: '🐕', baseHp: 90, baseAtk: 110, baseDef: 80, baseSpa: 100, baseSpd: 80, baseSpe: 95, learnset: { 1: [MOVE_IDS.Ember, MOVE_IDS.Leer, MOVE_IDS.Roar, MOVE_IDS.TakeDown] } },

  [SPECIES.Printwag]: { types: [MONSTER_TYPES.WATER], emoji: '🌀', baseHp: 40, baseAtk: 50, baseDef: 40, baseSpa: 40, baseSpd: 40, baseSpe: 90, evolvesAt: 25, evolvesInto: SPECIES.Pagewhirl, learnset: { 1: [MOVE_IDS.Bubble], 16: [MOVE_IDS.Hypnosis], 19: [MOVE_IDS.WaterGun], 25: [MOVE_IDS.DoubleSlap], 31: [MOVE_IDS.BodySlam], 38: [MOVE_IDS.Amnesia], 45: [MOVE_IDS.HydroPump] } },
  [SPECIES.Pagewhirl]: { types: [MONSTER_TYPES.WATER], emoji: '🌀', baseHp: 65, baseAtk: 65, baseDef: 65, baseSpa: 50, baseSpd: 50, baseSpe: 90, evolvesAt: 36, evolvesInto: SPECIES.Paperwrath, learnset: { 1: [MOVE_IDS.Bubble, MOVE_IDS.Hypnosis, MOVE_IDS.WaterGun], 16: [MOVE_IDS.Hypnosis], 19: [MOVE_IDS.WaterGun], 26: [MOVE_IDS.DoubleSlap], 33: [MOVE_IDS.BodySlam], 41: [MOVE_IDS.Amnesia], 49: [MOVE_IDS.HydroPump] } },
  [SPECIES.Paperwrath]: { types: [MONSTER_TYPES.WATER, MONSTER_TYPES.FIGHTING], emoji: '🐸', baseHp: 90, baseAtk: 95, baseDef: 95, baseSpa: 70, baseSpd: 90, baseSpe: 70, learnset: { 1: [MOVE_IDS.BodySlam, MOVE_IDS.DoubleSlap, MOVE_IDS.Hypnosis, MOVE_IDS.WaterGun], 16: [MOVE_IDS.Hypnosis], 19: [MOVE_IDS.WaterGun] } },

  [SPECIES.Abstra]: { types: [MONSTER_TYPES.PSYCHIC], emoji: '🧠', baseHp: 25, baseAtk: 20, baseDef: 15, baseSpa: 105, baseSpd: 55, baseSpe: 90, evolvesAt: 16, evolvesInto: SPECIES.Keydabra, learnset: { 1: [MOVE_IDS.Teleport] } },
  [SPECIES.Keydabra]: { types: [MONSTER_TYPES.PSYCHIC], emoji: '🧠', baseHp: 40, baseAtk: 35, baseDef: 30, baseSpa: 120, baseSpd: 70, baseSpe: 105, evolvesAt: 36, evolvesInto: SPECIES.Archizam, learnset: { 1: [MOVE_IDS.Confusion, MOVE_IDS.Disable, MOVE_IDS.Teleport], 16: [MOVE_IDS.Confusion], 20: [MOVE_IDS.Disable], 27: [MOVE_IDS.Psybeam], 31: [MOVE_IDS.Recover], 38: [MOVE_IDS.Psychic], 42: [MOVE_IDS.Reflect] } },
  [SPECIES.Archizam]: { types: [MONSTER_TYPES.PSYCHIC], emoji: '🧠', baseHp: 55, baseAtk: 50, baseDef: 45, baseSpa: 135, baseSpd: 95, baseSpe: 120, learnset: { 1: [MOVE_IDS.Confusion, MOVE_IDS.Disable, MOVE_IDS.Teleport], 16: [MOVE_IDS.Confusion], 20: [MOVE_IDS.Disable], 27: [MOVE_IDS.Psybeam], 31: [MOVE_IDS.Recover], 38: [MOVE_IDS.Psychic], 42: [MOVE_IDS.Reflect] } },

  [SPECIES.Chopscript]: { types: [MONSTER_TYPES.FIGHTING], emoji: '💪', baseHp: 70, baseAtk: 80, baseDef: 50, baseSpa: 35, baseSpd: 35, baseSpe: 35, evolvesAt: 28, evolvesInto: SPECIES.Chokemessage, learnset: { 1: [MOVE_IDS.KarateChop], 20: [MOVE_IDS.LowKick], 25: [MOVE_IDS.Leer], 32: [MOVE_IDS.FocusEnergy], 39: [MOVE_IDS.SeismicToss], 46: [MOVE_IDS.Submission] } },
  [SPECIES.Chokemessage]: { types: [MONSTER_TYPES.FIGHTING], emoji: '💪', baseHp: 80, baseAtk: 100, baseDef: 70, baseSpa: 50, baseSpd: 60, baseSpe: 45, evolvesAt: 36, evolvesInto: SPECIES.Champmanual, learnset: { 1: [MOVE_IDS.KarateChop, MOVE_IDS.Leer, MOVE_IDS.LowKick], 20: [MOVE_IDS.LowKick], 25: [MOVE_IDS.Leer], 36: [MOVE_IDS.FocusEnergy], 44: [MOVE_IDS.SeismicToss], 52: [MOVE_IDS.Submission] } },
  [SPECIES.Champmanual]: { types: [MONSTER_TYPES.FIGHTING], emoji: '💪', baseHp: 90, baseAtk: 130, baseDef: 80, baseSpa: 65, baseSpd: 85, baseSpe: 55, learnset: { 1: [MOVE_IDS.KarateChop, MOVE_IDS.Leer, MOVE_IDS.LowKick], 20: [MOVE_IDS.LowKick], 25: [MOVE_IDS.Leer], 36: [MOVE_IDS.FocusEnergy], 44: [MOVE_IDS.SeismicToss], 52: [MOVE_IDS.Submission] } },

  [SPECIES.Rudeo]: { types: [MONSTER_TYPES.ROCK, MONSTER_TYPES.GROUND], emoji: '🪨', baseHp: 40, baseAtk: 80, baseDef: 100, baseSpa: 30, baseSpd: 30, baseSpe: 20, evolvesAt: 25, evolvesInto: SPECIES.Glossler, learnset: { 1: [MOVE_IDS.Tackle], 11: [MOVE_IDS.DefenseCurl], 16: [MOVE_IDS.RockThrow], 21: [MOVE_IDS.SelfDestruct], 26: [MOVE_IDS.Harden], 31: [MOVE_IDS.Earthquake], 36: [MOVE_IDS.Explosion] } },
  [SPECIES.Glossler]: { types: [MONSTER_TYPES.ROCK, MONSTER_TYPES.GROUND], emoji: '🪨', baseHp: 55, baseAtk: 95, baseDef: 115, baseSpa: 45, baseSpd: 45, baseSpe: 35, evolvesAt: 36, evolvesInto: SPECIES.Textlem, learnset: { 1: [MOVE_IDS.DefenseCurl, MOVE_IDS.Tackle], 11: [MOVE_IDS.DefenseCurl], 16: [MOVE_IDS.RockThrow], 21: [MOVE_IDS.SelfDestruct], 29: [MOVE_IDS.Harden], 36: [MOVE_IDS.Earthquake], 43: [MOVE_IDS.Explosion] } },
  [SPECIES.Textlem]: { types: [MONSTER_TYPES.ROCK, MONSTER_TYPES.GROUND], emoji: '🪨', baseHp: 80, baseAtk: 120, baseDef: 130, baseSpa: 55, baseSpd: 65, baseSpe: 45, learnset: { 1: [MOVE_IDS.DefenseCurl, MOVE_IDS.Tackle], 11: [MOVE_IDS.DefenseCurl], 16: [MOVE_IDS.RockThrow], 21: [MOVE_IDS.SelfDestruct], 29: [MOVE_IDS.Harden], 36: [MOVE_IDS.Earthquake], 43: [MOVE_IDS.Explosion] } },

  [SPECIES.Spellpoke]: { types: [MONSTER_TYPES.WATER, MONSTER_TYPES.PSYCHIC], emoji: '🧠', baseHp: 90, baseAtk: 65, baseDef: 65, baseSpa: 40, baseSpd: 40, baseSpe: 15, evolvesAt: 37, evolvesInto: SPECIES.Bookbro, learnset: { 1: [MOVE_IDS.Confusion], 18: [MOVE_IDS.Disable], 22: [MOVE_IDS.Headbutt], 27: [MOVE_IDS.Growl], 33: [MOVE_IDS.WaterGun], 40: [MOVE_IDS.Amnesia], 48: [MOVE_IDS.Psychic] } },
  [SPECIES.Bookbro]: { types: [MONSTER_TYPES.WATER, MONSTER_TYPES.PSYCHIC], emoji: '🐚', baseHp: 95, baseAtk: 75, baseDef: 110, baseSpa: 100, baseSpd: 80, baseSpe: 30, learnset: { 1: [MOVE_IDS.Confusion, MOVE_IDS.Disable, MOVE_IDS.Headbutt], 18: [MOVE_IDS.Disable], 22: [MOVE_IDS.Headbutt], 27: [MOVE_IDS.Growl], 33: [MOVE_IDS.WaterGun], 37: [MOVE_IDS.Withdraw], 44: [MOVE_IDS.Amnesia], 55: [MOVE_IDS.Psychic] } },

  [SPECIES.Ghostwriter]: { types: [MONSTER_TYPES.GHOST, MONSTER_TYPES.POISON], emoji: '👻', baseHp: 30, baseAtk: 35, baseDef: 30, baseSpa: 100, baseSpd: 35, baseSpe: 80, evolvesAt: 25, evolvesInto: SPECIES.Haikunter, learnset: { 1: [MOVE_IDS.ConfuseRay, MOVE_IDS.Lick, MOVE_IDS.NightShade], 27: [MOVE_IDS.Hypnosis], 35: [MOVE_IDS.DreamEater] } },
  [SPECIES.Haikunter]: { types: [MONSTER_TYPES.GHOST, MONSTER_TYPES.POISON], emoji: '👻', baseHp: 45, baseAtk: 50, baseDef: 45, baseSpa: 115, baseSpd: 55, baseSpe: 95, evolvesAt: 36, evolvesInto: SPECIES.Gramgar, learnset: { 1: [MOVE_IDS.ConfuseRay, MOVE_IDS.Lick, MOVE_IDS.NightShade], 29: [MOVE_IDS.Hypnosis], 38: [MOVE_IDS.DreamEater] } },
  [SPECIES.Gramgar]: { types: [MONSTER_TYPES.GHOST, MONSTER_TYPES.POISON], emoji: '😈', baseHp: 60, baseAtk: 65, baseDef: 60, baseSpa: 130, baseSpd: 75, baseSpe: 110, learnset: { 1: [MOVE_IDS.ConfuseRay, MOVE_IDS.Lick, MOVE_IDS.NightShade], 29: [MOVE_IDS.Hypnosis], 38: [MOVE_IDS.DreamEater] } },

  [SPECIES.Outlinix]: { types: [MONSTER_TYPES.ROCK, MONSTER_TYPES.GROUND], emoji: '🐍', baseHp: 35, baseAtk: 45, baseDef: 160, baseSpa: 30, baseSpd: 45, baseSpe: 70, learnset: { 1: [MOVE_IDS.Screech, MOVE_IDS.Tackle], 15: [MOVE_IDS.Bind], 19: [MOVE_IDS.RockThrow], 25: [MOVE_IDS.Rage], 33: [MOVE_IDS.Slam], 43: [MOVE_IDS.Harden] } },

  [SPECIES.Copybone]: { types: [MONSTER_TYPES.GROUND], emoji: 'BONE', baseHp: 50, baseAtk: 50, baseDef: 95, baseSpa: 40, baseSpd: 50, baseSpe: 35, evolvesAt: 28, evolvesInto: SPECIES.Memowak, learnset: { 1: [MOVE_IDS.BoneClub, MOVE_IDS.Growl], 25: [MOVE_IDS.Leer], 31: [MOVE_IDS.FocusEnergy], 38: [MOVE_IDS.Thrash], 43: [MOVE_IDS.Bonemerang], 46: [MOVE_IDS.Rage] } },
  [SPECIES.Memowak]: { types: [MONSTER_TYPES.GROUND], emoji: 'BONE', baseHp: 60, baseAtk: 80, baseDef: 110, baseSpa: 50, baseSpd: 80, baseSpe: 45, learnset: { 1: [MOVE_IDS.BoneClub, MOVE_IDS.FocusEnergy, MOVE_IDS.Growl, MOVE_IDS.Leer], 25: [MOVE_IDS.Leer], 33: [MOVE_IDS.FocusEnergy], 41: [MOVE_IDS.Thrash], 48: [MOVE_IDS.Bonemerang], 55: [MOVE_IDS.Rage] } },

  [SPECIES.Leeletter]: { types: [MONSTER_TYPES.FIGHTING], emoji: 'LEG', baseHp: 50, baseAtk: 120, baseDef: 53, baseSpa: 35, baseSpd: 110, baseSpe: 87, learnset: { 1: [MOVE_IDS.DoubleKick, MOVE_IDS.Meditate], 33: [MOVE_IDS.RollingKick], 38: [MOVE_IDS.JumpKick], 43: [MOVE_IDS.FocusEnergy], 48: [MOVE_IDS.HighJumpKick], 53: [MOVE_IDS.MegaKick] } },
  [SPECIES.Chanhistory]: { types: [MONSTER_TYPES.FIGHTING], emoji: 'BOX', baseHp: 50, baseAtk: 105, baseDef: 79, baseSpa: 35, baseSpd: 110, baseSpe: 76, learnset: { 1: [MOVE_IDS.Agility, MOVE_IDS.CometPunch], 33: [MOVE_IDS.FirePunch], 38: [MOVE_IDS.IcePunch], 43: [MOVE_IDS.ThunderPunch], 48: [MOVE_IDS.MegaPunch], 53: [MOVE_IDS.Counter] } },

  [SPECIES.Kerneloff]: { types: [MONSTER_TYPES.POISON], emoji: '💣', baseHp: 40, baseAtk: 65, baseDef: 95, baseSpa: 60, baseSpd: 45, baseSpe: 35, evolvesAt: 35, evolvesInto: SPECIES.Wordweeze, learnset: { 1: [MOVE_IDS.Smog, MOVE_IDS.Tackle], 32: [MOVE_IDS.Sludge], 37: [MOVE_IDS.Smokescreen], 40: [MOVE_IDS.SelfDestruct], 45: [MOVE_IDS.Haze], 48: [MOVE_IDS.Explosion] } },
  [SPECIES.Wordweeze]: { types: [MONSTER_TYPES.POISON], emoji: '💨', baseHp: 65, baseAtk: 90, baseDef: 120, baseSpa: 85, baseSpd: 70, baseSpe: 60, learnset: { 1: [MOVE_IDS.Sludge, MOVE_IDS.Smog, MOVE_IDS.Tackle], 32: [MOVE_IDS.Sludge], 39: [MOVE_IDS.Smokescreen], 43: [MOVE_IDS.SelfDestruct], 49: [MOVE_IDS.Haze], 53: [MOVE_IDS.Explosion] } },

  [SPECIES.Citesey]: { types: [MONSTER_TYPES.NORMAL], emoji: '🥚', baseHp: 250, baseAtk: 5, baseDef: 5, baseSpa: 35, baseSpd: 105, baseSpe: 50, learnset: { 1: [MOVE_IDS.DoubleSlap, MOVE_IDS.Pound], 24: [MOVE_IDS.Sing], 30: [MOVE_IDS.Growl], 38: [MOVE_IDS.Minimize], 44: [MOVE_IDS.DefenseCurl], 48: [MOVE_IDS.LightScreen], 54: [MOVE_IDS.DoubleEdge] } },

  [SPECIES.Scrypt]: { types: [MONSTER_TYPES.BUG, MONSTER_TYPES.FLYING], emoji: '🔪', baseHp: 70, baseAtk: 110, baseDef: 80, baseSpa: 55, baseSpd: 80, baseSpe: 105, learnset: { 1: [MOVE_IDS.QuickAttack], 17: [MOVE_IDS.Leer], 20: [MOVE_IDS.FocusEnergy], 24: [MOVE_IDS.DoubleTeam], 29: [MOVE_IDS.Slash], 35: [MOVE_IDS.SwordsDance], 42: [MOVE_IDS.Agility] } },

  [SPECIES.Finfolio]: { types: [MONSTER_TYPES.WATER], emoji: '🐟', baseHp: 20, baseAtk: 10, baseDef: 55, baseSpa: 15, baseSpd: 20, baseSpe: 80, evolvesAt: 20, evolvesInto: SPECIES.Seaslang, learnset: { 1: [MOVE_IDS.Splash], 15: [MOVE_IDS.Tackle] } },
  [SPECIES.Seaslang]: { types: [MONSTER_TYPES.WATER, MONSTER_TYPES.FLYING], emoji: '🐉', baseHp: 95, baseAtk: 125, baseDef: 79, baseSpa: 60, baseSpd: 100, baseSpe: 81, learnset: { 1: [MOVE_IDS.Bite, MOVE_IDS.DragonRage, MOVE_IDS.HydroPump, MOVE_IDS.Leer], 20: [MOVE_IDS.Bite], 25: [MOVE_IDS.DragonRage], 32: [MOVE_IDS.Leer], 41: [MOVE_IDS.HydroPump], 52: [MOVE_IDS.HyperBeam] } },

  [SPECIES.Legendras]: { types: [MONSTER_TYPES.WATER, MONSTER_TYPES.ICE], emoji: '⛵', baseHp: 130, baseAtk: 85, baseDef: 80, baseSpa: 85, baseSpd: 95, baseSpe: 60, learnset: { 1: [MOVE_IDS.Growl, MOVE_IDS.WaterGun], 16: [MOVE_IDS.Sing], 20: [MOVE_IDS.Mist], 25: [MOVE_IDS.BodySlam], 31: [MOVE_IDS.ConfuseRay], 38: [MOVE_IDS.IceBeam], 46: [MOVE_IDS.HydroPump] } },

  [SPECIES.Drafto]: { types: [MONSTER_TYPES.NORMAL], emoji: '👥', baseHp: 48, baseAtk: 48, baseDef: 48, baseSpa: 48, baseSpd: 48, baseSpe: 48, learnset: { 1: [MOVE_IDS.Transform] } },

  [SPECIES.Essayve]: { types: [MONSTER_TYPES.NORMAL], emoji: '🐕', baseHp: 55, baseAtk: 55, baseDef: 50, baseSpa: 45, baseSpd: 65, baseSpe: 55, evolvesAt: 20, evolvesInto: SPECIES.Verseon, learnset: { 1: [MOVE_IDS.SandAttack, MOVE_IDS.Tackle], 27: [MOVE_IDS.QuickAttack], 31: [MOVE_IDS.TailWhip], 37: [MOVE_IDS.Bite], 45: [MOVE_IDS.TakeDown] } },
  [SPECIES.Verseon]: { types: [MONSTER_TYPES.WATER], emoji: '🧜', baseHp: 130, baseAtk: 65, baseDef: 60, baseSpa: 110, baseSpd: 95, baseSpe: 65, learnset: { 1: [MOVE_IDS.QuickAttack, MOVE_IDS.SandAttack, MOVE_IDS.Tackle, MOVE_IDS.WaterGun], 27: [MOVE_IDS.QuickAttack], 31: [MOVE_IDS.WaterGun], 37: [MOVE_IDS.TailWhip], 40: [MOVE_IDS.Bite], 42: [MOVE_IDS.AcidArmor], 44: [MOVE_IDS.Haze], 48: [MOVE_IDS.Mist], 54: [MOVE_IDS.HydroPump] } },
  [SPECIES.Jingleon]: { types: [MONSTER_TYPES.ELECTRIC], emoji: '⚡', baseHp: 65, baseAtk: 65, baseDef: 60, baseSpa: 110, baseSpd: 95, baseSpe: 130, learnset: { 1: [MOVE_IDS.QuickAttack, MOVE_IDS.SandAttack, MOVE_IDS.Tackle, MOVE_IDS.ThunderShock], 27: [MOVE_IDS.QuickAttack], 31: [MOVE_IDS.ThunderShock], 37: [MOVE_IDS.TailWhip], 40: [MOVE_IDS.ThunderWave], 42: [MOVE_IDS.DoubleKick], 44: [MOVE_IDS.Agility], 48: [MOVE_IDS.PinMissile], 54: [MOVE_IDS.Thunder] } },
  [SPECIES.Noteon]: { types: [MONSTER_TYPES.FIRE], emoji: '🔥', baseHp: 65, baseAtk: 130, baseDef: 60, baseSpa: 95, baseSpd: 110, baseSpe: 65, learnset: { 1: [MOVE_IDS.Ember, MOVE_IDS.QuickAttack, MOVE_IDS.SandAttack, MOVE_IDS.Tackle], 27: [MOVE_IDS.QuickAttack], 31: [MOVE_IDS.Ember], 37: [MOVE_IDS.TailWhip], 40: [MOVE_IDS.Bite], 42: [MOVE_IDS.Leer], 44: [MOVE_IDS.FireSpin], 48: [MOVE_IDS.Rage], 54: [MOVE_IDS.Flamethrower] } },

  [SPECIES.Summarylax]: { types: [MONSTER_TYPES.NORMAL], emoji: '😴', baseHp: 160, baseAtk: 110, baseDef: 65, baseSpa: 65, baseSpd: 110, baseSpe: 30, learnset: { 1: [MOVE_IDS.Amnesia, MOVE_IDS.Headbutt, MOVE_IDS.Rest], 35: [MOVE_IDS.BodySlam], 41: [MOVE_IDS.Harden], 48: [MOVE_IDS.DoubleEdge], 56: [MOVE_IDS.HyperBeam] } },

  [SPECIES.Draftini]: { types: [MONSTER_TYPES.DRAGON], emoji: '🐉', baseHp: 41, baseAtk: 64, baseDef: 45, baseSpa: 50, baseSpd: 50, baseSpe: 50, evolvesAt: 30, evolvesInto: SPECIES.Docair, learnset: { 1: [MOVE_IDS.Leer, MOVE_IDS.Wrap], 10: [MOVE_IDS.ThunderWave], 20: [MOVE_IDS.Agility], 30: [MOVE_IDS.Slam], 40: [MOVE_IDS.DragonRage], 50: [MOVE_IDS.HyperBeam] } },
  [SPECIES.Docair]: { types: [MONSTER_TYPES.DRAGON], emoji: '🐉', baseHp: 61, baseAtk: 84, baseDef: 65, baseSpa: 70, baseSpd: 70, baseSpe: 70, evolvesAt: 55, evolvesInto: SPECIES.Datanite, learnset: { 1: [MOVE_IDS.Leer, MOVE_IDS.ThunderWave, MOVE_IDS.Wrap], 10: [MOVE_IDS.ThunderWave], 20: [MOVE_IDS.Agility], 35: [MOVE_IDS.Slam], 45: [MOVE_IDS.DragonRage], 55: [MOVE_IDS.HyperBeam] } },
  [SPECIES.Datanite]: { types: [MONSTER_TYPES.DRAGON, MONSTER_TYPES.FLYING], emoji: '🐉', baseHp: 91, baseAtk: 134, baseDef: 95, baseSpa: 100, baseSpd: 100, baseSpe: 80, learnset: { 1: [MOVE_IDS.Agility, MOVE_IDS.Leer, MOVE_IDS.ThunderWave, MOVE_IDS.Wrap], 10: [MOVE_IDS.ThunderWave], 20: [MOVE_IDS.Agility], 35: [MOVE_IDS.Slam], 45: [MOVE_IDS.DragonRage], 60: [MOVE_IDS.HyperBeam] } },

  [SPECIES.Musetwo]: { types: [MONSTER_TYPES.PSYCHIC], emoji: '👽', baseHp: 106, baseAtk: 110, baseDef: 90, baseSpa: 154, baseSpd: 90, baseSpe: 130, learnset: { 1: [MOVE_IDS.Confusion, MOVE_IDS.Disable, MOVE_IDS.Psychic, MOVE_IDS.Swift], 63: [MOVE_IDS.Barrier], 66: [MOVE_IDS.Psychic], 70: [MOVE_IDS.Recover], 75: [MOVE_IDS.Mist], 81: [MOVE_IDS.Amnesia] } },
  [SPECIES.Muse]: { types: [MONSTER_TYPES.PSYCHIC], emoji: '✨', baseHp: 100, baseAtk: 100, baseDef: 100, baseSpa: 100, baseSpd: 100, baseSpe: 100, learnset: { 1: [MOVE_IDS.Pound], 10: [MOVE_IDS.Transform], 20: [MOVE_IDS.MegaPunch], 30: [MOVE_IDS.Metronome], 40: [MOVE_IDS.Psychic] } },
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
  const iv = 31;
  if (isHp) {
    return Math.floor(((2 * base + iv) * level) / 100) + level + 10;
  }
  return Math.floor(((2 * base + iv) * level) / 100) + 5;
}

export function getStatWithStage(statValue: number, stage: number, status: string = 'None', statName: string = ''): number {
  const multipliers: Record<number, number> = {
    '-6': 2 / 8, '-5': 2 / 7, '-4': 2 / 6, '-3': 2 / 5, '-2': 2 / 4, '-1': 2 / 3,
    '0': 1,
    '1': 1.5, '2': 2, '3': 2.5, '4': 3, '5': 3.5, '6': 4
  };
  let value = Math.floor(statValue * (multipliers[stage] || 1));

  if (status === STATUS_CONDITIONS.BURN && statName === 'atk') value = Math.floor(value / 2);
  if (status === STATUS_CONDITIONS.PARALYSIS && statName === 'spe') value = Math.floor(value / 4);

  return value;
}

export function calculateDamage(
  attacker: Monster,
  defender: Monster,
  move: Move,
  spellingPerformance: { isCorrect: boolean; isPerfect: boolean; isPower: boolean }
) {
  if (!spellingPerformance.isCorrect) return { damage: 0, typeMod: 1, isMiss: true };

  const isSpecial = move.category === 'Special';
  const atkStat = isSpecial ? attacker.spa : attacker.atk;
  const defStat = isSpecial ? defender.spd : defender.def;

  const atkStage = isSpecial ? attacker.stages.spa : attacker.stages.atk;
  const defStage = isSpecial ? defender.stages.spd : defender.stages.def;

  const effectiveAtk = getStatWithStage(atkStat, atkStage || 0, attacker.status, isSpecial ? 'spa' : 'atk');
  const effectiveDef = getStatWithStage(defStat, defStage || 0, defender.status, isSpecial ? 'spd' : 'def');

  // Spelling power impacts whether the move hits or misses
  // If it's a "Power" spelling (fast), it gets a boost and ignore accuracy?
  // User said: "Spelling power impacts whether the move hits or misses. I don't think it should ALWAYS hit because Growl and other conditions should still be valid."

  let hitChance = move.accuracy / 100;
  if (spellingPerformance.isPower) hitChance += 0.2; // Fast spelling increases hit chance
  if (spellingPerformance.isPerfect) hitChance += 0.1;

  const isMiss = Math.random() > hitChance;
  if (isMiss) return { damage: 0, typeMod: 1, isMiss: true };

  const difficultyMultiplier = spellingPerformance.isPerfect ? 1.5 : (spellingPerformance.isPower ? 1.2 : 1.0);

  let typeMod = 1;
  defender.types.forEach(defType => {
    typeMod *= TYPE_CHART[move.type]?.[defType] || 1;
  });

  const stab = attacker.types.includes(move.type) ? 1.5 : 1;

  const levelPart = (2 * attacker.level) / 5 + 2;
  const baseDamage = (((levelPart * move.power * (effectiveAtk / effectiveDef)) / 50) + 2) * typeMod * stab;

  const finalDamage = Math.floor(baseDamage * difficultyMultiplier * (0.85 + Math.random() * 0.15));

  return {
    damage: Math.max(1, finalDamage),
    typeMod,
    isMiss: false
  };
}

export function calculateExpToNext(level: number): number {
  // Use a quadratic formula for smoother "per-level" progression
  return Math.floor(5 * Math.pow(level, 2)) + 10;
}

export function getRivalStarter(playerSpecies: string): string {
  const playerTypes = MONS[playerSpecies]?.types || [];
  if (playerTypes.includes(MONSTER_TYPES.FIRE)) return SPECIES.Squirtspell;
  if (playerTypes.includes(MONSTER_TYPES.WATER)) return SPECIES.Bulbaword;
  if (playerTypes.includes(MONSTER_TYPES.GRASS)) return SPECIES.Grammander;
  return SPECIES.Verminverb;
}

export function createMon(species: string, level: number = 5): Monster {
  const base = MONS[species] || MONS[SPECIES.Verminverb] || MONS[SPECIES.Grammander];
  const hp = calculateStat(base.baseHp, level, true);
  const atk = calculateStat(base.baseAtk, level);
  const def = calculateStat(base.baseDef, level);
  const spa = calculateStat(base.baseSpa || base.baseAtk, level);
  const spd = calculateStat(base.baseSpd || base.baseDef, level);
  const spe = calculateStat(base.baseSpe || 50, level);

  // Determine moves based on level
  const moves: string[] = [];
  if (base.learnset) {
    const sortedLevels = Object.keys(base.learnset).map(Number).sort((a, b) => b - a);
    for (const l of sortedLevels) {
      if (l <= level) {
        for (const mId of base.learnset[l]) {
          if (!moves.includes(mId)) {
            moves.push(mId);
            if (moves.length >= 4) break;
          }
        }
      }
      if (moves.length >= 4) break;
    }
  }

  return {
    species,
    emoji: base.emoji,
    types: base.types || [MONSTER_TYPES.NORMAL],
    level,
    hp,
    maxHp: hp,
    atk,
    def,
    spa,
    spd,
    spe,
    exp: 0,
    expToNext: calculateExpToNext(level),
    id: Math.random().toString(36).slice(2, 11),
    moves,
    status: 'None',
    stages: { atk: 0, def: 0, spa: 0, spd: 0, spe: 0 }
  };
}

export function calculateExpGain(enemyMon: { level: number }, isTrainer: boolean): number {
  // Monster-inspired formula: (Base * Level) / 7
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
