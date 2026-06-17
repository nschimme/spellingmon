<template>
  <div
    v-if="fsm.matches(GAME_STATES.BATTLE) && session.activePlayerMon && session.battle.enemyMon"
    class="fixed inset-0 bg-white z-40 flex flex-col p-4 overflow-hidden"
    :class="{ 'animate-flash': isFlashing }"
  >
    <!-- Battle Field -->
    <div class="flex-1 relative border-4 border-gray-800 rounded-lg overflow-hidden bg-gradient-to-b from-blue-100 to-green-100 min-h-0">
      <!-- Enemy -->
      <div class="absolute top-4 right-4 sm:top-10 sm:right-10 flex flex-col items-end transition-all duration-300">
        <div class="bg-white border-2 border-gray-800 p-1 sm:p-2 rounded-lg w-36 sm:w-48 shadow-md">
          <div class="flex flex-col font-bold leading-tight">
            <span class="text-[10px] sm:text-sm tracking-tighter">{{ $t('monsters.' + session.battle.enemyMon.species) }}</span>
            <span class="text-[7px] sm:text-[9px] text-gray-500 uppercase">Lv {{ session.battle.enemyMon.level }}</span>
          </div>
          <div class="w-full bg-gray-200 h-1 sm:h-2 rounded mt-0.5 overflow-hidden">
            <div
              class="h-full transition-all duration-500"
              :class="getHPColorClass(session.battle.enemyMon.hp, session.battle.enemyMon.maxHp)"
              :style="{ width: `${(session.battle.enemyMon.hp / session.battle.enemyMon.maxHp) * 100}%` }"
            />
          </div>
        </div>
        <div class="text-4xl sm:text-6xl mt-2 sm:mt-4">
          {{ session.battle.enemyMon.emoji }}
        </div>
      </div>

      <!-- Player -->
      <div class="absolute bottom-4 left-4 sm:bottom-10 sm:left-10 flex flex-col items-start transition-all duration-300">
        <div class="text-4xl sm:text-6xl mb-2 sm:mb-4 scale-x-[-1]">
          {{ session.activePlayerMon.emoji }}
        </div>
        <div class="bg-white border-2 border-gray-800 p-1 sm:p-2 rounded-lg w-36 sm:w-48 shadow-md">
          <div class="flex flex-col font-bold leading-tight">
            <span class="text-[10px] sm:text-sm tracking-tighter">{{ $t('monsters.' + session.activePlayerMon.species) }}</span>
            <span class="text-[7px] sm:text-[9px] text-gray-500 uppercase">Lv {{ session.activePlayerMon.level }}</span>
          </div>
          <div class="w-full bg-gray-200 h-1 sm:h-2 rounded mt-0.5 overflow-hidden">
            <div
              class="h-full transition-all duration-500"
              :class="getHPColorClass(session.activePlayerMon.hp, session.activePlayerMon.maxHp)"
              :style="{ width: `${(session.activePlayerMon.hp / session.activePlayerMon.maxHp) * 100}%` }"
            />
          </div>
        </div>
      </div>

      <!-- Perfect/Mistake Feedback -->
      <div
        v-if="showMistake"
        class="absolute inset-0 z-50 flex items-center justify-center bg-red-600/20 backdrop-blur-sm"
      >
        <div class="bg-white border-8 border-red-600 p-8 rounded-3xl shadow-2xl text-center transform -rotate-2">
          <p class="text-red-600 font-black text-xl mb-2">
            {{ $t('battle.incorrect') }}
          </p>
          <p class="text-4xl font-black tracking-widest text-gray-800">
            {{ session.battle.currentWord?.word }}
          </p>
        </div>
      </div>

      <div
        v-if="showPerfect"
        class="absolute inset-0 z-50 flex items-center justify-center pointer-events-none"
      >
        <div class="bg-yellow-400 border-8 border-white p-6 rounded-full shadow-2xl animate-bounce">
          <p class="text-white font-black uppercase text-3xl italic tracking-tighter">
            {{ $t('battle.perfect') }}
          </p>
        </div>
      </div>
    </div>

    <!-- Battle Log & UI -->
    <div class="h-48 mt-4 border-4 border-gray-800 rounded-lg flex flex-col sm:flex-row p-4 bg-white overflow-hidden">
      <div class="flex-1 border-b sm:border-b-0 sm:border-r border-gray-300 pr-0 sm:pr-4 overflow-y-auto min-h-0">
        <div
          v-for="(log, i) in session.battle.log"
          :key="i"
          class="mb-1 text-xs sm:text-sm font-bold"
        >
          {{ log }}
        </div>
      </div>

      <div class="w-full sm:w-1/3 pl-0 sm:pl-4 mt-2 sm:mt-0 flex flex-col justify-center gap-2 shrink-0">
        <!-- Action Selection -->
        <template v-if="fsm.matches(GAME_STATES.BATTLE_ACTION_SELECT)">
          <div class="grid grid-cols-2 gap-2">
            <button
              class="col-span-2 bg-blue-600 text-white py-3 rounded-lg font-black border-b-4 border-blue-800 text-sm tracking-widest"
              @click="fsm.send(GAME_EVENTS.ATTACK)"
            >
              {{ $t('battle.attack') }}
            </button>
            <button
              class="bg-red-500 text-white py-2 rounded-lg font-bold border-b-4 border-red-700 text-xs"
              @click="fsm.send(GAME_EVENTS.CAPTURE)"
            >
              {{ $t('battle.capture') }}
            </button>
            <button
              class="bg-green-500 text-white py-2 rounded-lg font-bold border-b-4 border-green-700 text-xs"
              @click="fsm.send(GAME_EVENTS.SWITCH)"
            >
              {{ $t('battle.switch') }}
            </button>
          </div>
          <button
            class="w-full bg-gray-500 text-white py-2 rounded-lg font-bold border-b-4 border-gray-700 mt-2 text-xs"
            @click="fsm.send(GAME_EVENTS.RUN)"
          >
            {{ $t('battle.run') }}
          </button>
        </template>

        <!-- Switching -->
        <template v-if="fsm.matches(GAME_STATES.BATTLE_SWITCHING)">
          <p class="text-xs font-bold text-center mb-1">
            {{ $t('battle.switchWho') }}
          </p>
          <div class="flex-1 overflow-y-auto pr-1">
            <button
              v-for="mon in session.player.party"
              :key="mon.id"
              :disabled="mon.hp <= 0 || mon.id === session.battle.playerMonId"
              class="w-full mb-1 p-1 border-2 border-gray-800 rounded text-[10px] font-bold disabled:opacity-50"
              @click="fsm.send(GAME_EVENTS.CONFIRM, { monId: mon.id })"
            >
              {{ $t('monsters.' + mon.species) }} (HP: {{ mon.hp }})
            </button>
            <button
              v-if="session.activePlayerMon.hp > 0"
              class="w-full text-xs text-red-500 font-bold mt-1"
              @click="fsm.send(GAME_EVENTS.CANCEL)"
            >
              {{ $t('common.cancel') }}
            </button>
          </div>
        </template>

        <!-- Spelling -->
        <template v-if="fsm.matches(GAME_STATES.BATTLE_SPELLING)">
          <div class="text-center flex flex-col h-full justify-between">
            <div class="w-full bg-gray-200 h-2 rounded-full overflow-hidden mb-2 border border-gray-400">
              <div
                class="h-full transition-all duration-100"
                :class="timeLeft > (session.battle.totalTime / 2) ? 'bg-yellow-400' : 'bg-red-500'"
                :style="{ width: `${(timeLeft / session.battle.totalTime) * 100}%` }"
              />
            </div>
            <div class="overflow-y-auto max-h-16 mb-2">
              <p
                v-if="session.battle.currentWord?.definition"
                class="text-[10px] leading-tight italic"
              >
                "{{ session.battle.currentWord.definition }}"
              </p>
            </div>
            <input
              v-model="userInput"
              class="w-full border-2 border-gray-800 p-1 text-center text-lg rounded-lg"
              :placeholder="$t('battle.typeHere')"
              autofocus
              @keydown.enter="submitSpelling"
            >
          </div>
        </template>

        <!-- Results -->
        <template v-if="fsm.matches(GAME_STATES.BATTLE_RESULTS)">
          <ExperienceView
            :participating-mons="session.battle.results"
            @continue="fsm.send(GAME_EVENTS.CONTINUE)"
          />
        </template>

        <!-- Whited Out -->
        <template v-if="fsm.matches(GAME_STATES.BATTLE_WHITED_OUT)">
          <button
            class="bg-red-600 text-white py-4 rounded-xl border-b-8 border-red-800 font-black uppercase text-lg"
            @click="fsm.send(GAME_EVENTS.CONFIRM)"
          >
            {{ $t('common.confirm') }}
          </button>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { useSessionStore } from '../stores/sessionStore';
import { useGameFSM } from '../stores/gameFSM';
import { getHPColorClass } from '../utils/visuals';
import { GAME_STATES, GAME_EVENTS } from '../utils/constants';
import ExperienceView from './ExperienceView.vue';

const session = useSessionStore();
const fsm = useGameFSM();

const userInput = ref('');
const isFlashing = ref(false);
const timeLeft = ref(0);
const showMistake = ref(false);
const showPerfect = ref(false);
let timerInterval = null;

const submitSpelling = () => {
  if (!session.battle.currentWord) return;
  fsm.send(GAME_EVENTS.SUBMIT, { input: userInput.value });
  userInput.value = '';
};

watch(() => fsm.state.value, (newState, oldState) => {
  if (newState === GAME_STATES.BATTLE_SPELLING) {
    timeLeft.value = session.battle.totalTime;
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(() => {
      const elapsed = (Date.now() - session.battle.startTime) / 1000;
      timeLeft.value = Math.max(0, session.battle.totalTime - elapsed);
    }, 100);
  } else {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
  }

  if (newState === GAME_STATES.BATTLE_ENEMY_TURN && oldState === GAME_STATES.BATTLE_SPELLING) {
    // If we transition to enemy turn from spelling, it means mistake
    if (!fsm.params.isCorrect) {
       showMistake.value = true;
       setTimeout(() => showMistake.value = false, 2000);
    }
  }

  if (fsm.params.isPerfect) {
    showPerfect.value = true;
    setTimeout(() => showPerfect.value = false, 1500);
  }
});

onMounted(() => {
  isFlashing.value = true;
  setTimeout(() => isFlashing.value = false, 500);
});

onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval);
});
</script>

<style scoped>
@keyframes flash {
  0%, 100% { background-color: white; }
  50% { background-color: #333; }
}
.animate-flash {
  animation: flash 0.1s steps(2, start) 5;
}
</style>
