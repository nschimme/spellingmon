<template>
  <div
    v-if="isTouchDevice"
    class="absolute bottom-6 right-6 flex flex-col items-center gap-2 pointer-events-auto"
    @mouseup="$emit('stop')"
    @mouseleave="$emit('stop')"
    @touchend="$emit('stop')"
    @touchcancel="$emit('stop')"
  >
    <div class="flex flex-col items-center gap-1">
      <button
        class="w-14 h-14 bg-black border-4 border-[#facc15] text-[#facc15] rounded-xl flex items-center justify-center text-2xl shadow-[0_0_20px_rgba(250,204,21,0.3)] active:scale-95 transition-all"
        @mousedown="$emit('start', 'w')"
        @touchstart.prevent="$emit('start', 'w')"
      >
        ▲
      </button>
      <div class="flex gap-1">
        <button
          class="w-14 h-14 bg-black border-4 border-[#facc15] text-[#facc15] rounded-xl flex items-center justify-center text-2xl shadow-[0_0_20px_rgba(250,204,21,0.3)] active:scale-95 transition-all"
          @mousedown="$emit('start', 'a')"
          @touchstart.prevent="$emit('start', 'a')"
        >
          ◀
        </button>
        <button
          class="w-14 h-14 bg-black border-4 border-[#facc15] text-[#facc15] rounded-xl flex items-center justify-center text-2xl shadow-[0_0_20px_rgba(250,204,21,0.3)] active:scale-95 transition-all"
          @mousedown="$emit('start', 's')"
          @touchstart.prevent="$emit('start', 's')"
        >
          ▼
        </button>
        <button
          class="w-14 h-14 bg-black border-4 border-[#facc15] text-[#facc15] rounded-xl flex items-center justify-center text-2xl shadow-[0_0_20px_rgba(250,204,21,0.3)] active:scale-95 transition-all"
          @mousedown="$emit('start', 'd')"
          @touchstart.prevent="$emit('start', 'd')"
        >
          ▶
        </button>
      </div>
    </div>
  </div>

  <button
    v-if="isTouchDevice"
    class="absolute top-6 right-6 w-14 h-14 bg-black border-4 border-[#facc15] rounded-xl flex items-center justify-center text-2xl shadow-[0_0_20px_rgba(250,204,21,0.3)] active:scale-95 transition-all z-50"
    @click="$emit('toggle-menu')"
  >
    🎒
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const isTouchDevice = computed(() => {
  if (typeof window === 'undefined') return false;
  return ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
});

defineEmits(['start', 'stop', 'toggle-menu']);
</script>
