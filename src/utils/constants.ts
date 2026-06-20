export const GAME_CONSTANTS = {
  MAP_WIDTH: 20,
  MAP_HEIGHT: 20,
  GRASS_ENCOUNTER_CHANCE: 0.15,
  MAX_AREAS: 9,
  SAVE_DEBOUNCE_MS: 500,
  NOTIFICATION_DURATION_MS: 3000,
  TRAINER_ENGAGEMENT_DELAY_MS: 1500,
  TRANSITION_Y: 10,
  MOBILE_MOVEMENT_REPEAT_MS: 200,
};

export const SOUND_EFFECTS = {
  CLICK: 'click',
  HIT: 'hit',
  FAINT: 'faint',
  HEAL: 'heal',
  CAPTURE_SUCCESS: 'capture-success',
  CAPTURE_FAIL: 'capture-fail',
  BATTLE_START: 'battle-start',
  VICTORY: 'victory',
  EVOLUTION: 'evolution',
  DISCOVERY: 'discovery',
};

/**
 * Pacing and animation durations (in milliseconds).
 * Note: Some values should align with CSS animation durations in BattleView.vue
 * - SHAKE_MS: Total shake duration (CSS: shake is 0.1s infinite, this gates the state)
 * - FLASH_MS: Screen flash duration (CSS: flash is 0.1s x 5 = 0.5s)
 * - CAPTURE_PROCESS_MS: Time from ball throw to result (CSS: capture is 0.5s)
 */
export const ANIMATION_DURATIONS = {
  SHAKE_MS: 500,
  FLASH_MS: 500,
  CAPTURE_PROCESS_MS: 1500,
  BATTLE_END_DELAY_MS: 3000,
  VICTORY_SOUND_DELAY_MS: 1000,
  CAPTURE_END_DELAY_MS: 2000,
  EVOLUTION_DURATION_MS: 4000,
};

export const BATTLE_TYPES = {
  WILD: 'wild',
  TRAINER: 'trainer',
};

export const BATTLE_PHASES = {
  START: 'start',
  SELECT_ACTION: 'select_action',
  SPELLING: 'spelling',
  PLAYER_ATTACK: 'player_attack',
  ENEMY_TURN: 'enemy_turn',
  SWITCHING: 'switching',
  END: 'end',
  RESULTS: 'results',
  WHITED_OUT: 'whited_out',
  PARTY_FULL_REPLACE: 'party_full_replace',
};

export const GENDERS = {
  BOY: 'Boy',
  GIRL: 'Girl',
};

export const SKIN_TONES = {
  PALE: 'pale',
  FAIR: 'fair',
  NEUTRAL: 'neutral',
  TAN: 'tan',
  DARK: 'dark',
};

export const INPUT_CONTEXTS = {
  WORLD: 'world',
  BATTLE: 'battle',
  MENU: 'menu',
  GLOBAL: 'global',
  MODAL: 'modal',
};

export const INPUT_PRIORITIES = {
  GLOBAL: 100,
  MODAL: 80,
  MENU: 50,
  BATTLE: 40,
  WORLD: 10,
};

export const BIOMES = {
  WILDERNESS: 'wilderness',
  CAVE: 'cave',
  TOWN: 'town',
  ROUTE: 'route',
  FOREST: 'forest',
};

export const TRANSITION_TYPES = {
  PREV: 'prev',
  NEXT: 'next',
};

export const MONSTER_TYPES = {
  NORMAL: 'Normal',
  FIRE: 'Fire',
  WATER: 'Water',
  GRASS: 'Grass',
  ELECTRIC: 'Electric',
  ICE: 'Ice',
  FIGHTING: 'Fighting',
  POISON: 'Poison',
  GROUND: 'Ground',
  FLYING: 'Flying',
  PSYCHIC: 'Psychic',
  BUG: 'Bug',
  ROCK: 'Rock',
  GHOST: 'Ghost',
  DRAGON: 'Dragon',
};

export const STORAGE_KEYS = {
  ACTIVE_SLOT: 'spellingmon_active_slot',
  SETTINGS: 'spellingmon_settings',
  SESSION: 'spellingmon_session', // Slot-dependent
};

export const SUPPORTED_LANGUAGES = [
  { code: 'en-US', name: 'English', flag: '🇺🇸', native: 'English' },
  { code: 'de-DE', name: 'German', flag: '🇩🇪', native: 'Deutsch' },
  { code: 'es-MX', name: 'Spanish', flag: '🇲🇽', native: 'Español' },
  { code: 'fr-FR', name: 'French', flag: '🇫🇷', native: 'Français' },
  { code: 'pt-BR', name: 'Portuguese', flag: '🇧🇷', native: 'Português' },
  { code: 'ru-RU', name: 'Russian', flag: '🇷🇺', native: 'Русский' },
  { code: 'zh-CN', name: 'Mandarin', flag: '🇨🇳', native: '普通话' }
];

export const MENU_TABS = {
  PARTY: 'party',
  SPELLINGDEX: 'spellingdex',
  PROGRESS: 'progress',
  MAP: 'map',
  SETTINGS: 'settings',
};

export const GAME_STATES = {
  BOOTING: 'BOOTING',
  LANGUAGE_SELECT: 'LANGUAGE_SELECT',
  TTS_CHECK: 'TTS_CHECK',
  LANDING: 'LANDING',
  SAVE_SELECTION: 'SAVE_SELECTION',
  LOADING: 'LOADING',
  ONBOARDING: 'ONBOARDING',
  CHARACTER_CREATION: 'ONBOARDING.CHARACTER_CREATION',
  STARTER_SELECTION: 'ONBOARDING.STARTER_SELECTION',
  PLAY: 'PLAY',
  WORLD: 'PLAY.WORLD',
  TRAINER_APPROACH: 'PLAY.TRAINER_APPROACH',
  BATTLE: 'PLAY.BATTLE',
  BATTLE_INTRO: 'PLAY.BATTLE.INTRO',
  BATTLE_ACTION_SELECT: 'PLAY.BATTLE.ACTION_SELECT',
  BATTLE_SWITCHING: 'PLAY.BATTLE.SWITCHING',
  BATTLE_SPELLING: 'PLAY.BATTLE.SPELLING',
  BATTLE_PLAYER_ATTACK: 'PLAY.BATTLE.PLAYER_ATTACK',
  BATTLE_ENEMY_TURN: 'PLAY.BATTLE.ENEMY_TURN',
  BATTLE_WHITED_OUT: 'PLAY.BATTLE.WHITED_OUT',
  BATTLE_VICTORY: 'PLAY.BATTLE.VICTORY',
  BATTLE_RESULTS: 'PLAY.BATTLE.RESULTS',
  BATTLE_PARTY_FULL: 'PLAY.BATTLE.PARTY_FULL',
  MENU: 'PLAY.MENU',
  EVOLUTION: 'PLAY.EVOLUTION',
  STORY_CUTSCENE: 'PLAY.STORY_CUTSCENE',
};

export const GAME_EVENTS = {
  START: 'START',
  SELECT_LANG: 'SELECT_LANG',
  VERIFIED: 'VERIFIED',
  CONFIRM: 'CONFIRM',
  BACK: 'BACK',
  SELECT_SLOT: 'SELECT_SLOT',
  COMPLETE: 'COMPLETE',
  ENCOUNTER: 'ENCOUNTER',
  OPEN_MENU: 'OPEN_MENU',
  CLOSE: 'CLOSE',
  EVOLVE: 'EVOLVE',
  LOGOUT: 'LOGOUT',
  ATTACK: 'ATTACK',
  CAPTURE: 'CAPTURE',
  SWITCH: 'SWITCH',
  RUN: 'RUN',
  CANCEL: 'CANCEL',
  SUBMIT: 'SUBMIT',
  CONTINUE: 'CONTINUE',
  REPLACE: 'REPLACE',
  RELEASE: 'RELEASE',
  FINISH: 'FINISH',
  NEXT_SCENE: 'NEXT_SCENE',
};
