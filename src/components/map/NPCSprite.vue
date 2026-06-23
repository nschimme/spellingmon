<template>
  <div
    class="absolute w-10 h-10 flex items-center justify-center transition-all duration-200 pointer-events-auto cursor-pointer"
    :style="{
      left: `${x * 40}px`,
      top: `${y * 40}px`
    }"
    @click.stop="handleInteract"
  >
    <div class="text-2xl drop-shadow-md relative">
      <span>{{ emoji }}</span>
      <div
        v-if="showBubble"
        class="absolute -top-6 left-1/2 -translate-x-1/2 bg-white px-2 py-0.5 rounded-full border-2 border-gray-800 text-[8px] font-bold animate-bounce"
      >
        💬
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  type: string;
  x: number;
  y: number;
  showBubble?: boolean;
}>();

defineEmits(['interact']);

const handleInteract = () => {
  emit('interact');
};

const emoji = computed(() => {
  switch (props.type) {
    case 'mom': return '👩‍🍳';
    case 'healer': return '👩‍⚕️';
    case 'gym_boss': return '🏋️';
    case 'rival': return '🏃';
    default: return '👤';
  }
});
</script>
