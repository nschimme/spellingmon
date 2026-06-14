export const GAME_CONSTANTS = {
  MAP_WIDTH: 20,
  MAP_HEIGHT: 20,
  GRASS_ENCOUNTER_CHANCE: 0.15,
  MAX_AREAS: 5,
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
  PLAYER_STATE: 'player_state',
  BATTLE_STATE: 'battle_state',
  SELECTED_VOICE: 'selected_voice_name',
  VOLUME: 'volume',
  IS_MUTED: 'is_muted',
};

export const MENU_TABS = {
  PARTY: 'party',
  PROGRESS: 'progress',
  MAP: 'map',
  SETTINGS: 'settings',
};
