<template>
  <div class="w-full h-full flex flex-col items-center justify-center bg-gray-900 p-4 md:p-8 relative overflow-hidden text-white font-['Press_Start_2P']">
    <div class="z-10 bg-white border-8 border-gray-800 p-6 md:p-8 rounded-[2rem] shadow-2xl max-w-lg w-full text-gray-800 overflow-y-auto max-h-full">
      <h2 class="text-2xl font-black text-center mb-6 uppercase tracking-tighter text-blue-600">
        Audio Check
      </h2>

      <p class="text-sm font-bold text-center mb-8 leading-relaxed">
        Spellingmon requires Text-to-Speech to play. Please test your audio below.
      </p>

      <p
        v-if="!ttsSupported"
        class="text-[10px] text-red-600 text-center mb-3"
      >
        Text-to-Speech not supported in this browser/environment.
      </p>

      <div class="space-y-6">
        <button
          :disabled="isInitializing"
          :class="{ 'ring-8 ring-yellow-400': selectedIndex === 0 }"
          class="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-black py-4 px-6 rounded-xl border-b-4 border-orange-800 disabled:border-gray-600 text-lg uppercase transition-all active:not-disabled:border-b-0 active:not-disabled:translate-y-1"
          @click="testVoice"
        >
          {{ isInitializing ? 'Loading...' : 'Test Voice' }}
        </button>

        <div
          v-if="hasTested && !isInitializing"
          class="space-y-4 animate-in fade-in slide-in-from-top-4 duration-500"
        >
          <p
            v-if="speech.lastError"
            class="text-[10px] text-red-600 text-center"
          >
            Speak failed ({{ speech.lastError }}).
          </p>
          <p class="text-xs font-bold text-center uppercase text-gray-500">
            Did you hear the voice?
          </p>
          <div class="flex gap-4">
            <button
              :class="{ 'ring-8 ring-yellow-400': selectedIndex === 1 }"
              class="flex-1 bg-green-500 hover:bg-green-600 text-white font-black py-3 rounded-xl border-b-4 border-green-800 uppercase text-sm active:border-b-0 active:translate-y-1"
              @click="confirmSuccess"
            >
              Yes
            </button>
            <button
              :class="{ 'ring-8 ring-yellow-400': selectedIndex === 2 }"
              class="flex-1 bg-red-500 hover:bg-red-600 text-white font-black py-3 rounded-xl border-b-4 border-red-800 uppercase text-sm active:border-b-0 active:translate-y-1"
              @click="handleNo"
            >
              No
            </button>
          </div>
        </div>

        <div
          v-if="showTroubleshooting"
          class="p-4 bg-gray-100 border-4 border-gray-300 rounded-xl space-y-2"
        >
          <p class="text-[10px] font-bold text-red-600 uppercase">
            Troubleshooting:
          </p>
          <ul class="text-[9px] font-bold text-gray-600 list-disc list-inside space-y-1">
            <li>Check your system volume</li>
            <li>Ensure your browser allows site audio</li>
            <li>Try selecting a different voice in settings (once game starts)</li>
            <li v-if="isChrome">
              Chrome may need a moment to load voices.
            </li>
            <li>On Linux, ensure speech-dispatcher + a voice engine (e.g. espeak-ng) is installed</li>
          </ul>
          <button
            :disabled="isInitializing"
            class="w-full mt-2 text-[10px] bg-gray-300 hover:bg-gray-400 disabled:bg-gray-200 p-2 rounded border-b-2 border-gray-500 uppercase font-black"
            @click="reinitSpeech"
          >
            {{ isInitializing ? 'Reloading...' : 'Reload Voices' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { speech } from '../utils/speech';
import { audio } from '../utils/audio';
import { useSettingsStore } from '../stores/settingsStore';
import { useKeyboardNavigation } from '../composables/useKeyboardNavigation';
import { SOUND_EFFECTS, INPUT_PRIORITIES } from '../utils/constants';

const emit = defineEmits(['verified']);
const settingsStore = useSettingsStore();

const hasTested = ref(false);
const showTroubleshooting = ref(false);
const isInitializing = ref(false);

const isChrome = computed(() => {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;
  return /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
});

const ttsSupported = computed(() => speech.isSupported());

const ensureSpeechInitialized = async (force = false) => {
  if (force || !speech.isInitialized()) {
    isInitializing.value = true;
    try {
      await speech.init(force);
      settingsStore.updateVoices();
    } finally {
      isInitializing.value = false;
    }
  }
};

const testVoice = async () => {
  audio.playSound(SOUND_EFFECTS.CLICK);
  // Refresh + speak synchronously relative to the click to preserve user activation for TTS.
  // Full init (which may take time) runs in background.
  speech.refreshVoices();
  speech.speak('Welcome to Spellingmon. Can you hear me?');
  ensureSpeechInitialized();
  hasTested.value = true;
};

const handleNo = () => {
  audio.playSound(SOUND_EFFECTS.CLICK);
  showTroubleshooting.value = true;
};

const confirmSuccess = () => {
  audio.playSound(SOUND_EFFECTS.CLICK);
  emit('verified');
};

const { selectedIndex } = useKeyboardNavigation({
  id: 'tts-welcome',
  priority: INPUT_PRIORITIES.GLOBAL,
  maxIndex: computed(() => hasTested.value ? 3 : 1),
  onConfirm: (idx) => {
    if (idx === 0) testVoice();
    else if (idx === 1) confirmSuccess();
    else if (idx === 2) handleNo();
  }
});

const reinitSpeech = async () => {
  audio.playSound(SOUND_EFFECTS.CLICK);
  await ensureSpeechInitialized(true);
  speech.refreshVoices();
  speech.speak('Welcome to Spellingmon. Can you hear me?');
  hasTested.value = true;
};

onMounted(async () => {
  await ensureSpeechInitialized();
});
</script>

<style scoped>
.animate-in {
  animation: animate-in 0.5s ease-out;
}
@keyframes animate-in {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
