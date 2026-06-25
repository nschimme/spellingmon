import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useGameFSM } from '../../src/stores/gameFSM';
import { useSessionStore } from '../../src/stores/sessionStore';
import { GAME_STATES, GAME_EVENTS, BATTLE_TYPES } from '../../src/utils/constants';
import { SPECIES, createMon } from '../../src/utils/gameData';

describe('Rival Scaling Unit', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('scales all rival party members to player lead level', async () => {
    const fsm = useGameFSM();
    const session = useSessionStore();

    // Setup player with a high level lead
    const playerLead = createMon(SPECIES.Grammander, 25);
    session.player.party = [playerLead];
    session.player.isStarterSelected = true;

    // Wait for BOOTING
    await new Promise(r => setTimeout(r, 50));

    // Transition to WORLD then trigger Rival battle
    await fsm.transition(GAME_STATES.WORLD);

    const rivalParty = [
        { species: SPECIES.Bulbaword, level: 5 },
        { species: SPECIES.Verminverb, level: 5 }
    ];

    await fsm.send(GAME_EVENTS.ENCOUNTER, {
      type: BATTLE_TYPES.TRAINER,
      trainerId: 'rival_1',
      trainerName: 'Robin',
      trainerParty: rivalParty
    });

    expect(fsm.matches(GAME_STATES.TRAINER_APPROACH)).toBe(true);

    // Transition to BATTLE_INTRO (which is inside BATTLE)
    // We must provide a dummy enemy to enter the logic block
    await fsm.transition(GAME_STATES.BATTLE_INTRO, {
      enemy: createMon(SPECIES.Verminverb, 1),
      type: BATTLE_TYPES.TRAINER,
      trainerId: 'rival_1',
      trainerName: 'Robin',
      trainerParty: rivalParty
    });

    // Check if we are in the battle state tree
    expect(fsm.matches(GAME_STATES.BATTLE)).toBe(true);

    // Check scaled party in session
    expect(session.battle.trainerParty.length).toBe(2);
    expect(session.battle.trainerParty[0].level).toBe(25);
    expect(session.battle.trainerParty[1].level).toBe(25);

    // First mon should be counter (Squirtspell for Grammander)
    expect(session.battle.trainerParty[0].species).toBe(SPECIES.Squirtspell);
    expect(session.battle.enemyMon?.species).toBe(SPECIES.Squirtspell);
    expect(session.battle.enemyMon?.level).toBe(25);
  });
});
