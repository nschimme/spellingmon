import { ref, computed, type Ref } from 'vue';
import { MapGenerator, TILE_TYPES, type MapResult } from '../utils/mapGenerator';
import { AREA_CONFIGS } from '../utils/gameData';
import { TRANSITION_TYPES } from '../utils/constants';

export function useMapManager(session: any) {
  const MAP_WIDTH = 100;
  const MAP_HEIGHT = 100;
  const currentMapData = ref<MapResult | null>(null);
  const areaConfig = computed(() => AREA_CONFIGS[session.player.currentArea]);

  const generateMap = (isTransition = false, direction: string | null = null, playerX: Ref<number>, playerY: Ref<number>) => {
    if (!session.player?.mapSeed) return;
    const gen = new MapGenerator(session.player.mapSeed, MAP_WIDTH, MAP_HEIGHT);
    currentMapData.value = gen.generate(session.player.currentArea);

    let newX = playerX.value;
    let newY = playerY.value;

    if (isTransition) {
      if (direction === 'next') {
        const entry = currentMapData.value.transitions.find(t => t.type === TRANSITION_TYPES.PREV);
        if (entry) {
          newX = entry.x;
          newY = entry.y;
        }
      } else if (direction === 'prev') {
        const entry = currentMapData.value.transitions.find(t => t.type === TRANSITION_TYPES.NEXT);
        if (entry) {
          newX = entry.x;
          newY = entry.y;
        }
      }
    } else if (session.player.position) {
      newX = session.player.position.x;
      newY = session.player.position.y;
    } else {
      const sc = currentMapData.value.spellCenter;
      if (sc) {
        newX = sc.x;
        newY = sc.y;
      }
    }

    playerX.value = newX;
    playerY.value = newY;
    session.updatePlayerPosition({ x: newX, y: newY });
  };

  const getTileType = (x: number, y: number) => {
    if (!currentMapData.value) return TILE_TYPES.WALL;
    if (x < 0 || x >= MAP_WIDTH || y < 0 || y >= MAP_HEIGHT) return TILE_TYPES.WALL;
    return currentMapData.value.map[y][x];
  };

  const getTrainerAt = (x: number, y: number) => {
    if (!currentMapData.value) return null;
    const trainer = currentMapData.value.trainers.find(t => t.x === x && t.y === y);
    if (!trainer) return null;
    const index = currentMapData.value.trainers.indexOf(trainer);
    const trainerId = `area${session.player.currentArea}_${index}`;
    if (session.player.defeatedTrainers.includes(trainerId)) return null;
    return { trainer, trainerId };
  };

  const updateDiscovery = (x: number, y: number) => {
    const RADIUS = 5;
    for (let dy = -RADIUS; dy <= RADIUS; dy++) {
      for (let dx = -RADIUS; dx <= RADIUS; dx++) {
        const tx = x + dx;
        const ty = y + dy;
        if (tx >= 0 && tx < MAP_WIDTH && ty >= 0 && ty < MAP_HEIGHT) {
          if (session.discoverTile) {
            session.discoverTile(session.currentArea, tx, ty);
          }
        }
      }
    }
  };

  return {
    MAP_WIDTH,
    MAP_HEIGHT,
    currentMapData,
    areaConfig,
    generateMap,
    getTileType,
    getTrainerAt,
    updateDiscovery
  };
}
