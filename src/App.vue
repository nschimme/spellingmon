<script setup lang="ts">
import { onMounted, onUnmounted, computed } from 'vue';
import { useGameFSM } from './stores/gameFSM';
import { useSessionStore } from './stores/sessionStore';
import { useInputStore } from './stores/inputStore';
import { speech } from './utils/speech';
import { GAME_STATES, GAME_EVENTS } from './utils/constants';
import LandingScreen from './components/LandingScreen.vue';
import SaveSelection from './components/SaveSelection.vue';
import TTSWelcomeScreen from './components/TTSWelcomeScreen.vue';
import CharacterCreation from './components/CharacterCreation.vue';
import StarterSelection from './components/StarterSelection.vue';
import LoadingScreen from './components/LoadingScreen.vue';
import WorldMap from './components/WorldMap.vue';
import BattleView from './components/BattleView.vue';
import MenuOverlay from './components/MenuOverlay.vue';
import EvolutionView from './components/EvolutionView.vue';
import StoryView from './components/StoryView.vue';
import BattleTransition from './components/BattleTransition.vue';

const fsm = useGameFSM();
const session = useSessionStore();
const inputStore = useInputStore();

const isBattleTransitioning = computed(() => fsm.matches(GAME_STATES.BATTLE_INTRO));

const handleGlobalInput = (e: KeyboardEvent) => {
  if (e.key === 'Escape') {
    if (fsm.matches(GAME_STATES.MENU)) {
      fsm.send(GAME_EVENTS.CLOSE);
      return true;
    }
    if (fsm.matches(GAME_STATES.WORLD)) {
      fsm.send(GAME_EVENTS.OPEN_MENU);
      return true;
    }
  }
  return false;
};

onMounted(async () => {
  speech.onError(() => {
    session.notify('Speech failed. Your browser may not support TTS.');
  });
  inputStore.init();
  inputStore.addListener('global', handleGlobalInput);
});

onUnmounted(() => {
  speech.onError(() => {});
  inputStore.removeListener('global');
  inputStore.cleanup();
});
</script>

<template>
  <div class="w-screen h-screen overflow-hidden bg-gray-900 flex items-center justify-center p-2 sm:p-4">
    <!-- Main Console Container -->
    <div class="relative w-full h-full max-w-5xl max-h-[800px] bg-white border-[12px] border-gray-800 rounded-[40px] shadow-2xl overflow-hidden flex flex-col">
      <!-- FSM-Driven Routing -->
      <LandingScreen
        v-if="fsm.matches(GAME_STATES.LANDING)"
        @continue="fsm.send(GAME_EVENTS.START)"
        @new-game="fsm.send(GAME_EVENTS.START)"
      />

      <TTSWelcomeScreen
        v-else-if="fsm.matches(GAME_STATES.LANGUAGE_SELECT) || fsm.matches(GAME_STATES.TTS_CHECK)"
      />

      <SaveSelection
        v-else-if="fsm.matches(GAME_STATES.SAVE_SELECTION)"
        @back="fsm.send(GAME_EVENTS.BACK)"
        @selected="(slot) => fsm.send(GAME_EVENTS.SELECT_SLOT, { slot })"
      />

      <LoadingScreen
        v-else-if="fsm.matches(GAME_STATES.LOADING)"
      />

      <CharacterCreation
        v-else-if="fsm.matches(GAME_STATES.CHARACTER_CREATION)"
        @complete="fsm.send(GAME_EVENTS.COMPLETE)"
      />

      <StarterSelection
        v-else-if="fsm.matches(GAME_STATES.STARTER_SELECTION)"
        @complete="fsm.send(GAME_EVENTS.COMPLETE)"
      />

      <template v-else-if="fsm.matches(GAME_STATES.PLAY)">
        <WorldMap
          v-if="fsm.matches(GAME_STATES.WORLD) || fsm.matches(GAME_STATES.MENU) || fsm.matches(GAME_STATES.TRAINER_APPROACH)"
          :is-menu-open="fsm.matches(GAME_STATES.MENU)"
          @toggle-menu="fsm.send(fsm.matches(GAME_STATES.MENU) ? GAME_EVENTS.CLOSE : GAME_EVENTS.OPEN_MENU)"
        />

        <BattleView v-if="fsm.matches(GAME_STATES.BATTLE)" />

        <MenuOverlay
          v-if="fsm.matches(GAME_STATES.MENU)"
          @close="fsm.send(GAME_EVENTS.CLOSE)"
        />

        <EvolutionView
          v-if="fsm.matches(GAME_STATES.EVOLUTION)"
        />

        <StoryView
          v-if="fsm.matches(GAME_STATES.STORY_CUTSCENE)"
          :type="(!session.player.isStarterSelected || fsm.params.type === 'intro') ? 'intro' : (fsm.params.area >= 9 ? 'ending' : 'areaComplete')"
          :area="fsm.params.area"
          @finish="fsm.send(GAME_EVENTS.FINISH)"
        />
      </template>

      <!-- Screen Glare Overlay -->
      <div class="absolute inset-0 pointer-events-none bg-gradient-to-tr from-transparent via-white/5 to-white/10" />

      <BattleTransition :active="isBattleTransitioning" />

      <!-- Global Notifications -->
      <transition name="fade">
        <div
          v-if="session.notification"

          class="absolute bottom-20 left-1/2 -translate-x-1/2 bg-white border-4 border-gray-800 px-6 py-3 rounded-xl shadow-2xl z-30 min-w-[300px]"
        >
          <p class="text-[10px] font-black text-gray-800 text-center leading-relaxed">
            {{ session.notification }}
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
