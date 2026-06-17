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
        class="absolute w-6 h-6 bg-red-500 rounded-full animate-ping pointer-events-none opacity-75"
        :style="{
          left: `calc(${(session.player.position.x / 100) * 100}% - 12px)`,
          top: `calc(${(session.player.position.y / 100) * 100}% - 12px)`
        }"
      />
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

<script setup>
import { ref, onMounted } from 'vue';
import { useSessionStore } from '../../stores/sessionStore';
import { useKeyboardNavigation } from '../../composables/useKeyboardNavigation';
import { GAME_CONSTANTS, TRANSITION_TYPES } from '../../utils/constants';
import { TILE_TYPES, MapGenerator } from '../../utils/mapGenerator';

const session = useSessionStore();
const mapCanvas = ref(null);

const emit = defineEmits(['back']);

useKeyboardNavigation({
  id: 'menu-map',
  maxIndex: 0,
  onConfirm: () => {},
  onCancel: () => emit('back')
});

const drawMap = () => {
  if (!mapCanvas.value) return;
  const ctx = mapCanvas.value.getContext('2d');
  const discovered = new Set(session.dex.discoveredTiles[session.player.currentArea] || []);

  const MAP_SIZE = 100;
  ctx.fillStyle = '#111827'; // bg-gray-900
  ctx.fillRect(0, 0, MAP_SIZE, MAP_SIZE);

  const gen = new MapGenerator(session.player.mapSeed, MAP_SIZE, MAP_SIZE);
  const mapData = gen.generate(session.player.currentArea);

  ctx.font = '8px serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  for (let y = 0; y < MAP_SIZE; y++) {
    for (let x = 0; x < MAP_SIZE; x++) {
      if (!discovered.has(`${x},${y}`)) continue;

      const type = mapData.map[y][x];

      if (type === TILE_TYPES.PATH) {
        ctx.fillStyle = '#e5e7eb';
        ctx.fillRect(x, y, 1, 1);
      } else if (type === TILE_TYPES.EMPTY) {
        ctx.fillStyle = '#9ca3af';
        ctx.fillRect(x, y, 1, 1);
      } else if (type === TILE_TYPES.GRASS) {
        ctx.fillText('🌿', x, y);
      } else if (type === TILE_TYPES.SPELL_CENTER) {
        ctx.fillText('🏥', x, y);
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
  ctx.fillStyle = '#ef4444';
  ctx.fillRect(session.player.position.x, session.player.position.y, 1, 1);
};

onMounted(() => {
  setTimeout(drawMap, 0);
});
</script>
