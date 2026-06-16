<template>
  <div
    class="flex flex-col gap-6"
    role="form"
    :aria-label="$t('menu.settings')"
  >
    <!-- Language Selection -->
    <div :ref="el => { if (el) itemRefs[0] = el }">
      <label
        id="lang-label"
        class="font-black text-gray-600 block mb-2 text-xs uppercase"
      >{{ $t('settings.language') }}</label>
      <div class="relative">
        <select
          ref="languageSelect"
          :value="settingsStore.locale"
          :class="{ 'ring-8 ring-yellow-400 border-yellow-400': selectedIndex === 0 }"
          class="w-full border-4 border-gray-800 p-3 rounded-xl bg-white font-bold text-gray-700 outline-none"
          aria-labelledby="lang-label"
          @change="updateLocale"
        >
          <option
            v-for="lang in SUPPORTED_LANGUAGES"
            :key="lang.code"
            :value="lang.code"
            :disabled="!isLangSupported(lang.code)"
          >
            {{ lang.flag }} {{ lang.native }} ({{ lang.name }}) {{ !isLangSupported(lang.code) ? ` - ${$t('settings.unusable')}` : '' }}
          </option>
        </select>
      </div>
    </div>

    <!-- Audio Settings -->
    <div :ref="el => { if (el) itemRefs[1] = el }">
      <label
        id="volume-label"
        class="font-black text-gray-600 block mb-2 text-xs uppercase"
      >{{ $t('settings.volume') }}</label>
      <div
        :class="{ 'ring-8 ring-yellow-400 border-yellow-400': selectedIndex === 1 || selectedIndex === 2 }"
        class="flex items-center gap-4 bg-white border-4 border-gray-800 p-4 rounded-xl shadow-inner"
      >
        <button
          :ref="el => { if (el) itemRefs[2] = el }"
          :class="{ 'ring-8 ring-yellow-400 rounded-full': selectedIndex === 2 }"
          class="text-3xl hover:scale-110 transition-transform outline-none"
          :aria-label="settingsStore.isMuted ? $t('settings.unmuted') : $t('settings.muted')"
          :aria-pressed="settingsStore.isMuted"
          @click="toggleMute"
        >
          {{ settingsStore.isMuted ? '🔇' : '🔊' }}
        </button>
        <input
          ref="volumeInput"
          type="range"
          min="0"
          max="1"
          step="0.05"
          :value="settingsStore.volume"
          :class="{ 'ring-8 ring-yellow-400': selectedIndex === 1 }"
          class="flex-1 h-4 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500 outline-none"
          aria-labelledby="volume-label"
          :aria-valuetext="Math.round(settingsStore.volume * 100) + '%'"
          @input="updateVolume"
        >
      </div>
    </div>

    <div :ref="el => { if (el) itemRefs[3] = el }">
      <label
        id="voice-label"
        class="font-black text-gray-600 block mb-2 text-xs uppercase"
      >{{ $t('settings.voice') }}</label>
      <p
        v-if="settingsStore.voices.length === 0"
        class="text-[9px] text-amber-600 mb-1"
        role="alert"
      >
        {{ $t('settings.noVoices') }}
      </p>
      <select
        ref="voiceSelect"
        v-model="settingsStore.selectedVoiceName"
        :class="{ 'ring-8 ring-yellow-400 border-yellow-400': selectedIndex === 3 }"
        class="w-full border-4 border-gray-800 p-3 rounded-xl bg-white font-bold text-gray-700 outline-none"
        aria-labelledby="voice-label"
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
        :ref="el => { if (el) itemRefs[4] = el }"
        :class="{ 'ring-8 ring-yellow-400 border-yellow-400': selectedIndex === 4 }"
        class="bg-blue-500 text-white p-3 rounded-xl border-b-4 border-blue-700 font-black tracking-wider active:translate-y-1 text-xs uppercase outline-none"
        @click="testVoice"
      >
        {{ $t('tts.testVoice') }}
      </button>
      <button
        :ref="el => { if (el) itemRefs[5] = el }"
        :class="{ 'ring-8 ring-yellow-400 border-yellow-400': selectedIndex === 5 }"
        class="bg-purple-500 text-white p-3 rounded-xl border-b-4 border-purple-700 font-black tracking-wider active:translate-y-1 text-xs uppercase outline-none"
        @click="testSFX"
      >
        {{ $t('settings.testSFX') }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useSettingsStore } from '../../stores/settingsStore';
import { useKeyboardNavigation } from '../../composables/useKeyboardNavigation';
import { speech } from '../../utils/speech';
import { audio } from '../../utils/audio';
import { SOUND_EFFECTS, SUPPORTED_LANGUAGES } from '../../utils/constants';

const settingsStore = useSettingsStore();

const emit = defineEmits(['back']);
const itemRefs = ref([]);
const languageSelect = ref(null);
const voiceSelect = ref(null);
const volumeInput = ref(null);

const isLangSupported = (langCode) => speech.isLanguageSupported(langCode);

const cycleLocale = (direction) => {
  const currentIdx = SUPPORTED_LANGUAGES.findIndex(l => l.code === settingsStore.locale);
  let nextIdx = (currentIdx + direction + SUPPORTED_LANGUAGES.length) % SUPPORTED_LANGUAGES.length;

  // Skip unsupported
  while (!isLangSupported(SUPPORTED_LANGUAGES[nextIdx].code) && nextIdx !== currentIdx) {
    nextIdx = (nextIdx + direction + SUPPORTED_LANGUAGES.length) % SUPPORTED_LANGUAGES.length;
  }

  settingsStore.setLocale(SUPPORTED_LANGUAGES[nextIdx].code);
  audio.playSound(SOUND_EFFECTS.CLICK);
};

const cycleVoice = (direction) => {
  if (settingsStore.voices.length === 0) return;
  const currentIdx = settingsStore.voices.findIndex(v => v.name === settingsStore.selectedVoiceName);
  const nextIdx = (currentIdx + direction + settingsStore.voices.length) % settingsStore.voices.length;
  settingsStore.setVoice(settingsStore.voices[nextIdx].name);
  audio.playSound(SOUND_EFFECTS.CLICK);
};

const adjustVolume = (direction) => {
  const newVol = Math.max(0, Math.min(1, settingsStore.volume + (direction * 0.05)));
  settingsStore.setVolume(newVol);
  // Volume slider feedback
  audio.playSound(SOUND_EFFECTS.CLICK);
};

const { selectedIndex } = useKeyboardNavigation({
  id: 'menu-settings',
  maxIndex: 6,
  itemRefs,
  onConfirm: (idx) => {
    if (idx === 2) toggleMute();
    if (idx === 4) testVoice();
    if (idx === 5) testSFX();
  },
  onLeft: (idx) => {
    if (idx === 0) cycleLocale(-1);
    else if (idx === 1) adjustVolume(-1);
    else if (idx === 3) cycleVoice(-1);
  },
  onRight: (idx) => {
    if (idx === 0) cycleLocale(1);
    else if (idx === 1) adjustVolume(1);
    else if (idx === 3) cycleVoice(1);
  },
  onCancel: () => emit('back')
});

watch(selectedIndex, (newIdx) => {
  const el = itemRefs.value[newIdx];
  if (el) {
    el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }
});

const updateVoice = (e) => {
  settingsStore.setVoice(e.target.value);
};

const updateVolume = (e) => {
  settingsStore.setVolume(parseFloat(e.target.value));
};

const updateLocale = (e) => {
  settingsStore.setLocale(e.target.value);
  audio.playSound(SOUND_EFFECTS.CLICK);
};

const toggleMute = () => {
  const willBeMuted = !settingsStore.isMuted;
  settingsStore.toggleMute();
  if (!willBeMuted) {
    audio.playSound(SOUND_EFFECTS.CLICK);
  }
};

const { t } = useI18n();

const testVoice = () => {
  speech.refreshVoices(settingsStore.locale);
  speech.speak(t('tts.testPhrase'));
};

const testSFX = () => {
  audio.playSound(SOUND_EFFECTS.CLICK);
};
</script>
