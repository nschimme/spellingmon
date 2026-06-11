<template>
  <div class="fixed inset-0 bg-white z-40 flex flex-col p-4">
    <!-- Battle Field -->
    <div class="flex-1 relative border-4 border-gray-800 rounded-lg overflow-hidden bg-gradient-to-b from-blue-100 to-green-100">
      <!-- Enemy -->
      <div class="absolute top-10 right-10 flex flex-col items-end">
        <div class="bg-white border-2 border-gray-800 p-2 rounded-lg w-48 shadow-md">
          <div class="flex justify-between font-bold">
            <span>{{ battleStore.enemyMon.name }}</span>
            <span>Lv{{ battleStore.enemyMon.level }}</span>
          </div>
          <div class="w-full bg-gray-200 h-2 rounded mt-1 overflow-hidden">
            <div class="bg-green-500 h-full transition-all duration-500"
                 :style="{ width: `${(battleStore.enemyMon.hp / battleStore.enemyMon.maxHp) * 100}%` }"></div>
          </div>
          <div class="text-xs text-right">{{ battleStore.enemyMon.hp }} / {{ battleStore.enemyMon.maxHp }}</div>
        </div>
        <div class="text-6xl mt-4">👾</div>
      </div>

      <!-- Player -->
      <div class="absolute bottom-10 left-10 flex flex-col items-start">
        <div class="text-6xl mb-4 scale-x-[-1]">🦖</div>
        <div class="bg-white border-2 border-gray-800 p-2 rounded-lg w-48 shadow-md">
          <div class="flex justify-between font-bold">
            <span>{{ battleStore.playerMon.name }}</span>
            <span>Lv{{ battleStore.playerMon.level }}</span>
          </div>
          <div class="w-full bg-gray-200 h-2 rounded mt-1 overflow-hidden">
            <div class="bg-green-500 h-full transition-all duration-500"
                 :style="{ width: `${(battleStore.playerMon.hp / battleStore.playerMon.maxHp) * 100}%` }"></div>
          </div>
          <div class="text-xs text-right">{{ battleStore.playerMon.hp }} / {{ battleStore.playerMon.maxHp }}</div>
        </div>
      </div>
    </div>

    <!-- Battle Log & Input -->
    <div class="h-48 mt-4 border-4 border-gray-800 rounded-lg flex p-4 bg-white">
      <div class="flex-1 border-r border-gray-300 pr-4 overflow-y-auto">
        <div v-for="(log, i) in battleStore.battleLog" :key="i" class="mb-1">
          {{ log }}
        </div>
      </div>

      <div class="w-1/3 pl-4 flex flex-col justify-center gap-2">
        <template v-if="battleStore.isPlayerTurn && !battleStore.currentWord">
          <button @click="prepareAttack('Quick Spell', 1)" class="bg-blue-500 text-white py-2 rounded hover:bg-blue-600 font-bold">Quick Spell (Easy)</button>
          <button @click="prepareAttack('Power Spell', 2)" class="bg-purple-500 text-white py-2 rounded hover:bg-purple-600 font-bold">Power Spell (Hard)</button>
          <button @click="tryCapture" class="bg-red-500 text-white py-2 rounded hover:bg-red-600 font-bold">Capture</button>
        </template>

        <template v-if="battleStore.currentWord">
          <div class="text-center">
            <p class="font-bold mb-2">Spell the word!</p>
            <button @click="repeatWord" class="text-blue-500 text-sm underline mb-2">Listen Again</button>
            <input v-model="userInput" @keyup.enter="submitSpelling"
                   class="w-full border-2 border-gray-800 p-2 text-center text-xl uppercase"
                   autofocus />
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useBattleStore } from '../stores/battleStore';
import { useVocabStore } from '../stores/vocabStore';
import { usePlayerStore } from '../stores/playerStore';
import { speech } from '../utils/speech';

const battleStore = useBattleStore();
const vocabStore = useVocabStore();
const playerStore = usePlayerStore();

const userInput = ref('');
const isCapturing = ref(false);

const prepareAttack = (move, difficulty) => {
  const wordObj = vocabStore.getRandomWord(playerStore.currentArea, difficulty);
  battleStore.currentWord = wordObj.word;
  battleStore.log(`Using ${move}!`);
  speech.speak(battleStore.currentWord);
  userInput.value = '';
  isCapturing.value = false;
};

const tryCapture = () => {
  if (battleStore.battleType === 'trainer') {
    battleStore.log("You can't capture a trainer's Spellingmon!");
    return;
  }
  const wordObj = vocabStore.getRandomWord(playerStore.currentArea, 2);
  battleStore.currentWord = wordObj.word;
  battleStore.log(`Attempting to capture!`);
  speech.speak(battleStore.currentWord);
  userInput.value = '';
  isCapturing.value = true;
};

const repeatWord = () => {
  speech.speak(battleStore.currentWord);
};

const submitSpelling = () => {
  const isCorrect = userInput.value.toLowerCase() === battleStore.currentWord.toLowerCase();

  if (isCorrect) {
    if (isCapturing.value) {
      handleCaptureSuccess();
    } else {
      handleAttackSuccess();
    }
  } else {
    battleStore.log(`Incorrect! The word was "${battleStore.currentWord}".`);
    enemyTurn();
  }

  battleStore.currentWord = null;
  userInput.value = '';
};

const handleAttackSuccess = () => {
  const damage = 5 + Math.floor(Math.random() * 5);
  battleStore.enemyMon.hp -= damage;
  battleStore.log(`Correct! Dealt ${damage} damage.`);

  if (battleStore.enemyMon.hp <= 0) {
    battleStore.enemyMon.hp = 0;
    battleStore.log(`${battleStore.enemyMon.name} fainted!`);

    if (battleStore.battleType === 'trainer') {
      playerStore.markTrainerDefeated(battleStore.trainerId);
      battleStore.log('You defeated the trainer!');
    }

    setTimeout(() => battleStore.endBattle(), 2000);
  } else {
    enemyTurn();
  }
};

const handleCaptureSuccess = () => {
  // Capture rate logic: higher success if HP is low
  const hpRatio = battleStore.enemyMon.hp / battleStore.enemyMon.maxHp;
  const successChance = 0.8 - (hpRatio * 0.5);

  if (Math.random() < successChance) {
    battleStore.log(`Gotcha! ${battleStore.enemyMon.name} was caught!`);
    playerStore.addSpellingmon({ ...battleStore.enemyMon, hp: battleStore.enemyMon.maxHp });
    setTimeout(() => battleStore.endBattle(), 2000);
  } else {
    battleStore.log(`${battleStore.enemyMon.name} broke free!`);
    enemyTurn();
  }
};

const enemyTurn = () => {
  battleStore.isPlayerTurn = false;
  setTimeout(() => {
    const damage = 3 + Math.floor(Math.random() * 3);
    battleStore.playerMon.hp -= damage;
    battleStore.log(`${battleStore.enemyMon.name} attacked and dealt ${damage} damage!`);

    if (battleStore.playerMon.hp <= 0) {
      battleStore.playerMon.hp = 0;
      battleStore.log(`${battleStore.playerMon.name} fainted!`);
      battleStore.log('You whited out! Teleporting to SpellCenter.');
      setTimeout(() => {
        playerStore.handleWhiteout();
        battleStore.endBattle();
      }, 2500);
    } else {
      battleStore.isPlayerTurn = true;
    }
  }, 1500);
};
</script>
