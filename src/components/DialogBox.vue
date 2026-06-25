<template>
  <div
    class="absolute top-28 left-1/2 -translate-x-1/2 w-[90%] max-w-2xl z-50"
    @click.stop="handleConfirm"
  >
    <div class="relative bg-white border-4 border-gray-800 rounded-2xl shadow-2xl p-4 sm:p-6 min-h-[100px] flex flex-col justify-center">
      <!-- Speaker Name -->
      <div
        v-if="speakerName"
        class="absolute -top-5 left-6 bg-gray-800 text-white px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border-2 border-white"
      >
        {{ speakerName }}
      </div>

      <!-- Dialog Text -->
      <p class="text-xs sm:text-sm font-bold text-gray-800 leading-relaxed">
        {{ currentLine }}
      </p>

      <!-- Next Indicator / Button -->
      <button
        id="dialog-next-button"
        class="absolute bottom-2 right-4 w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 border-2 border-gray-800 rounded-full transition-transform active:scale-95"
        aria-label="Next"
        @click.stop="handleConfirm"
      >
        <span class="text-gray-800 text-lg font-black animate-pulse">
          {{ isLastLine ? '✕' : '▼' }}
        </span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useSessionStore } from '../stores/sessionStore';
import { useGameFSM } from '../stores/gameFSM';

const session = useSessionStore();
const fsm = useGameFSM();

const dialog = computed(() => session.dialog);
const currentLine = computed(() => dialog.value?.lines[dialog.value.currentIndex] || '');
const speakerName = computed(() => dialog.value?.speakerName);
const isLastLine = computed(() => {
  if (!dialog.value) return true;
  return dialog.value.currentIndex === dialog.value.lines.length - 1;
});

const handleConfirm = () => {
  fsm.send('CONFIRM');
};
</script>

<style scoped>
button {
  cursor: pointer;
  touch-action: manipulation;
}
</style>
