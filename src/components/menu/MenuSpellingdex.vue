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
        <div class="bg-gray-700 px-2 py-1 rounded text-[8px] font-bold text-gray-300">
          {{ discoveredCount }} / 40
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
      class="grid grid-cols-1 gap-2"
    >
      <div
        v-for="(word, index) in areaWords"
        :key="word.term"
        :ref="el => { if (el) itemRefs[index] = el }"
        class="group relative overflow-hidden bg-white border-4 p-3 rounded-xl transition-all"
        :class="[
          isMastered(word.term) ? 'border-green-500 shadow-md' : (isDiscovered(word.term) ? 'border-gray-400' : 'border-gray-200 opacity-40'),
          selectedIndex === index ? 'ring-8 ring-yellow-400 border-yellow-400' : ''
        ]"
      >
        <div class="flex items-center justify-between gap-4">
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2">
              <span class="font-black text-sm tracking-tight">
                {{ isDiscovered(word.term) ? word.term : '???' }}
              </span>
              <span
                v-if="isMastered(word.term)"
                class="text-green-500"
              >✅</span>
            </div>
            <p
              v-if="isMastered(word.term)"
              class="text-[9px] text-gray-500 font-bold leading-tight mt-1 line-clamp-2"
            >
              {{ word.definition }}
            </p>
          </div>
          <div class="text-xs">
            {{ isDiscovered(word.term) ? word.emoji : '❓' }}
          </div>
        </div>

        <!-- Progress Mini-Bar (if discovered but not mastered) -->
        <div
          v-if="isDiscovered(word.term) && !isMastered(word.term)"
          class="mt-2 w-full bg-gray-100 h-1 rounded-full overflow-hidden"
        >
          <div class="h-full bg-blue-400 w-1/2" />
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

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useSessionStore } from '../../stores/sessionStore';
import { useKeyboardNavigation } from '../../composables/useKeyboardNavigation';
import { audio } from '../../utils/audio';
import { SOUND_EFFECTS } from '../../utils/constants';

const session = useSessionStore();
const currentArea = ref(session.player.currentArea);
const areaWords = ref([]);
const loading = ref(false);
const itemRefs = ref([]);

const emit = defineEmits(['back']);

const discoveredCount = computed(() => (session.dex.discoveredWords[currentArea.value] || []).length);
const masteredCount = computed(() => (session.dex.masteredWords[currentArea.value] || []).length);

const isDiscovered = (term) => (session.dex.discoveredWords[currentArea.value] || []).includes(term);
const isMastered = (term) => (session.dex.masteredWords[currentArea.value] || []).includes(term);

const fetchWords = async () => {
  loading.value = true;
  try {
    const response = await fetch(`./vocab/${session.locale}/area${currentArea.value}.json`);
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

const { selectedIndex, reset } = useKeyboardNavigation({
  id: 'menu-spellingdex',
  maxIndex: () => areaWords.value.length,
  onConfirm: () => {},
  onCancel: () => emit('back'),
  onLeft: () => prevArea(),
  onRight: () => nextArea()
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
