<script setup>
import { onMounted, onUnmounted, ref } from 'vue';
import { usePlayerStore } from './stores/playerStore';
import { useBattleStore } from './stores/battleStore';
import { useSettingsStore } from './stores/settingsStore';
import { useInputStore } from './stores/inputStore';
import { speech } from './utils/speech';
import LandingScreen from './components/LandingScreen.vue';
import SaveSelection from './components/SaveSelection.vue';
import TTSWelcomeScreen from './components/TTSWelcomeScreen.vue';
import CharacterCreation from './components/CharacterCreation.vue';
import StarterSelection from './components/StarterSelection.vue';
import WorldMap from './components/WorldMap.vue';
import BattleView from './components/BattleView.vue';
import MenuOverlay from './components/MenuOverlay.vue';
import EvolutionView from './components/EvolutionView.vue';

const playerStore = usePlayerStore();
const battleStore = useBattleStore();
const settingsStore = useSettingsStore();
const inputStore = useInputStore();

const showMenu = ref(false);
const showSaveSelection = ref(false);

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
  speech.onError(() => {
    playerStore.notify('Speech failed. Your browser may not support TTS.');
  });
  await settingsStore.init();
  inputStore.init();
  inputStore.addListener('global', handleGlobalInput, 10);

  // Debug/E2E Test Mode initialization
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('debug') === 'true') {
    // If we're debugging, we auto-assign slot 0 if none is active
    if (playerStore.activeSlot === null) {
      playerStore.loadSlot(0);
    }
    playerStore.debugInit({
      name: urlParams.get('name'),
      starter: urlParams.get('starter'),
      locale: urlParams.get('locale'),
      battle: urlParams.get('battle'),
      word: urlParams.get('word')
    });
  }
});

onUnmounted(() => {
  speech.onError(null);
  inputStore.removeListener('global');
  inputStore.cleanup();
});
</script>

<template>
  <div class="w-screen h-screen overflow-hidden bg-gray-900 flex items-center justify-center p-2 sm:p-4">
    <!-- Main Console Container -->
    <div class="relative w-full h-full max-w-5xl max-h-[800px] bg-white border-[12px] border-gray-800 rounded-[40px] shadow-2xl overflow-hidden flex flex-col">
      <LandingScreen
        v-if="!playerStore.gameStarted && !showSaveSelection"
        @continue="showSaveSelection = true"
        @new-game="showSaveSelection = true"
      />
      <template v-else-if="!settingsStore.ttsVerified">
        <TTSWelcomeScreen @verified="settingsStore.confirmTtsVerified" />
      </template>
      <SaveSelection
        v-else-if="showSaveSelection && !playerStore.gameStarted"
        @back="showSaveSelection = false"
        @selected="playerStore.startGame(); showSaveSelection = false"
      />
      <template v-else-if="!playerStore.characterCreationComplete">
        <CharacterCreation />
      </template>
      <template v-else>
        <StarterSelection v-if="!playerStore.isStarterSelected" />
        <template v-else>
          <WorldMap
            v-if="!battleStore.inBattle"
            :class="{ 'blur-[2px] pointer-events-none': showMenu }"
            :is-menu-open="showMenu"
            @toggle-menu="showMenu = !showMenu"
          />
          <BattleView v-if="battleStore.inBattle" />
          <MenuOverlay
            v-if="showMenu"
            @close="showMenu = false"
          />
          <EvolutionView v-if="playerStore.evolutionPending" />
        </template>
      </template>

      <!-- Screen Glare Overlay -->
      <div class="absolute inset-0 pointer-events-none bg-gradient-to-tr from-transparent via-white/5 to-white/10" />

      <!-- Global Notifications -->
      <transition name="fade">
        <div
          v-if="playerStore.notification"
          class="absolute bottom-20 left-1/2 -translate-x-1/2 bg-white border-4 border-gray-800 px-6 py-3 rounded-xl shadow-2xl z-30 min-w-[300px]"
        >
          <p class="text-[10px] font-black text-gray-800 text-center leading-relaxed">
            {{ playerStore.notification }}
          </p>
        </div>
      </transition>
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
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
