<template>
  <div class="flex flex-col gap-4">
    <!-- Area Filter Header -->
    <div
      class="flex items-center gap-4 bg-white border-4 border-gray-800 p-4 rounded-2xl shadow-md sticky top-0 z-10"
    >
      <button
        class="text-2xl hover:scale-110 transition-transform p-2 bg-gray-100 rounded-xl"
        @click="prevArea"
      >
        ⬅️
      </button>
      <div class="flex-1 text-center">
        <div class="text-[10px] font-bold text-blue-600">
          {{ $t('menu.area', { n: currentArea }) }}
        </div>
        <h3 class="font-black text-gray-800 text-sm tracking-widest">
          {{ $t('menu.areaNames.' + currentArea) }}
        </h3>
      </div>
      <button
        class="text-2xl hover:scale-110 transition-transform p-2 bg-gray-100 rounded-xl"
        @click="nextArea"
      >
        ➡️
      </button>
    </div>

    <!-- Stats Bar -->
    <div class="grid grid-cols-2 gap-4">
      <div class="bg-gray-800 p-3 rounded-xl border-b-4 border-gray-900 flex flex-col items-center">
        <span class="text-[8px] font-bold text-gray-400 leading-none mb-1">{{ $t('menu.seen') }}</span>
        <div class="bg-blue-600 px-2 py-1 rounded text-[8px] font-bold text-white shadow-inner">
          {{ seenCount }} / 40
        </div>
      </div>
      <div class="bg-gray-800 p-3 rounded-xl border-b-4 border-gray-900 flex flex-col items-center">
        <span class="text-[8px] font-bold text-gray-400 leading-none mb-1">{{ $t('menu.mastered') }}</span>
        <div class="bg-green-600 px-2 py-1 rounded text-[8px] font-bold text-white shadow-inner">
          {{ masteredCount }} / 40
        </div>
      </div>
    </div>

    <!-- Word Grid -->
    <div
      v-if="loading"
      class="flex flex-col items-center justify-center p-12 text-gray-400 animate-pulse"
    >
      <div class="text-4xl mb-4">
        📚
      </div>
      <p class="font-bold text-xs">
        {{ $t('menu.loadingWords') }}
      </p>
    </div>

    <div
      v-else
      class="grid grid-cols-2 sm:grid-cols-4 gap-2"
    >
      <div
        v-for="(word, index) in areaWords"
        :key="word.word"
        :ref="el => { if (el) itemRefs[index] = el as HTMLElement }"
        class="group relative overflow-hidden bg-white border-4 p-2 rounded-xl transition-all flex flex-col items-center justify-center min-h-[80px]"
        :class="[
          isMastered(word.word) ? 'border-green-500 bg-green-50 shadow-md' : (isSeen(word.word) ? 'border-blue-400 bg-blue-50' : 'border-gray-200 opacity-40'),
          selectedIndex === index ? 'ring-8 ring-yellow-400 border-yellow-400 scale-105 z-10' : ''
        ]"
      >
        <div class="text-center">
          <div class="text-2xl mb-1">
            {{ isSeen(word.word) || isMastered(word.word) ? (word.emoji || '📖') : '❓' }}
          </div>
          <div class="font-black text-[10px] uppercase tracking-tighter truncate max-w-full">
            {{ isSeen(word.word) || isMastered(word.word) ? word.word : '???' }}
          </div>
          <div
            v-if="isMastered(word.word)"
            class="text-[10px] text-green-600 font-bold"
          >
            {{ $t('menu.mastered') }}
          </div>
          <div
            v-else-if="isSeen(word.word)"
            class="text-[10px] text-blue-600 font-bold"
          >
            {{ $t('menu.seen') }}
          </div>
        </div>

        <!-- Detail Tooltip (Desktop Hover) -->
        <div
          v-if="(isSeen(word.word) || isMastered(word.word)) && selectedIndex === index"
          class="absolute inset-0 bg-white/95 p-2 flex flex-col items-center justify-center text-center z-20"
        >
          <span class="font-black text-xs">{{ word.word }}</span>
          <p class="text-[8px] font-bold leading-tight mt-1 line-clamp-3">
             {{ word.definition }}
          </p>
        </div>
      </div>
    </div>

    <div
      v-if="areaWords.length === 0 && !loading"
      class="text-center py-8 text-gray-400"
    >
      <span class="font-black text-xs tracking-widest text-center">
        {{ $t('menu.locked') }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useSessionStore } from '../../stores/sessionStore';
import { useKeyboardNavigation } from '../../composables/useKeyboardNavigation';
import { audio } from '../../utils/audio';
import { SOUND_EFFECTS } from '../../utils/constants';

import { useSettingsStore } from '../../stores/settingsStore';

const session = useSessionStore();
const settings = useSettingsStore();
const currentArea = ref(session.player.currentArea);
const areaWords = ref<any[]>([]);
const loading = ref(false);
const itemRefs = ref<(HTMLElement | null)[]>([]);

const emit = defineEmits(['back']);

const seenCount = computed(() => (session.dex.discoveredWords[currentArea.value] || []).length);
const masteredCount = computed(() => (session.dex.masteredWords[currentArea.value] || []).length);

const isSeen = (term: string) => (session.dex.discoveredWords[currentArea.value] || []).includes(term);
const isMastered = (term: string) => (session.dex.masteredWords[currentArea.value] || []).includes(term);

const fetchWords = async () => {
  loading.value = true;
  try {
    const response = await fetch(`./vocab/${settings.locale}/area${currentArea.value}.json`);
    areaWords.value = await response.json();
  } catch (e) {
    console.error('Failed to load vocab', e);
    areaWords.value = [];
  } finally {
    loading.value = false;
  }
};

const nextArea = () => {
  if (currentArea.value < 9) {
    currentArea.value++;
    audio.playSound(SOUND_EFFECTS.CLICK);
    fetchWords();
    reset();
  }
};

const prevArea = () => {
  if (currentArea.value > 1) {
    currentArea.value--;
    audio.playSound(SOUND_EFFECTS.CLICK);
    fetchWords();
    reset();
  }
};

const gridCols = computed(() => window.innerWidth < 640 ? 2 : 4);

const { selectedIndex, reset } = useKeyboardNavigation({
  id: 'menu-spellingdex',
  maxIndex: () => areaWords.value.length,
  gridColumns: gridCols,
  onConfirm: () => {},
  onCancel: () => emit('back'),
  onLeft: (idx) => { if (idx % gridCols.value === 0) prevArea(); },
  onRight: (idx) => { if (idx % gridCols.value === gridCols.value - 1 || idx === areaWords.value.length - 1) nextArea(); }
});

watch(selectedIndex, (newIdx) => {
  const el = itemRefs.value[newIdx];
  if (el) {
    el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }
});

onMounted(() => {
  fetchWords();
});
</script>
