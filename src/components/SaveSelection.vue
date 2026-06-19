<template>
  <div class="w-full h-full flex flex-col items-center justify-center bg-blue-600 p-4 md:p-8 relative overflow-hidden">
    <!-- Animated background bubbles -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <div
        v-for="n in 10"
        :key="n"
        class="bubble"
        :style="bubbleStyle()"
      />
    </div>

    <div class="z-10 bg-white border-8 border-gray-800 p-6 md:p-8 rounded-[2rem] shadow-2xl max-w-4xl w-full text-gray-800 overflow-y-auto max-h-full">
      <h1 class="text-3xl md:text-4xl font-black text-center mb-2 uppercase tracking-tighter text-blue-600 drop-shadow-sm">
        {{ $t('landing.title') }}
      </h1>
      <h2 class="text-sm font-bold text-center mb-8 text-gray-500 uppercase tracking-widest">
        {{ $t('landing.selectAdventure') }}
      </h2>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div
          v-for="(slot, index) in slots"
          :key="index"
          :ref="el => setSlotRef(el, index)"
          class="relative border-4 p-6 rounded-3xl transition-all duration-300 flex flex-col items-center min-h-[300px] outline-none cursor-pointer"
          :class="{
            'ring-8 ring-yellow-400 border-blue-500 -translate-y-2 shadow-2xl': selectedIndex === index,
            'bg-gray-50 border-gray-200': !slot,
            'bg-white border-gray-800': slot
          }"
          @click="openSlotActions(index)"
        >
          <div
            v-if="slot && slot.player"
            class="w-full flex flex-col items-center h-full"
          >
            <div class="text-6xl mb-4 animate-bounce-slow">
              {{ slot.player.party?.[0]?.emoji || '👦' }}
            </div>
            <h3 class="text-xl font-black uppercase text-gray-800 mb-1">
              {{ slot.player.name }}
            </h3>
            <div class="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-[10px] font-black uppercase mb-4">
              {{ $t('menu.area', { n: slot.player.currentArea }) }}
            </div>

            <div class="w-full space-y-2 mt-auto">
              <div class="flex justify-between items-center text-[10px] font-black uppercase text-gray-400">
                <span>{{ $t('menu.party') }}</span>
                <span>{{ slot.player.party?.length || 0 }} / 6</span>
              </div>
              <div class="flex gap-1 justify-center">
                <span
                  v-for="mon in slot.player.party || []"
                  :key="mon.id"
                  class="text-lg"
                >
                  {{ mon.emoji }}
                </span>
              </div>
            </div>
          </div>

          <div
            v-else
            class="w-full h-full flex flex-col items-center justify-center"
          >
            <div class="text-6xl mb-6 opacity-20">
              ➕
            </div>
            <h3 class="text-xl font-black uppercase text-gray-300 mb-6">
              {{ $t('landing.newGameSlot') }}
            </h3>
          </div>

          <!-- Slot Label -->
          <div class="absolute -top-4 -left-4 bg-gray-800 text-white w-10 h-10 rounded-full flex items-center justify-center font-black border-4 border-white shadow-lg">
            {{ index + 1 }}
          </div>
        </div>
      </div>

      <div class="mt-12 text-center">
        <button
          ref="backButton"
          :class="{ 'ring-8 ring-yellow-400': selectedIndex === 3 }"
          class="text-xs font-bold text-gray-400 uppercase hover:text-gray-600 transition-colors outline-none"
          @click="$emit('back')"
        >
          &larr; {{ $t('landing.backToTitle') }}
        </button>
      </div>
    </div>

    <!-- Slot Action Dialog -->
    <div
      v-if="activeSlotIndex !== null"
      class="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <div class="bg-white border-8 border-gray-800 p-8 rounded-[2rem] max-w-sm w-full shadow-2xl text-center">
        <div class="text-6xl mb-4">
          {{ (activeSlotIndex !== null && slots[activeSlotIndex]?.player) ? (slots[activeSlotIndex]!.player.party?.[0]?.emoji || '👦') : '✨' }}
        </div>
        <h2 class="text-2xl font-black uppercase mb-6">
          {{ (activeSlotIndex !== null && slots[activeSlotIndex]?.player) ? slots[activeSlotIndex]!.player.name : $t('landing.newGameSlot') }}
        </h2>

        <div class="flex flex-col gap-4">
          <button
            :ref="el => setActionRef(el, 0)"
            :class="{ 'ring-8 ring-yellow-400 border-yellow-400': actionSelectedIndex === 0 }"
            class="w-full bg-blue-500 text-white py-4 rounded-xl font-black uppercase border-b-8 border-blue-800 active:translate-y-1 outline-none"
            @click="confirmAction"
          >
            {{ (activeSlotIndex !== null && slots[activeSlotIndex]) ? $t('landing.continueSlot') : $t('landing.startSlot') }}
          </button>

          <button
            v-if="activeSlotIndex !== null && slots[activeSlotIndex]?.player"
            :ref="el => setActionRef(el, 1)"
            :class="{ 'ring-8 ring-yellow-400 border-yellow-400': actionSelectedIndex === 1 }"
            class="w-full bg-red-100 text-red-500 py-3 rounded-xl font-black uppercase border-b-4 border-red-200 hover:bg-red-200 transition-colors outline-none"
            @click="confirmDelete"
          >
            {{ $t('landing.deleteSlot') }}
          </button>

          <button
            :ref="el => setActionRef(el, (activeSlotIndex !== null && slots[activeSlotIndex]?.player) ? 2 : 1)"
            :class="{ 'ring-8 ring-yellow-400 border-yellow-400': actionSelectedIndex === ((activeSlotIndex !== null && slots[activeSlotIndex]?.player) ? 2 : 1) }"
            class="w-full bg-gray-200 text-gray-800 py-3 rounded-xl font-black uppercase border-b-4 border-gray-400 active:translate-y-1 outline-none"
            @click="activeSlotIndex = null"
          >
            {{ $t('common.back') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Dialog -->
    <div
      v-if="isDeleting"
      class="fixed inset-0 z-[110] bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
    >
      <div class="bg-white border-8 border-gray-800 p-8 rounded-[2rem] max-w-sm w-full shadow-2xl text-center">
        <div class="text-6xl mb-4">
          ⚠️
        </div>
        <h2 class="text-2xl font-black uppercase mb-2">
          {{ $t('landing.deleteSaveConfirm') }}
        </h2>
        <p class="text-sm font-bold text-gray-500 mb-8">
          {{ $t('landing.deleteSaveWarning', { n: (activeSlotIndex !== null ? activeSlotIndex + 1 : 0) }) }}
        </p>
        <div class="flex gap-4">
          <button
            :ref="el => setDeleteRef(el, 0)"
            :class="{ 'ring-8 ring-yellow-400 border-yellow-400': deleteSelectedIndex === 0 }"
            class="flex-1 bg-gray-200 text-gray-800 py-3 rounded-xl font-black uppercase border-b-4 border-gray-400 active:translate-y-1 outline-none"
            @click="isDeleting = false"
          >
            {{ $t('common.cancel') }}
          </button>
          <button
            :ref="el => setDeleteRef(el, 1)"
            :class="{ 'ring-8 ring-yellow-400 border-yellow-400': deleteSelectedIndex === 1 }"
            class="flex-1 bg-red-600 text-white py-3 rounded-xl font-black uppercase border-b-4 border-red-800 active:translate-y-1 outline-none"
            @click="doDelete"
          >
            {{ $t('landing.deleteSlot') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, type ComponentPublicInstance } from 'vue';
import { useSessionStore, getSessionSnapshot } from '../stores/sessionStore';
import { storage } from '../utils/storage';
import { STORAGE_KEYS, SOUND_EFFECTS } from '../utils/constants';
import { audio } from '../utils/audio';
import { useKeyboardNavigation } from '../composables/useKeyboardNavigation';

const emit = defineEmits(['back', 'selected']);
const session = useSessionStore();
const slots = ref<(any | null)[]>([null, null, null]);
const activeSlotIndex = ref<number | null>(null);
const isDeleting = ref(false);

const slotRefs = ref<(HTMLElement | null)[]>([]);
const backButton = ref<HTMLElement | null>(null);
const actionRefs = ref<(HTMLElement | null)[]>([]);
const deleteRefs = ref<(HTMLElement | null)[]>([]);

const setSlotRef = (el: Element | ComponentPublicInstance | null, index: number) => {
  if (el) slotRefs.value[index] = el as HTMLElement;
};

const setActionRef = (el: Element | ComponentPublicInstance | null, index: number) => {
  if (el) actionRefs.value[index] = el as HTMLElement;
};

const setDeleteRef = (el: Element | ComponentPublicInstance | null, index: number) => {
  if (el) deleteRefs.value[index] = el as HTMLElement;
};

const loadSlots = () => {
  for (let i = 0; i < 3; i++) {
    const saved = storage.load(STORAGE_KEYS.SESSION, i);
    slots.value[i] = getSessionSnapshot(saved);
  }
};

const openSlotActions = (index: number) => {
  audio.playSound(SOUND_EFFECTS.CLICK);
  if (!slots.value[index] || !slots.value[index].player) {
    // If slot is empty or malformed, start immediately
    activeSlotIndex.value = index;
    confirmAction();
  } else {
    // If slot has data, show actions menu
    activeSlotIndex.value = index;
  }
};

const confirmAction = () => {
  if (activeSlotIndex.value === null) return;
  audio.playSound(SOUND_EFFECTS.CLICK);
  emit('selected', activeSlotIndex.value);
};

const confirmDelete = () => {
  audio.playSound(SOUND_EFFECTS.CLICK);
  isDeleting.value = true;
};

const doDelete = () => {
  if (activeSlotIndex.value === null) return;
  audio.playSound(SOUND_EFFECTS.CLICK);
  session.deleteSlot(activeSlotIndex.value);
  slots.value[activeSlotIndex.value] = null;
  isDeleting.value = false;
  activeSlotIndex.value = null;
};

const { selectedIndex } = useKeyboardNavigation({
  id: 'save-selection',
  isActive: computed(() => activeSlotIndex.value === null),
  maxIndex: 4,
  gridColumns: 3,
  itemRefs: computed(() => [...slotRefs.value, backButton.value]),
  onConfirm: (idx) => {
    if (idx < 3) openSlotActions(idx);
    else emit('back');
  },
  onCancel: () => emit('back')
});

const { selectedIndex: actionSelectedIndex } = useKeyboardNavigation({
  id: 'save-actions',
  isActive: computed(() => activeSlotIndex.value !== null && !isDeleting.value),
  maxIndex: computed(() => (activeSlotIndex.value !== null && slots.value[activeSlotIndex.value]?.player) ? 3 : 2),
  itemRefs: actionRefs,
  onConfirm: (idx) => {
    if (idx === 0) confirmAction();
    else if (idx === 1 && activeSlotIndex.value !== null && slots.value[activeSlotIndex.value]?.player) confirmDelete();
    else activeSlotIndex.value = null;
  },
  onCancel: () => { activeSlotIndex.value = null; }
});

const { selectedIndex: deleteSelectedIndex } = useKeyboardNavigation({
  id: 'save-delete-confirm',
  isActive: isDeleting,
  maxIndex: 2,
  gridColumns: 2,
  itemRefs: deleteRefs,
  onConfirm: (idx) => {
    if (idx === 1) doDelete();
    else isDeleting.value = false;
  },
  onCancel: () => { isDeleting.value = false; }
});

const bubbleStyle = () => {
  return {
    left: `${Math.random() * 100}%`,
    animationDelay: `${Math.random() * 5}s`,
    animationDuration: `${5 + Math.random() * 5}s`,
    width: `${20 + Math.random() * 40}px`,
    height: `${20 + Math.random() * 40}px`
  };
};

onMounted(() => {
  loadSlots();
});
</script>

<style scoped>
.bubble {
  position: absolute;
  bottom: -50px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  animation: float linear infinite;
}

@keyframes float {
  to {
    transform: translateY(-120vh);
  }
}

.animate-bounce-slow {
  animation: bounce-slow 3s ease-in-out infinite;
}

@keyframes bounce-slow {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}
</style>
