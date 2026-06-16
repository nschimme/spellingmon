<template>
  <div
    class="w-full h-full flex flex-col items-center justify-center bg-gray-900 p-8 relative overflow-hidden cursor-pointer"
    @click="handleContinue"
  >
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
        <h1 class="text-xl leading-none md:text-4xl font-black text-center mb-4 uppercase tracking-tight text-orange-500 drop-shadow-[4px_4px_0_rgba(0,0,0,1)]">
          {{ $t('landing.title') }}
        </h1>
        <p class="text-gray-600 font-bold text-center mb-8 md:mb-12 uppercase tracking-widest text-[10px] md:text-sm">
          {{ $t('landing.subtitle') }}
        </p>

        <div class="space-y-4">
          <button
            :class="{ 'ring-8 ring-yellow-400': selectedIndex === 0 }"
            class="w-full bg-blue-500 hover:bg-blue-600 text-white font-black py-4 md:py-6 px-6 md:px-12 rounded-2xl border-b-8 border-blue-800 text-xl md:text-2xl uppercase tracking-widest transition-all active:border-b-0 active:translate-y-2 group"
            @click.stop="handleContinue"
          >
            <span class="group-hover:scale-110 inline-block transition-transform">{{ $t('landing.startGame') }}</span>
          </button>
        </div>
      </div>

      <p class="mt-8 md:mt-12 text-white/50 font-bold uppercase text-[10px] tracking-widest animate-pulse">
        {{ $t('landing.pressAnyKey') }}
      </p>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from 'vue';
import { audio } from '../utils/audio';
import { SOUND_EFFECTS } from '../utils/constants';

const emit = defineEmits(['continue']);
const selectedIndex = ref(0);

const handleContinue = () => {
  audio.playSound(SOUND_EFFECTS.CLICK);
  emit('continue');
};

const handleGlobalKeyDown = (e) => {
  if (e.key === ' ' || e.key === 'Enter') {
    e.preventDefault();
    handleContinue();
  }
};

onMounted(() => {
  window.addEventListener('keydown', handleGlobalKeyDown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleGlobalKeyDown);
});
</script>
