<template>
  <transition name="whiteout-fade">
    <div
      class="fixed inset-0 z-[100] bg-white flex flex-col items-center justify-center p-8 text-center"
    >
      <div class="text-9xl mb-8 animate-pulse">
        🏥
      </div>
      <h2 class="text-4xl font-black text-red-600 mb-4 uppercase tracking-tighter">
        {{ $t('battle.whitedOutTitle') }}
      </h2>
      <p class="text-xl font-bold text-gray-700 max-w-md mb-12">
        {{ $t('battle.whitedOutDesc') }}
      </p>
      <button
        ref="whiteoutContinueButton"
        class="bg-red-600 text-white px-12 py-4 rounded-2xl font-black uppercase text-2xl border-b-8 border-red-800 active:border-b-0 active:translate-y-2 transition-all outline-none"
        :class="{ 'ring-8 ring-yellow-400 border-yellow-400': selectedIndex === 0 }"
        @click="handleContinue"
      >
        {{ $t('common.continue') }}
      </button>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useGameFSM } from '../stores/gameFSM';
import { useSessionStore } from '../stores/sessionStore';
import { useKeyboardNavigation } from '../composables/useKeyboardNavigation';
import { speech } from '../utils/speech';
import { GAME_EVENTS } from '../utils/constants';

const fsm = useGameFSM();
const session = useSessionStore();
const whiteoutContinueButton = ref<HTMLElement | null>(null);

const handleContinue = () => {
  speech.stop();
  fsm.send(GAME_EVENTS.CONFIRM);
};

const { selectedIndex } = useKeyboardNavigation({
  id: 'whiteout-view',
  maxIndex: 1,
  itemRefs: computed(() => [whiteoutContinueButton.value]),
  onConfirm: handleContinue
});

onMounted(() => {
  // Narrate the description as requested
  speech.speak(session.t('battle.whitedOutDesc'));
});
</script>

<style scoped>
.whiteout-fade-enter-active,
.whiteout-fade-leave-active {
  transition: opacity 1s ease;
}
.whiteout-fade-enter-from,
.whiteout-fade-leave-to {
  opacity: 0;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}
.animate-pulse {
  animation: pulse 2s ease-in-out infinite;
}
</style>
