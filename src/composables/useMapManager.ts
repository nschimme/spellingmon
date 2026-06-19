import { computed } from 'vue';
import { useMapStore } from '../stores/mapStore';
import { AREA_CONFIGS } from '../utils/gameData';

export function useMapManager(session: any) {
  const mapStore = useMapStore();
  const MAP_WIDTH = computed(() => mapStore.MAP_WIDTH);
  const MAP_HEIGHT = computed(() => mapStore.MAP_HEIGHT);
  const currentMapData = computed(() => mapStore.currentMapData);
  const areaConfig = computed(() => AREA_CONFIGS[session.player.currentArea]);

  const generateMap = async (isTransition = false, direction: 'next' | 'prev' | null = null) => {
    return await mapStore.generateMap(isTransition, direction);
  };

  const getTileType = (x: number, y: number) => {
    return mapStore.getTileType(x, y);
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
    mapStore.updateDiscovery(x, y);
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
