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
};
