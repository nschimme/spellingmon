<template>
  <div class="relative w-full h-full bg-green-200 overflow-hidden select-none">
    <!-- Map Rendering -->
    <div class="absolute transition-all duration-200"
         :style="{ left: `calc(50% - ${playerX * 40}px)`, top: `calc(50% - ${playerY * 40}px)` }">

      <div v-for="y in GAME_CONSTANTS.MAP_HEIGHT" :key="y" class="flex">
        <div v-for="x in GAME_CONSTANTS.MAP_WIDTH" :key="x"
             class="w-10 h-10 border border-green-300 flex items-center justify-center relative"
             :class="getTileClass(x-1, y-1)">
          <span v-if="isGrass(x-1, y-1)" class="text-green-600">🌿</span>
          <span v-if="isSpellCenter(x-1, y-1)" class="text-red-500 font-bold drop-shadow-sm">H</span>
          <div v-if="getTrainer(x-1, y-1)" class="text-blue-500 transform scale-125">👤</div>
          <div v-if="isAreaTransition(x-1, y-1)" class="text-yellow-600 font-bold">🚪</div>
        </div>
      </div>
    </div>

    <!-- Player -->
    <div class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-2xl drop-shadow-md">
      🚶
    </div>

    <!-- HUD -->
    <div class="absolute top-6 left-6 bg-white/95 border-4 border-gray-800 p-4 rounded-xl shadow-xl flex flex-col gap-1">
      <div class="text-sm font-black text-gray-800 uppercase tracking-tighter">
        {{ areaConfig.name }}
      </div>
      <div class="text-[8px] font-bold text-gray-500 uppercase">
        Party: {{ playerStore.party[0]?.name }} (Lv{{ playerStore.party[0]?.level }})
      </div>
    </div>

    <div class="absolute bottom-6 left-6 bg-gray-800/80 text-white px-4 py-2 rounded-full text-[8px] font-bold uppercase tracking-widest">
      WASD to Move | ESC for Menu
    </div>

    <!-- Notifications -->
    <transition name="fade">
      <div v-if="playerStore.notification"
           class="absolute bottom-20 left-1/2 -translate-x-1/2 bg-white border-4 border-gray-800 px-6 py-3 rounded-xl shadow-2xl z-30 min-w-[300px]">
        <p class="text-[10px] font-black uppercase text-gray-800 text-center leading-relaxed">
          {{ playerStore.notification }}
        </p>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { usePlayerStore } from '../stores/playerStore';
import { useBattleStore } from '../stores/battleStore';
import { useVocabStore } from '../stores/vocabStore';
import { useInputStore } from '../stores/inputStore';
import { createMon, TRAINERS, AREA_CONFIGS } from '../utils/gameData';
import { GAME_CONSTANTS } from '../utils/constants';

const playerStore = usePlayerStore();
const battleStore = useBattleStore();
const vocabStore = useVocabStore();
const inputStore = useInputStore();
const engagedTrainers = new Set();

const props = defineProps({
  isMenuOpen: Boolean
});

const playerX = ref(playerStore.position.x);
const playerY = ref(playerStore.position.y);

const areaConfig = computed(() => AREA_CONFIGS[playerStore.currentArea]);

const getTileClass = (x, y) => {
  if (isSpellCenter(x, y)) return 'bg-red-50 border-red-300';
  if (isGrass(x, y)) return 'bg-green-300';
  if (isAreaTransition(x, y)) return 'bg-yellow-100';
  return 'bg-green-100';
};

const isGrass = (x, y) => {
  return areaConfig.value.layout.grass.some(g => x >= g.x1 && x <= g.x2 && y >= g.y1 && y <= g.y2);
};

const isSpellCenter = (x, y) => {
  const sc = areaConfig.value.layout.spellCenter;
  return x === sc.x && y === sc.y;
};

const isAreaTransition = (x, y) => {
  const transitionY = GAME_CONSTANTS.TRANSITION_Y;
  if (x === GAME_CONSTANTS.MAP_WIDTH - 1 && y === transitionY && playerStore.currentArea < GAME_CONSTANTS.MAX_AREAS) return true;
  if (x === 0 && y === transitionY && playerStore.currentArea > 1) return true;
  return false;
};

const getTrainer = (x, y) => {
  const trainers = TRAINERS[playerStore.currentArea] || [];
  const trainerLayout = areaConfig.value.layout.trainers;
  return trainers.find((t, i) => {
    const trainerId = `area${playerStore.currentArea}_${i}`;
    if (playerStore.defeatedTrainers.includes(trainerId)) return false;
    const pos = trainerLayout[i];
    return pos && x === pos.x && y === pos.y;
  });
};

const handleInput = (e) => {
  if (battleStore.inBattle || props.isMenuOpen) return false;

  const key = typeof e.key === 'string' ? e.key.toLowerCase() : '';
  let newX = playerX.value;
  let newY = playerY.value;
  let moved = false;

  if (e.key === 'ArrowUp' || key === 'w') { newY--; moved = true; }
  if (e.key === 'ArrowDown' || key === 's') { newY++; moved = true; }
  if (e.key === 'ArrowLeft' || key === 'a') { newX--; moved = true; }
  if (e.key === 'ArrowRight' || key === 'd') { newX++; moved = true; }

  if (!moved) return false;

  if (newX < 0 || newX >= GAME_CONSTANTS.MAP_WIDTH || newY < 0 || newY >= GAME_CONSTANTS.MAP_HEIGHT) return true;

  playerX.value = newX;
  playerY.value = newY;
  playerStore.updatePosition({ x: newX, y: newY });

  checkTriggers(newX, newY);
  return true;
};

const checkTriggers = (x, y) => {
  if (isSpellCenter(x, y)) {
    playerStore.healParty();
    playerStore.notify('Your Spellingmon have been fully healed!');
    playerStore.lastSpellCenter = { x, y, area: playerStore.currentArea };
    playerStore.saveState();
    return;
  }

  const trainer = getTrainer(x, y);
  if (trainer) {
    const trainers = TRAINERS[playerStore.currentArea];
    const index = trainers.indexOf(trainer);
    const trainerId = `area${playerStore.currentArea}_${index}`;

    if (engagedTrainers.has(trainerId)) return;
    engagedTrainers.add(trainerId);

    playerStore.notify(`${trainer.name}: "${trainer.dialog}"`);
    setTimeout(() => {
      triggerTrainerBattle(trainer, trainerId);
      engagedTrainers.delete(trainerId);
    }, GAME_CONSTANTS.TRAINER_ENGAGEMENT_DELAY_MS);
    return;
  }

  if (isAreaTransition(x, y)) {
    if (x === GAME_CONSTANTS.MAP_WIDTH - 1) {
      const trainersInArea = TRAINERS[playerStore.currentArea] || [];
      const allDefeated = trainersInArea.every((t, i) =>
        playerStore.defeatedTrainers.includes(`area${playerStore.currentArea}_${i}`)
      );

      if (!allDefeated) {
        playerStore.notify("You must defeat the area's trainer before moving on!");
        playerX.value = GAME_CONSTANTS.MAP_WIDTH - 2;
        playerStore.updatePosition({ x: playerX.value, y: playerY.value });
        return;
      }

      playerStore.unlockArea(playerStore.currentArea + 1);
      playerStore.setCurrentArea(playerStore.currentArea + 1);
      playerX.value = 1;
    } else {
      playerStore.setCurrentArea(playerStore.currentArea - 1);
      playerX.value = GAME_CONSTANTS.MAP_WIDTH - 2;
    }
    playerStore.updatePosition({ x: playerX.value, y: playerY.value });
    return;
  }

  if (isGrass(x, y)) {
    if (Math.random() < GAME_CONSTANTS.GRASS_ENCOUNTER_CHANCE) {
      triggerWildBattle();
    }
  }
};

const triggerWildBattle = async () => {
  await vocabStore.loadVocab(playerStore.currentArea);
  const species = areaConfig.value.encounters[Math.floor(Math.random() * areaConfig.value.encounters.length)];
  const level = areaConfig.value.minLevel + Math.floor(Math.random() * (areaConfig.value.maxLevel - areaConfig.value.minLevel + 1));
  const wildMon = createMon(species, level);
  battleStore.startBattle(playerStore.party[0], wildMon, 'wild');
};

const triggerTrainerBattle = async (trainer, trainerId) => {
  await vocabStore.loadVocab(playerStore.currentArea);
  const enemyMonCfg = trainer.party[0];
  const enemyMon = createMon(enemyMonCfg.species, enemyMonCfg.level);
  battleStore.startBattle(playerStore.party[0], enemyMon, 'trainer', trainer, trainerId);
};

onMounted(() => {
  inputStore.addListener('world', handleInput, 5);
});

onUnmounted(() => {
  inputStore.removeListener('world');
});
</script>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s, transform 0.3s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
  transform: translate(-50%, 20px);
}
</style>
