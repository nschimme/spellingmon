<template>
  <div
    class="absolute w-10 h-10 flex items-center justify-center text-lg transition-all duration-200 linear z-10"
    :style="{ left: `${x * 40}px`, top: `${y * 40}px` }"
  >
    <span
      v-if="isAlerting"
      class="absolute -top-8 bg-white border-2 border-gray-800 rounded-full w-8 h-8 flex items-center justify-center text-red-600 font-black animate-bounce text-xl shadow-lg z-50"
    >!</span>
    {{ emoji }}
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps({
  x: { type: Number, required: true },
  y: { type: Number, required: true },
  direction: { type: String, default: 'down' },
  isStorm: { type: Boolean, default: false },
  isRival: { type: Boolean, default: false },
  isAlerting: { type: Boolean, default: false }
});

const emoji = computed(() => {
  if (props.isRival) {
    return '🏃';
  }
  if (props.isStorm) {
     return '🕴️'; // Mysterious suited person for Team Storm
  }
  switch (props.direction) {
    case 'up': return '🧒';
    case 'down': return '👦';
    case 'left': return '👧';
    case 'right': return '🧒';
    default: return '👤';
  }
});
</script>
