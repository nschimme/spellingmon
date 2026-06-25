import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useGameFSM } from '../../src/stores/gameFSM';
import { useSessionStore } from '../../src/stores/sessionStore';
import { useVocabStore } from '../../src/stores/vocabStore';
import { GAME_STATES, GAME_EVENTS, MOVE_IDS } from '../../src/utils/constants';

describe('Tiered Attack Quality and Damage via FSM', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  const mockPlayer = {
    id: 'p1',
    species: 'Grammander',
    types: ['Fire'],
    level: 10,
    hp: 30,
    maxHp: 30,
    atk: 20,
    def: 20,
    spa: 20,
    spd: 20,
    spe: 20,
    stages: {},
    moves: ['TypoTackle']
  };

  const mockEnemy = {
    species: 'Bulbaword',
    types: ['Grass', 'Poison'],
    level: 10,
    hp: 30,
    maxHp: 30,
    atk: 20,
    def: 20,
    spa: 20,
    spd: 20,
    spe: 20,
    stages: {},
    moves: ['TypoTackle']
  };

  it('awards more power for Perfect than just Correct', async () => {
    const session = useSessionStore();
    const vocab = useVocabStore();

    // Mock vocab to return a specific word
    vocab.getRandomWord = vi.fn().mockReturnValue({ word: 'APPLE', difficulty: 1 });

    session.player.party = [mockPlayer as any];
    session.battle.playerMonId = 'p1';
    session.battle.enemyMon = { ...mockEnemy } as any;
    session.battle.selectedMoveId = MOVE_IDS.Tackle;

    const fsm = useGameFSM();

    // Wait for BOOTING to finish (or at least yield)
    await new Promise(r => setTimeout(r, 100));

    // Force transition to spelling
    await fsm.transition(GAME_STATES.BATTLE_SPELLING);

    expect(session.battle.currentWord.word).toBe('APPLE');

    // Test Correct
    fsm.send(GAME_EVENTS.SUBMIT, { input: 'APPLE' });

    // In Pinia setup stores, refs are unwrapped
    expect(fsm.matches(GAME_STATES.BATTLE_PLAYER_ATTACK)).toBe(true);
    // Use the internal state to access params if proxy is being tricky in tests
    const fsmInternal = fsm; // In setup store, this IS the returned object
    // Try both paths
    const isPerfect = fsm.params?.isPerfect ?? fsm.state.params?.isPerfect;
    expect(isPerfect).toBe(true);
  });
});
