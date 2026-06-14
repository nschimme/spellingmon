<template>
  <div class="w-full h-full flex flex-col items-center justify-center bg-gray-900 p-8 relative overflow-hidden">
    <!-- Animated Background Elements -->
    <div class="absolute top-10 left-10 text-6xl opacity-20 animate-bounce">
      🔥
    </div>
    <div class="absolute bottom-20 right-20 text-6xl opacity-20 animate-pulse">
      💧
    </div>
    <div class="absolute top-1/2 left-20 text-6xl opacity-20 animate-bounce delay-700">
      🌿
    </div>

    <div class="z-10 flex flex-col items-center max-w-lg w-full">
      <div class="bg-white border-8 border-gray-800 p-4 md:p-12 rounded-[3rem] shadow-2xl transform -rotate-2 hover:rotate-0 transition-transform duration-500 w-full">
        <h1 class="text-2xl leading-none md:text-6xl font-black text-center mb-4 uppercase tracking-tight text-orange-500 drop-shadow-[4px_4px_0_rgba(0,0,0,1)]">
          SPELLINGMON
        </h1>
        <p class="text-gray-600 font-bold text-center mb-8 md:mb-12 uppercase tracking-widest text-[10px] md:text-sm">
          Gotta Spell 'Em All!
        </p>

        <div
          v-if="!showSaveOptions"
          class="space-y-4"
        >
          <button
            :class="{ 'ring-8 ring-yellow-400': !showSaveOptions && selectedIndex === 0 }"
            class="w-full bg-blue-500 hover:bg-blue-600 text-white font-black py-4 md:py-6 px-6 md:px-12 rounded-2xl border-b-8 border-blue-800 text-xl md:text-2xl uppercase tracking-widest transition-all active:border-b-0 active:translate-y-2 group"
            @click="handleInitialClick"
          >
            <span class="group-hover:scale-110 inline-block transition-transform">Start Game</span>
          </button>
        </div>

        <div
          v-else
          class="space-y-4 animate-in fade-in zoom-in duration-300"
        >
          <button
            v-if="hasSave"
            :class="{ 'ring-8 ring-yellow-400': showSaveOptions && !confirmDelete && selectedIndex === 0 }"
            class="w-full bg-green-500 hover:bg-green-600 text-white font-black py-4 rounded-xl border-b-4 border-green-800 uppercase text-sm active:translate-y-1"
            @click="handleContinue"
          >
            Continue ({{ playerName }})
          </button>
          <button
            :class="{ 'ring-8 ring-yellow-400': showSaveOptions && !confirmDelete && ((hasSave && selectedIndex === 1) || (!hasSave && selectedIndex === 0)) }"
            class="w-full bg-blue-500 hover:bg-blue-600 text-white font-black py-4 rounded-xl border-b-4 border-blue-800 uppercase text-sm active:translate-y-1"
            @click="handleNewGame"
          >
            New Game
          </button>
          <button
            v-if="hasSave"
            :class="{ 'ring-8 ring-yellow-400': showSaveOptions && !confirmDelete && selectedIndex === 2 }"
            class="w-full bg-red-500 hover:bg-red-600 text-white font-black py-4 rounded-xl border-b-4 border-red-800 uppercase text-sm active:translate-y-1"
            @click="confirmDelete = true"
          >
            Delete Save
          </button>
        </div>
      </div>

      <!-- Delete Confirmation Modal -->
      <div
        v-if="confirmDelete"
        class="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
      >
        <div class="bg-white border-8 border-gray-800 p-8 rounded-2xl max-w-sm w-full text-center">
          <p class="font-black uppercase text-red-600 mb-6">
            Delete all progress? This cannot be undone!
          </p>
          <div class="flex gap-4">
            <button
              :class="{ 'ring-8 ring-yellow-400': confirmDelete && deleteSelectedIndex === 0 }"
              class="flex-1 bg-red-500 text-white py-3 rounded-lg font-bold uppercase text-xs border-b-4 border-red-800 active:translate-y-1"
              @click="handleDelete"
            >
              Yes, Delete
            </button>
            <button
              :class="{ 'ring-8 ring-yellow-400': confirmDelete && deleteSelectedIndex === 1 }"
              class="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg font-bold uppercase text-xs border-b-4 border-gray-400 active:translate-y-1"
              @click="confirmDelete = false"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>

      <p class="mt-8 md:mt-12 text-white/50 font-bold uppercase text-[10px] tracking-widest animate-pulse">
        Press any key or click to begin
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { audio } from '../utils/audio';
import { usePlayerStore } from '../stores/playerStore';
import { useKeyboardNavigation } from '../composables/useKeyboardNavigation';
import { SOUND_EFFECTS, INPUT_PRIORITIES } from '../utils/constants';

const emit = defineEmits(['start', 'new-game', 'continue']);
const playerStore = usePlayerStore();

const showSaveOptions = ref(false);
const confirmDelete = ref(false);

const hasSave = computed(() => playerStore.characterCreationComplete);
const playerName = computed(() => playerStore.playerName);

const handleInitialClick = () => {
  audio.playSound(SOUND_EFFECTS.CLICK);
  showSaveOptions.value = true;
  reset();
};

const handleContinue = () => {
  audio.playSound(SOUND_EFFECTS.CLICK);
  emit('continue');
};

const handleNewGame = () => {
  audio.playSound(SOUND_EFFECTS.CLICK);
  if (hasSave.value) {
    playerStore.resetStore();
  }
  emit('new-game');
};

const handleDelete = () => {
  audio.playSound(SOUND_EFFECTS.FAINT);
  playerStore.resetStore();
  confirmDelete.value = false;
  reset();
};

const { selectedIndex, reset } = useKeyboardNavigation({
  id: 'landing-screen',
  priority: INPUT_PRIORITIES.GLOBAL,
  isActive: computed(() => !confirmDelete.value),
  maxIndex: computed(() => showSaveOptions.value ? (hasSave.value ? 3 : 1) : 1),
  onConfirm: (idx) => {
    if (!showSaveOptions.value) {
      handleInitialClick();
    } else {
      if (hasSave.value) {
        if (idx === 0) handleContinue();
        if (idx === 1) handleNewGame();
        if (idx === 2) confirmDelete.value = true;
      } else {
        handleNewGame();
      }
    }
  }
});

const { selectedIndex: deleteSelectedIndex } = useKeyboardNavigation({
  id: 'landing-screen-delete',
  priority: INPUT_PRIORITIES.MODAL,
  isActive: confirmDelete,
  maxIndex: 2,
  gridColumns: 2,
  onConfirm: (idx) => {
    if (idx === 0) handleDelete();
    else confirmDelete.value = false;
  },
  onCancel: () => { confirmDelete.value = false; }
});
</script>
