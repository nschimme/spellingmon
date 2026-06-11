<script setup>
import { onMounted, onUnmounted, ref } from 'vue';
import { usePlayerStore } from './stores/playerStore';
import { useBattleStore } from './stores/battleStore';
import LandingScreen from './components/LandingScreen.vue';
import StarterSelection from './components/StarterSelection.vue';
import WorldMap from './components/WorldMap.vue';
import BattleView from './components/BattleView.vue';
import MenuOverlay from './components/MenuOverlay.vue';
import { speech } from './utils/speech';

const playerStore = usePlayerStore();
const battleStore = useBattleStore();
const showMenu = ref(false);
const gameStarted = ref(false);

const toggleMenu = (e) => {
  if (e.key === 'Escape' && playerStore.isStarterSelected && !battleStore.inBattle) {
    showMenu.value = !showMenu.value;
  }
};

onMounted(async () => {
  await speech.init();
  window.addEventListener('keydown', toggleMenu);
});

onUnmounted(() => {
  window.removeEventListener('keydown', toggleMenu);
});
</script>

<template>
  <div class="w-screen h-screen overflow-hidden bg-gray-900 flex items-center justify-center p-2 sm:p-4">
    <!-- Main Console Container -->
    <div class="relative w-full h-full max-w-5xl max-h-[800px] bg-white border-[12px] border-gray-800 rounded-[40px] shadow-2xl overflow-hidden flex flex-col">
      <LandingScreen v-if="!gameStarted" @start="gameStarted = true" />
      <template v-else>
        <StarterSelection v-if="!playerStore.isStarterSelected" />
        <template v-else>
          <WorldMap :class="{ 'blur-[2px] pointer-events-none': showMenu }" v-if="!battleStore.inBattle" :isMenuOpen="showMenu" />
          <BattleView v-if="battleStore.inBattle" />
          <MenuOverlay v-if="showMenu" @close="showMenu = false" />
        </template>
      </template>

      <!-- Screen Glare Overlay -->
      <div class="absolute inset-0 pointer-events-none bg-gradient-to-tr from-transparent via-white/5 to-white/10"></div>
    </div>
  </div>
</template>

<style>
:root {
  image-rendering: pixelated;
}
body {
  margin: 0;
  padding: 0;
  background-color: #111827;
}
/* Custom Scrollbar for Pokémon aesthetic */
::-webkit-scrollbar {
  width: 12px;
}
::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-left: 4px solid #1f2937;
}
::-webkit-scrollbar-thumb {
  background: #1f2937;
  border: 2px solid #f1f1f1;
}
</style>
