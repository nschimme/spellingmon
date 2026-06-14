<template>
  <div class="w-full h-full flex flex-col items-center justify-center bg-blue-600 p-8 text-white font-['Press_Start_2P']">
    <div class="bg-white border-8 border-gray-800 p-8 rounded-[2rem] shadow-2xl max-w-lg w-full text-gray-800">
      <h2 class="text-xl font-black text-center mb-6 uppercase tracking-tighter text-blue-600">
        New Trainer
      </h2>

      <div class="space-y-6">
        <div>
          <label class="block text-[10px] font-bold mb-2 uppercase">What's your name?</label>
          <input
            ref="nameInputRef"
            v-model="name"
            type="text"
            maxlength="12"
            :class="{ 'ring-4 ring-yellow-400': selectedIndex === 0 }"
            class="w-full border-4 border-gray-800 p-3 rounded-xl bg-gray-50 font-bold outline-none focus:ring-4 focus:ring-blue-300"
            placeholder="NAME"
          >
        </div>

        <div>
          <label class="block text-[10px] font-bold mb-2 uppercase">Are you a boy or a girl?</label>
          <div class="flex gap-4">
            <button
              :class="[
                gender === GENDERS.BOY ? 'bg-blue-500 text-white border-blue-700' : 'bg-gray-100 text-gray-400 border-gray-300',
                selectedIndex === 1 ? 'ring-4 ring-yellow-400' : ''
              ]"
              class="flex-1 border-b-4 py-3 rounded-xl font-black uppercase text-xs transition-all active:translate-y-1"
              @click="gender = GENDERS.BOY"
            >
              Boy
            </button>
            <button
              :class="[
                gender === GENDERS.GIRL ? 'bg-pink-500 text-white border-pink-700' : 'bg-gray-100 text-gray-400 border-gray-300',
                selectedIndex === 2 ? 'ring-4 ring-yellow-400' : ''
              ]"
              class="flex-1 border-b-4 py-3 rounded-xl font-black uppercase text-xs transition-all active:translate-y-1"
              @click="gender = GENDERS.GIRL"
            >
              Girl
            </button>
          </div>
        </div>

        <div>
          <label class="block text-[10px] font-bold mb-2 uppercase">Skin Tone</label>
          <div class="flex justify-between gap-2">
            <button
              v-for="(tone, i) in skinTones"
              :key="tone.id"
              :style="{ backgroundColor: tone.color }"
              :class="[
                skinTone === tone.id ? 'border-blue-500 scale-110' : 'border-gray-800',
                selectedIndex === (3 + i) ? 'ring-4 ring-yellow-400 border-yellow-400' : ''
              ]"
              class="w-10 h-10 rounded-full border-4 transition-transform active:scale-95"
              @click="skinTone = tone.id"
            />
          </div>
        </div>

        <button
          :disabled="!name"
          :class="[
            selectedIndex === 8 ? 'ring-4 ring-yellow-400' : '',
            !name ? 'bg-gray-300' : 'bg-green-500 hover:bg-green-600'
          ]"
          class="w-full text-white font-black py-4 rounded-xl border-b-4 border-green-800 disabled:border-gray-500 uppercase text-sm transition-all active:not-disabled:translate-y-1"
          @click="handleConfirm"
        >
          Confirm
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { usePlayerStore } from '../stores/playerStore';
import { useKeyboardNavigation } from '../composables/useKeyboardNavigation';
import { audio } from '../utils/audio';
import { SOUND_EFFECTS, GENDERS, SKIN_TONES, INPUT_PRIORITIES } from '../utils/constants';

const playerStore = usePlayerStore();

const name = ref('');
const gender = ref(GENDERS.BOY);
const skinTone = ref(SKIN_TONES.NEUTRAL);
const nameInputRef = ref(null);

const skinTones = [
  { id: SKIN_TONES.PALE, color: '#f9ebde' },
  { id: SKIN_TONES.FAIR, color: '#f3d9c1' },
  { id: SKIN_TONES.NEUTRAL, color: '#e4b590' },
  { id: SKIN_TONES.TAN, color: '#a6734c' },
  { id: SKIN_TONES.DARK, color: '#6b4226' },
];

const handleConfirm = () => {
  if (!name.value) return;
  audio.playSound(SOUND_EFFECTS.CLICK);
  playerStore.setPlayerData({
    name: name.value,
    gender: gender.value,
    skinTone: skinTone.value
  });
};

import { onMounted, onUnmounted } from 'vue';
import { useInputStore } from '../stores/inputStore';

const { selectedIndex } = useKeyboardNavigation({
  id: 'character-creation',
  priority: INPUT_PRIORITIES.GLOBAL,
  // 0: Name, 1: Boy, 2: Girl, 3-7: Skin Tones, 8: Confirm
  maxIndex: 9,
  onConfirm: (idx) => {
    if (idx === 0) nameInputRef.value?.focus();
    if (idx === 1) gender.value = GENDERS.BOY;
    if (idx === 2) gender.value = GENDERS.GIRL;
    if (idx >= 3 && idx <= 7) skinTone.value = skinTones[idx - 3].id;
    if (idx === 8) handleConfirm();
  }
});

// Custom navigation override
const inputStore = useInputStore();
const handleKeyDown = (e) => {
  let newIdx = selectedIndex.value;
  if (e.key === 'ArrowUp') {
    if (selectedIndex.value === 1 || selectedIndex.value === 2) newIdx = 0;
    else if (selectedIndex.value >= 3 && selectedIndex.value <= 7) newIdx = 1;
    else if (selectedIndex.value === 8) newIdx = 3;
  } else if (e.key === 'ArrowDown') {
    if (selectedIndex.value === 0) newIdx = 1;
    else if (selectedIndex.value === 1 || selectedIndex.value === 2) newIdx = 3;
    else if (selectedIndex.value >= 3 && selectedIndex.value <= 7) newIdx = 8;
  } else if (e.key === 'ArrowLeft') {
    if (selectedIndex.value === 2) newIdx = 1;
    else if (selectedIndex.value > 3 && selectedIndex.value <= 7) newIdx = selectedIndex.value - 1;
  } else if (e.key === 'ArrowRight') {
    if (selectedIndex.value === 1) newIdx = 2;
    else if (selectedIndex.value >= 3 && selectedIndex.value < 7) newIdx = selectedIndex.value + 1;
  } else {
    return false;
  }

  if (newIdx !== selectedIndex.value) {
    // If we are leaving the name input, blur it
    if (selectedIndex.value === 0) {
      nameInputRef.value?.blur();
    }
    selectedIndex.value = newIdx;
    audio.playSound(SOUND_EFFECTS.CLICK);
    return true;
  }
  return false;
};

onMounted(() => {
  inputStore.addListener('character-creation-custom', handleKeyDown, INPUT_PRIORITIES.GLOBAL + 1);
});
onUnmounted(() => {
  inputStore.removeListener('character-creation-custom');
});
</script>
