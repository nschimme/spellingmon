<template>
  <div class="fixed inset-0 bg-white z-40 flex flex-col p-4 overflow-hidden" :class="{ 'animate-flash': isFlashing }">
    <!-- Battle Field -->
    <div class="flex-1 relative border-4 border-gray-800 rounded-lg overflow-hidden bg-gradient-to-b from-blue-100 to-green-100">
      <!-- Enemy -->
      <div class="absolute top-10 right-10 flex flex-col items-end transition-all duration-300"
           :class="{ 'animate-shake': enemyShake, 'opacity-0 translate-y-10': enemyFainted }">
        <div class="bg-white border-2 border-gray-800 p-2 rounded-lg w-48 shadow-md">
          <div class="flex justify-between font-bold">
            <span>{{ battleStore.enemyMon.name }}</span>
            <span>Lv{{ battleStore.enemyMon.level }}</span>
          </div>
          <div class="w-full bg-gray-200 h-2 rounded mt-1 overflow-hidden">
            <div class="h-full transition-all duration-500"
                 :class="getHPColorClass(battleStore.enemyMon.hp, battleStore.enemyMon.maxHp)"
                 :style="{ width: `${(battleStore.enemyMon.hp / battleStore.enemyMon.maxHp) * 100}%` }"></div>
          </div>
          <div class="text-xs text-right">{{ battleStore.enemyMon.hp }} / {{ battleStore.enemyMon.maxHp }}</div>
        </div>
        <!-- Hide sprite during the capture ball animation (when isCapturing and word is gone) -->
        <div class="text-6xl mt-4 transition-transform duration-300"
             :class="{ 'scale-0 opacity-0': isCapturing && !battleStore.currentWord }">👾</div>

        <!-- Capture Ball Anim -->
        <div v-if="isCapturing && !battleStore.currentWord" class="absolute inset-0 flex items-center justify-center animate-capture">
          <div class="text-4xl">🔴</div>
        </div>
      </div>

      <!-- Player -->
      <div class="absolute bottom-10 left-10 flex flex-col items-start transition-all duration-300"
           :class="{ 'animate-shake': playerShake, 'opacity-0 translate-y-10': playerFainted }">
        <div class="text-6xl mb-4 scale-x-[-1]">🦖</div>
        <div class="bg-white border-2 border-gray-800 p-2 rounded-lg w-48 shadow-md">
          <div class="flex justify-between font-bold">
            <span>{{ battleStore.playerMon.name }}</span>
            <span>Lv{{ battleStore.playerMon.level }}</span>
          </div>
          <div class="w-full bg-gray-200 h-2 rounded mt-1 overflow-hidden">
            <div class="h-full transition-all duration-500"
                 :class="getHPColorClass(battleStore.playerMon.hp, battleStore.playerMon.maxHp)"
                 :style="{ width: `${(battleStore.playerMon.hp / battleStore.playerMon.maxHp) * 100}%` }"></div>
          </div>
          <div class="text-xs text-right">{{ battleStore.playerMon.hp }} / {{ battleStore.playerMon.maxHp }}</div>
        </div>
      </div>
    </div>

    <!-- Battle Log & Input -->
    <div class="h-48 mt-4 border-4 border-gray-800 rounded-lg flex p-4 bg-white">
      <div class="flex-1 border-r border-gray-300 pr-4 overflow-y-auto">
        <div v-for="(log, i) in battleStore.battleLog" :key="i" class="mb-1 text-sm font-bold">
          {{ log }}
        </div>
      </div>

      <div class="w-1/3 pl-4 flex flex-col justify-center gap-2">
        <template v-if="battleStore.isPlayerTurn && !battleStore.currentWord">
          <button @click="prepareAttack('Quick Spell', 1)" class="bg-blue-500 text-white py-2 rounded hover:bg-blue-600 font-bold border-b-4 border-blue-700 active:translate-y-1">Quick Spell (Easy)</button>
          <button @click="prepareAttack('Power Spell', 2)" class="bg-purple-500 text-white py-2 rounded hover:bg-purple-600 font-bold border-b-4 border-purple-700 active:translate-y-1">Power Spell (Hard)</button>
          <button @click="tryCapture" :disabled="isCapturing" class="bg-red-500 text-white py-2 rounded hover:bg-red-600 font-bold border-b-4 border-red-700 active:translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed">Capture</button>
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

const battleStore = useBattleStore();
const vocabStore = useVocabStore();
const playerStore = usePlayerStore();

const userInput = ref('');
const isCapturing = ref(false);
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
  const baseDamage = currentDifficulty.value === 2 ? 12 : 6;
  const variance = Math.floor(Math.random() * 4);
  const damage = baseDamage + variance;

  battleStore.damageEnemy(damage);
  battleStore.log(`Correct! Dealt ${damage} damage.`);

  audio.playSound(SOUND_EFFECTS.HIT);
  triggerShake(true);

  if (battleStore.enemyMon.hp <= 0) {
    enemyFainted.value = true;
    audio.playSound(SOUND_EFFECTS.FAINT);
    battleStore.log(`${battleStore.enemyMon.name} fainted!`);

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
  // Animation state is already set by isCapturing being true and currentWord being cleared in submitSpelling

  setTimeout(() => {
    const hpRatio = battleStore.enemyMon.hp / battleStore.enemyMon.maxHp;
    const difficultyBonus = currentDifficulty.value === 2 ? 0.1 : 0;
    const successChance = (0.7 - (hpRatio * 0.5)) + difficultyBonus;

    if (Math.random() < successChance) {
      const added = playerStore.addSpellingmon({ ...battleStore.enemyMon, hp: battleStore.enemyMon.maxHp });
      if (added) {
        audio.playSound(SOUND_EFFECTS.CAPTURE_SUCCESS);
        battleStore.log(`Gotcha! ${battleStore.enemyMon.name} was caught!`);
        setTimeout(() => battleStore.endBattle(), ANIMATION_DURATIONS.CAPTURE_END_DELAY_MS);
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
  battleStore.setTurn(false);
  setTimeout(() => {
    const damage = 3 + Math.floor(Math.random() * 3);
    battleStore.damagePlayer(damage);
    battleStore.log(`${battleStore.enemyMon.name} attacked and dealt ${damage} damage!`);

    audio.playSound(SOUND_EFFECTS.HIT);
    triggerShake(false);

    if (battleStore.playerMon.hp <= 0) {
      playerFainted.value = true;
      audio.playSound(SOUND_EFFECTS.FAINT);
      battleStore.log(`${battleStore.playerMon.name} fainted!`);
      battleStore.log('You whited out! Teleporting to SpellCenter.');
      setTimeout(() => {
        playerStore.handleWhiteout();
        battleStore.endBattle();
      }, 2500);
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
  animation: shake 0.1s ease-in-out infinite;
}

@keyframes flash {
  0%, 100% { background-color: white; }
  50% { background-color: #333; }
}
.animate-flash {
  animation: flash 0.1s steps(2, start) 5;
}

@keyframes capture {
  0% { transform: translate(-200px, 100px) rotate(0deg) scale(0.5); opacity: 0; }
  50% { transform: translate(0, -50px) rotate(180deg) scale(1.2); opacity: 1; }
  100% { transform: translate(0, 0) rotate(360deg) scale(1); opacity: 1; }
}
.animate-capture {
  animation: capture 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
}
</style>
