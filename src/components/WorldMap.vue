<template>
  <div class="relative w-full h-full bg-green-200 overflow-hidden select-none">
    <!-- Map Rendering -->
    <div class="absolute"
         :style="{
           left: `calc(50% - ${playerX * 40}px)`,
           top: `calc(50% - ${playerY * 40}px)`,
           width: `${MAP_WIDTH * 40}px`,
           height: `${MAP_HEIGHT * 40}px`
         }">

      <div v-for="tile in viewportTiles" :key="`${tile.x}-${tile.y}`"
           class="absolute w-10 h-10 border border-black/5 flex items-center justify-center text-lg"
           :class="getTileClass(tile.type)"
           :style="{ left: `${tile.x * 40}px`, top: `${tile.y * 40}px` }">
        {{ getTileEmoji(tile.type) }}
      </div>
    </div>

    <!-- Player -->
    <div class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-2xl drop-shadow-md flex flex-col items-center">
      <div class="bg-white/50 rounded-full px-2 py-0.5 text-[8px] font-bold uppercase mb-1">{{ playerStore.playerName }}</div>
      <div class="relative">
        <span>{{ playerEmoji }}</span>
        <span class="absolute -bottom-1 -right-1 text-xs">{{ playerStore.party[0]?.emoji }}</span>
      </div>
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

    <div class="absolute bottom-6 left-6 bg-gray-800/80 text-white px-4 py-2 rounded-full text-[8px] font-bold uppercase tracking-widest hidden lg:block">
      WASD to Move | ESC for Menu
    </div>

    <!-- Mobile Controls -->
    <div v-if="isTouchDevice" class="absolute bottom-6 right-6 flex flex-col items-center gap-2 pointer-events-auto"
         @mouseup="stopMovement" @mouseleave="stopMovement" @touchend="stopMovement" @touchcancel="stopMovement">
      <div class="flex flex-col items-center gap-1">
        <button @mousedown="startMovement('w')" @touchstart.prevent="startMovement('w')" class="w-12 h-12 bg-gray-800/90 text-white rounded-lg flex items-center justify-center text-xl shadow-lg active:scale-95">▲</button>
        <div class="flex gap-1">
          <button @mousedown="startMovement('a')" @touchstart.prevent="startMovement('a')" class="w-12 h-12 bg-gray-800/90 text-white rounded-lg flex items-center justify-center text-xl shadow-lg active:scale-95">◀</button>
          <button @mousedown="startMovement('s')" @touchstart.prevent="startMovement('s')" class="w-12 h-12 bg-gray-800/90 text-white rounded-lg flex items-center justify-center text-xl shadow-lg active:scale-95">▼</button>
          <button @mousedown="startMovement('d')" @touchstart.prevent="startMovement('d')" class="w-12 h-12 bg-gray-800/90 text-white rounded-lg flex items-center justify-center text-xl shadow-lg active:scale-95">▶</button>
        </div>
      </div>
    </div>

    <button v-if="isTouchDevice" @click="$emit('toggle-menu')" class="absolute top-6 right-6 w-12 h-12 bg-white border-4 border-gray-800 rounded-xl flex items-center justify-center text-xl shadow-xl active:scale-95">
      📋
    </button>

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
import { ref, onMounted, onUnmounted, computed, watch } from 'vue';
import { usePlayerStore } from '../stores/playerStore';
import { useBattleStore } from '../stores/battleStore';
import { useVocabStore } from '../stores/vocabStore';
import { useInputStore } from '../stores/inputStore';
import { audio } from '../utils/audio';
import { createMon, AREA_CONFIGS, TYPE_EMOJIS } from '../utils/gameData';
import { GAME_CONSTANTS, SOUND_EFFECTS, BATTLE_TYPES, GENDERS, SKIN_TONES, INPUT_CONTEXTS } from '../utils/constants';
import { MapGenerator, TILE_TYPES } from '../utils/mapGenerator';

const playerStore = usePlayerStore();
const battleStore = useBattleStore();
const vocabStore = useVocabStore();
const inputStore = useInputStore();
const engagedTrainers = new Set();

const MAP_WIDTH = 100;
const MAP_HEIGHT = 100;
const VIEWPORT_SIZE = 15; // 15x15 tiles visible

const props = defineProps({
  isMenuOpen: Boolean
});

const emit = defineEmits(['toggle-menu']);

const isTouchDevice = computed(() => {
  if (typeof window === 'undefined') return false;
  return ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
});

const playerEmoji = computed(() => {
  const gender = playerStore.gender;
  const tone = playerStore.skinTone;

  const base = gender === GENDERS.BOY ? '👦' : '👧';
  const modifiers = {
    [SKIN_TONES.PALE]: '🏻',
    [SKIN_TONES.FAIR]: '🏼',
    [SKIN_TONES.NEUTRAL]: '🏽',
    [SKIN_TONES.TAN]: '🏾',
    [SKIN_TONES.DARK]: '🏿'
  };
  return base + (modifiers[tone] || '');
});

const playerX = ref(playerStore.position.x);
const playerY = ref(playerStore.position.y);
const movementInterval = ref(null);

const currentMapData = ref(null);
const areaConfig = computed(() => AREA_CONFIGS[playerStore.currentArea]);

const generateMap = () => {
  const gen = new MapGenerator(playerStore.mapSeed, MAP_WIDTH, MAP_HEIGHT);
  currentMapData.value = gen.generate(playerStore.currentArea);
  // Ensure player is on a walkable tile if map just changed
  if (getTileType(playerX.value, playerY.value) === TILE_TYPES.WALL) {
    const startRoom = currentMapData.value.spellCenter;
    playerX.value = startRoom.x;
    playerY.value = startRoom.y;
    playerStore.updatePosition({ x: playerX.value, y: playerY.value });
  }
};

watch(() => playerStore.currentArea, generateMap);
watch(() => playerStore.mapSeed, generateMap);

const viewportTiles = computed(() => {
  if (!currentMapData.value) return [];
  const tiles = [];
  const half = Math.floor(VIEWPORT_SIZE / 2);
  const startX = Math.max(0, Math.min(MAP_WIDTH - VIEWPORT_SIZE, playerX.value - half));
  const startY = Math.max(0, Math.min(MAP_HEIGHT - VIEWPORT_SIZE, playerY.value - half));

  for (let y = startY; y < startY + VIEWPORT_SIZE; y++) {
    for (let x = startX; x < startX + VIEWPORT_SIZE; x++) {
      tiles.push({ x, y, type: currentMapData.value.map[y][x] });
    }
  }
  return tiles;
});

const getTileType = (x, y) => {
  if (!currentMapData.value) return TILE_TYPES.WALL;
  if (x < 0 || x >= MAP_WIDTH || y < 0 || y >= MAP_HEIGHT) return TILE_TYPES.WALL;
  return currentMapData.value.map[y][x];
};

const getTileClass = (type) => {
  switch (type) {
    case TILE_TYPES.SPELL_CENTER: return 'bg-red-50 border-red-300';
    case TILE_TYPES.GRASS: return 'bg-green-300';
    case TILE_TYPES.TRANSITION: return 'bg-yellow-100';
    case TILE_TYPES.WATER: return 'bg-blue-300';
    case TILE_TYPES.WALL: return 'bg-gray-800';
    case TILE_TYPES.CAVE_WALL: return 'bg-amber-900';
    case TILE_TYPES.BUILDING: return 'bg-blue-800';
    case TILE_TYPES.PATH: return 'bg-orange-50';
    case TILE_TYPES.EMPTY: return 'bg-gray-100';
    default: return 'bg-green-100';
  }
};

const getTileEmoji = (type) => {
  switch (type) {
    case TILE_TYPES.GRASS: return '🌿';
    case TILE_TYPES.SPELL_CENTER: return '🏥';
    case TILE_TYPES.TRAINER: return '👤';
    case TILE_TYPES.TRANSITION: return '🚪';
    case TILE_TYPES.WATER: return '💧';
    case TILE_TYPES.BUILDING: return '🏠';
    default: return '';
  }
};

const isGrass = (x, y) => getTileType(x, y) === TILE_TYPES.GRASS;
const isSpellCenter = (x, y) => getTileType(x, y) === TILE_TYPES.SPELL_CENTER;
const isAreaTransition = (x, y) => getTileType(x, y) === TILE_TYPES.TRANSITION;
const getTrainerData = (x, y) => {
  if (getTileType(x, y) !== TILE_TYPES.TRAINER) return null;
  const trainers = currentMapData.value.trainers;
  const trainer = trainers.find(t => t.x === x && t.y === y);
  if (!trainer) return null;

  const index = trainers.indexOf(trainer);
  const trainerId = `area${playerStore.currentArea}_${index}`;
  if (playerStore.defeatedTrainers.includes(trainerId)) return null;

  return { trainer, trainerId };
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

  const targetTile = getTileType(newX, newY);
  const walkable = [TILE_TYPES.PATH, TILE_TYPES.EMPTY, TILE_TYPES.GRASS, TILE_TYPES.SPELL_CENTER, TILE_TYPES.TRAINER, TILE_TYPES.TRANSITION];

  if (!walkable.includes(targetTile)) return false;

  playerX.value = newX;
  playerY.value = newY;
  playerStore.updatePosition({ x: newX, y: newY });

  checkTriggers(newX, newY);
  return true;
};

const checkTriggers = (x, y) => {
  if (isSpellCenter(x, y)) {
    playerStore.healParty();
    audio.playSound(SOUND_EFFECTS.HEAL);
    playerStore.notify('Your Spellingmon have been fully healed!');
    playerStore.lastSpellCenter = { x, y, area: playerStore.currentArea };
    playerStore.saveState();
    return;
  }

  const trainerData = getTrainerData(x, y);
  if (trainerData) {
    const { trainer, trainerId } = trainerData;

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
    if (x === MAP_WIDTH - 1) {
      const trainersInArea = currentMapData.value.trainers;
      const allDefeated = trainersInArea.every((t, i) =>
        playerStore.defeatedTrainers.includes(`area${playerStore.currentArea}_${i}`)
      );

      if (!allDefeated) {
        playerStore.notify("You must defeat the area's trainer before moving on!");
        playerX.value = MAP_WIDTH - 2;
        playerStore.updatePosition({ x: playerX.value, y: playerY.value });
        return;
      }

      playerStore.unlockArea(playerStore.currentArea + 1);
      playerStore.setCurrentArea(playerStore.currentArea + 1);
      playerX.value = 1;
    } else {
      playerStore.setCurrentArea(playerStore.currentArea - 1);
      playerX.value = MAP_WIDTH - 2;
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

const startMovement = (key) => {
  stopMovement();
  handleInput({ key });
  movementInterval.value = setInterval(() => {
    handleInput({ key });
  }, GAME_CONSTANTS.MOBILE_MOVEMENT_REPEAT_MS);
};

const stopMovement = () => {
  if (movementInterval.value) {
    clearInterval(movementInterval.value);
    movementInterval.value = null;
  }
};

const triggerWildBattle = async () => {
  await vocabStore.loadVocab(playerStore.currentArea);
  const species = areaConfig.value.encounters[Math.floor(Math.random() * areaConfig.value.encounters.length)];

  // Level scaling based on X position within the 100-wide map
  const min = areaConfig.value.minLevel;
  const max = areaConfig.value.maxLevel;
  const progress = playerX.value / MAP_WIDTH;
  const targetLevel = Math.floor(min + (progress * (max - min)));
  const level = Math.max(min, Math.min(max, targetLevel + (Math.random() > 0.8 ? 1 : 0)));

  const wildMon = createMon(species, level);

  const firstHealthyMon = playerStore.party.find(m => m.hp > 0) || playerStore.party[0];
  battleStore.startBattle(firstHealthyMon, wildMon, BATTLE_TYPES.WILD);
};

const triggerTrainerBattle = async (trainer, trainerId) => {
  await vocabStore.loadVocab(playerStore.currentArea);
  const enemyMonCfg = trainer.party[0];
  const enemyMon = createMon(enemyMonCfg.species, enemyMonCfg.level);

  const firstHealthyMon = playerStore.party.find(m => m.hp > 0) || playerStore.party[0];
  battleStore.startBattle(firstHealthyMon, enemyMon, BATTLE_TYPES.TRAINER, trainer, trainerId);
};

onMounted(() => {
  generateMap();
  inputStore.addListener(INPUT_CONTEXTS.WORLD, handleInput, 5);
});

onUnmounted(() => {
  inputStore.removeListener(INPUT_CONTEXTS.WORLD);
  stopMovement();
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
