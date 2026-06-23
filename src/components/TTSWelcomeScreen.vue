<template>
  <div class="w-full h-full flex flex-col items-center justify-center bg-gray-900 p-4 md:p-8 relative overflow-hidden text-white font-['Press_Start_2P']">
    <div class="z-10 bg-white border-8 border-gray-800 p-6 md:p-8 rounded-[2rem] shadow-2xl max-w-2xl w-full text-gray-800 overflow-y-auto max-h-full">
      <!-- Phase 1: Language Selection -->
      <template v-if="fsm.matches(GAME_STATES.LANGUAGE_SELECT)">
        <h2 class="text-xl md:text-2xl font-black text-center mb-6 uppercase tracking-tighter text-blue-600">
          {{ $t('tts.selectLanguage') }}
        </h2>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <button
            v-for="(lang, index) in SUPPORTED_LANGUAGES"
            :key="lang.code"
            :class="{
              'ring-8 ring-yellow-400': selectedIndex === index,
              'bg-blue-500 hover:bg-blue-600': true
            }"
            class="flex items-center gap-4 p-4 rounded-xl border-b-4 border-blue-800 text-white transition-all outline-none"
            @click="selectLanguage(lang)"
          >
            <span class="text-3xl">{{ lang.flag }}</span>
            <div class="text-left">
              <div class="text-xs font-black uppercase">
                {{ lang.native }}
              </div>
              <div class="text-[8px] opacity-80">
                {{ lang.name }}
              </div>
            </div>
          </button>
        </div>
      </template>

      <!-- Phase 2: Audio Check -->
      <template v-else-if="fsm.matches(GAME_STATES.TTS_CHECK)">
        <h2 class="text-2xl font-black text-center mb-6 uppercase tracking-tighter text-blue-600">
          {{ $t('tts.title') }}
        </h2>
        <p class="text-sm font-bold text-center mb-8 leading-relaxed">
          {{ $t('tts.description') }}
        </p>

        <div class="space-y-6">
          <div class="flex gap-4">
            <button
              :ref="el => setItemRef(el, 0)"
              :class="{ 'ring-8 ring-yellow-400': selectedIndex === 0 }"
              class="flex-1 bg-green-500 text-white font-black py-3 rounded-xl border-b-4 border-green-800 uppercase outline-none transition-all"
              @click="fsm.send(GAME_EVENTS.CONFIRM)"
            >
              {{ $t('common.yes') }}
            </button>
            <button
              :ref="el => setItemRef(el, 1)"
              :class="{ 'ring-8 ring-yellow-400': selectedIndex === 1 }"
              class="flex-1 bg-red-500 text-white font-black py-3 rounded-xl border-b-4 border-red-800 uppercase outline-none transition-all"
              @click="handleNo"
            >
              {{ $t('common.no') }}
            </button>
          </div>

          <button
            :ref="el => setItemRef(el, 2)"
            :class="{ 'ring-8 ring-yellow-400': selectedIndex === 2 }"
            class="w-full bg-orange-500 text-white font-black py-4 rounded-xl border-b-4 border-orange-800 uppercase outline-none transition-all"
            @click="testVoice"
          >
            {{ $t('tts.testVoice') }}
          </button>

          <div
            v-if="showTroubleshooting"
            class="p-4 bg-gray-100 border-4 border-gray-300 rounded-xl space-y-2"
          >
            <p class="text-[10px] font-bold text-red-600 uppercase">
              {{ $t('tts.troubleshooting') }}
            </p>
            <ul class="text-[9px] font-bold text-gray-600 list-disc list-inside space-y-1">
              <li>{{ $t('tts.checkVolume') }}</li>
              <li>{{ $t('tts.allowAudio') }}</li>
            </ul>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onUnmounted } from 'vue';
import { useGameFSM } from '../stores/gameFSM';
import { useSettingsStore } from '../stores/settingsStore';
import { speech } from '../utils/speech';
import { audio } from '../utils/audio';
import { SOUND_EFFECTS, SUPPORTED_LANGUAGES, GAME_STATES, GAME_EVENTS } from '../utils/constants';
import { useKeyboardNavigation } from '../composables/useKeyboardNavigation';

const fsm = useGameFSM();
const settingsStore = useSettingsStore();
const showTroubleshooting = ref(false);
const itemRefs = ref<(HTMLElement | null)[]>([]);

const setItemRef = (el: any, index: number) => {
  if (el) itemRefs.value[index] = el;
};

const selectLanguage = (lang: any) => {
  audio.playSound(SOUND_EFFECTS.CLICK);
  fsm.send(GAME_EVENTS.SELECT_LANG, { locale: lang.code });
};

const testVoice = () => {
  audio.playSound(SOUND_EFFECTS.CLICK);
  speech.speak(settingsStore.t('tts.testPhrase'), settingsStore.locale);
};

const handleNo = () => {
  audio.playSound(SOUND_EFFECTS.CLICK);
  showTroubleshooting.value = true;
};

const updateIsMobile = () => {
  isMobile.value = window.innerWidth < 640;
};
const isMobile = ref(window.innerWidth < 640);
window.addEventListener('resize', updateIsMobile);

onUnmounted(() => {
  window.removeEventListener('resize', updateIsMobile);
});

const { selectedIndex, reset } = useKeyboardNavigation({
  id: 'tts-welcome',
  maxIndex: computed(() => fsm.matches(GAME_STATES.LANGUAGE_SELECT) ? SUPPORTED_LANGUAGES.length : 3),
  gridColumns: computed(() => {
    if (isMobile.value) return 1;
    return fsm.matches(GAME_STATES.LANGUAGE_SELECT) ? 2 : 2;
  }),
  itemRefs,
  onConfirm: (idx) => {
    if (fsm.matches(GAME_STATES.LANGUAGE_SELECT)) {
      selectLanguage(SUPPORTED_LANGUAGES[idx]);
    } else {
      if (idx === 0) fsm.send(GAME_EVENTS.CONFIRM);
      else if (idx === 1) handleNo();
      else if (idx === 2) testVoice();
    }
  },
  onCancel: () => {
    if (fsm.matches(GAME_STATES.TTS_CHECK)) {
      fsm.send(GAME_EVENTS.BACK);
      reset(0);
    }
  },
  spatialMap: computed(() => {
    if (fsm.matches(GAME_STATES.TTS_CHECK)) {
      return [
        { right: 1, down: 2 }, // Yes
        { left: 0, down: 2 },  // No
        { up: 0 }             // Test Voice
      ];
    }
    return null;
  })
});

// Set default focus to "No" (index 1) when entering TTS_CHECK
watch(() => fsm.state as any, (newState, oldState) => {
  if (newState === GAME_STATES.TTS_CHECK && oldState === GAME_STATES.LANGUAGE_SELECT) {
    reset(1);
  } else if (newState === GAME_STATES.LANGUAGE_SELECT) {
    reset(0);
  }
});

watch(selectedIndex, (newIdx) => {
  if (fsm.matches(GAME_STATES.LANGUAGE_SELECT)) {
    const lang = SUPPORTED_LANGUAGES[newIdx];
    if (lang) {
      speech.stop();
      // Speak the language name in its native tongue using the correct voice
      speech.speak(lang.native, lang.code);
    }
  }
});
</script>
