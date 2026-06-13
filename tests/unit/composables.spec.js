import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ref } from 'vue';
import { useMapManager } from '../../src/composables/useMapManager';
import { useTrainerAI } from '../../src/composables/useTrainerAI';
import { usePlayerMovement } from '../../src/composables/usePlayerMovement';
import { TILE_TYPES } from '../../src/utils/mapGenerator';

describe('useMapManager', () => {
  let playerStore;

  beforeEach(() => {
    playerStore = {
      currentArea: 1,
      mapSeed: 'test-seed',
      position: { x: 5, y: 5 },
      updatePosition: vi.fn(),
      discoverTile: vi.fn(),
    };
  });

  it('generates map and updates position', () => {
    const playerX = ref(0);
    const playerY = ref(0);
    const { generateMap, currentMapData } = useMapManager(playerStore);

    generateMap(false, null, playerX, playerY);

    expect(currentMapData.value).toBeDefined();
    expect(playerStore.updatePosition).toHaveBeenCalled();
  });

  it('updates discovery radius', () => {
    const { updateDiscovery } = useMapManager(playerStore);
    updateDiscovery(10, 10);

    // 11x11 radius = 121 tiles
    expect(playerStore.discoverTile).toHaveBeenCalledTimes(121);
  });
});

describe('useTrainerAI', () => {
  let playerStore, battleStore, currentMapData;

  beforeEach(() => {
    playerStore = {
      currentArea: 1,
      defeatedTrainers: [],
      notify: vi.fn()
    };
    battleStore = { inBattle: false };
    currentMapData = ref({
      trainers: [
        { x: 10, y: 10, direction: 'right', name: 'Trainer Red', dialog: 'Hello!' }
      ],
      map: Array(100).fill().map(() => Array(100).fill(TILE_TYPES.EMPTY))
    });
  });

  it('detects trainer in LOS', () => {
    const playerX = ref(12);
    const playerY = ref(10);
    const getTileType = () => TILE_TYPES.EMPTY;

    const { checkTrainerLOS } = useTrainerAI(playerStore, battleStore, currentMapData, playerX, playerY, getTileType);

    const result = checkTrainerLOS(new Set());
    expect(result).not.toBeNull();
    expect(result.trainer.name).toBe('Trainer Red');
  });

  it('ignores trainer with obstacle', () => {
    const playerX = ref(15);
    const playerY = ref(10);
    const getTileType = (x, y) => (x === 12) ? TILE_TYPES.WALL : TILE_TYPES.EMPTY;

    const { checkTrainerLOS } = useTrainerAI(playerStore, battleStore, currentMapData, playerX, playerY, getTileType);

    const result = checkTrainerLOS(new Set());
    expect(result).toBeNull();
  });
});

describe('usePlayerMovement', () => {
  it('starts and stops movement interval', () => {
    vi.useFakeTimers();
    const handleInput = vi.fn();
    const { startMovement, stopMovement } = usePlayerMovement(ref(0), ref(0), handleInput);

    startMovement('w');
    expect(handleInput).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(400); // 2 intervals (200ms default)
    expect(handleInput).toHaveBeenCalledTimes(3);

    stopMovement();
    vi.advanceTimersByTime(400);
    expect(handleInput).toHaveBeenCalledTimes(3);

    vi.useRealTimers();
  });
});
