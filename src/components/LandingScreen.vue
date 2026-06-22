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
            class="absolute bottom-12 left-1/2 -translate-x-1/2 text-8xl md:text-9xl z-10 transition-all duration-1000"
            :class="monsterAnimClass"
          >
            {{ currentMonster }}
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
    <div class="z-20 flex flex-col items-center w-full px-4">
      <!-- Logo/Title Section -->
      <div class="relative group cursor-pointer transition-transform duration-500 hover:scale-110 mb-16">
        <!-- Glow Effect behind title -->
        <div class="absolute inset-0 bg-yellow-400/30 blur-3xl rounded-full scale-150 animate-pulse" />

        <h1
          id="landing-title"
          class="text-7xl md:text-[10rem] font-black text-center uppercase tracking-tighter leading-none"
        >
          <span class="block text-yellow-400 drop-shadow-[12px_12px_0_rgba(30,58,138,1)] transform -rotate-2">
            SPELLING
          </span>
          <span class="block text-white drop-shadow-[12px_12px_0_rgba(220,38,38,1)] transform rotate-1 -mt-4">
            MON
          </span>
        </h1>

        <div class="absolute -right-8 top-0 bg-red-600 text-white px-6 py-2 rounded-full font-black text-lg md:text-2xl border-4 border-gray-800 shadow-xl rotate-12 animate-bounce-gentle">
          {{ $t('landing.subtitle') }}
        </div>
      </div>

      <!-- Action Button Container -->
      <div class="max-w-md w-full">
        <button
          ref="startButton"
          class="w-full group relative bg-blue-600 hover:bg-blue-500 text-white font-black py-8 px-12 rounded-[2.5rem] border-b-[12px] border-blue-900 shadow-2xl transition-all active:border-b-0 active:translate-y-4 overflow-hidden"
          :class="{ 'ring-8 ring-yellow-400 scale-105 border-yellow-700': selectedIndex === 0 }"
          @click.stop="handleContinue"
        >
          <!-- Shine effect -->
          <div class="absolute top-0 -left-full w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-[-20deg] group-hover:animate-shine" />

          <div class="relative flex items-center justify-center gap-4">
            <span class="text-3xl md:text-4xl uppercase tracking-[0.2em] drop-shadow-md">
              {{ $t('landing.startGame') }}
            </span>
            <span class="text-4xl animate-bounce">⚔️</span>
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

const emit = defineEmits(['continue']);
const startButton = ref<HTMLElement | null>(null);

const handleContinue = () => {
  audio.playSound(SOUND_EFFECTS.CLICK);
  emit('continue');
};

const monsters = ['🦎', '🐢', '🍃', '🐭', '🐛', '🐦', '🐀', '🐍', '🦔', '🦂', '🧚', '🦊', '🎈', '🦇', '🌱', '🍄', '🕷️', '🦖', '🦋', '🐝', '🦅', '🦁', '🐱', '🐶', '🐉', '👽', '✨'];
const currentMonster = ref('');
const monsterKey = ref(0);
const monsterAnimClass = ref('');
let showcaseInterval: any = null;

const animVariations = ['animate-showcase-bounce', 'animate-showcase-spin', 'animate-showcase-flip'];

const updateShowcase = () => {
  const randomMon = monsters[Math.floor(Math.random() * monsters.length)];
  const randomAnim = animVariations[Math.floor(Math.random() * animVariations.length)];

  monsterAnimClass.value = 'opacity-0 scale-0';

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
  0% { transform: translate(-50%, 50px) scale(0); opacity: 0; }
  20% { transform: translate(-50%, 0) scale(1.2); opacity: 1; }
  30% { transform: translate(-50%, -20px) scale(1); opacity: 1; }
  40% { transform: translate(-50%, 0) scale(1); opacity: 1; }
  50% { transform: translate(-50%, -20px) scale(1); opacity: 1; }
  60% { transform: translate(-50%, 0) scale(1); opacity: 1; }
  80% { transform: translate(-50%, 0) scale(1.2); opacity: 1; }
  100% { transform: translate(-50%, 50px) scale(0); opacity: 0; }
}

@keyframes showcase-spin {
  0% { transform: translate(-50%, 50px) scale(0) rotate(0deg); opacity: 0; }
  20% { transform: translate(-50%, 0) scale(1) rotate(360deg); opacity: 1; }
  80% { transform: translate(-50%, 0) scale(1) rotate(360deg); opacity: 1; }
  100% { transform: translate(-50%, 50px) scale(0) rotate(720deg); opacity: 0; }
}

@keyframes showcase-flip {
  0% { transform: translate(-50%, 50px) scale(0) rotateY(0deg); opacity: 0; }
  20% { transform: translate(-50%, 0) scale(1) rotateY(180deg); opacity: 1; }
  40% { transform: translate(-50%, 0) scale(1) rotateY(0deg); opacity: 1; }
  60% { transform: translate(-50%, 0) scale(1) rotateY(180deg); opacity: 1; }
  80% { transform: translate(-50%, 0) scale(1) rotateY(0deg); opacity: 1; }
  100% { transform: translate(-50%, 50px) scale(0) rotateY(0deg); opacity: 0; }
}

.animate-showcase-bounce {
  animation: showcase-bounce 4s ease-in-out forwards;
}

.animate-showcase-spin {
  animation: showcase-spin 4s ease-in-out forwards;
}

.animate-showcase-flip {
  animation: showcase-flip 4s ease-in-out forwards;
}
</style>
