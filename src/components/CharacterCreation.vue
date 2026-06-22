<template>
  <div class="w-full h-full flex flex-col items-center justify-center bg-blue-600 p-8 text-white">
    <div class="bg-white border-8 border-gray-800 p-8 rounded-[3rem] shadow-2xl max-w-lg w-full text-gray-800">
      <h2 class="text-xl font-black text-center mb-6 uppercase tracking-tighter text-blue-600">
        {{ $t('character.title') }}
      </h2>

      <div class="space-y-6">
        <div>
          <label class="block text-[10px] font-bold mb-2 uppercase">{{ $t('character.whatsYourName') }}</label>
          <input
            :ref="el => setItemRef(el, 0)"
            v-model="name"
            type="text"
            maxlength="12"
            :class="{ 'ring-8 ring-yellow-400': selectedIndex === 0 }"
            class="w-full border-4 border-gray-800 p-3 rounded-xl bg-gray-50 font-bold outline-none focus:ring-8 focus:ring-blue-300"
            :placeholder="$t('character.enterName')"
            autocomplete="off"
            autocorrect="off"
            autocapitalize="off"
            spellcheck="false"
            @focus="selectedIndex = 0"
          >
        </div>

        <div>
          <label class="block text-[10px] font-bold mb-2 uppercase">{{ $t('character.boyGirl') }}</label>
          <div class="flex gap-4">
            <button
              :ref="el => setItemRef(el, 1)"
              :class="[
                gender === GENDERS.BOY ? 'bg-blue-500 text-white border-blue-700' : 'bg-gray-100 text-gray-400 border-gray-300',
                selectedIndex === 1 ? 'ring-8 ring-yellow-400' : ''
              ]"
              class="flex-1 border-b-4 py-3 rounded-xl font-black uppercase text-xs transition-all active:translate-y-1 outline-none"
              @click="gender = GENDERS.BOY"
            >
              {{ $t('character.boy') }}
            </button>
            <button
              :ref="el => setItemRef(el, 2)"
              :class="[
                gender === GENDERS.GIRL ? 'bg-pink-500 text-white border-pink-700' : 'bg-gray-100 text-gray-400 border-gray-300',
                selectedIndex === 2 ? 'ring-8 ring-yellow-400' : ''
              ]"
              class="flex-1 border-b-4 py-3 rounded-xl font-black uppercase text-xs transition-all active:translate-y-1 outline-none"
              @click="gender = GENDERS.GIRL"
            >
              {{ $t('character.girl') }}
            </button>
          </div>
        </div>

        <div>
          <label class="block text-[10px] font-bold mb-2 uppercase">{{ $t('character.skinToneLabel') }}</label>
          <div class="flex justify-between gap-2">
            <button
              v-for="(tone, i) in skinTones"
              :key="tone.id"
              :ref="el => setItemRef(el, 3 + i)"
              :style="{ backgroundColor: tone.color }"
              :class="[
                skinTone === tone.id ? 'border-blue-500 scale-110' : 'border-gray-800',
                selectedIndex === (3 + i) ? 'ring-8 ring-yellow-400 border-yellow-400' : ''
              ]"
              class="w-10 h-10 rounded-full border-4 transition-transform active:scale-95 outline-none"
              @click="skinTone = tone.id"
            />
          </div>
        </div>

        <button
          :ref="el => setItemRef(el, 8)"
          :disabled="!name"
          :class="[
            selectedIndex === 8 ? 'ring-8 ring-yellow-400 border-yellow-400 scale-105' : '',
            !name ? 'bg-gray-300' : 'bg-green-500 hover:bg-green-600'
          ]"
          class="w-full text-white font-black py-6 rounded-2xl border-b-8 border-green-800 disabled:border-gray-500 uppercase text-lg tracking-widest transition-all active:not-disabled:translate-y-1 outline-none"
          @click="handleConfirm"
        >
          {{ $t('common.confirm') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, type ComponentPublicInstance } from 'vue';
import { useSessionStore } from '../stores/sessionStore';
import { useKeyboardNavigation } from '../composables/useKeyboardNavigation';
import { audio } from '../utils/audio';
import { SOUND_EFFECTS, GENDERS, SKIN_TONES } from '../utils/constants';

const session = useSessionStore();
const emit = defineEmits(['complete']);

const name = ref('');
const gender = ref(GENDERS.BOY);
const skinTone = ref(SKIN_TONES.NEUTRAL);
const nameInputRef = ref<HTMLInputElement | null>(null);
const itemRefs = ref<(HTMLElement | null)[]>([]);

const setItemRef = (el: Element | ComponentPublicInstance | null, index: number) => {
  if (el) itemRefs.value[index] = el as HTMLElement;
};

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
  session.setPlayerData({
    name: name.value,
    gender: gender.value,
    skinTone: skinTone.value
  });
  emit('complete');
};

// Spatial Map: 0: Name, 1: Boy, 2: Girl, 3-7: Skin Tones, 8: Confirm
const spatialMap = [
  { down: 1 }, // 0: Name
  { up: 0, down: 3, right: 2 }, // 1: Boy
  { up: 0, down: 3, left: 1 }, // 2: Girl
  { up: 1, down: 8, right: 4 }, // 3: Skin 1
  { up: 1, down: 8, left: 3, right: 5 }, // 4: Skin 2
  { up: 1, down: 8, left: 4, right: 6 }, // 5: Skin 3
  { up: 2, down: 8, left: 5, right: 7 }, // 6: Skin 4
  { up: 2, down: 8, left: 6 }, // 7: Skin 5
  { up: 5 } // 8: Confirm
];

const { selectedIndex } = useKeyboardNavigation({
  id: 'character-creation',
  maxIndex: 9,
  spatialMap,
  itemRefs,
  onConfirm: (idx) => {
    if (idx === 0) nameInputRef.value?.focus();
    else if (idx === 1) gender.value = GENDERS.BOY;
    else if (idx === 2) gender.value = GENDERS.GIRL;
    else if (idx >= 3 && idx <= 7) skinTone.value = skinTones[idx - 3].id;
    else if (idx === 8) handleConfirm();
  }
});

// Sync selectedIndex 0 with focusing the input
watch(selectedIndex, (newIdx, oldIdx) => {
  if (newIdx === 0) {
    const el = itemRefs.value[0];
    if (el instanceof HTMLInputElement) el.focus();
  } else if (oldIdx === 0) {
    const el = itemRefs.value[0];
    if (el instanceof HTMLInputElement) el.blur();
  }
}, { immediate: true });
</script>
