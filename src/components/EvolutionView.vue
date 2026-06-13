<template>
  <div class="fixed inset-0 z-[100] bg-white flex flex-col items-center justify-center p-8">
    <div class="max-w-md w-full flex flex-col items-center">
      <h2 class="text-2xl font-black mb-12 uppercase tracking-tighter text-center animate-pulse">
        What? {{ pending?.oldSpecies }} is evolving!
      </h2>

      <div class="relative w-64 h-64 flex items-center justify-center bg-gray-50 rounded-full border-8 border-gray-800 shadow-inner overflow-hidden">
        <div class="text-9xl transition-all duration-300"
             :class="step % 2 === 0 ? 'scale-100 opacity-100' : 'scale-125 opacity-50'">
          {{ currentEmoji }}
        </div>

        <!-- Flash Effect -->
        <div v-if="isComplete" class="absolute inset-0 bg-white animate-ping opacity-75"></div>
      </div>

      <div class="mt-12 h-24 flex items-center justify-center">
        <p v-if="isComplete" class="text-lg font-black uppercase text-center animate-bounce">
          Congratulations! Your Spellingmon evolved into {{ pending?.newSpecies }}!
        </p>
      </div>

      <button v-if="isComplete"
              @click="finish"
              class="mt-4 bg-blue-500 text-white px-8 py-3 rounded-xl font-black uppercase border-b-4 border-blue-700 active:translate-y-1">
        Awesome!
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { usePlayerStore } from '../stores/playerStore';
import { audio } from '../utils/audio';
import { SOUND_EFFECTS } from '../utils/constants';
import { TYPE_EMOJIS, MONS } from '../utils/gameData';

const playerStore = usePlayerStore();
const step = ref(0);
const isComplete = ref(false);

const pending = computed(() => playerStore.evolutionPending);

const currentEmoji = computed(() => {
  if (isComplete.value || step.value >= 15) {
    const newSpecies = pending.value?.newSpecies;
    return TYPE_EMOJIS[MONS[newSpecies]?.type] || '👾';
  }
  const oldMon = playerStore.party.find(m => m.id === pending.value?.monId);
  return TYPE_EMOJIS[oldMon?.type] || '👾';
});

const finish = () => {
  playerStore.completeEvolution();
};

onMounted(() => {
  audio.playSound(SOUND_EFFECTS.EVOLUTION);

  const interval = setInterval(() => {
    step.value++;
    if (step.value >= 25) {
      clearInterval(interval);
      isComplete.value = true;
      audio.playSound(SOUND_EFFECTS.VICTORY);
    }
  }, 200);
});
</script>

<style scoped>
@keyframes ping {
  0% { transform: scale(1); opacity: 0.8; }
  100% { transform: scale(2); opacity: 0; }
}
</style>
