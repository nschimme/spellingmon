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
        :class="{
          'animate-shake': isEnemyShaking,
          'opacity-0 scale-0': isEnemyCaptured
        }"
      >
        <div class="bg-white border-2 border-gray-800 p-1 sm:p-2 rounded-lg w-36 sm:w-48 shadow-md relative">
          <div class="flex flex-col font-bold leading-tight">
            <div class="flex items-center justify-between">
               <span class="text-[10px] sm:text-sm tracking-tighter">{{ $t('monsters.' + session.battle.enemyMon.species) }}</span>
               <div class="flex gap-0.5">
                  <div v-for="t in session.battle.enemyMon.types" :key="t" :class="TYPE_COLORS[t]" class="w-2 h-2 rounded-full border border-black/20" />
               </div>
            </div>
            <div class="flex items-center gap-2">
               <span class="text-[7px] sm:text-[9px] text-gray-500 uppercase">Lv {{ session.battle.enemyMon.level }}</span>
               <div v-if="session.battle.enemyMon.status !== 'None'" :class="STATUS_COLORS[session.battle.enemyMon.status]" class="px-1 rounded text-[6px] text-white font-black uppercase">
                  {{ session.battle.enemyMon.status }}
               </div>
            </div>
          </div>
          <div class="w-full bg-gray-200 h-1 sm:h-2 rounded mt-0.5 overflow-hidden border border-gray-400">
            <div
              class="h-full transition-all duration-500"
              :class="getHPColorClass(session.battle.enemyMon.hp, session.battle.enemyMon.maxHp)"
              :style="{ width: `${(session.battle.enemyMon.hp / session.battle.enemyMon.maxHp) * 100}%` }"
            />
          </div>
        </div>
        <div class="text-6xl sm:text-8xl lg:text-[10rem] mt-2 sm:mt-4">
          {{ session.battle.enemyMon.emoji }}
        </div>
      </div>

      <!-- Player -->
      <div
        class="absolute bottom-4 left-4 sm:bottom-10 sm:left-10 flex flex-col items-start transition-all duration-300"
        :class="{ 'animate-shake': isPlayerShaking }"
      >
        <div class="text-6xl sm:text-8xl lg:text-[10rem] mb-2 sm:mb-4 scale-x-[-1]">
          {{ session.activePlayerMon.emoji }}
        </div>
        <div class="bg-white border-2 border-gray-800 p-1 sm:p-2 rounded-lg w-36 sm:w-48 shadow-md relative">
          <div class="flex flex-col font-bold leading-tight">
            <div class="flex items-center justify-between">
               <span class="text-[10px] sm:text-sm tracking-tighter">{{ $t('monsters.' + session.activePlayerMon.species) }}</span>
               <div class="flex gap-0.5">
                  <div v-for="t in session.activePlayerMon.types" :key="t" :class="TYPE_COLORS[t]" class="w-2 h-2 rounded-full border border-black/20" />
               </div>
            </div>
            <div class="flex items-center gap-2">
               <span class="text-[7px] sm:text-[9px] text-gray-500 uppercase">Lv {{ session.activePlayerMon.level }}</span>
               <div v-if="session.activePlayerMon.status !== 'None'" :class="STATUS_COLORS[session.activePlayerMon.status]" class="px-1 rounded text-[6px] text-white font-black uppercase">
                  {{ session.activePlayerMon.status }}
               </div>
            </div>
          </div>
          <div class="w-full bg-gray-200 h-1 sm:h-2 rounded mt-0.5 overflow-hidden border border-gray-400">
            <div
              class="h-full transition-all duration-500"
              :class="getHPColorClass(session.activePlayerMon.hp, session.activePlayerMon.maxHp)"
              :style="{ width: `${(session.activePlayerMon.hp / session.activePlayerMon.maxHp) * 100}%` }"
            />
          </div>
        </div>
      </div>

      <!-- Perfect/Mistake Feedback Overlay -->
      <transition name="pop-in">
        <div
          v-if="showMistake"
          class="absolute inset-0 z-50 flex items-center justify-center bg-red-600/30 backdrop-blur-sm"
        >
          <div class="bg-white border-8 border-red-600 p-6 rounded-[2rem] shadow-2xl text-center transform scale-110">
            <p class="text-red-600 font-black text-xl mb-2 uppercase tracking-tighter">
              {{ $t('battle.incorrect') }}
            </p>
            <p class="text-4xl font-black tracking-widest text-gray-800">
              {{ session.battle.currentWord?.word }}
            </p>
          </div>
        </div>
      </transition>

      <transition name="pop-in">
        <div
          v-if="showCorrect"
          class="absolute inset-0 z-50 flex items-center justify-center pointer-events-none"
        >
          <div class="flex flex-col items-center gap-4">
            <div class="bg-green-500 border-8 border-white p-6 rounded-full shadow-2xl animate-bounce-gentle">
              <p class="text-white font-black uppercase text-3xl italic tracking-tighter">
                {{ $t('battle.good') }}
              </p>
            </div>
            <div
              v-if="showFast"
              class="bg-blue-500 border-4 border-white px-4 py-2 rounded-xl shadow-xl animate-pulse"
            >
              <p class="text-white font-black uppercase text-xl italic">
                {{ $t('battle.fast') }}
              </p>
            </div>
          </div>
        </div>
      </transition>

      <transition name="pop-in">
        <div
          v-if="showPerfect"
          class="absolute inset-0 z-50 flex items-center justify-center pointer-events-none"
        >
          <div class="flex flex-col items-center gap-4">
            <div class="bg-yellow-400 border-8 border-white p-8 rounded-full shadow-2xl animate-bounce-gentle ring-8 ring-yellow-400/50">
              <p class="text-white font-black uppercase text-5xl italic tracking-tighter">
                {{ $t('battle.perfect') }}
              </p>
            </div>
            <div
              v-if="showFast"
              class="bg-blue-500 border-4 border-white px-4 py-2 rounded-xl shadow-xl animate-pulse"
            >
              <p class="text-white font-black uppercase text-xl italic">
                {{ $t('battle.fast') }}
              </p>
            </div>
          </div>
        </div>
      </transition>

      <!-- Thrown Word / Ball -->
      <div
        v-if="thrownWord"
        class="fixed z-50 pointer-events-none"
        :class="session.battle.isCapturing ? 'text-6xl animate-throw-ball' : 'font-black text-xl bg-white border-4 border-gray-800 px-4 py-2 rounded-lg shadow-xl animate-throw'"
        style="left: 0; top: 0;"
      >
        <template v-if="session.battle.isCapturing">
          <div :class="{ 'animate-ball-wobble': isBallWobbling }">
            🔴
          </div>
        </template>
        <template v-else>
          {{ thrownWord }}
        </template>
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
              @click="handleAction(GAME_EVENTS.ATTACK)"
            >
              {{ $t('battle.attack') }}
            </button>
            <button
              :ref="el => setActionRef(el, 1)"
              class="bg-red-500 text-white py-2 rounded-lg font-bold border-b-4 border-red-700 text-xs outline-none transition-all"
              :class="{ 'ring-8 ring-yellow-400 border-yellow-400': actionIndex === 1 }"
              @click="handleAction(GAME_EVENTS.CAPTURE)"
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

        <!-- Move Selection -->
        <template v-if="fsm.matches(GAME_STATES.BATTLE_MOVE_SELECT)">
          <div class="grid grid-cols-2 gap-2">
            <button
              v-for="(moveId, idx) in session.activePlayerMon?.moves"
              :key="moveId"
              :ref="el => setMoveRef(el, idx)"
              class="relative overflow-hidden text-white p-2 rounded-lg font-black border-b-4 border-black/20 text-[10px] uppercase tracking-tighter outline-none transition-all h-12 flex flex-col items-center justify-center leading-none"
              :class="[TYPE_COLORS[MOVES[moveId]?.type], { 'ring-4 ring-yellow-400 scale-105 z-10': moveIndex === idx }]"
              @click="fsm.send(GAME_EVENTS.CONFIRM, { moveId })"
            >
              <span>{{ $t('moves.' + moveId) }}</span>
              <div class="flex items-center gap-1 mt-1">
                 <span v-if="MOVES[moveId]?.category === 'Physical'" title="Physical">💥</span>
                 <span v-else-if="MOVES[moveId]?.category === 'Special'" title="Special">✨</span>
                 <span v-else title="Status">🛡️</span>
                 <span v-if="getEffectiveness(moveId)" class="bg-black/30 px-1 rounded text-[8px] italic">
                    {{ getEffectiveness(moveId) }}
                 </span>
              </div>
            </button>
            <button
               class="col-span-2 text-[10px] font-bold text-gray-500 hover:text-gray-800 uppercase tracking-widest mt-1"
               @click="fsm.send(GAME_EVENTS.BACK)"
            >
               &lt; {{ $t('common.back') }}
            </button>
          </div>
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
        <div
          v-show="fsm.matches(GAME_STATES.BATTLE_SPELLING)"
          class="text-center flex flex-col h-full justify-between"
        >
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
          <div class="relative flex items-center">
            <input
              ref="spellingInput"
              v-model="userInput"
              :disabled="isSubmitting"
              class="w-full border-2 border-gray-800 p-1 pr-12 text-center text-lg rounded-lg outline-none focus:ring-4 focus:ring-blue-400 disabled:opacity-50"
              :placeholder="$t('battle.typeHere')"
              autocomplete="off"
              autocorrect="off"
              autocapitalize="off"
              spellcheck="false"
              @keydown.enter="submitSpelling"
              @blur="refocusInput"
            >
            <button
              class="absolute right-1 w-10 h-10 bg-blue-600 text-white rounded-md flex items-center justify-center text-xl active:bg-blue-800 transition-colors shadow-sm"
              @click="submitSpelling"
            >
              ➜
            </button>
          </div>
        </div>

        <!-- Learn Move -->
        <template v-if="session.moveLearningPending">
           <div class="flex flex-col h-full text-center">
              <p class="text-[10px] font-bold mb-1">
                 {{ $t('battle.learnMovePrompt', { move: $t('moves.' + session.moveLearningPending.moveId) }) }}
              </p>
              <div class="grid grid-cols-2 gap-1 flex-1 overflow-y-auto">
                 <button
                    v-for="mId in session.player.party.find(m => m.id === session.moveLearningPending!.monId)?.moves"
                    :key="mId"
                    class="bg-gray-200 border-2 border-gray-800 p-1 rounded text-[8px] font-bold"
                    @click="session.learnMove(session.moveLearningPending!.monId, session.moveLearningPending!.moveId, mId)"
                 >
                    {{ $t('battle.replaceMove', { move: $t('moves.' + mId) }) }}
                 </button>
              </div>
              <button class="text-[10px] text-red-500 font-bold mt-1" @click="session.cancelMoveLearning()">
                 Don't learn
              </button>
           </div>
        </template>

        <!-- Results -->
        <template v-if="fsm.matches(GAME_STATES.BATTLE_RESULTS)">
          <ExperienceView
            :participating-mons="session.battle.results || []"
            @continue="fsm.send(GAME_EVENTS.CONTINUE)"
          />
        </template>

        <!-- Party Full -->
        <template v-if="fsm.matches(GAME_STATES.BATTLE_PARTY_FULL)">
          <div class="flex flex-col h-full">
            <p class="text-[10px] font-bold text-center mb-1 text-red-600">
              {{ $t('battle.partyFull') }}
            </p>
            <div class="flex-1 overflow-y-auto pr-1">
              <button
                v-for="(mon, index) in session.player.party"
                :key="mon.id"
                :ref="el => setReplaceRef(el, index)"
                class="w-full mb-1 p-1 border-2 border-gray-800 rounded text-[10px] font-bold outline-none transition-all"
                :class="{ 'ring-8 ring-yellow-400 border-yellow-400': replaceIndex === index }"
                @click="fsm.send(GAME_EVENTS.REPLACE, { replaceMonId: mon.id })"
              >
                {{ $t('monsters.' + mon.species) }} (Lv {{ mon.level }})
              </button>
              <button
                :ref="el => setReplaceRef(el, session.player.party.length)"
                class="w-full text-xs text-red-500 font-bold mt-1 outline-none transition-all"
                :class="{ 'ring-8 ring-yellow-400 border-yellow-400': replaceIndex === session.player.party.length }"
                @click="fsm.send(GAME_EVENTS.RELEASE)"
              >
                {{ $t('battle.release') }}
              </button>
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed, type ComponentPublicInstance, nextTick } from 'vue';
import { useSessionStore } from '../stores/sessionStore';
import { useGameFSM } from '../stores/gameFSM';
import { speech } from '../utils/speech';
import { getHPColorClass, TYPE_COLORS, STATUS_COLORS } from '../utils/visuals';
import { GAME_STATES, GAME_EVENTS } from '../utils/constants';
import { MOVES, TYPE_CHART } from '../utils/gameData';
import { useKeyboardNavigation } from '../composables/useKeyboardNavigation';
import ExperienceView from './ExperienceView.vue';

const session = useSessionStore();
const fsm = useGameFSM();

const userInput = ref('');
const isFlashing = ref(false);
const timeLeft = ref(0);
const showMistake = ref(false);
const showCorrect = ref(false);
const showPerfect = ref(false);
const showFast = ref(false);
const isSubmitting = ref(false);
const isEnemyShaking = ref(false);
const isPlayerShaking = ref(false);
const isEnemyCaptured = ref(false);
const isBallWobbling = ref(false);
const thrownWord = ref('');
const spellingInput = ref<HTMLInputElement | null>(null);
const timerInterval = ref<ReturnType<typeof setInterval> | null>(null);
const spellingFocusTimeout = ref<ReturnType<typeof setTimeout> | null>(null);

const battleLog = ref<HTMLElement | null>(null);
const actionRefs = ref<(HTMLElement | null)[]>([]);
const moveRefs = ref<(HTMLElement | null)[]>([]);
const partyRefs = ref<(HTMLElement | null)[]>([]);
const replaceRefs = ref<(HTMLElement | null)[]>([]);

const setActionRef = (el: Element | ComponentPublicInstance | null, index: number) => {
  if (el) actionRefs.value[index] = el as HTMLElement;
  else actionRefs.value[index] = null;
};

const setPartyRef = (el: Element | ComponentPublicInstance | null, index: number) => {
  if (el) partyRefs.value[index] = el as HTMLElement;
  else partyRefs.value[index] = null;
};

const setReplaceRef = (el: Element | ComponentPublicInstance | null, index: number) => {
  if (el) replaceRefs.value[index] = el as HTMLElement;
  else replaceRefs.value[index] = null;
};

const setMoveRef = (el: Element | ComponentPublicInstance | null, index: number) => {
  if (el) moveRefs.value[index] = el as HTMLElement;
  else moveRefs.value[index] = null;
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
    if (idx === 0) handleAction(GAME_EVENTS.ATTACK);
    else if (idx === 1) handleAction(GAME_EVENTS.CAPTURE);
    else if (idx === 2) handleAction(GAME_EVENTS.SWITCH);
    else if (idx === 3) handleAction(GAME_EVENTS.RUN);
  }
});

const handleAction = (event: string) => {
  if (event === GAME_EVENTS.CAPTURE) {
    // Crucial for iOS: Focus MUST be triggered inside the same click event handler
    spellingInput.value?.focus();
  }
  fsm.send(event);
};

const { selectedIndex: moveIndex } = useKeyboardNavigation({
  id: 'battle-moves',
  isActive: computed(() => fsm.matches(GAME_STATES.BATTLE_MOVE_SELECT)),
  maxIndex: computed(() => session.activePlayerMon?.moves.length || 0),
  itemRefs: computed(() => moveRefs.value.filter(el => !!el)),
  spatialMap: [
    { right: 1, down: 2 }, // 0
    { left: 0, down: 3 },  // 1
    { up: 0, right: 3 },   // 2
    { up: 1, left: 2 }    // 3
  ],
  onConfirm: (idx) => {
    const moveId = session.activePlayerMon?.moves[idx];
    if (moveId) {
      spellingInput.value?.focus();
      fsm.send(GAME_EVENTS.CONFIRM, { moveId });
    }
  },
  onCancel: () => fsm.send(GAME_EVENTS.BACK)
});

const getEffectiveness = (moveId: string) => {
  if (!session.battle.enemyMon) return null;
  const move = MOVES[moveId];
  if (!move || move.category === 'Status') return null;

  let mod = 1;
  session.battle.enemyMon.types.forEach(t => {
    mod *= TYPE_CHART[move.type]?.[t] || 1;
  });

  if (mod > 1) return session.t('battle.effectiveness.super');
  if (mod > 0 && mod < 1) return session.t('battle.effectiveness.weak');
  if (mod === 0) return session.t('battle.effectiveness.none');
  return null;
};

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

const { selectedIndex: replaceIndex } = useKeyboardNavigation({
  id: 'battle-replace',
  isActive: computed(() => fsm.matches(GAME_STATES.BATTLE_PARTY_FULL)),
  maxIndex: computed(() => session.player.party.length + 1),
  itemRefs: computed(() => replaceRefs.value),
  onConfirm: (idx) => {
    if (idx < session.player.party.length) {
      const mon = session.player.party[idx];
      fsm.send(GAME_EVENTS.REPLACE, { replaceMonId: mon.id });
    } else {
      fsm.send(GAME_EVENTS.RELEASE);
    }
  }
});


const submitSpelling = () => {
  if (!session.battle.currentWord || isSubmitting.value) return;
  isSubmitting.value = true;
  const input = userInput.value;
  thrownWord.value = input;

  // Stop narrator immediately
  speech.stop();

  const isCapturing = session.battle.isCapturing;
  const animDuration = isCapturing ? 4000 : 1600;

  if (isCapturing) {
    // Stage 1: Ball hits enemy
    setTimeout(() => {
      isEnemyCaptured.value = true;
      isBallWobbling.value = true;
    }, 1800);

    // Stage 2: Wobble ends
    setTimeout(() => {
      isBallWobbling.value = false;
    }, 3500);
  }

  setTimeout(() => {
    thrownWord.value = '';
    isEnemyCaptured.value = false;
    fsm.send(GAME_EVENTS.SUBMIT, { input });
    userInput.value = '';
    isSubmitting.value = false;
  }, animDuration);
};

const refocusInput = () => {
  if (fsm.matches(GAME_STATES.BATTLE_SPELLING)) {
    spellingInput.value?.focus();
  }
};

const clearFocusTimer = () => {
  if (spellingFocusTimeout.value) {
    clearTimeout(spellingFocusTimeout.value);
    spellingFocusTimeout.value = null;
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
  replaceRefs.value = [];

  if (newState === GAME_STATES.BATTLE_SPELLING || newState === GAME_STATES.BATTLE_MOVE_SELECT) {
     actionRefs.value = [];
     moveRefs.value = [];
  }

  if (newState === GAME_STATES.BATTLE_SPELLING) {
    clearFocusTimer();
    userInput.value = '';
    nextTick(() => {
      // Immediate focus attempt
      spellingInput.value?.focus();
      // Staggered attempts for mobile keyboard reliability
      setTimeout(() => spellingInput.value?.focus(), 10);
      setTimeout(() => spellingInput.value?.focus(), 50);
      spellingFocusTimeout.value = setTimeout(() => {
        spellingInput.value?.focus();
      }, 150);
    });
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
    clearFocusTimer();
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

  if (newState === GAME_STATES.BATTLE_PLAYER_ATTACK && fsm.params.isCorrect) {
    if (fsm.params.isPower) {
      showFast.value = true;
      setTimeout(() => showFast.value = false, 1500);
    }

    if (fsm.params.isPerfect) {
      showPerfect.value = true;
      setTimeout(() => showPerfect.value = false, 1500);
    } else {
      showCorrect.value = true;
      setTimeout(() => showCorrect.value = false, 1500);
    }
  }

});

onMounted(() => {
  isFlashing.value = true;
  setTimeout(() => isFlashing.value = false, 500);
});

onUnmounted(() => {
  if (timerInterval.value) clearInterval(timerInterval.value);
  clearFocusTimer();
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
  0% { transform: translate(20vw, 80vh) scale(1) rotate(0deg); opacity: 1; }
  50% { transform: translate(50vw, 30vh) scale(1.1) rotate(-10deg); opacity: 1; }
  100% { transform: translate(80vw, 15vh) scale(0.6) rotate(20deg); opacity: 0; }
}
.animate-throw {
  animation: throw-word 1.5s ease-in-out forwards;
}

@keyframes throw-ball {
  0% { transform: translate(20vw, 80vh) scale(1) rotate(0deg); opacity: 1; }
  30% { transform: translate(50vw, 20vh) scale(1.2) rotate(180deg); opacity: 1; }
  45% { transform: translate(75vw, 25vh) scale(1) rotate(360deg); opacity: 1; }
  100% { transform: translate(75vw, 25vh) scale(1) rotate(360deg); opacity: 1; }
}
.animate-throw-ball {
  animation: throw-ball 4s ease-in-out forwards;
}

@keyframes ball-wobble {
  0%, 100% { transform: rotate(0deg); }
  25% { transform: rotate(-20deg); }
  50% { transform: rotate(20deg); }
  75% { transform: rotate(-10deg); }
}
.animate-ball-wobble {
  animation: ball-wobble 0.5s ease-in-out 3;
  animation-delay: 1.5s;
}

</style>
