<template>

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
