<template>
  <div class="flex flex-col gap-6 max-w-2xl mx-auto">
    <div class="bg-blue-50 p-4 rounded-2xl border-4 border-blue-200">
      <div class="flex justify-end items-center mb-4">
        <div class="text-right">
          <div class="text-[10px] font-bold text-blue-600 uppercase">
            Global Progress
          </div>
          <div class="text-lg font-black text-blue-800">
            {{ totalMastered }} / {{ totalWords }}
          </div>
        </div>
      </div>
      <div class="w-full bg-blue-200 h-4 rounded-full border-2 border-blue-300 overflow-hidden">
        <div
          class="bg-blue-600 h-full transition-all duration-1000"
          :style="{ width: `${(totalMastered / totalWords) * 100}%` }"
        />
      </div>
    </div>

    <div
      v-for="area in GAME_CONSTANTS.MAX_AREAS"
      :key="area"
      class="bg-white border-4 border-gray-800 rounded-3xl overflow-hidden shadow-sm"
    >
      <div class="bg-gray-800 p-3 flex justify-between items-center">
        <h3 class="font-black uppercase text-white text-sm tracking-widest">
          {{ AREA_CONFIGS[area]?.name || `Area ${area}` }}
        </h3>
        <div class="flex gap-3 items-center">
          <div class="bg-gray-700 px-2 py-1 rounded text-[8px] font-bold text-gray-300 uppercase">
            Seen: {{ playerStore.discoveredWords[area]?.length || 0 }}
          </div>
          <div class="bg-green-600 px-2 py-1 rounded text-[8px] font-bold text-white uppercase shadow-inner">
            Mastered: {{ playerStore.masteredWords[area]?.length || 0 }}
          </div>
        </div>
      </div>

      <div class="p-4">
        <div
          v-if="playerStore.unlockedAreas.includes(area)"
          class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2"
        >
          <div
            v-for="(word, idx) in vocabStore.vocabData[area] || []"
            :key="idx"
            class="group relative p-3 border-2 rounded-xl text-xs font-black uppercase text-center transition-all duration-200"
            :class="getWordDexClass(area, word.word)"
          >
            {{ getWordDexDisplay(area, word.word) }}
            <div
              v-if="isMastered(area, word.word)"
              class="absolute -top-1 -right-1 bg-yellow-400 text-[8px] w-4 h-4 flex items-center justify-center rounded-full border border-gray-800 shadow-sm"
            >
              ★
            </div>
          </div>
          <div
            v-if="!vocabStore.vocabData[area]"
            class="col-span-full text-center py-6 text-gray-400 text-xs italic"
          >
            Loading word list...
          </div>
        </div>
        <div
          v-else
          class="py-12 flex flex-col items-center justify-center gap-3 opacity-30 grayscale"
        >
          <span class="text-4xl">🔒</span>
          <span class="font-black text-xs text-gray-500 uppercase tracking-widest text-center">
            Area Information Locked<br>
            <span class="text-[10px] font-bold">Discover this route to unlock</span>
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, computed } from 'vue';
import { usePlayerStore } from '../../stores/playerStore';
import { useVocabStore } from '../../stores/vocabStore';
import { useKeyboardNavigation } from '../../composables/useKeyboardNavigation';
import { GAME_CONSTANTS, INPUT_PRIORITIES } from '../../utils/constants';
import { AREA_CONFIGS } from '../../utils/gameData';

const playerStore = usePlayerStore();
const vocabStore = useVocabStore();

const emit = defineEmits(['back']);

useKeyboardNavigation({
  id: 'menu-spellingdex',
  priority: INPUT_PRIORITIES.MENU + 10,
  maxIndex: 0,
  onConfirm: () => {},
  onCancel: () => emit('back')
});

const totalWords = computed(() => {
  return Object.values(vocabStore.vocabData).reduce((sum, words) => sum + words.length, 0) || 1;
});

const totalMastered = computed(() => {
  return Object.values(playerStore.masteredWords).reduce((sum, words) => sum + words.length, 0);
});

const isMastered = (area, word) => {
  const mastered = playerStore.masteredWords[area] || [];
  return mastered.includes(word.toLowerCase().trim());
};

const getWordDexDisplay = (area, word) => {
  const mastered = playerStore.masteredWords[area] || [];
  const discovered = playerStore.discoveredWords[area] || [];
  const normalized = word.toLowerCase().trim();

  if (mastered.includes(normalized) || discovered.includes(normalized)) return word;
  return '••••••';
};

const getWordDexClass = (area, word) => {
  const mastered = playerStore.masteredWords[area] || [];
  const discovered = playerStore.discoveredWords[area] || [];
  const normalized = word.toLowerCase().trim();

  if (mastered.includes(normalized)) return 'bg-green-50 border-green-400 text-green-700 shadow-sm scale-105 z-10';
  if (discovered.includes(normalized)) return 'bg-gray-100 border-gray-300 text-gray-500';
  return 'bg-gray-50 border-dashed border-gray-200 text-gray-300';
};

onMounted(() => {
  // Load vocab for ALL areas to calculate total progress correctly
  for (let i = 1; i <= GAME_CONSTANTS.MAX_AREAS; i++) {
    vocabStore.loadVocab(i);
  }
});
</script>
