import { ref, computed, watch } from 'vue';
import { MapGenerator, TILE_TYPES } from '../utils/mapGenerator';
import { AREA_CONFIGS } from '../utils/gameData';
import { TRANSITION_TYPES } from '../utils/constants';

export function useMapManager(playerStore) {
  const MAP_WIDTH = 100;
  const MAP_HEIGHT = 100;
  const currentMapData = ref(null);
  const areaConfig = computed(() => AREA_CONFIGS[playerStore.currentArea]);

  const generateMap = (isTransition = false, direction = null, playerX, playerY) => {
    const gen = new MapGenerator(playerStore.mapSeed, MAP_WIDTH, MAP_HEIGHT);
    currentMapData.value = gen.generate(playerStore.currentArea);

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
    } else if (playerStore.position && (playerStore.position.x !== 5 || playerStore.position.y !== 5)) {
      newX = playerStore.position.x;
      newY = playerStore.position.y;
    } else {
      const sc = currentMapData.value.spellCenter;
      if (sc) {
        newX = sc.x;
        newY = sc.y;
      }
    }

    playerX.value = newX;
    playerY.value = newY;
    playerStore.updatePosition({ x: newX, y: newY });
  };

  const getTileType = (x, y) => {
    if (!currentMapData.value) return TILE_TYPES.WALL;
    if (x < 0 || x >= MAP_WIDTH || y < 0 || y >= MAP_HEIGHT) return TILE_TYPES.WALL;
    return currentMapData.value.map[y][x];
  };

  const getTrainerAt = (x, y) => {
    if (!currentMapData.value) return null;
    const trainer = currentMapData.value.trainers.find(t => t.x === x && t.y === y);
    if (!trainer) return null;
    const index = currentMapData.value.trainers.indexOf(trainer);
    const trainerId = `area${playerStore.currentArea}_${index}`;
    if (playerStore.defeatedTrainers.includes(trainerId)) return null;
    return { trainer, trainerId };
  };

  const updateDiscovery = (x, y) => {
    const RADIUS = 2;
    for (let dy = -RADIUS; dy <= RADIUS; dy++) {
      for (let dx = -RADIUS; dx <= RADIUS; dx++) {
        const tx = x + dx;
        const ty = y + dy;
        if (tx >= 0 && tx < MAP_WIDTH && ty >= 0 && ty < MAP_HEIGHT) {
          playerStore.discoverTile(playerStore.currentArea, tx, ty);
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
