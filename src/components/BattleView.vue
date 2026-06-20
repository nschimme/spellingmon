<template>
  <div
    v-if="fsm.matches(GAME_STATES.BATTLE) && session.activePlayerMon && session.battle.enemyMon"
    class="fixed inset-0 bg-white z-40 flex flex-col p-4 overflow-hidden"
    :class="{ 'animate-flash': isFlashing }"
  >
    <!-- Battle Field -->
    <div class="flex-1 relative border-4 border-gray-800 rounded-lg overflow-hidden bg-gradient-to-b from-blue-100 to-green-100 min-h-0">
      <!-- Enemy -->
      <div
        class="absolute top-4 right-4 sm:top-10 sm:right-10 flex flex-col items-end transition-all duration-300"
        :class="{ 'animate-shake': isEnemyShaking }"
      >
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
      <div
        class="absolute bottom-4 left-4 sm:bottom-10 sm:left-10 flex flex-col items-start transition-all duration-300"
        :class="{ 'animate-shake': isPlayerShaking }"
      >
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
        <div class="bg-white border-8 border-red-600 p-8 rounded-3xl shadow-2xl text-center">
          <p class="text-red-600 font-black text-xl mb-2">
            {{ $t('battle.incorrect') }}
          </p>
          <p class="text-4xl font-black tracking-widest text-gray-800">
            {{ session.battle.currentWord?.word }}
          </p>
        </div>
      </div>

      <!-- Thrown Word -->
      <div
        v-if="thrownWord"
        class="absolute z-50 font-black text-xl bg-white border-4 border-gray-800 px-4 py-2 rounded-lg shadow-xl animate-throw"
      >
        {{ thrownWord }}
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
      <div
        ref="battleLog"
        class="flex-1 border-b sm:border-b-0 sm:border-r border-gray-300 pr-0 sm:pr-4 overflow-y-auto min-h-0 scroll-smooth"
      >
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
              :ref="el => setActionRef(el, 0)"
              class="col-span-2 bg-blue-600 text-white py-3 rounded-lg font-black border-b-4 border-blue-800 text-sm tracking-widest outline-none transition-all"
              :class="{ 'ring-8 ring-yellow-400 border-yellow-400': actionIndex === 0 }"
              @click="fsm.send(GAME_EVENTS.ATTACK)"
            >
              {{ $t('battle.attack') }}
            </button>
            <button
              :ref="el => setActionRef(el, 1)"
              class="bg-red-500 text-white py-2 rounded-lg font-bold border-b-4 border-red-700 text-xs outline-none transition-all"
              :class="{ 'ring-8 ring-yellow-400 border-yellow-400': actionIndex === 1 }"
              @click="fsm.send(GAME_EVENTS.CAPTURE)"
            >
              {{ $t('battle.capture') }}
            </button>
            <button
              :ref="el => setActionRef(el, 2)"
              class="bg-green-500 text-white py-2 rounded-lg font-bold border-b-4 border-green-700 text-xs outline-none transition-all"
              :class="{ 'ring-8 ring-yellow-400 border-yellow-400': actionIndex === 2 }"
              @click="fsm.send(GAME_EVENTS.SWITCH)"
            >
              {{ $t('battle.switch') }}
            </button>
          </div>
          <button
            :ref="el => setActionRef(el, 3)"
            class="w-full bg-gray-500 text-white py-2 rounded-lg font-bold border-b-4 border-gray-700 mt-2 text-xs outline-none transition-all"
            :class="{ 'ring-8 ring-yellow-400 border-yellow-400': actionIndex === 3 }"
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
              v-for="(mon, index) in session.player.party"
              :key="mon.id"
              :ref="el => setPartyRef(el, index)"
              :disabled="mon.hp <= 0 || mon.id === session.battle.playerMonId"
              class="w-full mb-1 p-1 border-2 border-gray-800 rounded text-[10px] font-bold disabled:opacity-50 outline-none transition-all"
              :class="{ 'ring-8 ring-yellow-400 border-yellow-400': partyIndex === index }"
              @click="fsm.send(GAME_EVENTS.CONFIRM, { monId: mon.id })"
            >
              {{ $t('monsters.' + mon.species) }} (HP: {{ mon.hp }})
            </button>
            <button
              v-if="session.activePlayerMon && session.activePlayerMon.hp > 0"
              :ref="el => setPartyRef(el, session.player.party.length)"
              class="w-full text-xs text-red-500 font-bold mt-1 outline-none transition-all"
              :class="{ 'ring-8 ring-yellow-400 border-yellow-400': partyIndex === session.player.party.length }"
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
              ref="spellingInput"
              v-model="userInput"
              :disabled="isSubmitting"
              class="w-full border-2 border-gray-800 p-1 text-center text-lg rounded-lg outline-none focus:ring-4 focus:ring-blue-400 disabled:opacity-50"
              :placeholder="$t('battle.typeHere')"
              @keydown.enter="submitSpelling"
              @blur="refocusInput"
            >
          </div>
        </template>

        <!-- Results -->
        <template v-if="fsm.matches(GAME_STATES.BATTLE_RESULTS)">
          <ExperienceView
            :participating-mons="session.battle.results || []"
            @continue="fsm.send(GAME_EVENTS.CONTINUE)"
          />
        </template>

        <!-- Whited Out -->
        <template v-if="fsm.matches(GAME_STATES.BATTLE_WHITED_OUT)">
          <button
            ref="whiteoutButton"
            class="bg-red-600 text-white py-4 rounded-xl border-b-8 border-red-800 font-black uppercase text-lg outline-none transition-all"
            :class="{ 'ring-8 ring-yellow-400 border-yellow-400': whiteoutIndex === 0 }"
            @click="fsm.send(GAME_EVENTS.CONFIRM)"
          >
            {{ $t('common.confirm') }}
          </button>
        </template>
      </div>
    </div>

    <!-- Whiteout Full Screen Transition -->
    <transition name="whiteout-fade">
      <div
        v-if="fsm.matches(GAME_STATES.BATTLE_WHITED_OUT)"
        class="fixed inset-0 z-[100] bg-white flex flex-col items-center justify-center p-8 text-center"
      >
        <div class="text-9xl mb-8 animate-pulse">🏥</div>
        <h2 class="text-4xl font-black text-red-600 mb-4 uppercase tracking-tighter">
          {{ $t('battle.whitedOutTitle') }}
        </h2>
        <p class="text-xl font-bold text-gray-700 max-w-md mb-12">
          {{ $t('battle.whitedOutDesc') }}
        </p>
        <button
          class="bg-red-600 text-white px-12 py-4 rounded-2xl font-black uppercase text-2xl border-b-8 border-red-800 active:border-b-0 active:translate-y-2 transition-all"
          @click="fsm.send(GAME_EVENTS.CONFIRM)"
        >
          {{ $t('common.continue') }}
        </button>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed, type ComponentPublicInstance, nextTick } from 'vue';
import { useSessionStore } from '../stores/sessionStore';
import { useGameFSM } from '../stores/gameFSM';
import { speech } from '../utils/speech';
import { getHPColorClass } from '../utils/visuals';
import { GAME_STATES, GAME_EVENTS } from '../utils/constants';
import { useKeyboardNavigation } from '../composables/useKeyboardNavigation';
import ExperienceView from './ExperienceView.vue';

const session = useSessionStore();
const fsm = useGameFSM();

const userInput = ref('');
const isFlashing = ref(false);
const timeLeft = ref(0);
const showMistake = ref(false);
const showPerfect = ref(false);
const isSubmitting = ref(false);
const isEnemyShaking = ref(false);
const isPlayerShaking = ref(false);
const thrownWord = ref('');
const spellingInput = ref<HTMLInputElement | null>(null);
const timerInterval = ref<ReturnType<typeof setInterval> | null>(null);

const battleLog = ref<HTMLElement | null>(null);
const actionRefs = ref<(HTMLElement | null)[]>([]);
const partyRefs = ref<(HTMLElement | null)[]>([]);
const whiteoutButton = ref<HTMLElement | null>(null);

const setActionRef = (el: Element | ComponentPublicInstance | null, index: number) => {
  if (el) actionRefs.value[index] = el as HTMLElement;
  else actionRefs.value[index] = null;
};

const setPartyRef = (el: Element | ComponentPublicInstance | null, index: number) => {
  if (el) partyRefs.value[index] = el as HTMLElement;
  else partyRefs.value[index] = null;
};

const { selectedIndex: actionIndex } = useKeyboardNavigation({
  id: 'battle-actions',
  isActive: computed(() => fsm.matches(GAME_STATES.BATTLE_ACTION_SELECT)),
  maxIndex: computed(() => actionRefs.value.filter(el => !!el).length),
  itemRefs: computed(() => actionRefs.value.filter(el => !!el)),
  spatialMap: [
    { down: 1, left: 3, right: 3 }, // Attack (0)
    { up: 0, right: 2, down: 3 },  // Capture (1)
    { up: 0, left: 1, down: 3 },   // Switch (2)
    { up: 1, left: 0, right: 0 }   // Run (3)
  ],
  onConfirm: (idx) => {
    if (idx === 0) fsm.send(GAME_EVENTS.ATTACK);
    else if (idx === 1) fsm.send(GAME_EVENTS.CAPTURE);
    else if (idx === 2) fsm.send(GAME_EVENTS.SWITCH);
    else if (idx === 3) fsm.send(GAME_EVENTS.RUN);
  }
});

const { selectedIndex: partyIndex } = useKeyboardNavigation({
  id: 'battle-party',
  isActive: computed(() => fsm.matches(GAME_STATES.BATTLE_SWITCHING)),
  maxIndex: computed(() => session.player.party.length + (session.activePlayerMon && session.activePlayerMon.hp > 0 ? 1 : 0)),
  itemRefs: computed(() => partyRefs.value),
  onConfirm: (idx) => {
    if (idx < session.player.party.length) {
      const mon = session.player.party[idx];
      if (mon.hp > 0 && mon.id !== session.battle.playerMonId) {
        fsm.send(GAME_EVENTS.CONFIRM, { monId: mon.id });
      }
    } else {
      fsm.send(GAME_EVENTS.CANCEL);
    }
  },
  onCancel: () => {
    if (session.activePlayerMon && session.activePlayerMon.hp > 0) {
      fsm.send(GAME_EVENTS.CANCEL);
    }
  }
});

const { selectedIndex: whiteoutIndex } = useKeyboardNavigation({
  id: 'battle-whiteout',
  isActive: computed(() => fsm.matches(GAME_STATES.BATTLE_WHITED_OUT)),
  maxIndex: 1,
  itemRefs: computed(() => [whiteoutButton.value]),
  onConfirm: () => fsm.send(GAME_EVENTS.CONFIRM)
});

const submitSpelling = () => {
  if (!session.battle.currentWord || isSubmitting.value) return;
  isSubmitting.value = true;
  const input = userInput.value;
  thrownWord.value = input;

  // Stop narrator immediately
  speech.stop();

  setTimeout(() => {
    thrownWord.value = '';
    fsm.send(GAME_EVENTS.SUBMIT, { input });
    userInput.value = '';
    isSubmitting.value = false;
  }, 1600); // Slightly longer than CSS animation (1500ms)
};

const refocusInput = () => {
  if (fsm.matches(GAME_STATES.BATTLE_SPELLING)) {
    spellingInput.value?.focus();
  }
};

watch(() => session.battle.log, () => {
  nextTick(() => {
    if (battleLog.value) {
      battleLog.value.scrollTop = battleLog.value.scrollHeight;
    }
  });
}, { deep: true });

watch(() => fsm.state as any, (newState, oldState) => {
  // Clear refs on state change to avoid stale elements
  actionRefs.value = [];
  partyRefs.value = [];

  if (newState === GAME_STATES.BATTLE_SPELLING) {
    setTimeout(() => spellingInput.value?.focus(), 50);
    timeLeft.value = session.battle.totalTime;
    if (timerInterval.value) clearInterval(timerInterval.value);
    timerInterval.value = setInterval(() => {
      const elapsed = (Date.now() - (session.battle.startTime || 0)) / 1000;
      timeLeft.value = Math.max(0, session.battle.totalTime - elapsed);
    }, 100);
  } else {
    if (timerInterval.value) {
      clearInterval(timerInterval.value);
      timerInterval.value = null;
    }
  }

  if (newState === GAME_STATES.BATTLE_PLAYER_ATTACK) {
    isEnemyShaking.value = true;
    setTimeout(() => isEnemyShaking.value = false, 500);
  }

  if (newState === GAME_STATES.BATTLE_ENEMY_TURN) {
    if (oldState !== GAME_STATES.BATTLE_SPELLING) { // Don't shake if it was just a miss
        isPlayerShaking.value = true;
        setTimeout(() => isPlayerShaking.value = false, 500);
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
  if (timerInterval.value) clearInterval(timerInterval.value);
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

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  20%, 60% { transform: translateX(-10px); }
  40%, 80% { transform: translateX(10px); }
}
.animate-shake {
  animation: shake 0.1s ease-in-out infinite;
}

@keyframes throw-word {
  0% { left: 20%; bottom: 20%; opacity: 1; transform: scale(1) rotate(0deg); }
  25% { transform: scale(1.2) rotate(-5deg); }
  100% { left: 60%; top: 20%; opacity: 0; transform: scale(0.5) rotate(20deg); }
}
.animate-throw {
  animation: throw-word 1.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
}

.whiteout-fade-enter-active,
.whiteout-fade-leave-active {
  transition: opacity 1s ease;
}
.whiteout-fade-enter-from,
.whiteout-fade-leave-to {
  opacity: 0;
}
</style>
