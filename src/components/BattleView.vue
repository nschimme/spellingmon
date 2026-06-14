<template>
  <div class="fixed inset-0 bg-white z-40 flex flex-col p-4 overflow-hidden"
       :class="{ 'animate-flash': isFlashing }"
       :style="{
         '--flash-duration': ANIMATION_DURATIONS.FLASH_MS + 'ms',
         '--shake-duration': '100ms',
         '--capture-duration': ANIMATION_DURATIONS.CAPTURE_PROCESS_MS / 3 + 'ms'
       }">
    <!-- Battle Field -->
    <div class="flex-1 relative border-4 border-gray-800 rounded-lg overflow-hidden bg-gradient-to-b from-blue-100 to-green-100 min-h-0">
      <!-- Enemy -->
      <div class="absolute top-4 right-4 sm:top-10 sm:right-10 flex flex-col items-end transition-all duration-300"
           :class="{ 'opacity-0 translate-y-10': enemyFainted }">
        <div class="flex flex-col items-end" :class="{ 'animate-shake': enemyShake }">
          <div class="bg-white border-2 border-gray-800 p-1 sm:p-2 rounded-lg w-36 sm:w-48 shadow-md">
            <div class="flex flex-col font-bold leading-tight">
              <div class="flex justify-between items-start">
                <div class="flex flex-col">
                  <span class="text-[10px] sm:text-sm uppercase tracking-tighter">{{ battleStore.enemyMon.name }}</span>
                  <span class="text-[7px] sm:text-[9px] text-gray-500 uppercase -mt-0.5">Lv {{ battleStore.enemyMon.level }}</span>
                </div>
                <div class="flex flex-col items-end opacity-80">
                  <span class="text-[10px] sm:text-xs">{{ TYPE_EMOJIS[battleStore.enemyMon.type] }}</span>
                  <span class="text-[6px] sm:text-[8px] uppercase tracking-widest text-gray-400">{{ battleStore.enemyMon.type }}</span>
                </div>
              </div>
            </div>
            <div class="w-full bg-gray-200 h-1 sm:h-2 rounded mt-0.5 overflow-hidden">
              <div class="h-full transition-all duration-500"
                  :class="getHPColorClass(battleStore.enemyMon.hp, battleStore.enemyMon.maxHp)"
                  :style="{ width: `${(battleStore.enemyMon.hp / battleStore.enemyMon.maxHp) * 100}%` }"></div>
            </div>
            <div class="text-[8px] sm:text-xs text-right">{{ battleStore.enemyMon.hp }} / {{ battleStore.enemyMon.maxHp }}</div>
          </div>
          <!-- Hide sprite during the capture ball animation (when isCapturing and word is gone) -->
          <div class="text-4xl sm:text-6xl mt-2 sm:mt-4 transition-transform duration-300"
               :class="{ 'scale-0 opacity-0': isCapturing && !battleStore.currentWord }">{{ TYPE_EMOJIS[battleStore.enemyMon.type] }}</div>
        </div>

        <!-- Capture Ball Anim -->
        <div v-if="isCapturing && !battleStore.currentWord" class="absolute inset-0 flex items-center justify-center animate-capture">
          <div class="text-2xl sm:text-4xl">🔴</div>
        </div>
      </div>

      <!-- Player -->
      <div class="absolute bottom-4 left-4 sm:bottom-10 sm:left-10 flex flex-col items-start transition-all duration-300"
           :class="{ 'opacity-0 translate-y-10': playerFainted }">
        <div class="flex flex-col items-start" :class="{ 'animate-shake': playerShake }">
          <div class="text-4xl sm:text-6xl mb-2 sm:mb-4 scale-x-[-1]">{{ TYPE_EMOJIS[battleStore.playerMon.type] }}</div>
          <div class="bg-white border-2 border-gray-800 p-1 sm:p-2 rounded-lg w-36 sm:w-48 shadow-md">
            <div class="flex flex-col font-bold leading-tight">
              <div class="flex justify-between items-start">
                <div class="flex flex-col">
                  <span class="text-[10px] sm:text-sm uppercase tracking-tighter">{{ battleStore.playerMon.name }}</span>
                  <span class="text-[7px] sm:text-[9px] text-gray-500 uppercase -mt-0.5">Lv {{ battleStore.playerMon.level }}</span>
                </div>
                <div class="flex flex-col items-end opacity-80">
                  <span class="text-[10px] sm:text-xs">{{ TYPE_EMOJIS[battleStore.playerMon.type] }}</span>
                  <span class="text-[6px] sm:text-[8px] uppercase tracking-widest text-gray-400">{{ battleStore.playerMon.type }}</span>
                </div>
              </div>
            </div>
            <div class="w-full bg-gray-200 h-1 sm:h-2 rounded mt-0.5 overflow-hidden">
              <div class="h-full transition-all duration-500"
                  :class="getHPColorClass(battleStore.playerMon.hp, battleStore.playerMon.maxHp)"
                  :style="{ width: `${(battleStore.playerMon.hp / battleStore.playerMon.maxHp) * 100}%` }"></div>
            </div>
            <div class="text-[8px] sm:text-xs text-right">{{ battleStore.playerMon.hp }} / {{ battleStore.playerMon.maxHp }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Battle Log & Input -->
    <div class="h-48 mt-4 border-4 border-gray-800 rounded-lg flex flex-col sm:flex-row p-4 bg-white overflow-hidden">
      <div class="flex-1 border-b sm:border-b-0 sm:border-r border-gray-300 pr-0 sm:pr-4 overflow-y-auto min-h-0">
        <div v-for="(log, i) in battleStore.battleLog" :key="i" class="mb-1 text-xs sm:text-sm font-bold">
          {{ log }}
        </div>
      </div>

      <div class="w-full sm:w-1/3 pl-0 sm:pl-4 mt-2 sm:mt-0 flex flex-col justify-center gap-2 shrink-0">
        <template v-if="battleStore.isPlayerTurn && !battleStore.currentWord && !isSwitching">
          <div class="grid grid-cols-2 gap-2">
            <button @click="prepareAttack"
                    :class="{ 'ring-4 ring-yellow-400': selectedIndex === 0 }"
                    class="col-span-2 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-black uppercase border-b-4 border-blue-800 active:translate-y-1 text-sm tracking-widest shadow-lg">Attack</button>
            <button @click="tryCapture"
                    :disabled="isCapturing"
                    :class="{ 'ring-4 ring-yellow-400': selectedIndex === 1 }"
                    class="bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 font-bold uppercase border-b-4 border-red-700 active:translate-y-1 disabled:opacity-50 text-xs">Capture</button>
            <button @click="isSwitching = true"
                    :class="{ 'ring-4 ring-yellow-400': selectedIndex === 2 }"
                    class="bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 font-bold uppercase border-b-4 border-green-700 active:translate-y-1 text-xs">Switch</button>
          </div>
          <button @click="tryRun"
                  :class="{ 'ring-4 ring-yellow-400': selectedIndex === 3 }"
                  class="w-full bg-gray-500 text-white py-2 rounded-lg hover:bg-gray-600 font-bold uppercase border-b-4 border-gray-700 active:translate-y-1 mt-2 text-xs">Run</button>
        </template>

        <template v-if="isSwitching">
          <p class="text-xs font-bold text-center mb-1">Switch to who?</p>
          <div class="flex-1 overflow-y-auto pr-1">
            <button v-for="(mon, i) in playerStore.party" :key="i"
                    @click="handleSwitch(mon)"
                    :disabled="mon.hp <= 0 || mon.id === battleStore.playerMon.id"
                    class="w-full mb-1 p-1 border-2 border-gray-800 rounded text-[10px] font-bold disabled:opacity-50"
                    :class="[
                      mon.id === battleStore.playerMon.id ? 'bg-blue-100' : 'bg-white',
                      switchingSelectedIndex === i ? 'ring-4 ring-yellow-400 border-yellow-400' : ''
                    ]">
              {{ mon.name }} (HP: {{ mon.hp }})
            </button>
          </div>
          <button v-show="battleStore.playerMon.hp > 0"
                  @click="isSwitching = false"
                  :class="{ 'ring-4 ring-yellow-400': switchingSelectedIndex === playerStore.party.length }"
                  class="text-xs text-red-500 font-bold mt-1">Cancel</button>
        </template>

        <template v-if="battleStore.currentWord">
          <div class="text-center flex flex-col h-full justify-between pb-1">
            <div class="px-1">
              <!-- Timer Bar -->
              <div class="w-full bg-gray-200 h-2 rounded-full overflow-hidden mb-2 border border-gray-400">
                <div class="h-full transition-all duration-100"
                     :class="timeLeft > (totalTime / 2) ? 'bg-yellow-400' : 'bg-red-500'"
                     :style="{ width: `${(timeLeft / totalTime) * 100}%` }"></div>
              </div>

              <div class="overflow-y-auto max-h-16">
                <p v-if="battleStore.currentWord.definition" class="text-[10px] leading-tight mb-1 italic">
                  "{{ battleStore.currentWord.definition }}"
                </p>
                <p v-if="battleStore.currentWord.sentence_context" class="text-[10px] leading-tight font-bold mb-1">
                  {{ getMaskedSentence(battleStore.currentWord.sentence_context, battleStore.currentWord.word) }}
                </p>
              </div>
            </div>
            <div>
              <button @click="repeatWord" class="text-blue-500 text-[10px] underline mb-1 block w-full">Listen Again</button>
              <input v-model="userInput" @keydown.enter="submitSpelling"
                     ref="spellingInput"
                     @paste.prevent
                     class="w-full border-2 border-gray-800 p-1 text-center text-lg uppercase rounded-lg"
                     placeholder="TYPE HERE"
                     autocomplete="off"
                     autocorrect="off"
                     autocapitalize="off"
                     spellcheck="false"
                     x-inputmode="text"
                     inputmode="text"
                     autofocus />
              <p class="text-[8px] text-red-500 font-bold mt-1 uppercase">Spell for Power!</p>
            </div>
          </div>
        </template>
      </div>
    </div>
    <ExperienceView v-if="showResults"
                      :participatingMons="participatingMons"
                      @continue="battleStore.endBattle()" />
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, watch, onUnmounted } from 'vue';
import { useBattleStore } from '../stores/battleStore';
import { useVocabStore } from '../stores/vocabStore';
import { usePlayerStore } from '../stores/playerStore';
import { speech } from '../utils/speech';
import { audio } from '../utils/audio';
import { getHPColorClass } from '../utils/visuals';
import { SOUND_EFFECTS, ANIMATION_DURATIONS, BATTLE_TYPES } from '../utils/constants';
import { calculateExpGain, calculateDamage, createMon, TYPE_EMOJIS, MONS } from '../utils/gameData';
import ExperienceView from './ExperienceView.vue';

const battleStore = useBattleStore();
const vocabStore = useVocabStore();
const playerStore = usePlayerStore();

const userInput = ref('');
const isCapturing = ref(false);
const isSwitching = ref(false);
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
const selectedIndex = ref(0);
const switchingSelectedIndex = ref(0);
const spellingInput = ref(null);

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
      battleStore.log("Time's up! Type fast next time!");
    }
  }, 100);
};

const prepareAttack = () => {
  audio.playSound(SOUND_EFFECTS.CLICK);
  const wordObj = vocabStore.getRandomWord(playerStore.currentArea);
  if (!wordObj) {
    battleStore.log("Error: No words available!");
    return;
  }
  battleStore.setCurrentWord(wordObj);

  // Timer based on difficulty and length
  // Easy (1): 10s base, Hard (2): 6s base. + 0.8s per char
  const baseTime = wordObj.difficulty === 2 ? 6 : 10;
  const wordTime = wordObj.word.length * 0.8;
  const time = Math.round(baseTime + wordTime);

  startTimer(time);
  battleStore.log(`Spellingmon Attack!`);
  speakFullHint(wordObj);
  userInput.value = '';
  isCapturing.value = false;
};

const tryRun = () => {
  audio.playSound(SOUND_EFFECTS.CLICK);
  if (battleStore.battleType === BATTLE_TYPES.TRAINER) {
    battleStore.log("You can't run from a trainer battle!");
    return;
  }

  const successChance = (battleStore.playerMon.level / battleStore.enemyMon.level) * 0.5;
  const clampedChance = Math.max(0.1, Math.min(0.95, successChance));
  if (Math.random() < clampedChance) {
    battleStore.log("Got away safely!");
    setTimeout(() => battleStore.endBattle(), 1000);
  } else {
    battleStore.log("Couldn't get away!");
    enemyTurn();
  }
};

const handleSwitch = (mon) => {
  audio.playSound(SOUND_EFFECTS.CLICK);
  battleStore.switchPlayerMon(mon);
  isSwitching.value = false;
  playerFainted.value = false; // Reset fainted view if switching after faint

  if (isForcedSwitch.value) {
    isForcedSwitch.value = false;
    battleStore.setTurn(true);
  } else {
    enemyTurn();
  }
};

const tryCapture = () => {
  if (isCapturing.value || (battleStore.enemyMon && battleStore.enemyMon.hp <= 0)) return;

  audio.playSound(SOUND_EFFECTS.CLICK);
  if (battleStore.battleType === BATTLE_TYPES.TRAINER) {
    battleStore.log("You can't capture a trainer's Spellingmon!");
    return;
  }
  if (playerStore.party.length >= 6) {
    battleStore.log("Your party is full! Cannot capture more.");
    return;
  }

  const wordObj = vocabStore.getRandomWord(playerStore.currentArea);
  if (!wordObj) {
    battleStore.log("Error: No words available!");
    return;
  }

  battleStore.setCurrentWord(wordObj);

  const baseTime = wordObj.difficulty === 2 ? 5 : 8; // Slightly harder for capture
  const wordTime = wordObj.word.length * 0.6;
  const time = Math.round(baseTime + wordTime);

  startTimer(time);
  battleStore.log(`Attempting to capture!`);
  speakFullHint(wordObj);
  userInput.value = '';
  isCapturing.value = true;
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
      speech.speak(`As in... ${wordObj.sentence_context}`);
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

  const isPower = timeLeft.value > (totalTime.value / 2);

  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }

  const isCorrect = userInput.value.toLowerCase().trim() === word.toLowerCase().trim();

  // Disable turn immediately to prevent double-actions during animations
  battleStore.setTurn(false);

  if (isCorrect) {
    if (isCapturing.value) {
      handleCaptureSuccess(isPower);
    } else {
      handleAttackSuccess(isPower);
    }
  } else {
    battleStore.log(`Incorrect! The word was "${word}".`);
    isCapturing.value = false;
    enemyTurn();
  }

  battleStore.setCurrentWord(null);
  userInput.value = '';
};

const handleAttackSuccess = (isPower) => {
  const basePower = isPower ? 60 : 30;
  const wordDifficulty = battleStore.currentWord?.difficulty || 1;
  const { damage, typeMod } = calculateDamage(battleStore.playerMon, battleStore.enemyMon, basePower, wordDifficulty);

  if (isPower) {
    battleStore.log("Super fast! Critical hit!");
  }

  battleStore.damageEnemy(damage);
  battleStore.log(`Correct! Dealt ${damage} damage.`);
  if (typeMod > 1) battleStore.log("It's super effective!");
  if (typeMod < 1 && typeMod > 0) battleStore.log("It's not very effective...");
  if (typeMod === 0) battleStore.log("It had no effect!");

  audio.playSound(SOUND_EFFECTS.HIT);
  triggerShake(true);

  if (battleStore.enemyMon.hp <= 0) {
    battleStore.setTurn(false);
    enemyFainted.value = true;
    audio.playSound(SOUND_EFFECTS.FAINT);
    battleStore.log(`${battleStore.enemyMon.name} fainted!`);

    const exp = calculateExpGain(battleStore.enemyMon, battleStore.battleType === BATTLE_TYPES.TRAINER);
    const results = playerStore.awardExp(exp);
    participatingMons.value = results;
    battleStore.log(`Gained ${exp} EXP!`);

    if (battleStore.battleType === BATTLE_TYPES.TRAINER) {
      // Find current mon in party and mark it
      const currentMonInParty = battleStore.trainerParty.find(m => !m.isDefeated);
      if (currentMonInParty) {
        currentMonInParty.isDefeated = true;
      }

      // Check for next monster in trainer party
      const nextMonCfg = battleStore.trainerParty.find(m => !m.isDefeated);
      if (nextMonCfg) {
        setTimeout(() => {
          const nextMon = createMon(nextMonCfg.species, nextMonCfg.level);
          battleStore.enemyMon = nextMon;
          enemyFainted.value = false;
          battleStore.log(`Trainer sent out ${nextMon.name}!`);
          battleStore.saveState();
          battleStore.setTurn(true);
        }, 1500);
        return;
      }

      playerStore.markTrainerDefeated(battleStore.trainerId);
      battleStore.log('You defeated the trainer!');
    }

    setTimeout(() => {
      audio.playSound(SOUND_EFFECTS.VICTORY);
      setTimeout(() => {
        showResults.value = true;
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
      isCapturing.value = false;
      return;
    }

    const hpRatio = battleStore.enemyMon.hp / battleStore.enemyMon.maxHp;
    const speedBonus = isPower ? 0.2 : 0;
    const successChance = (0.7 - (hpRatio * 0.5)) + speedBonus;

    if (Math.random() < successChance) {
      const added = playerStore.addSpellingmon({ ...battleStore.enemyMon, hp: battleStore.enemyMon.maxHp });
      if (added) {
        audio.playSound(SOUND_EFFECTS.CAPTURE_SUCCESS);
        battleStore.log(`Gotcha! ${battleStore.enemyMon.name} was caught!`);
        setTimeout(() => {
          if (battleStore.inBattle) {
            participatingMons.value = [];
            showResults.value = true;
          }
        }, ANIMATION_DURATIONS.CAPTURE_END_DELAY_MS);
      } else {
        isCapturing.value = false;
        battleStore.log(`Wait! Your party became full during the struggle?`);
        enemyTurn();
      }
    } else {
      audio.playSound(SOUND_EFFECTS.CAPTURE_FAIL);
      isCapturing.value = false;
      battleStore.log(`${battleStore.enemyMon.name} broke free!`);
      enemyTurn();
    }
  }, ANIMATION_DURATIONS.CAPTURE_PROCESS_MS);
};

const handleKeyDown = (e) => {
  if (!battleStore.inBattle || showResults.value) return false;

  // If spelling word
  if (battleStore.currentWord) {
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      // Prevent cancellation - word entry must be completed or timer must run out
      return true;
    }
    // Left/Right handled by input default behavior
    return false;
  }

  if (isSwitching.value) {
    if (e.key === 'ArrowUp') {
      switchingSelectedIndex.value = (switchingSelectedIndex.value - 1 + (playerStore.party.length + (battleStore.playerMon.hp > 0 ? 1 : 0))) % (playerStore.party.length + (battleStore.playerMon.hp > 0 ? 1 : 0));
      audio.playSound(SOUND_EFFECTS.CLICK);
      return true;
    } else if (e.key === 'ArrowDown') {
      switchingSelectedIndex.value = (switchingSelectedIndex.value + 1) % (playerStore.party.length + (battleStore.playerMon.hp > 0 ? 1 : 0));
      audio.playSound(SOUND_EFFECTS.CLICK);
      return true;
    } else if (e.key === 'Enter') {
      if (switchingSelectedIndex.value < playerStore.party.length) {
        const mon = playerStore.party[switchingSelectedIndex.value];
        if (mon.hp > 0 && mon.id !== battleStore.playerMon.id) {
          handleSwitch(mon);
        }
      } else {
        isSwitching.value = false;
      }
      return true;
    }
    return true;
  }

  if (e.key === 'ArrowUp') {
    if (selectedIndex.value === 1 || selectedIndex.value === 2) selectedIndex.value = 0;
    else if (selectedIndex.value === 3) selectedIndex.value = 1;
    audio.playSound(SOUND_EFFECTS.CLICK);
    return true;
  } else if (e.key === 'ArrowDown') {
    if (selectedIndex.value === 0) selectedIndex.value = 1;
    else if (selectedIndex.value === 1 || selectedIndex.value === 2) selectedIndex.value = 3;
    audio.playSound(SOUND_EFFECTS.CLICK);
    return true;
  } else if (e.key === 'ArrowLeft') {
    if (selectedIndex.value === 2) selectedIndex.value = 1;
    audio.playSound(SOUND_EFFECTS.CLICK);
    return true;
  } else if (e.key === 'ArrowRight') {
    if (selectedIndex.value === 1) selectedIndex.value = 2;
    audio.playSound(SOUND_EFFECTS.CLICK);
    return true;
  } else if (e.key === 'Enter') {
    if (selectedIndex.value === 0) prepareAttack();
    else if (selectedIndex.value === 1) tryCapture();
    else if (selectedIndex.value === 2) isSwitching.value = true;
    else if (selectedIndex.value === 3) tryRun();
    return true;
  }
  return false;
};

const enemyTurn = () => {
  if (!battleStore.inBattle || !battleStore.enemyMon || battleStore.enemyMon.hp <= 0) return;
  battleStore.setTurn(false);
  setTimeout(() => {
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
      battleStore.log(`${battleStore.playerMon.name} fainted!`);

      const hasHealthyMon = playerStore.party.some(m => m.hp > 0);
      if (hasHealthyMon) {
        battleStore.log("Choose another Spellingmon!");
        isSwitching.value = true;
        isForcedSwitch.value = true;
      } else {
        battleStore.log('You whited out! Teleporting to SpellCenter.');
        setTimeout(() => {
          playerStore.handleWhiteout();
          battleStore.endBattle();
        }, 2500);
      }
    } else {
      battleStore.setTurn(true);
    }
  }, 1500);
};

watch(() => battleStore.currentWord, async (newVal) => {
  if (newVal) {
    await nextTick();
    spellingInput.value?.focus();
  }
});

watch(isSwitching, (newVal) => {
  if (newVal) {
    switchingSelectedIndex.value = 0;
  }
});

onMounted(async () => {
  inputStore.addListener(INPUT_CONTEXTS.BATTLE, handleKeyDown, 10);

  // Re-sync playerMon with playerStore party to avoid desync after reload
  if (battleStore.playerMon) {
    const freshMon = playerStore.party.find(m => m.id === battleStore.playerMon.id);
    if (freshMon) {
      battleStore.playerMon = freshMon;
    }
  }

  isFlashing.value = true;
  audio.playSound(SOUND_EFFECTS.BATTLE_START);
  setTimeout(() => isFlashing.value = false, ANIMATION_DURATIONS.FLASH_MS);

  await vocabStore.loadVocab(playerStore.currentArea);

  if (!battleStore.isPlayerTurn && battleStore.inBattle && !battleStore.currentWord) {
    enemyTurn();
  }
});

onUnmounted(() => {
  inputStore.removeListener(INPUT_CONTEXTS.BATTLE);
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
</style>
