import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useSessionStore } from '../../src/stores/sessionStore';
import { ACTION_COSTS, STATUS_CONDITIONS } from '../../src/utils/constants';
import { useTrainerAI } from '../../src/composables/useTrainerAI';
import { ref } from 'vue';

describe('Engine Pulse System & Action Costs', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('increments monotonic pulse counter on advancePulse', () => {
    const session = useSessionStore();
    expect(session.player.pulse).toBe(0);

    session.advancePulse(ACTION_COSTS.STANDARD);
    expect(session.player.pulse).toBe(1);

    session.advancePulse(ACTION_COSTS.ROUGH_TERRAIN);
    expect(session.player.pulse).toBe(3);
  });

  it('notifies registered pulse subscribers', () => {
    const session = useSessionStore();
    const subscriber = vi.fn();

    const unsubscribe = session.subscribePulse(subscriber);

    session.advancePulse(ACTION_COSTS.STANDARD);
    expect(subscriber).toHaveBeenCalledWith(1, ACTION_COSTS.STANDARD);

    session.advancePulse(ACTION_COSTS.ROUGH_TERRAIN);
    expect(subscriber).toHaveBeenCalledWith(3, ACTION_COSTS.ROUGH_TERRAIN);

    unsubscribe();
    session.advancePulse(ACTION_COSTS.STANDARD);
    expect(subscriber).toHaveBeenCalledTimes(2);
  });

  it('triggers poison damage on 4-pulse boundary crossings', () => {
    const session = useSessionStore();
    session.player.party = [{
      id: 'mon_1',
      species: 'Grammander',
      hp: 10,
      maxHp: 10,
      status: STATUS_CONDITIONS.POISON,
      stages: { atk: 0, def: 0, spa: 0, spd: 0, spe: 0 }
    } as any];

    // Pulses 1, 2, 3: no damage
    session.advancePulse(1);
    session.advancePulse(1);
    session.advancePulse(1);
    expect(session.player.party[0].hp).toBe(10);

    // Pulse 4: damage triggered!
    session.advancePulse(1);
    expect(session.player.party[0].hp).toBe(9);

    // Pulse 6 (crossing from 4 to 6 via cost=2): no new boundary crossed
    session.advancePulse(2);
    expect(session.player.party[0].hp).toBe(9);

    // Pulse 8 (crossing from 6 to 8 via cost=2): damage triggered!
    session.advancePulse(2);
    expect(session.player.party[0].hp).toBe(8);
  });

  it('ignores free actions with cost 0', () => {
    const session = useSessionStore();
    const subscriber = vi.fn();
    session.subscribePulse(subscriber);

    session.advancePulse(ACTION_COSTS.FREE);
    expect(session.player.pulse).toBe(0);
    expect(subscriber).not.toHaveBeenCalled();
  });

  it('advances fleeing trainers step-by-step on engine pulses', () => {
    const session = useSessionStore();
    const mockFSM = { matches: () => true };
    const mapData = ref({
      map: [
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0]
      ],
      trainers: []
    });
    const playerX = ref(0);
    const playerY = ref(0);
    const getTileType = () => 0;
    const getTrainerId = (t: any) => t.id;

    const { startTrainerFleeing, fleeingTrainers } = useTrainerAI(
      session,
      mockFSM,
      mapData as any,
      playerX,
      playerY,
      getTileType,
      getTrainerId
    );

    const mockTrainer = {
      id: 'trainer_1',
      x: 1,
      y: 1,
      direction: 'down'
    };

    startTrainerFleeing(mockTrainer, 'trainer_1');
    expect(fleeingTrainers.value.length).toBe(1);

    const initialX = fleeingTrainers.value[0].x;
    const initialY = fleeingTrainers.value[0].y;

    // Advance 1 pulse: trainer takes 1 step along flee path
    session.advancePulse(ACTION_COSTS.STANDARD);

    const steppedX = fleeingTrainers.value[0]?.x ?? initialX;
    const steppedY = fleeingTrainers.value[0]?.y ?? initialY;
    const moved = (steppedX !== initialX) || (steppedY !== initialY);
    expect(moved).toBe(true);
  });
});
