import { defineStore } from 'pinia';
import { ref } from 'vue';
import { MapGenerator, type MapResult, TILE_TYPES } from '../utils/mapGenerator';
import { useSessionStore } from './sessionStore';
import { INTERIORS, GAME_CONSTANTS } from '../utils/constants';

export const useMapStore = defineStore('map', () => {
  const session = useSessionStore();
  const currentMapData = ref<MapResult | null>(null);
  const isLoading = ref(false);

  const MAP_WIDTH = GAME_CONSTANTS.MAP_WIDTH;
  const MAP_HEIGHT = GAME_CONSTANTS.MAP_HEIGHT;

  let lastSeed: string | null = null;
  let lastArea: number | null = null;

  const generateMap = async (isTransition = false, direction: 'next' | 'prev' | null = null) => {
    if (!session.player?.mapSeed) return;

    // Idempotency check: don't regenerate if same seed and area
    if (currentMapData.value && lastSeed === session.player.mapSeed && lastArea === session.player.currentArea) {
      return currentMapData.value;
    }

    isLoading.value = true;

    // Use setTimeout to yield to the UI thread if needed, though MapGenerator is synchronous
    await new Promise(resolve => setTimeout(resolve, 0));

    const gen = new MapGenerator(session.player.mapSeed, MAP_WIDTH, MAP_HEIGHT);
    const result = gen.generate(session.player.currentArea);
    currentMapData.value = result;
    lastSeed = session.player.mapSeed;
    lastArea = session.player.currentArea;

    // Handle Player Positioning
    let newX = session.player.position?.x ?? 0;
    let newY = session.player.position?.y ?? 0;

    if (isTransition) {
      if (direction === 'next') {
        const entry = result.transitions.find(t => (t as any).type === 'prev');
        if (entry) {
          // Spawn one tile away from the transition to prevent loops
          newX = entry.x;
          newY = entry.y + 1; // Transitions usually at center, move down
          if (newY >= MAP_HEIGHT) newY = entry.y - 1;
          session.player.currentInterior = null;
        }
      } else if (direction === 'prev') {
        const entry = result.transitions.find(t => (t as any).type === 'next');
        if (entry) {
          // Spawn one tile away from the transition
          newX = entry.x;
          newY = entry.y - 1; // Move up
          if (newY < 0) newY = entry.y + 1;
          session.player.currentInterior = null;
        }
      }
    }

    // Update last spell center for respawning
    if (result.spellCenter) {
      session.player.lastSpellCenter = {
        x: 4, // Default center inside SC
        y: 4,
        interior: INTERIORS.SPELLING_CENTER,
        floor: null
      } as any;
    }

    const newPos = validatePosition(newX, newY, result);
    session.updatePlayerPosition(newPos);

    updateDiscovery(newPos.x, newPos.y);

    isLoading.value = false;
    return result;
  };

  const validatePosition = (x: number, y: number, mapData: MapResult): { x: number; y: number } => {
    const interiorId = session.player.currentInterior;
    let map: number[][];
    let width: number;
    let height: number;

    if (interiorId && mapData.interiors?.[interiorId]) {
      map = mapData.interiors[interiorId].map;
      width = map[0].length;
      height = map.length;
    } else {
      map = mapData.map;
      width = MAP_WIDTH;
      height = MAP_HEIGHT;
    }

    const walkableTypes = [
      TILE_TYPES.PATH, TILE_TYPES.EMPTY, TILE_TYPES.GRASS,
      TILE_TYPES.SPELL_CENTER, TILE_TYPES.TRAINER, TILE_TYPES.TRANSITION,
      TILE_TYPES.BUILDING, TILE_TYPES.DOOR, TILE_TYPES.STAIRS_UP, TILE_TYPES.STAIRS_DOWN,
      TILE_TYPES.CARPET, TILE_TYPES.BED
    ];

    const isReachable = (tx: number, ty: number) => {
      // Find all exits/transitions in the current map/interior
      const goals: { x: number; y: number }[] = [];
      if (interiorId && mapData.interiors?.[interiorId]) {
        goals.push(...mapData.interiors[interiorId].exits);
      } else {
        goals.push(...mapData.transitions);
        if (mapData.spellCenter) goals.push(mapData.spellCenter);
      }

      if (goals.length === 0) return true; // No goals, just assume it's okay if walkable

      const queue: [number, number][] = [[tx, ty]];
      const visited = new Set([`${tx},${ty}`]);

      while (queue.length > 0) {
        const [cx, cy] = queue.shift()!;
        if (goals.some(g => g.x === cx && g.y === cy)) return true;

        const neighbors = [[cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1]];
        for (const [vx, vy] of neighbors) {
          if (vx >= 0 && vx < width && vy >= 0 && vy < height) {
            const key = `${vx},${vy}`;
            if (walkableTypes.includes(map[vy][vx]) && !visited.has(key)) {
              visited.add(key);
              queue.push([vx, vy]);
            }
          }
        }
      }
      return false;
    };

    // 1. Bounds Check
    let nx = Math.max(0, Math.min(width - 1, x));
    let ny = Math.max(0, Math.min(height - 1, y));

    // 2. Walkability & Reachability Check
    if (walkableTypes.includes(map[ny][nx]) && isReachable(nx, ny)) {
      return { x: nx, y: ny };
    }

    // 3. Spiral Search for nearest walkable AND reachable tile
    const dirs = [[0, 1], [1, 0], [0, -1], [-1, 0]];
    let step = 1;
    let dIdx = 0;
    let sx = nx;
    let sy = ny;

    for (let i = 0; i < 100; i++) { // Max search 100 tiles
      for (let j = 0; j < 2; j++) {
        for (let k = 0; k < step; k++) {
          sx += dirs[dIdx][0];
          sy += dirs[dIdx][1];
          if (sx >= 0 && sx < width && sy >= 0 && sy < height) {
            if (walkableTypes.includes(map[sy][sx]) && isReachable(sx, sy)) {
              return { x: sx, y: sy };
            }
          }
        }
        dIdx = (dIdx + 1) % 4;
      }
      step++;
    }

    return { x: nx, y: ny }; // Fallback to original (even if wall) if nothing found
  };

  const updateDiscovery = (x: number, y: number) => {
    if (!session.player) return;
    const RADIUS = 5;
    for (let dy = -RADIUS; dy <= RADIUS; dy++) {
      for (let dx = -RADIUS; dx <= RADIUS; dx++) {
        const tx = x + dx;
        const ty = y + dy;
        if (tx >= 0 && tx < MAP_WIDTH && ty >= 0 && ty < MAP_HEIGHT) {
          session.discoverTile(session.player.currentArea, tx, ty);
        }
      }
    }
  };

  const getTileType = (x: number, y: number) => {
    if (!currentMapData.value) return 2; // WALL
    const interiorId = session.player.currentInterior;
    if (interiorId && currentMapData.value.interiors?.[interiorId]) {
      const intMap = currentMapData.value.interiors[interiorId].map;
      if (y < 0 || y >= intMap.length || x < 0 || x >= intMap[0].length) return 2;
      return intMap[y][x];
    }
    if (x < 0 || x >= MAP_WIDTH || y < 0 || y >= MAP_HEIGHT) return 2;
    return currentMapData.value.map[y][x];
  };

  return {
    currentMapData,
    isLoading,
    MAP_WIDTH,
    MAP_HEIGHT,
    generateMap,
    getTileType,
    updateDiscovery
  };
});
