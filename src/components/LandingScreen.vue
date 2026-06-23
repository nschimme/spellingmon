<template>
  <div
    class="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-sky-400 via-sky-300 to-green-300 relative overflow-hidden cursor-pointer group"
    role="main"
    aria-labelledby="landing-title"
    @click="handleContinue"
  >
    <!-- Background Layers (Distant to Close) -->
    <div class="absolute inset-0 pointer-events-none select-none">
      <!-- Sun Rays -->
      <div class="absolute top-0 left-1/2 -translate-x-1/2 w-[200%] h-[200%] bg-[radial-gradient(circle,rgba(255,255,255,0.4)_0%,transparent_60%)] animate-pulse-slow opacity-30" />

      <!-- Distant Mountains -->
      <div class="absolute bottom-[20%] left-0 right-0 flex justify-around items-end opacity-40">
        <div
          v-for="n in 4"
          :key="'mt-far-'+n"
          class="text-[250px] leading-none transform translate-y-20 animate-parallax-dist"
          :style="{ animationDelay: `-${n * 15}s`, animationDuration: '120s' }"
        >
          ⛰️
        </div>
      </div>

      <!-- Mid Mountains -->
      <div class="absolute bottom-[10%] left-0 right-0 flex justify-around items-end opacity-60">
        <div
          v-for="n in 3"
          :key="'mt-mid-'+n"
          class="text-[200px] leading-none transform translate-y-10 animate-parallax-mid"
          :style="{ animationDelay: `-${n * 20}s`, animationDuration: '80s' }"
        >
          🏔️
        </div>
      </div>

      <!-- Fore Trees -->
      <div class="absolute bottom-20 left-0 right-0 flex justify-between items-end opacity-90 px-4">
        <div
          v-for="n in 12"
          :key="'tree-'+n"
          class="text-7xl leading-none animate-parallax-fore"
          :style="{ animationDelay: `-${n * 3}s`, animationDuration: '40s' }"
        >
          🌲
        </div>
      </div>

      <!-- Ground/Grass Layer -->
      <div class="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-b from-green-500 to-green-700 border-t-8 border-green-600 shadow-[0_-20px_50px_rgba(0,0,0,0.2)]">
        <div class="flex justify-around items-end h-full px-4 pb-4 overflow-hidden relative">
          <!-- Dynamic Monster Showcase -->
          <div
            v-if="currentMonster"
            :key="monsterKey"
            class="absolute bottom-16 left-1/2 -translate-x-1/2 text-9xl md:text-[12rem] z-10 transition-all duration-1000"
            :class="monsterAnimClass"
          >
            <div class="drop-shadow-[0_20px_20px_rgba(0,0,0,0.4)]">
              {{ currentMonster }}
            </div>
          </div>

          <div
            v-for="n in 30"
            :key="'grass-'+n"
            class="text-3xl md:text-5xl animate-sway"
            :style="{ animationDelay: (n * 0.1) + 's' }"
          >
            {{ n % 7 === 0 ? '🌸' : (n % 4 === 0 ? '🌿' : '🌱') }}
          </div>
        </div>
      </div>
    </div>

    <!-- UI Overlay -->
    <div class="z-20 flex flex-col items-center w-full px-4 pt-16 sm:pt-24">
      <!-- Logo/Title Section -->
      <div class="relative group cursor-pointer transition-transform duration-500 hover:scale-105 mb-12 sm:mb-20 w-full max-w-[min(95vw,800px)] flex flex-col items-center px-4">
        <!-- Glow Effect behind title -->
        <div class="absolute inset-0 bg-white/40 blur-3xl rounded-full scale-110 animate-pulse" />

        <h1
          id="landing-title"
          class="text-[clamp(1.2rem,6.5vw,4.5rem)] font-black text-center uppercase tracking-tighter leading-[0.9] w-full pt-4"
        >
          <span class="block text-black drop-shadow-[0.05em_0.05em_0_white] drop-shadow-[0.08em_0.08em_0_rgba(0,0,0,0.5)] transform -rotate-1">
            SPELLING
          </span>
          <span class="block text-[#facc15] drop-shadow-[0.05em_0.05em_0_black] drop-shadow-[0.08em_0.08em_0_rgba(255,255,255,0.3)] transform rotate-1 -mt-[0.1em]">
            MON
          </span>
        </h1>

        <div class="absolute -right-2 sm:-right-8 top-[-100%] sm:top-[-90%] bg-white text-black px-3 py-1 sm:px-6 sm:py-2 rounded-full font-black text-[clamp(10px,3vw,18px)] border-2 sm:border-4 border-black shadow-[4px_4px_0_#facc15] rotate-12 animate-bounce-gentle whitespace-nowrap z-30 ring-2 ring-black/10">
          {{ $t('landing.subtitle') }}
        </div>
      </div>

      <!-- Action Button Container -->
      <div class="max-w-xs w-full">
        <button
          ref="startButton"
          class="w-full group relative bg-[#facc15] hover:bg-yellow-300 text-black font-black py-4 px-8 rounded-[2rem] border-b-[8px] border-black shadow-xl transition-all active:border-b-0 active:translate-y-2 overflow-hidden"
          :class="{ 'ring-8 ring-white scale-105 border-gray-800': selectedIndex === 0 }"
          @click.stop="handleContinue"
        >
          <!-- Shine effect -->
          <div class="absolute top-0 -left-full w-full h-full bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-[-20deg] group-hover:animate-shine" />

          <div class="relative flex items-center justify-center gap-2">
            <span class="text-xl md:text-2xl uppercase tracking-[0.1em] drop-shadow-sm">
              {{ $t('landing.startGame') }}
            </span>
            <span class="text-2xl animate-bounce">🐝</span>
          </div>
        </button>
      </div>

      <!-- Press Key Hint (More modern style) -->
      <div class="mt-16 flex flex-col items-center gap-2">
        <div class="h-1 w-32 bg-gray-800/20 rounded-full overflow-hidden">
          <div class="h-full bg-white animate-progress-loop" />
        </div>
        <p class="text-blue-900/60 font-black uppercase text-xs tracking-[0.5em] animate-pulse">
          {{ $t('landing.pressAnyKey') }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { audio } from '../utils/audio';
import { SOUND_EFFECTS } from '../utils/constants';
import { useKeyboardNavigation } from '../composables/useKeyboardNavigation';
import { MONS } from '../utils/gameData';

const emit = defineEmits(['continue']);
const startButton = ref<HTMLElement | null>(null);

const handleContinue = () => {
  audio.playSound(SOUND_EFFECTS.CLICK);
  emit('continue');
};

const monsters = Object.values(MONS).map(m => m.emoji);
const currentMonster = ref('');
const monsterKey = ref(0);
const monsterAnimClass = ref('');
let showcaseInterval: any = null;

const animVariations = [
  'animate-showcase-bounce',
  'animate-showcase-spin',
  'animate-showcase-flip',
  'animate-showcase-zoom-dance',
  'animate-showcase-hop'
];

const updateShowcase = () => {
  const randomMon = monsters[Math.floor(Math.random() * monsters.length)];
  const randomAnim = animVariations[Math.floor(Math.random() * animVariations.length)];

  monsterAnimClass.value = 'opacity-0 scale-0 translate-y-20';

  setTimeout(() => {
    currentMonster.value = randomMon;
    monsterKey.value++;
    monsterAnimClass.value = randomAnim;
  }, 1000);
};

const { selectedIndex } = useKeyboardNavigation({
  id: 'landing-screen',
  maxIndex: 1,
  itemRefs: computed(() => [startButton.value]),
  onConfirm: handleContinue
});

onMounted(() => {
  updateShowcase();
  showcaseInterval = setInterval(updateShowcase, 5000);
});

onUnmounted(() => {
  if (showcaseInterval) clearInterval(showcaseInterval);
});
</script>

<style scoped>
@keyframes parallax {
  from { transform: translateX(-100%); }
  to { transform: translateX(100vw); }
}

.animate-parallax-dist {
  animation: parallax linear infinite;
  will-change: transform;
}

.animate-parallax-mid {
  animation: parallax linear infinite;
  will-change: transform;
}

.animate-parallax-fore {
  animation: parallax linear infinite;
  will-change: transform;
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
  50% { transform: translateY(-20px); }
}

.animate-bounce-gentle {
  animation: bounce-gentle 2s ease-in-out infinite;
}

@keyframes pulse-slow {
  0%, 100% { opacity: 0.2; }
  50% { opacity: 0.4; }
}

.animate-pulse-slow {
  animation: pulse-slow 4s ease-in-out infinite;
}

@keyframes shine {
  0% { left: -100%; }
  20% { left: 100%; }
  100% { left: 100%; }
}

.animate-shine {
  animation: shine 3s infinite;
}

@keyframes progress-loop {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

.animate-progress-loop {
  animation: progress-loop 2s linear infinite;
}

/* Monster Showcase Animations */
@keyframes showcase-bounce {
  0% { transform: translate(-50%, 100px) scale(0); opacity: 0; }
  15% { transform: translate(-50%, 0) scale(1.2); opacity: 1; }
  25% { transform: translate(-50%, -40px) scale(1); opacity: 1; }
  35% { transform: translate(-50%, 0) scale(1.1); opacity: 1; }
  45% { transform: translate(-50%, -20px) scale(1); opacity: 1; }
  55% { transform: translate(-50%, 0) scale(1); opacity: 1; }
  85% { transform: translate(-50%, 0) scale(1.2); opacity: 1; }
  100% { transform: translate(-50%, 100px) scale(0); opacity: 0; }
}

@keyframes showcase-spin {
  0% { transform: translate(-50%, 100px) scale(0) rotate(0deg); opacity: 0; }
  20% { transform: translate(-50%, 0) scale(1.5) rotate(360deg); opacity: 1; }
  40% { transform: translate(-50%, 0) scale(1) rotate(720deg); opacity: 1; }
  60% { transform: translate(-50%, 0) scale(1.2) rotate(1080deg); opacity: 1; }
  80% { transform: translate(-50%, 0) scale(1) rotate(1440deg); opacity: 1; }
  100% { transform: translate(-50%, 100px) scale(0) rotate(1800deg); opacity: 0; }
}

@keyframes showcase-flip {
  0% { transform: translate(-50%, 100px) scale(0) rotateY(0deg); opacity: 0; }
  20% { transform: translate(-50%, 0) scale(1.3) rotateY(360deg); opacity: 1; }
  40% { transform: translate(-50%, 0) scale(1) rotateY(720deg); opacity: 1; }
  60% { transform: translate(-50%, 0) scale(1.3) rotateY(1080deg); opacity: 1; }
  80% { transform: translate(-50%, 0) scale(1) rotateY(1440deg); opacity: 1; }
  100% { transform: translate(-50%, 100px) scale(0) rotateY(1800deg); opacity: 0; }
}

@keyframes showcase-zoom-dance {
  0% { transform: translate(-50%, 100px) scale(0); opacity: 0; }
  20% { transform: translate(-50%, 0) scale(2); opacity: 1; }
  30% { transform: translate(-50%, 0) scale(1.5) rotate(10deg); opacity: 1; }
  40% { transform: translate(-50%, 0) scale(1.5) rotate(-10deg); opacity: 1; }
  50% { transform: translate(-50%, 0) scale(1.5) rotate(10deg); opacity: 1; }
  60% { transform: translate(-50%, 0) scale(1.5) rotate(-10deg); opacity: 1; }
  80% { transform: translate(-50%, 0) scale(2); opacity: 1; }
  100% { transform: translate(-50%, 100px) scale(0); opacity: 0; }
}

@keyframes showcase-hop {
  0% { transform: translate(-50%, 100px) scale(0); opacity: 0; }
  20% { transform: translate(-50%, 0) scale(1); opacity: 1; }
  30% { transform: translate(-50%, -50px) scale(1.1); opacity: 1; }
  40% { transform: translate(-50%, 0) scale(1); opacity: 1; }
  50% { transform: translate(-50%, -50px) scale(1.1); opacity: 1; }
  60% { transform: translate(-50%, 0) scale(1); opacity: 1; }
  70% { transform: translate(-50%, -50px) scale(1.1); opacity: 1; }
  85% { transform: translate(-50%, 0) scale(1); opacity: 1; }
  100% { transform: translate(-50%, 100px) scale(0); opacity: 0; }
}

.animate-showcase-bounce {
  animation: showcase-bounce 4.5s ease-in-out forwards;
}

.animate-showcase-spin {
  animation: showcase-spin 4.5s ease-in-out forwards;
}

.animate-showcase-flip {
  animation: showcase-flip 4.5s ease-in-out forwards;
}

.animate-showcase-zoom-dance {
  animation: showcase-zoom-dance 4.5s ease-in-out forwards;
}

.animate-showcase-hop {
  animation: showcase-hop 4.5s ease-in-out forwards;
}
</style>
