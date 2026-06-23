<template>
  <div class="flex flex-col gap-4 items-center h-full overflow-hidden">
    <div class="relative bg-gray-900 w-full aspect-square max-w-[500px] border-8 border-gray-800 rounded-2xl overflow-hidden flex items-center justify-center shadow-inner shrink-0">
      <canvas
        ref="mapCanvas"
        width="100"
        height="100"
        class="w-full h-full image-pixelated bg-gray-800"
        data-testid="map-canvas"
      />
      <!-- Player pulse indicator -->
      <div
        v-if="session.player.position"
        class="absolute w-6 h-6 bg-red-500 rounded-full animate-ping pointer-events-none opacity-75"
        :style="{
          left: `calc(${(session.player.position.x / mapSizeX) * 100}% - 12px)`,
          top: `calc(${(session.player.position.y / mapSizeY) * 100}% - 12px)`
        }"
      />
      <div
        v-if="session.player.currentInterior"
        class="absolute top-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-[10px] font-bold uppercase"
      >
        {{ $t(currentInteriorData?.name || '') }} {{ session.player.currentInterior.includes('2f') ? '2F' : (session.player.currentInterior.includes('1f') ? '1F' : '') }}
      </div>
    </div>

    <div class="w-full mt-4">
      <h3 class="font-black uppercase text-gray-800 mb-2 text-sm">
        {{ $t('menu.map') }}
      </h3>
      <div class="flex gap-2 justify-between items-center bg-gray-200 p-4 rounded-xl border-4 border-gray-800">
        <div
          v-for="i in GAME_CONSTANTS.MAX_AREAS"
          :key="i"
          class="flex flex-col items-center"
        >
          <div
            class="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold border-2 border-gray-800 shadow-sm text-xs sm:text-base"
            :class="session.player.currentArea === i ? 'bg-blue-500 text-white' : (session.player.unlockedAreas.includes(i) ? 'bg-green-400' : 'bg-gray-400')"
          >
            {{ i }}
          </div>
          <div
            v-if="i < GAME_CONSTANTS.MAX_AREAS"
            class="h-0.5 w-2 sm:w-4 bg-gray-800"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useSessionStore } from '../../stores/sessionStore';
import { useKeyboardNavigation } from '../../composables/useKeyboardNavigation';
import { GAME_CONSTANTS, TRANSITION_TYPES } from '../../utils/constants';
import { TILE_TYPES } from '../../utils/mapGenerator';

import { useMapStore } from '../../stores/mapStore';

const session = useSessionStore();
const mapStore = useMapStore();
const mapCanvas = ref<HTMLCanvasElement | null>(null);

const emit = defineEmits(['back']);

const currentMapData = computed(() => mapStore.currentMapData);

const currentInteriorData = computed(() => {
  if (!session.player.currentInterior || !currentMapData.value?.interiors) return null;
  return currentMapData.value.interiors[session.player.currentInterior];
});

const mapSizeX = computed(() => currentInteriorData.value ? currentInteriorData.value.map[0].length : 100);
const mapSizeY = computed(() => currentInteriorData.value ? currentInteriorData.value.map.length : 100);

useKeyboardNavigation({
  id: 'menu-map',
  maxIndex: 0,
  onConfirm: () => {},
  onCancel: () => emit('back')
});

const drawMap = () => {
  if (!mapCanvas.value || !currentMapData.value) return;
  const ctx = mapCanvas.value.getContext('2d');
  if (!ctx) return;

  const mapData = currentMapData.value;
  const interior = session.player.currentInterior ? mapData.interiors?.[session.player.currentInterior] : null;
  const map = interior ? interior.map : mapData.map;
  const w = map[0].length;
  const h = map.length;

  const CANVAS_RES = 500; // Fixed resolution for better rendering
  mapCanvas.value.width = CANVAS_RES;
  mapCanvas.value.height = CANVAS_RES;

  const tileSize = CANVAS_RES / Math.max(w, h);
  const offsetX = (CANVAS_RES - w * tileSize) / 2;
  const offsetY = (CANVAS_RES - h * tileSize) / 2;

  ctx.fillStyle = '#111827';
  ctx.fillRect(0, 0, CANVAS_RES, CANVAS_RES);

  const discovered = new Set(session.dex.discoveredTiles[session.player.currentArea] || []);

  ctx.font = `${Math.floor(tileSize * 0.8)}px serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (!interior && !discovered.has(`${x},${y}`)) continue;

      const type = map[y][x];
      const drawX = offsetX + x * tileSize + tileSize / 2;
      const drawY = offsetY + y * tileSize + tileSize / 2;
      const rectX = offsetX + x * tileSize;
      const rectY = offsetY + y * tileSize;

      if (type === TILE_TYPES.PATH || type === TILE_TYPES.EMPTY || type === TILE_TYPES.NPC) {
        ctx.fillStyle = type === TILE_TYPES.PATH ? '#e5e7eb' : (type === TILE_TYPES.NPC ? '#d1d5db' : '#374151');
        ctx.fillRect(rectX, rectY, tileSize, tileSize);
      } else if (type === TILE_TYPES.WALL || type === TILE_TYPES.CAVE_WALL) {
        ctx.fillStyle = type === TILE_TYPES.WALL ? '#1f2937' : '#451a03';
        ctx.fillRect(rectX, rectY, tileSize, tileSize);
      } else if (type === TILE_TYPES.GRASS) {
        ctx.fillText('🌿', drawX, drawY);
      } else if (type === TILE_TYPES.SPELL_CENTER) {
        ctx.fillText('🏥', drawX, drawY);
      } else if (type === TILE_TYPES.BUILDING) {
        ctx.fillText('🏠', drawX, drawY);
      } else if (type === TILE_TYPES.STAIRS_UP) {
        ctx.fillText('🔼', drawX, drawY);
      } else if (type === TILE_TYPES.STAIRS_DOWN) {
        ctx.fillText('🔽', drawX, drawY);
      } else if (type === TILE_TYPES.CARPET) {
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(rectX, rectY, tileSize, tileSize);
      } else if (type === TILE_TYPES.TRANSITION) {
        const transition = mapData.transitions.find(t => t.x === x && t.y === y);
        if (transition?.type === TRANSITION_TYPES.NEXT) {
          ctx.fillText('🔼', x, y);
        } else {
          ctx.fillText('🔽', x, y);
        }
      }
    }
  }

  // Draw player
  if (session.player.position) {
    ctx.fillStyle = '#ef4444';
        const pX = offsetX + session.player.position.x * tileSize;
        const pY = offsetY + session.player.position.y * tileSize;
        ctx.fillRect(pX, pY, tileSize, tileSize);
  }
};

onMounted(() => {
  setTimeout(drawMap, 0);
});
</script>
