<script setup>
import { onMounted, onUnmounted, ref } from 'vue';
import { usePlayerStore } from './stores/playerStore';
import { useBattleStore } from './stores/battleStore';
import { useSettingsStore } from './stores/settingsStore';
import { useInputStore } from './stores/inputStore';
import LandingScreen from './components/LandingScreen.vue';
import TTSWelcomeScreen from './components/TTSWelcomeScreen.vue';
import StarterSelection from './components/StarterSelection.vue';
import WorldMap from './components/WorldMap.vue';
import BattleView from './components/BattleView.vue';
import MenuOverlay from './components/MenuOverlay.vue';

const playerStore = usePlayerStore();
const battleStore = useBattleStore();
const settingsStore = useSettingsStore();
const inputStore = useInputStore();

const showMenu = ref(false);

const handleGlobalInput = (e) => {
  if (e.key === 'Escape') {
    if (showMenu.value) {
      showMenu.value = false;
      return true;
    }
    if (playerStore.isStarterSelected && !battleStore.inBattle) {
      showMenu.value = true;
      return true;
    }
  }
  return false;
};

onMounted(async () => {
  await settingsStore.init();
  inputStore.init();
  inputStore.addListener('global', handleGlobalInput, 10);
});

onUnmounted(() => {
  inputStore.removeListener('global');
  inputStore.cleanup();
});
</script>

<template>
  <div class="w-screen h-screen overflow-hidden bg-gray-900 flex items-center justify-center p-2 sm:p-4">
    <!-- Main Console Container -->
    <div class="relative w-full h-full max-w-5xl max-h-[800px] bg-white border-[12px] border-gray-800 rounded-[40px] shadow-2xl overflow-hidden flex flex-col">
      <LandingScreen v-if="!playerStore.gameStarted" @start="playerStore.startGame" />
      <template v-else-if="!playerStore.ttsVerified">
        <TTSWelcomeScreen @verified="playerStore.ttsVerified = true" />
      </template>
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
