<template>
  <div class="flex flex-col gap-4">
    <h3 class="font-black uppercase text-gray-600 text-sm">
      Unlocked Areas
    </h3>
    <div class="grid grid-cols-1 gap-2">
      <div
        v-for="i in GAME_CONSTANTS.MAX_AREAS"
        :key="i"
        class="p-4 border-4 border-gray-800 rounded-xl font-bold flex justify-between items-center bg-white"
        :class="[
          playerStore.unlockedAreas.includes(i) ? 'border-green-400' : 'text-gray-400 grayscale',
          selectedIndex === (i-1) ? 'ring-8 ring-yellow-400 border-yellow-400' : ''
        ]"
      >
        <span>Route {{ i }}</span>
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
import { computed } from 'vue';
import { usePlayerStore } from '../../stores/playerStore';
import { useKeyboardNavigation } from '../../composables/useKeyboardNavigation';
import { GAME_CONSTANTS, INPUT_PRIORITIES } from '../../utils/constants';

const playerStore = usePlayerStore();

const emit = defineEmits(['back']);

const { selectedIndex } = useKeyboardNavigation({
  id: 'menu-progress',
  priority: INPUT_PRIORITIES.MENU + 10,
  maxIndex: computed(() => GAME_CONSTANTS.MAX_AREAS),
  onConfirm: () => {},
  onCancel: () => emit('back')
});
</script>
