<template>
  <div
    class="w-full h-full flex flex-col items-center justify-center bg-sky-400 p-8 relative overflow-hidden cursor-pointer"
    role="main"
    aria-labelledby="landing-title"
    @click="handleContinue"
  >
    <!-- Parallax Background Elements -->
    <div class="absolute inset-0 pointer-events-none">
      <!-- Clouds -->
      <div
        v-for="n in 5"
        :key="'cloud-'+n"
        class="absolute text-8xl opacity-40 animate-float"
        :style="cloudStyle(n)"
      >
        ☁️
      </div>
      <!-- Birds -->
      <div
        v-for="n in 3"
        :key="'bird-'+n"
        class="absolute text-2xl opacity-60 animate-float-fast"
        :style="birdStyle(n)"
      >
        🕊️
      </div>
      <!-- Grass/Floor -->
      <div class="absolute bottom-0 left-0 right-0 h-32 bg-green-500 border-t-8 border-green-700">
        <div class="flex justify-around items-end h-full px-10">
          <div
            v-for="n in 12"
            :key="'grass-'+n"
            class="text-4xl animate-sway"
            :style="{ animationDelay: (n * 0.2) + 's' }"
          >
            🌿
          </div>
        </div>
      </div>
    </div>

    <div class="z-10 flex flex-col items-center max-w-2xl w-full">
      <div class="relative mb-12">
        <h1
          id="landing-title"
          class="text-5xl md:text-8xl font-black text-center uppercase tracking-tighter text-yellow-400 drop-shadow-[8px_8px_0_rgba(30,58,138,1)] animate-bounce-gentle"
        >
          {{ $t('landing.title') }}
        </h1>
        <div class="absolute -right-4 -bottom-4 bg-red-500 text-white px-4 py-1 rounded-full font-black text-xs md:text-base border-4 border-gray-800 shadow-lg animate-pulse">
          {{ $t('landing.subtitle') }}
        </div>
      </div>

      <div class="bg-white/90 backdrop-blur-sm border-8 border-gray-800 p-8 md:p-12 rounded-[3rem] shadow-2xl w-full max-w-md transform transition-all duration-500 hover:scale-105">
        <div class="space-y-6">
          <button
            ref="startButton"
            :class="{ 'ring-8 ring-yellow-400 scale-105': selectedIndex === 0 }"
            class="w-full bg-blue-500 hover:bg-blue-600 text-white font-black py-4 md:py-6 px-6 md:px-12 rounded-2xl border-b-8 border-blue-800 text-xl md:text-3xl uppercase tracking-widest transition-all active:border-b-0 active:translate-y-2 group outline-none animate-pulse-slow"
            :aria-label="$t('landing.startGame')"
            @click.stop="handleContinue"
          >
            <span class="group-hover:scale-110 inline-block transition-transform">{{ $t('landing.startGame') }}</span>
          </button>
        </div>
      </div>

      <p
        class="mt-12 text-blue-900 font-black uppercase text-xs md:text-sm tracking-[0.3em] animate-pulse drop-shadow-sm"
        aria-live="polite"
      >
        {{ $t('landing.pressAnyKey') }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { audio } from '../utils/audio';
import { SOUND_EFFECTS } from '../utils/constants';
import { useKeyboardNavigation } from '../composables/useKeyboardNavigation';

const emit = defineEmits(['continue']);
const startButton = ref<HTMLElement | null>(null);

const handleContinue = () => {
  audio.playSound(SOUND_EFFECTS.CLICK);
  emit('continue');
};

const { selectedIndex } = useKeyboardNavigation({
  id: 'landing-screen',
  maxIndex: 1,
  itemRefs: computed(() => [startButton.value]),
  onConfirm: handleContinue
});

const cloudStyle = (n: number) => {
  return {
    top: `${10 + (n * 15)}%`,
    left: `${-20 + (n * 5)}%`,
    animationDelay: `${n * 2}s`,
    animationDuration: `${15 + (n * 5)}s`
  };
};

const birdStyle = (n: number) => {
  return {
    top: `${5 + (n * 10)}%`,
    left: `${-10}%`,
    animationDelay: `${n * 3}s`,
    animationDuration: `${8 + (n * 2)}s`
  };
};
</script>

<style scoped>
.animate-float {
  animation: float-horizontal 20s linear infinite;
}

.animate-float-fast {
  animation: float-horizontal 10s linear infinite;
}

@keyframes float-horizontal {
  from { transform: translateX(-150%); }
  to { transform: translateX(600%); }
}

.animate-sway {
  animation: sway 3s ease-in-out infinite;
  transform-origin: bottom center;
}

@keyframes sway {
  0%, 100% { transform: rotate(-5deg); }
  50% { transform: rotate(5deg); }
}

@keyframes bounce-gentle {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.animate-bounce-gentle {
  animation: bounce-gentle 3s ease-in-out infinite;
}

@keyframes pulse-slow {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.02); }
}

.animate-pulse-slow {
  animation: pulse-slow 2s ease-in-out infinite;
}
</style>
