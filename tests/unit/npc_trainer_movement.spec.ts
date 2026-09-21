import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useSessionStore } from '../../src/stores/sessionStore';
import { useMapStore } from '../../src/stores/mapStore';
import { TILE_TYPES } from '../../src/utils/mapGenerator';
import { INTERIORS, NPC_TYPES } from '../../src/utils/constants';

describe('NPC and Trainer Movement & Dynamic Tile Checking', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('dynamically resolves NPC tile and restores former spot when NPC wanders', async () => {
    const session = useSessionStore();
    const mapStore = useMapStore();

    session.setPlayerData({ name: 'Tester' });
    session.player.mapSeed = 'npc-test-seed';
    session.player.currentInterior = INTERIORS.HOME_1F;

    await mapStore.generateMap();

    const interior = mapStore.currentMapData!.interiors![INTERIORS.HOME_1F];
    const mom = interior.npcs.find(n => n.type === NPC_TYPES.MOM)!;
    expect(mom).toBeDefined();

    const originalX = mom.x;
    const originalY = mom.y;

    // Initially, getTileType at Mom's position should be TILE_TYPES.NPC
    expect(mapStore.getTileType(originalX, originalY)).toBe(TILE_TYPES.NPC);

    // Simulate Mom wandering to an adjacent spot (e.g. x + 1)
    const newX = originalX + 1;
    const newY = originalY;
    mom.x = newX;
    mom.y = newY;

    // Mom's former spot should now return the floor tile type (e.g. EMPTY or PATH)
    const formerSpotTile = mapStore.getTileType(originalX, originalY);
    expect(formerSpotTile).not.toBe(TILE_TYPES.NPC);
    expect([TILE_TYPES.EMPTY, TILE_TYPES.PATH, TILE_TYPES.CARPET]).toContain(formerSpotTile);

    // Mom's new spot should now return TILE_TYPES.NPC
    expect(mapStore.getTileType(newX, newY)).toBe(TILE_TYPES.NPC);
  });

  it('dynamically resolves Trainer tile and preserves underlying terrain', async () => {
    const session = useSessionStore();
    const mapStore = useMapStore();

    session.setPlayerData({ name: 'Tester' });
    session.player.mapSeed = 'trainer-test-seed';
    session.player.currentInterior = null;

    await mapStore.generateMap();

    const trainer = mapStore.currentMapData!.trainers[0];
    expect(trainer).toBeDefined();

    const originalX = trainer.x;
    const originalY = trainer.y;

    // Get the underlying terrain tile from map
    const underlyingTile = mapStore.currentMapData!.map[originalY][originalX];

    // Undefeated trainer resolves to TILE_TYPES.TRAINER
    expect(mapStore.getTileType(originalX, originalY)).toBe(TILE_TYPES.TRAINER);

    // Simulate trainer approaching player to new coordinates
    const approachedX = originalX + 2;
    const approachedY = originalY;
    trainer.x = approachedX;
    trainer.y = approachedY;

    // Original spot reverts to underlying terrain tile
    expect(mapStore.getTileType(originalX, originalY)).toBe(underlyingTile);

    // Approached spot resolves to TILE_TYPES.TRAINER
    expect(mapStore.getTileType(approachedX, approachedY)).toBe(TILE_TYPES.TRAINER);

    // Mark trainer defeated: approached spot now reverts to underlying terrain tile
    session.recordTrainerDefeat(trainer.trainerId);
    expect(mapStore.getTileType(approachedX, approachedY)).not.toBe(TILE_TYPES.TRAINER);
  });
});
