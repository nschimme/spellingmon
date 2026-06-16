<template>
  <div class="w-full h-full flex flex-col items-center justify-center bg-gray-900 p-4 md:p-8 relative overflow-hidden text-white font-['Press_Start_2P']">
    <div class="z-10 bg-white border-8 border-gray-800 p-6 md:p-8 rounded-[2rem] shadow-2xl max-w-2xl w-full text-gray-800 overflow-y-auto max-h-full">
      <!-- Phase 1: Language Selection -->
      <template v-if="phase === 'language'">
        <h2 class="text-xl md:text-2xl font-black text-center mb-6 uppercase tracking-tighter text-blue-600">
          {{ $t('tts.selectLanguage') }}
        </h2>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <button
            v-for="(lang, index) in SUPPORTED_LANGUAGES"
            :key="lang.code"
            :ref="el => { if (el) langRefs[index] = el }"
            :class="{
              'ring-8 ring-yellow-400': selectedIndex === index,
              'opacity-50 grayscale cursor-not-allowed': !isLangSupported(lang.code),
              'bg-blue-500 hover:bg-blue-600': isLangSupported(lang.code)
            }"
            class="flex items-center gap-4 p-4 rounded-xl border-b-4 border-blue-800 text-white transition-all outline-none"
            @click="selectLanguage(lang)"
            @mouseenter="onHoverLang(index)"
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
            <div
              v-if="!isLangSupported(lang.code)"
              class="ml-auto text-[8px] font-bold text-red-200"
            >
              {{ $t('settings.unusable') }}
            </div>
          </button>
        </div>
      </template>

      <!-- Phase 2: Audio Check -->
      <template v-else>
        <h2 class="text-2xl font-black text-center mb-6 uppercase tracking-tighter text-blue-600">
          {{ $t('tts.title') }}
        </h2>

        <p class="text-sm font-bold text-center mb-8 leading-relaxed">
          {{ $t('tts.description') }}
        </p>

        <div class="space-y-6">
          <button
            ref="testButton"
            :disabled="isInitializing"
            :class="{ 'ring-8 ring-yellow-400': checkSelectedIndex === 0 }"
            class="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-black py-4 px-6 rounded-xl border-b-4 border-orange-800 disabled:border-gray-600 text-lg uppercase transition-all active:not-disabled:border-b-0 active:not-disabled:translate-y-1 outline-none"
            @click="testVoice"
          >
            {{ isInitializing ? $t('common.loading') : $t('tts.testVoice') }}
          </button>

          <div
            v-if="hasTested && !isInitializing"
            class="space-y-4 animate-in fade-in slide-in-from-top-4 duration-500"
          >
            <p
              v-if="speech.lastError"
              class="text-[10px] text-red-600 text-center"
            >
              {{ $t('tts.speakFailed', { error: speech.lastError }) }}
            </p>
            <p class="text-xs font-bold text-center uppercase text-gray-500">
              {{ $t('tts.didYouHear') }}
            </p>
            <div class="flex gap-4">
              <button
                :ref="el => { if (el) checkRefs[1] = el }"
                :class="{ 'ring-8 ring-yellow-400': checkSelectedIndex === 1 }"
                class="flex-1 bg-green-500 hover:bg-green-600 text-white font-black py-3 rounded-xl border-b-4 border-green-800 uppercase text-sm active:border-b-0 active:translate-y-1 outline-none"
                @click="confirmSuccess"
              >
                {{ $t('common.yes') }}
              </button>
              <button
                :ref="el => { if (el) checkRefs[2] = el }"
                :class="{ 'ring-8 ring-yellow-400': checkSelectedIndex === 2 }"
                class="flex-1 bg-red-500 hover:bg-red-600 text-white font-black py-3 rounded-xl border-b-4 border-red-800 uppercase text-sm active:border-b-0 active:translate-y-1 outline-none"
                @click="handleNo"
              >
                {{ $t('common.no') }}
              </button>
            </div>
          </div>

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
              <li>{{ $t('tts.differentVoice') }}</li>
              <li v-if="isChrome">
                {{ $t('tts.chromeNote') }}
              </li>
              <li>{{ $t('tts.linuxNote') }}</li>
            </ul>
            <button
              :disabled="isInitializing"
              class="w-full mt-2 text-[10px] bg-gray-300 hover:bg-gray-400 disabled:bg-gray-200 p-2 rounded border-b-2 border-gray-500 uppercase font-black"
              @click="reinitSpeech"
            >
              {{ isInitializing ? $t('common.loading') : $t('tts.reloadVoices') }}
            </button>
          </div>

          <button
            class="w-full text-[10px] uppercase font-bold text-gray-400 hover:text-gray-600"
            @click="phase = 'language'"
          >
            &larr; {{ $t('common.back') }}
          </button>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { speech } from '../utils/speech';
import { audio } from '../utils/audio';
import { useSettingsStore } from '../stores/settingsStore';
import { useKeyboardNavigation } from '../composables/useKeyboardNavigation';
import { SOUND_EFFECTS, SUPPORTED_LANGUAGES } from '../utils/constants';

const emit = defineEmits(['verified']);
const { t } = useI18n();
const settingsStore = useSettingsStore();

const phase = ref('language'); // 'language' or 'audio-check'
const hasTested = ref(false);
const showTroubleshooting = ref(false);
const isInitializing = ref(false);

const langRefs = ref([]);
const testButton = ref(null);
const checkRefs = ref([]);

const isChrome = computed(() => {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;
  return /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
});

const isLangSupported = (langCode) => speech.isLanguageSupported(langCode);

const selectLanguage = async (lang) => {
  if (!isLangSupported(lang.code)) return;
  audio.playSound(SOUND_EFFECTS.CLICK);
  await settingsStore.setLocale(lang.code);
  phase.value = 'audio-check';
  hasTested.value = true;

  // Immediately trigger test voice
  setTimeout(() => {
    testVoice();
  }, 300);
};

const onHoverLang = (index) => {
  if (selectedIndex.value !== index) {
    selectedIndex.value = index;
  }
};

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
  speech.refreshVoices(settingsStore.locale);
  speech.speak(t('tts.testPhrase'));
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
  id: 'language-selection',
  isActive: computed(() => phase.value === 'language'),
  maxIndex: SUPPORTED_LANGUAGES.length,
  gridColumns: 2,
  itemRefs: langRefs,
  onConfirm: (idx) => {
    const lang = SUPPORTED_LANGUAGES[idx];
    if (isLangSupported(lang.code)) {
      selectLanguage(lang);
    }
  }
});

// Speak on navigation
watch(selectedIndex, (newIdx) => {
  if (phase.value === 'language') {
    const lang = SUPPORTED_LANGUAGES[newIdx];
    if (lang && isLangSupported(lang.code)) {
      speech.speak(lang.native, lang.code);
    }
  }
});

const checkItemRefs = computed(() => {
  const refs = [testButton.value];
  if (hasTested.value) {
    refs[1] = checkRefs.value[1];
    refs[2] = checkRefs.value[2];
  }
  return refs;
});

const { selectedIndex: checkSelectedIndex } = useKeyboardNavigation({
  id: 'tts-welcome',
  isActive: computed(() => phase.value === 'audio-check'),
  maxIndex: computed(() => hasTested.value ? 3 : 1),
  itemRefs: checkItemRefs,
  onConfirm: (idx) => {
    if (idx === 0) testVoice();
    else if (idx === 1) confirmSuccess();
    else if (idx === 2) handleNo();
  }
});

const reinitSpeech = async () => {
  audio.playSound(SOUND_EFFECTS.CLICK);
  await ensureSpeechInitialized(true);
  speech.refreshVoices(settingsStore.locale);
  testVoice();
};

onMounted(async () => {
  await ensureSpeechInitialized();

  // Set initial selection based on detected/stored locale
  const initialIndex = SUPPORTED_LANGUAGES.findIndex(l => l.code === settingsStore.locale);
  if (initialIndex !== -1) {
    selectedIndex.value = initialIndex;

    // Briefly wait to ensure voices are ready before announcing the default
    setTimeout(() => {
      if (phase.value === 'language') {
        speech.speak(SUPPORTED_LANGUAGES[initialIndex].native, SUPPORTED_LANGUAGES[initialIndex].code);
      }
    }, 500);
  }
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
