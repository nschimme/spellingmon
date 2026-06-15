<template>
  <div class="relative w-full h-full bg-green-200 overflow-hidden select-none">
    <!-- Map Rendering -->
    <div
      class="absolute"
      :style="{
        left: `calc(50% - ${playerX * 40}px)`,
        top: `calc(50% - ${playerY * 40}px)`,
        width: `${MAP_WIDTH * 40}px`,
        height: `${MAP_HEIGHT * 40}px`
      }"
    >
      <MapTile
        v-for="tile in viewportTiles"
        :key="`${tile.x}-${tile.y}`"
        :x="tile.x"
        :y="tile.y"
        :type="tile.type"
        :is-alerting="getTrainerAt(tile.x, tile.y) && alertingTrainer === getTrainerAt(tile.x, tile.y).trainerId"
        :trainer-emoji="getTrainerEmoji(tile.x, tile.y)"
        :transitions="currentMapData?.transitions"
      />
    </div>

    <!-- Player -->
    <div class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-2xl drop-shadow-md flex flex-col items-center">
      <div class="bg-white/50 rounded-full px-2 py-0.5 text-[8px] font-bold uppercase mb-1">
        {{ playerStore.playerName }}
      </div>
      <div class="relative">
        <span>{{ playerEmoji }}</span>
        <span class="absolute -bottom-1 -right-1 text-xs">{{ playerStore.party[0]?.emoji }}</span>
      </div>
    </div>

    <MapHUD
      :area-name="areaConfig.name"
      :biome="currentMapData?.biome"
      :leader-name="playerStore.party[0]?.name"
      :leader-level="playerStore.party[0]?.level"
    />

    <div class="absolute bottom-6 left-6 bg-gray-800/80 text-white px-4 py-2 rounded-full text-[8px] font-bold uppercase tracking-widest hidden lg:block">
      WASD to Move | ESC for Menu
    </div>

    <MobileControls
      @start="startMovement"
      @stop="stopMovement"
      @toggle-menu="$emit('toggle-menu')"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue';
import { usePlayerStore } from '../stores/playerStore';
import { useBattleStore } from '../stores/battleStore';
import { useVocabStore } from '../stores/vocabStore';
import { useSettingsStore } from '../stores/settingsStore';
import { useInputStore } from '../stores/inputStore';
import { audio } from '../utils/audio';
import { createMon } from '../utils/gameData';
import { GAME_CONSTANTS, SOUND_EFFECTS, BATTLE_TYPES, GENDERS, SKIN_TONES, INPUT_CONTEXTS, TRANSITION_TYPES } from '../utils/constants';
import { TILE_TYPES } from '../utils/mapGenerator';

import { useMapManager } from '../composables/useMapManager';
import { useTrainerAI } from '../composables/useTrainerAI';
import { usePlayerMovement } from '../composables/usePlayerMovement';

import MapHUD from './map/MapHUD.vue';
import MapTile from './map/MapTile.vue';
import MobileControls from './map/MobileControls.vue';

const playerStore = usePlayerStore();
const battleStore = useBattleStore();
const vocabStore = useVocabStore();
const settingsStore = useSettingsStore();
const inputStore = useInputStore();
const engagedTrainers = new Set();

const VIEWPORT_SIZE = 15;

const props = defineProps({
  isMenuOpen: Boolean
});

defineEmits(['toggle-menu']);

const playerX = ref(playerStore.position?.x ?? 0);
const playerY = ref(playerStore.position?.y ?? 0);

const {
  MAP_WIDTH, MAP_HEIGHT, currentMapData, areaConfig,
  generateMap, getTileType, getTrainerAt, updateDiscovery
} = useMapManager(playerStore);

const { alertingTrainer, checkTrainerLOS, initiateTrainerApproach } = useTrainerAI(
  playerStore, battleStore, currentMapData, playerX, playerY, getTileType
);

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

  // 1. Check for Trainers FIRST - they have priority
  const triggeredTrainer = checkTrainerLOS(engagedTrainers);
  if (triggeredTrainer) {
    initiateTrainerApproach(triggeredTrainer.trainer, triggeredTrainer.trainerId, engagedTrainers, triggerTrainerBattle);
  } else {
    // 2. Only check for wild battles if no trainer is engaging
    checkTriggers(newX, newY);
  }

  updateDiscovery(newX, newY);
  return true;
};

const { startMovement, stopMovement } = usePlayerMovement(playerX, playerY, handleInput);

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

watch(() => playerStore.currentArea, async (newArea, oldArea) => {
  const direction = newArea > oldArea ? 'next' : 'prev';
  generateMap(true, direction, playerX, playerY);
  await vocabStore.loadVocab(newArea, settingsStore.locale);

  // Auto-set last spell center on area transition
  if (currentMapData.value?.spellCenter) {
    playerStore.lastSpellCenter = {
      x: currentMapData.value.spellCenter.x,
      y: currentMapData.value.spellCenter.y,
      area: newArea
    };
    playerStore.saveState();
  }
});

watch(() => playerStore.position, (newPos) => {
  if (battleStore.inBattle || !newPos || !playerStore.lastSpellCenter) return;
  if (newPos.x === playerStore.lastSpellCenter.x && newPos.y === playerStore.lastSpellCenter.y && playerStore.currentArea === playerStore.lastSpellCenter.area) {
     if (playerX.value !== newPos.x || playerY.value !== newPos.y) {
        playerX.value = newPos.x;
        playerY.value = newPos.y;
        generateMap(false, null, playerX, playerY);
     }
  }
}, { deep: true });

watch(() => playerStore.mapSeed, () => generateMap(false, null, playerX, playerY));

watch(() => settingsStore.locale, async (newLocale) => {
  await vocabStore.loadVocab(playerStore.currentArea, newLocale);
});

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

const getTrainerEmoji = (x, y) => {
  const trainer = currentMapData.value.trainers.find(t => t.x === x && t.y === y);
  if (!trainer) return '👤';
  switch (trainer.direction) {
    case 'up': return '🧒';
    case 'down': return '👦';
    case 'left': return '👧';
    case 'right': return '🧒';
    default: return '👤';
  }
};

const checkTriggers = (x, y) => {
  const type = getTileType(x, y);

  if (type === TILE_TYPES.SPELL_CENTER) {
    playerStore.healParty();
    audio.playSound(SOUND_EFFECTS.HEAL);
    playerStore.notify('Your Spellingmon have been fully healed!');
    playerStore.lastSpellCenter = { x, y, area: playerStore.currentArea };
    playerStore.saveState();
    return;
  }

  if (type === TILE_TYPES.TRAINER) {
    const trainerData = getTrainerAt(x, y);
    if (trainerData) {
      const { trainer, trainerId } = trainerData;
      if (engagedTrainers.has(trainerId)) return;
      engagedTrainers.add(trainerId);
      playerStore.notify(`${trainer.name}: "${trainer.dialog}"`);
      setTimeout(() => {
        triggerTrainerBattle(trainer, trainerId);
        engagedTrainers.delete(trainerId);
      }, GAME_CONSTANTS.TRAINER_ENGAGEMENT_DELAY_MS);
    }
    return;
  }

  if (type === TILE_TYPES.TRANSITION) {
    const transition = currentMapData.value.transitions.find(t => t.x === x && t.y === y);
    if (transition.type === TRANSITION_TYPES.NEXT) {
      const allDefeated = currentMapData.value.trainers.every((t, i) =>
        playerStore.defeatedTrainers.includes(`area${playerStore.currentArea}_${i}`)
      );
      if (!allDefeated) {
        playerStore.notify("You must defeat the area's trainer before moving on!");
        return;
      }
      playerStore.unlockArea(playerStore.currentArea + 1);
      playerStore.setCurrentArea(playerStore.currentArea + 1);
    } else if (transition.type === TRANSITION_TYPES.PREV) {
      playerStore.setCurrentArea(playerStore.currentArea - 1);
    }
    return;
  }

  if (type === TILE_TYPES.GRASS) {
    if (Math.random() < GAME_CONSTANTS.GRASS_ENCOUNTER_CHANCE) {
      // Small delay before wild battle starts after movement
      setTimeout(() => {
        // Re-check conditions: ensure not already in battle and no trainer is approaching
        if (!battleStore.inBattle && !alertingTrainer.value) {
          triggerWildBattle();
        }
      }, 300);
    }
  }
};

const triggerWildBattle = async () => {
  await vocabStore.loadVocab(playerStore.currentArea, settingsStore.locale);
  const species = areaConfig.value.encounters[Math.floor(Math.random() * areaConfig.value.encounters.length)];
  const level = currentMapData.value.levelMap[playerY.value][playerX.value];
  const wildMon = createMon(species, level);
  const firstHealthyMon = playerStore.party.find(m => m.hp > 0) || playerStore.party[0];
  battleStore.startBattle(firstHealthyMon, wildMon, BATTLE_TYPES.WILD);
};

const triggerTrainerBattle = async (trainer, trainerId) => {
  await vocabStore.loadVocab(playerStore.currentArea, settingsStore.locale);
  const party = trainer.party.map(p => ({ ...p, isDefeated: false }));
  const firstMonCfg = party[0];
  const enemyMon = createMon(firstMonCfg.species, firstMonCfg.level);
  const firstHealthyMon = playerStore.party.find(m => m.hp > 0) || playerStore.party[0];
  battleStore.startBattle(firstHealthyMon, enemyMon, BATTLE_TYPES.TRAINER, trainer, trainerId, party);
};

onMounted(async () => {
  await vocabStore.loadVocab(playerStore.currentArea, settingsStore.locale);
  generateMap(false, null, playerX, playerY);
  updateDiscovery(playerX.value, playerY.value);

  // Ensure initial lastSpellCenter is set if we spawn on one
  if (!playerStore.lastSpellCenter && getTileType(playerX.value, playerY.value) === TILE_TYPES.SPELL_CENTER) {
    playerStore.lastSpellCenter = {
      x: playerX.value,
      y: playerY.value,
      area: playerStore.currentArea
    };
    playerStore.saveState();
  }

  inputStore.addListener(INPUT_CONTEXTS.WORLD, handleInput, 5);
});

onUnmounted(() => {
  inputStore.removeListener(INPUT_CONTEXTS.WORLD);
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
