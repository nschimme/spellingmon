import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useGameFSM } from '../../src/stores/gameFSM';
import { GAME_STATES, GAME_EVENTS } from '../../src/utils/constants';

describe('GameFSM Navigation', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('can transition through landing to save selection', () => {
    const fsm = useGameFSM();
    // Use transitions since we are testing machine flow
    fsm.transition(GAME_STATES.LANDING);
    expect(fsm.matches(GAME_STATES.LANDING)).toBe(true);

    fsm.send(GAME_EVENTS.START);
    // If ttsVerified is false (default), it goes to LANGUAGE_SELECT
    expect(fsm.matches(GAME_STATES.LANGUAGE_SELECT)).toBe(true);
  });
});
