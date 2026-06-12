<template>
  <div class="w-full h-full flex flex-col items-center justify-center bg-gray-900 p-8 relative overflow-hidden text-white font-['Press_Start_2P']">
    <div class="z-10 bg-white border-8 border-gray-800 p-8 rounded-[2rem] shadow-2xl max-w-lg w-full text-gray-800">
      <h2 class="text-2xl font-black text-center mb-6 uppercase tracking-tighter text-blue-600">
        Audio Check
      </h2>

      <p class="text-sm font-bold text-center mb-8 leading-relaxed">
        Spellingmon requires Text-to-Speech to play. Please test your audio below.
      </p>

      <div class="space-y-6">
        <button @click="testVoice"
                class="w-full bg-orange-500 hover:bg-orange-600 text-white font-black py-4 px-6 rounded-xl border-b-4 border-orange-800 text-lg uppercase transition-all active:border-b-0 active:translate-y-1">
          Test Voice
        </button>

        <div v-if="hasTested" class="space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
          <p class="text-xs font-bold text-center uppercase text-gray-500">
            Did you hear the voice?
          </p>
          <div class="flex gap-4">
            <button @click="$emit('verified')"
                    class="flex-1 bg-green-500 hover:bg-green-600 text-white font-black py-3 rounded-xl border-b-4 border-green-800 uppercase text-sm active:border-b-0 active:translate-y-1">
              Yes
            </button>
            <button @click="handleNo"
                    class="flex-1 bg-red-500 hover:bg-red-600 text-white font-black py-3 rounded-xl border-b-4 border-red-800 uppercase text-sm active:border-b-0 active:translate-y-1">
              No
            </button>
          </div>
        </div>

        <div v-if="showTroubleshooting" class="p-4 bg-gray-100 border-4 border-gray-300 rounded-xl space-y-2">
          <p class="text-[10px] font-bold text-red-600 uppercase">Troubleshooting:</p>
          <ul class="text-[9px] font-bold text-gray-600 list-disc list-inside space-y-1">
            <li>Check your system volume</li>
            <li>Ensure your browser allows site audio</li>
            <li>Try selecting a different voice in settings (once game starts)</li>
            <li v-if="isChrome">Chrome may need a moment to load voices.</li>
          </ul>
          <button @click="reinitSpeech" class="w-full mt-2 text-[10px] bg-gray-300 hover:bg-gray-400 p-2 rounded border-b-2 border-gray-500 uppercase font-black">
            Reload Voices
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { speech } from '../utils/speech';
import { useSettingsStore } from '../stores/settingsStore';

const emit = defineEmits(['verified']);
const settingsStore = useSettingsStore();

const hasTested = ref(false);
const showTroubleshooting = ref(false);
const isChrome = computed(() => /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor));

const testVoice = async () => {
  await speech.init(true); // Force re-init to ensure voices are loaded
  settingsStore.updateVoices();
  speech.speak('Welcome to Spellingmon. Can you hear me?');
  hasTested.value = true;
};

const handleNo = () => {
  showTroubleshooting.value = true;
};

const reinitSpeech = async () => {
  await speech.init(true);
  settingsStore.updateVoices();
  testVoice();
};

onMounted(async () => {
  await speech.init();
  settingsStore.updateVoices();
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
