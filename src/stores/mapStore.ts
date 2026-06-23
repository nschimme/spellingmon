import { defineStore } from 'pinia';
import { ref } from 'vue';
import { MapGenerator, type MapResult } from '../utils/mapGenerator';
import { useSessionStore } from './sessionStore';

export const useMapStore = defineStore('map', () => {
  const session = useSessionStore();
  const currentMapData = ref<MapResult | null>(null);
  const isLoading = ref(false);

  const MAP_WIDTH = 100;
  const MAP_HEIGHT = 100;

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
          newX = entry.x;
          newY = entry.y;
          session.player.currentInterior = null;
        }
      } else if (direction === 'prev') {
        const entry = result.transitions.find(t => (t as any).type === 'next');
        if (entry) {
          newX = entry.x;
          newY = entry.y;
          session.player.currentInterior = null;
        }
      }
    }

    session.updatePlayerPosition({ x: newX, y: newY });

    // Update last spell center for respawning
    if (result.spellCenter) {
      session.player.lastSpellCenter = {
        x: 4, // Default center inside SC
        y: 4,
        interior: 'spelling_center',
        floor: null
      } as any;
    }

    updateDiscovery(newX, newY);

    isLoading.value = false;
    return result;
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
