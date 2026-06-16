<template>
  <div class="fixed inset-0 z-[100] bg-white flex flex-col items-center justify-center p-8">
    <div class="max-w-md w-full flex flex-col items-center">
      <h2 class="text-2xl font-black mb-12 uppercase tracking-tighter text-center animate-pulse">
        {{ $t('battle.evolution', { name: $t(`monsters.${pending?.oldSpecies}`) }) }}
      </h2>

      <div class="relative w-64 h-64 flex items-center justify-center bg-gray-50 rounded-full border-8 border-gray-800 shadow-inner overflow-hidden">
        <div
          class="text-9xl transition-all duration-300"
          :class="step % 2 === 0 ? 'scale-100 opacity-100' : 'scale-125 opacity-50'"
        >
          {{ currentEmoji }}
        </div>

        <!-- Flash Effect -->
        <div
          v-if="isComplete"
          class="absolute inset-0 bg-white animate-ping opacity-75"
        />
      </div>

      <div class="mt-12 h-24 flex items-center justify-center">
        <p
          v-if="isComplete"
          class="text-lg font-black uppercase text-center animate-bounce"
        >
          {{ $t('battle.evolutionComplete', { old: $t(`monsters.${pending?.oldSpecies}`), new: $t(`monsters.${pending?.newSpecies}`) }) }}
        </p>
      </div>

      <button
        v-if="isComplete"
        :class="{ 'ring-8 ring-yellow-400 border-yellow-400': selectedIndex === 0 }"
        class="mt-4 bg-blue-500 text-white px-8 py-3 rounded-xl font-black uppercase border-b-4 border-blue-700 active:translate-y-1"
        @click="finish"
      >
        {{ $t('common.continue') }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { usePlayerStore } from '../stores/playerStore';
import { useKeyboardNavigation } from '../composables/useKeyboardNavigation';
import { audio } from '../utils/audio';
import { SOUND_EFFECTS, INPUT_PRIORITIES } from '../utils/constants';
import { MONS } from '../utils/gameData';

const playerStore = usePlayerStore();
const step = ref(0);
const isComplete = ref(false);

const pending = computed(() => playerStore.evolutionPending);

const currentEmoji = computed(() => {
  if (isComplete.value || step.value >= 15) {
    const newSpecies = pending.value?.newSpecies;
    return MONS[newSpecies]?.emoji || '👾';
  }
  const oldMon = playerStore.party.find(m => m.id === pending.value?.monId);
  return oldMon?.emoji || '👾';
});

const finish = () => {
  playerStore.completeEvolution();
};

const { selectedIndex } = useKeyboardNavigation({
  id: 'evolution-view',
  priority: INPUT_PRIORITIES.MODAL,
  maxIndex: 1,
  isActive: isComplete,
  onConfirm: () => finish()
});

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
