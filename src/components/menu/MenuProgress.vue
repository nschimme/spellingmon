<template>
  <div class="flex flex-col gap-4">
    <h3 class="font-black uppercase text-gray-600 text-sm">
      Unlocked Areas
    </h3>
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
      <div
        v-for="i in GAME_CONSTANTS.MAX_AREAS"
        :key="i"
        :ref="el => { if (el) itemRefs[i-1] = el }"
        class="p-4 border-4 border-gray-800 rounded-xl font-bold flex justify-between items-center bg-white transition-all"
        :class="[
          playerStore.unlockedAreas.includes(i) ? 'border-green-400 bg-green-50/30' : 'text-gray-400 grayscale opacity-60',
          selectedIndex === (i-1) ? 'ring-8 ring-yellow-400 border-yellow-400 scale-[1.02] z-10' : ''
        ]"
      >
        <div class="flex flex-col">
          <span class="text-[8px] uppercase text-gray-500 opacity-70">Area {{ i }}</span>
          <span class="text-xs sm:text-sm truncate max-w-[120px]">{{ AREA_CONFIGS[i]?.name || `Area ${i}` }}</span>
        </div>
        <span
          v-if="playerStore.unlockedAreas.includes(i)"
          class="text-green-600 text-xl"
        >✓</span>
        <span
          v-else
          class="text-xl"
        >🔒</span>
      </div>
    </div>

    <div class="mt-4 p-4 bg-blue-50 border-4 border-blue-800 rounded-xl text-blue-800 text-xs font-bold uppercase leading-relaxed">
      Total Badges Earned: {{ playerStore.defeatedTrainers.length }}
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import { usePlayerStore } from '../../stores/playerStore';
import { useKeyboardNavigation } from '../../composables/useKeyboardNavigation';
import { GAME_CONSTANTS, INPUT_PRIORITIES } from '../../utils/constants';
import { AREA_CONFIGS } from '../../utils/gameData';

const playerStore = usePlayerStore();

const emit = defineEmits(['back']);
const itemRefs = ref([]);

const { selectedIndex } = useKeyboardNavigation({
  id: 'menu-progress',
  priority: INPUT_PRIORITIES.MENU + 10,
  maxIndex: computed(() => GAME_CONSTANTS.MAX_AREAS),
  onConfirm: () => {},
  onCancel: () => emit('back')
});

watch(selectedIndex, (newIdx) => {
  if (itemRefs.value[newIdx]) {
    itemRefs.value[newIdx].scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }
});
</script>
