<template>
  <div class="flex flex-col gap-6">
    <!-- Language Selection -->
    <div :ref="el => { if (el) itemRefs[5] = el }">
      <label class="font-black uppercase text-gray-600 block mb-2 text-xs">{{ $t('settings.language') }}</label>
      <div class="relative">
        <select
          :value="settingsStore.locale"
          :class="{ 'ring-8 ring-yellow-400 border-yellow-400': selectedIndex === 5 }"
          class="w-full border-4 border-gray-800 p-3 rounded-xl bg-white font-bold text-gray-700 outline-none"
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
      <label class="font-black uppercase text-gray-600 block mb-2 text-xs">{{ $t('settings.volume') }}</label>
      <div
        :class="{ 'ring-8 ring-yellow-400 border-yellow-400': selectedIndex === 1 || selectedIndex === 2 }"
        class="flex items-center gap-4 bg-white border-4 border-gray-800 p-4 rounded-xl shadow-inner"
      >
        <button
          :class="{ 'ring-8 ring-yellow-400 rounded-full': selectedIndex === 2 }"
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
          :class="{ 'ring-8 ring-yellow-400': selectedIndex === 1 }"
          class="flex-1 h-4 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
          @input="updateVolume"
        >
      </div>
    </div>

    <div :ref="el => { if (el) itemRefs[0] = el }">
      <label class="font-black uppercase text-gray-600 block mb-2 text-xs">{{ $t('settings.voice') }}</label>
      <p
        v-if="settingsStore.voices.length === 0"
        class="text-[9px] text-amber-600 mb-1"
      >
        {{ $t('settings.noVoices') }}
      </p>
      <select
        v-model="settingsStore.selectedVoiceName"
        :class="{ 'ring-8 ring-yellow-400 border-yellow-400': selectedIndex === 0 }"
        class="w-full border-4 border-gray-800 p-3 rounded-xl bg-white font-bold text-gray-700 outline-none"
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
        :ref="el => { if (el) itemRefs[3] = el }"
        :class="{ 'ring-8 ring-yellow-400 border-yellow-400': selectedIndex === 3 }"
        class="bg-blue-500 text-white p-3 rounded-xl border-b-4 border-blue-700 font-black uppercase tracking-wider active:translate-y-1 text-xs"
        @click="testVoice"
      >
        {{ $t('tts.testVoice') }}
      </button>
      <button
        :ref="el => { if (el) itemRefs[4] = el }"
        :class="{ 'ring-8 ring-yellow-400 border-yellow-400': selectedIndex === 4 }"
        class="bg-purple-500 text-white p-3 rounded-xl border-b-4 border-purple-700 font-black uppercase tracking-wider active:translate-y-1 text-xs"
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
import { SOUND_EFFECTS, INPUT_PRIORITIES, SUPPORTED_LANGUAGES } from '../../utils/constants';

const settingsStore = useSettingsStore();

const emit = defineEmits(['back']);
const itemRefs = ref([]);

const isLangSupported = (langCode) => speech.isLanguageSupported(langCode);

const { selectedIndex } = useKeyboardNavigation({
  id: 'menu-settings',
  priority: INPUT_PRIORITIES.MENU + 10,
  maxIndex: 6,
  onConfirm: (idx) => {
    if (idx === 2) toggleMute();
    if (idx === 3) testVoice();
    if (idx === 4) testSFX();
  },
  onCancel: () => emit('back')
});

watch(selectedIndex, (newIdx) => {
  const el = itemRefs.value[newIdx] || itemRefs.value[1]; // Fallback
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
