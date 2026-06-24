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

  it('should not mark rival as defeated after player loss (mercy)', async () => {
    const fsm = useGameFSM();
    const session = useSessionStore();

    session.player.isStarterSelected = true;
    session.player.characterCreationComplete = true;
    session.player.defeatedTrainers = [];

    await fsm.transition(GAME_STATES.WORLD);

    await fsm.transition(GAME_STATES.BATTLE_INTRO, {
      enemy: { species: 'Grammander', level: 5, hp: 10, maxHp: 10 },
      type: BATTLE_TYPES.TRAINER,
      trainerId: 'rival_1',
      isRival: true
    });

    await fsm.transition(GAME_STATES.BATTLE_WHITED_OUT);
    await fsm.send(GAME_EVENTS.CONFIRM);

    expect(fsm.state).toBe(GAME_STATES.WORLD);
    expect(session.player.defeatedTrainers).not.toContain('rival_1');
  });

  it('should mark regular trainer as defeated after player win', async () => {
    const fsm = useGameFSM();
    const session = useSessionStore();

    session.player.isStarterSelected = true;
    session.player.characterCreationComplete = true;
    session.player.defeatedTrainers = [];
    await fsm.transition(GAME_STATES.WORLD);

    const enemy = { species: 'Grammander', level: 5, hp: 10, maxHp: 10 };
    await fsm.transition(GAME_STATES.BATTLE_INTRO, {
      enemy,
      type: BATTLE_TYPES.TRAINER,
      trainerId: 'trainer_1'
    });

    // Set explicit state in session for onEnter
    session.battle.type = BATTLE_TYPES.TRAINER;
    session.battle.trainerId = 'trainer_1';
    session.battle.enemyMon = enemy;

    // Win battle
    await fsm.transition(GAME_STATES.BATTLE_VICTORY);

    expect(session.player.defeatedTrainers).toContain('trainer_1');
  });
});
