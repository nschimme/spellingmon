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
            <div class="flex justify-between font-bold text-[10px] sm:text-base">
              <span>{{ battleStore.enemyMon.name }}</span>
              <span>Lv{{ battleStore.enemyMon.level }}</span>
            </div>
            <div class="w-full bg-gray-200 h-1 sm:h-2 rounded mt-1 overflow-hidden">
              <div class="h-full transition-all duration-500"
                  :class="getHPColorClass(battleStore.enemyMon.hp, battleStore.enemyMon.maxHp)"
                  :style="{ width: `${(battleStore.enemyMon.hp / battleStore.enemyMon.maxHp) * 100}%` }"></div>
            </div>
            <div class="text-[8px] sm:text-xs text-right">{{ battleStore.enemyMon.hp }} / {{ battleStore.enemyMon.maxHp }}</div>
          </div>
          <!-- Hide sprite during the capture ball animation (when isCapturing and word is gone) -->
          <div class="text-4xl sm:text-6xl mt-2 sm:mt-4 transition-transform duration-300"
               :class="{ 'scale-0 opacity-0': isCapturing && !battleStore.currentWord }">👾</div>
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
          <div class="text-4xl sm:text-6xl mb-2 sm:mb-4 scale-x-[-1]">🦖</div>
          <div class="bg-white border-2 border-gray-800 p-1 sm:p-2 rounded-lg w-36 sm:w-48 shadow-md">
            <div class="flex justify-between font-bold text-[10px] sm:text-base">
              <span>{{ battleStore.playerMon.name }}</span>
              <span>Lv{{ battleStore.playerMon.level }}</span>
            </div>
            <div class="w-full bg-gray-200 h-1 sm:h-2 rounded mt-1 overflow-hidden">
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
            <button @click="prepareAttack('Quick Spell', 1)" class="bg-blue-500 text-white py-2 rounded hover:bg-blue-600 font-bold border-b-4 border-blue-700 active:translate-y-1 text-sm">Attack (Easy)</button>
            <button @click="prepareAttack('Power Spell', 2)" class="bg-purple-500 text-white py-2 rounded hover:bg-purple-600 font-bold border-b-4 border-purple-700 active:translate-y-1 text-sm">Attack (Hard)</button>
            <button @click="tryCapture" :disabled="isCapturing" class="bg-red-500 text-white py-2 rounded hover:bg-red-600 font-bold border-b-4 border-red-700 active:translate-y-1 disabled:opacity-50 text-sm">Capture</button>
            <button @click="isSwitching = true" class="bg-green-500 text-white py-2 rounded hover:bg-green-600 font-bold border-b-4 border-green-700 active:translate-y-1 text-sm">Switch</button>
          </div>
          <button @click="tryRun" class="w-full bg-gray-500 text-white py-2 rounded hover:bg-gray-600 font-bold border-b-4 border-gray-700 active:translate-y-1 mt-1 text-sm">Run</button>
        </template>

        <template v-if="isSwitching">
          <p class="text-xs font-bold text-center mb-1">Switch to who?</p>
          <div class="flex-1 overflow-y-auto pr-1">
            <button v-for="(mon, i) in playerStore.party" :key="i"
                    @click="handleSwitch(mon)"
                    :disabled="mon.hp <= 0 || mon.id === battleStore.playerMon.id"
                    class="w-full mb-1 p-1 border-2 border-gray-800 rounded text-[10px] font-bold disabled:opacity-50"
                    :class="mon.id === battleStore.playerMon.id ? 'bg-blue-100' : 'bg-white'">
              {{ mon.name }} (HP: {{ mon.hp }})
            </button>
          </div>
          <button v-show="battleStore.playerMon.hp > 0" @click="isSwitching = false" class="text-xs text-red-500 font-bold mt-1">Cancel</button>
        </template>

        <template v-if="battleStore.currentWord">
          <div class="text-center">
            <p class="font-bold mb-2">Spell the word!</p>
            <button @click="repeatWord" class="text-blue-500 text-sm underline mb-2">Listen Again</button>
            <input v-model="userInput" @keyup.enter="submitSpelling"
                   class="w-full border-4 border-gray-800 p-2 text-center text-xl uppercase rounded-lg"
                   autofocus />
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useBattleStore } from '../stores/battleStore';
import { useVocabStore } from '../stores/vocabStore';
import { usePlayerStore } from '../stores/playerStore';
import { speech } from '../utils/speech';
import { audio } from '../utils/audio';
import { getHPColorClass } from '../utils/visuals';
import { SOUND_EFFECTS, ANIMATION_DURATIONS } from '../utils/constants';
import { calculateExpGain } from '../utils/gameData';

const battleStore = useBattleStore();
const vocabStore = useVocabStore();
const playerStore = usePlayerStore();

const userInput = ref('');
const isCapturing = ref(false);
const isSwitching = ref(false);
const isForcedSwitch = ref(false);
const currentDifficulty = ref(1);

const enemyShake = ref(false);
const playerShake = ref(false);
const enemyFainted = ref(false);
const playerFainted = ref(false);
const isFlashing = ref(false);

const triggerShake = (isEnemy) => {
  if (isEnemy) {
    enemyShake.value = true;
    setTimeout(() => enemyShake.value = false, ANIMATION_DURATIONS.SHAKE_MS);
  } else {
    playerShake.value = true;
    setTimeout(() => playerShake.value = false, ANIMATION_DURATIONS.SHAKE_MS);
  }
};

const prepareAttack = (move, difficulty) => {
  audio.playSound(SOUND_EFFECTS.CLICK);
  const wordObj = vocabStore.getRandomWord(playerStore.currentArea, difficulty);
  if (!wordObj) {
    battleStore.log("Error: No words available!");
    return;
  }
  battleStore.setCurrentWord(wordObj.word);
  currentDifficulty.value = difficulty;
  battleStore.log(`Using ${move}!`);
  speech.speak(battleStore.currentWord);
  userInput.value = '';
  isCapturing.value = false;
};

const tryRun = () => {
  audio.playSound(SOUND_EFFECTS.CLICK);
  if (battleStore.battleType === 'trainer') {
    battleStore.log("You can't run from a trainer battle!");
    return;
  }

  const successChance = (battleStore.playerMon.level / battleStore.enemyMon.level) * 0.5;
  if (Math.random() < Math.min(0.95, successChance)) {
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
  if (battleStore.battleType === 'trainer') {
    battleStore.log("You can't capture a trainer's Spellingmon!");
    return;
  }
  if (playerStore.party.length >= 6) {
    battleStore.log("Your party is full! Cannot capture more.");
    return;
  }

  const wordObj = vocabStore.getRandomWord(playerStore.currentArea, 2);
  if (!wordObj) {
    battleStore.log("Error: No words available!");
    return;
  }

  battleStore.setCurrentWord(wordObj.word);
  currentDifficulty.value = 2; // Hard difficulty for capture
  battleStore.log(`Attempting to capture!`);
  speech.speak(battleStore.currentWord);
  userInput.value = '';
  isCapturing.value = true;
};

const repeatWord = () => {
  audio.playSound(SOUND_EFFECTS.CLICK);
  speech.speak(battleStore.currentWord);
};

const submitSpelling = () => {
  if (!battleStore.currentWord) return;
  const isCorrect = userInput.value.toLowerCase() === battleStore.currentWord.toLowerCase();

  if (isCorrect) {
    if (isCapturing.value) {
      handleCaptureSuccess();
    } else {
      handleAttackSuccess();
    }
  } else {
    battleStore.log(`Incorrect! The word was "${battleStore.currentWord}".`);
    isCapturing.value = false;
    enemyTurn();
  }

  battleStore.setCurrentWord(null);
  userInput.value = '';
};

const handleAttackSuccess = () => {
  const levelDiff = battleStore.playerMon.level / battleStore.enemyMon.level;
  const baseDamage = currentDifficulty.value === 2 ? 12 : 6;
  const variance = Math.floor(Math.random() * 4);
  const damage = Math.floor((baseDamage + variance) * levelDiff);

  battleStore.damageEnemy(damage);
  battleStore.log(`Correct! Dealt ${damage} damage.`);

  audio.playSound(SOUND_EFFECTS.HIT);
  triggerShake(true);

  if (battleStore.enemyMon.hp <= 0) {
    enemyFainted.value = true;
    audio.playSound(SOUND_EFFECTS.FAINT);
    battleStore.log(`${battleStore.enemyMon.name} fainted!`);

    const exp = calculateExpGain(battleStore.enemyMon, battleStore.battleType === 'trainer');
    playerStore.awardExp(exp);
    battleStore.log(`Gained ${exp} EXP!`);

    if (battleStore.battleType === 'trainer') {
      playerStore.markTrainerDefeated(battleStore.trainerId);
      battleStore.log('You defeated the trainer!');
    }

    setTimeout(() => {
      audio.playSound(SOUND_EFFECTS.VICTORY);
    }, ANIMATION_DURATIONS.VICTORY_SOUND_DELAY_MS);

    setTimeout(() => battleStore.endBattle(), ANIMATION_DURATIONS.BATTLE_END_DELAY_MS);
  } else {
    enemyTurn();
  }
};

const handleCaptureSuccess = () => {
  // Save current enemy state for verification after delay
  const targetEnemyId = battleStore.enemyMon?.id;

  setTimeout(() => {
    // Race condition check: ensure battle is still active and it's the same enemy
    if (!battleStore.inBattle || battleStore.enemyMon?.id !== targetEnemyId) {
      isCapturing.value = false;
      return;
    }

    const hpRatio = battleStore.enemyMon.hp / battleStore.enemyMon.maxHp;
    const difficultyBonus = currentDifficulty.value === 2 ? 0.1 : 0;
    const successChance = (0.7 - (hpRatio * 0.5)) + difficultyBonus;

    if (Math.random() < successChance) {
      const added = playerStore.addSpellingmon({ ...battleStore.enemyMon, hp: battleStore.enemyMon.maxHp });
      if (added) {
        audio.playSound(SOUND_EFFECTS.CAPTURE_SUCCESS);
        battleStore.log(`Gotcha! ${battleStore.enemyMon.name} was caught!`);
        setTimeout(() => {
          if (battleStore.inBattle) battleStore.endBattle();
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

const enemyTurn = () => {
  if (!battleStore.inBattle || !battleStore.enemyMon || battleStore.enemyMon.hp <= 0) return;
  battleStore.setTurn(false);
  setTimeout(() => {
    const levelDiff = battleStore.enemyMon.level / battleStore.playerMon.level;
    const damage = Math.floor((3 + Math.floor(Math.random() * 3)) * levelDiff);
    battleStore.damagePlayer(damage);
    battleStore.log(`${battleStore.enemyMon.name} attacked and dealt ${damage} damage!`);

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

onMounted(async () => {
  isFlashing.value = true;
  audio.playSound(SOUND_EFFECTS.BATTLE_START);
  setTimeout(() => isFlashing.value = false, ANIMATION_DURATIONS.FLASH_MS);

  await vocabStore.loadVocab(playerStore.currentArea);

  if (!battleStore.isPlayerTurn && battleStore.inBattle && !battleStore.currentWord) {
    enemyTurn();
  }
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
