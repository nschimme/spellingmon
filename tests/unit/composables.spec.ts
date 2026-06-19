import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ref } from 'vue';
import { createPinia, setActivePinia } from 'pinia';
import { useMapStore } from '../../src/stores/mapStore';
import { useSessionStore } from '../../src/stores/sessionStore';
import { useMapManager } from '../../src/composables/useMapManager';
import { useTrainerAI } from '../../src/composables/useTrainerAI';
import { usePlayerMovement } from '../../src/composables/usePlayerMovement';
import { TILE_TYPES } from '../../src/utils/mapGenerator';

describe('useMapManager', () => {
  let session;

  beforeEach(() => {
    setActivePinia(createPinia());
    const sessionStore = useSessionStore();
    sessionStore.player.mapSeed = 'test-seed';
    sessionStore.updatePlayerPosition = vi.fn();
    sessionStore.discoverTile = vi.fn();

    session = sessionStore;
  });

  it('generates map and updates position', async () => {
    const { generateMap, currentMapData } = useMapManager(session);

    await generateMap(false, null);

    expect(currentMapData.value).toBeDefined();
    expect(session.updatePlayerPosition).toHaveBeenCalled();
  });

  it('updates discovery radius and bounds', async () => {
    const mapStore = useMapStore();
    await mapStore.generateMap();
    const { updateDiscovery } = useMapManager(session);
    (session.discoverTile as any).mockClear();
    updateDiscovery(10, 10);

    // Radius 5 means -5 to +5 = 11 tiles wide, so 11*11 = 121
    expect(session.discoverTile).toHaveBeenCalled();

    const calls = (session.discoverTile as any).mock.calls;
    for (const [area, x, y] of calls) {
      expect(area).toBe(session.player.currentArea);
      expect(Math.abs(x - 10)).toBeLessThanOrEqual(5);
      expect(Math.abs(y - 10)).toBeLessThanOrEqual(5);
      expect(x).toBeGreaterThanOrEqual(0);
      expect(y).toBeGreaterThanOrEqual(0);
      expect(x).toBeLessThan(100);
      expect(y).toBeLessThan(100);
    }
  });

  it('never calls session.discoverTile with out-of-bounds coordinates near map edges', async () => {
    const mapStore = useMapStore();
    await mapStore.generateMap();
    const { updateDiscovery } = useMapManager(session);
    (session.discoverTile as any).mockClear();

    // Place player at (0,0)
    updateDiscovery(0, 0);

    const calls = (session.discoverTile as any).mock.calls;
    for (const [, x, y] of calls) {
      expect(x).toBeGreaterThanOrEqual(0);
      expect(y).toBeGreaterThanOrEqual(0);
      expect(x).toBeLessThan(100);
      expect(y).toBeLessThan(100);
    }
  });
});

describe('useTrainerAI', () => {
  let session, fsm, currentMapData;

  beforeEach(() => {
    session = {
      player: {
        currentArea: 1,
        defeatedTrainers: [],
      },
      notify: vi.fn()
    };
    fsm = { matches: vi.fn().mockImplementation((state) => state === 'PLAY.WORLD') };
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

    const { checkTrainerLOS } = useTrainerAI(session, fsm, currentMapData, playerX, playerY, getTileType);

    const result = checkTrainerLOS(new Set());
    expect(result).not.toBeNull();
    expect(result.trainer.name).toBe('Trainer Red');
  });

  it('ignores trainer with obstacle', () => {
    const playerX = ref(15);
    const playerY = ref(10);
    const getTileType = (x, y) => (x === 12) ? TILE_TYPES.WALL : TILE_TYPES.EMPTY;

    const { checkTrainerLOS } = useTrainerAI(session, fsm, currentMapData, playerX, playerY, getTileType);

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
