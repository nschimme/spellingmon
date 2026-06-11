<template>
  <div class="relative w-full h-full bg-green-200 overflow-hidden select-none" ref="mapContainer">
    <!-- Map Rendering -->
    <div class="absolute transition-all duration-200"
         :style="{ left: `calc(50% - ${playerX * 40}px)`, top: `calc(50% - ${playerY * 40}px)` }">

      <div v-for="y in mapHeight" :key="y" class="flex">
        <div v-for="x in mapWidth" :key="x"
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
        {{ AREA_CONFIGS[playerStore.currentArea]?.name || 'Route 1' }}
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
import { ref, onMounted, onUnmounted } from 'vue';
import { usePlayerStore } from '../stores/playerStore';
import { useBattleStore } from '../stores/battleStore';
import { useVocabStore } from '../stores/vocabStore';
import { createMon, TRAINERS, AREA_CONFIGS } from '../utils/gameData';

const playerStore = usePlayerStore();
const battleStore = useBattleStore();
const vocabStore = useVocabStore();

const mapWidth = 20;
const mapHeight = 20;
const playerX = ref(playerStore.position.x);
const playerY = ref(playerStore.position.y);

const getTileClass = (x, y) => {
  if (isSpellCenter(x, y)) return 'bg-red-50 border-red-300';
  if (isGrass(x, y)) return 'bg-green-300';
  if (isAreaTransition(x, y)) return 'bg-yellow-100';
  return 'bg-green-100';
};

const isGrass = (x, y) => {
  const area = playerStore.currentArea;
  if (area % 2 === 1) return (x > 2 && x < 8 && y > 2 && y < 8) || (x > 12 && x < 18 && y > 12 && y < 18);
  return (x > 2 && x < 18 && y > 8 && y < 12);
};

const isSpellCenter = (x, y) => x === 10 && y === 10;

const isAreaTransition = (x, y) => {
  if (x === mapWidth - 1 && y === 10 && playerStore.currentArea < 5) return true;
  if (x === 0 && y === 10 && playerStore.currentArea > 1) return true;
  return false;
};

const getTrainer = (x, y) => {
  const trainers = TRAINERS[playerStore.currentArea] || [];
  return trainers.find((t, i) => {
    const trainerId = `area${playerStore.currentArea}_${i}`;
    if (playerStore.defeatedTrainers.includes(trainerId)) return false;
    if (i === 0) return x === 5 && y === 15;
    if (i === 1) return x === 15 && y === 5;
    return false;
  });
};

const handleKeydown = (e) => {
  if (battleStore.inBattle) return;

  let newX = playerX.value;
  let newY = playerY.value;

  if (e.key === 'ArrowUp' || e.key === 'w') newY--;
  if (e.key === 'ArrowDown' || e.key === 's') newY++;
  if (e.key === 'ArrowLeft' || e.key === 'a') newX--;
  if (e.key === 'ArrowRight' || e.key === 'd') newX++;

  if (newX < 0 || newX >= mapWidth || newY < 0 || newY >= mapHeight) return;

  playerX.value = newX;
  playerY.value = newY;
  playerStore.updatePosition({ x: newX, y: newY });

  checkTriggers(newX, newY);
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
    playerStore.notify(`${trainer.name}: "${trainer.dialog}"`);
    setTimeout(() => {
      triggerTrainerBattle(trainer, trainerId);
    }, 1500);
    return;
  }

  if (isAreaTransition(x, y)) {
    if (x === mapWidth - 1) {
      // Check if all trainers in current area are defeated
      const trainersInArea = TRAINERS[playerStore.currentArea] || [];
      const allDefeated = trainersInArea.every((t, i) =>
        playerStore.defeatedTrainers.includes(`area${playerStore.currentArea}_${i}`)
      );

      if (!allDefeated) {
        playerStore.notify("You must defeat the area's trainer before moving on!");
        playerX.value = mapWidth - 2;
        playerStore.updatePosition({ x: playerX.value, y: playerY.value });
        return;
      }

      playerStore.unlockArea(playerStore.currentArea + 1);
      playerStore.setCurrentArea(playerStore.currentArea + 1);
      playerX.value = 1;
    } else {
      playerStore.setCurrentArea(playerStore.currentArea - 1);
      playerX.value = mapWidth - 2;
    }
    playerStore.updatePosition({ x: playerX.value, y: playerY.value });
    return;
  }

  if (isGrass(x, y)) {
    if (Math.random() < 0.15) {
      triggerWildBattle();
    }
  }
};

const triggerWildBattle = async () => {
  await vocabStore.loadVocab(playerStore.currentArea);
  const config = AREA_CONFIGS[playerStore.currentArea];
  const species = config.encounters[Math.floor(Math.random() * config.encounters.length)];
  const level = config.minLevel + Math.floor(Math.random() * (config.maxLevel - config.minLevel + 1));
  const wildMon = createMon(species, level);
  battleStore.startBattle(playerStore.party[0], wildMon, 'wild');
};

const triggerTrainerBattle = async (trainer, trainerId) => {
  await vocabStore.loadVocab(playerStore.currentArea);
  const enemyMon = trainer.party[0]; // Simplified: trainer has 1 mon for now
  battleStore.startBattle(playerStore.party[0], enemyMon, 'trainer', trainer, trainerId);
};

onMounted(() => {
  window.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown);
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
