<template>
  <div
    class="relative w-full h-full overflow-hidden select-none"
    :class="session.player.currentInterior ? 'bg-gray-900' : 'bg-green-200'"
    @mousedown="handleMapInteractionStart"
    @touchstart.prevent="handleMapInteractionStart"
    @mouseup="stopMovement"
    @mouseleave="stopMovement"
    @touchend="stopMovement"
    @touchcancel="stopMovement"
  >
    <!-- Map Rendering -->
    <div
      class="absolute transition-all duration-200 linear"
      :class="{ 'duration-0': isJumping }"
      :style="mapContainerStyle"
    >
      <transition-group name="tile-fade">
        <MapTile
          v-for="tile in viewportTiles"
          :key="`${tile.x}-${tile.y}`"
          :x="tile.x"
          :y="tile.y"
          :type="tile.type"
          :transitions="currentMapData?.transitions"
        />
      </transition-group>

      <!-- Trainer Layer -->
      <template v-if="!session.player.currentInterior">
        <TrainerSprite
          v-for="trainer in viewportTrainers"
          :key="trainer.trainerId"
          :x="trainer.x"
          :y="trainer.y"
          :direction="trainer.direction"
          :is-storm="trainer.isStorm"
          :is-rival="trainer.isRival"
          :is-alerting="alertingTrainer === trainer.trainerId"
        />
      </template>

      <!-- NPC Layer -->
      <NPCSprite
        v-for="npc in currentInteriorData?.npcs"
        :key="npc.id"
        :type="npc.type"
        :x="npc.x"
        :y="npc.y"
        @interact="handleNPCInteract(npc)"
      />
    </div>

    <!-- Player -->
    <div class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 flex flex-col items-center justify-center z-20">
      <div class="absolute bottom-full mb-1 bg-white/50 rounded-full px-2 py-0.5 text-[8px] font-bold uppercase whitespace-nowrap">
        {{ session.player.name }}
      </div>
      <div class="relative text-2xl drop-shadow-md flex items-center justify-center">
        <span>{{ playerEmoji }}</span>
        <span class="absolute -bottom-1 -right-1 text-xs">{{ session.player.party[0]?.emoji }}</span>
      </div>
    </div>

    <MapHUD
      v-if="session.player.party[0]"
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
import { ref, onMounted, onUnmounted, computed, watch, nextTick } from 'vue';
import { useSessionStore } from '../stores/sessionStore';
import { useGameFSM } from '../stores/gameFSM';
import { useVocabStore } from '../stores/vocabStore';
import { useSettingsStore } from '../stores/settingsStore';
import { useInputStore } from '../stores/inputStore';
import { audio } from '../utils/audio';
import { createMon } from '../utils/gameData';
import { GAME_CONSTANTS, SOUND_EFFECTS, BATTLE_TYPES, GENDERS, SKIN_TONES, INPUT_CONTEXTS, TRANSITION_TYPES, GAME_EVENTS, GAME_STATES, NPC_TYPES, INTERIORS } from '../utils/constants';
import { TILE_TYPES, type Trainer } from '../utils/mapGenerator';

import { useMapManager } from '../composables/useMapManager';
import { useTrainerAI } from '../composables/useTrainerAI';
import { usePlayerMovement } from '../composables/usePlayerMovement';

import MapHUD from './map/MapHUD.vue';
import MapTile from './map/MapTile.vue';
import TrainerSprite from './map/TrainerSprite.vue';
import NPCSprite from './map/NPCSprite.vue';
import MobileControls from './map/MobileControls.vue';

const session = useSessionStore();
const fsm = useGameFSM();
const vocabStore = useVocabStore();
const settingsStore = useSettingsStore();
const inputStore = useInputStore();
const engagedTrainers = new Set<string>();

const VIEWPORT_SIZE = 27;

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

const mapContainerStyle = computed(() => {
  if (session.player.currentInterior && currentInteriorData.value) {
    const intMap = currentInteriorData.value.map;
    const w = intMap[0].length;
    const h = intMap.length;
    return {
      left: `calc(50% - ${playerX.value * 40}px - 20px)`,
      top: `calc(50% - ${playerY.value * 40}px - 20px)`,
      width: `${w * 40}px`,
      height: `${h * 40}px`
    };
  }
  return {
    left: `calc(50% - ${playerX.value * 40}px - 20px)`,
    top: `calc(50% - ${playerY.value * 40}px - 20px)`,
    width: `${MAP_WIDTH.value * 40}px`,
    height: `${MAP_HEIGHT.value * 40}px`
  };
});

const currentInteriorData = computed(() => {
  if (!session.player.currentInterior || !currentMapData.value?.interiors) return null;
  return currentMapData.value.interiors[session.player.currentInterior];
});

const { alertingTrainer, checkTrainerLOS, initiateTrainerApproach } = useTrainerAI(
  session, fsm, currentMapData, playerX, playerY, getTileType
);

const handleInput = (e: any) => {
  if (!fsm.matches(GAME_STATES.WORLD) || props.isMenuOpen) return false;

  const key = typeof e.key === 'string' ? e.key.toLowerCase() : '';

  if (key === 'e' || key === ' ') {
    const adj = [[0, -1], [0, 1], [-1, 0], [1, 0], [0, 0]]; // [0,0] for mobile direct tap
    const npc = currentInteriorData.value?.npcs.find(n =>
      adj.some(([dx, dy]) => playerX.value + dx === n.x && playerY.value + dy === n.y)
    );
    if (npc) {
      handleNPCInteract(npc);
      return true;
    }
  }

  let newX = playerX.value;
  let newY = playerY.value;
  let moved = false;

  if (e.key === 'ArrowUp' || key === 'w') { newY--; moved = true; }
  if (e.key === 'ArrowDown' || key === 's') { newY++; moved = true; }
  if (e.key === 'ArrowLeft' || key === 'a') { newX--; moved = true; }
  if (e.key === 'ArrowRight' || key === 'd') { newX++; moved = true; }

  if (!moved) return false;

  const targetTile = getTileType(newX, newY);
  const walkable = [
    TILE_TYPES.PATH, TILE_TYPES.EMPTY, TILE_TYPES.GRASS,
    TILE_TYPES.SPELL_CENTER, TILE_TYPES.TRAINER, TILE_TYPES.TRANSITION,
    TILE_TYPES.BUILDING, TILE_TYPES.DOOR, TILE_TYPES.STAIRS_UP, TILE_TYPES.STAIRS_DOWN,
    TILE_TYPES.CARPET, TILE_TYPES.BED
  ];

  if (targetTile === TILE_TYPES.NPC) {
    const npc = currentInteriorData.value?.npcs.find(n => n.x === newX && n.y === newY);
    if (npc) handleNPCInteract(npc);
    return false;
  }

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
      trainerParty: party,
      trainerName: trainer.name,
      trainerDefeatDialog: trainer.defeatDialog,
      isStorm: trainer.isStorm,
      isRival: trainer.isRival
    });
  } else {
    // 2. Wild battle triggers
    checkTriggers(newX, newY);
  }

  updateDiscovery(newX, newY);
  return true;
};

const { startMovement, stopMovement } = usePlayerMovement(playerX, playerY, handleInput);

const handleMapInteractionStart = (e: MouseEvent | TouchEvent) => {
  if (!fsm.matches(GAME_STATES.WORLD) || props.isMenuOpen) return;

  const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
  const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

  const centerX = window.innerWidth / 2;
  const centerY = window.innerHeight / 2;

  const dx = clientX - centerX;
  const dy = clientY - centerY;

  let key = '';
  if (Math.abs(dx) > Math.abs(dy)) {
    key = dx > 0 ? 'd' : 'a';
  } else {
    key = dy > 0 ? 's' : 'w';
  }

  if (key) {
    startMovement(key);
  }
};

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
      nextTick(() => {
        isJumping.value = false;
      });
    } else {
      playerX.value = newPos.x;
      playerY.value = newPos.y;
    }
  }
}, { deep: true });

const viewportTiles = computed(() => {
  if (!currentMapData.value) return [];
  if (currentInteriorData.value) {
    const tiles = [];
    const intMap = currentInteriorData.value.map;
    for (let y = 0; y < intMap.length; y++) {
      for (let x = 0; x < intMap[0].length; x++) {
        tiles.push({ x, y, type: intMap[y][x] });
      }
    }
    return tiles;
  }
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

const viewportTrainers = computed(() => {
  if (!currentMapData.value) return [];
  const half = Math.floor(VIEWPORT_SIZE / 2);
  const startX = Math.max(0, Math.min(MAP_WIDTH.value - VIEWPORT_SIZE, playerX.value - half));
  const startY = Math.max(0, Math.min(MAP_HEIGHT.value - VIEWPORT_SIZE, playerY.value - half));
  const endX = startX + VIEWPORT_SIZE;
  const endY = startY + VIEWPORT_SIZE;

  return currentMapData.value.trainers
    .map((t, i) => ({ ...t, trainerId: t.trainerId || `area${session.player.currentArea}_${i}` }))
    .filter(t => t.x >= startX && t.x < endX && t.y >= startY && t.y < endY && !session.player.defeatedTrainers.includes(t.trainerId));
});

const checkTriggers = (x: number, y: number) => {
  const type = getTileType(x, y);

  if (type === TILE_TYPES.STAIRS_UP || type === TILE_TYPES.STAIRS_DOWN || type === TILE_TYPES.CARPET || type === TILE_TYPES.BUILDING) {
    const exit = currentInteriorData.value?.exits.find(e => e.x === x && e.y === y);
    if (exit) {
      handleTransition(exit);
      return;
    }
    // World map building entry
    if (type === TILE_TYPES.BUILDING || type === TILE_TYPES.SPELL_CENTER) {
       // Find which interior has an exit pointing to the tile below this building
       const interiorEntry = Object.values(currentMapData.value?.interiors || {}).find(int =>
         int.exits.some(e => e.target === INTERIORS.WORLD && e.targetPos.x === x && e.targetPos.y === y + 1)
       );
       if (interiorEntry) {
          // Find the carpet exit to get its coordinates as entry point
          const carpetExit = interiorEntry.exits.find(e => e.target === INTERIORS.WORLD);
          handleTransition({ target: interiorEntry.id, targetPos: { x: carpetExit?.x || 0, y: (carpetExit?.y || 1) - 1 } });
       }
       return;
    }
  }

  if (type === TILE_TYPES.SPELL_CENTER && !session.player.currentInterior) {
    handleTransition({ target: INTERIORS.SPELLING_CENTER, targetPos: { x: 4, y: 4 } });
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
      fsm.send(GAME_EVENTS.COMPLETE, { type: 'area', area: session.player.currentArea });
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
        // Double check alertingTrainer and state to prevent wild battles before trainer
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

const triggerTrainerBattle = async (trainer: Trainer, trainerId: string) => {
  await vocabStore.loadVocab(session.player.currentArea, settingsStore.locale);
  const party = trainer.party.map(p => ({ ...p, isDefeated: false }));
  const firstMonCfg = party[0];
  const enemyMon = createMon(firstMonCfg.species, firstMonCfg.level);
  fsm.send(GAME_EVENTS.ENCOUNTER, {
    enemy: enemyMon,
    type: BATTLE_TYPES.TRAINER,
    trainerId,
    trainerParty: party,
    trainerName: trainer.name,
    trainerDefeatDialog: trainer.defeatDialog,
    isStorm: trainer.isStorm,
    isRival: trainer.isRival
  });
};

const handleTransition = (exit: any) => {
  fsm.send(GAME_EVENTS.CONFIRM, {
    targetState: GAME_STATES.WORLD,
    target: GAME_STATES.WORLD, // For LOADING gateway
    onComplete: () => {
      if (exit.target === INTERIORS.WORLD) {
        session.player.currentInterior = null;
      } else {
        session.player.currentInterior = exit.target;
      }
      session.updatePlayerPosition(exit.targetPos);
    }
  });
};

const handleNPCInteract = (npc: any) => {
  // Check Proximity
  const dist = Math.abs(playerX.value - npc.x) + Math.abs(playerY.value - npc.y);
  if (dist > 1) return;

  if (npc.type === NPC_TYPES.HEALER || npc.type === NPC_TYPES.MOM) {
    session.healParty();
    audio.playSound(SOUND_EFFECTS.HEAL);
    session.notify(settingsStore.t('menu.healed'));
    if (npc.type === NPC_TYPES.HEALER) {
      session.player.lastSpellCenter = { x: 4, y: 4, interior: INTERIORS.SPELLING_CENTER, floor: null } as any;
    }
    session.save();
  }
  session.notify(`${settingsStore.t(npc.name)}: "${settingsStore.t(npc.dialog[0])}"`);

  if (npc.type === NPC_TYPES.GYM_BOSS || npc.type === NPC_TYPES.TEAM_STORM) {
    // Check requirements
    const vocabCount = vocabStore.vocabData[`${settingsStore.locale}_${session.player.currentArea}`]?.length || 40;
    const mastered = session.isAreaMastered(session.player.currentArea, vocabCount);
    const trainersDefeated = currentMapData.value?.trainers.every((_, i) =>
      session.player.defeatedTrainers.includes(`area${session.player.currentArea}_${i}`)
    );

    if (mastered && trainersDefeated) {
       triggerGymBossBattle(npc);
    } else {
       session.notify(settingsStore.t('gym.notReady'));
    }
  }
};

const triggerGymBossBattle = async (npc: any) => {
  await vocabStore.loadVocab(session.player.currentArea, settingsStore.locale);
  const area = areaConfig.value;
  const level = area.maxLevel + 2;
  const species = area.encounters[area.encounters.length - 1]; // Use last encounter as boss mon
  const enemyMon = createMon(species, level);

  fsm.send(GAME_EVENTS.ENCOUNTER, {
    enemy: enemyMon,
    type: BATTLE_TYPES.TRAINER,
    trainerId: `gym_boss_${session.player.currentArea}`,
    trainerParty: [{ species, level }],
    trainerName: settingsStore.t(npc.name),
    trainerDefeatDialog: `npc.gym_boss.${session.player.currentArea}.defeat`,
    isStorm: npc.type === 'team_storm'
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

<style scoped>
.tile-fade-enter-active {
  transition: opacity 0.5s ease;
}
.tile-fade-enter-from {
  opacity: 0;
}
</style>
