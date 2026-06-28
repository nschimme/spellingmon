import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useGameFSM } from '../../src/stores/gameFSM';
import { useSessionStore } from '../../src/stores/sessionStore';
import { GAME_STATES, GAME_EVENTS, BATTLE_TYPES } from '../../src/utils/constants';

// Mock speech and audio
vi.mock('../../src/utils/speech', () => ({
  speech: {
    speak: vi.fn(),
    stop: vi.fn(),
    init: vi.fn(),
    refreshVoices: vi.fn(),
    setVolume: vi.fn(),
    isLanguageSupported: vi.fn().mockReturnValue(true),
    setVoice: vi.fn().mockReturnValue(true),
    voices: []
  }
}));

vi.mock('../../src/utils/audio', () => ({
  audio: {
    playSound: vi.fn(),
    setVolume: vi.fn(),
    setMuted: vi.fn()
  }
}));

describe('Rival Rematch Logic', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('should mark rival as defeated after player loss (mercy)', async () => {
    const fsm = useGameFSM();
    const session = useSessionStore();

    // Set up player state
    session.player.isStarterSelected = true;
    session.player.characterCreationComplete = true;
    session.player.defeatedTrainers = [];

    // Wait for BOOTING to settle
    await new Promise(resolve => setTimeout(resolve, 50));

    // Force transition to WORLD
    await fsm.transition(GAME_STATES.WORLD);

    // Set up battle state
    session.battle.isRival = true;
    session.battle.trainerId = 'rival_1';

    // Move to whited out state
    await fsm.transition(GAME_STATES.BATTLE_WHITED_OUT);

    // Confirm to return to world
    await fsm.send(GAME_EVENTS.CONFIRM);

    expect(session.player.defeatedTrainers).toContain('rival_1');
  });

  it('should mark regular trainer as defeated after player win', async () => {
    const fsm = useGameFSM();
    const session = useSessionStore();

    session.player.isStarterSelected = true;
    session.player.characterCreationComplete = true;
    session.player.defeatedTrainers = [];

    await new Promise(resolve => setTimeout(resolve, 50));

    await fsm.transition(GAME_STATES.WORLD);

    const enemy = { species: 'Grammander', level: 5, hp: 10, maxHp: 10, id: 'enemy_1', exp: 0, expToNext: 100 };
    session.battle.enemyMon = enemy as any;
    session.battle.type = BATTLE_TYPES.TRAINER;
    session.battle.trainerId = 'trainer_1';
    session.battle.participatingMonIds = [];

    // Win battle
    await fsm.transition(GAME_STATES.BATTLE_VICTORY);

    // Move to results
    await fsm.transition(GAME_STATES.BATTLE_RESULTS);

    // Setup defeat dialog
    session.battle.trainerDefeatDialog = 'trainer.dialogs.defeat_1';

    // Continue from results to dialog
    await fsm.send(GAME_EVENTS.CONTINUE);

    // In Pinia store, refs are unwrapped
    expect(fsm.state).toBe(GAME_STATES.DIALOG);

    // Confirm dialog to trigger onComplete
    await fsm.send(GAME_EVENTS.CONFIRM);

    expect(session.player.defeatedTrainers).toContain('trainer_1');
  });
});
