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
           class="absolute w-10 h-10 border border-black/5 flex items-center justify-center text-lg transition-all duration-300"
           :class="getTileClass(tile.type)"
           :style="{ left: `${tile.x * 40}px`, top: `${tile.y * 40}px` }">
        <span v-if="getTrainerAt(tile.x, tile.y) && alertingTrainer === getTrainerAt(tile.x, tile.y).trainerId"
              class="absolute -top-6 text-red-600 font-bold animate-bounce text-2xl">!</span>
        {{ getTileEmoji(tile.type, tile.x, tile.y) }}
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
const alertingTrainer = ref(null);

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

const generateMap = (isTransition = false, direction = null) => {
  const gen = new MapGenerator(playerStore.mapSeed, MAP_WIDTH, MAP_HEIGHT);
  currentMapData.value = gen.generate(playerStore.currentArea);

  if (isTransition) {
    if (direction === 'next') {
      // Entering from previous area, should be at PREV transition
      const entry = currentMapData.value.transitions.find(t => t.type === TRANSITION_TYPES.PREV);
      if (entry) {
        playerX.value = entry.x;
        playerY.value = entry.y;
      }
    } else if (direction === 'prev') {
      // Entering from next area, should be at NEXT transition
      const entry = currentMapData.value.transitions.find(t => t.type === TRANSITION_TYPES.NEXT);
      if (entry) {
        playerX.value = entry.x;
        playerY.value = entry.y;
      }
    }
  } else if (playerStore.position && playerStore.position.x !== 5 && playerStore.position.y !== 5) {
    // Restore saved position (e.g. after battle)
    playerX.value = playerStore.position.x;
    playerY.value = playerStore.position.y;
  } else {
    // Initial load or whiteout - go to Spell Center
    const sc = currentMapData.value.spellCenter;
    if (sc) {
      playerX.value = sc.x;
      playerY.value = sc.y;
    }
  }
  playerStore.updatePosition({ x: playerX.value, y: playerY.value });
};

watch(() => playerStore.currentArea, (newArea, oldArea) => {
  // If we're whiting out, newArea might be equal to oldArea but position changed
  // Or it might be a different area.
  const direction = newArea > oldArea ? 'next' : 'prev';
  generateMap(true, direction);
});

// Watch for whiteout specifically if area doesn't change
watch(() => playerStore.position, (newPos) => {
  if (battleStore.inBattle) return; // Ignore during battle
  if (newPos.x === playerStore.lastSpellCenter.x && newPos.y === playerStore.lastSpellCenter.y && playerStore.currentArea === playerStore.lastSpellCenter.area) {
     if (playerX.value !== newPos.x || playerY.value !== newPos.y) {
        playerX.value = newPos.x;
        playerY.value = newPos.y;
        generateMap();
     }
  }
}, { deep: true });
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

const getTileEmoji = (type, x, y) => {
  switch (type) {
    case TILE_TYPES.GRASS: return '🌿';
    case TILE_TYPES.SPELL_CENTER: return '🏥';
    case TILE_TYPES.TRAINER: {
      const trainer = currentMapData.value.trainers.find(t => t.x === x && t.y === y);
      if (!trainer) return '👤';
      switch (trainer.direction) {
        case 'up': return '👤'; // Could use different emojis if available
        case 'down': return '👤';
        case 'left': return '👤';
        case 'right': return '👤';
        default: return '👤';
      }
    }
    case TILE_TYPES.TRANSITION: return '🚪';
    case TILE_TYPES.WATER: return '💧';
    case TILE_TYPES.BUILDING: return '🏠';
    default: return '';
  }
};

const isGrass = (x, y) => getTileType(x, y) === TILE_TYPES.GRASS;
const isSpellCenter = (x, y) => getTileType(x, y) === TILE_TYPES.SPELL_CENTER;
const isAreaTransition = (x, y) => getTileType(x, y) === TILE_TYPES.TRANSITION;

const getTrainerAt = (x, y) => {
  if (!currentMapData.value) return null;
  const trainer = currentMapData.value.trainers.find(t => t.x === x && t.y === y);
  if (!trainer) return null;
  const index = currentMapData.value.trainers.indexOf(trainer);
  const trainerId = `area${playerStore.currentArea}_${index}`;
  if (playerStore.defeatedTrainers.includes(trainerId)) return null;
  return { trainer, trainerId };
};

const getTrainerData = (x, y) => {
  if (getTileType(x, y) !== TILE_TYPES.TRAINER) return null;
  return getTrainerAt(x, y);
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
  checkTrainerLOS();
  updateDiscovery(newX, newY);
  return true;
};

const updateDiscovery = (x, y) => {
  const RADIUS = 2;
  for (let dy = -RADIUS; dy <= RADIUS; dy++) {
    for (let dx = -RADIUS; dx <= RADIUS; dx++) {
      const tx = x + dx;
      const ty = y + dy;
      if (tx >= 0 && tx < MAP_WIDTH && ty >= 0 && ty < MAP_HEIGHT) {
        playerStore.discoverTile(playerStore.currentArea, tx, ty);
      }
    }
  }
};

const checkTrainerLOS = () => {
  if (battleStore.inBattle || alertingTrainer.value) return;

  const trainers = currentMapData.value.trainers;
  const LOS_RANGE = 5;

  for (let i = 0; i < trainers.length; i++) {
    const t = trainers[i];
    const trainerId = `area${playerStore.currentArea}_${i}`;
    if (playerStore.defeatedTrainers.includes(trainerId)) continue;
    if (engagedTrainers.has(trainerId)) continue;

    let inLOS = false;
    const dx = playerX.value - t.x;
    const dy = playerY.value - t.y;

    if (t.direction === 'right' && dy === 0 && dx > 0 && dx <= LOS_RANGE) inLOS = true;
    else if (t.direction === 'left' && dy === 0 && dx < 0 && dx >= -LOS_RANGE) inLOS = true;
    else if (t.direction === 'down' && dx === 0 && dy > 0 && dy <= LOS_RANGE) inLOS = true;
    else if (t.direction === 'up' && dx === 0 && dy < 0 && dy >= -LOS_RANGE) inLOS = true;

    if (inLOS) {
      // Check for obstacles
      let hasObstacle = false;
      const stepX = dx === 0 ? 0 : (dx > 0 ? 1 : -1);
      const stepY = dy === 0 ? 0 : (dy > 0 ? 1 : -1);
      const dist = Math.max(Math.abs(dx), Math.abs(dy));

      for (let s = 1; s < dist; s++) {
        const checkX = t.x + stepX * s;
        const checkY = t.y + stepY * s;
        const tile = getTileType(checkX, checkY);
        if (tile === TILE_TYPES.WALL || tile === TILE_TYPES.WATER || tile === TILE_TYPES.CAVE_WALL || tile === TILE_TYPES.BUILDING) {
          hasObstacle = true;
          break;
        }
      }

      if (!inLOS || hasObstacle) continue;

      initiateTrainerApproach(t, trainerId);
      break;
    }
  }
};

const initiateTrainerApproach = (trainer, trainerId) => {
  engagedTrainers.add(trainerId);
  alertingTrainer.value = trainerId;
  audio.playSound(SOUND_EFFECTS.CLICK); // Placeholder for alert sound

  setTimeout(async () => {
    // Trainer walks to player
    const dx = playerX.value - trainer.x;
    const dy = playerY.value - trainer.y;
    const stepX = dx === 0 ? 0 : (dx > 0 ? 1 : -1);
    const stepY = dy === 0 ? 0 : (dy > 0 ? 1 : -1);
    const dist = Math.max(Math.abs(dx), Math.abs(dy)) - 1;

    for (let s = 0; s < dist; s++) {
      // Actually update the map and trainer position
      const oldX = trainer.x;
      const oldY = trainer.y;
      trainer.x += stepX;
      trainer.y += stepY;

      // Swap tiles on the map
      currentMapData.value.map[oldY][oldX] = TILE_TYPES.PATH; // Assuming trainers always on path
      currentMapData.value.map[trainer.y][trainer.x] = TILE_TYPES.TRAINER;

      await new Promise(r => setTimeout(r, 150));
    }

    alertingTrainer.value = null;
    playerStore.notify(`${trainer.name}: "${trainer.dialog}"`);

    setTimeout(() => {
      triggerTrainerBattle(trainer, trainerId);
      engagedTrainers.delete(trainerId);
    }, GAME_CONSTANTS.TRAINER_ENGAGEMENT_DELAY_MS);
  }, 600);
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
    const transition = currentMapData.value.transitions.find(t => t.x === x && t.y === y);
    if (transition.type === TRANSITION_TYPES.NEXT) {
      const trainersInArea = currentMapData.value.trainers;
      const allDefeated = trainersInArea.every((t, i) =>
        playerStore.defeatedTrainers.includes(`area${playerStore.currentArea}_${i}`)
      );

      if (!allDefeated) {
        playerStore.notify("You must defeat the area's trainer before moving on!");
        // Bounce back
        return;
      }

      playerStore.unlockArea(playerStore.currentArea + 1);
      playerStore.setCurrentArea(playerStore.currentArea + 1);
    } else if (transition.type === TRANSITION_TYPES.PREV) {
      playerStore.setCurrentArea(playerStore.currentArea - 1);
    }
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

  // Use pre-generated level map
  const level = currentMapData.value.levelMap[playerY.value][playerX.value];

  const wildMon = createMon(species, level);

  const firstHealthyMon = playerStore.party.find(m => m.hp > 0) || playerStore.party[0];
  battleStore.startBattle(firstHealthyMon, wildMon, BATTLE_TYPES.WILD);
};

const triggerTrainerBattle = async (trainer, trainerId) => {
  await vocabStore.loadVocab(playerStore.currentArea);
  const party = trainer.party.map(p => ({ ...p, isDefeated: false }));
  const firstMonCfg = party[0];
  const enemyMon = createMon(firstMonCfg.species, firstMonCfg.level);

  const firstHealthyMon = playerStore.party.find(m => m.hp > 0) || playerStore.party[0];
  battleStore.startBattle(firstHealthyMon, enemyMon, BATTLE_TYPES.TRAINER, trainer, trainerId, party);
};

onMounted(() => {
  generateMap();
  updateDiscovery(playerX.value, playerY.value);
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
