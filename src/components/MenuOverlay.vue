<template>
  <div class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
    <div class="bg-white border-8 border-gray-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[80vh]">
      <!-- Header Tabs -->
      <div class="flex bg-gray-100 border-b-8 border-gray-800 font-bold uppercase text-xs">
        <button
          v-for="(tab, i) in Object.values(MENU_TABS)"
          :key="tab"
          class="flex-1 py-4 transition-colors"
          :class="[
            activeTab === tab ? 'bg-white text-blue-600' : 'text-gray-500 hover:bg-gray-200',
            tabSelectedIndex === i ? 'ring-inset ring-4 ring-yellow-400' : ''
          ]"
          @click="activeTab = tab"
        >
          {{ tab }}
        </button>
      </div>

      <!-- Content Area -->
      <div class="flex-1 overflow-y-auto p-6 bg-gray-50">
        <!-- Party Tab -->
        <div
          v-if="activeTab === MENU_TABS.PARTY"
          class="grid gap-4"
        >
          <div
            v-for="(mon, i) in playerStore.party"
            :key="mon.id"
            :class="{ 'ring-8 ring-yellow-400 border-yellow-400': contentSelectedIndex === i }"
            class="bg-white border-4 border-gray-800 p-4 rounded-xl flex flex-col gap-2 shadow-md relative overflow-hidden"
          >
            <div class="flex items-center gap-4">
              <div class="text-4xl flex items-center gap-1">
                <span>{{ mon.emoji }}</span>
                <span class="text-xl opacity-50">{{ TYPE_EMOJIS[mon.type] }}</span>
              </div>
              <div class="flex-1">
                <div class="flex justify-between font-black uppercase text-gray-800">
                  <span>{{ mon.name }}</span>
                  <span>Lv{{ mon.level }}</span>
                </div>
                <div class="w-full bg-gray-200 h-3 border-2 border-gray-800 rounded-full mt-1 overflow-hidden">
                  <div
                    :class="getHPColorClass(mon.hp, mon.maxHp)"
                    class="h-full transition-all duration-500"
                    :style="{ width: `${(mon.hp / mon.maxHp) * 100}%` }"
                  />
                </div>
                <div class="flex justify-between items-center mt-1">
                  <div class="text-[10px] font-bold text-gray-600 uppercase">
                    HP: {{ mon.hp }} / {{ mon.maxHp }}
                  </div>
                  <div class="text-[10px] font-bold text-blue-600 uppercase">
                    EXP: {{ mon.exp }} / {{ mon.expToNext }}
                  </div>
                </div>
              </div>
            </div>

            <div
              v-if="i > 0"
              class="flex justify-end"
            >
              <button
                class="bg-blue-500 text-white text-[10px] px-3 py-1 rounded font-bold uppercase border-b-2 border-blue-700 active:translate-y-0.5"
                @click="playerStore.moveMonToFront(i)"
              >
                Set as Leader
              </button>
            </div>

            <!-- Leader Badge -->
            <div
              v-if="i === 0"
              class="absolute top-0 left-0 bg-yellow-400 text-[8px] font-black px-2 py-0.5 rounded-br-lg border-b-2 border-r-2 border-gray-800 uppercase"
            >
              Leader
            </div>
          </div>
        </div>

        <!-- Map Tab -->
        <div
          v-if="activeTab === MENU_TABS.MAP"
          class="flex flex-col gap-4 items-center h-full overflow-hidden"
        >
          <h3 class="font-black uppercase text-gray-800 w-full shrink-0">
            Area Map (Discovered)
          </h3>
          <div class="relative bg-gray-900 w-full aspect-square max-w-[400px] border-8 border-gray-800 rounded-2xl overflow-hidden flex items-center justify-center shadow-inner shrink-0">
            <canvas
              ref="mapCanvas"
              width="100"
              height="100"
              class="w-full h-full image-pixelated bg-gray-800"
              data-testid="map-canvas"
            />
            <!-- Player pulse indicator -->
            <div
              class="absolute w-4 h-4 bg-red-500 rounded-full animate-ping pointer-events-none opacity-75"
              :style="{
                left: `calc(${(playerStore.position.x / 100) * 100}% - 8px)`,
                top: `calc(${(playerStore.position.y / 100) * 100}% - 8px)`
              }"
            />
          </div>
          <div class="w-full">
            <h3 class="font-black uppercase text-gray-800 mb-2">
              World Map
            </h3>
            <div class="flex gap-2 justify-between items-center bg-gray-200 p-4 rounded-xl border-4 border-gray-800">
              <div
                v-for="i in GAME_CONSTANTS.MAX_AREAS"
                :key="i"
                class="flex flex-col items-center"
              >
                <div
                  class="w-10 h-10 rounded-full flex items-center justify-center font-bold border-2 border-gray-800 shadow-sm"
                  :class="playerStore.currentArea === i ? 'bg-blue-500 text-white' : (playerStore.unlockedAreas.includes(i) ? 'bg-green-400' : 'bg-gray-400')"
                >
                  {{ i }}
                </div>
                <div
                  v-if="i < GAME_CONSTANTS.MAX_AREAS"
                  class="h-0.5 w-4 bg-gray-800"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Progress Tab -->
        <div
          v-if="activeTab === MENU_TABS.PROGRESS"
          class="flex flex-col gap-4"
        >
          <h3 class="font-black uppercase text-gray-800">
            Unlocked Areas
          </h3>
          <div class="grid grid-cols-1 gap-2">
            <div
              v-for="i in GAME_CONSTANTS.MAX_AREAS"
              :key="i"
              class="p-4 border-4 border-gray-800 rounded-xl font-bold flex justify-between items-center"
              :class="[
                playerStore.unlockedAreas.includes(i) ? 'bg-green-100' : 'bg-gray-200 text-gray-400',
                contentSelectedIndex === (i-1) ? 'ring-8 ring-yellow-400 border-yellow-400' : ''
              ]"
            >
              <span>Route {{ i }}</span>
              <span
                v-if="playerStore.unlockedAreas.includes(i)"
                class="text-green-600 text-xl"
              >✓</span>
              <span
                v-else
                class="text-xl"
              >🔒</span>
            </div>
          </div>
          <div class="mt-4 p-4 bg-blue-50 border-4 border-blue-800 rounded-xl text-blue-800 text-xs font-bold uppercase leading-relaxed">
            Total Badges Earned: {{ playerStore.defeatedTrainers.length }}
          </div>
        </div>

        <!-- Settings Tab -->
        <div
          v-if="activeTab === MENU_TABS.SETTINGS"
          class="flex flex-col gap-6"
        >
          <!-- Audio Settings -->
          <div>
            <label class="font-black uppercase text-gray-800 block mb-2">Sound Settings</label>
            <div
              :class="{ 'ring-8 ring-yellow-400 border-yellow-400': contentSelectedIndex === 1 || contentSelectedIndex === 2 }"
              class="flex items-center gap-4 bg-white border-4 border-gray-800 p-4 rounded-xl shadow-inner"
            >
              <button
                :class="{ 'ring-4 ring-yellow-400 rounded-full': contentSelectedIndex === 2 }"
                class="text-3xl hover:scale-110 transition-transform"
                @click="toggleMute"
              >
                {{ settingsStore.isMuted ? '🔇' : '🔊' }}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                :value="settingsStore.volume"
                :class="{ 'ring-4 ring-yellow-400': contentSelectedIndex === 1 }"
                class="flex-1 h-4 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                @input="updateVolume"
              >
            </div>
          </div>

          <div>
            <label class="font-black uppercase text-gray-800 block mb-2">TTS Voice Configuration</label>
            <select
              v-model="settingsStore.selectedVoiceName"
              :class="{ 'ring-8 ring-yellow-400 border-yellow-400': contentSelectedIndex === 0 }"
              class="w-full border-4 border-gray-800 p-3 rounded-xl bg-white font-bold text-gray-700 outline-none focus:ring-4 focus:ring-blue-300"
              @change="updateVoice"
            >
              <option
                v-for="voice in settingsStore.voices"
                :key="voice.name"
                :value="voice.name"
              >
                {{ voice.name }} ({{ voice.lang }})
              </option>
            </select>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <button
              :class="{ 'ring-8 ring-yellow-400': contentSelectedIndex === 3 }"
              class="bg-blue-500 text-white p-3 rounded-xl border-b-4 border-blue-700 font-black uppercase tracking-wider active:translate-y-1 text-xs"
              @click="testVoice"
            >
              Test Voice
            </button>
            <button
              :class="{ 'ring-8 ring-yellow-400': contentSelectedIndex === 4 }"
              class="bg-purple-500 text-white p-3 rounded-xl border-b-4 border-purple-700 font-black uppercase tracking-wider active:translate-y-1 text-xs"
              @click="testSFX"
            >
              Test SFX
            </button>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="p-6 border-t-8 border-gray-800 bg-gray-100 flex justify-between">
        <button
          :class="{ 'ring-8 ring-yellow-400': (activeTab === MENU_TABS.PARTY && contentSelectedIndex === playerStore.party.length) ||
            (activeTab === MENU_TABS.PROGRESS && contentSelectedIndex === GAME_CONSTANTS.MAX_AREAS) ||
            (activeTab === MENU_TABS.MAP && contentSelectedIndex === 0) ||
            (activeTab === MENU_TABS.SETTINGS && contentSelectedIndex === 5) }"
          class="bg-gray-500 text-white px-6 py-3 rounded-xl border-b-4 border-gray-700 font-black uppercase tracking-widest hover:bg-gray-600 active:translate-y-1 text-xs"
          @click="playerStore.logout()"
        >
          Log Out
        </button>
        <button
          :class="{ 'ring-8 ring-yellow-400': (activeTab === MENU_TABS.PARTY && contentSelectedIndex === playerStore.party.length + 1) ||
            (activeTab === MENU_TABS.PROGRESS && contentSelectedIndex === GAME_CONSTANTS.MAX_AREAS + 1) ||
            (activeTab === MENU_TABS.MAP && contentSelectedIndex === 1) ||
            (activeTab === MENU_TABS.SETTINGS && contentSelectedIndex === 6) }"
          class="bg-red-500 text-white px-8 py-3 rounded-xl border-b-4 border-red-700 font-black uppercase tracking-widest hover:bg-red-600 active:translate-y-1"
          @click="$emit('close')"
        >
          Back to Game
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, onUnmounted, computed } from 'vue';
import { usePlayerStore } from '../stores/playerStore';
import { useSettingsStore } from '../stores/settingsStore';
import { useInputStore } from '../stores/inputStore';
import { useKeyboardNavigation } from '../composables/useKeyboardNavigation';
import { speech } from '../utils/speech';
import { audio } from '../utils/audio';
import { GAME_CONSTANTS, SOUND_EFFECTS, MENU_TABS, INPUT_CONTEXTS, INPUT_PRIORITIES } from '../utils/constants';
import { TYPE_EMOJIS } from '../utils/gameData';
import { getHPColorClass } from '../utils/visuals';
import { TILE_TYPES, MapGenerator } from '../utils/mapGenerator';

const playerStore = usePlayerStore();
const settingsStore = useSettingsStore();
const inputStore = useInputStore();
const activeTab = ref(MENU_TABS.PARTY);
const mapCanvas = ref(null);

const drawMap = () => {
  if (!mapCanvas.value || activeTab.value !== MENU_TABS.MAP) return;
  const ctx = mapCanvas.value.getContext('2d');
  const discovered = new Set(playerStore.discoveredTiles[playerStore.currentArea] || []);

  const MAP_SIZE = 100;
  ctx.fillStyle = '#111827'; // bg-gray-900
  ctx.fillRect(0, 0, MAP_SIZE, MAP_SIZE);

  // Generate map data for rendering structure
  const gen = new MapGenerator(playerStore.mapSeed, MAP_SIZE, MAP_SIZE);
  const mapData = gen.generate(playerStore.currentArea);

  for (let y = 0; y < MAP_SIZE; y++) {
    for (let x = 0; x < MAP_SIZE; x++) {
      if (!discovered.has(`${x},${y}`)) continue;

      const type = mapData.map[y][x];

      if (type === TILE_TYPES.PATH) {
        ctx.fillStyle = '#000000'; // Black lines for possible routes
        ctx.fillRect(x, y, 1, 1);
      } else if (type === TILE_TYPES.EMPTY) {
        ctx.fillStyle = '#4b5563'; // Gray-600 boxes for rooms
        ctx.fillRect(x, y, 1, 1);
      } else if (type === TILE_TYPES.GRASS) {
        ctx.fillStyle = '#15803d'; // Green-700
        ctx.fillRect(x, y, 1, 1);
      } else if (type === TILE_TYPES.SPELL_CENTER) {
        ctx.fillStyle = '#ef4444'; // Red dot for Spelling Center
        ctx.fillRect(x, y, 1, 1);
      } else if (type === TILE_TYPES.TRANSITION) {
        ctx.fillStyle = '#eab308'; // Yellow dot for entrance/exit
        ctx.fillRect(x, y, 1, 1);
      }
    }
  }

  // Draw player
  ctx.fillStyle = '#ef4444'; // Red dot
  ctx.fillRect(playerStore.position.x, playerStore.position.y, 1, 1);
};

watch(activeTab, (newTab) => {
  if (newTab === MENU_TABS.MAP) {
    setTimeout(drawMap, 0);
  }
});

const tabs = Object.values(MENU_TABS);
const currentTabIndex = computed(() => tabs.indexOf(activeTab.value));

// Tab Navigation (Highest Priority in Menu)
const { selectedIndex: tabSelectedIndex } = useKeyboardNavigation({
  id: 'menu-tabs',
  priority: INPUT_PRIORITIES.MENU + 5,
  maxIndex: tabs.length,
  gridColumns: tabs.length,
  onConfirm: (idx) => { activeTab.value = tabs[idx]; },
  isActive: computed(() => true) // Always active when menu is open
});

// Watch tab index and sync with tabSelectedIndex
watch(currentTabIndex, (newIdx) => {
  if (tabSelectedIndex.value !== newIdx) {
    tabSelectedIndex.value = newIdx;
  }
});

// Content Navigation
const { selectedIndex: contentSelectedIndex, reset: resetContentNav } = useKeyboardNavigation({
  id: 'menu-content',
  priority: INPUT_PRIORITIES.MENU,
  maxIndex: computed(() => {
    if (activeTab.value === MENU_TABS.PARTY) return playerStore.party.length + 2; // + Logout + Close
    if (activeTab.value === MENU_TABS.PROGRESS) return GAME_CONSTANTS.MAX_AREAS + 2;
    if (activeTab.value === MENU_TABS.MAP) return 2;
    if (activeTab.value === MENU_TABS.SETTINGS) return 7; // Voice, Volume, Mute, Test Voice, Test SFX, + Logout/Close
    return 2;
  }),
  onConfirm: (idx) => {
    const logoutIdx = (activeTab.value === MENU_TABS.PARTY ? playerStore.party.length :
                      (activeTab.value === MENU_TABS.PROGRESS ? GAME_CONSTANTS.MAX_AREAS :
                      (activeTab.value === MENU_TABS.MAP ? 0 :
                      (activeTab.value === MENU_TABS.SETTINGS ? 5 : 0))));
    const closeIdx = logoutIdx + 1;

    if (idx === logoutIdx) playerStore.logout();
    else if (idx === closeIdx) emit('close');
    else {
      // Tab specific actions
      if (activeTab.value === MENU_TABS.PARTY && idx < playerStore.party.length) {
        if (idx > 0) playerStore.moveMonToFront(idx);
      } else if (activeTab.value === MENU_TABS.SETTINGS) {
        if (idx === 0) {/* Voice select - maybe just focus? */}
        if (idx === 1) {/* Volume - maybe handled by left/right? */}
        if (idx === 2) toggleMute();
        if (idx === 3) testVoice();
        if (idx === 4) testSFX();
      }
    }
  }
});

const emit = defineEmits(['close']);

onMounted(() => {
  if (activeTab.value === MENU_TABS.MAP) {
    setTimeout(drawMap, 0);
  }
});

const updateVoice = (e) => {
  settingsStore.setVoice(e.target.value);
};

const updateVolume = (e) => {
  settingsStore.setVolume(parseFloat(e.target.value));
};

const toggleMute = () => {
  const willBeMuted = !settingsStore.isMuted;
  settingsStore.toggleMute();
  if (!willBeMuted) {
    audio.playSound(SOUND_EFFECTS.CLICK);
  }
};

const testVoice = () => {
  speech.speak('This is a test of the spelling notification system.');
};

const testSFX = () => {
  audio.playSound(SOUND_EFFECTS.CLICK);
};
</script>
