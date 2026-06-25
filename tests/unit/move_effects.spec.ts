import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useGameFSM } from '../../src/stores/gameFSM';
import { useSessionStore } from '../../src/stores/sessionStore';
import { GAME_STATES, STATUS_CONDITIONS } from '../../src/utils/constants';
import { SPECIES, createMon } from '../../src/utils/gameData';
import i18n from '../../src/i18n';

describe('FSM Move Effects Integration', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('applies confusion and self-damage correctly', async () => {
    const fsm = useGameFSM();
    const session = useSessionStore();
    const { t } = i18n.global;
    const mon = createMon(SPECIES.Grammander, 10);
    session.player.party = [mon];
    session.battle.enemyMon = createMon(SPECIES.Verminverb, 10);
    session.battle.playerMonId = mon.id;
    mon.confusionTurns = 5;
    const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0.1);
    await fsm.transition(GAME_STATES.BATTLE_PLAYER_ATTACK, { isCorrect: true });
    const expectedConfusedMsg = t('battle.isConfused', { name: t('monsters.' + mon.species) });
    const expectedHurtSelfMsg = t('battle.hurtSelf');
    expect(session.battle.log).toContain(expectedConfusedMsg);
    expect(session.battle.log).toContain(expectedHurtSelfMsg);
    expect(mon.hp).toBeLessThan(mon.maxHp);
    randomSpy.mockRestore();
  });

  it('handles overworld poison damage and whiteout', async () => {
    const fsm = useGameFSM();
    const session = useSessionStore();
    const mon = createMon(SPECIES.Grammander, 10);
    session.player.party = [mon];
    mon.hp = 2;
    mon.status = STATUS_CONDITIONS.POISON;
    session.player.position = { x: 10, y: 10 };
    session.player.steps = 0;
    for(let i=1; i<=4; i++) {
        session.player.steps++;
        if (session.player.steps % 4 === 0) {
            session.applyOverworldDamage();
        }
    }
    expect(mon.hp).toBe(1);
    mon.hp = 0;
    await fsm.transition(GAME_STATES.MOVING, { duration: 0 });
    await new Promise(r => setTimeout(r, 10));
    expect(fsm.matches(GAME_STATES.BATTLE_WHITED_OUT)).toBe(true);
  });
});
