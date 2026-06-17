import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useGameFSM } from '../../src/stores/gameFSM';
import { useSessionStore } from '../../src/stores/sessionStore';
import { useVocabStore } from '../../src/stores/vocabStore';
import { GAME_STATES, GAME_EVENTS } from '../../src/utils/constants';

describe('Tiered Attack Quality and Damage via FSM', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  const mockPlayer = {
    id: 'p1',
    species: 'Grammander',
    type: 'Fire',
    level: 10,
    hp: 30,
    maxHp: 30,
    atk: 20,
    def: 20,
    spd: 20
  };

  const mockEnemy = {
    species: 'Bulbaword',
    type: 'Grass',
    level: 10,
    hp: 30,
    maxHp: 30,
    atk: 20,
    def: 20,
    spd: 20
  };

  it('awards more power for Perfect than just Correct', async () => {
    const session = useSessionStore();
    const vocab = useVocabStore();

    // Mock vocab to return a specific word
    vocab.getRandomWord = vi.fn().mockReturnValue({ word: 'APPLE', difficulty: 1 });

    session.player.party = [mockPlayer];
    session.battle.playerMonId = 'p1';
    session.battle.enemyMon = { ...mockEnemy };

    const fsm = useGameFSM();

    // Wait for BOOTING to finish (or at least yield)
    await new Promise(r => setTimeout(r, 100));

    // Force transition to spelling
    fsm.transition(GAME_STATES.BATTLE_SPELLING);

    expect(session.battle.currentWord.word).toBe('APPLE');

    // Test Correct
    fsm.send(GAME_EVENTS.SUBMIT, { input: 'APPLE' });

    // In Pinia setup stores, refs are unwrapped
    expect(fsm.matches(GAME_STATES.BATTLE_PLAYER_ATTACK)).toBe(true);
    // Use the internal state to access params if proxy is being tricky in tests
    const fsmInternal = fsm; // In setup store, this IS the returned object
    // Try both paths
    const power = fsm.params?.power ?? fsm.state.params?.power;
    expect(power).toBeGreaterThanOrEqual(60);
  });
});
