<template>
  <div
    v-if="battleStore.inBattle && battleStore.playerMon && battleStore.enemyMon"
    class="fixed inset-0 bg-white z-40 flex flex-col p-4 overflow-hidden"
    :class="{ 'animate-flash': isFlashing }"
    :style="{
      '--flash-duration': ANIMATION_DURATIONS.FLASH_MS + 'ms',
      '--shake-duration': '100ms',
      '--capture-duration': ANIMATION_DURATIONS.CAPTURE_PROCESS_MS / 3 + 'ms'
    }"
  >
    <!-- Battle Field -->
    <div class="flex-1 relative border-4 border-gray-800 rounded-lg overflow-hidden bg-gradient-to-b from-blue-100 to-green-100 min-h-0">
      <!-- Enemy -->
      <div
        class="absolute top-4 right-4 sm:top-10 sm:right-10 flex flex-col items-end transition-all duration-300"
        :class="{ 'opacity-0 translate-y-10': enemyFainted }"
      >
        <div
          class="flex flex-col items-end"
          :class="{ 'animate-shake': enemyShake }"
        >
          <div class="bg-white border-2 border-gray-800 p-1 sm:p-2 rounded-lg w-36 sm:w-48 shadow-md">
            <div class="flex flex-col font-bold leading-tight">
              <div class="flex justify-between items-start">
                <div class="flex flex-col">
                  <span class="text-[10px] sm:text-sm uppercase tracking-tighter">{{ battleStore.enemyMon.name }}</span>
                  <span class="text-[7px] sm:text-[9px] text-gray-500 uppercase -mt-0.5">Lv {{ battleStore.enemyMon.level }}</span>
                </div>
                <div class="flex flex-col items-end opacity-80">
                  <span class="text-[10px] sm:text-xs">{{ TYPE_EMOJIS[MONS[battleStore.enemyMon.species]?.type] }}</span>
                  <span class="text-[6px] sm:text-[8px] uppercase tracking-widest text-gray-400">{{ battleStore.enemyMon.type }}</span>
                </div>
              </div>
            </div>
            <div class="w-full bg-gray-200 h-1 sm:h-2 rounded mt-0.5 overflow-hidden">
              <div
                class="h-full transition-all duration-500"
                :class="getHPColorClass(battleStore.enemyMon.hp, battleStore.enemyMon.maxHp)"
                :style="{ width: `${(battleStore.enemyMon.hp / battleStore.enemyMon.maxHp) * 100}%` }"
              />
            </div>
            <div class="text-[8px] sm:text-xs text-right">
              {{ battleStore.enemyMon.hp }} / {{ battleStore.enemyMon.maxHp }}
            </div>
          </div>
          <!-- Hide sprite during the capture ball animation (when isCapturing and word is gone) -->
          <div
            class="text-4xl sm:text-6xl mt-2 sm:mt-4 transition-transform duration-300"
            :class="{ 'scale-0 opacity-0': battleStore.isCapturing && !battleStore.currentWord }"
          >
            {{ battleStore.enemyMon.emoji }}
          </div>
        </div>

        <!-- Capture Ball Anim -->
        <div
          v-if="battleStore.isCapturing && !battleStore.currentWord"
          class="absolute inset-0 flex items-center justify-center animate-capture"
        >
          <div class="text-2xl sm:text-4xl">
            🔴
          </div>
        </div>
      </div>

      <!-- Player -->
      <div
        class="absolute bottom-4 left-4 sm:bottom-10 sm:left-10 flex flex-col items-start transition-all duration-300"
        :class="{ 'opacity-0 translate-y-10': playerFainted }"
      >
        <div
          class="flex flex-col items-start"
          :class="{ 'animate-shake': playerShake }"
        >
          <div class="text-4xl sm:text-6xl mb-2 sm:mb-4 scale-x-[-1]">
            {{ battleStore.playerMon.emoji }}
          </div>
          <div class="bg-white border-2 border-gray-800 p-1 sm:p-2 rounded-lg w-36 sm:w-48 shadow-md">
            <div class="flex flex-col font-bold leading-tight">
              <div class="flex justify-between items-start">
                <div class="flex flex-col">
                  <span class="text-[10px] sm:text-sm uppercase tracking-tighter">{{ battleStore.playerMon.name }}</span>
                  <span class="text-[7px] sm:text-[9px] text-gray-500 uppercase -mt-0.5">Lv {{ battleStore.playerMon.level }}</span>
                </div>
                <div class="flex flex-col items-end opacity-80">
                  <span class="text-[10px] sm:text-xs">{{ TYPE_EMOJIS[MONS[battleStore.playerMon.species]?.type] }}</span>
                  <span class="text-[6px] sm:text-[8px] uppercase tracking-widest text-gray-400">{{ battleStore.playerMon.type }}</span>
                </div>
              </div>
            </div>
            <div class="w-full bg-gray-200 h-1 sm:h-2 rounded mt-0.5 overflow-hidden">
              <div
                class="h-full transition-all duration-500"
                :class="getHPColorClass(battleStore.playerMon.hp, battleStore.playerMon.maxHp)"
                :style="{ width: `${(battleStore.playerMon.hp / battleStore.playerMon.maxHp) * 100}%` }"
              />
            </div>
            <div class="text-[8px] sm:text-xs text-right">
              {{ battleStore.playerMon.hp }} / {{ battleStore.playerMon.maxHp }}
            </div>
          </div>
        </div>
      </div>
      <!-- Thrown Word Animation -->
      <div
        v-if="thrownWord"
        class="absolute z-50 pointer-events-none font-black text-xl sm:text-2xl text-blue-600 bg-white/90 px-4 py-2 rounded-lg border-4 border-blue-600 shadow-xl animate-throw"
        :style="{
          '--start-x': '10%',
          '--start-y': '80%',
          '--end-x': '70%',
          '--end-y': '20%'
        }"
      >
        {{ thrownWord }}
      </div>

      <!-- Mistake Feedback -->
      <div
        v-if="mistakeWord"
        class="absolute inset-0 z-50 flex items-center justify-center bg-red-600/20 backdrop-blur-sm webkit-backdrop-blur-sm"
      >
        <div class="bg-white border-8 border-red-600 p-8 rounded-3xl shadow-2xl text-center transform -rotate-2 animate-bounce">
          <p class="text-red-600 font-black uppercase text-xl mb-2">
            {{ $t('battle.incorrect') }}
          </p>
          <p class="text-gray-500 font-bold uppercase text-[10px] mb-1">
            {{ $t('battle.shouldHaveBeen') }}
          </p>
          <p class="text-4xl font-black uppercase tracking-widest text-gray-800">
            {{ mistakeWord }}
          </p>
        </div>
      </div>
    </div>

    <!-- Battle Log & Input -->
    <div class="h-48 mt-4 border-4 border-gray-800 rounded-lg flex flex-col sm:flex-row p-4 bg-white overflow-hidden">
      <div class="flex-1 border-b sm:border-b-0 sm:border-r border-gray-300 pr-0 sm:pr-4 overflow-y-auto min-h-0">
        <div
          v-for="(log, i) in battleStore.battleLog"
          :key="i"
          class="mb-1 text-xs sm:text-sm font-bold"
        >
          {{ log }}
        </div>
      </div>

      <div class="w-full sm:w-1/3 pl-0 sm:pl-4 mt-2 sm:mt-0 flex flex-col justify-center gap-2 shrink-0">
        <template v-if="battleStore.isPlayerTurn && !battleStore.currentWord && !battleStore.isSwitching">
          <div class="grid grid-cols-2 gap-2">
            <button
              :class="{ 'ring-8 ring-yellow-400': selectedIndex === 0 }"
              class="col-span-2 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-black uppercase border-b-4 border-blue-800 active:translate-y-1 text-sm tracking-widest shadow-lg"
              @click="prepareAttack"
            >
              {{ $t('battle.attack') }}
            </button>
            <button
              :disabled="battleStore.isCapturing"
              :class="{ 'ring-8 ring-yellow-400': selectedIndex === 1 }"
              class="bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 font-bold uppercase border-b-4 border-red-700 active:translate-y-1 disabled:opacity-50 text-xs"
              @click="tryCapture"
            >
              {{ $t('battle.capture') }}
            </button>
            <button
              :class="{ 'ring-8 ring-yellow-400': selectedIndex === 2 }"
              class="bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 font-bold uppercase border-b-4 border-green-700 active:translate-y-1 text-xs"
              @click="battleStore.isSwitching = true; battleStore.setPhase(BATTLE_PHASES.SWITCHING);"
            >
              {{ $t('battle.switch') }}
            </button>
          </div>
          <button
            :class="{ 'ring-8 ring-yellow-400': selectedIndex === 3 }"
            class="w-full bg-gray-500 text-white py-2 rounded-lg hover:bg-gray-600 font-bold uppercase border-b-4 border-gray-700 active:translate-y-1 mt-2 text-xs"
            @click="tryRun"
          >
            {{ $t('battle.run') }}
          </button>
        </template>

        <template v-if="battleStore.isSwitching">
          <p class="text-xs font-bold text-center mb-1">
            {{ $t('battle.switchWho') }}
          </p>
          <div class="flex-1 overflow-y-auto pr-1 scroll-smooth">
            <button
              v-for="(mon, i) in playerStore.party"
              :key="i"
              :ref="el => { if (el) switchButtons[i] = el }"
              :disabled="mon.hp <= 0 || mon.id === battleStore.playerMon.id"
              class="w-full mb-1 p-1 border-2 border-gray-800 rounded text-[10px] font-bold disabled:opacity-50"
              :class="[
                mon.id === battleStore.playerMon.id ? 'bg-blue-100' : 'bg-white',
                switchingSelectedIndex === i ? 'ring-8 ring-yellow-400 border-yellow-400' : ''
              ]"
              @click="handleSwitch(mon)"
            >
              {{ mon.name }} (HP: {{ mon.hp }})
            </button>
            <button
              v-show="battleStore.playerMon.hp > 0"
              :ref="el => { if (el) switchButtons[playerStore.party.length] = el }"
              :class="{ 'ring-8 ring-yellow-400': switchingSelectedIndex === playerStore.party.length }"
              class="w-full text-xs text-red-500 font-bold mt-1 p-1"
              @click="battleStore.isSwitching = false; battleStore.setPhase(BATTLE_PHASES.SELECT_ACTION);"
            >
              {{ $t('common.cancel') }}
            </button>
          </div>
        </template>

        <template v-if="battleStore.currentWord">
          <div class="text-center flex flex-col h-full justify-between pb-1">
            <div class="px-1">
              <!-- Timer Bar -->
              <div class="w-full bg-gray-200 h-2 rounded-full overflow-hidden mb-2 border border-gray-400">
                <div
                  class="h-full transition-all duration-100"
                  :class="timeLeft > (totalTime / 2) ? 'bg-yellow-400' : 'bg-red-500'"
                  :style="{ width: `${(timeLeft / totalTime) * 100}%` }"
                />
              </div>

              <div class="overflow-y-auto max-h-16">
                <p
                  v-if="battleStore.currentWord.definition"
                  class="text-[10px] leading-tight mb-1 italic"
                >
                  "{{ battleStore.currentWord.definition }}"
                </p>
                <p
                  v-if="battleStore.currentWord.sentence_context"
                  class="text-[10px] leading-tight font-bold mb-1"
                >
                  {{ getMaskedSentence(battleStore.currentWord.sentence_context, battleStore.currentWord.word) }}
                </p>
              </div>
            </div>
            <div>
              <button
                class="text-blue-500 text-[10px] underline mb-1 block w-full"
                @click="repeatWord"
              >
                {{ $t('battle.listenAgain') }}
              </button>
              <input
                ref="spellingInput"
                v-model="userInput"
                class="w-full border-2 border-gray-800 p-1 text-center text-lg uppercase rounded-lg"
                :placeholder="$t('battle.typeHere')"
                autocomplete="off"
                autocorrect="off"
                autocapitalize="off"
                spellcheck="false"
                x-inputmode="text"
                inputmode="text"
                autofocus
                @keydown.enter="submitSpelling"
                @paste.prevent
              >
              <p class="text-[8px] text-red-500 font-bold mt-1 uppercase">
                {{ $t('battle.spellForPower') }}
              </p>
            </div>
          </div>
        </template>
      </div>
    </div>
    <ExperienceView
      v-if="showResults"
      :participating-mons="participatingMons"
      @continue="battleStore.endBattle()"
    />

    <!-- Party Full Replacement Modal -->
    <div
      v-if="battleStore.phase === BATTLE_PHASES.PARTY_FULL_REPLACE && battleStore.pendingCapture"
      class="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md webkit-backdrop-blur-md flex items-center justify-center p-4"
    >
      <div class="bg-white border-8 border-gray-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col">
        <div class="bg-yellow-500 p-6 text-center border-b-8 border-gray-800">
          <h2 class="text-2xl sm:text-3xl font-black text-white uppercase tracking-tighter">
            {{ $t('battle.partyFull') }}
          </h2>
          <p class="text-white font-bold text-xs uppercase opacity-90">
            {{ $t('battle.partyFullDesc') }}
          </p>
        </div>

        <div class="flex-1 p-6 space-y-4 bg-gray-50 overflow-y-auto">
          <div class="flex items-center gap-4 p-4 bg-yellow-100 border-4 border-yellow-400 rounded-2xl mb-6 shadow-sm">
            <div class="text-5xl animate-bounce">
              {{ battleStore.pendingCapture.emoji }}
            </div>
            <div class="flex-1">
              <p class="text-[10px] font-black text-yellow-700 uppercase">
                {{ $t('battle.newCapture') }}
              </p>
              <h3 class="text-2xl font-black text-gray-800 uppercase">
                {{ battleStore.pendingCapture.name }}
              </h3>
              <p class="text-sm font-bold text-gray-500 uppercase">
                Level {{ battleStore.pendingCapture.level }} • {{ battleStore.pendingCapture.type }}
              </p>
            </div>
          </div>

          <p class="text-center font-black text-gray-400 uppercase text-xs tracking-widest">
            {{ $t('battle.currentParty') }}
          </p>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              v-for="(mon, i) in playerStore.party"
              :key="mon.id"
              :class="{ 'ring-8 ring-yellow-400 border-yellow-400 bg-yellow-50': partyReplaceSelectedIndex === i }"
              class="flex items-center gap-3 p-3 bg-white border-4 border-gray-800 rounded-xl hover:bg-gray-100 transition-all text-left"
              @click="handleReplaceMon(i)"
            >
              <div class="text-2xl">
                {{ mon.emoji }}
              </div>
              <div class="flex-1">
                <div class="flex justify-between items-center">
                  <span class="font-black text-sm uppercase truncate">{{ mon.name }}</span>
                  <span class="text-[10px] font-bold text-blue-600">Lv {{ mon.level }}</span>
                </div>
                <div class="w-full bg-gray-200 h-1 rounded-full mt-1">
                  <div
                    class="h-full bg-green-500 rounded-full"
                    :style="{ width: `${(mon.hp / mon.maxHp) * 100}%` }"
                  />
                </div>
              </div>
            </button>
          </div>
        </div>

        <div class="p-6 bg-gray-100 border-t-8 border-gray-800 flex flex-col sm:flex-row gap-4">
          <button
            :class="{ 'ring-8 ring-yellow-400': partyReplaceSelectedIndex === playerStore.party.length }"
            class="flex-1 bg-gray-400 text-white py-4 rounded-xl border-b-8 border-gray-600 font-black uppercase text-lg tracking-widest hover:bg-gray-500 active:translate-y-2 transition-all shadow-lg"
            @click="handleReleaseNewMon"
          >
            {{ $t('battle.releaseNew') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Whited Out Modal -->
    <div
      v-if="battleStore.phase === BATTLE_PHASES.WHITED_OUT"
      class="fixed inset-0 z-[100] bg-white flex flex-col items-center justify-center p-8 text-center"
    >
      <div class="mb-8 text-8xl">
        🏥
      </div>
      <h2 class="text-6xl font-black text-gray-800 mb-4 uppercase tracking-tighter italic">
        {{ $t('battle.whitedOutTitle') }}
      </h2>
      <p class="text-xl font-bold text-gray-600 mb-12 max-w-md">
        {{ $t('battle.whitedOutDesc') }}
      </p>
      <button
        :class="{ 'ring-8 ring-yellow-400': whitedOutSelectedIndex === 0 }"
        class="bg-red-600 text-white px-16 py-6 rounded-2xl border-b-8 border-red-800 font-black uppercase text-2xl tracking-widest hover:bg-red-700 active:translate-y-2 transition-all shadow-2xl"
        @click="handleWhiteoutConfirm"
      >
        {{ $t('common.confirm') }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, watch, onUnmounted, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useBattleStore } from '../stores/battleStore';
import { useVocabStore } from '../stores/vocabStore';
import { usePlayerStore } from '../stores/playerStore';
import { useSettingsStore } from '../stores/settingsStore';
import { useInputStore } from '../stores/inputStore';
import { speech } from '../utils/speech';
import { audio } from '../utils/audio';
import { getHPColorClass } from '../utils/visuals';
import { SOUND_EFFECTS, ANIMATION_DURATIONS, BATTLE_TYPES, INPUT_PRIORITIES, BATTLE_PHASES } from '../utils/constants';
import { calculateExpGain, calculateDamage, createMon, TYPE_EMOJIS, calculateTimerDuration } from '../utils/gameData';
import { useKeyboardNavigation } from '../composables/useKeyboardNavigation';
import ExperienceView from './ExperienceView.vue';

const { t } = useI18n();
const battleStore = useBattleStore();
const vocabStore = useVocabStore();
const playerStore = usePlayerStore();
const settingsStore = useSettingsStore();
const inputStore = useInputStore();

const userInput = ref('');
const isForcedSwitch = ref(false);
const hintTimeouts = ref([]);

const timeLeft = ref(0);
const totalTime = ref(0);
let timerInterval = null;

const enemyShake = ref(false);
const playerShake = ref(false);
const enemyFainted = ref(false);
const playerFainted = ref(false);
const isFlashing = ref(false);
const showResults = ref(false);
const participatingMons = ref([]);
const thrownWord = ref('');
const mistakeWord = ref('');
const spellingInput = ref(null);
const switchButtons = ref([]);

const triggerShake = (isEnemy) => {
  if (isEnemy) {
    enemyShake.value = true;
    setTimeout(() => enemyShake.value = false, ANIMATION_DURATIONS.SHAKE_MS);
  } else {
    playerShake.value = true;
    setTimeout(() => playerShake.value = false, ANIMATION_DURATIONS.SHAKE_MS);
  }
};

const startTimer = (seconds) => {
  if (timerInterval) clearInterval(timerInterval);
  timeLeft.value = seconds;
  totalTime.value = seconds;
  timerInterval = setInterval(() => {
    timeLeft.value -= 0.1;
    if (timeLeft.value <= 0) {
      timeLeft.value = 0;
      clearInterval(timerInterval);
      // Timer expired, but we don't auto-submit.
      // User must still type and press Enter.
      battleStore.log(t('battle.timesUp'));
    }
  }, 100);
};

const prepareAttack = () => {
  audio.playSound(SOUND_EFFECTS.CLICK);
  battleStore.setPhase(BATTLE_PHASES.SPELLING);
  const wordObj = vocabStore.getRandomWord(playerStore.currentArea, settingsStore.locale);
  if (!wordObj) {
    battleStore.log(t('common.error'));
    return;
  }
  battleStore.setCurrentWord(wordObj);

  // Record as discovered
  playerStore.recordDiscoveredWord(playerStore.currentArea, wordObj.word);

  const time = calculateTimerDuration(wordObj, false);
  startTimer(time);
  battleStore.log(t('battle.spellingmonAttack'));
  speakFullHint(wordObj);
  userInput.value = '';
  battleStore.isCapturing = false;
};

const tryRun = () => {
  audio.playSound(SOUND_EFFECTS.CLICK);
  if (battleStore.battleType === BATTLE_TYPES.TRAINER) {
    battleStore.log(t('battle.cannotRun'));
    return;
  }

  const successChance = (battleStore.playerMon.level / battleStore.enemyMon.level) * 0.5;
  const clampedChance = Math.max(0.1, Math.min(0.95, successChance));
  if (Math.random() < clampedChance) {
    battleStore.log(t('battle.fled'));
    setTimeout(() => battleStore.endBattle(), 1000);
  } else {
    battleStore.log(t('battle.cannotEscape'));
    enemyTurn();
  }
};

const handleSwitch = (mon) => {
  audio.playSound(SOUND_EFFECTS.CLICK);
  battleStore.switchPlayerMon(mon);
  playerFainted.value = false; // Reset fainted view if switching after faint

  if (isForcedSwitch.value) {
    isForcedSwitch.value = false;
    battleStore.setTurn(true);
  } else {
    enemyTurn();
  }
};

const tryCapture = () => {
  if (battleStore.isCapturing || (battleStore.enemyMon && battleStore.enemyMon.hp <= 0)) return;

  audio.playSound(SOUND_EFFECTS.CLICK);
  if (battleStore.battleType === BATTLE_TYPES.TRAINER) {
    battleStore.log(t('battle.cannotRun'));
    return;
  }

  const wordObj = vocabStore.getRandomWord(playerStore.currentArea, settingsStore.locale);
  if (!wordObj) {
    battleStore.log(t('common.error'));
    return;
  }

  battleStore.setPhase(BATTLE_PHASES.SPELLING);
  battleStore.setCurrentWord(wordObj);

  // Record as discovered
  playerStore.recordDiscoveredWord(playerStore.currentArea, wordObj.word);

  const time = calculateTimerDuration(wordObj, true);
  startTimer(time);
  battleStore.log(t('battle.attemptingCapture'));
  speakFullHint(wordObj);
  userInput.value = '';
  battleStore.isCapturing = true;
};

const speakFullHint = (wordObj) => {
  // Clear any existing hint timeouts
  hintTimeouts.value.forEach(t => clearTimeout(t));
  hintTimeouts.value = [];

  const word = typeof wordObj === 'string' ? wordObj : wordObj.word;
  const spokenVersion = wordObj.spoken_version || word;

  speech.speak(spokenVersion);

  if (wordObj.sentence_context) {
    const t1 = setTimeout(() => {
      speech.speak(`${t('battle.asIn')} ${wordObj.sentence_context}`);
      const t2 = setTimeout(() => {
        speech.speak(spokenVersion);
      }, 3000); // Estimated duration of sentence
      hintTimeouts.value.push(t2);
    }, 1500);
    hintTimeouts.value.push(t1);
  }
};

const repeatWord = () => {
  audio.playSound(SOUND_EFFECTS.CLICK);
  speakFullHint(battleStore.currentWord);
};

const escapeRegExp = (string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

const getMaskedSentence = (sentence, word) => {
  if (!sentence || !word) return '';
  const escapedWord = escapeRegExp(word);
  const regex = new RegExp(`\\b${escapedWord}\\b`, 'gi');
  return sentence.replace(regex, '____');
};

const submitSpelling = () => {
  if (!battleStore.currentWord) return;
  const word = typeof battleStore.currentWord === 'string' ? battleStore.currentWord : battleStore.currentWord.word;
  if (!word) return;

  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }

  const isPower = timeLeft.value > (totalTime.value / 2);

  const normalize = (str) => {
    return (str || '').toLowerCase().trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
      .replace(/[-\s]/g, ''); // Remove hyphens and spaces
  };

  const isCorrect = normalize(userInput.value) === normalize(word);

  // Disable turn immediately to prevent double-actions during animations
  battleStore.setTurn(false);

  if (isCorrect) {
    thrownWord.value = word;
    setTimeout(() => thrownWord.value = '', 1000);

    // Record as mastered
    const isNewMastery = playerStore.recordMasteredWord(playerStore.currentArea, word);
    if (isNewMastery) {
      audio.playSound(SOUND_EFFECTS.DISCOVERY);
      playerStore.notify(`${t('menu.mastered')}: ${word.toUpperCase()}!`);
    }

    if (battleStore.isCapturing) {
      handleCaptureSuccess(isPower);
    } else {
      handleAttackSuccess(isPower);
    }
  } else {
    mistakeWord.value = word.toUpperCase();
    setTimeout(() => mistakeWord.value = '', 2000);

    battleStore.log(t('battle.incorrect'));
    battleStore.log(t('battle.correctSpelling', { word: word.toUpperCase() }));
    battleStore.isCapturing = false;
    enemyTurn();
  }

  battleStore.setCurrentWord(null);
  userInput.value = '';
};

const handleAttackSuccess = (isPower) => {
  battleStore.setPhase(BATTLE_PHASES.PLAYER_ATTACK);
  battleStore.processAttack(isPower);

  audio.playSound(SOUND_EFFECTS.HIT);
  triggerShake(true);

  if (battleStore.enemyMon.hp <= 0) {
    battleStore.setTurn(false);
    battleStore.setPhase(BATTLE_PHASES.END);
    enemyFainted.value = true;
    audio.playSound(SOUND_EFFECTS.FAINT);
    battleStore.log(t('battle.win', { name: battleStore.enemyMon.name }));

    const exp = calculateExpGain(battleStore.enemyMon, battleStore.battleType === BATTLE_TYPES.TRAINER);
    const results = playerStore.awardExp(exp);
    participatingMons.value = results;
    battleStore.log(t('battle.gainedExp', { exp }));

      const hasExp = results.some(r => r.expGained > 0);

    if (battleStore.battleType === BATTLE_TYPES.TRAINER) {
      const nextMonCfg = battleStore.getNextTrainerMon();
      if (nextMonCfg) {
        setTimeout(() => {
          const nextMon = createMon(nextMonCfg.species, nextMonCfg.level);
          battleStore.enemyMon = nextMon;
          enemyFainted.value = false;
          battleStore.log(t('battle.trainerSentOut', { name: nextMon.name }));
          battleStore.saveState();
          battleStore.setTurn(true);
          battleStore.setPhase(BATTLE_PHASES.SELECT_ACTION);
        }, 1500);
        return;
      }

      playerStore.markTrainerDefeated(battleStore.trainerId);
      battleStore.log(t('battle.defeatedTrainer'));
    }

    setTimeout(() => {
      audio.playSound(SOUND_EFFECTS.VICTORY);
      setTimeout(() => {
        if (hasExp) {
          battleStore.setPhase(BATTLE_PHASES.RESULTS);
          showResults.value = true;
        } else {
          battleStore.endBattle();
        }
      }, ANIMATION_DURATIONS.BATTLE_END_DELAY_MS - 1000);
    }, ANIMATION_DURATIONS.VICTORY_SOUND_DELAY_MS);
  } else {
    enemyTurn();
  }
};

const handleCaptureSuccess = (isPower) => {
  // Save current enemy state for verification after delay
  const targetEnemyId = battleStore.enemyMon?.id;

  setTimeout(() => {
    // Race condition check: ensure battle is still active and it's the same enemy
    if (!battleStore.inBattle || battleStore.enemyMon?.id !== targetEnemyId) {
      battleStore.isCapturing = false;
      return;
    }

    const hpRatio = battleStore.enemyMon.hp / battleStore.enemyMon.maxHp;
    const speedBonus = isPower ? 0.2 : 0;
    const successChance = (0.7 - (hpRatio * 0.5)) + speedBonus;

    if (Math.random() < successChance) {
      audio.playSound(SOUND_EFFECTS.CAPTURE_SUCCESS);
      battleStore.log(t('battle.catchSuccess', { name: battleStore.enemyMon.name }));

      const newMon = { ...battleStore.enemyMon, hp: battleStore.enemyMon.maxHp };

      if (playerStore.party.length < 6) {
        playerStore.addSpellingmon(newMon);
        setTimeout(() => {
          if (battleStore.inBattle) {
            battleStore.endBattle();
          }
        }, ANIMATION_DURATIONS.CAPTURE_END_DELAY_MS);
      } else {
        // Party full flow
        battleStore.pendingCapture = newMon;
        setTimeout(() => {
          battleStore.setPhase(BATTLE_PHASES.PARTY_FULL_REPLACE);
        }, ANIMATION_DURATIONS.CAPTURE_END_DELAY_MS);
      }
    } else {
      audio.playSound(SOUND_EFFECTS.CAPTURE_FAIL);
      battleStore.isCapturing = false;
      battleStore.log(t('battle.catchFail', { name: battleStore.enemyMon.name }));
      enemyTurn();
    }
  }, ANIMATION_DURATIONS.CAPTURE_PROCESS_MS);
};

// --- Action Selection Navigation ---
const { selectedIndex } = useKeyboardNavigation({
  id: 'battle-actions',
  maxIndex: 4,
  priority: INPUT_PRIORITIES.BATTLE,
  isActive: computed(() => battleStore.inBattle && battleStore.phase === BATTLE_PHASES.SELECT_ACTION && !battleStore.isSwitching),
  onConfirm: (idx) => {
    if (idx === 0) prepareAttack();
    else if (idx === 1) tryCapture();
    else if (idx === 2) { battleStore.isSwitching = true; battleStore.setPhase(BATTLE_PHASES.SWITCHING); }
    else if (idx === 3) tryRun();
  }
});

// Custom override for 2x2-ish grid navigation
const handleActionKeyDown = (e) => {
  if (battleStore.phase !== BATTLE_PHASES.SELECT_ACTION || battleStore.isSwitching) return false;

  let newIdx = selectedIndex.value;
  if (e.key === 'ArrowUp') {
    if (selectedIndex.value === 1 || selectedIndex.value === 2) newIdx = 0;
    else if (selectedIndex.value === 3) newIdx = 1;
  } else if (e.key === 'ArrowDown') {
    if (selectedIndex.value === 0) newIdx = 1;
    else if (selectedIndex.value === 1 || selectedIndex.value === 2) newIdx = 3;
  } else if (e.key === 'ArrowLeft') {
    if (selectedIndex.value === 2) newIdx = 1;
  } else if (e.key === 'ArrowRight') {
    if (selectedIndex.value === 1) newIdx = 2;
  } else if (e.key === 'Enter') {
    // Handled by composable
    return false;
  } else {
    return false;
  }

  if (newIdx !== selectedIndex.value) {
    selectedIndex.value = newIdx;
    audio.playSound(SOUND_EFFECTS.CLICK);
    return true;
  }
  return false;
};

// --- Switching Navigation ---
const { selectedIndex: switchingSelectedIndex } = useKeyboardNavigation({
  id: 'battle-switching',
  maxIndex: computed(() => playerStore.party.length + (battleStore.playerMon?.hp > 0 ? 1 : 0)),
  priority: INPUT_PRIORITIES.MODAL,
  isActive: computed(() => battleStore.isSwitching),
  onConfirm: (idx) => {
    if (idx < playerStore.party.length) {
      const mon = playerStore.party[idx];
      if (mon.hp > 0 && mon.id !== battleStore.playerMon?.id) {
        handleSwitch(mon);
      }
    } else {
      battleStore.isSwitching = false;
      battleStore.setPhase(BATTLE_PHASES.SELECT_ACTION);
    }
  },
  onCancel: () => {
    if (battleStore.playerMon?.hp > 0) {
      battleStore.isSwitching = false;
      battleStore.setPhase(BATTLE_PHASES.SELECT_ACTION);
    }
  }
});

const enemyTurn = () => {
  if (!battleStore.inBattle || !battleStore.enemyMon || battleStore.enemyMon.hp <= 0) return;
  battleStore.setTurn(false);
  battleStore.setPhase(BATTLE_PHASES.ENEMY_TURN);

  setTimeout(() => {
    // Re-check fainted status after delay
    if (!battleStore.inBattle || battleStore.enemyMon.hp <= 0) return;

    const { damage, typeMod } = calculateDamage(battleStore.enemyMon, battleStore.playerMon, 30);
    battleStore.damagePlayer(damage);
    battleStore.log(`${battleStore.enemyMon.name} attacked and dealt ${damage} damage!`);
    if (typeMod > 1) battleStore.log("It's super effective!");
    if (typeMod < 1 && typeMod > 0) battleStore.log("It's not very effective...");

    audio.playSound(SOUND_EFFECTS.HIT);
    triggerShake(false);

    if (battleStore.playerMon.hp <= 0) {
      playerFainted.value = true;
      audio.playSound(SOUND_EFFECTS.FAINT);
      battleStore.log(t('battle.lose', { name: battleStore.playerMon.name }));

      const hasHealthyMon = playerStore.party.some(m => m.hp > 0);
      if (hasHealthyMon) {
        battleStore.log(t('battle.switchWho'));
        battleStore.isSwitching = true;
        isForcedSwitch.value = true;
        battleStore.setPhase(BATTLE_PHASES.SWITCHING);
      } else {
        battleStore.setPhase(BATTLE_PHASES.WHITED_OUT);
      }
    } else {
      battleStore.setTurn(true);
      battleStore.setPhase(BATTLE_PHASES.SELECT_ACTION);
    }
  }, 1500);
};

watch(() => battleStore.currentWord, async (newVal) => {
  if (newVal) {
    await nextTick();
    spellingInput.value?.focus();
  }
});

const { selectedIndex: whitedOutSelectedIndex } = useKeyboardNavigation({
  id: 'battle-whited-out',
  maxIndex: 1,
  priority: INPUT_PRIORITIES.MODAL,
  isActive: computed(() => battleStore.phase === BATTLE_PHASES.WHITED_OUT),
  onConfirm: () => handleWhiteoutConfirm()
});

const handleWhiteoutConfirm = () => {
  audio.playSound(SOUND_EFFECTS.CLICK);
  playerStore.handleWhiteout();
  battleStore.endBattle();
};

const { selectedIndex: partyReplaceSelectedIndex } = useKeyboardNavigation({
  id: 'battle-party-replace',
  maxIndex: computed(() => playerStore.party.length + 1),
  priority: INPUT_PRIORITIES.MODAL,
  isActive: computed(() => battleStore.phase === BATTLE_PHASES.PARTY_FULL_REPLACE),
  onConfirm: (idx) => {
    if (idx < playerStore.party.length) handleReplaceMon(idx);
    else handleReleaseNewMon();
  }
});

const handleReplaceMon = (index) => {
  audio.playSound(SOUND_EFFECTS.CLICK);
  const replacedMonName = playerStore.party[index].name;
  playerStore.replaceSpellingmon(index, battleStore.pendingCapture);
  battleStore.log(t('battle.released', { name: replacedMonName }));
  battleStore.log(t('battle.joinedParty', { name: battleStore.pendingCapture.name }));

  // Finish battle
  battleStore.endBattle();
};

const handleReleaseNewMon = () => {
  audio.playSound(SOUND_EFFECTS.CLICK);
  battleStore.log(t('battle.releasedWild', { name: battleStore.pendingCapture.name }));
  battleStore.endBattle();
};

watch(() => battleStore.isSwitching, (newVal) => {
  if (newVal) {
    switchingSelectedIndex.value = 0;
    switchButtons.value = [];
  }
});

watch(switchingSelectedIndex, (newIdx) => {
  if (battleStore.isSwitching && switchButtons.value[newIdx]) {
    switchButtons.value[newIdx].scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }
});

onMounted(async () => {
  try {
    // Override the default grid/list nav for action selection to handle the custom layout
    inputStore.addListener('battle-actions-grid', handleActionKeyDown, INPUT_PRIORITIES.BATTLE + 1);

    // Re-sync playerMon with playerStore party to avoid desync after reload
    if (battleStore.playerMon) {
      const freshMon = playerStore.party.find(m => m.id === battleStore.playerMon.id);
      if (freshMon) {
        battleStore.playerMon = freshMon;
      }
    }

    // Ensure phase is consistent with store state on mount
    if (battleStore.isSwitching && battleStore.phase !== BATTLE_PHASES.SWITCHING) {
      battleStore.setPhase(BATTLE_PHASES.SWITCHING);
    }

    if (!battleStore.playerMon || !battleStore.enemyMon) {
      console.error('Battle data missing on mount', {
        player: !!battleStore.playerMon,
        enemy: !!battleStore.enemyMon
      });
      battleStore.endBattle();
      return;
    }

    isFlashing.value = true;
    audio.playSound(SOUND_EFFECTS.BATTLE_START);
    setTimeout(() => isFlashing.value = false, ANIMATION_DURATIONS.FLASH_MS);

    await vocabStore.loadVocab(playerStore.currentArea, settingsStore.locale).catch(err => {
      console.error('Failed to load vocab during battle init', err);
      // We still proceed, but prepareAttack might fail later.
    });

    // If it's the enemy's turn to start, make sure they do!
    if (battleStore.inBattle) {
      if (!battleStore.isPlayerTurn && !battleStore.currentWord) {
        // Add a slight delay to let the battle start animation finish
        setTimeout(() => {
          enemyTurn();
        }, ANIMATION_DURATIONS.FLASH_MS + 500);
      } else {
        battleStore.setPhase(BATTLE_PHASES.SELECT_ACTION);
      }
    }
  } catch (error) {
    console.error('Critical error during BattleView onMounted:', error);
    battleStore.endBattle();
  }
});

onUnmounted(() => {
  inputStore.removeListener('battle-actions-grid');
});
</script>

<style scoped>
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-10px); }
  75% { transform: translateX(10px); }
}
.animate-shake {
  animation: shake var(--shake-duration) ease-in-out infinite;
}

@keyframes flash {
  0%, 100% { background-color: white; }
  50% { background-color: #333; }
}
.animate-flash {
  animation: flash calc(var(--flash-duration) / 5) steps(2, start) 5;
}

@keyframes capture {
  0% { transform: translate(-200px, 100px) rotate(0deg) scale(0.5); opacity: 0; }
  50% { transform: translate(0, -50px) rotate(180deg) scale(1.2); opacity: 1; }
  100% { transform: translate(0, 0) rotate(360deg) scale(1); opacity: 1; }
}
.animate-capture {
  animation: capture var(--capture-duration) cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
}

@keyframes throw {
  0% { left: var(--start-x); top: var(--start-y); transform: scale(0.5) rotate(-10deg); opacity: 0; }
  20% { opacity: 1; transform: scale(1.2) rotate(5deg); }
  80% { opacity: 1; transform: scale(1) rotate(0deg); }
  100% { left: var(--end-x); top: var(--end-y); transform: scale(0.2) rotate(20deg); opacity: 0; }
}
.animate-throw {
  animation: throw 0.8s ease-in forwards;
}
</style>
