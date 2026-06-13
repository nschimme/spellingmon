<template>
  <div class="w-full h-full flex flex-col items-center justify-center bg-blue-600 p-8 text-white font-['Press_Start_2P']">
    <div class="bg-white border-8 border-gray-800 p-8 rounded-[2rem] shadow-2xl max-w-lg w-full text-gray-800">
      <h2 class="text-xl font-black text-center mb-6 uppercase tracking-tighter text-blue-600">
        New Trainer
      </h2>

      <div class="space-y-6">
        <div>
          <label class="block text-[10px] font-bold mb-2 uppercase">What's your name?</label>
          <input v-model="name" type="text" maxlength="12"
                 class="w-full border-4 border-gray-800 p-3 rounded-xl bg-gray-50 font-bold outline-none focus:ring-4 focus:ring-blue-300"
                 placeholder="NAME">
        </div>

        <div>
          <label class="block text-[10px] font-bold mb-2 uppercase">Are you a boy or a girl?</label>
          <div class="flex gap-4">
            <button @click="gender = GENDERS.BOY"
                    :class="gender === GENDERS.BOY ? 'bg-blue-500 text-white border-blue-700' : 'bg-gray-100 text-gray-400 border-gray-300'"
                    class="flex-1 border-b-4 py-3 rounded-xl font-black uppercase text-xs transition-all active:translate-y-1">
              Boy
            </button>
            <button @click="gender = GENDERS.GIRL"
                    :class="gender === GENDERS.GIRL ? 'bg-pink-500 text-white border-pink-700' : 'bg-gray-100 text-gray-400 border-gray-300'"
                    class="flex-1 border-b-4 py-3 rounded-xl font-black uppercase text-xs transition-all active:translate-y-1">
              Girl
            </button>
          </div>
        </div>

        <div>
          <label class="block text-[10px] font-bold mb-2 uppercase">Skin Tone</label>
          <div class="flex justify-between gap-2">
            <button v-for="tone in skinTones" :key="tone.id"
                    @click="skinTone = tone.id"
                    :style="{ backgroundColor: tone.color }"
                    :class="skinTone === tone.id ? 'border-blue-500 scale-110' : 'border-gray-800'"
                    class="w-10 h-10 rounded-full border-4 transition-transform active:scale-95">
            </button>
          </div>
        </div>

        <button @click="handleConfirm"
                :disabled="!name"
                class="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white font-black py-4 rounded-xl border-b-4 border-green-800 disabled:border-gray-500 uppercase text-sm transition-all active:not-disabled:translate-y-1">
          Confirm
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { usePlayerStore } from '../stores/playerStore';
import { audio } from '../utils/audio';
import { SOUND_EFFECTS, GENDERS, SKIN_TONES } from '../utils/constants';

const playerStore = usePlayerStore();

const name = ref('');
const gender = ref(GENDERS.BOY);
const skinTone = ref(SKIN_TONES.NEUTRAL);

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
</script>
