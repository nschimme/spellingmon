<template>
  <div class="relative w-full h-full bg-green-200 overflow-hidden select-none">
    <!-- Map Rendering -->
    <div
      class="absolute transition-all duration-200 linear"
      :class="{ 'duration-0': isJumping }"
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
        :is-alerting="!!(getTrainerAt(tile.x, tile.y) && alertingTrainer === getTrainerAt(tile.x, tile.y)?.trainerId)"
        :trainer-emoji="getTrainerEmoji(tile.x, tile.y)"
        :transitions="currentMapData?.transitions"
      />
    </div>

    <!-- Player -->
    <div class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-2xl drop-shadow-md flex flex-col items-center">
      <div class="bg-white/50 rounded-full px-2 py-0.5 text-[8px] font-bold uppercase mb-1">
        {{ session.player.name }}
      </div>
      <div class="relative">
        <span>{{ playerEmoji }}</span>
        <span class="absolute -bottom-1 -right-1 text-xs">{{ session.player.party[0]?.emoji }}</span>
      </div>
    </div>

    <MapHUD
      :area-name="$t('menu.areaNames.' + session.player.currentArea)"
      :biome="currentMapData?.biome"
      :leader-name="$t('monsters.' + session.player.party[0]?.species)"
      :leader-level="session.player.party[0]?.level"
    />

    <div class="absolute bottom-6 left-6 bg-gray-800/80 text-white px-4 py-2 rounded-full text-[8px] font-bold uppercase tracking-widest hidden lg:block">
      {{ $t('menu.wasdToMove') }}
    </div>

    <MobileControls
      @start="startMovement"
      @stop="stopMovement"
      @toggle-menu="$emit('toggle-menu')"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch } from 'vue';
import { useSessionStore } from '../stores/sessionStore';
import { useGameFSM } from '../stores/gameFSM';
import { useVocabStore } from '../stores/vocabStore';
import { useSettingsStore } from '../stores/settingsStore';
import { useInputStore } from '../stores/inputStore';
import { audio } from '../utils/audio';
import { createMon } from '../utils/gameData';
import { GAME_CONSTANTS, SOUND_EFFECTS, BATTLE_TYPES, GENDERS, SKIN_TONES, INPUT_CONTEXTS, TRANSITION_TYPES, GAME_EVENTS, GAME_STATES } from '../utils/constants';
import { TILE_TYPES } from '../utils/mapGenerator';

import { useMapManager } from '../composables/useMapManager';
import { useTrainerAI } from '../composables/useTrainerAI';
import { usePlayerMovement } from '../composables/usePlayerMovement';

import MapHUD from './map/MapHUD.vue';
import MapTile from './map/MapTile.vue';
import MobileControls from './map/MobileControls.vue';

const session = useSessionStore();
const fsm = useGameFSM();
const vocabStore = useVocabStore();
const settingsStore = useSettingsStore();
const inputStore = useInputStore();
const engagedTrainers = new Set<string>();

const VIEWPORT_SIZE = 15;

const props = defineProps({
  isMenuOpen: Boolean
});

defineEmits(['toggle-menu']);

const playerX = ref(session.player.position?.x ?? 0);
const playerY = ref(session.player.position?.y ?? 0);
const isJumping = ref(false);

const {
  MAP_WIDTH, MAP_HEIGHT, currentMapData, areaConfig,
  generateMap, getTileType, getTrainerAt, updateDiscovery
} = useMapManager(session);

const { alertingTrainer, checkTrainerLOS, initiateTrainerApproach } = useTrainerAI(
  session, fsm, currentMapData, playerX, playerY, getTileType
);

const handleInput = (e: any) => {
  if (!fsm.matches(GAME_STATES.WORLD) || props.isMenuOpen) return false;

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
  session.updatePlayerPosition({ x: newX, y: newY });

  // 1. Check for Trainers FIRST
  const triggeredTrainer = checkTrainerLOS(engagedTrainers);
  if (triggeredTrainer) {
    const { trainer, trainerId } = triggeredTrainer;
    const party = trainer.party.map(p => ({ ...p, isDefeated: false }));
    const firstMonCfg = party[0];
    const enemyMon = createMon(firstMonCfg.species, firstMonCfg.level);

    initiateTrainerApproach(trainer, trainerId, engagedTrainers, {
      enemy: enemyMon,
      type: BATTLE_TYPES.TRAINER,
      trainerId,
      trainerParty: party
    });
  } else {
    // 2. Wild battle triggers
    checkTriggers(newX, newY);
  }

  updateDiscovery(newX, newY);
  return true;
};

const { startMovement, stopMovement } = usePlayerMovement(playerX, playerY, handleInput);

const playerEmoji = computed(() => {
  const gender = session.player.gender;
  const tone = session.player.skinTone;
  const base = gender === GENDERS.BOY ? '👦' : '👧';
  const modifiers: Record<string, string> = {
    [SKIN_TONES.PALE]: '🏻',
    [SKIN_TONES.FAIR]: '🏼',
    [SKIN_TONES.NEUTRAL]: '🏽',
    [SKIN_TONES.TAN]: '🏾',
    [SKIN_TONES.DARK]: '🏿'
  };
  return base + (modifiers[tone] || '');
});

watch(() => session.player.currentArea, (newArea, oldArea) => {
  if (!session.player?.mapSeed) return;
  const direction = newArea > oldArea ? 'next' : 'prev';
  fsm.transition(GAME_STATES.LOADING, { isTransition: true, direction });
});

watch(() => session.player.mapSeed, (newSeed) => {
  if (newSeed) fsm.transition(GAME_STATES.LOADING);
});

watch(() => session.player.position, (newPos, oldPos) => {
  if (newPos) {
    // If distance > 1, it's a jump (teleport/respawn)
    const dist = oldPos ? Math.abs(newPos.x - oldPos.x) + Math.abs(newPos.y - oldPos.y) : 0;
    if (dist > 1) {
      isJumping.value = true;
      playerX.value = newPos.x;
      playerY.value = newPos.y;
      setTimeout(() => { isJumping.value = false; }, 50);
    } else {
      playerX.value = newPos.x;
      playerY.value = newPos.y;
    }
  }
}, { deep: true });

const viewportTiles = computed(() => {
  if (!currentMapData.value) return [];
  const tiles = [];
  const half = Math.floor(VIEWPORT_SIZE / 2);
  const startX = Math.max(0, Math.min(MAP_WIDTH.value - VIEWPORT_SIZE, playerX.value - half));
  const startY = Math.max(0, Math.min(MAP_HEIGHT.value - VIEWPORT_SIZE, playerY.value - half));

  for (let y = startY; y < startY + VIEWPORT_SIZE; y++) {
    for (let x = startX; x < startX + VIEWPORT_SIZE; x++) {
      tiles.push({ x, y, type: currentMapData.value.map[y][x] });
    }
  }
  return tiles;
});

const getTrainerEmoji = (x: number, y: number) => {
  if (!currentMapData.value) return '👤';
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

const checkTriggers = (x: number, y: number) => {
  const type = getTileType(x, y);

  if (type === TILE_TYPES.SPELL_CENTER) {
    session.healParty();
    audio.playSound(SOUND_EFFECTS.HEAL);
    session.notify(settingsStore.t('menu.healed'));
    session.player.lastSpellCenter = { x, y } as any;
    session.save();
    return;
  }

  if (type === TILE_TYPES.TRAINER) {
    const trainerData = getTrainerAt(x, y);
    if (trainerData) {
      const { trainer, trainerId } = trainerData;
      if (engagedTrainers.has(trainerId)) return;
      engagedTrainers.add(trainerId);
      session.notify(`${(trainer as any).name}: "${trainer.dialog}"`);
      setTimeout(() => {
        triggerTrainerBattle(trainer, trainerId);
        engagedTrainers.delete(trainerId);
      }, GAME_CONSTANTS.TRAINER_ENGAGEMENT_DELAY_MS);
    }
    return;
  }

  if (type === TILE_TYPES.TRANSITION) {
    if (!currentMapData.value) return;
    const transition = currentMapData.value.transitions.find(t => t.x === x && t.y === y);
    if (!transition) return;
    if (transition.type === TRANSITION_TYPES.NEXT) {
      const allDefeated = currentMapData.value.trainers.every((t, i) =>
        session.player.defeatedTrainers.includes(`area${session.player.currentArea}_${i}`)
      );
      if (!allDefeated) {
        session.notify(settingsStore.t('menu.defeatTrainerFirst'));
        return;
      }
      fsm.send(GAME_EVENTS.COMPLETE, { type: 'area' });
      session.player.unlockedAreas.push(session.player.currentArea + 1);
      session.player.currentArea++;
      session.save();
    } else if (transition.type === TRANSITION_TYPES.PREV) {
      session.player.currentArea--;
      session.save();
    }
    return;
  }

  if (type === TILE_TYPES.GRASS) {
    if (Math.random() < GAME_CONSTANTS.GRASS_ENCOUNTER_CHANCE) {
      setTimeout(() => {
        if (fsm.matches(GAME_STATES.WORLD) && !alertingTrainer.value) {
          triggerWildBattle();
        }
      }, 300);
    }
  }
};

const triggerWildBattle = async () => {
  if (!currentMapData.value) return;
  await vocabStore.loadVocab(session.player.currentArea, settingsStore.locale);
  const species = areaConfig.value.encounters[Math.floor(Math.random() * areaConfig.value.encounters.length)];
  const level = currentMapData.value.levelMap[playerY.value][playerX.value];
  const wildMon = createMon(species, level);
  fsm.send(GAME_EVENTS.ENCOUNTER, { enemy: wildMon, type: BATTLE_TYPES.WILD });
};

const triggerTrainerBattle = async (trainer: any, trainerId: any) => {
  await vocabStore.loadVocab(session.player.currentArea, settingsStore.locale);
  const party = trainer.party.map((p: any) => ({ ...p, isDefeated: false }));
  const firstMonCfg = party[0];
  const enemyMon = createMon(firstMonCfg.species, firstMonCfg.level);
  fsm.send(GAME_EVENTS.ENCOUNTER, {
    enemy: enemyMon,
    type: BATTLE_TYPES.TRAINER,
    trainerId,
    trainerParty: party
  });
};

onMounted(async () => {
  if (session.player?.mapSeed) {
    if (!currentMapData.value) {
       await vocabStore.loadVocab(session.player.currentArea, settingsStore.locale);
       await generateMap(false, null);
    }
    updateDiscovery(playerX.value, playerY.value);
  }

  inputStore.addListener(INPUT_CONTEXTS.WORLD, handleInput);
});

onUnmounted(() => {
  inputStore.removeListener(INPUT_CONTEXTS.WORLD);
});
</script>
