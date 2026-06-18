<template>
  <div class="space-y-6">
    <div
      v-for="i in GAME_CONSTANTS.MAX_AREAS"
      :key="i"
      :ref="el => { if (el) itemRefs[i-1] = el }"
      class="bg-white border-4 p-4 rounded-2xl shadow-md transition-all"
      :class="[
        session.player.unlockedAreas.includes(i) ? 'border-gray-800' : 'border-gray-300 opacity-60 grayscale',
        selectedIndex === i-1 ? 'ring-8 ring-yellow-400 scale-[1.02]' : ''
      ]"
    >
      <div class="flex justify-between items-start mb-2">
        <div class="flex flex-col">
          <span class="text-[8px] text-gray-500 opacity-70">{{ $t('menu.area', { n: i }) }}</span>
          <h4 class="font-black text-gray-800 leading-tight">
            {{ session.player.unlockedAreas.includes(i) ? $t('menu.areaNames.' + i) : $t('menu.locked') }}
          </h4>
        </div>
        <div
          v-if="session.player.unlockedAreas.includes(i)"
          class="text-2xl"
        >
          {{ getAreaBadge(i) }}
        </div>
      </div>

      <div
        v-if="session.player.unlockedAreas.includes(i)"
        class="space-y-3"
      >
        <div class="flex justify-between text-[10px] font-bold text-gray-600">
          <span>{{ $t('menu.wordsMastered') }}</span>
          <span>{{ (session.dex.masteredWords[i] || []).length }} / 40</span>
        </div>
        <div class="w-full bg-gray-200 h-3 border-2 border-gray-800 rounded-full overflow-hidden">
          <div
            class="h-full bg-green-500 transition-all duration-500"
            :style="{ width: `${((session.dex.masteredWords[i] || []).length / 40) * 100}%` }"
          />
        </div>
      </div>
      <div
        v-else
        class="text-[9px] font-bold text-gray-400 italic"
      >
        {{ $t('menu.discoverToUnlock') }}
      </div>
    </div>

    <!-- Global Stats Summary -->
    <div class="mt-4 p-4 bg-blue-50 border-4 border-blue-800 rounded-xl text-blue-800 text-xs font-bold leading-relaxed">
      <div class="flex justify-between mb-1">
        <span>{{ $t('menu.globalProgress') }}</span>
        <span>{{ Math.round(globalProgress) }}%</span>
      </div>
      <div class="w-full bg-blue-200 h-2 rounded-full overflow-hidden">
        <div
          class="h-full bg-blue-600"
          :style="{ width: `${globalProgress}%` }"
        />
      </div>
      <div class="mt-3 text-center">
        {{ $t('menu.badgesEarned', { n: totalBadges }) }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useSessionStore } from '../../stores/sessionStore';
import { useKeyboardNavigation } from '../../composables/useKeyboardNavigation';
import { GAME_CONSTANTS } from '../../utils/constants';

const session = useSessionStore();
const itemRefs = ref<any[]>([]);

const emit = defineEmits(['back']);

const globalProgress = computed(() => {
  let totalMastered = 0;
  for (let i = 1; i <= GAME_CONSTANTS.MAX_AREAS; i++) {
    totalMastered += (session.dex.masteredWords[i] || []).length;
  }
  return (totalMastered / (GAME_CONSTANTS.MAX_AREAS * 40)) * 100;
});

const totalBadges = computed(() => {
  return Object.keys(session.dex.masteredWords).filter(area => (session.dex.masteredWords[area] || []).length >= 40).length;
});

const getAreaBadge = (area) => {
  const masteredCount = (session.dex.masteredWords[area] || []).length;
  if (masteredCount >= 40) return '🏆';
  if (masteredCount >= 20) return '🥈';
  if (masteredCount > 0) return '🥉';
  return '🌑';
};

const { selectedIndex } = useKeyboardNavigation({
  id: 'menu-progress',
  maxIndex: GAME_CONSTANTS.MAX_AREAS,
  onConfirm: () => {},
  onCancel: () => emit('back')
});

watch(selectedIndex, (newIdx) => {
  const el = itemRefs.value[newIdx];
  if (el) {
    el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }
});
</script>
