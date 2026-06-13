<template>
  <div class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
    <div class="bg-white border-8 border-gray-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[80vh]">
      <!-- Header Tabs -->
      <div class="flex bg-gray-100 border-b-8 border-gray-800 font-bold uppercase text-xs">
        <button v-for="tab in ['party', 'progress', 'settings']" :key="tab"
                @click="activeTab = tab"
                class="flex-1 py-4 transition-colors"
                :class="activeTab === tab ? 'bg-white text-blue-600' : 'text-gray-500 hover:bg-gray-200'">
          {{ tab }}
        </button>
      </div>

      <!-- Content Area -->
      <div class="flex-1 overflow-y-auto p-6 bg-gray-50">
        <!-- Party Tab -->
        <div v-if="activeTab === 'party'" class="grid gap-4">
          <div v-for="(mon, i) in playerStore.party" :key="i"
               class="bg-white border-4 border-gray-800 p-4 rounded-xl flex items-center gap-4 shadow-md">
            <div class="text-4xl">🦖</div>
            <div class="flex-1">
              <div class="flex justify-between font-black uppercase text-gray-800">
                <span>{{ mon.name }}</span>
                <span>Lv{{ mon.level }}</span>
              </div>
              <div class="w-full bg-gray-200 h-3 border-2 border-gray-800 rounded-full mt-1 overflow-hidden">
                <div :class="hpColorClass(mon.hp, mon.maxHp)"
                     class="h-full"
                     :style="{ width: `${(mon.hp / mon.maxHp) * 100}%` }"></div>
              </div>
              <div class="text-[10px] font-bold mt-1 text-gray-600 uppercase">HP: {{ mon.hp }} / {{ mon.maxHp }}</div>
            </div>
          </div>
        </div>

        <!-- Progress Tab -->
        <div v-if="activeTab === 'progress'" class="flex flex-col gap-4">
          <h3 class="font-black uppercase text-gray-800">Unlocked Areas</h3>
          <div class="grid grid-cols-1 gap-2">
            <div v-for="i in GAME_CONSTANTS.MAX_AREAS" :key="i"
                 class="p-4 border-4 border-gray-800 rounded-xl font-bold flex justify-between items-center"
                 :class="playerStore.unlockedAreas.includes(i) ? 'bg-green-100' : 'bg-gray-200 text-gray-400'">
              <span>Route {{ i }}</span>
              <span v-if="playerStore.unlockedAreas.includes(i)" class="text-green-600 text-xl">✓</span>
              <span v-else class="text-xl">🔒</span>
            </div>
          </div>
          <div class="mt-4 p-4 bg-blue-50 border-4 border-blue-800 rounded-xl text-blue-800 text-xs font-bold uppercase leading-relaxed">
            Total Badges Earned: {{ playerStore.defeatedTrainers.length }}
          </div>
        </div>

        <!-- Settings Tab -->
        <div v-if="activeTab === 'settings'" class="flex flex-col gap-6">
          <!-- Audio Settings -->
          <div>
            <label class="font-black uppercase text-gray-800 block mb-2">Sound Settings</label>
            <div class="flex items-center gap-4 bg-white border-4 border-gray-800 p-4 rounded-xl shadow-inner">
              <button @click="toggleMute" class="text-3xl hover:scale-110 transition-transform">
                {{ settingsStore.isMuted ? '🔇' : '🔊' }}
              </button>
              <input type="range" min="0" max="1" step="0.01"
                     :value="settingsStore.volume"
                     @input="updateVolume"
                     class="flex-1 h-4 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500" />
            </div>
          </div>

          <div>
            <label class="font-black uppercase text-gray-800 block mb-2">TTS Voice Configuration</label>
            <select v-model="settingsStore.selectedVoiceName" @change="updateVoice"
                    class="w-full border-4 border-gray-800 p-3 rounded-xl bg-white font-bold text-gray-700 outline-none focus:ring-4 focus:ring-blue-300">
              <option v-for="voice in settingsStore.voices" :key="voice.name" :value="voice.name">
                {{ voice.name }} ({{ voice.lang }})
              </option>
            </select>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <button @click="testVoice" class="bg-blue-500 text-white p-3 rounded-xl border-b-4 border-blue-700 font-black uppercase tracking-wider active:translate-y-1 text-xs">
              Test Voice
            </button>
            <button @click="testSFX" class="bg-purple-500 text-white p-3 rounded-xl border-b-4 border-purple-700 font-black uppercase tracking-wider active:translate-y-1 text-xs">
              Test SFX
            </button>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="p-6 border-t-8 border-gray-800 bg-gray-100 flex justify-end">
        <button @click="$emit('close')" class="bg-red-500 text-white px-8 py-3 rounded-xl border-b-4 border-red-700 font-black uppercase tracking-widest hover:bg-red-600 active:translate-y-1">
          Back to Game
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { usePlayerStore } from '../stores/playerStore';
import { useSettingsStore } from '../stores/settingsStore';
import { speech } from '../utils/speech';
import { audio } from '../utils/audio';
import { GAME_CONSTANTS } from '../utils/constants';

const playerStore = usePlayerStore();
const settingsStore = useSettingsStore();
const activeTab = ref('party');

const updateVoice = (e) => {
  settingsStore.setVoice(e.target.value);
};

const updateVolume = (e) => {
  settingsStore.setVolume(parseFloat(e.target.value));
};

const toggleMute = () => {
  settingsStore.toggleMute();
  audio.playSound('click');
};

const testVoice = () => {
  speech.speak('This is a test of the spelling notification system.');
};

const testSFX = () => {
  audio.playSound('click');
};

const hpColorClass = (hp, max) => {
  const ratio = hp / max;
  if (ratio > 0.5) return 'bg-green-400';
  if (ratio > 0.2) return 'bg-yellow-400';
  return 'bg-red-400';
};
</script>
